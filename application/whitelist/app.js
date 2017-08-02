// NPM PACKAGES VARIABLES

var express = require("express");
var redis   = require("redis");
var mongoose = require("mongoose");
var methodOverride = require('method-override');
var passport = require("passport");
var expressSession = require("express-session");
var RedisStore = require('connect-redis')(expressSession);
var flash    = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var uuid = require('node-uuid');




var redisClient  = redis.createClient(require('./config/redis'));



// MODELS VARIABLES

var User = require("./models/user");
var Message = require("./models/message");

// ROUTES VARIABLES

var whitelistRoutes = require("./routes/whitelist.js");
var userRoutes = require("./routes/user.js");
var messageRoutes = require("./routes/message.js");

// UNKNOWN

var app = express();

// DB SETUP

mongoose.connect("mongodb://35.176.221.201/whitelist"); //ip of box and name of db (if whitelist doesn't exist it will create it)

// SOCKET IO SETUP

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var ioUsers = []
var connections = [];

io.sockets.on('connection', function(socket) {
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    // var usersInRoom = io.sockets.clients();
    // console.log(usersInRoom);
    // for (var index in usersInRoom) {
    //     var userSocketId = usersInRoom[index].id;
    //     if (userSocketId !== socket.id && nicknames[userSocketId]) {
    //         var name = nicknames[userSocketId];
    //         activeNames.push({id: namesUsed.indexOf(name), nick: name});
    //     }
    // }


    socket.on('retrieveMessage', function(data) {
        // var nsp = io.of('/' + data.sender + data.recipient);
        // nsp.on('connection', function(socket){
        //     console.log('someone connected to %s', nsp);
        // });
        socket.join(data.sender + data.recipient);

        Message.find({
            $or: [
                {$and: [ { from: data.sender }, { to: data.recipient } ]},
                {$and: [ { from: data.recipient }, { to: data.sender } ]}
                ]
        }).sort('-datetime').limit(5).exec(function(err, docs) {
            if (err) {
                console.log(err);
            } else {

                reverseDocs = docs.reverse();

                reverseDocs.forEach(function(data) {
                    socket.emit('loadMessage', {msg: data.message, sender: data.from, recipient: data.to});

                });
                console.log("end4");
            }
        });

    });
    // Message.find({$and: [ { from: heloo }, { to: hello } ]})
    //
    // var stream = collection.find().sort({ _id : -1 }).limit(10).stream();

    // Disconnect
    socket.on('disconnect', function(data) {
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length);
    });

    // Send Message
    socket.on('sendMessage', function(data) {

        // mongoose.connect("mongodb://35.176.221.201/whitelist", function(err) {
        //
        //     if(err) {
        //         console.log(err);
        //     } else {
        //         console.log('Connected to mongodb!');
        //     }

            // var collection = db.collection('messages');
            // Message.create(data, function (err, message) {
            //     if (err) {
            //         console.log(err);
            //     } else {
            //         message.from = data.sender;
            //         message.to = data.recipient;
            //         message.message = data.msg;
            //         message.save();
            //         console.log("saved");
            //     }
            // });
        // });

        Message.create({from: data.sender, to: data.recipient, message: data.msg}, function(err, message) {
            if (err) {
                console.log(err);
            } else {
                console.log(message);
            }
        });

        // var messengerUsers = {}
        //
        // messengerUsers[socket.id] = data.sender;

        // var newMsg = new Message({from: data.sender, to: data.recipient, message: data.msg});
        // console.log(newMsg)
        // newMsg.save(function(err) {
        //     if (err) {
        //         console.log(err);
        //     }
        // });


        //
        io.to(data.sender + data.recipient).emit('newMessage', {msg: data.msg, sender: data.sender, recipient: data.recipient});
        io.to(data.recipient + data.sender).emit('newMessage', {msg: data.msg, sender: data.sender, recipient: data.recipient});

        // socket.broadcast.to(data.recipient + data.sender).emit('newMessage', {msg: data.msg, sender: data.sender, recipient: data.recipient});

        // io.sockets.emit('newMessage', {msg: data.msg, sender: data.sender, recipient: data.recipient});
        console.log("end2")
        console.log(data);
        console.log("end")
    });

});

// BASIC SETUP

app.use(express.static(__dirname + "/public"));  // ?
app.use(express.static(__dirname + "/assets"));  // ?
app.set("view engine", "ejs"); // ALL FILES IN VIEW TREATED AS EJS THERFORE NO NEED TO .ejs
app.use(methodOverride("_method")); // METHOD OVERRIDE TO ENABLE PUT AND DELETE REQUESTS

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms



// PASSPORT SETUP

require('./config/passport')(passport); // passport config ie methods etc.

app.use(expressSession({secret: 'mySecretKey',
                        store: new RedisStore({
                            // url: '35.176.221.201',
                            // port: 6379,
                            client: redisClient
                        }),
                        saveUinitialized: false,
                        resave: false // key for encrypting session tokens
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// app.use(function (req, res, next) {
//     if (!req.session) {
//         return next(new Error('oh no')) // handle error
//     }
//     next() // otherwise continue
// })

redisClient.on("error", function (err) {
    console.log("Error " + err);
});

app.use(function (req, res, next) {
    var timestamp = Date.now();
    var sessionID = req.sessionID; // Only available if you've enabled the express-session package.
    var requestID = uuid.v4();

    req.id = requestID; // In case other parts of the code require this ID.

    console.log(timestamp, sessionID, requestID);
    console.log(req.session);
    next();
});

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// ROUTES

app.use(whitelistRoutes);  // call use() on the Express application to add the Router to the middleware handling path
app.use("/users", userRoutes);
app.use("/users/:id/messages", messageRoutes);

// START SERVER

server.listen(3000, function() {
    console.log("server started");
});