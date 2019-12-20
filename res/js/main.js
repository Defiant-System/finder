
import sideBar from "./modules/sideBar"
import contentView from "./modules/contentView"

let path;

const finder = {
	init() {
		sideBar.init(finder, contentView);
		contentView.init(finder, sideBar);
	},
	async dispatch(event) {
		let isOn;
		switch (event.type) {
			case "open.file":
				path = event.path;
				contentView.dispatch({type: "open-folder", path});
				break;
			case "window.open":
				if (path) return;
				contentView.dispatch({
					type: "open-folder",
					path: window.settings("defaultPath")
				});
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
