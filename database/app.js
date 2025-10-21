import express from "express";
import messageRouter from "./routes/messages.js";
import roomsRouter from "./routes/rooms.js";

const app = express();
const PORT = process.env.PORT || 8000;
const API_KEY = process.env.API_KEY || "";
if (process.env.NODE_ENV !== "production") {
  console.log("API_KEY:", API_KEY); // --- IGNORE ---
}

app.use(express.json());

app.use((req, res, next) => {
  const apiKey = req.header("x-api-key");
  if (API_KEY && apiKey !== API_KEY) {
    console.error("Unauthorized access attempt detected", {
      providedKey: apiKey,
      origin: req.headers.origin || "unknown",
      referer: req.headers.referer || "unknown",
      ip: req.headers["cf-connecting-ip"] || req.ip || "unknown",
      originIp: req.headers["x-forwarded-for"] || "unknown",
      userAgent: req.headers["user-agent"] || "unknown",
      at: new Date().toISOString(),
    });
    return res.status(401).json({ error: "Unauthorized" });
  }
  console.error("Authorized request", {
    origin: req.headers.origin || "unknown",
    referer: req.headers.referer || "unknown",
    ip: req.headers["cf-connecting-ip"] || req.ip || "unknown",
    originIp: req.headers["x-forwarded-for"] || "unknown",
    userAgent: req.headers["user-agent"] || "unknown",
    at: new Date().toISOString(),
  });
  next();
});

app.use("/messages", messageRouter);
app.use("/rooms", roomsRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
