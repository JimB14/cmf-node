// models
var Article = require("../models/article");
var Comment = require("../models/comment");
var User    = require("../models/user");

// declare/create Object
var middlewareObj = {};

/**
 * checks if user is logged in
 *
 * @params req
 * @params res
 * @params next
 *
 * @return boolean
 *
 */
middlewareObj.isLoggedIn = function(req, res, next){
   // passport function (isAuthenticated())
   if(req.isAuthenticated()){
      return next(); // return terminates function
   }
   // redirect with flash key-value pair BEFORE redirect
   req.flash("error", "You must be logged in to proceed. Please log in or register."); // key-value pair; key = error
   res.redirect("/login"); // handle flash message @ /login route (see routes/index.js line #46)
}


/**
 * checks if user is author
 *
 * @params req
 * @params res
 * @params next
 *
 * @return boolean
 *
 */
middlewareObj.isAuthor = function(req, res, next){

   // check if user exists
   if(!req.user){
      // add flash message - you must be logged in
      req.flash('error', "Authorization required for access.");
      res.redirect('/login');
   } else {
      // check if user is author
      // find user
      User.findById(req.user._id, function(err, user){
         if(err){
            console.log(err);
            req.flash('error', 'Unable to find user. Please log in.');
            res.redirect('/login');
         } else {
            if(!user.isAuthor){
               // flash message - not authorized
               res.redirect('/');
            } else {
               return next();
            }
         }
      });
   }
}


/**
 * checks if user is author of this article
 *
 * @params req
 * @params res
 * @params next
 *
 * @return boolean
 *
 */
middlewareObj.isArticleAuthor = function(req, res, next){

   if(req.isAuthenticated()){
      // find article
      Article.findById(req.params.id)
      .populate('author')
      .exec(function(err, article){
         if(err){
            console.log(err);
            req.flash('error', "Unable to find article.");
            res.redirect('/articles');
            return;
         } else {
            // check if author ID of article matches user ID, using equals()
            // article.author.id is a mongoose object ID and req.user._id is a string
            // hence the comparison article.author.id === req.user._id fails
            if(article.author._id.equals(req.user._id)){
               next();
            } else {
               req.flash('error', 'Article can only be modified by its author.');
               res.redirect("back");
            }
         }
      });
   } else {
      req.flash('error', 'Unable to authenticate user. Please log in.');
      res.redirect('back');
   }
}


/**
 * checks if user is author of this comment
 *
 * @params req
 * @params res
 * @params next
 *
 * @return boolean
 *
 */
middlewareObj.isCommentAuthor = function(req, res, next){

   if(req.isAuthenticated()){
      // find comment
      Comment.findById(req.params.comment_id, function(err, comment){
         if(err){
            console.log(err);
            req.flash('error', 'Comment can only be modified by its author.');
            res.redirect('/articles');
         } else {
            // check if author ID of article matches user ID, using equals()
            // article.author.id is a mongoose object ID and req.user._id is a string
            // hence the comparison article.author.id === req.user._id fails
            if(comment.author.id.equals(req.user._id)){
               next();
            } else {
               // add flash message
               res.redirect("back");
            }
         }
      });
   } else {
      req.flash('error', 'Unable to authenticate user. Please log in.');
      res.redirect('back');
   }
}

// export
module.exports = middlewareObj; // object contains all methods
