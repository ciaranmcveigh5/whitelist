// NPM PACKAGES VARIABLES

var express = require("express");

    // bodyParser = require("body-parser"),
    // request = require("request"),
    // mongoose = require("mongoose"),
    // passport = require("passport"),
    // LocalStrategy = require("passport-local"),
    // methodOverride = require("method-override");

// MODELS VARIABLES

// var User = require("./models/user"),
//     Comment = require("./models/comment"),
//     Campground = require("./models/campground");

// ROUTES VARIABLES

var whitelistRoutes = require("./routes/whitelist.js");
var userRoutes = require("./routes/user.js");
//     campgroundRoutes = require("./routes/campgrounds"),
//     indexRoutes = require("./routes/index");

// UNKNOWN

var app = express();
// seedDB = require("./seeds");

// DB SETUP

// mongoose.connect("mongodb://localhost/yelp_camp");

// BASIC SETUP

// app.use(bodyParser.urlencoded({extended: true})); // ?
app.use(express.static(__dirname + "/public"));  // ?
app.use(express.static(__dirname + "/assets"));  // ?
app.set("view engine", "ejs"); // ALL FILES IN VIEW TREATED AS EJS THERFORE NO NEED TO .ejs
// app.use(methodOverride("_method")); // METHOD OVERRIDE TO ENABLE PUT AND DELETE REQUESTS

// AUTH ENCRYPTION

// app.use(require("express-session")({
//     secret: "ApplesAndPears",
//     resave: false,
//     saveUninitialized: false
// }));

// PASSPORT SETUP

// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// app.get('/', function (req, res) {
//     res.send('Hello World!')
// })

// ROUTES

app.use(whitelistRoutes);
app.use(userRoutes);
// app.use("/campgrounds/:id/comments", commentRoutes);
// app.use("/campgrounds", campgroundRoutes);

// START SERVER

app.listen(3000, function() {
    console.log("server started");
})