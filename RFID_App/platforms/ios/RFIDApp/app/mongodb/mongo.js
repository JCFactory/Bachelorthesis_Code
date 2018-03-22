


exports.loaded = function(){
    var mongo = require('mongodb');
    var assert = require('assert');
    var MongoClient = mongo.MongoClient;
    var url = 'mongodb://localhost:27017/medication';
    
    
      MongoClient.connect(url, (err, db)=>{
        db.listCollections().toArray((err, collections)=> {
          assert.equal(err, null);
          console.dir(collections);
          db.close();
        });
      });
}







































//Instantiate MongoClient
// var mongo = require('mongodb').MongoClient;
// //Assert library (Perhaps overkill if you are writing production-level code)
// var assert = require('assert');
// //Express engine
// var express = require('express');

// //URL for my mongo instance
// //Connecting to the blog database
// var url = 'mongodb://localhost:27017/medication';

// //Instantiate express
// var router = express();

// //Get operation
// router.get('/get', function(req, res, next) {
//   var resultArray = [];
//   mongo.connect(url, function(err, db){
//     assert.equal(null, err);
//     var cursor = db.collection('posts').find();
//     cursor.forEach(function(doc, err){
//       assert.equal(null, err);
//       resultArray.push(doc);
//     }, function(){
//       db.close();
//       //I have no index file to render, so I print the result to console
//       //Also send back the JSON string bare through the channel
//       console.log(resultArray);
//       res.send(resultArray);
//     });
//   });
// });

// //Start listeninig
// //Hardcoded port 1000
// var server = router.listen(1000, function() {
//     var host = server.address().address;
//     var port = server.address().port;
//     console.log("Content Provider Service listening at http://%s:%s", host, port);
// });