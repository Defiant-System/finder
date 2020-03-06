
const sideBar = {
	init() {
		this.el = window.el.find("sidebar");
		
		window.render({
			template: "sys:fs-sideBar",
			match: `~//Settings/*[@id="sidebar"]`,
			target: this.el,
		});
	},
	dispatch(event) {

	}
};
