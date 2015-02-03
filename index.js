/*!
 * accountdown-token <https://github.com/doowb/accountdown-token>
 *
 * Copyright (c) 2015 Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var token = require('./token');

module.exports = Token;

/**
 * Create a new instance of a Token class.
 *
 * ```js
 * var login = new Token(db, 'token');
 * ```
 *
 * @param {Object} `db` [accountdown] database instance
 * @param {String} `prefix` name of the login type being used in [accountdown]
 */

function Token (db, prefix) {
  if (!(this instanceof Token)) return new Token(db, prefix);
  this.db = db;
  this.prefix = prefix;
}

/**
 * Verify that the token is correct and still valid (e.g. not expired)
 *
 * ```js
 * login.verify({ username: 'doowb', token: 'XXXXXXXXXXXX' }, function (err, ok, id) {
 *   if (err) return console.log('Error validating token');
 *   if (ok === true) return console.log('valid token for ' + id);
 *   console.log('Invalid token for ' + id);
 * });
 * ```
 *
 * @param  {Object} `creds` Credentials object containing a `username` and `token` to validate.
 * @param  {Function} `cb` Callback that takes `err, ok, id`
 * @api public
 */

Token.prototype.verify = function(creds, cb) {
  var now = new Date();
  var err = checkCreds(creds);
  if (err) {
    return cb && process.nextTick(function () {
      cb(err);
    });
  }

  var key = this.prefix.concat(creds.username);
  var db = this.db;
  db.get(key, function (err, row) {
    if (err && err.type === 'NotFoundError') {
      return cb(null, false);
    }
    if (err) return cb(err);
    if (!row.token) return cb('NOTOKEN', 'integrity error: no token found');

    // if the token has already been redeemed, verify success
    if (creds.redeemed || row.redeemed) {
      return cb(null, true, row.id);
    }

    // if the tokens match and are within the expiry time, verify success
    if (creds.token === row.token && (new Date(creds.now || now) < new Date(row.expiry))) {
      row.redeemed = new Date(creds.now || now);
      return db.put(key, row, function (err) {
        if (err) return cb(err);
        cb(null, true, row.id);
      });
    }

    // otherwise, verify failure but return the token information
    cb(null, false, row.id);
  });
};

/**
 * Create a new user token for the given id and credentials.
 *
 * ```js
 * login.create('doowb', { username: 'doowb' });
 * ```
 *
 * @param  {String} `id` Identifier of the account being created.
 * @param  {Object} `creds` Credentials object used for creating the token.
 * @return {Array} Array of rows to be added to the [accountdown] database
 * @api public
 */

Token.prototype.create = function(id, creds) {
  var err = checkCreds(creds);
  if (err) return err;

  var value = {
    id: id,
    token: creds.token || token(48, 'base64').replace(/\//g, '_').replace(/\+/g, '-'),
    issued: creds.issued || new Date(),
    redeemed: false
  };

  if (creds.expiry) {
    value.expiry = creds.expiry;
  } else {
    value.expiry = new Date(value.issued);
    value.expiry.setHours(value.expiry.getHours() + (creds.ttl || 4));
  }

  return [
    {
      key: this.prefix.concat(creds.username),
      value: value
    }
  ];
};

/**
 * Verify that the credentials at least contain a username
 *
 * @param  {Object} `creds` Credentials to verify
 * @return {Error} If invalid, return an Error, otherwise, undefined.
 * @api private
 */

function checkCreds (creds) {
  if (!creds || typeof creds !== 'object') {
    return new Error('supplied credentials are not an object');
  }
  if (!creds.username) {
    return new Error('username required');
  }
}
