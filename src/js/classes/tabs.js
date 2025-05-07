
class Tabs {
	constructor(parent, spawn) {
		this._parent = parent;
		this._spawn = spawn;
		this._stack = {};
		this._active = null;

		this._target = this._spawn.find("content > div");
	}

	purgeBody() {
		this._target.html("");
	}

	add(opt) {
		let isObj = typeof opt === "object",
			cwd = isObj ? opt.path : opt || window.settings.getItem("finder-default-path"),
			view = isObj ? opt.view : window.settings.getItem("finder-file-view"),
			name = window.path.dirname(cwd),
			tId = "f"+ Date.now(),
			el = this._spawn.tabs.add(name, tId),
			history = new window.History,
			state = { cwd, view };

		if (isObj) {
			if (opt.kind) state.kind = opt.kind;
			if (opt.columns) state.columns = opt.columns;
		}
		if (state.view === "columns") {
			state.columns = this._target.find(".column_").map(e => "/fs"+ e.getAttribute("data-path"));
			if (!state.columns.length) state.columns = opt.columns || [state.cwd];
		}
		// push state to history
		history.push(state);
		// save reference to tab
		this._stack[tId] = { tId, el, history };
		this.focus(tId);
	}

	merge(ref) {
		let tId = ref.tId,
			cwd = ref.history.current.cwd,
			name = window.path.dirname(cwd),
			el = this._spawn.tabs.add(name, tId, true),
			history = ref.history;
		this._stack[tId] = { el, history };
	}

	remove(tId) {
		this._stack[tId] = false;
		delete this._stack[tId];
	}

	focus(tId) {
		// reference to active tab
		this._active = this._stack[tId];
		// render view
		this.setViewState(true);
	}

	get length() {
		return Object.keys(this._stack).length;
	}

	get history() {
		return this._active.history;
	}

	historyPush(state) {
		if (state.view === "columns" && this._target.hasClass("view-columns_")) {
			let cols = this._target.find(".column_").map(e => "/fs"+ e.getAttribute("data-path"));
			state.columns = cols || [state.cwd];
		}
		this._active.history.push(state);
		// render view
		this.setViewState(state.render);
	}

	historyGo(step) {
		if (step === "-1") this._active.history.goBack();
		else this._active.history.goForward();
		// render view
		this.setViewState(true);
		// console.log( this._active.history.current );
	}

	reRender(view) {
		// render content
		window.render({
			template: "sys:fs-fileView",
			target: view.parents(".fs-root_").parent(),
			path: view.data("path"),
		});
	}

	setViewState(render) {
		let target = this._target,
			history = this._active.history,
			state = history.current,
			path = state.cwd,
			firstPath = state.columns && state.columns[0] ? state.columns[0] : path,
			name = window.path.dirname(path);
		// fixes ~
		if (firstPath && firstPath.startsWith("~/")) {
			firstPath = `/fs/${firstPath.slice(2)}`;
		}
		// update tab title
		this._active.el.find("span").html(name);
		// update window title
		this._spawn.title = name;
		// update sidebar "active"
		this._spawn.find(`sidebar .sidebar-active_`).removeClass("sidebar-active_");
		this._spawn.find(`sidebar li[data-path="${firstPath}"]`).addClass("sidebar-active_");
		// toolbar UI update
		this._spawn.find(`[data-click="history-go"][data-arg="-1"]`).toggleClass("tool-disabled_", history.canGoBack);
		this._spawn.find(`[data-click="history-go"][data-arg="1"]`).toggleClass("tool-disabled_", history.canGoForward);

		// update toolbar
		let tool = this._spawn.find(`[data-arg='${state.view}']`);
		tool.parent().find(".tool-active_").removeClass("tool-active_");
		tool.addClass("tool-active_");

		if (!state.kind) {
			// set path as default path
			// window.settings.setItem("finder-default-path", state.cwd);
		}

		if (render) {
			if (state.view === "columns") {
				// remove redundant columns
				target.find(`.column_`).map(el => {
					if (state.columns && !state.columns.includes(el.getAttribute("data-path"))) el.parentNode.removeChild(el);
				});
				// empty contents if not already columns-view
				if (!target.hasClass("fs-columns_")) target.html("");
				// add rool element for columns, if missing
				if (!target.find(".fs-root_").length) {
					target.append(`<div class="fs-root_"></div>`);
				}
				let cols = state.columns && state.columns.length ? state.columns : [state.cwd];
				if (cols.length === 1 && cols[0] !== state.cwd) cols[0] = state.cwd;
				// render missing columns
				cols.map(path => {
					let column = this._spawn.find(`content > div .column_[data-path="${path}"]`),
						name = path.slice(path.lastIndexOf("/") + 1),
						append = this._spawn.find("content > div .fs-root_"),
						left;
					if (!column.length) {
						column = window.render({
							path,
							append: append.length ? append : target,
							template: "sys:fs-fileView",
						});
						// calculate left
						left = column.prop("offsetLeft") + column.prop("offsetWidth") - target.prop("offsetWidth");
						target.prop({"scrollLeft": left});

						column = column.prev(".column_");
						if (column.length) {
							column.find(`.file-name_:contains("${name}")`).parent().addClass("file-active_");
						}
					}
				});
			} else {
				// render content
				window.render({ template: "sys:fs-fileView", target, path });
			}
		}
		// clean up
		if (state.kind === "_dir") delete state.kind;
		// update status-bar
		this.updateStatusbar(state, target);
		// show status-bar slider only for icons view
		this._spawn.statusBar.find(".icon-resizer").parent().toggleClass("show-range_", state.view !== "icons");
		// this._spawn.statusBar.find(".icon-resizer").css({display: state.view === "icons" ? "block" : "none"});
	}

	updateStatusbar(state, _target) {
		let target = _target || this._target,
			cEl = target.hasClass("fs-columns_") ? target.find(".column_:last") : target.find(".fs-root_"),
			len = cEl.find(".ant-file_").length,
			str = `${len} items, ${disk.avail} available`;
		if (state.kind) {
			cEl = target.find(".column_:nth-last-child(2)");
			len = cEl.find(".ant-file_").length;
			let selected = state.kind === "_dir" ? cEl.find(".ant-file_.file-active").length : 1;
			str = `${selected} of ${len} selected, ${disk.avail} available`;
		}
		this._spawn.statusBar.find(".content_").text(str);
	}
}
