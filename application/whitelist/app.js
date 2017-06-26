// NPM PACKAGES VARIABLES

var express = require("express"),
    bodyParser = require("body-parser"),
    request = require("request"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override");

// MODELS VARIABLES

var User = require("./models/user"),
    Comment = require("./models/comment"),
    Campground = require("./models/campground");

// ROUTES VARIABLES

var commentRoutes = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes = require("./routes/index");

// UNKNOWN

var app = express(),
    seedDB = require("./seeds");

// DB SETUP

mongoose.connect("mongodb://localhost/yelp_camp");

// BASIC SETUP

app.use(bodyParser.urlencoded({extended: true})); // ?
app.use(express.static(__dirname + "/public"));  // ?
app.set("view engine", "ejs"); // ALL FILES IN VIEW TREATED AS EJS THERFORE NO NEED TO .ejs
app.use(methodOverride("_method")); // METHOD OVERRIDE TO ENABLE PUT AND DELETE REQUESTS

// AUTH ENCRYPTION

app.use(require("express-session")({
    secret: "ApplesAndPears",
    resave: false,
    saveUninitialized: false
}));

// PASSPORT SETUP

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// MIDDLEWARE TO PASS IN CURRENT USER TO ALL ROUTES

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

// ROUTES

app.use(indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);

// START SERVER

app.listen(3000, function() {
    console.log("server started");
})