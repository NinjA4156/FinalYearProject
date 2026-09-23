const express = require("express");
const { Server } = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("./static"));

let count = 0;

io.on("connection", (socket) => {
    count++;
    console.log("a user connected", socket.id);

    io.emit("user-count", count)

    socket.on("joinRoom", (data) => { //Event to join room in socket.io
        socket.join(data.room)
        console.log(data.name, "joined the room", data.room)
    })

    socket.on("msgRoom", (data) => { //Event to send message in room in socket.io 
        // socket.to(data.room).emit("Message", data.name) //This will not send the message to the sender
        io.to(data.room).emit("Message", data.name) //This will send the message to all the clients in the room including the sender
        console.log(data.name, "send message to the room", data.room)
    })

    socket.on("clickHere", (data) => {
        console.log("User is clicking the button", data.name)
        // io.emit("Message", data.name) //Sends data to all the clients connected including the sender
        // socket.emit("Message", data.name) //Sends data to only in current socket
        // socket.broadcast.emit("Message", data.name) //It send data to all connected client expect the sender
    })

    socket.on("disconnect", () => {
        count--;
        io.emit("user-count", count)
    })

})

server.listen(3000, () => {
    console.log("Server started on port 3000");
})
