
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
	constructor(self) {
		this.stack = [];
		this.current = -1;
		this.self = self;
	}
	push(perform, data) {
		this.current++;

		// We need to invalidate all undo items after this new one
		// or people are going to be very confused.
		this.stack.splice(this.current);
		this.stack.push(new HistoryItem(perform, data));
	}
	undo() {
		var item;

		if (this.current >= 0) {
			item = this.stack[this.current];
			item.perform.call(this.self, false, item.data);
			this.current--;
		} else {
			throw new Error("Already at oldest change");
		}
	}
	redo() {
		var item;

		item = this.stack[this.current + 1];
		if (item) {
			item.perform.call(this.self, true, item.data);
			this.current++;
		} else {
			throw new Error("Already at newest change");
		}
	}
	get canUndo() {
		return this.current >= 0;
	}
	get canRedo() {
		return this.current < this.stack.length - 1;
	}
	invalidateAll() {
		this.stack = [];
		this.current = -1;
	}
}
