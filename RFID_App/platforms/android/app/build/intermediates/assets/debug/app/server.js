const client = require('socket.io').listen(3000).sockets;

connections = [];

console.log("server running");

var Drug = require("./mongo-node/mongo-node");
var mongoose = require("mongoose");


setTimeout(function () {
    mongoose.connect('mongodb://169.254.1.4:27017/medication', function (err) {
    // mongoose.connect('mongodb://127.0.0.1:27017/medication', function (err) {

        if (err) {
            throw err;
        }
        console.log("MongoDB connected");

        //connect to socket.io
        client.on('connection', function (socket) {
            //create function to send status
            console.log('client connected: ' + socket.id);
            Drug.find(function (err, drugs) {
                if (err) {
                    socket.emit(err);
                }
                console.log("getting drug from mongoDB and sending to client: " + drugs);
                socket.emit('output', drugs);
            });
            socket.on("administer", function (data) {
                var id = data.id;
                var event = data.event;

                console.log("event: " + event + " id: " + id);
                if (id == '' || event == '') {
                    console.log("nothing");
                } else {
                    //2.sending updated drug back to client
                    Drug.findOneAndUpdate({ id: id }, { $set: { event: "administered to patient" } }, function (err, doc) {
                        if (err) {
                            console.log("something wrong when updating data!");
                        }
                        console.log(doc);
                    });
                }
            });
            socket.on("disconnect", function (data) {
                connections.splice(connections.indexOf(socket), 1);
                console.log("disconnected: %s sockets connected", connections.length);
            });
        });
    });
}, 2500)