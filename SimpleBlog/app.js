//app.js

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var methodOverride = require('method-override');
var flash = require("connect-flash");
var session = require("express-session");
var passport = require("./config/passport");
var app = express();

// configure db
//mongoose.connect(process.env.MONGODB_HOME);
var db = mongoose.connection;
db.once('open', function(){
    console.log("DB Connected");
});
db.on('error',function(err){
    console.log("DB Error : ", err);
});

//Configure Others
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(flash()); //saving flash data( proto type is ('string',value)) into array
app.use(session({secret:"MySecret"}));
app.use(passport.initialize());
app.use(passport.session());

//custom Middleware
app.use(function(req, res, next){
    //assigns value user logined or not from ejs
    res.locals.isAuthenticated = req.isAuthenticated(); //return true or false by login or not currently
    //current logined user info
    res.locals.currentUser = req.user; //user deserialize
    next();
});


//Configure Routes
app.use('/', require('./routes/home'));
app.use('/posts', require('./routes/posts'));
app.use('/users', require('./routes/users'));


//configure server port and run server
var port = process.env.PORT || 2044;
app.listen(port, function(){
    console.log("MEAN STACK BLOG HAS STARTED ON PORT " + port);
});


mongoose.connect('mongodb://localhost/blog');