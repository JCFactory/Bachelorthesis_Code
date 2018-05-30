const client = require('socket.io').listen(3000).sockets;

connections = [];

console.log("server running");

var Drug = require("./mongo-node/mongo-node");
var mongoose = require("mongoose");


// setTimeout(function () {
mongoose.connect('mongodb://127.0.0.1:27017/medication', function (err) {
    if (err) {
        throw err;
    }
    console.log("MongoDB connected");

    //connect to socket.io
    client.on('connection', function (socket) {

        //create function to send status
        sendStatus = function (s) {
            socket.emit('status', s);
        }

        console.log('client connected: ' + socket.id);
        Drug.find(function (err, drugs) {
            if (err) {
                socket.emit(err);
            }
            console.log("getting drug from mongoDB and sending to client: " + drugs);
            socket.emit('output', drugs);
        });

        socket.on("administer", function (data) {
            let id = data.thisID;
            let event = data.eventData;
            if (id == '' || event == '') {
                sendStatus('No id or event found.');
            } else {
                //update drug information and emit/send the updated information back to client
                Drug.findByIdAndUpdate({ id: id, update: event }, function () {
                    client.emit('update', [data]);
                    //send status object
                    sendStatus({
                        event: 'Event sent',
                        clear: true
                    });
                });
            }
        });

        //handle clear/cancel button
        socket.on('clear', function (data) {
            let id = data.id;
            let event = "Not administered";
            Drug.findByIdAndUpdate({ id: id, update: event }, function () {
                socket.emit('canceled', [data]);
                //send status object
                sendStatus({
                    event: 'Event sent',
                    clear: true
                });
            });
        })

        socket.on("disconnect", function (data) {
            connections.splice(connections.indexOf(socket), 1);
            console.log("disconnected: %s sockets connected", connections.length);
        });
    });
});
// }, 2500)