// config/passport.js

var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var User = require("../models/User");

// serialize & deserialize User
passport.serializeUser(function(user, done){
    done(null, user.id) //add into session user id from db
});

passport.deserializeUser(function(id, done){
    User.findOne({_id:id}, function(err, user){
        done(err, user);
    });
});

//local Strategy
passport.use("local-login",
    new LocalStrategy({
        usernameField : "username",
        passwordField : "password",
        passReqToCallback : true
    },
    function(req, username, password, done){ // callee when login
        User.findOne({username:username})
        .select({password:1})
        .exec(function(err, user){
            if(err) return done(err);
            if(user && user.authenticate(password)){
                return done(null, user);
            }
            else{
                req.flash("username", username);
                req.flash("errors", {login:"Incorrect username or password"});
                return done(null, false);
            }
        });
    })    
);

module.exports = passport;