// https://stackoverflow.com/questions/37247474/es6-in-jshint-jshintrc-has-esversion-but-still-getting-warning-using-atom
/*jshint esversion: 6 */

// dependencies
var expressValidator = require('express-validator');
var async = require('async');
var moment = require('moment');
var filter = require('leo-profanity');

// models
var Article = require('../models/article');
var Comment = require('../models/comment');
var User    = require('../models/user');

// libraries
var funcLibrary = require('../funcLibrary');

// configurations
var config = require('../config');


/* - - - - - CREATE GET - - - - - - - - - - - - - - - - - - - - - - - - - - - */

// display create comment form
exports.comment_create_get = function(req, res, next){

   Article.findById(req.params.id, function(err, article){
      if(err){
         console.log(err);
      } else {
         res.render('comments/create-update', {
            title: 'Add comment about ',
             article: article
          });
      }
   });
};


/* - - - - - -  CREATE POST - - - - - - - - - - - - - - - - - - - - - - - - - */

// post comment to comments collection in db
exports.comment_create_post = function(req, res, next){

   // validate
   req.checkBody('text', 'Please add a comment.').notEmpty();
   req.checkBody('text', 'Please explain your thinking.').isLength({ min: 20 });

   // sanitize
   req.sanitize('text').escape();

   // console.log('====== Unfiltered ====================');
   // console.log(req.body.text);
   // console.log('====== Filter applied ================');
   req.body.text = filter.clean(req.body.text);
   // console.log(req.body.text);
   // console.log('======================================');

   // create new comment object
   var comment = new Comment({
      text: req.body.text,
      'author.id': req.user.id,
      'author.username': req.user.username,
      'author.name': req.user.name,
      article: req.params.id
   });

   console.log('==================================');
   console.log(`NEW COMMENT: \n ${comment}`);
   console.log('==================================');
   // return;

   var errors = req.validationErrors();
   if(errors){

      // retrieve article data & re-display comment form
      Article.findById(req.params.id)
      .exec(function(err, article){
         if(err){
            console.log(err);
            return req.flash('error', 'Error retrieving article data.');
         } else {

            // render comment form with required data
            res.render('comments/create-update', {
               title: 'Add comment about ',
               article: article,
               comment: comment,
               errors: errors
            });
            return;
         }
      });

   } else {
      // form data is valid

      // get article data
      Article.findById(req.params.id)
      .exec(function(err, article){
         if(err){
            console.log(err);
            return req.flash('error', 'Unable to retrieve article data.');
         } else {
            // save comment object
            comment.save(function(err){
               if(err){
                  console.log(err);
                  return req.flash('error', 'Unable to save comment.');
               }

               console.log(`ARTICLE: \n${article}`);
               console.log('==================================');
               console.log(`COMMENT: \n${comment}`);
               console.log('==================================');
               console.log(`COMMENT ID: \n${comment._id}`);
               console.log('==================================');
               // return;

               // add comment to article.comments array
               article.comments.push(comment);

               // save article
               article.save();

               // redirect
               res.redirect(article.url); // virtual field
            });
         }
      });
   }
};


/* - - - - - - UPDATE GET - - - - - - - - - - - - - - - - - - - - - - - - - - */

// display update comment form
exports.comment_update_get = function(req, res, next){

   // sanitize & trim
   req.sanitize('id').escape();
   req.sanitize('id').trim();
   req.sanitize('comment_id').escape();
   req.sanitize('comment_id').trim();

   async.parallel({

      article: function(callback){
         Article.findById(req.params.id)
         .exec(callback);
      },
      comment: function(callback){
         Comment.findById(req.params.comment_id)
         .exec(callback);
      },

   }, function(err, results){
      if(err){
         console.log(err);
         return req.flash('error', 'Unable to retrieve article and comment data.');
      } else {
         res.render('comments/create-update', {
            title: 'Update commment about ',
            article: results.article,
            comment: results.comment
         });
      }
   });
};


/* - - - - - - UPDATE POST - - - - - - - - - - - - - - - - - - - - - - - - - */

