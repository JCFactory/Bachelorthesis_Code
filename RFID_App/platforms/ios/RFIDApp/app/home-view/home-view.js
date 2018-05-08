var http = require('http');
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var page;
const topmost = require("ui/frame").topmost;
var drugs = new ObservableArray();


// const SocketIO = require('nativescript-socket.io');
// const socketio = SocketIO.connect("http://127.0.0.1:3000");

// SocketIO.enableDebug();

// var clients = [];
// socketio.set('authorization', function(handshakeData, cb){

// })


// socketio.on("connection", function (socket) {
//     socket.on("login", function (data) {
//         clients[data.user] = socket;
//     });
//     console.log("connect");
// });







//function to show active and detected tags in green color
function green(args) {
    var circle = args.object;
    circle.color = "#10BA10";
}

//function to show inactive tags in red color
function red(args) {
    var circle = args.object;
    circle.color = "#E53003";
}

var pageData = new observableModule.fromObject({
    drugs
});

function httpRequest() {
    http.request({ url: "http://127.0.0.1:3000", method: "GET" }).then(function (response) {
        console.log("asdfjklö");
        var responseArray = response.content.toJSON();
        var responseString = response.content.toString();
        var newDrugs = drugs;
        drugs = [];
        newDrugs.push(responseArray);
        //alert(responseString); //getting always the current database entries
    }, function (e) {
        console.log("error");
    });
}
// setInterval(httpRequest(), 5000);

exports.loaded = function (args) {
    httpRequest();
    page = args.object;
    page.bindingContext = pageData;
}

exports.onTap = function (args) {
    const selectedDrug = args.view.bindingContext;
    const navigationEntry = {
        moduleName: "detail/details-page",
        context: {
            id: selectedDrug.id,
            name: selectedDrug.name,
            countryCode: selectedDrug.countryCode,
            size: selectedDrug.size,
            location: selectedDrug.location,
            timeStamp: selectedDrug.timeStamp
        },
        animated: true,
        transition: {
            name: "flip",
            duration: 500,
            curve: "easeIn"
        }
    };
    console.log("selected drug " + selectedDrug.id);
    topmost().navigate(navigationEntry);
}

exports.refreshList = function (args) {
    var pullRefresh = args.object;
    alert("Refreshing...");

    // console.log(pullRefresh);

    //Refresh and get data from http server
    // pullRefresh.then((resp) => {
    //         setTimeout(() => {
    //             pullRefresh.refreshing = false;
    //         }, 1000);
    //     }, (err) => {
    //         pullRefresh.refreshing = false;
    //     });
    setTimeout(function () {
        pullRefresh.refreshing = false;
    }, 5000);
}

