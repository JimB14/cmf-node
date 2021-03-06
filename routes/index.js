var express = require('express');
var router  = express.Router();

// controllers
var register_controller = require('../controllers/registerController');
var login_controller    = require('../controllers/loginController');


/* - - - - - Registration, Log In & Log Out routes - - - - - - - - - - - - - */


// * * * Register routes * * * //

/* GET request - display register form */
router.get('/register', register_controller.user_create_get);

/* POST request - create new user  */
router.post('/register', register_controller.user_create_post);

/* GET request - activate new user  */
router.get('/registration/:token', register_controller.user_activation_get);



// * * * Log In & Log Out routes * * * //

/* GET request - display log in form */
router.get('/login', login_controller.user_login_get);

/* POST request - process log in request */
router.post('/login', login_controller.user_login_post);

/* GET request - logout user */
router.get('/logout', login_controller.user_logout_get);



// * * * Forgot password routes * * * //

/* GET request - displays validate username form */
router.get('/get-new-password', login_controller.user_validate_get);

/* POST request - validate username exists & send email to username */
router.post('/get-new-password', login_controller.user_validate_post);

/* GET request - display Create New Password form */
router.get('/create-new-password/:token', login_controller.user_new_password_get);

/* POST request - create new password for user */
router.post('/create-new-password/:token', login_controller.user_new_password_post);


module.exports = router;
