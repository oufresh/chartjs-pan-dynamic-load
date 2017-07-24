module.exports = function(app){
    var numericValues = require('./controllers/numericValues');
    var timeValues = require('./controllers/timeValues');
    app.get('/numeric', numericValues.getValues);
    app.get('/time',timeValues.getValues);
}