// VARIABLES

var express = require("express");
var router = express.Router({mergeParams: true});

// ROOT ROUTE

router.get('/', function (req, res) {
    res.render('whitelist/index');
});

// EXPORTS

module.exports = router;
