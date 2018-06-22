var view = require("ui/core/view");
const SocketIO = require('nativescript-socket.io');
var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
const frameModule = require('ui/frame');
const topmost = require("ui/frame").topmost;
var platform = require('platform');
var dialog = require('nativescript-dialog');
var color_1 = require("color");
var imageModule = require("ui/image");

var page;
var items = new ObservableArray([]);
var pageData = new Observable();

exports.pageLoaded = function (args) {
    // alert("Hello");
    getDataFromSocket(args);
};

exports.pullToRefreshInitiated = function (args) {
    refreshDialog(args);
    setTimeout(function () {
        getDataFromSocket(args);
        page.getViewById("listview").notifyPullToRefreshFinished();
    }, 3000);
};

exports.onTap = function (args) {
    const selectedItem = args.view.bindingContext;
    const navigationEntry = {
        moduleName: "detail/details-page",
        context: {
            id: selectedItem.id,
            name: selectedItem.name,
            countryCode: selectedItem.countryCode,
            size: selectedItem.size,
            location: selectedItem.location,
            timeStamp: selectedItem.timeStamp,
            event: selectedItem.event,
            isDetected: selectedItem.isDetected
        },
        animated: true,
        clearHistory: false,
        transition: {
            name: "fade"
        }
    };
    console.log("selected drug " + selectedItem.id);
    topmost().navigate(navigationEntry);
}

function getDataFromSocket(args) {
    //localhost:
    // var socket = SocketIO.connect('http://127.0.0.1:3000');
    //lucia home:
    var socket = SocketIO.connect('http://192.168.1.64:3000');
    //private Network:
    // var socket = SocketIO.connect('http://169.254.1.2:3000');

    page = args.object;
    pageData.set("items", items);
    page.bindingContext = pageData;
    //check for connection
    if (socket !== undefined) {
        socket.on('output', function (drugs) {
            if (drugs.length === 0) {
                while (items.length) {
                    items.pop();
                }                // alert("No medication data found...");
                noMedFoundDialog(args);
            } else {
                while (items.length) {
                    items.pop();
                }
                drugs.every(function (elem) {
                    if (elem.length === 0) {
                        return false; // break
                        console.log("empty element");
                    } else if (elem.isDetected == "true") {
                        items(elem).backgroundColor = "#00cc00";
                        // var image = new imageModule.Image();
                        // image = page.getViewById("circle");
                        // var color = new color_1.Color("#00cc00");
                        // image.color = color;
                        console.log(elem);
                        return true;
                    }
                });
            }
            items.push(drugs);
        });
    }
};

function noMedFoundDialog(args) {
    var nativeView;
    if (platform.device.os === platform.platformNames.ios) {
        nativeView = UIActivityIndicatorView.alloc().initWithActivityIndicatorStyle(UIActivityIndicatorViewStyle.UIActivityIndicatorViewStyleGray);
        nativeView.startAnimating();
    }
    dialog.show({
        title: "No medication found...",
        message: "There is no medication!",
        cancelButtonText: "Ok",
        nativeView: nativeView
    }
    ).then(function (r) { console.log("Result: " + r); },
        function (e) { console.log("Error: " + e) });
}

function refreshDialog(args) {
    var nativeView;
    if (platform.device.os === platform.platformNames.ios) {
        nativeView = UIActivityIndicatorView.alloc().initWithActivityIndicatorStyle(UIActivityIndicatorViewStyle.UIActivityIndicatorViewStyleGray);
        nativeView.startAnimating();
    }
    dialog.show({
        title: "Refreshing...Please Wait.",
        message: "Updating all data.",
        cancelButtonText: "Ok",
        nativeView: nativeView
    }
    ).then(function (r) { console.log("Result: " + r); },
        function (e) { console.log("Error: " + e) });
}
