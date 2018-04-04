var dialogsModule = require("ui/dialogs");
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
const topmost = require("ui/frame").topmost;

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

// exports.onTap = function() {
//     console.log("button tapped");
//    const navigationEntry = {
//        moduleName: "detail/details-page",
//        context: {pageData},
//        animated: true
//    };
//    topmost().navigate(navigationEntry);
// };

// var page;

// var pageData = new observableModule.fromObject({
//     drugs: new ObservableArray([
//         {
//             id: 1,
//             name: "Ibuprofen",
//             countryCode: "123456",
//             size: "30 pcs",
//             location: "A20B3",
//             timeStamp: 12032018,
//         },
//         {
//             id: 2,
//             name: "Dekristolvit",
//             countryCode: "1234326",
//             size: "10 pcs",
//             location: "C20G3",
//             timeStamp: 12014018,
//         },
//         {
//             id: 3,
//             name: "Miejemplo",
//             countryCode: "132456",
//             size: "20 pcs",
//             location: "F20C3",
//             timeStamp: 12982018,
//         },
//         {
//             id: 4,
//             name: "Medicinabuena",
//             countryCode: "124656",
//             size: "15 pcs",
//             location: "G20C3",
//             timeStamp: 43032018,
//         },
//         {
//             id: 5,
//             name: "Ibuprofen",
//             countryCode: "123456",
//             size: "30 pcs",
//             location: "A20B3",
//             timeStamp: 12032018,
//         },
//         {
//             id: 6,
//             name: "Dekristolvit",
//             countryCode: "1234326",
//             size: "10 pcs",
//             location: "C20G3",
//             timeStamp: 12014018,
//         },
//         {
//             id: 7,
//             name: "Miejemplo",
//             countryCode: "132456",
//             size: "20 pcs",
//             location: "F20C3",
//             timeStamp: 12982018,
//         },
//         {
//             id: 8,
//             name: "Medicinabuena",
//             countryCode: "124656",
//             size: "15 pcs",
//             location: "G20C3",
//             timeStamp: 43032018,
//         },
//         {
//             id: 9,
//             name: "Ibuprofen",
//             countryCode: "123456",
//             size: "30 pcs",
//             location: "A20B3",
//             timeStamp: 12032018,
//         },
//         {
//             id: 10,
//             name: "Dekristolvit",
//             countryCode: "1234326",
//             size: "10 pcs",
//             location: "C20G3",
//             timeStamp: 12014018,
//         },
//         {
//             id: 11,
//             name: "Miejemplo",
//             countryCode: "132456",
//             size: "20 pcs",
//             location: "F20C3",
//             timeStamp: 12982018,
//         },
//         {
//             id: 13,
//             name: "Medicinabuena",
//             countryCode: "124656",
//             size: "15 pcs",
//             location: "G20C3",
//             timeStamp: 43032018,
//         }
//     ])
// });

// exports.loaded = function(args){
//     page = args.object;
//     page.bindingContext = pageData;
// };


// var MongoClient = require('mongodb').MongoClient;
// var url = "http://mongodb://localhost:27017/medication";
// MongoClient.connect(url, function (err, db) {
//   if (err) throw err;
//   //for specific queries, define variable for query:
//   //ejemplo: var query = {age: {gt$: 17}, name: 'john'};
//   //var query = { }
//   db.collection("drugs").find({}).toArray(function (err, result) {
//     if (err) throw err;
//     console.log(result);
//     db.close();
//   });
// });

// const navigationEntry = {
//     moduleName: "detail"
// }

// const HomeViewModel = require("./home-view-model");
// const Observable = require("data/observable").Observable;

// const homeViewModel = new HomeViewModel();

// function onNavigatingTo(args) {
   
//     const page = args.object;
//     page.bindingContext = homeViewModel;
// }

// exports.onNavigatingTo = onNavigatingTo;
