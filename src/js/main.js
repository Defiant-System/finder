
let disk;
let defaultPath = window.settings.get("defaultPath");
let view = {
		tab: window.tabs.getActive(),
		history: new window.History
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
		let iconSize = window.settings.get("iconSize");
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
			match: `sys://Settings/Finder/*[@id="sidebar"]`,
			target: this.el.sideBar,
		});

		// auto click toolbar
		window.find(`[data-arg='${window.settings.get("fileView")}']`).trigger("click");

		// temp
		// this.el.contentView.find(".column_:nth-child(1) .ant-file_:nth-child(4)").trigger("click");

		// defiant_.eventHandlers_.doEvent_({
		// 	type: "fs-rename",
		// 	el: this.el.contentView.find(".ant-file_:nth-child(3)"),
		// });

		//setTimeout(() => window.find(`[data-arg='icons']`).trigger("click"), 30);
		//setTimeout(() => this.el.contentView.find(".column_:nth-child(2) .ant-file_:nth-child(4)").trigger("click"), 30);
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
				// render path
				self.dispatch({
					type: "render-path",
					arg: event.path,
				});
				break;
			case "window.open":
				//defiant.shell("win -a");
				break;

			// TAB RELATED EVENTS
			case "active-tab":
				if (view === views[event.el.index()]) return;
				view = views[event.el.index()];
				// update view state
				self.setViewState(true);
				break;
			case "new-tab":
				path = window.settings.get("defaultPath");
				name = window.path.dirname(path);
				tab = window.tabs.add(name);

				views.push({
					tab,
					history: new window.History,
				});
				view = views[tab.index()];
				
				// trigger history state push
				self.dispatch({
					type: "render-path",
					arg: path,
				});
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
				break;
			case "fs-view-render":
				// push to history
				state = {
					cwd: event.path,
					list: event.el.find(".ant-file_").length,
					view: window.settings.get("fileView"),
				};
				if (event.kind) {
					state.kind = event.kind;
				}
				if (state.view === "columns") {
					state.columns = self.el.contentView.find(".column_").map(e => e.getAttribute("data-path"));
				}
				view.history.push(state);

				// update view state
				self.setViewState();
				break;

			// sideBar events
			case "render-path":
			case "get-sidebar-item":
				// update sidebar active
				path = event.arg;
				self.el.sideBar.find(".sidebar-active_").removeClass("sidebar-active_");
				self.el.sideBar.find(`li[data-path="${path}"]`).addClass("sidebar-active_");
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

			// contentView events
			case "select-file-view":
			//	console.log(view.history.current);
				// update setting
				window.settings.set("fileView", event.arg);
				
				// set state and path
				state = view.history.current;
				path = state ? state.cwd : defaultPath;
				// handles file selected
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
				return true;
			case "set-icon-size":
				window.settings.set("iconSize", event.value);
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
		if (state.kind) {
			let column = this.el.contentView.find(".column_:nth-last-child(2)"),
				total = column.find(".ant-file_").length,
				selected = state.kind === "_dir" ? column.find(".ant-file_.file-active").length : 1;
			str = `${selected} of ${total} selected, ${disk.avail} available`;
		}
		window.statusBar.find(".content").text(str);

		// show status-bar slider only for icons view
		this.el.iconResizer.css({display: state.view === "icons" ? "block" : "none"});

		if (render) {
			if (window.settings.get("fileView") !== state.view) {
				this.el.contentView.html("");
			}
			// update setting
			window.settings.set("fileView", state.view);
			// toggle horizontal scroll for columns
			this.el.contentView.toggleClass("view-columns", state.view !== "columns");

			if (state.view === "columns") {
				this.el.contentView.find(`.column_`).map(el => {
					if (!~state.columns.indexOf(el.getAttribute("data-path"))) el.parentNode.removeChild(el);
				});
				// un-active active item
				this.el.contentView.find(".column_:last").find(".ant-file_.file-active_").removeClass("file-active_");
				if (!this.el.contentView.find(".fs-root_").length) {
					this.el.contentView.append(`<div class="fs-root_"></div>`);
				}
				// add missing columns
				state.columns.map(path => {
					let column = this.el.contentView.find(`.column_[data-path="${path}"]`),
						name = path.slice(path.lastIndexOf("/") + 1),
						append = this.el.contentView.find(".fs-root_"),
						left;
					if (!column.length) {
						column = window.render({
							path,
							append: append.length ? append : this.el.contentView,
							template: "sys:fs-fileView",
						});
						// calculate left
						left = column.prop("offsetLeft") + column.prop("offsetWidth") - this.el.contentView.prop("offsetWidth");
						this.el.contentView.prop({"scrollLeft": left});
						
						column = column.prev(".column_");
						if (column.length) {
							column.find(`.name:contains("${name}")`).parent().addClass("file-active_");
						} else {
							this.el.sideBar.find(".sidebar-active_").removeClass("sidebar-active_");
							this.el.sideBar.find(`li[data-path="${path}"]`).addClass("sidebar-active_");
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
