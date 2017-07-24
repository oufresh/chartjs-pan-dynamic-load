var express = require('express');
var fs = require('fs');
var app = express();

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function InitData(start, stop)
{
	fs.access('./data.json', (err) => {
  		if (!err) {
    		console.log('data.json exists');
    		return;
  		}
		
		console.log('data.json does not exist');
		var data = [];
  
		console.log('data.json init');
		for (var i = 0; i <= stop; i++)
			data.push({x: i, y: randomIntFromInterval(0,20)});

		var json = JSON.stringify(data);

		fs.writeFile('./data.json', json, 'utf8', (err) => {
			console.log('data.json write ' + err);
		});
	});
}

InitData(0, 500);

app.use(express.static('public'));

require('./routes')(app);

var server = app.listen(8082, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

});