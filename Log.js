var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('../..')(server);
var port = process.env.PORT || 2999;
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var dbUrl = 'mongodb://localhost:27017/messagedb';
var msgArray = [];

function queryMsgFromDb (db, callback) {
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

MongoClient.connect(dbUrl, function(err, db) {
  assert.equal(null, err);
  queryMsgFromDb(db, function() {
    console.log("Connected to MongoDB, query message log successfully");
    db.close();
  });
});