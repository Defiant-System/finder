
// finder.spawn

{
	init() {
		
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
				break;
			case "spawn.init":
				value = window.settings.getItem("finder-default-path");
				// auto add first base "tab"
				Self.dispatch({ ...event, path: value, type: "new-tab" });
				break;
			case "open.file":
				// auto add first base "tab"
				Self.dispatch({ ...event, type: "new-tab" });
				break;

			// tab related events
			case "new-tab":
				// name of directory
				Spawn.data.tabs.add(event.path);
				break;

			// toolbar events
			case "history-go":
				Spawn.data.tabs.historyGo(event.arg);
				break;
			case "select-file-view":
				// copy current state
				state = { ...Spawn.data.tabs.history.current };
				// handles file selected
				if (state && state.kind) {
					let columns = state.columns;
					state = Spawn.data.tabs.history.stack[Spawn.data.tabs.history.index-1];
					state.columns = columns;
				}
				// add view to state
				state.view = event.arg;
				
				Spawn.data.tabs.historyPush(state);
				return true;
		}
	}
}
