const client = require('socket.io').listen(3000).sockets;

connections = [];

console.log("server running");

var Drug = require("./mongo-node/mongo-node");
var mongoose = require("mongoose");


// mongoose.connect('mongodb://169.254.1.2:27017/medication', function (err) {
// mongoose.connect('mongodb://127.0.0.1:27017/medication', function (err) {
// setTimeout(function () {
// setInterval(function () {
mongoose.connect('mongodb://192.168.1.64:27017/medication', function (err) {
    if (err) {
        throw err;
    }

    console.log("connected to mongodb");
    //connect to socket.io
    //getting all drugs and disconnect client
    client.on('connection', function (socket) {
        console.log('client connected: ' + socket.id);
        Drug.find(function (err, drugs) {
            if (err) {
                socket.emit(err);
            }
            console.log("getting drug from mongoDB and sending to client: " + drugs);
            socket.emit('output', drugs);
        });

        socket.on("disconnect", function (data) {
            connections.splice(connections.indexOf(socket), 1);
            console.log("disconnected: %s sockets connected", connections.length);
        });
    });
//client connect second time, to administer drug
    client.on('connection', function (socket) {
        socket.on("administer", function (itemName) {
            // //2.sending updated drug back to client
            Drug.findOneAndUpdate({ name: itemName }, { event: "administered to patient" }, {
                upsert: true,
                new: true,
                // overwrite: true,
            }, function (err, doc) {
                if (err) {
                    socket.emit(err);
                    console.log("something wrong when updating data!");
                }
                socket.emit('updated', doc);
                console.log(doc);
            });
        });
        socket.on("disconnect", function (data) {
            connections.splice(connections.indexOf(socket), 1);
            console.log("disconnected: %s sockets connected", connections.length);
        });
    });

});
