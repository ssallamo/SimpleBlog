var express  = require("express");
var router   = express.Router();
var Post     = require("../models/Post");
var util     = require("../util");

// Index
    router.get("/", function(req, res){
        Post.find({})
        .populate("author")
        .sort("-createdAt")
        .exec(function(err, posts){
            if(err) return res.json(err);
            res.render('posts/index', {posts:posts});
        });
    });

    //new edit page
    //router.get("/new", function(req, res){
    router.get("/new", util.isLoggedin, function(req, res){
        var post = req.flash("post")[0] || {};
        var errors = req.flash("errors")[0] || {};
        res.render("posts/new", {post:post, errors:errors});
    });

    //create a new post
    router.post("/", util.isLoggedin, function(req, res){
        req.body.author = req.user._id;
        Post.create(req.body, function(err, post){
            if(err) {
                req.flash("post", req.body);
                req.flash("errors", util.parseError(err));
                return res.redirect("post/new");
            }
            res.redirect("/posts");
        });
    });

    //show a selected posts
    router.get("/:id", function(req, res){
        console.log("body : \n" + req.params.id);
        Post.findOne({_id:req.params.id})
        .populate("author")
        .exec(function(err, post){
            if(err) return res.json(err);
            res.render("posts/show", {post:post});
        });     
    });

    // Edit a selected post
    router.get("/:id/edit", util.isLoggedin, checkPermission, function(req, res){        
        var post = req.flash("post")[0];
        var errors = req.flash("errors")[0] || {};
        if(!post){
            Post.findOne({_id:req.params.id}, function(err, post){
                if(err) return res.json(err);
                console.log(post);
                res.render("posts/edit", {post:post});
            });        
        }
        else{
            post._id = req.params.id;
            res.render("posts/edit", { post:post, errors:errors });
        }
    });

    //update selected post
    router.put("/:id", util.isLoggedin, checkPermission, function(req, res){
        req.body.updatedAt = Date.now();
        console.log(req.body);
        Post.findOneAndUpdate({_id:req.params.id}, req.body, {runValidator:true}, function(err, post){
            if(err) {
                req.flash("post", req.body);
                req.flash("errors", util.parseError(err));
                res.redirect("/posts/"+req.params.id+"/edit");   
            }
            res.redirect("/posts/"+req.params.id);            
        });
    });
    

    //delete selected post
    router.delete("/:id", util.isLoggedin, checkPermission, function(req, res){
        Post.remove({_id:req.params.id}, function(err){
            if(err) return res.json(err);
            res.redirect("/posts");
        });
    });

module.exports = router;


function checkPermission(req, res, next){
    User.findOne({username:req.params.id}, function(err, post){
        if(err) return res.json(err);
        //if(user.id =! req.user.id) return util.noPermission(req, res);
        if(post.author =! req.params.id) return util.noPermission(req, res);
        next();
    });
}