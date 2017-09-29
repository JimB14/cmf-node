// dependencies



// display registration form
exports.user_create_get = function(req, res, next){
   // render form
   res.render('register/', {
      title: 'Register'
   });
}


// handle user create on POST
exports.user_create_post = function(req, res, next){
   
   // sanitize data
   var username = req.sanitize(req.body.username);  // email
   var name = req.sanitize(req.body.name); // display name
   var password = req.sanitize(req.body.password);
   var password2 = req.sanitize(req.body.password2);

   // check if empty
   if(username === '' || name === '' || password === '' || password2 === ''){
      req.flash('error', 'All fields are required');
      return res.redirect('/register');
   }

   // check if passwords match
   if(password != password2){
      req.flash('error', 'Passwords do not match');
      return res.redirect('/register');
   }

   // generate token
   var token = funcLibrary.randomString(72);

   // store user data in object
   var newUser = new User({username: username, name: name, token: token});

   // create new user object (register() will take User object & hash password)
   User.register(newUser, password, function(err, user){
      if(err){
         console.log(err);
         return res.render('register/');
      } else {
         console.log(user);

         // - - - nodemailer - - - - - - - - - - - - - - - - - - - - - - - - //
         // send email to user verify account with link
         const output = `
            <h2>Challenge My Faith</h2>
            <h3>Account Validation</h3>
            <p>Thanks ${user.name} for registering!</p>
            <p>To validate your account <a href="http://challengemyfaith.com/registration/${token}">click here.</a></p>
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
            // req.flash('success', 'Success! Welcome ' + user.name + '! Please check your email, and click the link to complete your registration.');

            // local server
            req.flash('success', 'Success! Welcome ' + user.name + '! <br><a href=/registration/' + token + '>Click here to complete your registration.</a>');

            // redirect to home page
            res.redirect('/');
         });
      }
   });
}
