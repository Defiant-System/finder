
const finder = {
	init() {
		window.open("spawn");
	},
	dispatch(event) {
		let Self = finder,
			path;
		// proxy newMail (spawn) events
		if (event.spawn) return Self.spawn.dispatch(event);
		// console.log(event);
		switch (event.type) {
			case "open.file":
				break;
		}
	},
	spawn: @import "spawn.js",
};

window.exports = finder;
