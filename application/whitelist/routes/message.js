var express = require("express");
var router = express.Router({mergeParams: true});
var Message = require("../models/message");
var middleware = require("../middleware");
var User = require("../models/user");



// INDEX ROUTE

// router.post("/", middleware.isLoggedIn, function(req, res) {
//     Campground.findById(req.params.id, function(err, campground) {
//         if(err) {
//             console.log(err);
//         } else {
//             Comment.create(req.body.comment, function(err, comment) {
//                 if(err) {
//                     console.log(err);
//                 } else {
//                     comment.author.id = req.user._id;
//                     comment.author.username = req.user.username;
//                     comment.save();
//                     campground.comments.push(comment);
//                     campground.save();
//                     res.redirect("/campgrounds/" + campground._id);
//                 }
//             })
//         }
//     })
// });
//
// // NEW ROUTE
//
// router.get("/new", middleware.isLoggedIn, function(req, res) {
//     Campground.findById(req.params.id, function(err, campground) {
//         if(err) {
//             console.log(err);
//         } else {
//             res.render("comments/new", {campground: campground});
//         }
//     })
// });

router.get("/:otherId", middleware.isLoggedIn, function(req, res) {

    User.findById({_id: req.params.id}, function (err, sender) {
        if(err) {
            console.log(err);
        } else {
            User.findById({_id: req.params.otherId}, function (err, recipient) {
                if(err) {
                    console.log(err);
                } else {
                    res.render('messages/message', {sender: sender, recipient: recipient});
                }
            });
        }

    });
});






module.exports = router;