
let cwd = {
	path: defiant.setting("defaultPath"),
};
let disk;

const contentView = {
	init() {
		// auto-switch dom context
		this.dispatch({ type: "set-dom-context" });

		// initial value for icon resizer
		let iconSize = defiant.setting("iconSize");
		this.el.attr({style: `--icon-size: ${iconSize}px`});
		this.iconResizer.val(iconSize);

		// auto click toolbar
		window.find(`[data-arg='${defiant.setting("fileView")}']`).trigger("click");
	},
	async dispatch(event) {
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
				defiant.setting("iconSize", event.value);
				self.el.attr({style: `--icon-size: ${event.value}px`});
				break;
			case "select-file-view":
				// update setting
				defiant.setting("fileView", event.arg);

				self.renderPath();
				break;
		}
	},
	renderPath(path) {
		if (path) cwd.path = path;

		window.render({
			path: cwd.path,
			template: "sys:fs-fileView",
			target: this.el
		});
	}
};
