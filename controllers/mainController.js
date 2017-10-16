// https://stackoverflow.com/questions/37247474/es6-in-jshint-jshintrc-has-esversion-but-still-getting-warning-using-atom
/*jshint esversion: 6 */

// dependencies
var expressValidator = require('express-validator');
var nodemailer       = require('nodemailer');
var passport         = require("passport");

// configurations
var config = require('../config');


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



// process contact form
exports.contact_page_post = function(req, res, next){

   res.send('Connected to contact_page_post in mainController!');
   return;

   
   // validate
   req.checkBody('email', 'Email is required.').notEmpty();
   req.checkBody('email', 'Valid email address is required.').isEmail();
   req.checkBody('firstname', 'First name is required.').notEmpty();
   req.checkBody('lastname', 'Last name is required.').notEmpty();
   req.checkBody('message', 'Message is required.').notEmpty();

   // sanitize
   req.sanitize('email').escape();
   req.sanitize('firstname').escape();
   req.sanitize('lastname').escape();
   req.sanitize('message').escape();

   // trim
   req.sanitize('email').trim();
   req.sanitize('firstname').trim();
   req.sanitize('lastname').trim();

   // check for errors
   var errors = req.validationErrors();
   if (errors) {

      // re-render form
      res.render('contact/index', {
         title: 'Contact ',
         errors: errors,
         email: req.body.email,
         firstname: req.body.firstname,
         lastname: req.body.lastname,
         message: req.body.message
      });

   } else {

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

      // create email body
      var output = `
         <h2>Challenge My Faith</h2>
         <h3>Contact Form Data</h3>
         <p><strong>From: </strong> ${req.body.firstname} ${req.body.lastname}</p>
         <p><strong>Email: </strong> ${req.body.email}</p>
         <p>Message: </p>
         <p>${req.body.message}</p>
         <p style="color: #666;">End of message</p>
      `;

      // set mail configuration
      var mailOptions = {
         to: `${config.mail.gmailAccount}`, // to Jim Burns
         from: `"CMF site visitor" ${config.mail.testWmpAccount}`,
      // bcc: config.mail.jimWmpAccount,
         subject: 'Contact Form Submission',
         html: output // html body
      };

      // send mail
      smtpTransport.sendMail(mailOptions, function(err){
         if(err){

            console.log(err);
            req.flash('error', 'Unable to send mail. Please try again.');
            return res.redirect('/contact');

         } else {

            console.log('Mail sent!');
            req.flash('success', 'Your message has been delivered! <br>Thank you for contacting us.');
            res.redirect('back');
         }
      });
   }
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
