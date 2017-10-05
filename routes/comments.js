var express = require('express');
var router = express.Router();

// controllers
var comment_controller = require('../controllers/commentController');

// middleware
var middleware = require('../middleware');

// libraries
var funcLibrary = require('../funcLibrary');


/* GET request - CREATE route - display create comment form */
router.get('/article/:id/comment/create', middleware.isLoggedIn, comment_controller.comment_create_get);

/* POST request - create comment */
router.post('/article/:id/comment/create', middleware.isLoggedIn, comment_controller.comment_create_post);

/* GET request - display update comment form */
router.get('/article/:id/comment/:comment_id/update', middleware.isCommentAuthor, comment_controller.comment_update_get);

/* POST request - update comment */
router.post('/article/:id/comment/:comment_id/update', middleware.isCommentAuthor, comment_controller.comment_update_post);

/* GET request - to delete comment */
router.get('/article/:id/comment/:comment_id/delete', middleware.isCommentAuthor, comment_controller.comment_delete_get);

/* POST request - to delete comment */
router.post('/article/:id/comment/:comment_id/delete', middleware.isCommentAuthor, comment_controller.comment_delete_post);



module.exports = router;
