// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('../..')(server);
var port = process.env.PORT || 3000;
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var dbUrl = 'mongodb://localhost:27017/messagedb';
var msgArray = [];

server.listen(port, function () {
  console.log('Server listenis typing at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom

var numUsers = 0;

  // Write a message to database
var saveMsgToDb = function (db, username, msg, callback) {
  db.collection('messageLog').insertOne({
    "username": username,
    "time": (new Date()).getTime(),
    "msg": msg,
  }, function(err, result) {
    assert.equal(err, null);
    console.log("Saved a message to messageDB");
    callback();
  })
};

var addUserToDb = function (db, btccAccount, username, callback) {
  db.collection('user').insertOne({
    "account": btccAccount,
    "username": username,
    "privilege": 'user',
    "isBanned": false
  }, function(err, result) {
    assert.equal(err, null);
    console.log("Add a user to userDB");
    callback();
  })
};


var updateUserToDb = function (db, callback, username, isBanned) {
  db.collection('user').updateOne(
  { "username": username },
  {
    $set: { "isBanned": isBanned }
  }, function (err, results) {
    console.log(results);
    callback();
  });
};

var queryMsgFromDb = function (db, callback) {
  msgArray = [];
  var cursor = db.collection('messageLog').find();
  cursor.each(function(err, data) {
    assert.equal(err, null);
    if (data != null) {
      msgArray.push(data);
    } else {
      callback();
    }
  });
};

var queryUserFromDb = function (db, callback, username) {

}

io.on('connection', function (socket) {
  var addedUser = false;
  // show log from database
  
  socket.on('show message', function(data) {
    MongoClient.connect(dbUrl, function(err, db) {
      assert.equal(null, err);
      queryMsgFromDb(db, function() {
        db.close();
      });
    });
    socket.emit('show message', msgArray);
  });

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data,
      time: (new Date()).getTime()
    });
    MongoClient.connect(dbUrl, function(err, db) {
      assert.equal(null, err);
      saveMsgToDb(db, socket.username, data, function() {
        db.close();
      });
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
