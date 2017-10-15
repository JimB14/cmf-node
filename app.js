// dependencies
var express           = require('express');
var fileUpload        = require('express-fileupload');
var ejs               = require('ejs');
var mongoose          = require('mongoose');
var bodyParser        = require('body-parser');
var expressSanitizer  = require('express-sanitizer');
var expressValidator  = require('express-validator');
var methodOverride    = require('method-override');
var flash             = require('connect-flash'); // above passport
var filter            = require('leo-profanity');
var moment            = require('moment');
var jimp              = require('jimp');
var sizeOf            = require('image-size');

// login / authentication
var passport              = require('passport');
var LocalStrategy         = require('passport-local');
var passportLocalMongoose = require('passport-local-mongoose');

// configurations
var config = require('./config');

// require models
var User    = require('./models/user');

// require middleware
var middleware = require('./middleware');
var funcLibrary = require('./funcLibrary');

// require routes
var article = require('./routes/articles');
var comment = require('./routes/comments');
var index   = require('./routes/index');
var main    = require('./routes/main');

// CONFIGURATIONS
// set port for heroku or local machine using environment variable
var port = process.env.PORT || 80;

// store express in constant
var app = express();

// http://mongoosejs.com/docs/connections.html#use-mongo-client
// connect to db
// cannot use @ in password (syntax:  mongodb://<dbuser>:<dbpassword>@host:port/dbname)
// var url = `mongodb://${config.dbConfig.username}:${config.dbConfigMlab.password}@${config.dbConfig.host}:${config.dbConfig.port}/${config.dbConfig.dbname}`;
var url = 'mongodb://localhost/cmf';
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
app.use(expressValidator()); // https://www.npmjs.com/package/express-validator


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


app.listen(port, function(){
   console.log(`Server running on ${port}`);
});
