const http = require('http');
const observableModule = require("data/observable");
const fromObjectRecursive = require("data/observable").fromObjectRecursive;
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

var pageData = new observableModule.fromObjectRecursive({
    drugs
});

function serverConnect() {
    var socket = SocketIO.connect('http://127.0.0.1:4000');
    //check for connection
    if (socket !== undefined) {
        socket.on('output', function (data) {
            console.log('connected to socket...' + data.length);
             var stringData = JSON.stringify(data);
            // drugs.push(data);

             alert(stringData);
             drugs.push(data);
            // var newDrugs = drugs;
            // drugs = [];
            // newDrugs.push(data);

            // alert(newDrugs);
        });
    };
};

exports.loaded = function (args) {
    serverConnect();
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
            timeStamp: selectedDrug.timeStamp,
            socket: SocketIO.instance
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
    serverConnect();
    setTimeout(() => {
        pullRefresh.refreshing = false;
    }, 1000);
}, (err) => {
    pullRefresh.refreshing = false;
}