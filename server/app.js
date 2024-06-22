import http from "node:http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
const PORT = 1234;
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors({ origin: ["http://localhost:5173"] }));
const httpServer = http.createServer(app);

const roomToUserMap = new Map();
const socket = new Server(httpServer, {
  cors: { origin: ["http://localhost:5173"] },
});

app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"));
});
app.get("/ping", (req, res) => {
  res.send("PONG");
});
socket.on("connection", (io) => {
  io.on("join-room", (data) => {
    const room = roomToUserMap.get(data.roomId);
    if (room && !room?.find((user) => io.id === user.id))
      room.push({ ...data, id: io.id });
    else roomToUserMap.set(data.roomId, [{ ...data, id: io.id }]);
    io.join(data.roomId);

    io.emit("user-joined", room);
    console.log(room);
    io.to(data.roomId).emit("user-joined", room);
  });

  io.on("file-chunk", (data) => {
    io.to(data.roomId).emit("collect-file", data);
    console.log(data);
  });

  io.on("file-end", (data) => {
    io.to(data.roomId).emit("save-file", data);
  });
});
httpServer.listen(PORT, () => {
  console.log("server is connected http://localhost:%d", PORT);
});
