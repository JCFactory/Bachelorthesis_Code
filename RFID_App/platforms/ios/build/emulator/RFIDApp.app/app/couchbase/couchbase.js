//import { CouchDB } from "nativescript-couchdb";

var couchdb = require("nativescript-couchdb");


exports.tapped = function()
{
    couchdb = new CouchDB("http://127.0.0.1:5984/_utils/#database/medication/_all_docs");
    alert("successfull connected to db");
}


var item = "Till";

