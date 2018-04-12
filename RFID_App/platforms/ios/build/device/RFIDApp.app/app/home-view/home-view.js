var http = require('http');
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var page;
var drugs = new ObservableArray;

// exports.onTap = function (eventData) {
//     console.log("till i miss you");
//     //IP in WLAN (Lucia home)
//     // http.request({ url: "http://192.168.1.64:3000/api/drugs", method: "GET" }).then(function (response) {
//     //IP in Eduroam (UNIOVI)
//     http.request({ url: "http://156.35.251.30:3000/api/drugs", method: "GET" }).then(function (response) {
//         console.log("asdfjköl");
//         var responseArray = response.content.toJSON();
//         var responseString = response.content.toString();
//         drugs.push(responseArray);
//         console.log(drugs);
//         console.log(responseString);
//     }, function (e) {
//         console.log("error");
//     });
// }

var pageData = new observableModule.fromObject({
    drugs
});

exports.loaded = function (args) {
    console.log("till i miss you");
    //IP in WLAN (Lucia home)
    // http.request({ url: "http://192.168.1.64:3000/api/drugs", method: "GET" }).then(function (response) {
    //IP in Eduroam (UNIOVI)
    http.request({ url: "http://156.35.251.193:3000/api/drugs", method: "GET" }).then(function (response) {
        console.log("asdfjköl");
        var responseArray = response.content.toJSON();
        var responseString = response.content.toString();
        drugs.push(responseArray);
        console.log(drugs);
        console.log(responseString);
    }, function (e) {
        console.log("error");
    });
    page = args.object;
    page.bindingContext = pageData;
}







