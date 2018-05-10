/*new code, working with mongodb driver npm
/*changed 10.05.2018*/

// const mongo = require('mongodb').MongoClient;
// const client = require('socket.io').listen(4000).sockets;

// mongo.connect('mongodb://127.0.0.1:27017/medication', function (err, db) {
//     if (err) {
//         throw err;
//     }
//     console.log("MongoDB connected");

//     //connect to socket.io
//     client.on('connection', function (socket) {
//         console.log('client connected: ' + socket.id);
//         // let drug = db.collection('drugs');
//         // // sendStatus = function(s){
//         // //     socket.emit('status', s);
//         // // }
//         // drug.find().toArray(function(err, res){
//         //     if(err){
//         //         throw err;
//         //     }
//         //     //emit/send messages
//         //     socket.emit('output',res);
//         // })
//     })

// });





/*old code, working with mongoose -->recommended
/*changed 10.05.2018
*/
// var express = require("express");
// var app = express();
// var server = require('http').createServer(app);
// var io = require('socket.io').listen(server);

const client = require('socket.io').listen(4000).sockets;

// users = [];
connections = [];
// server.listen(process.env.PORT || 3000);

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
            socket.emit('output', JSON.stringify(drugs));
            // res.send(drugs);
        });

        socket.on("disconnect", function (data) {
            connections.splice(connections.indexOf(socket), 1);
            console.log("disconnected: %s sockets connected", connections.length);
        });
    });
});

// app.get('/', function (req, res) {
//     Drug.find(function (err, drugs) {
//         if (err) {
//             res.send(err);
//         }
//         res.send(drugs);
//     });
// });

//open sockets connection 
// io.sockets.on("connections", function (socket) {
//     connections.push(socket);
//     console.log("connected: %s socket connected", connections.length);


//     socket.emit("Drugs", { drugs: drugs.toJSON() });

//     //disconnect
//     socket.on("disconnect", function (data) {
//         connections.splice(connections.indexOf(socket), 1);
//         console.log("disconnected: %s sockets connected", connections.length);
//     });
// });