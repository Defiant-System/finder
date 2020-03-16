
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
				// toggle horizontal scroll for columns
				self.el.toggleClass("view-columns", event.arg !== "columns");

				self.renderPath();
				break;
		}
	},
	async renderPath(path) {
		if (path) {
			// set current working directory
			await finder.setCwd(path);
		}
		// update sidebar
		sideBar.el.find("li.active").removeClass("active");
		sideBar.el.find(`li[data-path="${state.cwd.path}"]`).addClass("active");

		// show status-bar slider only for icons view
		let fileView = defiant.setting("fileView");
		this.iconResizer.css({display: fileView === "icons" ? "block" : "none"});

		window.render({
			path: state.cwd.path,
			template: "sys:fs-fileView",
			target: this.el
		});
	}
};
