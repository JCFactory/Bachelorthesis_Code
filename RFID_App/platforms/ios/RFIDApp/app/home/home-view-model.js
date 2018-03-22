var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;

// var page;
// var items = new ObservableArray([]);
// var pageData = new Observable();

// exports.pageLoaded = function(args){
//     page = args.object;
//     page.bindingContext = pageData;
//     items.push(  
//         {  
//           itemName: "Till Bomke",
//           itemDesc: "very sweet boy",
//           itemImage: "~/images/logo.jpg"
//         },
//         {
//           itemName: "Till Bomke",
//           itemDesc: "very sweet boy",
//           itemImage: "~/images/logo.jpg"
//         },
//         {
//           itemName: "Till Bomke",
//           itemDesc: "very sweet boy",
//           itemImage: "~/images/logo.jpg"
//         },
//         {
//           itemName: "Till Bomke",
//           itemDesc: "very sweet boy",
//           itemImage: "~/images/logo.jpg"
//         }
//       )
//       pageData.set("items", items);
//   };


function HomeViewModel() {
    const viewModel = new Observable();

    return viewModel;
}

module.exports = HomeViewModel;