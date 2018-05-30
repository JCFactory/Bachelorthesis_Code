var mongoose = require("mongoose");


var drug = new mongoose.Schema({
    _id: {
        type: Number,
        default: ""
    },
    id: {
        type: Number,
        default: ""
    },
    name: {
        type: String,
        default: ""
    },
    countryCode: {
        type: Number,
        default: ""
    },
    size: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    timeStamp: {
        type: Date,
        default: Date.now
    },
    event: {
        type: String,
        default: "Not detected",
    }
});


module.exports = mongoose.model("Drug", drug);