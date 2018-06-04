const topmost = require("ui/frame").topmost;
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
const SocketIO = require('nativescript-socket.io');
var platform = require('platform');
var dialog = require('nativescript-dialog')
var page;

var allowedDrugs = [32459, 23456, 54321];

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

//sending administered information to server
//and receiving the updated data; refreshing page content
exports.administerTap = function () {
    var thisID = page.getViewById("id").text;
    if (allowedDrugs.includes(thisID)) {
        var socket = SocketIO.connect('http://169.254.1.4:3000');
        // var socket = SocketIO.connect('http://127.0.0.1:3000');

        //check for connection
        if (socket !== undefined) {
            console.log("successfully connected through socket io to server");
            var str1 = "administered in room: ";
            var str2 = page.getViewById("location").text;
            var eventData = str1.concat(str2);

            var administerDetails = {
                id : thisID,
                event : eventData
            }

            socket.emit('administer', administerDetails);

            socket.on('updated', function (datareceived) {
                var StringData = JSON.stringify(datareceived);
                alert("changing" + StringData);
                //  page.getViewById("eventID").text = datareceived;

            });
        };
    } else {
        var nativeView;
        dialog.show({
            title: "Error!",
            message: "The selected drug should not be administered to patient!",
            cancelButtonText: "Ok",
            nativeView: nativeView
        }
        ).then(function (r) { console.log("Result: " + r); },
            function (e) { console.log("Error: " + e) });
    }
};
