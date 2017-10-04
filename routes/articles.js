var express = require('express');
var router = express.Router();

// controllers
var article_controller = require('../controllers/articleController');

// models
var Article = require('../models/article');
var User = require('../models/user');

// middleware
var middleware = require('../middleware');

// libraries
var funcLibrary = require('../funcLibrary');


/* GET request - display all articles on home page */
router.get('/', article_controller.index);

/* GET request - display all articles on article page */
router.get('/articles/', article_controller.articles_get);

/* GET request - to create Article */
router.get('/article/create', middleware.isAuthor, article_controller.article_create_get);

/* POST request - process new article */
router.post('/article/create', middleware.isAuthor, article_controller.article_create_post);

/* GET request - SHOW route - display detail of one article */
router.get('/article/:id', article_controller.article_show_details);

/* GET request - display form to update article */
router.get('/article/:id/update', middleware.isArticleAuthor, article_controller.article_update_get);

/* POST request - update article */
router.post('/article/:id/update', middleware.isArticleAuthor, article_controller.article_update_post);

/* GET request - to delete article */
router.get('/article/:id/delete', middleware.isArticleAuthor, article_controller.article_delete_get);

/* POST request - delete article and any related comments */
router.post('/article/:id/delete', middleware.isArticleAuthor, article_controller.article_delete_post);

/* GET request - articles by author */
router.get('/articles/author/:id', article_controller.articles_author_get);



module.exports = router;
