// https://stackoverflow.com/questions/37247474/es6-in-jshint-jshintrc-has-esversion-but-still-getting-warning-using-atom
/*jshint esversion: 6 */

// dependencies
var expressValidator = require('express-validator');
var nodemailer       = require('nodemailer');
var passport         = require("passport");

var async            = require('async');

// crypto is a part of node js not a package
var crypto           = require('crypto');

// models
var User = require('../models/user');

// function library
var funcLibrary = require('../funcLibrary');

// configurations
var config = require('../config');


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
exports.user_logout_get = function (req, res){
   req.logout();
   req.flash('success', 'You have been logged out.');
   res.redirect('/');
};



// display get new password form
exports.user_validate_get = function(req, res){
   // render form
   res.render('login/validate-user', {
      title: "Get New Password "
   });
};



// process create new password
exports.user_validate_post = function(req, res){

   // validate
   req.checkBody('username', 'Email is required.').notEmpty();
   req.checkBody('username', 'Valid email is required.').isEmail();

   // sanitize
   req.sanitize('username').escape();

   // trim
   req.sanitize('username').trim();

   // check for errors
   var errors = req.validationErrors();
   if(errors){

      // re-render the form with errors & form data
      res.render('login/validate-user', {
         title: 'Get New Password ',
         errors: errors,
         username: req.body.email
      });

   } else {

      // data is valid
      console.log(`Email: ${req.body.username}`);

      // resource: https://www.youtube.com/watch?time_continue=198&v=UV9FvlTySGg

      // array of functions to fire synchronously
      async.waterfall([
         function(done){
            crypto.randomBytes(20, function(err, buf){
               var token = buf.toString('hex');
               done(err, token);
            });
         },
         function(token, done){
            User.findOne( { username: req.body.username }, function(err, user){
               if(!user) {
                  req.flash('error', 'No account with that email exists.');
                  return res.redirect('/login');
               }

               user.resetPasswordToken = token;
               user.resetPasswordExpires = Date.now() + 3600000; // = 1 hour

               user.save(function(err){

                  done(err, token, user);
               });
            });
         },
         function(token, user, done){

            // create reusable transporter object using the default SMTP transport
            var transporter = nodemailer.createTransport({
               host: 'mail.webmediapartners.com',
               port: 587,
               secure: false, // true for 465 (SSL), false for other ports
               auth: {
                  user: config.mail.testWmpAccount, // generated ethereal user
                  pass: config.mail.testWmpPassword  // generated ethereal password
               },
               // required if using from local machine; remove or set to 'true' when you go live!
               tls:{
                  rejectUnauthorized: false
               }
            });

            // create email body (includes link toroute to create new password)
            var output = `
               <h2>Challenge My Faith</h2>
               <p>Hi ${user.fullname},</p>
               <p>A request was made to create a new password for your account.</p>
               <p>To create a new password <a href="http://${req.headers.host}/create-new-password/${token}">click here.</a></p>
               <p>The link expires in one hour.</p>
               <p>If you did not make this request, please ignore and delete this email.</p>
               <p>Thank you,</p>
               <p>ChallengeMyFaith.com</p>
               <p style="color: #666;">End of message.</p>
            `;

            // setup email data with unicode symbols
            var mailOptions = {
               to: user.username,
               from: `"CMF" ${config.mail.testWmpAccount}`, // reply to address                                             // list of receivers
               bcc: config.mail.jimWmpAccount,
               subject: 'Create new password', // Subject line
               // text: 'Hello world?', // plain text body
               html: output // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, function(err) {

               if(err){
                  return res.send('Unable to send confirmation email.');
               }

               console.log('Message successfully sent');

               // success message
               req.flash('success', 'Success! \n' + user.fullname + ', please check your email, and click the link to create a new password.');
               done(err, 'done');
            });
         }
      ], function(err){
         if(err) return next(err);
         res.redirect('/get-new-password');
      });
   }
};



// display create new password form
exports.user_new_password_get = function(req, res, next){

   //  escape & trim param
   req.sanitize('token').escape();
   req.sanitize('token').trim();

   // find match (param token === user.resetPasswordToken)
   User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user){
      if(!user){
         req.flash('error', 'Password reset token is invalid or has expired.');
         return res.redirect('/create-new-password');
      }

      console.log(`User: \n${user}`);

      // render create new password form & pass user data
      res.render('login/create-new-password', {
         title: 'Create New Password ',
         user: user,
         token: req.params.token
      });
   });
};



// update password
exports.user_new_password_post = function(req, res, next){

   // validate data
   req.checkBody('password', 'Password is required.').notEmpty();
   req.checkBody('password', 'Password must be at least 6 characters').isLength({ min: 6 });
   req.checkBody('password2', 'Password confirmation is required.').notEmpty();
   req.checkBody('password','Passwords do not match. Please try again.').equals(req.body.password2);

   // sanitize
   req.sanitize('password').escape();
   req.sanitize('password2').escape();

   // trim
   req.sanitize('password').trim();
   req.sanitize('password2').trim();

   // check for errors
   var errors = req.validationErrors();
   if (errors) {

      // re-render create new password form & display user errors
      res.render('login/create-new-password', {
         title: 'Create New Password',
         errors: errors
      });

      // find match (param token === user.resetPasswordToken)
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user){
         if(!user){
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/create-new-password');
         }
      });

   } else {

      // update password
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user){
         if(!user){
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
         }

         // check user data
         console.log(`USER FOUND: ${user}`);

         // setPassword is a passport-local-mongoose method that
         // encrypts, hashes, etc. like register()
         user.setPassword(req.body.password, function(err){
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            // save user & log in user
            user.save(function(err){
               req.logIn(user, function(err){
               });

               // create reusable transporter object using the default SMTP transport
               var smtpTransport = nodemailer.createTransport({
                  host: 'mail.webmediapartners.com',
                  port: 587,
                  secure: false, // true for 465 (SSL), false for other ports
                  auth: {
                     user: config.mail.testWmpAccount, // generated ethereal user
                     pass: config.mail.testWmpPassword  // generated ethereal password
                  },
                  // required if using from local machine; remove or set to 'true' when you go live!
                  tls:{
                     rejectUnauthorized: false
                  }
               });

               // create email body (includes link toroute to create new password)
               var output = `
                  <h2>Challenge My Faith</h2>
                  <p>Hi ${user.fullname},</p>
                  <p>This email confirms that the password for your account ${user.username} has just been changed.</p>
                  <p>The next time you log in, you will need to use your new password.</p>
                  <p>Thank you,</p>
                  <p>ChallengeMyFaith.com</p>
                  <p style="color: #666;">End of message.</p>
               `;

               // setup email data with unicode symbols
               var mailOptions = {
                  to: user.username,
                  from: `"CMF" ${config.mail.testWmpAccount}`, // reply to address                                             // list of receivers
                  bcc: config.mail.jimWmpAccount,
                  subject: 'Password has been changed', // Subject line
                  // text:  // plain text body
                  html: output // html body
               };

               // send mail with defined transport object
               smtpTransport.sendMail(mailOptions, function(err) {
                  if(err){
                     console.log(err);
                     req.flash('error', 'Unable to send confirmation email.');
                     return res.redirect('/');
                  } else {
                     console.log('Confirmation email successfully sent');

                     // success message
                     req.flash('success', 'Success! Your password was changed. <br>You are now logged in.');
                     res.redirect('/');
                  }
               });
            });
         });
      });
   }
};
