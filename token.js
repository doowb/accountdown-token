'use strict';

/**
 * Generate a random token.
 *
 * ```js
 * token(48, 'base64', function (err, buf) {
 *   console.log('token', buf);
 * });
 * ```
 *
 * @param  {Number} `size` Size of the random byte array.
 * @param  {String} `enc`  Encoding to use in `toString`
 * @param  {Function} `cb` Callback that takes `err` and `buf`
 * @api public
 * @name  token
 */

module.exports = function token (size, enc, cb) {
  var crypto = require('crypto');
  if (typeof cb === 'function') {
    return crypto.randomBytes(size, function (err, buf) {
      if (err) return cb(err);
      cb(null, buf.toString(enc));
    });
  }
  return crypto.randomBytes(size).toString(enc);
};
