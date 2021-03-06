// https://stackoverflow.com/questions/37247474/es6-in-jshint-jshintrc-has-esversion-but-still-getting-warning-using-atom
/*jshint esversion: 6 */

// dependencies
var expressValidator = require('express-validator');
var nodemailer       = require('nodemailer');

// models
var User = require('../models/user');

// function library
var funcLibrary = require('../funcLibrary');

// configurations
var config = require('../config');



// display registration form
exports.user_create_get = function(req, res, next){
   // render form
   res.render('register/', {
      title: 'Register'
   });
};


// handle user create on POST
exports.user_create_post = function(req, res, next){

   console.log('you reached user_create_post!');
   console.log(req.body.username);
   // return;

   // validate data
   req.checkBody('username', 'Email is required.').notEmpty();  // email
   req.checkBody('username', 'Valid email is required.').isEmail();
   req.checkBody('firstname', 'First name is required.').notEmpty();
   req.checkBody('lastname', 'Last name is required.').notEmpty();
   req.checkBody('password', 'Password is required.').notEmpty();
   req.checkBody('password', 'Password must be at least 6 characters').isLength({ min: 6 });
   req.checkBody('password2', 'Password confirmation is required.').notEmpty();
   req.checkBody('password','Passwords do not match. Please try again.').equals(req.body.password2);

   // sanitize
   req.sanitize('username').escape();
   req.sanitize('firstname').escape();
   req.sanitize('lastname').escape();
   req.sanitize('password').escape();
   req.sanitize('password2').escape();

   // trim
   req.sanitize('username').trim();
   req.sanitize('firstname').trim();
   req.sanitize('lastname').trim();
   req.sanitize('password').trim();
   req.sanitize('password2').trim();


   // generate token
   var token = funcLibrary.randomString(72);

   console.log(`TOKEN: \n${token}`);

   // create new user
   var user = new User({
      username: req.body.username,
      'name.first': req.body.firstname,
      'name.last': req.body.lastname,
      token: token
   });

   console.log(`USER: \n${user}}`);
   // return;

   // check for errors
   var errors = req.validationErrors();

   console.log('ERRORS:');
   console.log(errors);
   // return;

   // check if empty
   if(errors){
      // re-render register form
      res.render('register/', {
         title: 'Register',
         errors: errors,
         user: user
      });
   } else {
      // user data okay

      // create new user object (register() in passport-local-mongoose will take
      // User object & hash password)
      User.register(user, req.body.password, function(err, user){
         if(err){
            console.log(err);
            return res.send(err.message);
         } else {

            console.log(`New USER: ${user}`);
            // return res.send('Script stopped');

            // - - - nodemailer - - - - - - - - - - - - - - - - - - - - - - - //
            // send email to user to verify account with link
            const output = `
               <h2>Challenge My Faith</h2>
               <h3>Account Validation</h3>
               <p>Thanks ${user.fullname} for registering!</p>
               <p>To validate your account <a href="http://${req.headers.host}/registration/${token}">click here.</a></p>
               <p>If you have received this message in error or did not register, please delete.</p>
               <p style="color: #666;">End of message.</p>`;

            // create reusable transporter object using the default SMTP transport
            var transporter = nodemailer.createTransport({
               host: 'mail.webmediapartners.com',
               port: 587,
               secure: false, // true for 465 (SSL), false for other ports
               auth: {
                  user: config.mail.testWmpAccount,  // email account
                  pass: config.mail.testWmpPassword  // password
               },
               // do not fail on invalid certs
               tls: {
                  rejectUnauthorized: false
               }
            });

            // setup email data with unicode symbols
            var mailOptions = {
               from: `"CMF" <${config.mail.testWmpAccount}>`,  // sender address
               to: user.username, // list of receivers
               // bcc: 'name@domain.com',
               subject: 'Registration', // Subject line
               // text: 'Hello world?', // plain text body
               html: output // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, function(error, info) {
               if (error) {
                  console.log(error);
                  return res.send('Error sending confirmation email to: ' + user.username);
               }
               console.log('Message sent: %s', info.messageId);

               // send flash message
               req.flash('success', 'Success! Welcome ' + user.fullname + '! \nPlease check your email, and click the link to complete your registration.');

               // redirect to home page
               res.redirect('/');
            });
         }
      });
   }
};



exports.user_activation_get = function(req, res, next){

   console.log(`Token: ${req.params.token}`);

   //  escape & trim param
   req.sanitize('token').escape();
   req.sanitize('token').trim();

   // get user data from user collection
   User.findOne({ token: req.params.token }, function(err, user){
      if(err){
         req.flash('error', 'User not found. Unable to complete registration.');
         return res.redirect('/');
      } else {
         console.log(user);

         // update user, set active = 1
         // http://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate
         User.findByIdAndUpdate(user._id, { active: 1 }, function(err, user){
            if(err){
               console.log(err);
               return req.flash('error', 'Unable to confirm registration');
            } else {
               req.flash('success', '<p>Congratulations! You have successfully completed your registration!</p><p>You can now Log In.</p>');
               res.redirect('/');
            }
         });
      }
   });
};
