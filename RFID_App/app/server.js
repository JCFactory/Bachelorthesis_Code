const client = require('socket.io').listen(3000).sockets;

connections = [];

console.log("server running");

var Drug = require("./mongo-node/mongo-node");
var mongoose = require("mongoose");


setTimeout(function () {
    mongoose.connect('mongodb://169.254.1.4:27017/medication', function (err) {
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
                let id = data.id;
                let event = data.event;
                console.log(event);
                if (id == '' || event == '') {
                    console.log("nothing");
                } else {
                    console.log("updating data to mongodb");
                    //update drug information and emit/send the updated information back to client
                    Drug.findOneAndUpdate({id: id}, {$set:{event:event}}, {new:true}, function(err, drug){
                        if(err) {
                            console.log("something went wrong when updating data");
                        }else{
                            console.log(drug);
                            socket.emit('update', drug);
                        } 
                    });

                    // Drug.findByIdAndUpdate({ id: id, update: event}, function(){
                    //     console.log("updating mongodb");
                    //     socket.emit('update', [event]);
                    // });
                }
            });
            socket.on("disconnect", function (data) {
                connections.splice(connections.indexOf(socket), 1);
                console.log("disconnected: %s sockets connected", connections.length);
            });
        });
    });
}, 2500)