import WebSocket, { WebSocketServer } from "ws";

class WebSocketServerExt extends WebSocketServer {
  /**
   * 
   * @param {WebSocket.ServerOptions | undefined} options 
   * @param {(() => void) | undefined} callback 
   */
  constructor(options = undefined, callback = undefined) {
    super(options, callback);
  }
  broadcast = (msg) => {
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  };
}

const wss = new WebSocketServerExt({
  port: 8080,
  clientTracking: true,
  path: "/chat",

});

const msgHTML = (messageText) => `<p>${messageText}<p>`;

wss.on("connection", (wsClient, req) => {
  wss.broadcast(msgHTML(`${wss.clients.size} clients online`))
  wsClient.on("message", (data) => {
    const strData = data.toString();
    console.log(`<<< ${strData}`);
    console.log(`>>> ${msgHTML(strData)}`);
    wss.broadcast(msgHTML(strData));
  });
});
