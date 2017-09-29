var express     = require('express');
var router      = express.Router();
var passport    = require("passport");
var nodemailer  = require('nodemailer');
var User        = require('../models/user');
var funcLibrary = require('../funcLibrary');

// - - - - - static page routes - - - - - - - - - - - - - - - - - //

// Show about page
router.get('/about', function(req, res){
   res.render('about/', {
      pagetitle: 'About'
   });
});


// Show contact page
router.get('/contact', function(req, res){
   res.render('contact/', {
      pagetitle: 'Contact'
   });
});

// Show contact page for article submission
router.get('/contact/article-submission', function(req, res){
   res.render('contact/article-submission', {
      pagetitle: 'Article Submission'
   });
});


module.exports = router;
