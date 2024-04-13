import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({
  port: 8080,
  clientTracking: true,
  path: "/chat",
});

wss.on("connection", (wsClient, req) => {
  const connectedMsg = `${req.socket.remoteAddress} connected`;
  console.log(connectedMsg);
  wss.clients.forEach((e) => e.send(connectedMsg));
  wsClient.on("message", (data) => {
    const strData = data.toString();
    console.log(`<<< ${strData}`);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(strData);
      }
    });
  });
});
