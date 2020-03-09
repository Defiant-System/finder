
const sideBar = {
	init() {
		this.el = window.el.find("sidebar");
		
		window.render({
			template: "sys:fs-sideBar",
			match: `//Settings/Finder/*[@id="sidebar"]`,
			target: this.el,
		});
	},
	dispatch(event) {
		let self = sideBar,
			el;

		switch (event.type) {
			case "get-sidebar-item":
				contentView.renderPath(event.arg);
				break;
		}
	}
};
