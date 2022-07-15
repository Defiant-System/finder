
class Tabs {
	constructor(parent, spawn) {
		this._parent = parent;
		this._spawn = spawn;
		this._stack = {};
		this._active = null;
	}

	add(p) {
		let path = p || window.settings.getItem("finder-default-path"),
			name = window.path.dirname(path),
			tId = "finder-"+ Date.now(),
			el = this._spawn.tabs.add(name, tId),
			history = new window.History;

		this._stack[tId] = { el, history };
		if (this.length > 1) {
			this._spawn.find("content > div").html("");
			// render path
			this._parent.dispatch({
				type: "fs-view-render",
				spawn: this._spawn,
				render: true,
				path,
			});
		}
		this.focus(tId);
	}

	get length() {
		return Object.keys(this._stack).length;
	}

	remove() {
		this._stack[tId] = false;
		delete this._stack[tId];
	}

	focus(tId) {
		// reference to active tab
		this._active = this._stack[tId];
		console.log("render stuff");
	}

	get history() {
		return this._active.history;
	}

	historyPush(state) {
		this._active.history.push(state);
	}

	historyGo(step) {
		if (step === "-1") this._active.history.goBack();
		else this._active.history.goForward();
	}

	setViewState(render) {
		let target = this._spawn.find("content > div"),
			history = this._active.history,
			state = history.current,
			path = state.cwd,
			firstPath = state.columns ? state.columns[0] : path;

		// update window title
		this._spawn.title = window.path.dirname(path);
		// update sidebar "active"
		this._spawn.find(`sidebar .sidebar-active_`).removeClass("sidebar-active_");
		this._spawn.find(`sidebar li[data-path="${firstPath}"]`).addClass("sidebar-active_");
		// toolbar UI update
		this._spawn.find(`[data-click="history-go"][data-arg="-1"]`).toggleClass("tool-disabled_", history.canGoBack);
		this._spawn.find(`[data-click="history-go"][data-arg="1"]`).toggleClass("tool-disabled_", history.canGoForward);
		// update setting
		window.settings.setItem("finder-file-view", state.view);
		// update toolbar
		let tool = this._spawn.find(`[data-arg='${state.view}']`);
		tool.parent().find(".tool-active_").removeClass("tool-active_");
		tool.addClass("tool-active_");

		if (render) {
			if (state.view === "columns") {
				// remove redundant columns
				target.find(`.column_`).map(el => {
					if (!state.columns.includes(el.getAttribute("data-path"))) el.parentNode.removeChild(el);
				});
				// empty contents if not already columns-view
				if (!target.hasClass("fs-columns_")) target.html("");
				// add rool element for columns, if missing
				if (!target.find(".fs-root_").length) {
					target.append(`<div class="fs-root_"></div>`);
				}
				// render missing columns
				state.columns.map(path => {
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
		let cEl = target.find(".column_:last"),
			len = cEl.find(".ant-file_").length,
			str = `${len} items, ${disk.avail} available`;
		if (state.kind) {
			cEl = target.find(".column_:nth-last-child(2)");
			len = cEl.find(".ant-file_").length;
			let selected = state.kind === "_dir" ? cEl.find(".ant-file_.file-active").length : 1;
			str = `${selected} of ${len} selected, ${disk.avail} available`;
		}
		this._spawn.statusBar.find(".content").text(str);
		// show status-bar slider only for icons view
		this._spawn.statusBar.find(".icon-resizer").css({display: state.view === "icons" ? "block" : "none"});
	}
}
