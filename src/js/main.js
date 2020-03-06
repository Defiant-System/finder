
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
			case "toggle-sidebar-block":
			case "toggle-sidebar-icons":
			case "get-sidebar-item":
				return sideBar.dispatch(event);
			case "set-icon-size":
				return contentView.dispatch(event);
		}
	}
};

window.exports = finder;
