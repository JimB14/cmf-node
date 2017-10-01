var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var commentSchema = new mongoose.Schema({
   text: String,
   author:
   {
      type: Schema.Types.ObjectId,
      ref: "User"    // model being referred to with ObjectId
   },
   createdAt: {
      type: Date,
      default: Date.now
   }
});

module.exports = mongoose.model("Comment", commentSchema);
