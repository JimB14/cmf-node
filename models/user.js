var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
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
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ],
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
  return '/user/' + this._id;
});



// passportLocalMongoose adds functionality to the User Model
// https://github.com/saintedlama/passport-local-mongoose
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
