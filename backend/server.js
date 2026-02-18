import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./src/config/db.js";
import { autoCancelOldOrders } from "./src/jobs/autoCancelOrders.js";
import { remindPendingPayments } from "./src/jobs/remindPendingPayments.js";
import { autoCompleteOrders } from "./src/jobs/autoComplete.js";

const server = http.createServer(app);

export const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join", ({ userId, role }) => {
    socket.join(`${role}:${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  await connectDB();

  setInterval(autoCancelOldOrders, 5 * 60 * 1000);
  await remindPendingPayments();
  setInterval(remindPendingPayments, 30 * 60 * 1000);
  setInterval(autoCompleteOrders, 5 * 60 * 1000);

  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer().catch((error) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});
