const AGENT_WS_URI = "ws://localhost:8083/ws";

export default class AgentWs {

	constructor(actionCallback) {
		this.actionCallback = actionCallback;
	}

	initAgent(settings) {
		let msg = JSON.stringify({
			method: "init_agent",
			settings: settings || [4, 0.2, [1,1], 0]
		});

		this._doSend(msg);
	}

	restartAgent() {
		let msg = JSON.stringify({
			method: "restart_agent"
		});

		this._doSend(msg);
	}

	runAgent(percept) {
		let msg = JSON.stringify({
			method: "run_agent",
			percept: percept
		});

		this._doSend(msg);
	}

	tellAction(action) {
		let msg = JSON.stringify({
			method: "tell_action",
			action: action
		});

		this._doSend(msg);
	}

	connect() {
		let ws = this.ws = this.ws || new WebSocket(AGENT_WS_URI);

		if (!ws || ws.readyState !== ws.OPEN) {
			ws.onopen = this._onOpen.bind(this);
			ws.onclose = this._onClose.bind(this);
			ws.onmessage = this._onMessage.bind(this);
			ws.onerror = this._onError.bind(this);
		}
	}

	close() {
		if (this.socketConnected()) {
			this.ws.close();
		}
	}

	socketConnected() {
		let ws = this.ws;
		return (ws && ws.readyState === ws.OPEN);
	}

	_onOpen(evt) {

	}

	_onClose(evt) {

	}

	_onMessage(evt) {
		var msg = JSON.parse(evt.data);
		if (!msg) {
			console.error('Bad response from the agent');
			return;
		}

		if (typeof msg ===  "string") {
			this.actionCallback(msg);
		}
	}

	_onError(evt) {

	}

	_doSend(message) {
		if (!this.socketConnected()) { return; }
		this.ws.send(message);
	}

	static getInstance() {
		return new WsClient();
	}
}