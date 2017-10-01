// dependencies
var jimp = require('jimp');
var sizeOf = require('image-size');

var config = require('../config');

// create Object
var functionsObj = {};

functionsObj.randomString = function(length) {
    var token = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        token += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return token;
}

// http://www.jstips.co/en/javascript/get-file-extension/
functionsObj.getFileExtension = function(filename){
   return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys#Browser_compatibility
// https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object?noredirect=1&lq=1
functionsObj.isEmptyObject = function(obj){
   if(Object.keys(obj).length === 0 && obj.constructor === Object){
      return true;
   } else {
      return false;
   }
}

// store in variable for use in resizeImage()
var now = Date.now();
// configurations
var localPath      = `${config.uploadConfig.localPath}`;
var liveServerPath = `${config.uploadConfig.livePath}`;

functionsObj.createThumbImage = function(filename, width, height){
   jimp.read(localPath + filename, function(err, image){
      if(err){
         console.log(err);
         return false;
      } else {

         // console.log('==============================');
         // console.log('console.log(image)');
         // console.log(image); // displays wxh of image, e.g. <3264x1840>
         // console.log('==============================');
         //
         // var output = '';
         // for (var property in image) {
         //   output += property + ': ' + image[property]+'; ';
         // }
         // console.log('console.log(output)');
         // console.log(output);
         // // alert(output);
         // console.log('==============================');
         //
         // var str = JSON.stringify(image, null, 4);
         // console.log('console.log(str)');
         // console.log(str);
         // console.log('==============================');
         // return;

         // clone image
         var clone = image.clone();

         // resize and write to file
         clone.resize(width, height, jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_MIDDLE)
            .quality(90)
            // .greyscale()
            .write(localPath + 'thumb-' + filename, function(err, image){
               if(err){
                  console.log(err);
                  return false;
               } else {
                  return image;
               }
            });
      }
   });
}


functionsObj.createShowImage = function(filename, width, height){
   jimp.read(localPath + filename, function(err, image){
      if(err){
         console.log(err);
         return false;
      } else {

         // clone image
         var clone = image.clone();

         // resize and write to file
         clone.resize(width, height, jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_MIDDLE)
            .quality(90)
            // .greyscale()
            .write(localPath + 'show-' + filename, function(err, image){
               if(err){
                  console.log(err);
                  return false;
               } else {
                  return image;
               }
            });
      }
   });
}


// functionsObj.getImageDimensions = function(localPath){
//    sizeOf(localPath, function(err, dimensions){
//       if(err){
//          console.log(err);
//       } else {
//          // console.log(dimensions);
//          return dimensions;
//       }
//    });
// }


functionsObj.processArticleImage = function(req_files_image){
   // The name of the input field (i.e. "image") is used to retrieve
   // the uploaded file to move to server location (image is an object)
   var image = req_files_image;

   // Store filename in variable for naming and insertion into db
   var filename = req_files_image.name;

   // to lower case
   filename = filename.toLowerCase();

   // check file type
   var fileExt = functionsObj.getFileExtension(filename);

   // trim white space before & after
   fileExt = fileExt.trim();

   // to lower case
   fileExt = fileExt.toLowerCase();

   // console.log(`Typeof:  ${typeof(fileExt)}`);
   // console.log(`File extension: ${fileExt}`);

   // if(fileExt != 'jpg'){
   //    console.log('File is wrong type');
   // } else {
   //    console.log('File might be right type');
   // }
   // return;
   //
   // if(fileExt != 'jpg' || fileExt != 'jpeg' || fileExt != 'png' || fileExt != 'gif') {
   //    req.flash('error', 'Uploaded file is a ' + fileExt + ' file. It must be jpg, jpeg, png or gif.');
   //    return res.redirect('/articles/new');
   // }

   // create suffix
   var prefix = Date.now();

   // rename filename to match what resizeImage will name it
   filename = prefix + '-' + filename;

   console.log(filename);

   // upload configuration
   var localPath      = `${config.uploadConfig.localPath}${filename}`;
   var liveServerPath = `${config.uploadConfig.livePath}${filename}`;

   // Use the mv() method to place the file somewhere on your server
   image.mv(localPath, function(err) {
      if(err){
         req.flash('error', 'Error uploading image.');
      } else {

         // get dimensions (using image-size package)
         var dimensions = sizeOf(localPath);

         // https://nodejs.org/api/util.html#util_util_inspect_object_options
         // console.log(util.inspect(dimensions, { showHidden: true, depth:2 }));

         var imgWidth = dimensions.width;
         var imgHeight = dimensions.height;

         // console.log('========= IMAGE DIMENSIONS ==============');
         // console.log(`imgWidth: ${imgWidth}`);
         // console.log(`imgHeight: ${imgHeight}`);
         // console.log('=============================');

         // resize based on image dimensions
         functionsObj.createThumbImage(filename, 300, 200);

         // resize based on image dimensions
         functionsObj.createShowImage(filename, 600, 400);
      }
   });

   return filename;
}



// export
module.exports = functionsObj; // object contains all methods
