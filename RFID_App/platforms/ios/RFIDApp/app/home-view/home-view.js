var http = require('http');
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var page;
const topmost = require("ui/frame").topmost;
var drugs = new ObservableArray;

exports.showDetail = function(args) {
    console.log("sweet till");
    var circle = args.object;
    green(args);
    const navigationEntry = {
        moduleName: "detail/details-page",
        context: {pageData},
        animated:true
    };
    topmost().navigate(navigationEntry);
    //console.log(args.toString());
};

//function to show active and detected tags in green color
function green(args){
    var circle = args.object;
    circle.color= "#10BA10";
}

//function to show inactive tags in red color
function red(args){
    var circle = args.object;
    circle.color = "#E53003";
}

var pageData = new observableModule.fromObject({
    drugs
});

exports.loaded = function (args) {
    console.log("till i miss you");
    //IP in WLAN (Lucia home)
    // http.request({ url: "http://192.168.1.64:3000/api/drugs", method: "GET" }).then(function (response) {
    //Developing with Emulator: http://127.0.0.1:3000/api/drugs
    //IP in Eduroam (UNIOVI) changes everyday
    http.request({ url: "http://127.0.0.1:3000/api/drugs", method: "GET" }).then(function (response) {
        console.log("asdfjköl");
        var responseArray = response.content.toJSON();
        // var responseString = response.content.toString();
       // if (responseArray != drugs.toJSON()){
            drugs.push(responseArray);
        //}
       // drugs.push(responseArray);
        // console.log(drugs);
        // console.log(responseString);
    }, function (e) {
        console.log("error");
    });
    page = args.object;
    page.bindingContext = pageData;
}







