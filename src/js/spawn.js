
// finder.spawn

{
	init() {
		// temp
		window.settings.setItem("finder-file-view", "icons");
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
				Spawn.data.tabs = new Tabs(Self, Spawn);
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
				// setTimeout(() => Spawn.find(`.ant-file_:nth(1)`).trigger("click"), 200);
				// setTimeout(() => Spawn.find(`.toolbar-tool_[data-arg="icons"]`).trigger("click"), 500);
				// setTimeout(() => Spawn.find(`.toolbar-tool_[data-arg="columns"]`).trigger("click"), 1200);
				break;
			case "spawn.init":
				value = window.settings.getItem("finder-default-path");
				// auto add first base "tab"
				Self.dispatch({ ...event, path: value, type: "new-tab" });
				break;
			case "open.file":
				if (event.tab) {
					// open path in new tab
					console.log(event);
				} else {
					// auto add first base "tab"
					Self.dispatch({ ...event, type: "new-tab" });
				}
				break;

			// this event is passed from filesystem event handler
			case "fs-view-render":
				state = {
					...Spawn.data.tabs.history.current,
					cwd: event.path,
					render: false,
				};
				// push state to active tab history stack
				Spawn.data.tabs.historyPush(state);
				break;

			// tab related events
			case "new-tab":
				// name of directory
				Spawn.data.tabs.add(event.path);
				break;

			// toolbar events
			case "history-go":
				// active tab history stack
				Spawn.data.tabs.historyGo(event.arg);
				break;
			case "select-file-view":
				// copy current state
				state = {
					...Spawn.data.tabs.history.current,
					view: event.arg,
					render: true,
				};
				// push state to active tab history stack
				Spawn.data.tabs.historyPush(state);
				return true;

			// custom events
			case "get-sidebar-item":
				Spawn.find("content > div").html("");
				// copy current state
				state = {
					...Spawn.data.tabs.history.current,
					cwd: event.arg,
					render: true,
				};
				// push state to active tab history stack
				Spawn.data.tabs.historyPush(state);
				break;
		}
	}
}
