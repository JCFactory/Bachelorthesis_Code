var Kinvey = require('kinvey-nativescript-sdk').Kinvey;
var datastore = Kinvey.DataStore.collection('medication', Kinvey.DataStoreType.Cache);
Kinvey.init({
	apiHostname: 'https://baas.kinvey.com',
	micHostname: 'https://auth.kinvey.com',
	appKey: 'kid_rJLgyYUqf',
	appSecret: 'e3b139db758a43a7af2515ec5fba6274'
  });

  Kinvey.ping()
  .then(function(response){
	  alert("successfully connected to Kinvey database");
	  console.log('Kinvey Ping Success.Kinvey Ping Success.');
  })
  .catch(function(error){
	  console.log('Kinvey Ping Failed.' + error.description);
  });

  var promise = datastore.pull().then(function(entities){

  }).catch(function(error){

  });

  var subscription = datastore.findById("2fdfb5cd97e4418576c1dc88d309872")
  .subscribe(function(entity){
	alert(entity);
  }, function(error){
	alert("error");
  }, function(){
	alert("nothing");
  });

  var entity = {
		_id: "2fdfb5cd97e4418576c1dc88d309872",
	    _rev: "3-de99cf65a84c8f0edae4b05232aee14f",
	    name: "Retalin",
	    countryCode: 98765436,
	    size: "30 pcs",
	    location: "C10B50",
	    timeStamp: 128293477
  }

  var promise  = datastore.save(entity)
  .then(function(entity){
	alert(entity);
  }).catch(function(error){
	alert("entity not stored");
  })

