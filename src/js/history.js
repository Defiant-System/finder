
class History {
	constructor() {
		this.stack = [];
		this.index = -1;
	}
	push(data) {
		this.index++;

		this.stack.splice(this.index);
		this.stack.push(data);
	}
	goBack() {
		if (this.index >= 0) {
			this.index--;
		}
	}
	goForward() {
		if (this.index < this.stack.length - 1) {
			this.index++;
		}
	}
	get current() {
		return this.stack[this.index];
	}
	get canGoBack() {
		return this.index > 0;
	}
	get canGoForward() {
		return this.index < this.stack.length - 1;
	}
}
