const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
// create a peer server
const { ExpressPeerServer } = require("peer");

const peerServer = ExpressPeerServer(server, {
  debug: true,
});

// create a uuid for our room
const { v4: uuidv4 } = require("uuid");

// use peerjs route to get peerServer
app.use("/peerjs", peerServer);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});
// connection to socket
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    socket.on("chatmessage", (message) => {
      io.to(roomId).emit("servermessage", message);
    });
  });
});
server.listen(3000);
