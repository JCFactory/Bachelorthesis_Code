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
    // page = args.object;
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
    var socket = SocketIO.connect('http://169.254.1.4:3000');
    //check for connection
    if (socket !== undefined) {
        console.log("successfully connected through socket io to server");
        var eventData = "administered in room: " + page.getViewById("location").text;
        var thisID = page.getViewById("id").text;

        // page.getViewById("eventID").text = data;
        socket.emit('administer', { id: thisID, event: eventData });

        socket.on('update', function (datareceived) {
            alert("changing" + datareceived);
        //     console.lo
        //     page = args.object;
        //     const context = page.navigationContext;
        //     console.log(context);
        //     var newDrug = drug;
        //     drug = [];
        //     newDrug.push(context.id);
        //     newDrug.push(context.name);
        //     newDrug.push(context.countryCode);
        //     newDrug.push(context.size);
        //     newDrug.push(context.location);
        //     newDrug.push(context.timeStamp);
        //     newDrug.push(context.event);
        //     console.log(newDrug);
        //     // page = args.object;
        //     page.bindingContext = context;
        });
    };
};
