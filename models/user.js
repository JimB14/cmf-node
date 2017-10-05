var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var Schema = mongoose.Schema;

var UserSchema = new Schema({
   username:
   {
      type: String,
      lowercase: true,
      trim: true,
      require: true,
      unique: true
   },
   password:
   {
      type:String,
      lowercase: true,
      trim: true,
      minlength: 6,
      require: true
   },
   name:
   {
      type: String,
      trim: true
   },
   isAuthor:
   {
      type: Boolean,
      default: false
   },
   active:
   {
      type: Number,
      default: 0
   },
   token: String,
   createdAt:
   {
      type: Date,
      default: Date.now
   }
});

// Virtual for article's URL
UserSchema
.virtual('url')
.get(function() {
  return '/articles/author/' + this._id;
});



// passportLocalMongoose adds functionality to the User Model
// https://github.com/saintedlama/passport-local-mongoose
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
