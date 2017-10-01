var express = require('express');
var router = express.Router();
var methodOverride   = require("method-override");
var expressSanitizer = require("express-sanitizer");
var moment = require('moment');
var util =  require('util');
var sizeOf = require('image-size');
var multer = require('multer');

// controllers
var article_controller = require('../controllers/articleController');

// models
var Article = require('../models/article');
var User = require('../models/user');

// middleware
var middleware = require('../middleware');

// libraries
var funcLibrary = require('../funcLibrary');


//=========================
//  RESTful ROUTES
//=========================

/* GET request - display all articles on home page */
router.get('/', article_controller.index);

/* GET request - display all articles on article page */
router.get('/articles/', article_controller.articles_get);

/* GET request - to create Article */
router.get('/article/create', middleware.isAuthor, article_controller.article_create_get);

/* POST request - process new article */
router.post('/article/create', middleware.isAuthor, article_controller.article_create_post);

/* GET request - SHOW route - display detail of one article */
router.get('/article/:id', article_controller.article_show_details);

/* GET request - display form to update article */
router.get('/article/:id/update', middleware.isArticleAuthor, article_controller.article_update_get);

/* POST request - update article */
router.post('/article/:id/update', middleware.isArticleAuthor, article_controller.article_update_post);





// DELETE/DESTROY route - delete from db
router.delete('/articles/:id', middleware.isArticleAuthor, function(req, res){
   Article.findByIdAndRemove(req.params.id, function(err, result){
      if(err){
         console.log(err);
         res.redirect('/articles');
      } else {
         req.flash('success', 'Your article was successfully deleted!');
         res.redirect('/articles');
      }
   });
});


// articles by author route - display page of author's articles
router.get('/articles/authors/:id', function(req, res){

   // find aticles by author
    Article.find( {"author.id": req.params.id} ).sort( {createdAt: -1} ).exec(function(err, articles){
      if(err){
         console.log(err);
         return req.flash('error', 'Unable to find author.');
      } else {

         console.log(articles);

         // convert array to object (required if using mongoose)
         articles = articles.map(a => a.toObject());

         // loop thru and modify article.createdAt
         articles.forEach(function(article){
            // format date
            article.createdAt = moment(article.createdAt).format("MM-DD-YYYY");
            // console.log(article.createdAt);
         });

         res.render('authors/', {
            articles: articles,
            pagetitle: 'Articles by '
         });
      }
   });
});

// router.post('/upload', function(req, res, next){

var storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, 'uploads/')
},
filename: function (req, file, cb) {
   cb(null, file.fieldname + '-' + Date.now() + '.jpg');
  }
});

var upload = multer({ storage: storage }).single('image');

// req.file is the `imiage` file
// req.body will hold the text fields, if there were any
router.post('/upload', function (req, res) {

   // res.send('Connected  to upload route');
   // return;

   upload(req, res, function (err) {
      if (err) {
         // An error occurred when uploading
      }

      // Everything went fine
   })
});

// });



// file upload
// router.post('/upload', function(req, res){
//    if(!req.files){
//       return res.status(400).send('No files were uploaded');
//    }
//
//    console.log(req.files.image);
//
//    // The name of the input field (i.e. "image") is used to retrieve the uploaded file
//    var image = req.files.image;
//
//    // Store filename in variable
//    var filename = req.files.image.name;
//
//    // create suffix
//    var suffix = Date.now();
//
//    // append date stamp to uploaded filename
//    filename = filename + '-' + suffix;
//
//    // Use the mv() method to place the file somewhere on your server
//    image.mv(`C:/xampp/htdocs/blog/public/images/uploaded_images/${filename}` , function(err) {
//       if(err){
//          return res.status(500).send(err);
//       } else {
//          res.send('File uploaded!');
//       };
//    });
// });

module.exports = router;
