var express = require('express');
var router = express.Router();
var filter = require('leo-profanity');
var Article = require('../models/article');
var Comment = require('../models/comment');
// require middleware
var middleware = require('../middleware');

// NEW comment
router.get('/articles/:id/comments/new', middleware.isLoggedIn, function(req, res){
   Article.findById(req.params.id, function(err, article){
      if(err){
         console.log(err);
      } else {
         res.render('comments/new', { article: article });
      }
   });
});


// CREATE comment: post comment & associate comment with article
router.post('/articles/:id/comments', middleware.isLoggedIn, function(req, res){
   // find article (will push comment to it below)
   Article.findById(req.params.id, function(err, article){
      if(err){
         console.log(err);
         res.redirect('/articles');
      } else {
         // check if data was submitted
         if(req.body.comment.text === ''){
            req.flash('error', 'An empty comment form was submitted. Please try again.');
            res.redirect(`/articles/${req.params.id}`);
         } else {
            // santize data
            req.body.comment.text = req.sanitize(req.body.comment.text);

            // apply profanity filter
            req.body.comment.text = filter.clean(req.body.comment.text);

            // create new document in comments collection via Comment model
            Comment.create(req.body.comment, function(err, comment){
               if(err){
                  console.log(err);
               } else {
                  // console.log(`New comment's author's name is: ${req.user}`);

                  // add more data: logged in user's ID & name to new comment document
                  comment.author.id = req.user._id;
                  comment.author.username = req.user.username;
                  comment.author.name = req.user.name;

                  // save comment (document) to comments collection
                  comment.save();

                  // add comment to comments attribute of article model (article.comments)
                  article.comments.push(comment);

                  // save article after adding new comment
                  article.save();

                  // redirect user to article using SHOW route
                  res.redirect(`/articles/${req.params.id}`);
               }
            });
         }
      }
   });
});



// EDIT route - displays edit form for one comment
router.get("/articles/:id/comments/:comment_id/edit", middleware.isCommentAuthor, function(req, res){ // note key ":comment_id" to distinguish two IDs
   // find article
   Article.findById(req.params.id, function(err, article){
      if(err){
         res.redirect("back");
      } else {
         // find comment
         Comment.findById(req.params.comment_id, function(err, comment){
            if(err){
               res.redirect("back");
            } else {
               // render view/template & pass article object and comment ID
               res.render("comments/edit", {
                  article: article,
                  comment: comment
               });
            }
         });
      }
   });
});


// UPDATE route - updates record in DB
router.put("/articles/:id/comments/:comment_id", middleware.isCommentAuthor, function(req, res){

   // retrieve & sanitize description field in form
   req.body.comment.text = req.sanitize(req.body.comment.text);

   // takes three parameters (ID, data, callback)
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, comment){
      if(err){
         // req.flash("error", "Error. Unable to update comment");
         res.send("back");
      } else {
         console.log(comment);
         // req.flash("success", "Comment successfully updated!");
         res.redirect(`/articles/${req.params.id}`);
      }
   });
});


// DESTROY route - deletes comment from DB
router.delete("/articles/:id/comments/:comment_id", middleware.isCommentAuthor, function(req, res){
   Comment.findByIdAndRemove(req.params.comment_id, function(err, result){
      if(err){
         console.log(err);
         // req.flash("error", "Error. Unable to delete comment");
         res.redirect("back");
      } else {
         // req.flash("success", "Comment successfully deleted!");
         res.redirect(`/articles/${req.params.id}`);
      }
   });
});


module.exports = router;
