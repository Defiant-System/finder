
ant_require("./history.js");

let disk;
let defaultPath = defiant.setting("defaultPath");
let view = {
		tab: window.tabs.getActive(),
		history: new History
	};
let views = [view];

const finder = {
	el: {},
	async init() {
		// fast references
		this.el.sideBar = window.el.find("sidebar");
		this.el.contentView = window.el.find("content > div");
		this.el.iconResizer = window.find(".icon-resizer");
		this.el.btnPrev = window.find("[data-click='history-go'][data-arg='-1']");
		this.el.btnNext = window.find("[data-click='history-go'][data-arg='1']");

		// initial value for icon resizer
		let iconSize = defiant.setting("iconSize");
		this.el.contentView.attr({style: `--icon-size: ${iconSize}px`});
		this.el.iconResizer.val(iconSize);

		// disk info
		if (!disk) {
			disk = await defiant.shell("fs -ih");
			disk = disk.result;
		}

		// render sidebar
		window.render({
			template: "sys:fs-sideBar",
			match: `//Settings/Finder/*[@id="sidebar"]`,
			target: this.el.sideBar,
		});

		// auto click toolbar
		window.find(`[data-arg='${defiant.setting("fileView")}']`).trigger("click");

		// temp
		this.el.contentView.find(".column:nth-child(1) .file:nth-child(2)").trigger("click");
		//setTimeout(() => window.find(`[data-arg='icons']`).trigger("click"), 30);
		//setTimeout(() => this.el.contentView.find(".column:nth-child(2) .file:nth-child(4)").trigger("click"), 30);
	},
	dispatch(event) {
		let self = finder,
			pEl,
			el,
			clone,
			tab,
			name,
			state,
			path;
		//console.log(event);
		switch (event.type) {
			case "open.file":
				break;

			// TAB RELATED EVENTS
			case "active-tab":
				view = views[event.el.index()];
				break;
			case "new-tab":
				/*
				path = defiant.setting("defaultPath");
				name = window.path.dirname();
				tab = window.tabs.add(name);

				views.push({
					tab,
					history: new History(path),
					cwd: { path, list: [] }
				});
				view = views[tab.index()];
				contentView.renderPath();
				*/
				break;
			case "close-tab":
				// remove view from views array
				views.splice(event.el.index(), 1);
				break;
			case "close-active-tab":
				window.tabs.close(view.tab);
				break;

			// CLONE WINDOW RELATED EVENTS
			case "new-clone-window":
				//clone = window.clone();
				break;
			case "close-clone-window":
				break;

			case "history-go":
				if (event.arg === "-1") view.history.goBack();
				else view.history.goForward();

				// update view state
				self.setViewState(true);
				return 1;
			case "fs-view-render":
				// push to history
				state = {
					cwd: event.path,
					list: event.el.find(".file").length,
					view: defiant.setting("fileView"),
				};
				if (event.kind) state.kind = event.kind;
				if (state.view === "columns") {
					state.columns = self.el.contentView.find(".column").map(e => e.getAttribute("data-path"));
				}
				view.history.push(state);

				// update view state
				self.setViewState();
				break;

			// sideBar events
			case "get-sidebar-item":
				// render content view
				path = event.arg;
				window.render({
					path,
					template: "sys:fs-fileView",
					target: self.el.contentView
				});

				// trigger history state push
				self.dispatch({
					path,
					type: "fs-view-render",
					el: self.el.contentView,
				});
				break;

			// contentView events
			case "select-file-view":
			//	console.log(view.history.current);
				// update setting
				defiant.setting("fileView", event.arg);
				// toggle horizontal scroll for columns
				self.el.contentView.toggleClass("view-columns", event.arg !== "columns");

				// set state and path
				state = view.history.current;
				path = state ? state.cwd : defaultPath;
				
				if (state && state.kind) {
					state = view.history.stack[view.history.index-1];
					path = state.cwd;
				}

				// render content view
				window.render({
					path,
					template: "sys:fs-fileView",
					target: self.el.contentView
				});

				// trigger history state push
				self.dispatch({
					path,
					type: "fs-view-render",
					el: self.el.contentView,
				});
				break;
			case "set-icon-size":
				defiant.setting("iconSize", event.value);
				self.el.contentView.attr({style: `--icon-size: ${event.value}px`});
				break;
		}
	},
	setViewState(render) {
		let state = view.history.current;
		// update window title
		window.title = window.path.dirname(state.cwd);

		// toolbar UI update
		this.el.btnPrev.toggleClass("tool-disabled_", view.history.canGoBack);
		this.el.btnNext.toggleClass("tool-disabled_", view.history.canGoForward);

		// auto click toolbar
		let viewTool = window.find(`[data-arg='${state.view}']`);
		viewTool.parent().find(".tool-active_").removeClass("tool-active_");
		viewTool.addClass("tool-active_");

		// update status-bar
		let str = `${state.list} items, ${disk.avail} available`;
		window.statusBar.find(".content").text(str);

		// show status-bar slider only for icons view
		this.el.iconResizer.css({display: state.view === "icons" ? "block" : "none"});

		if (render) {
			if (defiant.setting("fileView") !== state.view) {
				this.el.contentView.html("");
			}
			// update setting
			defiant.setting("fileView", state.view);
			// toggle horizontal scroll for columns
			this.el.contentView.toggleClass("view-columns", state.view !== "columns");

			if (state.view === "columns") {
				this.el.contentView.find(`.column`).map(el => {
					if (!~state.columns.indexOf(el.getAttribute("data-path"))) el.parentNode.removeChild(el);
				});
				// un-active active item
				this.el.contentView.find(".column:last").find(".file.active").removeClass("active");
				// add missing columns
				state.columns.map(path => {
					let column = this.el.contentView.find(`.column[data-path="${path}"]`),
						name = path.slice(path.lastIndexOf("/") + 1),
						left;
					if (!column.length) {
						column = window.render({
							path,
							template: "sys:fs-fileView",
							append: this.el.contentView
						});
						// calculate left
						left = column.prop("offsetLeft") + column.prop("offsetWidth") - this.el.contentView.prop("offsetWidth");
						this.el.contentView.prop({"scrollLeft": left});
						
						column = column.prev(".column");
						if (column.length) {
							column.find(`.name:contains("${name}")`).parent().addClass("active");
						} else {
							this.el.sideBar.find(".active").removeClass("active");
							this.el.sideBar.find(`li[data-path="${path}"]`).addClass("active");
						}
					}
				});
			} else {
				window.render({
					path: state.cwd,
					template: "sys:fs-fileView",
					target: this.el.contentView
				});
			}
		}
	}
};

window.exports = finder;
