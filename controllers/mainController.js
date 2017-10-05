// https://stackoverflow.com/questions/37247474/es6-in-jshint-jshintrc-has-esversion-but-still-getting-warning-using-atom
/*jshint esversion: 6 */

// dependencies
var expressValidator = require('express-validator');
var nodemailer       = require('nodemailer');
var passport         = require("passport");


// display about page
exports.about_page_get = function(req, res){
   res.render('about/', {
      title: 'About'
   });
};



// display contact page
exports.contact_page_get = function(req, res){
   res.render('contact/', {
      title: 'Contact'
   });
};



// display article submission page
exports.article_submission_page_get = function(req, res){
   res.render('articlesubmission/', {
      title: 'Article Submission'
   });
};



// display terms and conditions page
exports.terms_page_get = function(req, res){
   res.render('terms/', {
      title: 'Terms and Conditions'
   });
};
