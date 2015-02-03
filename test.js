'use strict';

var path = require('path');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var assert = require('assert');
var level = require('level');
var accountdown = require('accountdown');

var Token = require('./');
var token = require('./token');

var dbPath = path.join(__dirname, 'tmp');

function close (db, err, done) {
  db._db.close(function () {
    if (err) return done(err);
    done();
  });
}

describe('accountdown-token', function () {
  beforeEach(function (done) {
    rimraf(dbPath, function (err) {
      if (err) return done(err);
      mkdirp.sync(dbPath);
      done();
    });
  });

  afterEach(rimraf.bind(rimraf, dbPath));

  it('should create a new accountdown instance with token authentication', function (done) {
    var db = accountdown(level(path.join(dbPath, 'test.db')), {
      login: { token: Token }
    });

    assert(db._logins.token instanceof Token, 'Expected token login to be an instance of Token');
    close(db, null, done);
  });

  it('should create a new account with a token value', function (done) {
    var db = accountdown(level(path.join(dbPath, 'test.db')), {
      login: { token: Token }
    });

    var opts = {
      login: { token: { username: 'doowb'} },
      value: { username: 'doowb'}
    };

    db.create('doowb', opts, function (err) {
      if (err) return close(db, err, done);

      db._db.get(['login', 'token', 'doowb'], function (err, user) {
        if (err) return close(db, err, done);
        assert(user.id === 'doowb', 'Expected id to equal doowb');
        assert(user.token != null, 'Expected token to be defined');
        assert(user.issued != null, 'Expected issued to be defined');
        assert(user.expiry != null, 'Expected expiry to be defined');
        assert(user.redeemed === false, 'Expected redeemed to be false');
        close(db, null, done);
      });
    });
  });

  it('should verify an account with a token value', function (done) {
    var db = accountdown(level(path.join(dbPath, 'test.db')), {
      login: { token: Token }
    });

    var opts = {
      login: { token: { username: 'doowb'} },
      value: { username: 'doowb'}
    };

    db.create('doowb', opts, function (err) {
      if (err) return close(db, err, done);

      db._db.get(['login', 'token', 'doowb'], function (err, user) {
        if (err) return close(db, err, done);
        db.verify('token', { username: 'doowb', token: user.token }, function (err, ok, id) {
          if (err) return close(db, err, null);
          assert(ok === true, 'Expected ok to be true');
          assert(id === 'doowb', 'Expected id to be doowb');
          close(db, null, done);
        });
      });
    });
  });

  it('should not verify an account with an invalid token value', function (done) {
    var db = accountdown(level(path.join(dbPath, 'test.db')), {
      login: { token: Token }
    });

    var opts = {
      login: { token: { username: 'doowb'} },
      value: { username: 'doowb'}
    };

    db.create('doowb', opts, function (err) {
      if (err) return close(db, err, done);

      db._db.get(['login', 'token', 'doowb'], function (err, user) {
        if (err) return close(db, err, done);
        db.verify('token', { username: 'doowb', token: 'invalid' }, function (err, ok, id) {
          if (err) return close(db, err, null);
          assert(ok === false, 'Expected ok to be false');
          assert(id === 'doowb', 'Expected id to be doowb');
          close(db, null, done);
        });
      });
    });
  });
});
