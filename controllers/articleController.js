// dependencies
var expressValidator = require('express-validator');
var nodemailer       = require('nodemailer');
var moment = require('moment');
var util   =  require('util');
var sizeOf = require('image-size');
var multer = require('multer');

// models
var Article = require('../models/article');
var User = require('../models/user');

// libraries
var funcLibrary = require('../funcLibrary');

// configurations
var config = require('../config');



// display articles on home page
exports.index = function(req, res, next){

   Article.find({})
   .sort({ createdAt: -1 })
   .populate('author')
   .exec(function(err, articles){
      // check user status
      if(req.user){
         console.log(`Current user: ${req.user.name}, author: ${req.user.isAuthor}`);
      } else {
         console.log(`Current user: ${req.user}`);
      }

      if(err){
         console.log(err);
         return next(err);
      } else {
         res.render('articles/index', {
            pageTitle: 'Home',
            articles: articles
         });
      }
   });
}


// display articles on articles page
exports.articles_get = function(req, res, next){

   Article.find({})
   .sort({ createdAt: -1 })
   .populate('author')
   .exec(function(err, articles){
      if(err){
         console.log(err);
      } else {
         res.render('articles/articles', {
            pagetitle: 'Articles',
            articles: articles
         });
      }
   });
}


// display create new article form
exports.article_create_get = function(req, res, next){
   res.render('articles/create-update', {
      title: 'Create New Article'
   });
}


// process new article
exports.article_create_post = function(req, res, next){

   // validate
   req.checkBody('title', 'Title is required.').notEmpty();
   req.checkBody('body', 'Content is required.').notEmpty();
   req.checkBody('body', 'Content is too short.').isLength({ min: 10 });

   // sanitize
   req.sanitize('title').escape();

   // create new article
   var article = new Article({
      title: req.body.title,
      image: req.body.image,
      body: req.body.body,
      author: req.user._id
   });

   // check for errors
   var errors = req.validationErrors();
   if(errors){
      console.log(errors);
      // re-render form with user data
      res.render('articles/create-update', {
         title: 'Create New Article ',
         article: article,
         errors: errors
      });
      return;

   } else {
      // find user
      User.findById(req.user._id, function(err, user){
         if(err){
            console.log(err);
            req.flash('error', 'Unable to find user');
            res.redirect('/articles/create-update');
            return;
         } else {
            //  - - start image processing - - - - - - //

            // check if image was uploaded
            // if image object exists (empty === false)
            if(funcLibrary.isEmptyObject(req.files) === false){

               // https://nodejs.org/api/util.html#util_util_inspect_object_options
               // console.log(util.inspect(req.files.image,{ showHidden: true, depth: 2 }));

               // process image & return filename
               var filename = funcLibrary.processArticleImage(req.files.image);

               // add new article to articles Collection
               Article.create(article, function(err, newArticle){
                  if(err){
                     console.log(err);
                     return req.flash('error', 'Unable to create article.');
                  } else {

                     // rename file for db insertion below (will match resized name)
                     var newFilename = 'thumb-' + filename;
                     // console.log(`Updated filename: ${newFilename}`);

                     var newShowImage = 'show-' + filename;
                     // console.log(`Updated filename: ${newShowImage}`);

                     // update image field to match filename from resizeImage()
                     Article.findByIdAndUpdate(newArticle._id, { $set:{thumbImage: newFilename, showImage: newShowImage } }, function(err, article){
                        if(err){
                           console.log(err);
                           return req.flash('error', 'Unable to update image value');
                        } else {

                           // flash message
                           req.flash('success', 'Your new article was successfully submitted!');

                           // redirect to home/index page
                           res.redirect('/');
                        }
                     });
                  }
               });
            }
         }
      });
   }
}


// SHOW route - display details of one article
exports.article_show_details = function(req, res, next){

   Article.findById(req.params.id)
   .populate('author')
   .populate('comments')
   .exec(function(err, article){
      if(err){
         console.log(err);
         return req.flash('error', 'Unable to display article.');
      } else {
         res.render('articles/show', {
            article: article
         });
      }
   });
}


// UPDATE route - display article update form
exports.article_update_get = function(req, res, next){

   //  escape & trim param
   req.sanitize('id').escape();
   req.sanitize('id').trim();

   // find article
   Article.findById(req.params.id)
   .populate('author')
   .exec(function(err, article){
      if(err){
         console.log(err);
         res.redirect('back');
      } else {
         res.render('articles/create-update', {
            title: 'Update Article ',
            article: article
         });
      }
   });
}



// UPDATE route - handle article update
exports.article_update_post = function(req, res, next){

   // validate data
   req.checkBody('title', 'Title is required').notEmpty();
   req.checkBody('body', 'Article content is required.').notEmpty();

   // sanitize
   req.sanitize('title').escape();
   // req.sanitize('body').escape();

   var article = new Article({
      title: req.body.title,
      body:  req.body.body,
      _id:   req.params.id  // to update, new article object MUST have same ID
   });

   console.log(`UPDATED ARTICLE: ${article}`);

   var errors = req.validationErrors();
   if(errors){
      // re-render form with user data
      res.render('articles/create-update', {
         title: 'Update Article ',
         article: article,
         errors: errors
      });

   } else {
      // no file uploaded
      if(typeof req.files.image === 'undefined'){

         // find by ID & update database collection - takes three parameters (ID, data, callback)
         Article.findByIdAndUpdate(req.params.id, article, function(err, thearticle){
            if(err){
               console.log(err);
               req.flash('error', 'Sorry, unable to update article.');
               return res.redirect('/articles');
            } else {
               // flash message
               req.flash('success', 'Your article was successfully updated!');

               // redirect to article (using virtual field)
               res.redirect(thearticle.url);
               return;
            }
         });
      } else {
         //  image was uploaded

         // process image & return filename
         var filename = funcLibrary.processArticleImage(req.files.image);

         // rename file for db insertion below (will match resized name)
         var newFilename = 'thumb-' + filename;
         var newShowImage = 'show-' + filename;

         // store new data in object
         var articleWithImage = new Article({
            title: req.body.title,
            body: req.body.body,
            thumbImage: newFilename,
            showImage: newShowImage,
            _id: req.params.id
         });

         // find by ID & update database collection - takes three parameters (ID, data, callback)
         Article.findByIdAndUpdate(req.params.id, articleWithImage, function(err, thearticle){
            if(err){
               console.log(err);
               req.flash('error', 'Sorry, unable to update article.');
               return res.redirect('/articles');
            } else {
               // flash message
               req.flash('success', 'Your article with a new image was successfully updated!');

               // redirect
               return res.redirect(thearticle.url);
            }
         });
      }
   }
}
