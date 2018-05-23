var view = require("ui/core/view");
const SocketIO = require('nativescript-socket.io');

var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
const frameModule = require('ui/frame');
const topmost = require("ui/frame").topmost;
var page;
var items = new ObservableArray([]);
var pageData = new Observable();

exports.pageLoaded = function (args) {
    var socket = SocketIO.connect('http://127.0.0.1:3000');
    page = args.object;
    //check for connection
    if (socket !== undefined) {
        socket.on('output', function (drugs) {
            var StringData = JSON.stringify(drugs);
            console.log(StringData);
            if (drugs.length === 0) {
                alert("No medication data found...");
            } else {
                items.push(drugs);
            }
        });
        pageData.set("items", items);
        page.bindingContext = pageData;
    };
};


// exports.pullToRefreshInitiated = function (args) {
//     setTimeout(function () {
//         var socket = SocketIO.connect('http://127.0.0.1:3000');
//         console.log("socket connected");
//         //check for connection
//         if (socket !== undefined) {
//             console.log("socket not empty");

//             socket.on('output', function (data) {
//                 console.log("retrieving output");

//                 var StringData = JSON.stringify(data);
//                 console.log(StringData);
//                 if (data.length === 0) {
//                     alert("No medication data found...");
//                     console.log("nothing found");
//                 } else {
//                     items.push(data);
//                 }
//             });
//         };
//         // serverConnect();
//         page = args.object;
//         page.bindingContext = pageData;
//         pageData.set("items", items); page.getViewById("listview").notifyPullToRefreshFinished();
//     }, 2000);
//     alert("refreshing finished");
// };

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

// function serverConnect() {
//     var socket = SocketIO.connect('http://127.0.0.1:3000');
//     //check for connection
//     if (socket !== undefined) {
//         socket.on('output', function (data) {
//             var StringData = JSON.stringify(data);
//             console.log(StringData);
//             console.log('connected to socket...' + data);
//             if (data.length === 0) {
//                 alert("No medication data found...");
//             } else {
//                 items.push(data);
//             }
//         });
//     };
// }