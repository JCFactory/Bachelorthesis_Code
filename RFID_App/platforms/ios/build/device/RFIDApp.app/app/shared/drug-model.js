function Drug(options){
    const model = {
        id: options.id,
        name: options.name,
        countryCode: options.countryCode,
        size: options.size,
        location: options.location,
        timeStamp: options.timeStamp
    };

    return model;
}

module.exports = Drug;