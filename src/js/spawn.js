
// finder.spawn

{
	init() {
		// temp
		// window.settings.setItem("finder-file-view", "columns");
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
				// auto add first base "tab"
				Self.dispatch({ ...event, type: "new-tab" });
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
				setTimeout(() => Spawn.find(`.ant-file_:nth(1)`).trigger("click"), 200);
				// setTimeout(() => Spawn.find(`.toolbar-tool_[data-click="history-go"]`).trigger("click"), 1200);
				// setTimeout(() => Spawn.find(`.toolbar-tool_[data-arg="icons"]`).trigger("click"), 500);
				// setTimeout(() => Spawn.find(`.toolbar-tool_[data-arg="columns"]`).trigger("click"), 1200);

				// setTimeout(() => Spawn.find(`.toolbar-tool_[data-menu="toolbar-context"]`).trigger("mousedown"), 200);
				// setTimeout(() => Spawn.dialog.open({ txt: item => console.log(item) }), 500);
				setTimeout(() => Self.dispatch({ ...event, type: "new-tab" }), 500);
				
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
				Spawn.data.tabs.historyPush(state);
				// update view state
				Spawn.data.tabs.setViewState(event.render);
				break;

			// menu events
			case "toggle-sidebar-view":
				el = Spawn.find("layout");
				el.toggleClass("hide-sidebar", el.hasClass("hide-sidebar"));
				return el.hasClass("hide-sidebar") ? "toggle_false" : "toggle_true";
			case "toggle-statusbar-view":
				el = Spawn.find("layout");
				el.toggleClass("hide-statusbar", el.hasClass("hide-statusbar"));
				// notify root object
				Spawn.state("statusbar", el.hasClass("hide-statusbar"));
				return el.hasClass("hide-statusbar") ? "toggle_false" : "toggle_true";
			case "toggle-toolbar":
				el = Spawn.find("layout");
				el.toggleClass("hide-toolbar", el.hasClass("hide-toolbar"));
				// notify root object
				Spawn.state("toolbar", el.hasClass("hide-toolbar"));

				return el.hasClass("hide-toolbar") ? "toggle_true" : "toggle_false";
			case "toggle-sidebar-icons":
				break;
			
			// tab related events
			case "new-spawn":
				console.log(event);
				break;
			case "new-tab":
				// name of directory
				Spawn.data.tabs.add();
				break;
			case "tab-clicked":
				value = event.el.data("id");
				Spawn.data.tabs.focus(value);
				break;
			case "tab-close":
				console.log(event);
				break;
			
			// custom events
			case "history-go":
				// forward event to "Tabs"
				Spawn.data.tabs.historyGo(event.arg);
				// update view state
				Spawn.data.tabs.setViewState(true);
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
				state = Spawn.data.tabs.history.current;
				// handles file selected
				if (state && state.kind) {
					let columns = state.columns;
					state = Spawn.data.tabs.history.stack[Spawn.data.tabs.history.index-1];
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
	}
}
