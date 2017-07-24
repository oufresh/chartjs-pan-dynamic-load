var fs = require('fs');
const pathExists = require('path-exists');
var mkdirp = require('mkdirp');
var copy = require('copy');
 
console.log("Prestart app");
pathExists('./public/js').then(exists => {
    if (!exists)
        mkdirp("./public/js");

    console.log("Copying js files ...");
    copy('./src/js/*.js', './public/js', function(err, files){
        if (err)
            console.error("Error copying js");
    });

    copy.one('./node_modules/chart.js/dist/Chart.js', './public/js', {flatten: true}, function(err, files){
        if (err)
            console.error("Error copying Chart.js");
    });

    copy.one('./node_modules/chartjs-plugin-zoom/chartjs-plugin-zoom.js', './public/js', {flatten: true}, function(err, files){
        if (err)
            console.error("Error copying chartjs-plugin-zoom.js");
    });

    copy.one('./node_modules/moment/moment.js', './public/js', {flatten: true}, function(err, files){
        if (err)
            console.error("Error copying moment.js");
    });

    copy.one('./node_modules/hammerjs/hammer.js', './public/js', {flatten: true}, function(err, files){
        if (err)
            console.error("Error copying moment.js");
    });
});

pathExists('./public/css').then(exists => {
    if (!exists)
        mkdirp("./public/css");

    console.log("Copying css files ...");
    copy('./src/css/*.css', './public/css', function(err, files){
        if (err)
            console.error("Error copying css");
    });
});

console.log("Copying index file ...");
copy.one('./src/index.html', './public', {flatten: true}, function(err, files){
    if (err)
        console.error("Error copying index.html");
});

console.log("End prestart app");