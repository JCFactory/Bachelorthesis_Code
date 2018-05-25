var mongoose = require("mongoose")
require('mongoose-moment')(mongoose);


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
    timeStamp: 'Moment',
    event: {
        type: String,
        default: "Not detected",
    }
});


module.exports = mongoose.model("Drug", drug);