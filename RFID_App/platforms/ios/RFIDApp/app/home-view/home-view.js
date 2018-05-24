var view = require("ui/core/view");
const SocketIO = require('nativescript-socket.io');
var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
const frameModule = require('ui/frame');
const topmost = require("ui/frame").topmost;
var platform = require('platform');
var dialog = require('nativescript-dialog')

var page;
var items = new ObservableArray([]);
var pageData = new Observable();

exports.pageLoaded = function (args) {
    getDataFromSocket(args);
};

exports.pullToRefreshInitiated = function (args) {
    setTimeout(function () {
        getDataFromSocket(args);
        page.getViewById("listview").notifyPullToRefreshFinished();
        refreshDialog(args);
    }, 2000);
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
            timeStamp: selectedItem.timeStamp
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
    var socket = SocketIO.connect('http://127.0.0.1:3000');
    page = args.object;
    pageData.set("items", items);
    page.bindingContext = pageData;
    //check for connection
    if (socket !== undefined) {
        socket.on('output', function (drugs) {
            var StringData = JSON.stringify(drugs);
            console.log(StringData);
            if (drugs.length === 0) {
                // alert("No medication data found...");
                noMedFoundDialog(args);
            } else {
                while (items.length) {
                    items.pop();
                }
                items.push(drugs);
            }
        });
    };
}

function noMedFoundDialog(args) {
    var nativeView;

    if (platform.device.os === platform.platformNames.ios) {
        nativeView = UIActivityIndicatorView.alloc().initWithActivityIndicatorStyle(UIActivityIndicatorViewStyle.UIActivityIndicatorViewStyleGray);
        nativeView.startAnimating();
    } else if (platform.device.os === platform.platformNames.android) {
        nativeView = new android.widget.ProgressBar(application.android.currentContext);
        nativeView.setIndeterminate(true);
    }

    dialog.show({
        title: "No medication found...",
        message: "Please wait!",
        cancelButtonText: "Cancel",
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
    } else if (platform.device.os === platform.platformNames.android) {
        nativeView = new android.widget.ProgressBar(application.android.currentContext);
        nativeView.setIndeterminate(true);
    }

    dialog.show({
        title: "Refreshing...",
        message: "Please wait!",
        cancelButtonText: "Cancel",
        nativeView: nativeView
    }
    ).then(function (r) { console.log("Result: " + r); },
        function (e) { console.log("Error: " + e) });
}