// update comment
exports.comment_update_post = function(req, res, next){

   // sanitize id passed in
   req.sanitize('id').escape();
   req.sanitize('id').trim();
   req.sanitize('comment_id').escape();
   req.sanitize(' comment_id').trim();

   // validate
   req.checkBody('text', 'Please add a comment.').notEmpty();
   req.checkBody('text', 'Please explain your thinking.').isLength({ min: 20 });

   // sanitize & trim
   req.sanitize('text').escape();
   req.sanitize('text').trim();

   // filter
   req.body.text = filter.clean(req.body.text);

   // create new comment object
   var comment = new Comment({
      text: req.body.text,
      'author.id': req.user.id,
      'author.username': req.user.username,
      'author.name': req.user.name,
      article: req.params.id,
      _id: req.params.comment_id
   });

   var errors = req.validationErrors();
   if(errors){

      // get article data
      Article.findById(req.params.id)
      .exec(function(err, article){
         if(err){
            console.log(err);
            return req.flash('error', 'Unable to retrieve article data.');
         } else {
            // re-display form
            res.render('comments/create-update', {
               title: 'Update commment about ',
               article: article,
               comment: comment,
               errors: errors
            });
         }
      });
   } else {
      // form data is valid

      // get article data for reirect
      Article.findById(req.params.id)
      .exec(function(err, article){
         if(err){
            console.log(err);
            return req.flash('error', 'Unable to retrieve article data.');
         } else {
            // update comment in comments
            Comment.findByIdAndUpdate(req.params.comment_id, comment, function(err){
               if(err){
                  console.log(err);
                  return req.flash('error', 'Unable to save comment.');
               } else {
                  // redirect
                  res.redirect(article.url); // virtual field
               }
            });
         }
      });
   }
};


/* - - - - DELETE GET - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

exports.comment_delete_get = function(req, res, next){

   // sanitize id passed in
   req.sanitize('id').escape();
   req.sanitize('id').trim();
   req.sanitize('comment_id').escape();
   req.sanitize(' comment_id').trim();

   async.parallel({

      article: function(callback){
         Article.findById(req.params.id)
         .exec(callback);
      },
      comment: function(callback){
         Comment.findById(req.params.comment_id)
         .exec(callback);
      },
   }, function(err, results){
      if(err){
         console.log(err);
         return req.flash('error', 'Unable to retrieve article and comment data.');
      } else {
         // render page
         res.render('comments/delete', {
            title: 'Delete comment about ',
            article: results.article,
            comment: results.comment
         });
      }
   });
};


/* - - - - - - DELETE POST - - - - - - - - - - - - - - - - - - - - - - - - - */

exports.comment_delete_post = function(req, res, next){

   // validate hidden input data
   req.checkBody('articleid', 'Article ID is required').notEmpty();
   req.checkBody('commentid', 'Comment ID is required').notEmpty();

   // sanitize & trim
   req.sanitize('articleid').escape();
   req.sanitize('articleid').trim();
   req.sanitize('commentid').escape();
   req.sanitize('commentid').trim();

   console.log('==================================');
   console.log("Article ID: \n" + req.body.articleid);
   console.log('==================================');
   console.log("Comment ID: \n" + req.body.commentid);
   console.log('==================================');
   // return;

   // remove comment
   Comment.findByIdAndRemove(req.body.commentid, function(err){
      if (err){
         console.log(err);
         return req.flash('error', 'Unable to delete comment.');
      } else {

         // https://stackoverflow.com/questions/14763721/mongoose-delete-array-element-in-document-and-save
         // remove comment from article.comments
         Article.update({
            _id: req.body.articleid }, { $pullAll: { comments: [req.body.commentid] } }, function(err){
            if(err){
               console.log(err);
               return req.flash('error', 'Unable to delete comments from article.');
            } else {
               // success
               req.flash('success', 'Comment successfully deleted!');
               res.redirect(`/article/${req.body.articleid}`);
            }
         });
      }
   });
};
