var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var drugController = require("./detail/details-page");

mongoose.connect('mongodb://localhost:27017/medication');
var app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

var router = express.Router();

app.use("/api", router);
router.route("/drugs").get(drugController.getDrugs);
router.route("/drugnames").get(drugController.someValue);

// router.route("/drug/:name").get(drugController.getDrug);
// router.route("/addDrug").post(drugController.addDrug);
// router.route("/updateDrug/:id").post(drugController.updateDrug);
// router.route("/deleteDrugs/:id").get(drugController.deleteDrug);

app.listen(3000);
