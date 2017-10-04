var express = require('express');
var router = express.Router();

// controllers
var comment_controller = require('../controllers/commentController');

// models
var Article = require('../models/article');
var Comment = require('../models/comment');
var User = require('../models/user');

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





// DESTROY route - deletes comment from DB
router.delete("/articles/:id/comments/:comment_id", middleware.isCommentAuthor, function(req, res){
   Comment.findByIdAndRemove(req.params.comment_id, function(err, result){
      if(err){
         console.log(err);
         // req.flash("error", "Error. Unable to delete comment");
         res.redirect("back");
      } else {
         // req.flash("success", "Comment successfully deleted!");
         res.redirect(`/articles/${req.params.id}`);
      }
   });
});


module.exports = router;
