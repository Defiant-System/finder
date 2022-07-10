
// finder.spawn

{
	init() {
		// temp
		window.settings.setItem("finder-file-view", "columns");
	},
	dispatch(event) {
		let APP = finder,
			Self = APP.spawn,
			Spawn = event.spawn,
			state,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "spawn.open":
				// history stack
				Spawn.data.history = new window.History;
				// render sidebar
				window.render({
					template: "sys:fs-sideBar",
					target: Spawn.find("sidebar"),
				});
				// initial value for icon resizer
				value = window.settings.getItem("finder-icon-size");
				Spawn.find("content > div").css({ "--icon-size": `${value}px` });
				Spawn.find(".icon-resizer").val(value);
				// temp
				// setTimeout(() => Spawn.find(`.ant-file_:nth(7)`).trigger("click"), 200);
				// setTimeout(() => Spawn.find(`.toolbar-tool_[data-click="history-go"]`).trigger("click"), 1200);
				// setTimeout(() => Spawn.find(`.toolbar-tool_[data-arg="icons"]`).trigger("click"), 500);
				// setTimeout(() => Spawn.find(`.toolbar-tool_[data-arg="columns"]`).trigger("click"), 1200);

				setTimeout(() => Spawn.find(`.toolbar-tool_[data-menu="toolbar-context"]`).trigger("mousedown"), 200);
				break;
			case "spawn.close":
				break;
			case "spawn.init":
				value = window.settings.getItem("finder-default-path");
				// render path
				Self.dispatch({ ...event, render: true, path: value, type: "fs-view-render" });
				break;
			case "open.file":
				// render path
				Self.dispatch({ ...event, render: true, type: "fs-view-render" });
				break;
			case "fs-view-render":
				state = {
					cwd: event.path || window.settings.getItem("finder-default-path"),
					view: event.view || window.settings.getItem("finder-file-view"),
				};
				if (event.kind) state.kind = event.kind;
				if (event.columns) state.columns = event.columns;
				if (state.view === "columns") {
					state.columns = Spawn.find("content > div .column_").map(e => "/fs"+ e.getAttribute("data-path"));
					if (!state.columns.length) state.columns = event.columns || [state.cwd];
				}
				Spawn.data.history.push(state);
				// console.log(state);
				// update view state
				Self.setViewState(Spawn, event.render);
				break;

			// menu events
			case "toggle-sidebar-view":
				el = Spawn.find(`layout`);
				el.toggleClass("hide-sidebar", el.hasClass("hide-sidebar"));
				return el.hasClass("hide-sidebar") ? "toggle_false" : "toggle_true";
			case "toggle-statusbar-view":
				el = Spawn.find(`layout`);
				el.toggleClass("hide-statusbar", el.hasClass("hide-statusbar"));
				// notify root object
				Spawn.state("statusbar", el.hasClass("hide-statusbar"));
				return el.hasClass("hide-statusbar") ? "toggle_false" : "toggle_true";
			case "toggle-toolbar":
			case "toggle-statusbar-view":
				el = Spawn.find(`layout`);
				el.toggleClass("hide-toolbar", el.hasClass("hide-toolbar"));
				// notify root object
				Spawn.state("toolbar", el.hasClass("hide-toolbar"));
				return el.hasClass("hide-toolbar") ? "toggle_false" : "toggle_true";
			case "toggle-sidebar-icons":
				break;
			
			// custom events
			case "history-go":
				if (event.arg === "-1") Spawn.data.history.goBack();
				else Spawn.data.history.goForward();
				// update view state
				Self.setViewState(Spawn, true);
				break;
			case "get-sidebar-item":
				// empty contents
				Spawn.find("content > div").html("");
				// forward event
				Self.dispatch({
					type: "fs-view-render",
					path: event.arg,
					render: true,
					spawn: Spawn,
				});
				break;
			case "select-file-view":
				// get current state
				state = Spawn.data.history.current;
				// handles file selected
				if (state && state.kind) {
					let columns = state.columns;
					state = Spawn.data.history.stack[Spawn.data.history.index-1];
					state.columns = columns;
				}
				// forward event
				Self.dispatch({
					type: "fs-view-render",
					path: state ? state.cwd : window.settings.getItem("finder-default-path"),
					view: event.arg,
					columns: state ? state.columns : false,
					render: true,
					spawn: Spawn,
				});
				return true;
			case "set-icon-size":
				window.settings.setItem("finder-icon-size", +event.value);
				Spawn.find("content > div").css({ "--icon-size": `${event.value}px` });
				break;
		}
	},
	setViewState(Spawn, render) {
		let target = Spawn.find("content > div"),
			history = Spawn.data.history,
			state = history.current,
			path = state.cwd,
			firstPath = state.columns ? state.columns[0] : path;

		// update window title
		Spawn.title = window.path.dirname(path);
		// update sidebar "active"
		Spawn.find(`sidebar .sidebar-active_`).removeClass("sidebar-active_");
		Spawn.find(`sidebar li[data-path="${firstPath}"]`).addClass("sidebar-active_");
		// toolbar UI update
		Spawn.find(`[data-click="history-go"][data-arg="-1"]`).toggleClass("tool-disabled_", history.canGoBack);
		Spawn.find(`[data-click="history-go"][data-arg="1"]`).toggleClass("tool-disabled_", history.canGoForward);
		// update setting
		window.settings.setItem("finder-file-view", state.view);
		// update toolbar
		let tool = Spawn.find(`[data-arg='${state.view}']`);
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
					let column = Spawn.find(`content > div .column_[data-path="${path}"]`),
						name = path.slice(path.lastIndexOf("/") + 1),
						append = Spawn.find("content > div .fs-root_"),
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
		Spawn.statusBar.find(".content").text(str);
		// show status-bar slider only for icons view
		Spawn.statusBar.find(".icon-resizer").css({display: state.view === "icons" ? "block" : "none"});
	}
}
