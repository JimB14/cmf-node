var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var commentSchema = new Schema({
   text: String,
   author: {
      id:
      {
         type: Schema.Types.ObjectId,
         ref: "User"    // model being referred to with ObjectId
      },
      username: String, // email address
      name: String      // what displays
   },
   article: {
      type: Schema.Types.ObjectId,
      ref: "Article"
   },
   createdAt: {
      type: Date,
      default: Date.now
   }
});

// Virtual for comment author
commentSchema
.virtual('comment_author_name')
.get(function() {
  return author.name;
});

module.exports = mongoose.model("Comment", commentSchema);
