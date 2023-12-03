let mongoose = require('mongoose');

// create a model class

let eidModel = mongoose.Schema({
    Item: String,
    Amount: String,
    Price: String,
},
{

    giftlist: "eid"

});

module.exports = mongoose.model("eid", eidModel);