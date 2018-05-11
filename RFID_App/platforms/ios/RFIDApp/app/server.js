const client = require('socket.io').listen(4000).sockets;

connections = [];

console.log("server running");

var Drug = require("./mongo-node/mongo-node");
var mongoose = require("mongoose");

mongoose.connect('mongodb://127.0.0.1:27017/medication', function (err) {
    if (err) {
        throw err;
    }
    console.log("MongoDB connected");

    //connect to socket.io
    client.on('connection', function (socket) {
        console.log('client connected: ' + socket.id);
        Drug.find(function (err, drugs) {
            if (err) {
                socket.emit(err);
            }
            console.log("getting drug from mongoDB and sending to client: "+drugs);
            // socket.emit('output', JSON.stringify(drugs));
            socket.emit('output', drugs);

        });
        socket.on("disconnect", function (data) {
            connections.splice(connections.indexOf(socket), 1);
            console.log("disconnected: %s sockets connected", connections.length);
        });
    });
});
