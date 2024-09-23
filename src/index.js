import dotenv from "dotenv";
import connectDB from "./db/db.js";
import { app } from "./app.js";
import { createServer } from "http"; // Import HTTP server creation method
import { Server } from "socket.io"; // Import socket.io server

dotenv.config({ path: "./.env" });

const httpServer = createServer(app); // Create an HTTP server with Express app

// Initialize Socket.io server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle task-related real-time events
  socket.on("taskUpdated", (task) => {
    io.emit("taskUpdated", task); // Broadcast updated task to all clients
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// cronJobs();
connectDB()
  .then(() => {
    httpServer.listen(process.env.PORT || 8001, () => {
      console.log(`Server started on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => console.log("MongoDB connection failed:", err.message));
