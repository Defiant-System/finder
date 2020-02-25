
ant_require("./sideBar.js");
ant_require("./contentView.js");

let cwd = {};
let disk;
let path;

const finder = {
	init() {
		sideBar.init();
		contentView.init();

		//setTimeout(() => this.dispatch({type: "new-clone-window"}), 800);
		//setTimeout(() => this.dispatch({type: "new-tab"}), 800);
	},
	async dispatch(event) {
		let isOn,
			clone,
			tab;
		//console.log(event);
		switch (event.type) {
			case "open.file":
				path = event.path;
				contentView.dispatch({type: "open-folder", path});
				break;
			case "window.focus":
				sideBar.dispatch({ type: "set-dom-context" });
				contentView.dispatch({ type: "set-dom-context" });
				break;
			case "new-tab":
				// let defPath = window.settings("defaultPath");
				// command = await defiant.shell(`fs -g '${defPath}'`);
				console.log(window.title);
				
				window.addTab("test");
				break;
			case "new-clone-window":
				clone = window.clone();
				// auto-switch DOM context
				sideBar.init();
				contentView.init();
				break;
			case "close-clone-window":
				window.close();
				break;
			case "toggle-sidebar-block":
			case "toggle-sidebar-icons":
			case "get-sidebar-item":
				return sideBar.dispatch(event);
			case "select-file-view":
			case "select-icon-file":
			case "select-list-file":
			case "select-column-file":
			case "open-icon-file":
			case "open-list-file":
			case "open-column-file":
			case "list-toggle-folder":
			case "sort-file-view-by":
				return contentView.dispatch(event);
			case "toggle-toolbar":
				isOn = window.state("toolbar");
				window.state("toolbar", isOn);
				return isOn ? "toggle_true" : "toggle_false";
			case "toggle-sidebar-view":
				isOn = window.state("sidebar");
				window.state("sidebar", isOn);
				return isOn ? "toggle_true" : "toggle_false";
			case "toggle-statusbar-view":
				isOn = window.state("statusbar");
				window.state("statusbar", isOn);
				return isOn ? "toggle_true" : "toggle_false";
		}
	}
};

window.exports = finder;
