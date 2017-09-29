// dependencies
var jimp = require('jimp');
var sizeOf = require('image-size');

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
var localPath = 'C:/xampp/htdocs/blog/public/images/uploaded_images/';
var liveServerPath = '/images/uploaded_images/';

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



// export
module.exports = functionsObj; // object contains all methods
