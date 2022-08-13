
// finder.info.sharing

{
	dispatch(event) {
		let APP = finder,
			Self = finder.info.sharing,
			value,
			el;
		switch (event.type) {
			case "unlock-actions":
				value = event.el.hasClass("icon-padlock-open");
				event.el.toggleClass("icon-padlock-open", value);
				break;
			case "users.select-user":
				console.log(event.arg);
				break;
			case "select-list-row":
				el = $(event.target);
				value = el.hasClass("list-row_");
				// toggle minus button
				APP.content.find(`.option-buttons_ span[data-click="remove-user"]`).toggleClass("disabled_", value);
				break;
			case "remove-user":
				el = APP.content.find(`.list-row-active_`);
				value = el.data("id");
				// remove row
				el.remove();

				console.log( value );
				break;
			case "set-privelege":
				value = event.xMenu.getAttribute("name");
				event.origin.el.nextAll("span").html(value);
				// handle event argument
				switch (event.arg) {
					case "read-write":
					case "read-only":
					case "no-access":
						break;
				}
				break;
		}
	}
}
