
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
			el;
		// proxy newMail (spawn) events
		if (event.spawn) return Self.spawn.dispatch(event);
		// console.log(event);
		switch (event.type) {
			case "window.init":
				window.open("spawn");
				break;
			case "open-help":
				defiant.shell("fs -u '~/help/index.md'");
				break;
		}
	},
	spawn: @import "spawn.js",
};

window.exports = finder;
