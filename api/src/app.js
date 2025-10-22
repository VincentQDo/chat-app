import http from "http";
import createWebsocketServer from "./websocket-server.js";
import createExpressApp from "./express-server.js";

const API_KEY = process.env.API_KEY || "";
if (!API_KEY) {
  console.warn("[WARN] No API_KEY set in environment variables.");
  throw new Error("API_KEY is required");
}
const baseURL = process.env.DB_URL || "http://localhost:8000";

// Define a simple route for HTTP
// Create an HTTP server
const server = http.createServer(createExpressApp(baseURL, API_KEY));
const io = createWebsocketServer(baseURL, API_KEY);
io.attach(server);

let HOST = "0.0.0.0";
let PORT = 8080;
// Start the HTTP server
server.listen(PORT, HOST, () => {
  console.log(`Network: http://${HOST}:${PORT}`);
});
