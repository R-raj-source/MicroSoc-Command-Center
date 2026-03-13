// index.js
import http from "http";           // ← Node's built-in HTTP module
import app from "./app.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import { initSocket } from "./socket.js";       // ← NEW
import { startLogGenerator } from "./controllers/logGenerator.js";
import classifyLog from "./controllers/threatEngine.js";

dotenv.config();

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();

    // ─────────────────────────────────────────────────────────
    // WHY http.createServer(app) instead of app.listen()?
    //
    // Socket.io needs access to the raw Node HTTP server object
    // to attach its WebSocket upgrade handler.
    // app.listen() creates an HTTP server internally but doesn't
    // return it in a way Socket.io can use.
    // http.createServer(app) gives us the server object explicitly.
    // ─────────────────────────────────────────────────────────
    const httpServer = http.createServer(app);

    // Initialize Socket.io and attach it to the HTTP server
    initSocket(httpServer);                      // ← NEW

    // Start listening — httpServer instead of app.listen
    httpServer.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });

    // Start log generator — fires every 5 seconds
    startLogGenerator(5000);

    // Run threat engine — fires every 3 seconds
    setInterval(classifyLog, 3000);

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
