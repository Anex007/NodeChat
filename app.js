let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let session = require('express-session');
let MongoClient = require('mongodb').MongoClient;
let index = require('./routes/index');
let chatroom = require('./routes/chatroom');
let login = require('./routes/login');
let join = require('./routes/join');
let logout = require('./routes/logout');
let users = require('./routes/users');
let ai = require('./routes/AI');
let app = express();

// Security Stuff here
app.disable('x-powered-by');
app.enable('trust proxy');

// Session Database Storage.
var MongoDBStore = require('connect-mongodb-session')(session);
var store = new MongoDBStore(
{
	uri: 'mongodb://localhost:27017/chatroom',
        collection: 'mySessions'
});
store.on('error', function(error) {
      assert.ifError(error);
      assert.ok(false);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
	secret: 'SOME_SECRET_HERE',
	cookie : { maxAge: 1000 * 60 * 60 * 24 * 2 },
	store: store,
	saveUninitialized: false,
	resave:true
	}));
app.use(express.static(path.join(__dirname, 'public')));

// for using database as global
var url = 'mongodb://localhost:27017/chatroom';
MongoClient.connect(url, function(err, db){
  if(err){
	console.log('Error while connecting to the database', err);
  }else{
	app.locals.db = db;
  }

});

app.use('/', index);
app.use('/logout', logout);
app.use('/chatroom', chatroom);
app.use('/users', users);
// This middle ware is for the /login and /join paths were if they have a valid session redirect them to /chatroom.
app.use(function(req, res, next){
	if (req.session.auth && (req.url == '/login' || req.url == '/join') ){
		res.redirect('/chatroom');
	}else{
		next();
	}
});
app.use('/AI', ai);
app.use('/login', login);
app.use('/join', join);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  res.status = 404;
  res.render('404');
  //next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === '[TEST]development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
