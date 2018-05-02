var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

mongoose.connect('mongodb://127.0.0.1:27017/medication');
var app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

var router = express.Router();

app.use("/api", router);
router.route("/drugs").get(getDrugs);
// router.route("/drug/:name").get(drugController.getDrug);
// router.route("/addDrug").post(drugController.addDrug);
// router.route("/updateDrug/:id").post(drugController.updateDrug);
// router.route("/deleteDrugs/:id").get(drugController.deleteDrug);

app.listen(3000);


var Drug = require("./mongo-node/mongo-node");

var http = require("http");


// //GET NAME OF DRUGS IN MONGODB 
// setInterval(function (req, res) {
//     Drug.find(function (err, drugs) {
//         if (err) {
//             res.send(err);
//             console.log("mongodb query not ok");
//         }
//         res.send(drugs);
//     })
// }, 1000)



function getDrugs(req, res) {
    Drug.find(function (err, drugs) {
        if (err) {
            res.send(err);
        }
        res.send(drugs);
    });
};

//GET SPECIFIC DRUG BY SEARCHING ITS NAME (SEARCH FIELD HAS TO BE IMPLEMENTED!!!!! IN FRONTEND XML)
// exports.getDrug = function (req, res) {
//     Drug.find({ name: req.params.name }, function (err, drug) {
//         if (err) {
//             res.send(err);
//         }
//         res.json(drug);
//     });
// };


//Functions for the remaining crud operations: (CREATE, UPDATE and DELETE)

// exports.addDrug = function (req, res) {
//     var drug = new Drug();
//     drug.id = req.body.id;
//     drug.name = req.body.name;
//     drug.countryCode = req.body.countryCode;
//     drug.size = req.body.size;
//     drug.location = req.body.location;
//     drug.timeStamp = req.body.timeStamp;
//     drug.save(function (err) {
//         if (err) {
//             res.send(err)
//         }
//         res.send({ message: "task was saved.", data: drug });
//     });
// }

// exports.updateDrug = function (req, res) {
//     Drug.update({ id: req.params.id }, {
//         id = req.body.id,
//         name = req.body.name,
//         countryCode = req.body.countryCode,
//         size = req.body.size,
//         location = req.body.location,
//         timeStamp = req.body.timeStamp
//     }, function(err, num, raw) {
//         if (err) {
//             res.send(err);
//         }
//         res.json(num);
//     });
// }

// exports.deleteDrug = function (req, res) {
//     Drug.remove({ _id: req.params.id }, function (err) {
//         if (err) {
//             res.send(err)
//         }
//         res.json({ message: "The drug was deleted" });
//     });
// };