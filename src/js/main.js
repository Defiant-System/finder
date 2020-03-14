
ant_require("./history.js");
ant_require("./sideBar.js");
ant_require("./contentView.js");

let disk;
let path = defiant.setting("defaultPath");
let states = [{
		tab: window.tabs.getActive(),
		history: new History(),
		cwd: { path, list: [] },
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
		//await this.setCwd(state.cwd.path);
		this.pushPath(state.cwd.path);

		// initiate sub-objects
		sideBar.init();
		contentView.init();

		// temp
		//this.dispatch({type: "new-tab"});
		//sideBar.el.find("li[data-path='/app']").trigger("click");
		// states[0].tab.trigger("click");

		//contentView.el.find(".file:nth(5)").trigger("click");

		//setTimeout(() => sideBar.el.find("li[data-path='/']").trigger("click"), 500);
	},
	dispatch(event) {
		let self = finder,
			el,
			clone,
			tab,
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
				name = window.path.dirname();
				tab = window.tabs.add(name);

				states.push({
					tab,
					history: new History(path),
					cwd: { path, list: [] }
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
				state.history[event.arg === "-1" ? "goBack" : "goForward"]();
				contentView.renderPath(state.cwd.path);
				return 1;
			case "fs-view-render":
				if (!event.el.hasClass("preview")) {
					self.pushPath(event.path);
				}
				break;

			// forward events...
			case "get-sidebar-item":
				// ...to sidebar
				return sideBar.dispatch(event);
			case "select-file-view":
			case "set-icon-size":
				// ...to contentView
				return contentView.dispatch(event);
		}
	},
	pushPath(path) {
		let fn = (redo, data) => {
				this.setCwd(redo ? data[1] : data[0]);
			},
			data = [state.cwd.path, path];
		state.history.push(fn, data);
		fn.call(this, true, data);
	},
	async setCwd(path) {
		// update current working directory
		state.cwd.path = path;
		// update window title
		window.title = window.path.dirname(state.cwd.path);

		// toolbar UI update
		window.find("[data-click='history-go'][data-arg='-1']").toggleClass("tool-disabled_", state.history.canGoBack);
		window.find("[data-click='history-go'][data-arg='1']").toggleClass("tool-disabled_", state.history.canGoForward);

		// get folder contents
		let shell = await defiant.shell(`fs -l '${state.cwd.path}'`);
		state.cwd.list = shell.result;

		// update status-bar
		str = `${state.cwd.list.length} items, ${disk.avail} available`;
		window.statusBar.find(".content").text(str);
	}
};

window.exports = finder;
