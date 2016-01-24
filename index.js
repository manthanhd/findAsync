var userArgs = process.argv.slice(2);

if(!userArgs || userArgs.length == 0) {
    console.log("Find path must be provided.");
    process.exit(1);
}

var parentDirectory = userArgs[0];

var fs = require("fs");
lstat = fs.lstatSync(parentDirectory);
var isDirectory = lstat.isDirectory();
if(isDirectory === false) {
    console.log(parentDirectory + " is not a directory.");
    process.exit(1);
}

var nameParam = findParam("-name", true);
if(!nameParam) {
    console.log("-name attribute must be provided with a value.");
    process.exit(1);
}

var listMode = findParam("-type", true);
if(!listMode) {
    listMode = "a";
} else {
    switch(listMode.paramValue) {
        case "a":
        case "d":
        case "f":   break;
        default:    console.log("Invalid list mode. Must be one of 'a', 'd', 'f'."); process.exit(1);
    }
    listMode = listMode.paramValue;
}

var srch;
var regexSearch = findParam("-regex");
if(!regexSearch) {
    var escapedNameParam = escapeRegExp(nameParam.paramValue);
    srch = new RegExp(escapedNameParam, "i");
} else {
    var regexNameParam = makeRegExp(nameParam.paramValue);
    srch = new RegExp(regexNameParam);
}

var fileList =  walkSync(listMode, srch, parentDirectory);

// List all files in a directory in Node.js recursively in a synchronous fashion
function walkSync(listMode, searchParams, dir, filelist) {
  var fs = fs || require('fs'),
      files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
      var stat = fs.statSync(dir + file);
      var isDirectory = stat.isDirectory();

      if(searchParams.test(file) === true) {
          if(listMode === "a") {
            //   filelist.push(dir + file);
            console.log(dir + file);
          } else {
              if(listMode === "d" && isDirectory === true) {
                //   filelist.push(dir + file);
                console.log(dir + file);
              } else if(listMode === "f" && isDirectory === false) {
                //   filelist.push(dir + file);
                console.log(dir + file);
              }
          }
      }

      if (isDirectory) {
        filelist = walkSync(listMode, searchParams, dir + file + '/', filelist);
      }
  });
  return filelist;
};

function findParam(paramName, isKeyValue) {
    for(var i = 0; i < userArgs.length; i++) {
        var arg = userArgs[i];
        if(arg === paramName) {
            return (isKeyValue && isKeyValue === true) ? {param: arg, paramValue: userArgs[i+1]} : {param: arg};
        }
    }

    return undefined;
};

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

function makeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\.$&");
};
