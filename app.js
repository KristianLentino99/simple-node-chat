var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const {MongoClient} = require('mongodb');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

const uri = "mongodb+srv://kristian:Kristian!99@cluster0-dmuxd.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
var database,collection;
client.connect(err => {
  /*const collection = client.db("test").collection("devices");*/
  database = client.db("test");
  collection = database.collection("people");
  // perform actions on the collection object
  console.log(collection.insert({name:'Kristian',surname: 'Lentino'},(error, result) => {
    if (error) {
      console.log(error);
    }
    console.log(result);
  } ));
  client.close();
});

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


io.sockets.on('connection', function(socket) {
  socket.on('username', function(username) {
    socket.username = username;
    io.emit('is_online', '🔵 <i>' + socket.username + ' join the chat..</i>');
  });

  socket.on('disconnect', function(username) {
    io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
  })

  socket.on('chat_message', function(message) {
    io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
  });

});

const server = http.listen(8080, function() {
  console.log('listening on *:8080');
});

module.exports = app;

