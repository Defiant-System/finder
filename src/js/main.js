
ant_require("./sideBar.js");
ant_require("./contentView.js");

const finder = {
	init() {
		sideBar.init();
		contentView.init();
	},
	async dispatch(event) {
		let el;
		//console.log(event);
		switch (event.type) {
			case "open.file":
				break;
			case "new-clone-window":
				break;
			case "new-tab":
				break;
			case "close-clone-window":
				break;
			case "get-sidebar-item":
				// forward event to sidebar
				return sideBar.dispatch(event);
			case "select-file-view":
			case "set-icon-size":
				// forward event to contentView
				return contentView.dispatch(event);
		}
	}
};

window.exports = finder;
