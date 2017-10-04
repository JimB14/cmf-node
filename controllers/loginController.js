// https://stackoverflow.com/questions/37247474/es6-in-jshint-jshintrc-has-esversion-but-still-getting-warning-using-atom
/*jshint esversion: 6 */

// dependencies
var expressValidator = require('express-validator');
var nodemailer       = require('nodemailer');
var passport         = require("passport");


// display log in form
exports.user_login_get = function(req, res, next){
   // render form
   res.render('login/', {
      title: 'Log In'
   });
};


// process log in request (authenticate user credentials using passport middleware)
exports.user_login_post = passport.authenticate("local",
   {
      successRedirect: "/",
      failureRedirect: "/login"
   }), function(req, res){
      
};


// log out user ( logout() destroys session )
exports.user_logout_get = function (req, res, next){
   req.logout();
   req.flash('success', 'You have been logged out.');
   res.redirect('/');
};
