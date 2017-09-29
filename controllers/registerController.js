// dependencies
var expressValidator = require('express-validator');
var User = require('../models/user');



// display registration form
exports.user_create_get = function(req, res, next){
   // render form
   res.render('register/', {
      title: 'Register'
   });
}


// handle user create on POST
exports.user_create_post = function(req, res, next){

   // validate data
   req.checkBody('username', 'Email is required.').notEmpty();  // email
   req.checkBody('name', 'First name is required.').notEmpty();
   req.checkBody('password', 'Password of at least 6 characters required.').notEmpty().isLength({ min: 6 });
   req.checkBody('password2', 'Password confirmation is required.').notEmpty();

   // sanitize
   req.sanitize('username').escape();
   req.sanitize('password').escape();
   req.sanitize('password2').escape();

   // trim
   req.sanitize('username').trim();
   req.sanitize('password').trim();
   req.sanitize('password2').trim();

   // check if passwords match
   req.checkBody('password','Passwords do not match. Please try again.').equals(req.body.password2);

   // check for errors
   var errors = req.validationErrors();

   // generate token
   var token = funcLibrary.randomString(72);

   // create new user
   var user = new User({
      username: req.body.username,
      name: req.body.name,
      token: token
   });

   // check if empty
   if(errors){
      res.render('register/', {
         title: 'Register',
         errors: errors,
         user: user
      });
   } else {
      // user data okay

      // create new user object (register() will take User object & hash password)
      User.register(user, req.body.password, function(err, user){
         if(err){
            console.log(err);
            return next(err);
         } else {
            console.log(`New USER: ${user}`);

            // - - - nodemailer - - - - - - - - - - - - - - - - - - - - - - - - //
            // send email to user verify account with link
            const output = `
               <h2>Challenge My Faith</h2>
               <h3>Account Validation</h3>
               <p>Thanks ${user.name} for registering!</p>
               <p>To validate your account <a href="https://cmf-node.herokuapp.com/registration/${token}">click here.</a></p>
               <p>If you have received this message in error or did not register, please delete.</p>
               <p style="color: #666;">End of message.</p>`;

            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
               host: 'mail.webmediapartners.com',
               port: 587,
               secure: false, // true for 465 (SSL), false for other ports
               auth: {
                  user: 'test@webmediapartners.com', // generated ethereal user
                  pass: 'Hopehope1!'  // generated ethereal password
               },
               // required if using from local machine; remove or set to 'true' when you go live!
               tls:{
                  rejectUnauthorized: false
               }
            });

            // setup email data with unicode symbols
            let mailOptions = {
               from: '"CMF" <test@webmediapartners.com>', // sender address
               to: user.username, // list of receivers
               // bcc: 'jim.burns@webmediapartners.com',
               subject: 'Registration', // Subject line
               // text: 'Hello world?', // plain text body
               html: output // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, function(error, info) {
               if (error) {
                  return console.log(error);
               }
               console.log('Message sent: %s', info.messageId);

               // send flash message

               // live server
               req.flash('success', 'Success! Welcome ' + user.name + '! Please check your email, and click the link to complete your registration.');

               // local server
               // req.flash('success', 'Success! Welcome ' + user.name + '! <br><a href=/registration/' + token + '>Click here to complete your registration.</a>');

               // redirect to home page
               res.redirect('/');
            });
         }
      });
   }
}
