const http = require('http');
const observableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const frameModule = require('ui/frame');
const topmost = require("ui/frame").topmost;
const SocketIO = require('nativescript-socket.io');
var platformModule = require("tns-core-modules/platform");

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


function removeDuplicates(arr) {
    let uniqueArray = [];
    for (let i; i < arr.length; i++) {
        if (uniqueArray.indexOf(arr[i]) == -1) {
            uniqueArray.push(arr[i]);
        }
    }
    return uniqueArray;
}

function serverConnect() {
    var socket = SocketIO.connect('http://127.0.0.1:4000');

    //check for connection
    if (socket !== undefined) {
        socket.on('output', function (data) {
            console.log('connected to socket...' + data.length);
            // var stringData = JSON.stringify(data);
            // alert(stringData);
            if (data.length === 0) {
                alert("No medicine found");
            } else {
                // removeDuplicates(drugs);
                // var newDrugs = drugs;
                // drugs = [];
                drugs.push(data);
                //  newDrugs.push(data);
            }
        });
    };
};


function loaded(args){
    const page = args.object;
    page.bindingContext = pageData;
    serverConnect();
}
exports.loaded = loaded;


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

function refreshList(args) {
    const pullRefresh = args.object;
    serverConnect().then(
        response =>{
            console.log(response);
            setTimeout(() => {
                pullRefresh.refreshing = false;
            }, 1000);
        },
        err => {
            pullRefresh.refreshing = false;
            alert(err);
        }
    );
}
exports.refreshList = refreshList;




