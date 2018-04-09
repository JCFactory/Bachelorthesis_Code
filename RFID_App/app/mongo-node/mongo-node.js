var mongoose = require("mongoose");

// var drug = new mongoose.Schema({
//     id: {
//         type: Number,
//         default: "",
//         required: true
//     },
//     name: {
//         type: String,
//         default: "",
//         required: true
//     },
//     countryCode: {
//         type: Number,
//         default: "",
//         required: false
//     },
//     size: {
//         type: String,
//         default: "",
//         required: false
//     },
//     location: {
//         type: String,
//         default: "",
//         required: false
//     },
//     timeStamp: {
//         type: Date,
//         default: "",
//         required: false
//     }
// });

var druggi = new mongoose.Schema({
    name: {
        type: String,
        default: "",
        required: true
    }
});

// var schema = new Schema({ name: String }, { collection: 'drugs' });


//module.exports = mongoose.model("Drug", drug);
module.exports = mongoose.model("Drug", druggi);