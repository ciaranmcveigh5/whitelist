var mongoose = require('mongoose');


var messageSchema = mongoose.Schema({

    from: String,
    to: String,
    datetime: { type: Date, default: Date.now },
    message: String

});

module.exports = mongoose.model('Message', messageSchema);