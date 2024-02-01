
// finder.spawn

{
	init() {
		// temp
		// window.settings.setItem("finder-file-view", "columns");
	},
	dispose(event) {
		let Spawn = event.spawn;
		let cmd = { type: "open.file", files: [] };
		for (let key in Spawn.data.tabs._stack) {
			let tab = Spawn.data.tabs._stack[key];
			cmd.files.push(tab.history.current.cwd);
		}
		return cmd;
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

				// subscribe to system event
				window.on("sys:fs.storage-size", e => Self.dispatch({ ...e, spawn: Spawn }));

				// DEV-ONLY-START
				Test.init(APP, Spawn);
				// DEV-ONLY-END
				break;
			case "spawn.init":
				value = window.settings.getItem("finder-default-path");
				// auto add first base "tab"
				Self.dispatch({ ...event, path: value, type: "tab.new" });
				break;
			case "open.file":
				(event.files || [event]).map(file => {
					let path = file.kind !== "_dir" ? file.dir : file.path,
						ev = { ...event, path, type: "tab.new" };
					// this makes dbl-clicking on folder to open in same window
					if (!event.tab && Spawn.data.tabs.length) {
						ev.type = "fs-view-render";
						ev.render = true;
					}
					// auto add first base "tab"
					setTimeout(() => Self.dispatch(ev), 1);
				});
				break;
			// this event is passed from filesystem event handler
			case "fs-view-render":
				state = {
					...Spawn.data.tabs.history.current,
					cwd: event.path,
					render: event.render || false,
				};
				// add kind to state object
				if (event.kind) state.kind = event.kind;
				// push state to active tab history stack
				Spawn.data.tabs.historyPush(state);
				break;
			case "fs.storage-size":
				karaqu.shell("fs -ih").then(call => {
					// update local variable
					disk = call.result;
					// refresh UI / statusbar
					let state = Spawn.data.tabs._active.history.current;
					Spawn.data.tabs.updateStatusbar(state);
				});
				break;

			// tab related events
			case "tab.new":
				// purge "tab body" contents
				Spawn.data.tabs.purgeBody();
				// name of directory
				value = event.path || window.settings.getItem("finder-default-path");
				Spawn.data.tabs.add(value);
				break;
			case "tab.clicked":
				Spawn.data.tabs.focus(event.el.data("id"));
				break;
			case "tab.close":
				Spawn.data.tabs.remove(event.el.data("id"));
				break;
			case "re-render-view":
				Spawn.data.tabs.reRender(event.el);
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
				// update setting
				window.settings.setItem("finder-file-view", state.view);
				// push state to active tab history stack
				Spawn.data.tabs.historyPush(state);
				return true;

			// from menubar
			case "new-spawn":
				APP.dispatch({ type: "new", id: "spawn" });
				break;
			case "merge-all-windows":
				Spawn.siblings.map(oSpawn => {
					for (let key in oSpawn.data.tabs._stack) {
						let ref = oSpawn.data.tabs._stack[key];
						Spawn.data.tabs.merge(ref);
					}
					// close sibling spawn
					oSpawn.close();
				});
				break;
			case "close-tab":
				value = Spawn.data.tabs.length;
				if (value > 1) {
					Spawn.data.tabs._active.el.find(`[sys-click]`).trigger("click");
				} else if (value === 1) {
					Self.dispatch({ ...event, type: "close-spawn" });
				}
				break;
			case "close-spawn":
				// system close window / spawn
				karaqu.shell("win -c");
				break;
			case "get-info":
				let view = window.settings.getItem("finder-file-view"),
					files = view === "columns"
							? Spawn.find(`.column_:not([data-kind]):last .file-active_`)
							: Spawn.find(`content .file-active_`);

				files = files.map(elem => {
					let $el = $(elem),
						itemName = $el.find(".file-name_").text(),
						path = window.path.join("/fs", $el.parents("[data-path]").data("path"), itemName);
					return new karaqu.File({ path });
				});

				// TODO: get selected FS item / Path
				APP.dispatch({ type: "file.info", files });
				break;
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;

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
			case "toggle-statusbar-view":
				value = Spawn.el.hasClass("has-StatusBar_");
				Spawn.el.toggleClass("has-StatusBar_", value);
				return `toggle_${!value}`;
		}
	}
}
