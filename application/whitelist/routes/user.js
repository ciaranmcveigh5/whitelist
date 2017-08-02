var express = require("express");
var router = express.Router({mergeParams: true});
var passport = require("passport");
var User = require("../models/user");

router.get("/register", function(req, res) { // (Path, Anonymous Function)
    res.render("users/register", { message: req.flash('signupMessage') });
});

router.post("/register", passport.authenticate('local-signup', {
    successRedirect : '/users/profile', // redirect to the secure profile section
    failureRedirect : '/users/register', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

router.get("/login", function(req, res) {
    res.render("users/login", { message: req.flash('loginMessage') });
});

router.post("/login", passport.authenticate("local-login",
    {
        successRedirect: "/users/:id/profile",
        failureRedirect: "/users/login",
        failureFlash : true // allow flash messages
}));

router.get('/:id/profile', isLoggedIn, function(req, res) {
    res.render('users/profile.ejs', {
        user : req.user // get the user out of session and pass to template
    });
});

router.get("/:id/logout", function(req, res) {
    req.logout();
    req.flash("success", "Successfully Logged Out");
    res.redirect("/");
});

router.get("/:id/search", function(req,res) {

    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        User.find({'local.email': regex}, function(err, foundUsers) {
            // eval(require('locus'));
            if(err) {
                console.log(err);
            } else {
                // var noMatch;
                if(foundUsers.length < 1) {
                    var noMatch = "No Users Found"
                }
                res.render("users/show", {users:foundUsers, noMatch:noMatch, me:req.user});
            }
        })
    } else {
        res.redirect("/");
    }
})

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

module.exports = router;