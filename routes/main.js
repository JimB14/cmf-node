var express = require('express');
var router  = express.Router();

// controllers
var main_controller = require('../controllers/mainController');

// middleware
var middleware = require('../middleware');

// libraries
var funcLibrary = require('../funcLibrary');

// - - - - - static page routes - - - - - - - - - - - - - - - - - //

/* GET request - display about page */
router.get('/about', main_controller.about_page_get);

/* GET request - display contact page */
router.get('/contact', main_controller.contact_page_get);

/* POST request - process contact form */
router.post('/contact', main_controller.contact_page_post);

/* GET request - display article submission page */
router.get('/article-submission', main_controller.article_submission_page_get);

/* GET request - display terms and conditions page */
router.get('/terms-and-conditions', main_controller.terms_page_get);



module.exports = router;
