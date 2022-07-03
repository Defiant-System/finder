
// finder.spawn

{
	init() {
		
	},
	dispatch(event) {
		let APP = finder,
			Self = APP.spawn,
			el;
		console.log(event);
		switch (event.type) {
			case "spawn.open":
				break;
			case "spawn.close":
				break;
		}
	}
}
