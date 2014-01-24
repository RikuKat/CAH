
var path = require('path');
var recursive_readdir = require('recursive-readdir');


exports.loadAllFilesRecursively = function loadAllFilesRecursively(app, directory) {
  recursive_readdir(app.get("currentDirectory") + directory, function (err, files) {
    if (files)
    {
      for(i=0; i<files.length; i++) {
        if (path.extname(files[i]) === '.js') {
          try {
            require(files[i])(app);
          } catch (e) {
            // if you get "object is not a function" make sure you have module.export wrapper
            console.log("("+e.message+") "+ files[i]);
          }
        }
      }
    }
  });
};


