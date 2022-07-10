
let disk;

const finder = {
	async init() {
		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init());

		let call = await defiant.shell("fs -ih");
		disk = call.result;
	},
	dispatch(event) {
		let Self = finder,
			spawn,
			el;
		// console.log(event);
		// proxy spawn events
		if (event.spawn) return Self.spawn.dispatch(event);

		switch (event.type) {
			case "window.init":
				spawn = window.open("spawn");
				Self.spawn.dispatch({ ...event, type: "spawn.init", spawn });
				break;
			case "open.file":
				spawn = window.open("spawn");
				Self.spawn.dispatch({ ...event, spawn });
				break;
			case "open-help":
				defiant.shell("fs -u '~/help/index.md'");
				break;
		}
	},
	spawn: @import "spawn.js",
};

window.exports = finder;
