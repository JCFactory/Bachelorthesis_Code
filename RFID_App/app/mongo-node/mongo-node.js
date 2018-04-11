var mongoose = require("mongoose");

var drug = new mongoose.Schema({
    _id: {
        type: Number,
        default: "",
        required: true,
        select: false
    },
    id: {
        type: Number,
        default: "",
        required: true,
        select: false
    },
    name: {
        type: String,
        default: "",
        required: true
    },
    countryCode: {
        type: Number,
        default: "",
        select: false
    },
    size: {
        type: String,
        default: "",
        select: false
    },
    location: {
        type: String,
        default: "",
        select: false
    },
    timeStamp: {
        type: Date,
        default: "",
        select: false
    },
});


module.exports = mongoose.model("Drug", drug);