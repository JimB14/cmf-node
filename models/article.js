var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;


// create new Schema object
var articleSchema = new mongoose.Schema({
   title: {
      type: String,
      require: true
   },
   author: {
      type: Schema.Types.ObjectId,
      ref: "User",    // model being referred to with ObjectId
      require: true
   },
   image: {
      type: String
   },
   thumbImage:{
      type: String
   },
   showImage: {
      type: String
   },
   body:{
      type: String,
      require: true
   },
   comments: [
      {
         type: Schema.Types.ObjectId,
         ref: "Comment"
      }
   ],
   createdAt: {
      type: Date,
      default: Date.now
   },
   updatedAt: {
      type: Date,
      default: Date.now
   }
});

// Virtual for article's URL
articleSchema
.virtual('url')
.get(function() {
  return '/article/' + this._id;
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
