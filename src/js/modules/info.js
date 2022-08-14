
// finder.spawn

{
	init() {
		
	},
	dispatch(event) {
		let APP = finder,
			Self = APP.info,
			Spawn = event.spawn,
			name,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "spawn.init":
				// window height should obey contents height
				Spawn.height = "auto";
				// spawn title
				Spawn.title = event.file.base +" Info";
				// render content
				window.render({
					template: "info-content",
					target: Spawn.find("content"),
					path: event.file.path,
				});
				break;
			// custom events
			case "toggle-wrapper":
				event.el.toggleClass("expanded", event.el.hasClass("expanded"));
				break;
			case "close-tab":
			case "close-spawn":
				// system close window / spawn
				defiant.shell("win -c");
				break;
			default:
				// proxy event to section module
				el = event.target ? $(event.target) : event.el;
				if (!event.el && event.origin) el = event.origin.el;
				if (el) name = el.parents("[data-section]").data("section");
				if (name) Self[name].dispatch(event);
		}
	},
	sharing:  @import "info.sharing.js",
	openWith: @import "info.openWith.js",
}
