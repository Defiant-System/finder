
let finder;
let contentView;

let sideBar = {
	init(_finder, _contentView) {
		// fast and direct references
		finder = _finder;
		contentView = _contentView;

		this.el = window.find("sidebar");

		let favorites = window.settings("sidebar");
		console.log(favorites);

		window.render({
			template: "sideBar",
			match: `//Settings/*[@app-id="finder"]/*[@id="sidebar"]`,
			target: this.el
		});
	},
	async dispatch(event) {
		let path,
			isOn,
			str;
		switch (event.type) {
			case "toggle-sidebar-icons":
				isOn = sideBar.el.hasClass("icon-view");
				sideBar.el.toggleClass("icon-view", isOn);
				return isOn ? "toggle_true" : "toggle_false";
			case "toggle-sidebar-block":
				str = event.el.attr("toggle-text");
				isOn = event.el.attr("toggle-on") === "1";

				event.el.attr("toggle-on", isOn ? "0" : "1");
				event.el.attr("toggle-text", event.el.html());
				event.el.html(str);
				event.el.parents(".wrapper").toggleClass("collapsed", isOn);
				break;
			case "get-sidebar-item":
				event.el.parents("sidebar").find(".active").removeClass("active");
				event.el.addClass("active");
				path = event.el.attr("data-path");

				await contentView.renderPath(path);
				break;
		}
	}
};

export default sideBar;
