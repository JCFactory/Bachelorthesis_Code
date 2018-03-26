var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;

var page;
var items = new ObservableArray([]);
var pageData = new Observable();
// var MongoClient = require('mongodb').MongoClient;
// var url = "http://mongodb://localhost:27017/medication";

exports.connectMongo = function() {
  var MongoClient = require('mongodb').MongoClient;
  var url = "http://mongodb://localhost:27017/medication";
  // var collections = db.getCollectionNames();
  // for(var i = 0; i < collections.length; i++){
  //   print('collection: '+ collections[i]);
  //   db.getCollection(collections[i]).find().forEach(printjson);
  // }

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    //for specific queries, define variable for query:
    //ejemplo: var query = {age: {gt$: 17}, name: 'john'};
    //var query = { }
    db.collection("drugs").find({}).toArray(function (err, result) {
      if (err) throw err;
      console.log(result);
      db.close();
    });
  });
}

exports.pageLoaded = function(args) {
	page = args.object;
	page.bindingContext = pageData;

	items.push(
		{
			itemName: "Till Bomke",
			itemDesc: "Very sweet boy",
			itemImage: "~/images/272-cross.png"
    },
    {
			itemName: "Till Bomke",
			itemDesc: "Very sweet boy",
			itemImage: "/images/272-cross.png"
    },
    {
			itemName: "Till Bomke",
			itemDesc: "Very sweet boy",
			itemImage: "~/images/272-cross.png"
    },
    {
			itemName: "Till Bomke",
			itemDesc: "Very sweet boy",
			itemImage: "~/images/273-checkmark.png"
    },
    {
			itemName: "Till Bomke",
			itemDesc: "Very sweet boy",
			itemImage: "~/images/272-cross.png"
    },
    {
			itemName: "Till Bomke",
			itemDesc: "Very sweet boy",
			itemImage: "~/images/273-checkmark.png"
    },
    {
			itemName: "Till Bomke",
			itemDesc: "Very sweet boy",
			itemImage: "~/images/272-cross.png"
    },
    {
			itemName: "Till Bomke",
			itemDesc: "Very sweet boy",
			itemImage: "~/images/273-checkmark.png"
    }
	)

	pageData.set("items", items);

	// setTimeout(function() {
	// 	items.push(
	// 			{
	// 				itemName: "LCD Soundsystem",
	// 				itemDesc: "This is Happening",
	// 				itemImage: "~/images/lcd-soundsystem.png"
	// 			}
	// 	);
	// }, 2000);
};


exports.pullToRefreshInitiated = function() {
	setTimeout(function() {
		items.push(
				{
					itemName: "LCD Soundsystem",
					itemDesc: "This is Happening",
					itemImage: "~/images/272-cross.png"
				}
		);
		page.getViewById("listview").notifyPullToRefreshFinished();
	}, 2000);
};