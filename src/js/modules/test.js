
let Test = {
	init(APP, spawn) {
		return;
		setTimeout(() => spawn.find(`.ant-file_:nth(10)`).trigger("click"), 400);
		
		
		// setTimeout(() => {}, 2000);
		spawn.dialog.open({
			txt: fsItem => console.log(fsItem),
			md: fsItem => console.log(fsItem),
		});
		// window.dialog.save(Tabs.active.file, Tabs.active.file.toBlob());

		// setTimeout(() => spawn.dialog.alert("test"), 100);

		// temp
		// setTimeout(() => Spawn.find(`.ant-file_:nth(10)`).trigger("click"), 100);
		// setTimeout(() => Spawn.find(`.ant-file_:nth(16)`).trigger("click"), 200);
		// setTimeout(() => Spawn.find(`.toolbar-tool_[data-arg="-1"]`).trigger("click"), 500);
		
		// setTimeout(() => Spawn.find(`.toolbar-tool_[data-arg="icons"]`).trigger("click"), 500);
		// setTimeout(() => Spawn.find(`.toolbar-tool_[data-arg="columns"]`).trigger("click"), 1200);
	}
};
