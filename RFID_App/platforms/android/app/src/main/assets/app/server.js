var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users = [];
connections = [];

console.log("server running");

var Drug = require("./mongo-node/mongo-node");
var mongoose = require("mongoose");
mongoose.connect('mongodb://127.0.0.1:27017/medication');

app.get('/', (req, res) => {
    Drug.find(function (err, drugs) {
        if (err) {
            res.send(err);
        }
        res.io.emit("socketToMe", "drugs");
        // console.log(drugs);
        res.send("sending drugs");
        // res.send(drugs);
    });
});
server.listen(process.env.PORT || 3000);

app.use(function (req, res, next) {
    res.io = io;
    next();
});


//open sockets connection 
io.sockets.on("connection", (socket) => {
    connections.push(socket);
    console.log("connected: %s socket", connections.length);

    //send message to client every second continuously
    // setInterval(function () { socket.emit('message', { 'message': 'Hello World' }); }
    //     , 1000);

    //disconnect
    socket.on("disconnect", function (data) {
        connections.splice(connections.indexOf(socket), 1);
        console.log("disconnected: %s sockets", connections.length);
    });
});


console.error('socket.io error');