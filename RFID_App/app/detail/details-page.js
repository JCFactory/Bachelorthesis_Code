var dialogsModule = require("ui/dialogs");
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
const frameModule = require("ui/frame");
const topmost = frameModule.topmost();
var page;

var pageData = new observableModule.fromObject({
    drugs: new ObservableArray([
        {
            id: 1,
            name: "Ibuprofen",
            countryCode: "123456",
            size: "30 pcs",
            location: "A20B3",
            timeStamp: 12032018,
        },
        {
            id: 2,
            name: "Dekristolvit",
            countryCode: "1234326",
            size: "10 pcs",
            location: "C20G3",
            timeStamp: 12014018,
        },
        {
            id: 3,
            name: "Miejemplo",
            countryCode: "132456",
            size: "20 pcs",
            location: "F20C3",
            timeStamp: 12982018,
        },
        {
            id: 4,
            name: "Medicinabuena",
            countryCode: "124656",
            size: "15 pcs",
            location: "G20C3",
            timeStamp: 43032018,
        },
        {
            id: 5,
            name: "Ibuprofen",
            countryCode: "123456",
            size: "30 pcs",
            location: "A20B3",
            timeStamp: 12032018,
        },
        {
            id: 6,
            name: "Dekristolvit",
            countryCode: "1234326",
            size: "10 pcs",
            location: "C20G3",
            timeStamp: 12014018,
        },
        {
            id: 7,
            name: "Miejemplo",
            countryCode: "132456",
            size: "20 pcs",
            location: "F20C3",
            timeStamp: 12982018,
        },
        {
            id: 8,
            name: "Medicinabuena",
            countryCode: "124656",
            size: "15 pcs",
            location: "G20C3",
            timeStamp: 43032018,
        },
        {
            id: 9,
            name: "Ibuprofen",
            countryCode: "123456",
            size: "30 pcs",
            location: "A20B3",
            timeStamp: 12032018,
        },
        {
            id: 10,
            name: "Dekristolvit",
            countryCode: "1234326",
            size: "10 pcs",
            location: "C20G3",
            timeStamp: 12014018,
        },
        {
            id: 11,
            name: "Miejemplo",
            countryCode: "132456",
            size: "20 pcs",
            location: "F20C3",
            timeStamp: 12982018,
        },
        {
            id: 13,
            name: "Medicinabuena",
            countryCode: "124656",
            size: "15 pcs",
            location: "G20C3",
            timeStamp: 43032018,
        }
    ])
});

exports.loaded = function(args){
    page = args.object;
    page.bindingContext = pageData;
};


exports.pageNavigatedTo = function(args){
    const page = args.object;
    page.bindingContext = page.navigationContext;
};