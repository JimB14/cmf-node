// dependencies
const express               = require('express');
const fileUpload            = require('express-fileupload');
const ejs                   = require('ejs');
const mongoose              = require('mongoose');
const bodyParser            = require('body-parser');
const expressSanitizer      = require('express-sanitizer');
const methodOverride        = require('method-override');
const flash                 = require('connect-flash'); // above passport
const filter                = require('leo-profanity');
const moment                = require('moment');
const jimp                  = require('jimp');
const sizeOf                = require('image-size');

// login / authentication
const passport              = require('passport');
const LocalStrategy         = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');

// require models
// var Article = require('./models/article');
var User    = require('./models/user');
// var Comment = require('./models/comment');

// require middleware
var middleware = require('./middleware');

var functions = require('./funcLibrary');

// var seedDB  = require('./seeds.js');

// require routes
var article = require('./routes/articles');
var comment = require('./routes/comments');
var index   = require('./routes/index');
var main    = require('./routes/main');

// CONFIGURATIONS
// set port for heroku or local machine using environment variable
const port = process.env.PORT || 3050;

// store express in constant
const app = express();

// clear database and re-populate
// seedDB();

// http://mongoosejs.com/docs/connections.html#use-mongo-client
// connect to db
// cannot use @ in password (syntax:  mongodb://<dbuser>:<dbpassword>@host:port/dbname)
var url = `mongodb://${config.dbConfig.username}:${config.dbConfig.password}@${config.dbConfig.host}:${config.dbConfig.port}/${config.dbConfig.dbname}`;
// var url = 'mongodb://localhost/blog';
mongoose.connect(url);
var db = mongoose.connection;

// fix to eliminate error message
mongoose.Promise = global.Promise;

// test connection
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function(){
   console.log('Connection to MongoDB established!');
});

// load view engine;
app.set('view engine', 'ejs');

// parse application/x-www-form-urlencoded
// https://www.npmjs.com/package/body-parser
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());

// tell express to serve static contents from public directory
// __dirname = directory in which script is running
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(fileUpload());
app.use(flash()); // above passport configuration
// must be BELOW use bodyParser
app.use(expressSanitizer());


// PASSPORT CONFIGURATION (order critical for proper functionality!)
app.use(require("express-session")({
    secret: "Cooper is our new puppy.",
    resave: false,
    saveUninitialized: false
}));

// required if using passport-local-mongoose package
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
// https://github.com/saintedlama/passport-local-mongoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware to pass req.user with every request
app.use(function(req, res, next){
   // I can't interpret this "copy me" code
   res.locals.currentUser = req.user;
   res.locals.error = req.flash('error');
   res.locals.success = req.flash('success');
   res.locals.today = moment().format("MMMM DD, YYYY");
   next();
});

// to truncate repeated code, e.g. app.use('articles/:id/comments', commentRoutes);
app.use(article);
app.use(comment);
app.use(index);
app.use(main);

// Article.create({
//    title: 'Article Six',
//    body: 'Content of Article Six'
// }, function(err, article){
//    console.log(article);
// });

// Article.create({
//    title: 'Article Nine',
//    body: 'Content of Article Nine'
// }, function(err, article){
//    User.findOne({username: "Leo Burns"}, function(err, user){
//       if(err){
//          console.log(err);
//       } else {
//          user.articles.push(article);
//          user.save(function(err, user){
//             if(err){
//                console.log(err);
//             } else {
//                console.log(user);
//             }
//          });
//       }
//    });
// });

// User.create({
//    email: "leo@gmail.com",
//    username: "Leo Burns",
//    password: "123456"
// }, function(err, user){
//    if(err){
//       console.log(err);
//    } else {
//       console.log(user);
//    }
// });

// User.findOne({email: "leo@gmail.com"}).populate("articles").exec(function(err, user){
//    if(err){
//       console.log(err);
//    } else {
//       console.log(user);
//    }
// });

// console.log(__dirname + 'public/images/uploaded_images/1505590809517-IMG_20140219_081437_400_Dorie_Leo.jpg');
// console.log('C:/xampp/htdocs/blog/public/images/uploaded_images/1505590809517-IMG_20140219_081437_400_Dorie_Leo.jpg');
// return;
// jimp.read('C:/xampp/htdocs/blog/public/images/uploaded_images/1505590809517-IMG_20140219_081437_400_Dorie_Leo.jpg', function(err, image){
//    if(err){
//       console.log(err);
//    } else {
//       var clone = image.clone();
//       clone.resize(300, jimp.AUTO)
//          .quality(90)
//          .write('C:/xampp/htdocs/blog/public/images/uploaded_images/dorie-leo-2017-300w-autoh.jpg')
//    }
// });

// takes 2 arguments: filename & new width
// var result = functions.resizeImage('Dorie_Leo.jpg', 300);
// console.log(result);
// return;


app.listen(port, function(){
   console.log(`Server running on ${port}`);
});
