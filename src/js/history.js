
class HistoryItem {
	constructor(perform, data) {
		this.perform = perform;
		this.data = data;
	}
}

/**
 * UndoStack#push (action, data);
 * perform(true, data)  -> Function which performs redo based on previous state
 * perform(false, data) -> Function which performs undo based on current state
 * data -> Argument passed to undo/redo functions
 **/
class History {
	constructor() {
		this.stack = [];
		this.current = -1;
	}
	push(perform, data) {
		this.current++;

		// We need to invalidate all undo items after this new one
		// or people are going to be very confused.
		this.stack.splice(this.current);
		this.stack.push(new HistoryItem(perform, data));
	}
	goBack() {
		var item;

		if (this.current >= 0) {
			item = this.stack[this.current];
			item.perform.call({}, false, item.data);
			this.current--;
		} else {
			throw new Error("Already at oldest change");
		}
	}
	goForward() {
		var item;

		item = this.stack[this.current + 1];
		if (item) {
			item.perform.call({}, true, item.data);
			this.current++;
		} else {
			throw new Error("Already at newest change");
		}
	}
	get canGoBack() {
		return this.current > 0;
	}
	get canGoForward() {
		return this.current < this.stack.length - 1;
	}
}
