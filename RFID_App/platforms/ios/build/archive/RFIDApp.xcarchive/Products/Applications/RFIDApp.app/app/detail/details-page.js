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





// var Drug = require("../mongo-node/mongo-node");

// var schema = require("../mongo-node/mongo-node");

// var http = require("http");

//GET ALL DRUGS OF MONGODB 
// exports.getDrugs = function (req, res) {
//     Drug.find(function (drugs, err) {
//         if (err) {
//             res.send(err);
//         }
//         res.send(drugs);
//     });
    // Drug.distinct("name", function (err, results) {
    //     if (err) {
    //         res.send(err);
    //     }
    //     res.json(results);
    // });
// };
    // Look for a specific name in medication list
    // Drug.find({name: req.params.name}, function(drugs, err){
    //     if(err){
    //         res.send(err);
    //     }
    //     res.send(drugs);
    // });
    // Drug.distinct("name");
    // alert(Drug);

    // Drug.find().distinct("name", function (error, results) {
    //     if (err) {
    //         res.send(err);
    //     }
    //     res.json(results);
    //     // console.log(results);
    // });

    // Drug.find().distinct("name", function (error, results) {
    //     console.log(results);
    // });

    // Drug.find(function (err, drugs) {
    //     if (err) {
    //         res.send(err);
    //     }
    //     res.json(drugs);
    // });


// //GET SPECIFIC DRUG BY SEARCHING ITS NAME (SEARCH FIELD HAS TO BE IMPLEMENTED!!!!! IN FRONTEND XML)
// exports.getDrug = function (req, res) {
//     Drug.find({ name: req.params.name }, function (err, drug) {
//         if (err) {
//             res.send(err);
//         }
//         res.json(drug);
//     });
// };


// //Functions for the remaining crud operations: (CREATE, UPDATE and DELETE)

// exports.addDrug = function (req, res) {
//     // var drug = new Drug();
//     // drug.id = req.body.id;
//     // drug.name = req.body.name;
//     // drug.countryCode = req.body.countryCode;
//     // drug.size = req.body.size;
//     // drug.location = req.body.location;
//     // drug.timeStamp = req.body.timeStamp;
//     // drug.save(function (err) {
//     //     if (err) {
//     //         res.send(err)
//     //     }
//     //     res.send({ message: "task was saved.", data: drug });
//     // });
// }

// exports.updateDrug = function (req, res) {
//     // Drug.update({ id: req.params.id }, {
//     //     id = req.body.id,
//     //     name = req.body.name,
//     //     countryCode = req.body.countryCode,
//     //     size = req.body.size,
//     //     location = req.body.location,
//     //     timeStamp = req.body.timeStamp
//     // }, function(err, num, raw) {
//     //     if (err) {
//     //         res.send(err);
//     //     }
//     //     res.json(num);
//     // });
// }

// exports.deleteDrug = function (req, res) {
//     Drug.remove({ _id: req.params.id }, function (err) {
//         if (err) {
//             res.send(err)
//         }
//         res.json({ message: "The drug was deleted" });
//     });
// };


