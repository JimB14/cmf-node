// http://encodedna.com/jquery/get-file-size-before-uploading-using-javascript-and-jquery.htm
getFileSize = function() {

   var fi = document.getElementById('image'); // GET THE FILE INPUT.

   // VALIDATE OR CHECK IF ANY FILE IS SELECTED.
   if (fi.files.length > 0) {
      // RUN A LOOP TO CHECK EACH SELECTED FILE.
      for (var i = 0; i <= fi.files.length - 1; i++) {

         var fsize = fi.files.item(i).size;      // THE SIZE OF THE FILE.
         // document.getElementById('filesize').innerHTML =
         document.getElementById('filesize').innerHTML =
         'File size in KB is: <b>' + parseFloat((fsize / 1024)).toFixed(1) + '</b> KB (max = 2,000 KB)' +
         '<br>File size in MB is: <b>' + parseFloat((fsize / 1024000)).toFixed(1) + '</b> MB (max = 2 MB)';
         // document.getElementById('imageSize').value(fsize);
      }
   }
}


var getFormattedDate = function(){

   var date = new Date();
   var month = date.getMonth();
   var day = date.getDay();
   var year = date.getYear();

   var today = month + ' - ' + day + ' - ' + year;

   return today;
}
