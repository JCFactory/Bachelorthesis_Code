var frameModule = require("ui/frame");

const HomeViewModel = require("./home-view-model");

const homeViewModel = new HomeViewModel();

var frutas = ["banana", "manzana", "uva", "Aceite", "naranja", "melocoton", "fresca"];




exports.onTap = function(){
  var topmost = frameModule.topmost();
  topmost.navigate("detail-view/detail")
  console.log("Jack");
  alert(frutas);

  // var mongo = require('mongodb');
  // var assert = require('assert');
  // var MongoClient = mongo.MongoClient;
  // var url = 'mongodb://localhost:27017/medication';
  // MongoClient.connect(url, (err, db) => {
  //   console.log("lucky you!");
  //   // assert.equal(null, err);
  //   // db.stats((err, stats)=>{
  //   //   assert.equal(null, err);
  //   //   console.dir(stats);
  //   //   db.close();
  //   // });
  //   // });
  // });
}


// exports.loaded = function () {

// alert("helo");
// var mongo = require('mongodb');
// var assert = require('assert');
// var MongoClient = mongo.MongoClient;
// var url = 'mongodb://localhost:27017/medication';
// MongoClient.connect(url, (err, db)=>{
//   db.listCollections().toArray((err, collections)=> {
//     assert.equal(err, null);
//     console.dir(collections);
//     db.close();
//   });
// });
// alert("bla");
// console.log("success");
// var express = require('express');
// var app = express();
// var bodyparser = require('body-parser');
// var mongoose = require('mongoose');

// var MongoClient = require('mongodb').MongoClient
//   , assert = require('assert');

// // Connection URL
// var url = 'mongodb://127.0.0.1:27017/medication';
// // Use connect method to connect to the Server
// MongoClient.connect(url, function (err, db) {
//   console.log("success");
//   // CRUD Operation goes here...
// });

// alert("Hello Mongo!");
//   var MongoClient = require('mongodb').MongoClient;
//   var url = "mongodb://localhost:27017/medication";

//   MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     var dbo = db.db("medication");
//   var newObj = [
//    { _id: 1, nombre: "Lorena", apellido: "Santos" },
//    { _id: 2 , nombre: "Ana", apellido: "Linda" },
//    { _id: 3, nombre: "Felix", apellido: "Julio" },
//    { _id: 4, nombre: "Marcos", apellido: "Rodriguez" },
//    { _id: 5, nombre: "Guillermo", apellido: "Perez" },
//    { _id: 6, nombre: "Juan", apellido: "Rey" },
//    { _id: 7, nombre: "Felipe", apellido: "Garcia" },  
//   { _id: 8, nombre: "Federico", apellido: "Martinez" },
//   { _id: 9, nombre: "Fidel", apellido: "Diaz" },
//   { _id: 10, nombre: "Flora", apellido: "Fernandez" },
//   { _id: 11, nombre: "Flavio", apellido: "Lopez" },
//   { _id: 12, nombre: "Florencio", apellido: "Flores" },
//   { _id: 13, nombre: "Carmen", apellido: "Ramirez" },
//   { _id: 14, nombre: "Camelia", apellido: "Suarez" },
//   { _id: 15, nombre: "Carina", apellido: "Molina" }, 
//  { _id: 16, nombre: "Carolina", apellido: "Ortiz" }
// ];

//   dbo.collection("clase").insertMany(newObj, function(err, res) {
//     if (err) throw err;
//     console.log("1 document inserted");
//     console.log("Number of documents inserted: " + res.insertedCount);
//   });


// dbo.collection("drugs").find({}).toArray(function(err, result) {
//     if (err) throw err;
//     console.log(result);
//     db.close();
//   });
// });
// }



function onNavigatingTo(args) {
  /*
  This gets a reference this page’s <Page> UI component. You can
  view the API reference of the Page to see what’s available at
  https://docs.nativescript.org/api-reference/classes/_ui_page_.page.html
  */
  const page = args.object;

  /*
  A page’s bindingContext is an object that should be used to perform
  data binding between XML markup and JavaScript code. Properties
  on the bindingContext can be accessed using the {{ }} syntax in XML.
  In this example, the {{ message }} and {{ onTap }} bindings are resolved
  against the object returned by createViewModel().

  You can learn more about data binding in NativeScript at
  https://docs.nativescript.org/core-concepts/data-binding.
  */
  page.bindingContext = homeViewModel;
}

/*
Exporting a function in a NativeScript code-behind file makes it accessible
to the file’s corresponding XML file. In this case, exporting the onNavigatingTo
function here makes the navigatingTo="onNavigatingTo" binding in this page’s XML
file work.
*/
exports.onNavigatingTo = onNavigatingTo;
