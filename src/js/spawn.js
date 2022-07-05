
// finder.spawn

{
	init() {
		
	},
	dispatch(event) {
		let APP = finder,
			Self = APP.spawn,
			Spawn = event.spawn,
			path,
			state,
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
				// trigger history state push
				// Self.dispatch({
				// 	path: window.settings.getItem("finder-default-path"),
				// 	spawn: event.spawn,
				// 	type: "fs-view-render",
				// 	el: Spawn.find("content > div"),
				// });
				console.log(event);
				break;
			case "spawn.close":
				break;
			// custom events
			case "history-go":
				if (event.arg === "-1") Spawn.data.history.goBack();
				else Spawn.data.history.goForward();
				// update view state
				Self.setViewState(Spawn, true);
				break;
			case "fs-view-render":
				// push to history
				state = {
					cwd: event.path,
					view: window.settings.getItem("finder-file-view"),
				};
				if (state.view === "columns") {
					state.columns = Spawn.find("content > div").find(".column_").map(e => e.getAttribute("data-path"));
				}
				Spawn.data.history.push(state);
				// update view state
				Self.setViewState(Spawn);
				break;
			case "get-sidebar-item":
				// trigger history state push
				Self.dispatch({
					path: event.arg,
					spawn: event.spawn,
					type: "fs-view-render",
					el: Spawn.find("content > div"),
				});
				break;
			case "select-file-view":
				// update setting
				window.settings.setItem("finder-file-view", event.arg);
				// set state and path
				state = Spawn.data.history.current;
				// handles file selected
				if (state && state.kind) {
					state = view.history.stack[view.history.index-1];
				}
				// trigger history state push
				Self.dispatch({
					path: state.cwd,
					spawn: event.spawn,
					type: "fs-view-render",
					el: Spawn.find("content > div"),
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
			state = history.current;
		// update window title
		Spawn.title = window.path.dirname(state.cwd);
		// update sidebar "active"
		Spawn.find(`sidebar .sidebar-active_`).removeClass("sidebar-active_");
		Spawn.find(`sidebar li[data-path="${state.cwd}"]`).addClass("sidebar-active_");
		// toolbar UI update
		Spawn.find(`[data-click="history-go"][data-arg="-1"]`).toggleClass("tool-disabled_", history.canGoBack);
		Spawn.find(`[data-click="history-go"][data-arg="1"]`).toggleClass("tool-disabled_", history.canGoForward);
		// auto click toolbar
		let viewTool = Spawn.find(`[data-arg='${state.view}']`);
		viewTool.parent().find(".tool-active_").removeClass("tool-active_");
		viewTool.addClass("tool-active_");

		// set path as default path
		if (!state.kind) window.settings.setItem("finder-default-path", state.cwd);
		// show status-bar slider only for icons view
		Spawn.find(".icon-resizer").css({display: state.view === "icons" ? "block" : "none"});

		// update setting
		window.settings.setItem("finder-file-view", state.view);

		if (render) {
			if (window.settings.getItem("finder-file-view") !== state.view) {
				target.html("");
			}
			// update setting
			window.settings.setItem("finder-file-view", state.view);
			// toggle horizontal scroll for columns
			target.toggleClass("view-columns", state.view !== "columns");

			if (state.view === "columns") {
				target.find(`.column_`).map(el => {
					if (!~state.columns.indexOf(el.getAttribute("data-path"))) el.parentNode.removeChild(el);
				});
				// un-active active item
				Spawn.find("content > div .column_:last .ant-file_.file-active_").removeClass("file-active_");
				if (!Spawn.find("content > div .fs-root_").length) {
					target.append(`<div class="fs-root_"></div>`);
				}
				// add missing columns
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
							column.find(`.name:contains("${name}")`).parent().addClass("file-active_");
						} else {
							Spawn.find(`sidebar .sidebar-active_`).removeClass("sidebar-active_");
							Spawn.find(`sidebar li[data-path="${path}"]`).addClass("sidebar-active_");
						}
					}
				});
			} else {
				window.render({
					path: state.cwd,
					template: "sys:fs-fileView",
					target,
				});
			}
		}

		// update status-bar
		let len = target.find(".ant-file_").length,
			str = `${len} items, ${disk.avail} available`;
		if (state.kind) {
			let column = Spawn.find("content > div .column_:nth-last-child(2)"),
				total = column.find(".ant-file_").length,
				selected = state.kind === "_dir" ? column.find(".ant-file_.file-active").length : 1;
			str = `${selected} of ${total} selected, ${disk.avail} available`;
		}
		Spawn.statusBar.find(".content").text(str);
	}
}
