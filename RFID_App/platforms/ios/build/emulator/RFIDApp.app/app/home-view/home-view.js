var http = require('http');
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var page;
const topmost = require("ui/frame").topmost;
var drugs = new ObservableArray;

exports.onTap = function() {
    console.log("sweet till");
    const navigationEntry = {
        moduleName: "detail/details-page",
        context: {selected: pageData},
        animated:true
    };
    topmost().navigate(navigationEntry);
};

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







