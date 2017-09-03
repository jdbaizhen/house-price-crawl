var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var domain = require('domain');
var Domain = domain.create();
var index = require('./routes/index');
var ejs = require("ejs");
var app = express();
var dbUrl = 'mongodb://localhost:27017/fddPrice';

app.engine('.html', ejs.__express);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'dist'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist')));
app.use(session({
    secret : 'house',
    store : new mongoStore({
    	url : dbUrl,
    	collection : 'sessions'
    })
}));
app.use('/', index);
app.use('/favicon.ico',function(){
	return ;
});

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
