import WebSocket, { WebSocketServer } from "ws";

class WebSocketServerExt extends WebSocketServer {
  /**
   *
   * @param {WebSocket.ServerOptions | undefined} options
   * @param {(() => void) | undefined} callback
   */
  constructor(options = undefined, callback = undefined) {
    super(options, callback);
    console.log(`Websocket server listening on: `, options.port)
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
  wsClient.isAuthenticated = false;
  wss.broadcast(msgHTML(`${wss.clients.size} clients online`));
  wsClient.on("message", (data) => {
    console.log("is user authenticated: ", wsClient.isAuthenticated);
    if (!wsClient.isAuthenticated) {
      console.log("authenticating user");
      const jsonData = JSON.parse(data.toString());
      console.log(jsonData)
      if (jsonData.userName === "Anna" || jsonData.userName === "Vince") {
        wsClient.isAuthenticated = true;
        wsClient.userName = jsonData.userName;
        return wsClient.send("Successfully authenticated ", wsClient.userName);
      } else {
        wsClient.send("Failed to authenticate");
        return wsClient.terminate();
      }
    }
    const strData = wsClient.userName + ':' + data.toString();
    console.log(`<<< ${strData}`);
    console.log(`>>> ${msgHTML(strData)}`);
    wss.broadcast(msgHTML(strData));
  });
});
