     .d8888b.
    d88P  Y88b
    Y88b.
     "Y888b.    .d8888b .d88b.  88888b.  888  888
        "Y88b. d88P"   d88""88b 888 "88b 888  888
          "888 888     888  888 888  888 888  888
    Y88b  d88P Y88b.   Y88..88P 888 d88P Y88b 888
     "Y8888P"   "Y8888P "Y88P"  88888P"   "Y88888
                                888           888
                                888      Y8b d88P
                                888       "Y88P"

[![Build Status](https://img.shields.io/travis/Skelp/scopy/develop.svg?style=flat-square)](https://travis-ci.org/Skelp/scopy)
[![Coverage](https://img.shields.io/coveralls/Skelp/scopy/develop.svg?style=flat-square)](https://coveralls.io/github/Skelp/scopy)
[![Dev Dependency Status](https://img.shields.io/david/dev/Skelp/scopy.svg?style=flat-square)](https://david-dm.org/Skelp/scopy?type=dev)
[![License](https://img.shields.io/npm/l/scopy.svg?style=flat-square)](https://github.com/Skelp/scopy/blob/master/LICENSE.md)
[![Release](https://img.shields.io/npm/v/scopy.svg?style=flat-square)](https://www.npmjs.com/package/scopy)

[Scopy](https://github.com/Skelp/scopy) is a lightweight quick and dirty property scoping library for JavaScript that
utilizes ECMAScript 2015's `Symbol` where possible and falls back on good old trailing underscore naming conventions.

It doesn't really offer *true* privacy as symbols can still be looked up using `Object.getOwnPropertySymbols` and
prefixing property names with underscores is obviously just a convention, offering no real hiding. However, the main
purpose of Scopy is to provide a simple API that attempts to make it easier for you to make cleaner APIs by *hiding*
properties intended only for intended use to promote your public API.

While closures can arguably offer better scoping, they are not always best for classes as it requires methods to be
created and bound for each instance of that class within their constructor rather than building a reusable prototype.
This results in uglier code and performs less.

When using Scopy, it is recommended not to attempt to use other scoping conventions in the same area of the code to get
the most out of its API.

* [Install](#install)
* [API](#api)
* [Bugs](#bugs)
* [Contributors](#contributors)
* [License](#license)

## Install

Install using the package manager for your desired environment(s):

``` bash
$ npm install --save scopy
# OR:
$ bower install --save scopy
```

You'll need to have at least [Node.js](https://nodejs.org) and you'll only need [Bower](https://bower.io) if you want to
install that way instead of using `npm`. While equals should be compatible with all versions of
[Node.js](https://nodejs.org), it is only tested against version 4 and above.

If you want to simply download the file to be used in the browser you can find them below:

* [Development Version](https://cdn.rawgit.com/Skelp/scopy/master/dist/scopy.js) (19kb - [Source Map](https://cdn.rawgit.com/Skelp/scopy/master/dist/scopy.js.map))
* [Production Version](https://cdn.rawgit.com/Skelp/scopy/master/dist/scopy.min.js) (1.3kb - [Source Map](https://cdn.rawgit.com/Skelp/scopy/master/dist/scopy.min.js.map))

## API

All API methods accept the same optional `options` parameter:

| Option   | Description                                        | Default Value |
| -------- | -------------------------------------------------- | ------------- |
| `symbol` | Whether to use ES2015's `Symbol`, where supported. | `true`        |

When specifying `options` for any API method call, it is recommended to pass the same options to all other API method
calls within your application/library to ensure that the same type of scoped keys are returned.

### `Scopy(name[, options])`

Returns a scoped key based on the specified `name` and using the `options` provided.

If the `symbol` option is enabled (which it is by default), an ES2015 `Symbol` will be returned (where supported),
otherwise this method will simply return `name` prefixed with an underscore.

`Symbols` returned by this method will always be unique when called multiple times with the same `name`, however, string
keys will always be exactly the same.

This method is ideal when defining a key for a privately scoped property.

``` javascript
// user.js
var Scopy = require('scopy')

var _name = Scopy('name')

function User(name) {
  this[_name] = name
}

User.prototype.getName = function() {
  return this[_name]
}

module.exports = User
```

### `Scopy.all(names[, options])`

Returns scoped keys based on the specified `names` and using the `options` provided.

If the `symbol` option is enabled (which it is by default), this method will return `names` mapped to ES2015 `Symbols
(where supported), otherwise `names` will simply be mapped to themselves prefixed with an underscore.

`Symbols` included in the mapping returned by this method will always be unique when called multiple times with the same
name, however, string keys will always be exactly the same.

This method is ideal when defining keys for privately scoped properties.

``` javascript
// user.js
var Scopy = require('scopy')

var keys = Scopy.all([ 'email', 'name' ])

function User(email, name) {
  this[keys.email] = email
  this[keys.name] = name
}

User.prototype.getEmail = function() {
  return this[keys.email]
}

User.prototype.getName = function() {
  return this[keys.name]
}

module.exports = User
```

### `Scopy.for(name[, options])`

Returns a "global" key based on the specified `name` and using the `options` provided.

If the `symbol` option is enabled (which it is by default), an ES2015 `Symbol` will be returned from the runtime-wide
symbol registry (where supported), otherwise this method will simply return `name` prefixed with an underscore.

Unlike [Scopy](#scopyname-options), `Symbols` returned by this method will always be the same when called multiple times
with the same `name`, just like string keys.

It is recommended that `name` be prefixed in order to avoid conflicts with other libraries that may also have a "global"
key of the same name.

This method is ideal when defining a key for a protected/internally scoped property.

``` javascript
// user.js
var Scopy = require('scopy')
var uuid = require('node-uuid/v4')

var _id = Scopy.for('example_user_id')
var _name = Scopy('name')

function User(name) {
  this[_id] = uuid()
  this[_name] = name
}

User.prototype.getName = function() {
  return this[_name]
}

module.exports = User

// user-logger.js
var EOL = require('os').EOL
var Scopy = require('scopy')

var _id = Scopy.for('example_user_id')

exports.login = function(output, user) {
  var id = user[_id]

  output.write('User[' + id + '] has logged in!' + EOL)
}
```

### `Scopy.for.all(names[, options])`

**Alias:** `Scopy.forAll`

Returns "global" keys based on the specified `names` and using the `options` provided.

If the `symbol` option is enabled (which it is by default), this method will return `names` mapped to ES2015 `Symbols`
from the runtime-wide symbol registry (where supported), otherwise `names` will simply be mapped to themselves prefixed
with an underscore.

Unlike [Scopy.all](#scopyallnames-options), `Symbols` included in the mapping returned by this method will always be the
same when called multiple times with the same name, just like string keys.

It is recommended that each name within `names` be prefixed in order to avoid conflicts with other libraries that may
also have a "global" key of the same name.

This method is ideal when defining keys for protected/internally scoped properties.

``` javascript
// user.js
var Scopy = require('scopy')
var uuid = require('node-uuid/v4')

var keys = Scopy.for.all([ 'example_user_id', 'example_user_lastUpdatedBy' ])
var _name = Scopy('name')

function User(name) {
  this[keys['example.user.id']] = uuid()
  this[keys['example.user.lastUpdatedBy']] = null
  this[_name] = name
}

User.prototype.getName = function() {
  return this[_name]
}

module.exports = User

// user-logger.js
var EOL = require('os').EOL
var Scopy = require('scopy')

var keys = Scopy.for.all([ 'example_user_id', 'example_user_lastUpdatedBy' ])

exports.update = function(output, user) {
  var id = user[keys['example.user.id']]
  var lastUpdatedBy = user[keys['example.user.lastUpdatedBy']]

  output.write('User[' + id + '] has been updated by ' + lastUpdatedBy + EOL)
}
```

### `Scopy.is(obj[, options])`

Returns whether the specified `obj` represents a scoped or "global" key based on the `options` provided.

If the `symbol` option is enabled (which it is by default), this method will return `true` if `obj` is an ES2015
`Symbol` (where supported), otherwise it will only return `true` if and only if `obj` is a string that starts with at
least one underscore.

``` javascript
var Scopy = require('scopy')

Scopy.is(Scopy('foo'))
//=> true
Scopy.is(Scopy('foo', { symbol: false }))
//=> true
Scopy.is('foo')
//=> false
```

### `Scopy.entries(obj[, options])`

Returns the key/value pairs for all of the specified object's own enumerable properties that are not scoped, in the
same order as that provided by a for-in loop.

This method returns a multi-dimensional array where each item is an array containing the name and value
(`[name, value]`) of a non-scoped enumerable property.

Properties mapped to a `Symbol` are **never** included in this method but those mapped to properties whose name is
prefixed with an underscore, created when the `symbol` option has been explicitly disabled, **will** be included
**unless** the `symbol` option is explicitly disabled when calling this method.

This method is intended to be used just like ES2015's `Object.entries` method while also supporting cases where
`Symbols` have not been used to scope properties.

``` javascript
var Scopy = require('scopy')
var uuid = require('uuid/v4')

var _generateId = Scopy('generateId')
var _id = Scopy('id')
var _name = Scopy('name')

function User(name) {
  this[_id] = this[_generateId]()
  this[_name] = name
  this.length = name.length
}

User.prototype[_generateId] = function() {
  return uuid()
}

User.prototype.getName = function() {
  return this[_name]
}

Scopy.entries(new User('foo'))
//=> [ [ 'length', 3 ] ]
Scopy.entries(User.prototype)
//=> [ [ 'getName', function() { return this[_name] } ] ]
```

### `Scopy.keys(obj[, options])`

Returns the names of all of the specified object's own enumerable properties that are not scoped, in the same order as
that provided by a for-in loop.

Properties mapped to a `Symbol` are **never** included in this method but those mapped to properties whose name is
prefixed with an underscore, created when the `symbol` option has been explicitly disabled, **will** be included
**unless** the `symbol` option is explicitly disabled when calling this method.

This method is intended to be used just like ES2015's `Object.keys` method while also supporting cases where `Symbols`
have not been used to scope properties.

``` javascript
var Scopy = require('scopy')
var uuid = require('uuid/v4')

var _generateId = Scopy('generateId')
var _id = Scopy('id')
var _name = Scopy('name')

function User(name) {
  this[_id] = this[_generateId]()
  this[_name] = name
  this.length = name.length
}

User.prototype[_generateId] = function() {
  return uuid()
}

User.prototype.getName = function() {
  return this[_name]
}

Scopy.keys(new User('foo'))
//=> [ 'length' ]
Scopy.keys(User.prototype)
//=> [ 'getName' ]
```

### `Scopy.values(obj[, options])`

Returns the values of all of the specified object's own enumerable properties that are not scoped, in the same order as
that provided by a for-in loop.

Properties mapped to a `Symbol` are **never** included in this method but those mapped to properties whose name is
prefixed with an underscore, created when the`symbol` option has been explicitly disabled, **will** be included 
**unless** the `symbol` option is explicitly disabled when calling this method.

This method is intended to be used just like ES2015's`Object.values` method while also supporting cases where `Symbols`
have not been used to scope properties.

``` javascript
var Scopy = require('scopy')
var uuid = require('uuid/v4')

var _generateId = Scopy('generateId')
var _id = Scopy('id')
var _name = Scopy('name')

function User(name) {
  this[_id] = this[_generateId]()
  this[_name] = name
  this.length = name.length
}

User.prototype[_generateId] = function() {
  return uuid()
}

User.prototype.getName = function() {
  return this[_name]
}

Scopy.values(new User('foo'))
//=> [ 3 ]
Scopy.values(User.prototype)
//=> [ function() { return this[_name] } ]
```

## Bugs

If you have any problems with Scopy or would like to see changes currently in development you can do so
[here](https://github.com/Skelp/scopy/issues).

## Contributors

If you want to contribute, you're a legend! Information on how you can do so can be found in
[CONTRIBUTING.md](https://github.com/Skelp/scopy/blob/master/CONTRIBUTING.md). We want your suggestions and pull
requests!

A list of Scopy contributors can be found in [AUTHORS.md](https://github.com/Skelp/scopy/blob/master/AUTHORS.md).

## License

See [LICENSE.md](https://github.com/Skelp/scopy/raw/master/LICENSE.md) for more information on our MIT license.

[![Copyright Skelp](https://cdn.rawgit.com/Skelp/skelp-branding/master/assets/footer/invert-filled/skelp-footer-invert-filled.svg)](https://skelp.io)
