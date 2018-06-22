var frameModule = require('ui/frame');
var observable = require("data/observable").Observable;
var observableArray = require("data/observable-array").ObservableArray;

var page;

var testList = new observableArray([
  {
    id: 1,
    title: "Test 1",
    checked:new observable({valueChecked: false}),
    className:new observable({name: "checkbox"})
  },
  {
    id: 2,
    title: "Test 2",
    checked:new observable({valueChecked: false}),
    className:new observable({name: "checkbox"})
  },
  {
    id: 3,
    title: "Test 3",
    checked:new observable({valueChecked: false}),
    className:new observable({name: "checkbox"})
  }
]);

exports.loaded = function(args) {
  page = args.object;

  page.bindingContext = {
    testList: testList
  };
};


exports.check = function(args) {
  var id = args.object.id.replace("id-", "");

  testList.forEach(function(value) {
    if(value.id == id) {
       if(value.checked.valueChecked == false){ 
         value.className.set("name", "checkbox-checked"); 
         value.checked.set("valueChecked", true);  
        }
        else {
          value.className.set("name", "checkbox"); 
          value.checked.set("valueChecked", false);
        } 
     }
  });

  console.dump(testList._array);
};

exports.push = function(args) {
  var lastinArray = testList.length - 1;
  var lastItem = testList.length;
  var newItem = {
    id: lastItem + 1,
    title: "Test " + (lastItem + 1),
    checked:new observable({valueChecked: false}),
    className:new observable({name: "checkbox"})
  };

  testList.forEach(function(value) {
    if(value.id == lastinArray) {
      testList.push(newItem);
    }
  });

  console.dump(testList._array);
};

exports.refresh = function(args) {
  page.getViewById("testList-repeater").refresh();
};