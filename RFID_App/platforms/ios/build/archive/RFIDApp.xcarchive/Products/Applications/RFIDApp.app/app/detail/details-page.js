const topmost = require("ui/frame").topmost;
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
const SocketIO = require('nativescript-socket.io');
var page;

var drug = new ObservableArray();
var id;
var name;
var countryCode;
var size;
var location;
var timeStamp;
var event;

var pageData = new observableModule.fromObject({
    id: drug.id,
    name: drug.name,
    countryCode: drug.countryCode,
    size: drug.size,
    location: drug.location,
    timeStamp: drug.timeStamp,
    event: drug.event,
});

exports.loaded = function (args) {
    page = args.object;
    const context = page.navigationContext;
    console.log(context);
    var newDrug = drug;
    drug = [];
    newDrug.push(context.id);
    newDrug.push(context.name);
    newDrug.push(context.countryCode);
    newDrug.push(context.size);
    newDrug.push(context.location);
    newDrug.push(context.timeStamp);
    newDrug.push(context.event);
    console.log(newDrug);
    page = args.object;
    page.bindingContext = context;
}

exports.onNavBtnTap = function (args) {
    const navigationEntry = {
        moduleName: "home-view/home-view",
        animated: true,
        clearHistory: false,
        transition: {
            name: "fade"
        }
    };
    topmost().navigate(navigationEntry);
}

exports.administerTap = function () {
    alert("administered to patient!");
    var eventData = "administered room: " + page.getViewById("location").text;
    console.log(eventData);
    page.getViewById("eventID").text = eventData;
    var socket = SocketIO.connect('http://192.168.1.134:3000');
    var thisID = pageData.id;
    console.log(thisID);
    var data = page.getViewById("eventID").text;
    console.log(data);
    //check for connection
    if (socket !== undefined) {
        socket.emit('administer', data);
    };
}

// function sendDataToSocket() {
//     var socket = SocketIO.connect('http://127.0.0.1:3000');
//     var data = page.getViewById("eventID").text
//     //check for connection
//     if (socket !== undefined) {
//         socket.emit('administer', function (data) {
//             console.log(data);
//         });
//     };
// }