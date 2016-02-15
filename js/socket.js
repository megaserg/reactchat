import {EventEmitter} from "events";

class Socket {
  constructor(ws = new WebSocket(), ee = new EventEmitter()) {
    this.ws = ws;
    this.ee = ee;
    ws.onmessage = this.onReceiveMessageFromServer.bind(this);
    ws.onopen = this.onSocketOpen.bind(this);
    ws.onclose = this.onSocketClose.bind(this);
  }

  whenServerSays(name, callback) {
    this.ee.on(name, callback);
  }
  stopListeningToServer(name, callback) {
    this.ee.removeListener(name, callback);
  }
  sendMessageToServer(name, data) {
    const message = JSON.stringify({name, data});
    this.ws.send(message);
  }

  onReceiveMessageFromServer(e) {
    try {
      console.log("received data: " + e.data);
      const message = JSON.parse(e.data);
      this.ee.emit(message.name, message.data);
    } catch (err) {
      this.ee.emit("error", err);
    }
  }
  onSocketOpen() {
    this.ee.emit("connect");
  }
  onSocketClose() {
    this.ee.emit("disconnect");
  }
}

export default Socket;
