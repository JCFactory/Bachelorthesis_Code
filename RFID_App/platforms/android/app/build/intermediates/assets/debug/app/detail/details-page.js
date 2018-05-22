const topmost = require("ui/frame").topmost;
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var page;

var drug = new ObservableArray();
var id;
var name;
var countryCode;
var size;
var location;
var timeStamp;

var pageData = new observableModule.fromObject({
    id: drug.id,
    name: drug.name,
    countryCode: drug.countryCode,
    size: drug.size,
    location: drug.location,
    timeStamp: drug.timeStamp
});

exports.loaded = function (args) {
    page = args.object;
    const context = page.navigationContext;
    console.log(context);
    var newDrug = drug;
    drug = [];
    newDrug.push(context.id);
    newDrug.push(context.nombre);
    newDrug.push(context.apellido);
    newDrug.push(context.accion);
    console.log(newDrug);
    page = args.object;
    page.bindingContext = context;
}

exports.onNavBtnTap = function (args) {
    const navigationEntry = {
        moduleName: "home-view/home-view",
        animated: true,
        clearHistory: true,
        transition: {
            name: "fade"
        }
    };
    topmost().navigate(navigationEntry);
}