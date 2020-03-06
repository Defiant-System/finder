
const contentView = {
	init() {
		// auto-switch dom context
		this.dispatch({ type: "set-dom-context" });

		// initial value for icon resizer
		let iconSize = window.settings("iconSize") || 69;
		this.el.attr({style: `--icon-size: ${iconSize}px`});
		this.iconResizer.val(iconSize);

		// temp
		window.render({
			path: "/",
			template: "sys:fs-fileView",
			target: this.el
		});
	},
	dispatch(event) {
		let self = contentView,
			file,
			el;

		switch (event.type) {
			case "set-dom-context":
				// fast references
				self.el = window.el.find("content > div");
				self.iconResizer = window.find(".icon-resizer");
				break;
			case "set-icon-size":
				console.log(event.value);
				break;
		}
	}
};
