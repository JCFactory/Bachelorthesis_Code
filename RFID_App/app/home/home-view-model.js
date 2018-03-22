const Observable = require("data/observable").Observable;

function HomeViewModel() {
    const viewModel = new Observable();

    return viewModel;
}

module.exports = HomeViewModel;


// var array = new ObservableArray();

// array.push({"city":"Madrid","distance":"0.2km","votes":"0"});
// array.push({"city":"Madrid","distance":"0.2km","votes":"0"});
// array.push({"city":"Madrid","distance":"0.2km","votes":"0"});
// array.push({"city":"Madrid","distance":"0.2km","votes":"0"});
// array.push({"city":"Madrid","distance":"0.2km","votes":"0"});
// array.push({"city":"Madrid","distance":"0.2km","votes":"0"});

// var pageData = new Observable({cities: array});

// page.bindingContext = pageData;