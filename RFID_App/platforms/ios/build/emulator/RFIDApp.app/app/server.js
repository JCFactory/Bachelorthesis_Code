var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users = [];
connections = [];
server.listen(process.env.PORT || 3000);

console.log("server running");

var Drug = require("./mongo-node/mongo-node");
var mongoose = require("mongoose");
mongoose.connect('mongodb://127.0.0.1:27017/medication');

app.get('/', function (req, res) {
    Drug.find(function (err, drugs) {
        if (err) {
            res.send(err);
        }
        res.send(drugs);
    });
});

io.sockets.on("connections", function(socket){
    connections.push(socket);
    console.log("connected: %s socket connected", connections.length);

    //disconnect
    socket.on("disconnect", function(data){
        connections.splice(connections.indexOf(socket), 1);
        console.log("disconnected: %s sockets connected", connections.length);
    });
});
