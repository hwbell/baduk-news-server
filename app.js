var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var collectionsRouter = require('./routes/collections');
var usersRouter = require('./routes/users');
var threadsRouter = require('./routes/threads');

var app = express();

// for maintenance
// app.use((req, res, next) => {
  // res.status(503).send('Site currently under maintenance, check back soon!')
// })

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// for cors pre-flight requests
var cors = require('cors');
app.options('*', cors());
app.use(cors());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/collections', collectionsRouter);
app.use('/users', usersRouter);
app.use('/threads', threadsRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
