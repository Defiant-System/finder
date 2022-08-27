
let disk;
let infoIndex = { x: 0, y: 0 };

@import "classes/tabs.js"


const finder = {
	async init() {
		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init());

		let call = await karaqu.shell("fs -ih");
		disk = call.result;

		// temp
		// setTimeout(() => karaqu.shell("win -a"), 300);
	},
	dispose(event) {
		if (event.spawn) {
			return this.spawn.dispose(event);
		}
	},
	dispatch(event) {
		let Self = finder,
			spawn,
			name,
			dim,
			el;
		// proxy spawn events
		if (event.spawn) {
			name = event.spawn.el.data("id").slice("finder-".length);
			return Self[name].dispatch(event);
		}

		switch (event.type) {
			case "window.init":
			case "new":
				name = event.id || "spawn";
				dim = event.dim || null;
				spawn = window.open(name, dim);
				Self[name].dispatch({ ...event, type: "spawn.init", spawn });
				break;
			case "file.info":
				(event.files || [event]).map(file => {
					let dim = {
							top: (infoIndex.y * 30) + 50,
							left: (infoIndex.x * 50) + 30,
						};
					infoIndex.x++;
					if (infoIndex.x > 7) {
						infoIndex.x = 0;
						infoIndex.y++;
					}
					Self.dispatch({ type: "new", id: "info", file, dim });
				});
				break;
			// case "open.file":
			// 	spawn = window.open("spawn");
			// 	Self.spawn.dispatch({ ...event, spawn });
			// 	break;
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
		}
	},
	info: @import "modules/info.js",
	spawn: @import "modules/spawn.js",
};

window.exports = finder;
