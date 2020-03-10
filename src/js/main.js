
ant_require("./sideBar.js");
ant_require("./contentView.js");

let disk;
let states = [{
		tab: window.tabs.getActive(),
		hIndex: 0,
		history: [],
		cwd: { path: defiant.setting("defaultPath"), list: [] },
	}];
let state = states[0]; // active state index = 0

const finder = {
	async init() {
		if (!disk) {
			// disk info
			disk = await defiant.shell("fs -ih");
			disk = disk.result;
		}
		// set current working directory
		await this.setCwd(state.cwd.path);

		// initiate sub-objects
		sideBar.init();
		contentView.init();

		// temp
		//this.dispatch({type: "new-tab"});
		//sideBar.el.find("li[data-path='/app']").trigger("click");
		// states[0].tab.trigger("click");

		//contentView.el.find(".file:nth(0)").trigger("click");

		//setTimeout(() => sideBar.el.find("li[data-path='/']").trigger("click"), 500);
	},
	dispatch(event) {
		let self = finder,
			el,
			clone,
			tab,
			index,
			name,
			path;
		//console.log(event);
		switch (event.type) {
			case "open.file":
				break;

			// TAB RELATED EVENTS
			case "active-tab":
				state = states[event.el.index()];
				contentView.renderPath();
				break;
			case "new-tab":
				path = defiant.setting("defaultPath");
				name = window.path.dirname(path);
				tab = window.tabs.add(name);

				states.push({
					tab,
					hIndex: 0,
					history: [defiant.setting("defaultPath")],
					cwd: { path: defiant.setting("defaultPath"), list: [] }
				});
				state = states[tab.index()];
				contentView.renderPath();
				break;
			case "close-tab":
				// remove state from states array
				states.splice(event.el.index(), 1);
				break;
			case "close-active-tab":
				window.tabs.close(state.tab);
				break;

			// CLONE WINDOW RELATED EVENTS
			case "new-clone-window":
				//clone = window.clone();
				break;
			case "close-clone-window":
				break;

			case "history-go":
				index = parseInt(event.arg, 10);
				// contrain history index
				state.hIndex = Math.min(Math.max(0, state.hIndex + index), state.history.length - 1);
				contentView.renderPath(state.history[state.hIndex]);
				return 1;

			case "get-sidebar-item":
				// forward event to sidebar
				return sideBar.dispatch(event);
			case "select-file-view":
			case "set-icon-size":
				// forward event to contentView
				return contentView.dispatch(event);
		}
	},
	async setCwd(path, skip) {
		if (path) state.cwd.path = path;
		if (!skip && path && path !== state.history[state.hIndex]) {
			if (state.hIndex < state.history.length - 1) {
				state.history.splice(state.hIndex + 1);
			}
			state.history.push(path);
			state.hIndex = state.history.length - 1;
		}

		// make sure folder contents is loaded
		await defiant.shell(`fs -r '${state.cwd.path}'`);
		// get folder contents
		let shell = await defiant.shell(`fs -l '${state.cwd.path}'`);
		state.cwd.list = shell.result;
	}
};

window.exports = finder;
