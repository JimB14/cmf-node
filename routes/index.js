var express     = require('express');
var router      = express.Router();
var passport    = require("passport");
var nodemailer  = require('nodemailer');
var User        = require('../models/user');
var funcLibrary = require('../funcLibrary');

var register_controller = require('../controllers/registerController');

// - - - - - Authentication routes - - - - - - - - - - - - - - - - - //

/* GET request - display register form */
router.get('/register', register_controller.user_create_get);

/* POST request - create new user  */
router.post('/register', register_controller.user_create_post);



// add new user
// router.post('/register', function(req, res){
//    // sanitize data
//    var username = req.sanitize(req.body.username);  // email
//    var name = req.sanitize(req.body.name); // display name
//    var password = req.sanitize(req.body.password);
//    var password2 = req.sanitize(req.body.password2);
//
//    // check if empty
//    if(username === '' || name === '' || password === '' || password2 === ''){
//       req.flash('error', 'All fields are required');
//       return res.redirect('/register');
//    }
//
//    // check if passwords match
//    if(password != password2){
//       req.flash('error', 'Passwords do not match');
//       return res.redirect('/register');
//    }
//
//    // generate token
//    var token = funcLibrary.randomString(72);
//
//    // store user data in object
//    var newUser = new User({username: username, name: name, token: token});
//
//    // create new user object (register() will take User object & hash password)
//    User.register(newUser, password, function(err, user){
//       if(err){
//          console.log(err);
//          return res.render('register/');
//       } else {
//          console.log(user);
//
//          // - - - nodemailer - - - - - - - - - - - - - - - - - - - - - - - - //
//          // send email to user verify account with link
//          const output = `
//             <h2>Challenge My Faith</h2>
//             <h3>Account Validation</h3>
//             <p>Thanks ${user.name} for registering!</p>
//             <p>To validate your account <a href="http://challengemyfaith.com/registration/${token}">click here.</a></p>
//             <p>If you have received this message in error or did not register, please delete.</p>
//             <p style="color: #666;">End of message.</p>`;
//
//          // create reusable transporter object using the default SMTP transport
//          let transporter = nodemailer.createTransport({
//             host: 'mail.webmediapartners.com',
//             port: 587,
//             secure: false, // true for 465 (SSL), false for other ports
//             auth: {
//                user: 'test@webmediapartners.com', // generated ethereal user
//                pass: 'Hopehope1!'  // generated ethereal password
//             },
//             // required if using from local machine; remove or set to 'true' when you go live!
//             tls:{
//                rejectUnauthorized: false
//             }
//          });
//
//          // setup email data with unicode symbols
//          let mailOptions = {
//             from: '"CMF" <test@webmediapartners.com>', // sender address
//             to: user.username, // list of receivers
//             // bcc: 'jim.burns@webmediapartners.com',
//             subject: 'Registration', // Subject line
//             // text: 'Hello world?', // plain text body
//             html: output // html body
//          };
//
//          // send mail with defined transport object
//          transporter.sendMail(mailOptions, function(error, info) {
//             if (error) {
//                return console.log(error);
//             }
//             console.log('Message sent: %s', info.messageId);
//
//             // send flash message
//             // live server
//             // req.flash('success', 'Success! Welcome ' + user.name + '! Please check your email, and click the link to complete your registration.');
//
//             // local server
//             req.flash('success', 'Success! Welcome ' + user.name + '! <br><a href=/registration/' + token + '>Click here to complete your registration.</a>');
//
//             // redirect to home page
//             res.redirect('/');
//          });
//       }
//    });
// });


// add new user
router.get('/registration/:token', function(req, res){

   console.log(`Token: ${req.params.token}`);

   // get user data from user collection
   User.findOne({ token: req.params.token }, function(err, user){
      if(err){
         req.flash('error', 'User not found. Unable to complete registration.');
         return res.redirect('/');
      } else {
         console.log(user);

         // update user, set active = 1
         // http://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate
         User.findByIdAndUpdate(user._id , { active: 1 }, function(err, user){
            if(err){
               console.log(err);
               return req.flash('error', 'Unable to confirm registration');
            } else {
               req.flash('success', '<p>Congratulations! You have successfully completed your registration!</p><p>You can now log in.</p>');
               res.redirect('/');
            }
         });
      }
   });
});


// show log in form
router.get('/login', function(req, res){
   res.render('login/');
});


// process log in request & authenticate user credentials using middleware
router.post('/login', passport.authenticate("local",
   {
      successRedirect: "/",
      failureRedirect: "/login"
   }), function(req, res){
});


// logout (logout() destroys session)
router.get('/logout', function(req, res){
   req.logout();
   req.flash('success', 'You have been logged out.');
   res.redirect('/');
});

module.exports = router;
