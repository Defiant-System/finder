
let finder;
let sidebar;
let disk;
const cwd = {};

let contentView = {
	async init(_finder, _sidebar) {
		// fast and direct references
		finder = _finder;
		sidebar = _sidebar;

		this.type = window.settings("fileView") || "columns";
		this.el = window.el.find("content > div");
		this.content = window.el.find("content");
		this.iconResizer = window.statusBar.find("#icon-resizer");

		disk = await defiant.shell("fs -dh");
		disk = disk.result;

		let iconSize = window.settings("iconSize") || 79;
		this.content.attr({style: `--icon-size: ${iconSize}px`});
		this.iconResizer.val(iconSize);

		// bind event listener to input:range in statusbar
		this.iconResizer.on("input", this.dispatch);
	},
	async dispatch(event) {
		let self = contentView,
			target,
			file,
			isDir,
			el,
			pEl,
			name,
			path,
			template,
			fileView;

		switch (event.type) {
			case "input":
				window.settings("iconSize", this.value);
				self.content.attr({style: `--icon-size: ${this.value}px`});
				break;
			case "open-folder":
				cwd.path = event.path;
				await this.setCwd(cwd.path);
				// toolbar
				window.find("[data-arg='"+ this.type +"']").trigger("click");

			//	setTimeout(() => {
			//		// temp
			//		self.content.find(".file:nth(5) span").trigger("click");
			//	}, 300);
				break;
			case "select-file-view":
				fileView = event.arg;
				// update setting
				window.settings("fileView", fileView);

				this.el.prop({"className": "view-"+ fileView});
				this.renderPath(cwd.path);

				// toolbar UI update
				el = window.find("[data-arg='"+ fileView +"']");
				el.parent().find(".toolbar-active_").removeClass("toolbar-active_");
				el.addClass("toolbar-active_");

				// show status-bar slider only for icons view
				window.statusBar.toggleClass("showSlider", fileView !== "icons");
				break;
			case "select-icon-file":
				target = $(event.target);
				file = target.parents(".file:first");

				if (target.attr("data-click") === event.type) {
					target.find(".active").removeClass("active");
				}
				if (!file.length || file.hasClass("active")) return;
				
				file.parents().find(".active").removeClass("active");
				file.addClass("active");
				break;
			case "select-list-file":
				target = $(event.target);
				file = target.parents(".file:first");

				if (target.attr("data-click") === event.type) {
					target.find(".active").removeClass("active");
				}
				if (!file.length || file.hasClass("active")) return;
				
				file.parents(".list-body:first").find(".active").removeClass("active");
				file.addClass("active");
				break;
			case "select-column-file":
				target = $(event.target);
				file = target.parents(".file:first");
				isDir = file.attr("data-kind") === "_dir";

				if (target.attr("data-click") === event.type) {
					target.nextAll(".column").remove();
					target.find(".active").removeClass("active");

					// update status-bar
					this.updateStatusBar(`${cwd.list.length} items, ${disk.avail} available`);
				}
				if (!file.length || file.hasClass("active")) return;
				
				pEl = file.parents(".column:first");
				pEl.nextAll(".column").remove();
				pEl.find(".active").removeClass("active");
				file.addClass("active");

				name = file.find("span.name").text();
				path = pEl.attr("data-path") +"/"+ name;
				template = isDir ? "fileView" : "filePreview"

				if (file.attr("data-link")) {
					let linkPath = await defiant.shell(`fs -j "${pEl.attr("data-path")}" "${file.attr("data-link")}"`);
					path = "/"+ linkPath.result;
				}
				
				if (isDir) {
					// make sure folder contents is loaded
					await defiant.shell(`fs -r "${path}"`);

					// set current working directory
					this.setCwd(path);

					// update status-bar
					this.updateStatusBar(`${cwd.list.length} items, ${disk.avail} available`);
				} else {
					// update status-bar
					this.updateStatusBar(`1 of ${cwd.list.length} selected, ${disk.avail} available`);
				}

				const newColumn = window.render({
					template,
					path,
					append: this.el
				});

				// auto-scroll content
				const left = newColumn.prop("offsetLeft") + newColumn.prop("offsetWidth") - this.el.prop("offsetWidth");
				this.el.prop({"scrollLeft": left});

				target = newColumn.find(".preview-text");
				if (target.length) {
					file = await defiant.shell(`fs -p '${target.attr("data-path")}'`);
					target.html(file.result.text);
				}
				break;
			case "open-icon-file":
			case "open-list-file":
				target = $(event.target);
				file = target.parents(".file:first");
				pEl = file.parents("[data-path]:first");
				path = pEl.attr("data-path") +"/"+ file.find("span.name").text();

				if (file.attr("data-kind") === "_dir") {
					await this.renderPath(path);
				} else {
					await defiant.shell(`fs -o '${path}'`);
				}
				break;
			case "open-column-file":
				target = $(event.target);
				file = target.parents(".file:first");

				if (file.attr("data-kind") !== "_dir") {
					path = event.el.attr("data-path") +"/"+ event.target.textContent;
					await defiant.shell(`fs -o '${path}'`);
				}
				break;
			case "list-toggle-folder":
				target = $(event.target);
				file = target.parents(".file:first");
				pEl = file.parents("[data-path]:first");
				path = pEl.attr("data-path") +"/"+ file.find("span.name").text();

				const arrow = file.find(".arrow-right:first");
				const isExpanded = arrow.hasClass("down");
				let subList = file.next(".subList");

				arrow.toggleClass("down", isExpanded);

				if (subList.length) {
					subList.addClass("collapse");
					setTimeout(() => {subList.remove()}, 500);
				} else {
					// make sure folder contents is loaded
					await defiant.shell(`fs -r "${path}"`);

					subList = window.render({
						template: "fileView-list-with-wrapper",
						path,
						after: file
					});
				}
				break;
			case "sort-file-view-by":
				target = $(event.target);
				let sortSelect = target.attr("data-sort");
				let sortType = target.attr("data-type");
				let sortOrder = event.el.attr("data-order");
				
				if (target.hasClass("active")) {
					sortOrder = sortOrder === "ascending" ? "descending" : "ascending";
				}
				
				target.parent().find(".active").removeClass("active");
				target.addClass("active");
				event.el.attr({"data-order": sortOrder});

				window.render({
					sortSelect,
					sortOrder,
					sortType,
					sortNodeXpath: "//xsl:sort[2]",
					template: "fileView-list",
					path: cwd.path,
					target: this.el.find(".list-body")
				});
				break;
		}
	},
	updateStatusBar(str) {
		window.statusBar.find(".content").text(str);
	},
	async setCwd(path) {
		cwd.path = path;

		const shell = await defiant.shell(`fs -l '${path}'`);
		cwd.list = shell.result;
	},
	async renderPath(path) {
		// make sure folder contents is loaded
		await defiant.shell(`fs -r '${path}'`);

		// set current working directory is saved
		await this.setCwd(path);
		window.render({
			path,
			template: "fileView",
			target: this.el
		});

		// update status-bar
		const str = `${cwd.list.length} items, ${disk.avail} available`;
		window.statusBar.find(".content").text(str);

		// temp
		//window.find(".file:nth-child(7) .name").trigger("click");
	}
};

export default contentView;
