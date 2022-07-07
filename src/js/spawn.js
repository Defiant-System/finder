
// finder.spawn

{
	init() {
		window.settings.setItem("finder-file-view", "columns");
	},
	dispatch(event) {
		let APP = finder,
			Self = APP.spawn,
			Spawn = event.spawn,
			target,
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
				// push to history
				// Spawn.data.history.push({
				// 	cwd: window.settings.getItem("finder-default-path"),
				// 	view: window.settings.getItem("finder-file-view"),
				// });
				// initial value for icon resizer
				value = window.settings.getItem("finder-icon-size");
				Spawn.find("content > div").css({ "--icon-size": `${value}px` });
				Spawn.find(".icon-resizer").val(value);
				// auto click toolbar
				Spawn.find(`[data-arg='${window.settings.getItem("finder-file-view")}']`).trigger("click");
				// update view state
				Self.setViewState(Spawn);
				break;
			case "spawn.close":
				break;
			case "spawn.init":
				break;

			// custom events
			case "history-go":
				if (event.arg === "-1") Spawn.data.history.goBack();
				else Spawn.data.history.goForward();
				// update view state
				Self.setViewState(Spawn);
				break;
			case "get-sidebar-item":
				// update view state
				Self.setViewState(Spawn);
				// push to history
				Spawn.data.history.push({
					cwd: event.arg,
					view: window.settings.getItem("finder-file-view"),
				});
				// update view state
				Self.setViewState(Spawn);
				break;
			case "select-file-view":
				// push to history
				state = Spawn.data.history.current;
				Spawn.data.history.push({
					cwd: state ? state.cwd : window.settings.getItem("finder-default-path"),
					view: event.arg,
				});
				// update view state
				Self.setViewState(Spawn);
				return true;
			case "set-icon-size":
				window.settings.setItem("finder-icon-size", +event.value);
				Spawn.find("content > div").css({ "--icon-size": `${event.value}px` });
				break;
		}
	},
	setViewState(Spawn) {
		let target = Spawn.find("content > div"),
			history = Spawn.data.history,
			state = history.current,
			path = state.cwd;

		// update window title
		Spawn.title = window.path.dirname(path);
		// update sidebar "active"
		Spawn.find(`sidebar .sidebar-active_`).removeClass("sidebar-active_");
		Spawn.find(`sidebar li[data-path="${path}"]`).addClass("sidebar-active_");
		// toolbar UI update
		Spawn.find(`[data-click="history-go"][data-arg="-1"]`).toggleClass("tool-disabled_", history.canGoBack);
		Spawn.find(`[data-click="history-go"][data-arg="1"]`).toggleClass("tool-disabled_", history.canGoForward);
		// update setting
		window.settings.setItem("finder-file-view", state.view);
		// update toolbar
		let viewTool = Spawn.find(`[data-arg='${state.view}']`);
		viewTool.parent().find(".tool-active_").removeClass("tool-active_");
		viewTool.addClass("tool-active_");
		
		// render content
		window.render({ template: "sys:fs-fileView", target, path });

		// update status-bar
		let len = target.find(".ant-file_").length,
			str = `${len} items, ${disk.avail} available`;
		Spawn.statusBar.find(".content").text(str);
	}
}
