var Drug = require("../mongo-node/mongo-node");

// var dialogsModule = require("ui/dialogs");
// var observableModule = require("data/observable");
// var ObservableArray = require("data/observable-array").ObservableArray;
// const frameModule = require("ui/frame");
// const topmost = frameModule.topmost();
var page;
var http = require("http");


//GET ALL DRUGS OF MONGODB 
exports.getDrugs = function (req, res) {
    //Look for a specific name in medication list
    // Drug.find({name: req.params.name}, function(drugs, err){
    //     if(err){
    //         res.send(err);
    //     }
    //     res.send(drugs);
    // });
    Drug.find(function (err, drugs) {
        if (err) {
            res.send(err);
        }
        res.json(drugs);
    });
};

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


exports.loaded = function (args) {

    http.request({ url: "http://localhost:3000/api/drugs", method: "GET" }).then(function (response) {
        //// Argument (response) is HttpResponse!

        console.log("Hallo Guapo Till, te echo mucho de menos :-(");
        //// Content property of the response is HttpContent!
        var str = response.content.toString();
        var obj = response.content.toJSON();
        var img = response.content.toImage();
    }, function (e) {
        //// Argument (e) is Error!
    });
};

exports.pageNavigatedTo = function (args) {
    const page = args.object;
    page.bindingContext = page.navigationContext;
};

