var http = require("http");

var observableModule = require("data/observable");


exports.loaded = function () {
console.log("hoolle");
    http.request({ url: "http://192.168.1.64:3000/api/drugs", method: "GET" }).then(function (response) {
        //// Argument (response) is HttpResponse!
        console.log("asdfjköl");
        //// Content property of the response is HttpContent!
       response.content.toString();
        // var obj = response.content.toJSON();
        // var img = response.content.toImage();
    }, function (e) {
        console.log("error");
    });
}



