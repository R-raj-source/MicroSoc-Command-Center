// socket.js
// ─────────────────────────────────────────────────────────────
// Singleton Socket.io instance
//
// WHY a singleton?
// Socket.io server must be created once and attached to the HTTP server.
// logGenerator.js and threatEngine.js both need to EMIT events on it.
// If we imported socket.io in each file separately, they'd create
// different instances that don't share connections.
//
// Solution: create the io instance here, export getIO() everywhere.
// ─────────────────────────────────────────────────────────────
import { Server } from "socket.io";

let io; // the single shared instance

// Called once in index.js after app.listen() returns the http server
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`⚡ Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  console.log("✅ Socket.io initialized");
  return io;
};

// Called in logGenerator.js and threatEngine.js to emit events
export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized — call initSocket() first");
  return io;
};
