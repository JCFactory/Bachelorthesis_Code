var MongoClient = require('mongodb').MongoClient;
var url = "http://mongodb://localhost:27017/medication";
MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  //for specific queries, define variable for query:
  //ejemplo: var query = {age: {gt$: 17}, name: 'john'};
  //var query = { }
  db.collection("drugs").find({}).toArray(function (err, result) {
    if (err) throw err;
    console.log(result);
    db.close();
  });
});