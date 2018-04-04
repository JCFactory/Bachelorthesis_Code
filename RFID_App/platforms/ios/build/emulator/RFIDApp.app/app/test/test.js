var http = require("http");

exports.loaded = function () {
    http.request({ url: "http://localhost:3000/api/drugs", method: "GET" }).then(function (response) {
        //// Argument (response) is HttpResponse!
        console.log("asdfjköl");
        //// Content property of the response is HttpContent!
        var str = response.content.toString();
        var obj = response.content.toJSON();
        var img = response.content.toImage();
    }, function (e) {
        console.log("error");
    });
}



