
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
			case "spawn.open":
				// window height should obey contents height
				Spawn.height = "auto";
				break;
			case "spawn.init":
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
			case "open.file":
				(event.files || [event]).map(file => {
					let dim = {
							top: (infoIndex.y * 30) + 50,
							left: (infoIndex.x * 320) + 530,
						};
					infoIndex.x++;
					APP.dispatch({ type: "new", id: "info", file, dim });
				});
				break;

			case "toggle-wrapper":
				event.el.toggleClass("expanded", event.el.hasClass("expanded"));
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
