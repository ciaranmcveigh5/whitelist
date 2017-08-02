// var mongoose = require("mongoose");
// var passportLocalMongoose = require("passport-local-mongoose");
//
// var UserSchema = new mongoose.Schema({
//
//     email: String,
//     username: String,
//     password: String,
//     confirmPassword: String
//
//     // username: { type: String, required:true },
//     // password: { type: String, required:true }
// });
//
// UserSchema.plugin(passportLocalMongoose);
//
// module.exports = mongoose.model("User", UserSchema);

// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        email        : String,
        password     : String,
    }

});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);