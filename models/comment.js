var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
   text: String,
   author:
   {
      id:
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"    // model being referred to with ObjectId
      },
      username: String, // email address
      name: String      // what displays
   },
   createdAt: {
      type: Date,
      default: Date.now
   }
});

module.exports = mongoose.model("Comment", commentSchema);
