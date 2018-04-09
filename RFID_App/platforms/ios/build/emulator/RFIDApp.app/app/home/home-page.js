// var dialogsModule = require("ui/dialogs");
// var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
const topmost = require("ui/frame").topmost;
var http = require("http");


exports.loaded = function () {
    http.request({ url: "http://192.168.1.64:3000/api/drugs", method: "GET" }).then(function (response) {
        console.log("asdfjköl");
        var responseString = response.content.toString();
        // var drugs = parser.parseResponse(response);
        alert(responseString);
    }, function (e) {
        console.log("error");
    });
}

// exports.pageNavigatedTo = function (args) {
//     const page = args.object;
//     page.bindingContext = page.navigationContext;
// };
