var mongoose = require('mongoose');
var moment = require('moment');


// create new Schema object
var articleSchema = new mongoose.Schema({
   title:
   {
      type: String
   },
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
   image:
   {
      type: String
   },
   thumbImage:
   {
      type: String
   },
   showImage:
   {
      type: String
   },
   body:
   {
      type: String
   },
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
   },
   updatedAt:
   {
      type: Date,
      default: Date.now
   }
});

// virtual for createdAt date
articleSchema
.virtual('createdAt_virtual') // pass virtual property's name
.get(function(){
   return moment(this.createdAt).format("MM-DD-YYYY");
});

// virtual for updatedAt date
articleSchema
.virtual('updatedAt_virtual')
.get(function(){
   return moment(this.updatedAt).format("MM-DD-YYYY");
});

module.exports = mongoose.model('Article', articleSchema);
