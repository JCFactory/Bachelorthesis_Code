const topmost = require("ui/frame").topmost;
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
const SocketIO = require('nativescript-socket.io');
var platform = require('platform');
var dialog = require('nativescript-dialog')
var page;

var allowedDrugs = [112, 122, 126];

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
exports.administerTap = function (args) {
    var thisID = page.getViewById("id").text;
    if (allowedDrugs.includes(thisID)) {
        if (page.getViewById("event").text == "administered to patient") {
            var nativeView;
            dialog.show({
                title: "Information",
                message: "The selected drug has already been administered!",
                cancelButtonText: "Ok",
                nativeView: nativeView
            }).then(function (r) { console.log("Result: " + r); },
                function (e) { console.log("Error: " + e) });
        } else {
           // var socket = SocketIO.connect('http://169.254.1.4:3000');
           //Lucia home
             var socket = SocketIO.connect('http://192.168.1.64:3000');
            //check for connection
            if (socket !== undefined) {
                console.log("successfully connected through socket io to server");
                socket.emit('administer', thisID);
                socket.on('updated', function (datareceived) {
                    var nativeView;
                    dialog.show({
                        title: "Information",
                        message: "The selected drug was administered successfully!",
                        cancelButtonText: "Ok",
                        nativeView: nativeView
                    }).then(function (r) { console.log("Result: " + r); },
                        function (e) { console.log("Error: " + e) });
                    page = args.object;
                    pageData.set("id", datareceived.id);
                    pageData.set("name", datareceived.name);
                    pageData.set("countryCode", datareceived.countryCode);
                    pageData.set("size", datareceived.size);
                    pageData.set("location", datareceived.location);
                    pageData.set("timeStamp", datareceived.timeStamp);
                    pageData.set("event", datareceived.event);
                    page.bindingContext = pageData;
                });
            } else {
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
    }
};
