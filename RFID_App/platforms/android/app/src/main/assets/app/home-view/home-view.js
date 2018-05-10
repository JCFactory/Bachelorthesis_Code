const http = require('http');
const observableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const frameModule = require('ui/frame');
const topmost = require("ui/frame").topmost;
const SocketIO = require('nativescript-socket.io');

var page;
var drugs = new ObservableArray();


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

function socketIOConnect() {
    var socketio = SocketIO.connect("http://127.0.0.1:3000");
    socketio.on("socketToMe", function (data) {
         console.log(data);
         drugs.push(data);
    });
}

// exports.navigatingTo = function(args){
//     socketIOConnect();
//     // httpRequest();
//     page = args.object;
//     page.bindingContext = pageData;
// }


// function httpRequest() {
//     http.request({ url: "http://127.0.0.1:3000", method: "GET" }).then(function (response) {
//         console.log("asdfjklö");
//         var responseArray = response.content.toJSON();
//         var responseString = response.content.toString();
//         var newDrugs = drugs;
//         drugs = [];
//         newDrugs.push(responseArray);
//         //alert(responseString); //getting always the current database entries
//     }, function (e) {
//         console.log("error");
//     });
// }
// setInterval(httpRequest(), 5000);

exports.loaded = function (args) {
    // httpRequest();
    socketIOConnect();
    page = args.object;
    page.bindingContext = pageData;
    // socketIO.emit('getDrugs');
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


