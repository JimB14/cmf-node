var express = require('express');
var router = express.Router();
var methodOverride   = require("method-override");
var middleware = require('../middleware');
var Article = require('../models/article');
var User = require('../models/user');
var functions = require('../funcLibrary');
var expressSanitizer = require("express-sanitizer");
var moment = require('moment');
var util =  require('util');
var sizeOf = require('image-size');
var multer = require('multer');



//=========================
//  RESTful ROUTES
//=========================

// Index route - home (currently showing all articles)
router.get('/', function(req, res){

   Article.find({}).sort({ createdAt: -1 }).exec(function(err, articles){
      // check user status
      if(req.user){
         console.log(`Current user: ${req.user.name}, author: ${req.user.isAuthor}`);
      } else {
         console.log(`Current user: ${req.user}`);
      }

      if(err){
         console.log(err);
      } else {

         // convert array to object (required if using mongoose)
         // articles = articles.map(a => a.toObject());

         // loop thru and modify article.createdAt
         // articles.forEach(function(article){
         //    // format date
         //    article.createdAt = moment(article.createdAt).format("MM-DD-YYYY");
         //    // console.log(article.createdAt);
         // });

         res.render('articles/index', {
            pageTitle: 'Home',
            articles: articles
         });
      }
   });
});

// Index route - show all articles
router.get('/articles', function(req, res){
   Article.find({}).sort({ createdAt: -1 }).exec(function(err, articles){
      if(err){
         console.log(err);
      } else {

         // convert array to object (required if using mongoose)
         // articles = articles.map(a => a.toObject());

         // loop thru and modify article.createdAt
         // articles.forEach(function(article){
         //    // format date
         //    article.createdAt = moment(article.createdAt).format("MM-DD-YYYY");
         //    // console.log(article.createdAt);
         // });

         res.render('articles/articles', {
            pagetitle: 'Articles',
            articles: articles
         });
      }
   });
});


// NEW route - form to create new article
router.get('/articles/new', middleware.isAuthor, function(req, res){
   res.render('articles/new', {
   });
});


