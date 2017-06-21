// models/User.js

var mongoose = require('mongoose');
var bcrypt = require("bcrypt-nodejs");

var userSchema = mongoose.Schema({
    username : {
        type:String, 
        required:[true, "UserName is required"], 
        match:[/^.{4,12}$/,"Should be 4-12 characters!"],
        trim:true,
        unique:true
    },
    password : {
        type:String, 
        required:[true, "Password is required"], 
        select:false
    },
    name : {
        type:String, 
        required:[true, "Name is required!"],
        match:[/^.{4,12}$/,"Should be 4-12 characters!"],
        trim:true
    },
    email : {
        type:String,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/,"Should be a vaild email address!"],
        trim:true
    }
},{
    toObject:{virtual:true}
});

// virtual
userSchema.virtual("passwordConfirmation")
.get(function(){ return this._passwordConfirmation; })
.set(function(value){ return this._passwordConfirmation=value; });

userSchema.virtual("originalPassword")
.get(function(){ return this._originaPassword; })
.set(function(value){ return this._originaPassword=value; });

userSchema.virtual("currentPassword")
.get(function(){ return this._currentPassword; })
.set(function(value){ return this._currentPassword=value; });

userSchema.virtual("newPassword")
.get(function(){ return this._newPassword; })
.set(function(value){ return this._newPassword=value; });


//password validation
//var passwordRegex =/^(?=.*[A-Za-z])(?=.*d)[A-Za-zd]{8,16}$/;//in 4~16 charactors, at least one digit and letter have to be included
//var passwordRegex=/^[a-zA-Z0-9]{4,16}$/;
var passwordRegex=/^(?=.*[a-zA-Z])(?=.*[0-9]).{4,16}$/;
var passwordRegexErrorMessage ="Should be minimum 8characters of alphabet and digit combination.";

userSchema.path("password").validate(function(v){
    var user = this;

    //when new user create
    if(user.isNew){
        if(!user.passwordConfirmation){
            user.invalidate("passwordConfirmation", "Password Confirmation is required!");
        }
        if(!passwordRegex.test(user.password)){
            user.invalidate("password", passwordRegexErrorMessage);
        }
        else if(user.password !== user.passwordConfirmation){
            user.invalidate("passwordConfirmation", "Password Confirmation is not matched");
        }
    }

    //when user update
    if(!user.isNew){
        if(!user.currentPassword){
            user.invalidate("currentPassword", "Current Password is requried!");
        }
        if(user.currentPassword && !bcrypt.compareSync(user.currentPassword, user.originalPassword)){
            user.invalidate("currentPassword", "Current Password is invalid!");
        }
        if(user.newPassword && !passwordRegex.test(user.newPassword)){ //if correct regex, return ture else false
            user.invalidate("newPassword", passwordRegexErrorMessage);
        }
        else if(user.newPassword != user.passwordConfirmation){
            user.invalidate("passwordConfirmation", "Password Confirmation is not matched!");
        }
    }
});

//hash password 
userSchema.pre("save", function(next){ // excutes model.pre function before 'save'
    var user = this;
    if(!user.isModified("password")){ // isModified is to compare value modified :true  else :false
        return next();
    }
    else{
        user.password = bcrypt.hashSync(user.password);
        return next();
    }
});

//model methods
userSchema.methods.authenticate = function(password){
    var user = this;
    return bcrypt.compareSync(password, user.password);
}

var User = mongoose.model("user", userSchema);
module.exports = User;
