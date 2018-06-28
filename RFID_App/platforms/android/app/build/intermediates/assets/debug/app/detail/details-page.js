const topmost = require("ui/frame").topmost;
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
const SocketIO = require('nativescript-socket.io');
var platform = require('platform');
var dialog = require('nativescript-dialog')
var page;
const Button = require("tns-core-modules/ui/button").Button;


// var tmpObservable = new observableModule.fromObject();


// var allowedDrugs = [110, 112, 115, 120];
var allowedDrugsRoom312 = ["Aspirin", "Ibuprofen", "Insulin", "Acido Transexamico"];
var allowedDrugsRoom314 = ["Fenitoina", "Acetilcisteina", "Cloreto de Sodico"];

var drug = new ObservableArray();
var id;
var name;
var countryCode;
var size;
var location;
var timeStamp;
var event;
var isDetected;

var pageData = new observableModule.fromObject({
    id: drug.id,
    name: drug.name,
    countryCode: drug.countryCode,
    size: drug.size,
    location: drug.location,
    timeStamp: drug.timeStamp,
    event: drug.event,
    isDetected: drug.isDetected,
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
    newDrug.push(context.isDetected);
    console.log(newDrug);

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

//sending administered information to server
//and receiving the updated data; refreshing page content
exports.administerTap = function () {
    var thisName = page.getViewById("name").text;
    //already administered, do not allow a second time 
    if (page.getViewById("event").text == "administered to patient") {
        page.getViewById("adminButton").isEnabled = false;
        var nativeView;
        dialog.show({
            title: "Information",
            message: "The selected drug has already been administered!",
            cancelButtonText: "Ok",
            nativeView: nativeView
        }).then(function (r) { console.log("Result: " + r); },
            function (e) { console.log("Error: " + e) });
    }
    //check if drug has been detected in room 312 
    else if (page.getViewById("event").text == "detected in room 312") {
        if (allowedDrugsRoom312.includes(thisName)) {
            //if drug not already administered
            var socket = SocketIO.connect('http://192.168.1.64:3000');
            // var socket = SocketIO.connect('http://169.254.1.2:3000');
            // var socket = SocketIO.connect('http://127.0.0.1:3000');
            //check for connection
            if (socket !== undefined) {
                console.log("successfully connected through socket io to server");
                socket.emit('administer', thisName);
                socket.on('updated', function (datareceived) {
                    console.log(datareceived);
                    page.getViewById("event").text = "administered to patient";
                });
                page.getViewById("adminButton").isEnabled = false;
                var nativeView;
                dialog.show({
                    title: "Information",
                    message: "The selected drug was administered successfully!",
                    cancelButtonText: "Ok",
                    nativeView: nativeView
                }).then(function (r) { console.log("Result: " + r); },
                    function (e) { console.log("Error: " + e) });
            }
        } else if (!allowedDrugsRoom312.includes(thisName)) {
            //if drug is on hallway, do not allow administration
            page.getViewById("adminButton").isEnabled = false;
            var nativeView;
            dialog.show({
                title: "Error!",
                message: "The selected drug should not be administered to patient!",
                cancelButtonText: "Ok",
                nativeView: nativeView
            }).then(function (r) { console.log("Result: " + r); },
                function (e) { console.log("Error: " + e) });
        }
    }
    //check if drug is allowed for room 314
    else if (page.getViewById("event").text == "detected in room 314") {
        if (allowedDrugsRoom314.includes(thisName)) {
            //if drug not already administered
            var socket = SocketIO.connect('http://192.168.1.64:3000');
            // var socket = SocketIO.connect('http://169.254.1.2:3000');
            // var socket = SocketIO.connect('http://127.0.0.1:3000');
            //check for connection
            if (socket !== undefined) {
                console.log("successfully connected through socket io to server");
                socket.emit('administer', thisName);
                socket.on('updated', function (datareceived) {
                    console.log(datareceived);
                    page.getViewById("event").text = "administered to patient";
                });
                page.getViewById("adminButton").isEnabled = false;
                var nativeView;
                dialog.show({
                    title: "Information",
                    message: "The selected drug was administered successfully!",
                    cancelButtonText: "Ok",
                    nativeView: nativeView
                }).then(function (r) { console.log("Result: " + r); },
                    function (e) { console.log("Error: " + e) });
            }
        } else if (!allowedDrugsRoom314.includes(thisName)) {
            //if drug is on hallway, do not allow administration
            page.getViewById("adminButton").isEnabled = false;
            var nativeView;
            dialog.show({
                title: "Error!",
                message: "The selected drug should not be administered to patient!",
                cancelButtonText: "Ok",
                nativeView: nativeView
            }).then(function (r) { console.log("Result: " + r); },
                function (e) { console.log("Error: " + e) });
        }
    }
    //if drug is detected on hallway
    else if (page.getViewById("event").text == "detected on hallway"){
        //if drug is on hallway, do not allow administration
        page.getViewById("adminButton").isEnabled = false;
        var nativeView;
        dialog.show({
            title: "Error!",
            message: "The selected drug should not be administered to patient!",
            cancelButtonText: "Ok",
            nativeView: nativeView
        }).then(function (r) { console.log("Result: " + r); },
            function (e) { console.log("Error: " + e) });
    }
}


