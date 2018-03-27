var express = require('express');
var app = express();
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient
 , assert = require('assert');

var MongoClient = require('mongodb').MongoClient
 , assert = require('assert');

 console.log("Hello");
// Connection URL
var url = 'mongodb://127.0.0.1:27017/medication';
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
alert("hello");
});