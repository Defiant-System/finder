
class Tabs {
	constructor(spawn) {
		this._spawn = spawn;
		this._stack = {};
		this._active = null;
	}

	add(name) {
		let id = "finder-"+ Date.now(),
			el = this._spawn.tabs.add(name, id),
			history = new window.History;

		this._stack[id] = { el, history };
		this.focus(id);
	}

	remove() {
		this._stack[id] = false;
		delete this._stack[id];
	}

	focus(id) {
		// reference to active tab
		this._active = this._stack[id];
	}

	get history() {
		return this._active.history;
	}

	historyPush(state) {
		this._active.history.push(state);
	}

	historyGo(step) {
		if (step === "-1") this._active.history.goBack();
		else this._active.history.goForward();
	}
}
