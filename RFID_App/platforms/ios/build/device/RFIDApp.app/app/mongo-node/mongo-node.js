var mongoose = require("mongoose");

var drug = new mongoose.Schema({
    id: {
        type: Number,
        default: "",
        required: true
    },
    name: {
        type: String,
        default: "",
        required: true
    },
    countryCode: {
        type: Number,
        default: "",
        required: true
    },
    size: {
        type: String,
        default: "",
        required: true
    },
    location: {
        type: String,
        default: "",
        required: true
    },
    timeStamp: {
        type: Date,
        default: "",
        required: true
    }
});

module.exports = mongoose.model("Drug", drug);