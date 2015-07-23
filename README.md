# accountdown-token [![NPM version](https://badge.fury.io/js/accountdown-token.svg)](http://badge.fury.io/js/accountdown-token)

> Token authentication for accountdown

## Install
## Install with [npm](npmjs.org)

```bash
npm i accountdown-token --save
```

## Run tests

```bash
npm test
```

## Usage

```js
var Token = require('accountdown-token');
var accountdown = require('accountdown');
var level = require('level');

var db = level('tmp/users.db');
var users = accountdown(db, {
  login: {
    token: Token
  }
});

var username = 'doowb';
var opts = {
    login: { token: { username: username, token: 'foobarbaz' } },
    value: { name: 'Brian' }
};

users.create(username, opts, function (err) {
  if (err) return console.log('Error creating user', err);

  users.verify('token', opts.login.token, function (err, ok, id) {
    if (err) return console.log('Error', err);
    if (ok === false) return console.log('Invalid token for ' + id);
    console.log('Valid token for ' + id);
  })
});
```

## API
### [.verify](index.js#L47)

Verify that the token is correct and still valid (e.g. not expired)

* `creds` **{Object}**: Credentials object containing a `username` and `token` to validate.    
* `cb` **{Function}**: Callback that takes `err, ok, id`    

```js
login.verify({ username: 'doowb', token: 'XXXXXXXXXXXX' }, function (err, ok, id) {
  if (err) return console.log('Error validating token');
  if (ok === true) return console.log('valid token for ' + id);
  console.log('Invalid token for ' + id);
});
```

### [.create](index.js#L97)

Create a new user token for the given id and credentials.

* `id` **{String}**: Identifier of the account being created.    
* `creds` **{Object}**: Credentials object used for creating the token.    
* `returns` **{Array}**: Array of rows to be added to the [accountdown] database  

```js
login.create('doowb', { username: 'doowb' });
```


## Contributing
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/doowb/accountdown-token/issues)

## Author

**Brian Woodward**
 
+ [github/doowb](https://github.com/doowb)
+ [twitter/doowb](http://twitter.com/doowb) 

## License
Copyright (c) 2015 Brian Woodward  
Released under the MIT license

***

[accountdown]: https://github.com/substack/accountdown