// CREATE route - create new article
router.post('/articles', middleware.isAuthor, function(req, res){

   // check for empty fields
   if(req.body.title === '' || req.body.body === ''){
      req.flash('error', 'Data missing in Title and/or Content fields. Please try again.');
      return res.redirect('/articles/new');
   }

   // find user
   User.findById(req.user._id, function(err, user){
      if(err){
         console.log(err);
         req.flash('error', 'Unable to find user');
         return res.redirect('/articles/new');
      } else {
         //  - - start image processing - - - - - - //

         // check if image was uploaded
         // if(functions.isEmptyObject(req.files)){
         //    console.log('Object is empty');
         // } else {
         //    console.log('Object is not empty');
         // }
         // return;

         // if image object exists (empty === false)
         if(functions.isEmptyObject(req.files) === false){

            // https://nodejs.org/api/util.html#util_util_inspect_object_options
            // console.log(util.inspect(req.files.image,{ showHidden: true, depth: 2 }));

            // The name of the input field (i.e. "image") is used to retrieve
            // the uploaded file to move to server location (image is an object)
            var image = req.files.image;

            // Store filename in variable for naming and insertion into db
            var filename = req.files.image.name;

            // to lower case
            filename = filename.toLowerCase();

            // check file type
            var fileExt = functions.getFileExtension(filename);

            // trim white space before & after
            fileExt = fileExt.trim();

            // to lower case
            fileExt = fileExt.toLowerCase();

            // console.log(`Typeof:  ${typeof(fileExt)}`);
            // console.log(`File extension: ${fileExt}`);

            // if(fileExt != 'jpg'){
            //    console.log('File is wrong type');
            // } else {
            //    console.log('File might be right type');
            // }
            // return;
            //
            // if(fileExt != 'jpg' || fileExt != 'jpeg' || fileExt != 'png' || fileExt != 'gif') {
            //    req.flash('error', 'Uploaded file is a ' + fileExt + ' file. It must be jpg, jpeg, png or gif.');
            //    return res.redirect('/articles/new');
            // }

            // create suffix
            var prefix = Date.now();

            // rename filename to match what resizeImage will name it
            filename = prefix + '-' + filename;

            // upload configuration
            var localPath = `C:/xampp/htdocs/blog/public/images/uploaded_images/${filename}`;
            var liveServerPath = `/images/uploaded_images/${filename}`;

            // Use the mv() method to place the file somewhere on your server
            image.mv(localPath, function(err) {
               if(err){
                  req.flash('error', 'Error uploading image.');
               } else {

                  // get dimensions (using image-size package)
                  var dimensions = sizeOf(localPath);

                  // https://nodejs.org/api/util.html#util_util_inspect_object_options
                  // console.log(util.inspect(dimensions, { showHidden: true, depth:2 }));

                  var imgWidth = dimensions.width;
                  var imgHeight = dimensions.height;

                  // console.log('=============================');
                  // console.log(`imgWidth: ${imgWidth}`);
                  // console.log(`imgHeight: ${imgHeight}`);
                  // console.log('=============================');

                  // resize based on image dimensions
                  functions.createThumbImage(filename, 300, 200);

                  // resize based on image dimensions
                  functions.createShowImage(filename, 600, 400);

               }
            });


            // sanitize user input
            var title = req.sanitize(req.body.title);
            var body  = req.sanitize(req.body.body);

            // store data from user object in object to be passed below
            var author = {
               id: req.user._id,
               username: req.user.username,
               name: req.user.name
            }

            // create new object from form data
            var newArticle = {title:title, image:filename, body:body, author:author};

            // add new article to articles Collection
            Article.create(newArticle, function(err, newArticle){
               if(err){
                  console.log(err);
               } else {

                  // console.log(newArticle);

                  // add new article data to user (to facilitate retrieving articles by user)
                  user.articles.push(newArticle);

                  // save user
                  user.save();

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

                        // console.log(article);

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
});


// SHOW route - display one article
router.get('/articles/:id', function(req, res){
   Article.findById(req.params.id).populate("comments").exec(function(err, article){
      if(err){
         console.log(err);
      } else {

         // mongoose requirement
         // http://mongoosejs.com/docs/guide.html#toObject
         if(article){
            // article = article.toObject();

            // format date
            // article.createdAt = moment(article.createdAt).format("MM-DD-YYYY");
            // console.log(`After format: ${article.createdAt}`);

            // format date
            // article.updatedAt = moment(article.updatedAt).format("MM-DD-YYYY");
            // console.log(`After format: ${article.updatedAt}`);
         }

         // store today's date in variable
         // var today = moment().format("MMMM, DD YYYY");

         // must pass moment to be able to format date
         res.render( 'articles/show', {
            article: article,
            pagetitle: 'Article'
         });
      }
   });
});




// EDIT route - display edit form
router.get('/articles/:id/edit', middleware.isArticleAuthor, function(req, res){

   // find article
   Article.findById(req.params.id, function(err, article){
      if(err){
         console.log(err);
         res.redirect('back');
      } else {
         res.render('articles/edit', {
            article: article
         });
      }
   });
});




// UPDATE route - update document/record in db
router.put('/articles/:id', middleware.isArticleAuthor, function(req, res){

   // no file uploaded
   if(!req.files){

      // retrieve & sanitize fields in form
      req.body.article.title = req.sanitize(req.body.article.title);

      // cannot sanitize body; it removes inline CSS from text-editor
      req.body.article.body = req.body.article.body;

      // store new data in object
      var updatedArticle = {
         title: req.body.article.title,
         body: req.body.article.body
      }

      // find by ID & update database collection - takes three parameters (ID, data, callback)
      Article.findByIdAndUpdate(req.params.id, updatedArticle, function(err, article){
         if(err){
            console.log(err);
            req.flash('error', 'Sorry, unable to update article.');
            return res.redirect('/articles');
         } else {
            // flash message
            req.flash('success', 'Your article was successfully updated!');

            // redirect
            res.redirect(`/articles/${req.params.id}`);
         }
      });
   } else {
      // file uploaded

      // The name of the input field (i.e. "image") is used to retrieve
      // the uploaded file to move to server location (image is an object)
      var image = req.files.image;

      // Store filename in variable for naming and insertion into db
      var filename = req.files.image.name;

      // to lower case
      filename = filename.toLowerCase();

      // check file type
      var fileExt = functions.getFileExtension(filename);

      // trim white space before & after
      fileExt = fileExt.trim();

      // to lower case
      fileExt = fileExt.toLowerCase();

      // check if valid file type (jpg, jpeg, png, gif)
      // if(fileExt != 'jpg'){
      //    console.log('File is wrong type');
      // } else {
      //    console.log('File might be right type');
      // }
      // return;

      // check file type
      if(fileExt !== 'jpg' || fileExt !== 'jpeg' || fileExt !== 'png' || fileExt !== 'gif') {
         req.flash('error', 'Uploaded file is a ' + fileExt + ' file. It must be jpg, jpeg, png or gif.');
         res.redirect('/articles/new');
         return;
      }

      // create suffix
      var prefix = Date.now();

      // rename filename to match what resizeImage will name it
      filename = prefix + '-' + filename;

      // upload configuration
      var localPath = `C:/xampp/htdocs/blog/public/images/uploaded_images/${filename}`;
      var liveServerPath = `/images/uploaded_images/${filename}`;

      // Use the mv() method to place the file somewhere on your server
      image.mv(localPath, function(err) {
         if(err){
            req.flash('error', 'Error uploading image.');
         } else {

            // get dimensions (using image-size package)
            var dimensions = sizeOf(localPath);

            // https://nodejs.org/api/util.html#util_util_inspect_object_options
            // console.log(util.inspect(dimensions, { showHidden: true, depth:2 }));

            var imgWidth = dimensions.width;
            var imgHeight = dimensions.height;

            // console.log('=============================');
            // console.log(`imgWidth: ${imgWidth}`);
            // console.log(`imgHeight: ${imgHeight}`);
            // console.log('=============================');

            // resize based on image dimensions
            functions.createThumbImage(filename, 300, 200);

            // resize based on image dimensions
            functions.createShowImage(filename, 600, 400);

            // retrieve & sanitize fields in form
            req.body.article.title = req.sanitize(req.body.article.title);

            // cannot sanitize body; it removes inline CSS from text-editor
            req.body.article.body  = req.body.article.body;

            // rename file for db insertion below (will match resized name)
            var newFilename = 'thumb-' + filename;
            var newShowImage = 'show-' + filename;

            // store new data in object
            var updatedArticle = {
               title: req.body.article.title,
               body: req.body.article.body,
               thumbImage: newFilename,
               showImage: newShowImage
            }

            // find by ID & update database collection - takes three parameters (ID, data, callback)
            Article.findByIdAndUpdate(req.params.id, updatedArticle, function(err, article){
               if(err){
                  console.log(err);
                  req.flash('error', 'Sorry, unable to update article.');
                  return res.redirect('/articles');
               } else {
                  // flash message
                  req.flash('success', 'Your article was successfully updated!');

                  // redirect
                  return res.redirect(`/articles/${req.params.id}`);
               }
            });
         }
      });
   }
});


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
