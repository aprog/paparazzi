var express = require('express');

var app = express();
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/paparazzi');
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://dev.backbone.localhost');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
}

app.set('views', __dirname + '/views');
app.use(express.logger('dev'));
app.use(express.static(__dirname + '/public'));
app.use(express.cookieParser('5a87a5b60ff6aabcc06da6ceb22e9ff8c1bfa2ac391e359d073927563bb12c86'));
app.use(express.session());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(allowCrossDomain);

require('./lib/boot')(app, {verbose: true});

app.listen(3000);
console.log('\nlistening on port 3000');
