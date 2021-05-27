var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');

/// ROUTES ///
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
let wikiRouter = require('./routes/wiki');
let catalogRouter = require('./routes/catalog'); // Import routes for "catalog" area of site

let compression = require('compression');
let helmet = require('helmet');

// Create the Express application object
var app = express();

// Set up mongoose connection
let mongoose = require('mongoose');
let mongoDB =
  'mongodb+srv://dbUser:dbUserPassword@cluster0.8goko.mongodb.net/local_library?retryWrites=true&w=majority';
mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

/// MIDDLEWARE ///
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true, // true = .sass and false = .scss
    sourceMap: true,
  })
);

app.use(compression()); // Compresses all routes
app.use(helmet());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/wiki', wikiRouter);
app.use('/catalog', catalogRouter); // Add catalog routes to middleware chain

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
