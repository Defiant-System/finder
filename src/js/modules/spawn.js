
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
			columns,
			state,
			value,
			tabs,
			curr,
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
				// setTimeout(() => Spawn.find(`.ant-file_:nth(1)`).trigger("click"), 100);
				// setTimeout(() => Spawn.find(`.ant-file_:nth(16)`).trigger("click"), 200);
				// setTimeout(() => Spawn.find(`.toolbar-tool_[data-arg="-1"]`).trigger("click"), 500);
				
				// setTimeout(() => Spawn.find(`.toolbar-tool_[data-arg="icons"]`).trigger("click"), 500);
				// setTimeout(() => Spawn.find(`.toolbar-tool_[data-arg="columns"]`).trigger("click"), 1200);
				break;
			case "spawn.init":
				value = window.settings.getItem("finder-default-path");
				// auto add first base "tab"
				Self.dispatch({ ...event, path: value, type: "new-tab" });
				break;
			case "open.file":
				(event.files || [event]).map(file => {
					// auto add first base "tab"
					Self.dispatch({ ...event, path: file.path, type: "new-tab" });
				});
				break;

			// this event is passed from filesystem event handler
			case "fs-view-render":
				state = {
					...Spawn.data.tabs.history.current,
					cwd: event.path,
					render: false,
				};
				// add kind to state object
				if (event.kind) state.kind = event.kind;
				// push state to active tab history stack
				Spawn.data.tabs.historyPush(state);
				break;

			// tab related events
			case "new-tab":
				// purge "tab body" contents
				Spawn.data.tabs.purgeBody();
				// name of directory
				value = event.path || window.settings.getItem("finder-default-path");
				Spawn.data.tabs.add(value);
				break;
			case "tab-clicked":
				Spawn.data.tabs.focus(event.el.data("id"));
				break;

			// toolbar events
			case "history-go":
				// active tab history stack
				Spawn.data.tabs.historyGo(event.arg);
				break;
			case "select-file-view":
				curr = Spawn.data.tabs.history.current;
				if (curr.columns) columns = curr.columns;
				if (curr && curr.kind) {
					curr = Spawn.data.tabs.history.stack[Spawn.data.tabs.history.index-1];
				}
				// copy current state
				state = {
					...curr,
					view: event.arg,
					render: true,
				};
				if (columns) state.columns = columns;
				// push state to active tab history stack
				Spawn.data.tabs.historyPush(state);
				return true;

			// custom events
			case "get-sidebar-item":
				// purge "tab body" contents
				Spawn.data.tabs.purgeBody();
				// copy current state
				state = {
					...Spawn.data.tabs.history.current,
					cwd: event.arg,
					render: true,
				};
				// push state to active tab history stack
				Spawn.data.tabs.historyPush(state);
				break;
			case "set-icon-size":
				window.settings.setItem("finder-icon-size", +event.value);
				Spawn.find("content > div").css({ "--icon-size": `${event.value}px` });
				break;
		}
	}
}
