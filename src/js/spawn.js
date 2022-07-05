
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
				Self.dispatch({
					path: window.settings.getItem("finder-default-path"),
					spawn: event.spawn,
					type: "fs-view-render",
					el: Spawn.find("content > div"),
				});
				break;
			case "spawn.close":
				break;
			// custom events
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
		// toolbar UI update
		Spawn.find(`[data-click="history-go"][data-arg="-1"]`).toggleClass("tool-disabled_", history.canGoBack);
		Spawn.find(`[data-click="history-go"][data-arg="1"]`).toggleClass("tool-disabled_", history.canGoForward);
		// auto click toolbar
		let viewTool = Spawn.find(`[data-arg='${state.view}']`);
		viewTool.parent().find(".tool-active_").removeClass("tool-active_");
		viewTool.addClass("tool-active_");

		if (!state.kind) {
			// set path as default path
			window.settings.setItem("finder-default-path", state.cwd);
		}
		// show status-bar slider only for icons view
		Spawn.find(".icon-resizer").css({display: state.view === "icons" ? "block" : "none"});

		window.render({
			path: state.cwd,
			template: "sys:fs-fileView",
			target,
		});

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
