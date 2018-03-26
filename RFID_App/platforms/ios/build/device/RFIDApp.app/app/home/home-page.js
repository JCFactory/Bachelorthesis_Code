var Kinvey = require('kinvey-nativescript-sdk').Kinvey;
Kinvey.init({
	apiHostname: 'https://baas.kinvey.com',
	micHostname: 'https://auth.kinvey.com',
	appKey: 'kid_rJLgyYUqf',
	appSecret: 'e3b139db758a43a7af2515ec5fba6274'
  });


// var Observable = require("data/observable").Observable;
// var ObservableArray = require("data/observable-array").ObservableArray;
// var couchdb = require("nativescript-couchdb");

// var page;
// var items = new ObservableArray([]);
// var pageData = new Observable();



// var couchdbModule = require("nativescript-couchdb");
// var database = new couchdb.CouchDB("medication");

// // var documentId = database.createDocument({
// //     "_id": "2fdfb5cd97e4418576c1dc88d309872",
// //     "_rev": "3-de99cf65a84c8f0edae4b05232aee14f",
// //     "name": "Retalin",
// //     "countryCode": 98765436,
// //     "size": "30 pcs",
// //     "location": "C10B50",
// //     "timeStamp": 128293477
// // });

// exports.pageLoaded = function(args)
// {
// 	page = args.object;
// 	page.bindingContext = pageData;
// 	alert("successfull connected to db");

//     couchdb = new CouchDB("http://127.0.0.1:5984/_utils/#database/medication/_all_docs");
// 	alert("successfull connected to db");
// 	alert(couchdb.allDocs());
	
// }


// //var item = "Till";

// // exports.pageLoaded = function(args) {
// // 	page = args.object;
// // 	page.bindingContext = pageData;

// // 	items.push(
// // 		{
// // 			itemName: "Till Bomke",
// // 			itemDesc: "Very sweet boy",
// // 			itemImage: "~/images/272-cross.png"
// //     },
// //     {
// // 			itemName: "Till Bomke",
// // 			itemDesc: "Very sweet boy",
// // 			itemImage: "~/images/272-cross.png"
// //     },
// //     {
// // 			itemName: "Till Bomke",
// // 			itemDesc: "Very sweet boy",
// // 			itemImage: "~/images/272-cross.png"
// //     },
// //     {
// // 			itemName: "Till Bomke",
// // 			itemDesc: "Very sweet boy",
// // 			itemImage: "~/images/273-checkmark.png"
// //     },
// //     {
// // 			itemName: "Till Bomke",
// // 			itemDesc: "Very sweet boy",
// // 			itemImage: "~/images/272-cross.png"
// //     },
// //     {
// // 			itemName: "Till Bomke",
// // 			itemDesc: "Very sweet boy",
// // 			itemImage: "~/images/273-checkmark.png"
// //     },
// //     {
// // 			itemName: "Till Bomke",
// // 			itemDesc: "Very sweet boy",
// // 			itemImage: "~/images/272-cross.png"
// //     },
// //     {
// // 			itemName: "Till Bomke",
// // 			itemDesc: "Very sweet boy",
// // 			itemImage: "~/images/273-checkmark.png"
// //     }
// // 	)

// // 	pageData.set("items", items);

// // 	// setTimeout(function() {
// // 	// 	items.push(
// // 	// 			{
// // 	// 				itemName: "LCD Soundsystem",
// // 	// 				itemDesc: "This is Happening",
// // 	// 				itemImage: "~/images/lcd-soundsystem.png"
// // 	// 			}
// // 	// 	);
// // 	// }, 2000);
// // };


// exports.pullToRefreshInitiated = function() {
// 	setTimeout(function() {
// 		items.push(
// 				{
// 					itemName: "LCD Soundsystem",
// 					itemDesc: "This is Happening",
// 					itemImage: "~/images/272-cross.png"
// 				}
// 		);
// 		page.getViewById("listview").notifyPullToRefreshFinished();
// 	}, 2000);
// };