var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;

var page;
var items = new ObservableArray([]);
var pageData = new Observable();

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