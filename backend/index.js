const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

const httpServer = app.listen(PORT);
const jwt = require('jsonwebtoken');
const { sendFriendRequest, makeFriend, storeMessages } = require('./DatabaseFuctions/userFunctions');

const SECRET_KEY = process.env.SECRET_KEY;

app.use('/images', express.static('images'))
app.use(cors(
    {
        origin: 'http://localhost:5173'
    }
));
app.use(express.json());
require('./database/connectdb');

const auth = require('./Routes/authenticate/auth');
app.use('/auth', auth);

const userRoute = require('./Routes/User/userRoute');
app.use('/user', userRoute);

const postRoute = require('./Routes/post');
app.use('/post', postRoute);


const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket, req) => {
    socket.emit("message", "Connected...");

    console.log(socket.user);

    socket.join(socket.user.id);
    // each user will also join chat room
    socket.join("chat-room");

    socket.on('typing', (data) => {
        console.log('typing');
        socket.to(data.receiver).emit('typing', {});
    })

    socket.on('message-from-client', async (data) => {
        // now we have received a message from client
        // store this message to database and then send this message to client
        const result = await storeMessages(socket.user.id, data.receiver, data.message);
        // console.log(data);
        // console.log(result);
        console.log(data.receiver, socket.user.id);
        socket.to(data.receiver).emit("message-from-server", data);
        console.log(data);
    });

    // send the friend Request from one person to another in the real time
    socket.on('sendFriendRequest', async (data) => {
        console.log("This is the friend request");

        const message = await sendFriendRequest(socket.user.id, data.receiverId);
        io.to(socket.user.id).emit("sendFriendRequestReply", message);
        // console.log(message, socket.user.id);
    });

    socket.on("disconnect", () => {
        console.log("The user has been disconnected");
    })

    const clients = io.sockets.sockets;

    const connected_clients = [];
    clients.forEach((client) => {
        if (connected_clients.find((c) => {
            return c.id === client.user.id;
        })) { }
        else
            connected_clients.push(client.user);
    })

    // send name, id, profile picture of each user when the new user is connected

    io.emit("online-users", { connected_clients, "message": "This is the list of connected users" });
    console.log(connected_clients.length);
});

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    console.log("This is middleware of message");
    if (token) {
        const user = jwt.verify(token, SECRET_KEY)
        socket.user = user;
    }
    next();
})


