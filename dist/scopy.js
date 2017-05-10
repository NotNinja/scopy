(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('scopy', factory) :
  (global.Scopy = factory());
}(this, (function () { 'use strict';

  /*
   * Copyright (C) 2017 Alasdair Mercer, !ninja
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   */

  /**
   * Returns a scoped key based on the specified <code>name</code> and using the <code>options</code> provided.
   *
   * If the <code>symbol</code> option is enabled (which it is by default), an ES2015 <code>Symbol</code> will be
   * returned (where supported), otherwise this method will simply return <code>name</code> prefixed with an underscore.
   *
   * <code>Symbols</code> returned by this method will always be unique when called multiple times with the same
   * <code>name</code>, however, string keys will always be exactly the same.
   *
   * This method is ideal when defining a key for a privately scoped property.
   *
   * @example
   * <pre>
   * // user.js
   * var Scopy = require('scopy');
   *
   * var _name = Scopy('name');
   *
   * function User(name) {
   *   this[_name] = name;
   * }
   *
   * User.prototype.getName = function() {
   *   return this[_name];
   * };
   *
   * module.exports = User;
   * </pre>
   * @param {string} name - the name for the scoped key
   * @param {Scopy~Options} [options] - the options to be used (may be <code>null</code>)
   * @return {string|symbol} The scoped key for <code>name</code>.
   * @throws {TypeError} If an attempt is made to instantiate <code>Scopy</code> (e.g. via <code>new</code>).
   * @public
   */
  function Scopy(name, options) {
    if (this instanceof Scopy) {
      throw new TypeError('Scopy is not a constructor');
    }

    var factory = getKeyFactory(false, options);

    return factory(name);
  }

  /**
   * Returns scoped keys based on the specified <code>names</code> and using the <code>options</code> provided.
   *
   * If the <code>symbol</code> option is enabled (which it is by default), this method will return <code>names</code>
   * mapped to ES2015 <code>Symbols</code> (where supported), otherwise <code>names</code> will simply be mapped to
   * themselves prefixed with an underscore.
   *
   * <code>Symbols</code> included in the mapping returned by this method will always be unique when called multiple times
   * with the same name, however, string keys will always be exactly the same.
   *
   * This method is ideal when defining keys for privately scoped properties.
   *
   * @example
   * <pre>
   * // user.js
   * var Scopy = require('scopy');
   *
   * var keys = Scopy.all([ 'email', 'name' ]);
   *
   * function User(email, name) {
   *   this[keys.email] = email;
   *   this[keys.name] = name;
   * }
   *
   * User.prototype.getEmail = function() {
   *   return this[keys.email];
   * };
   *
   * User.prototype.getName = function() {
   *   return this[keys.name];
   * };
   *
   * module.exports = User;
   * </pre>
   * @param {string[]} [names] - the names for the scoped keys (may be <code>null</code>)
   * @param {Scopy~Options} [options] - the options to be used (may be <code>null</code>)
   * @return {Object.<string, string|symbol>} A mapping containing <code>names</code> and their corresponding scoped keys.
   * @public
   * @static
   * @memberof Scopy
   */
  Scopy.all = function(names, options) {
    names = names || [];

    var factory = getKeyFactory(false, options);
    var keys = {};

    names.forEach(function(name) {
      keys[name] = factory(name);
    });

    return keys;
  };

  /**
   * Returns the key/value pairs for all of the specified object's own enumerable properties that are not scoped, in the
   * same order as that provided by a for-in loop.
   *
   * This method returns a multi-dimensional array where each item is an array containing the name and value
   * (<code>[name, value]</code>) of a non-scoped enumerable property.
   *
   * Properties mapped to a <code>Symbol</code> are <b>never</b> included in this method but those mapped to properties
   * whose name is prefixed with an underscore, created when the <code>symbol</code> option has been explicitly disabled,
   * <b>will</b> be included <b>unless</b> the <code>symbol</code> option is explicitly disabled when calling this method.
   *
   * This method is intended to be used just like ES2015's <code>Object.entries</code> method while also supporting cases
   * where <code>Symbols</code> have not been used to scope properties.
   *
   * @example
   * <pre>
   * var Scopy = require('scopy');
   * var uuid = require('uuid/v4');
   *
   * var _generateId = Scopy('generateId');
   * var _id = Scopy('id');
   * var _name = Scopy('name');
   *
   * function User(name) {
   *   this[_id] = this[_generateId]();
   *   this[_name] = name;
   *   this.length = name.length;
   * }
   *
   * User.prototype[_generateId] = function() {
   *   return uuid();
   * };
   *
   * User.prototype.getName = function() {
   *   return this[_name];
   * };
   *
   * Scopy.entries(new User('foo'));
   * //=> [ [ "length", 3 ] ]
   * Scopy.entries(User.prototype);
   * //=> [ [ "getName", function() { return this[_name] } ] ]
   * </pre>
   * @param {Object} obj - the object whose enumerable own non-scoped property key/value pairs are to be returned
   * @param {Scopy~Options} [options] - the options to be used (may be <code>null</code>)
   * @return {Array} An array containing the key/value pairs for all of the enumerable non-scoped properties of
   * <code>obj</code>.
   * @public
   * @static
   * @memberof Scopy
   */
  Scopy.entries = function(obj, options) {
    return mapProperties(obj, function(value, name) {
      return [ name, value ];
    }, options);
  };

  /**
   * Returns a "global" key based on the specified <code>name</code> and using the <code>options</code> provided.
   *
   * If the <code>symbol</code> option is enabled (which it is by default), an ES2015 <code>Symbol</code> will be returned
   * from the runtime-wide symbol registry (where supported), otherwise this method will simply return <code>name</code>
   * prefixed with an underscore.
   *
   * Unlike {@link Scopy}, <code>Symbols</code> returned by this method will always be the same when called multiple times
   * with the same <code>name</code>, just like string keys.
   *
   * It is recommended that <code>name</code> be prefixed in order to avoid conflicts with other libraries that may also
   * have a "global" key of the same name.
   *
   * This method is ideal when defining a key for a protected/internally scoped property.
   *
   * @example
   * <pre>
   * // user.js
   * var Scopy = require('scopy');
   * var uuid = require('uuid/v4');
   *
   * var _id = Scopy.for('example_user_id');
   * var _name = Scopy('name');
   *
   * function User(name) {
   *   this[_id] = uuid();
   *   this[_name] = name;
   * }
   *
   * User.prototype.getName = function() {
   *   return this[_name];
   * };
   *
   * module.exports = User;
   *
   * // user-logger.js
   * var EOL = require('os').EOL;
   * var Scopy = require('scopy');
   *
   * var _id = Scopy.for('example_user_id');
   *
   * exports.login = function(output, user) {
   *   var id = user[_id];
   *
   *   output.write('User[' + id + '] has logged in!' + EOL);
   * };
   * </pre>
   * @param {string} name - the name for the "global" key
   * @param {Scopy~Options} [options] - the options to be used (may be <code>null</code>)
   * @return {string|symbol} The "global" key for <code>name</code>.
   * @public
   * @static
   * @memberof Scopy
   */
  Scopy.for = function(name, options) {
    var factory = getKeyFactory(true, options);

    return factory(name);
  };

  /**
   * Returns "global" keys based on the specified <code>names</code> and using the <code>options</code> provided.
   *
   * If the <code>symbol</code> option is enabled (which it is by default), this method will return <code>names</code>
   * mapped to ES2015 <code>Symbols</code> from the runtime-wide symbol registry (where supported), otherwise
   * <code>names</code> will simply be mapped to themselves prefixed with an underscore.
   *
   * Unlike {@link Scopy.all}, <code>Symbols</code> included in the mapping returned by this method will always be the
   * same when called multiple times with the same name, just like string keys.
   *
   * It is recommended that each name within <code>names</code> be prefixed in order to avoid conflicts with other
   * libraries that may also have a "global" key of the same name.
   *
   * This method is ideal when defining keys for protected/internally scoped properties.
   *
   * @example
   * <pre>
   * // user.js
   * var Scopy = require('scopy');
   * var uuid = require('uuid/v4');
   *
   * var keys = Scopy.for.all([ 'example_user_id', 'example_user_lastUpdatedBy' ]);
   * var _name = Scopy('name');
   *
   * function User(name) {
   *   this[keys['example.user.id']] = uuid();
   *   this[keys['example.user.lastUpdatedBy']] = null;
   *   this[_name] = name;
   * }
   *
   * User.prototype.getName = function() {
   *   return this[_name];
   * };
   *
   * module.exports = User;
   *
   * // user-logger.js
   * var EOL = require('os').EOL;
   * var Scopy = require('scopy');
   *
   * var keys = Scopy.for.all([ 'example_user_id', 'example_user_lastUpdatedBy' ]);
   *
   * exports.update = function(output, user) {
   *   var id = user[keys['example.user.id']];
   *   var lastUpdatedBy = user[keys['example.user.lastUpdatedBy']];
   *
   *   output.write('User[' + id + '] has been updated by ' + lastUpdatedBy + EOL);
   * };
   * </pre>
   * @param {string[]} [names] - the names for the "global" keys (may be <code>null</code>)
   * @param {Scopy~Options} [options] - the options to be used (may be <code>null</code>)
   * @return {Object.<string, string|symbol>} A mapping containing <code>names</code> and their corresponding "global"
   * keys.
   * @public
   * @static
   * @memberof Scopy.for
   */
  Scopy.for.all = function(names, options) {
    names = names || [];

    var factory = getKeyFactory(true, options);
    var keys = {};

    names.forEach(function(name) {
      keys[name] = factory(name);
    });

    return keys;
  };

  /**
   * An alias for the {@link Scopy.for.all} method.
   *
   * @param {string[]} [names] - the names for the "global" keys (may be <code>null</code>)
   * @param {Scopy~Options} [options] - the options to be used (may be <code>null</code>)
   * @return {Object.<string, string|symbol>} A mapping containing <code>names</code> and their corresponding "global"
   * keys.
   * @public
   * @static
   * @memberof Scopy
   */
  Scopy.forAll = Scopy.for.all;

  /**
   * Returns whether the specified <code>obj</code> represents a scoped or "global" key based on the <code>options</code>
   * provided.
   *
   * If the <code>symbol</code> option is enabled (which it is by default), this method will return <code>true</code> if
   * <code>obj</code> is an ES2015 <code>Symbol</code> (where supported), otherwise it will only return <code>true</code>
   * if and only if <code>obj</code> is a string that starts with at least one underscore.
   *
   * @example
   * <pre>
   * var Scopy = require('scopy');
   *
   * Scopy.is(Scopy('foo'));
   * //=> true
   * Scopy.is(Scopy('foo', { symbol: false }));
   * //=> true
   * Scopy.is('foo');
   * //=> false
   * </pre>
   * @param {*} obj - the object to be checked (may be <code>null</code>)
   * @param {Scopy~Options} [options] - the options to be used (may be <code>null</code>)
   * @return {boolean} <code>true</code> if <code>obj</code> is a scoped or "global" key; otherwise <code>false</code>.
   * @public
   * @static
   * @memberof Scopy
   */
  Scopy.is = function(obj, options) {
    if (obj == null) {
      return false;
    }

    options = parseOptions(options);

    return options.symbol ? typeof obj === 'symbol' : typeof obj === 'string' && obj[0] === '_';
  };

  /**
   * Returns the names of all of the specified object's own enumerable properties that are not scoped, in the same order
   * as that provided by a for-in loop.
   *
   * Properties mapped to a <code>Symbol</code> are <b>never</b> included in this method but those mapped to properties
   * whose name is prefixed with an underscore, created when the <code>symbol</code> option has been explicitly disabled,
   * <b>will</b> be included <b>unless</b> the <code>symbol</code> option is explicitly disabled when calling this method.
   *
   * This method is intended to be used just like ES2015's <code>Object.keys</code> method while also supporting cases
   * where <code>Symbols</code> have not been used to scope properties.
   *
   * @example
   * <pre>
   * var Scopy = require('scopy');
   * var uuid = require('uuid/v4');
   *
   * var _generateId = Scopy('generateId');
   * var _id = Scopy('id');
   * var _name = Scopy('name');
   *
   * function User(name) {
   *   this[_id] = this[_generateId]();
   *   this[_name] = name;
   *   this.length = name.length;
   * }
   *
   * User.prototype[_generateId] = function() {
   *   return uuid();
   * };
   *
   * User.prototype.getName = function() {
   *   return this[_name];
   * };
   *
   * Scopy.keys(new User('foo'));
   * //=> [ "length" ]
   * Scopy.keys(User.prototype);
   * //=> [ "getName" ]
   * </pre>
   * @param {Object} obj - the object whose enumerable own non-scoped property names are to be returned
   * @param {Scopy~Options} [options] - the options to be used (may be <code>null</code>)
   * @return {string[]} An array of strings that represent all of the enumerable non-scoped properties of
   * <code>obj</code>.
   * @public
   * @static
   * @memberof Scopy
   */
  Scopy.keys = function(obj, options) {
    return mapProperties(obj, function(value, name) {
      return name;
    }, options);
  };

  /**
   * Returns a version of {@link Scopy} that is bound (along with <i>all</i> of its methods) to the specified
   * <code>options</code>.
   *
   * Since it's recommended that consumers use the same options, when specified, this method can be really useful as it
   * allows consumers to only specify the options once. This is especially useful for those wishing to explictly disable
   * the <code>symbol</code> option.
   *
   * Any options passed to the methods within the returned wrapped Scopy API will be ignored in favor of
   * <code>options</code>.
   *
   * @example
   * <pre>
   * var Scopy = require('scopy').using({ symbol: false });
   *
   * Scopy('foo');
   * //=> "_foo"
   * Scopy.all([ 'foo', 'bar' ]);
   * //=> { foo: "_foo", bar: "_bar" }
   * Scopy.is('_foo');
   * //=> true
   * Scopy.is(Symbol('foo'));
   * //=> false
   * </pre>
   * @param {Scopy~Options} [options] - the options to be used (may be <code>null</code>)
   * @return {Function} A version of {@link Scopy} that will, along with its methods, always use <code>options</code>.
   * @public
   * @static
   * @memberof Scopy
   */
  Scopy.using = function(options) {
    options = parseOptions(options);

    var BoundScopy = applyOptions(Scopy, options);
    applyOptionsToAll(Scopy, BoundScopy, [
      'all',
      'entries',
      'for',
      'forAll',
      'is',
      'keys',
      'values'
    ], options);

    BoundScopy.for.all = BoundScopy.forAll;
    BoundScopy.using = Scopy.using;

    return BoundScopy;
  };

  /**
   * Returns the values of all of the specified object's own enumerable properties that are not scoped, in the same order
   * as that provided by a for-in loop.
   *
   * Properties mapped to a <code>Symbol</code> are <b>never</b> included in this method but those mapped to properties
   * whose name is prefixed with an underscore, created when the <code>symbol</code> option has been explicitly disabled,
   * <b>will</b> be included <b>unless</b> the <code>symbol</code> option is explicitly disabled when calling this method.
   *
   * This method is intended to be used just like ES2015's <code>Object.values</code> method while also supporting cases
   * where <code>Symbols</code> have not been used to scope properties.
   *
   * @example
   * <pre>
   * var Scopy = require('scopy');
   * var uuid = require('uuid/v4');
   *
   * var _generateId = Scopy('generateId');
   * var _id = Scopy('id');
   * var _name = Scopy('name');
   *
   * function User(name) {
   *   this[_id] = this[_generateId]();
   *   this[_name] = name;
   *   this.length = name.length;
   * }
   *
   * User.prototype[_generateId] = function() {
   *   return uuid();
   * };
   *
   * User.prototype.getName = function() {
   *   return this[_name];
   * };
   *
   * Scopy.values(new User('foo'));
   * //=> [ 3 ]
   * Scopy.values(User.prototype);
   * //=> [ function() { return this[_name] } ]
   * </pre>
   * @param {Object} obj - the object whose enumerable own non-scoped property values are to be returned
   * @param {Scopy~Options} [options] - the options to be used (may be <code>null</code>)
   * @return {Array} An array containing the values of all of the enumerable non-scoped properties of <code>obj</code>.
   * @public
   * @static
   * @memberof Scopy
   */
  Scopy.values = function(obj, options) {
    return mapProperties(obj, function(value) {
      return value;
    }, options);
  };

  /**
   * Returns a function that delegates the call to the specified <code>func</code> so that the <code>options</code>
   * provided are always passed to it.
   *
   * The returned function will always return the return value of calling <code>func</code>.
   *
   * @param {Function} func - the function to which <code>options</code> are to be applied
   * @param {Scopy~Options} options - the <code>options</code> to be applied
   * @return {Function} A function which will always pass <code>options</code> as the last argument to <code>func</code>.
   * @private
   */
  function applyOptions(func, options) {
    return function() {
      var args = Array.prototype.slice.call(arguments, 0, 1);

      return func.apply(null, args.concat(options));
    };
  }

  /**
   * Assigns functions to the specified <code>target</code> for all of the <code>names</code> provided that delegate their
   * calls to the function of the same name on the given <code>source</code> so that the <code>options</code> provided are
   * always passed to them.
   *
   * Each proxy function will always return the return value of calling the original function.
   *
   * @param {Object} source - the object on which the original functions belong
   * @param {Object} target - the object to which the proxy functions are to be assigned
   * @param {string[]} names - the names of each function to be proxied
   * @param {Scopy~Options} options - the <code>options</code> to be used
   * @return {void}
   * @private
   */
  function applyOptionsToAll(source, target, names, options) {
    names.forEach(function(name) {
      target[name] = applyOptions(source[name], options);
    });
  }

  /**
   * Returns a function which can be used to create scoped/"global" keys based on the <code>options</code> provided and a
   * name which is passed to it.
   *
   * @param {boolean} global - <code>true</code> if the keys created by the factory are to be "global"; otherwise
   * <code>false</code>
   * @param {?Scopy~Options} options - the options to be used (may be <code>null</code>)
   * @return {Scopy~KeyFactory} The key factory.
   * @private
   */
  function getKeyFactory(global, options) {
    options = parseOptions(options);

    if (options.symbol) {
      return global ? Symbol.for : Symbol;
    }

    return function(name) {
      return '_' + name;
    };
  }

  /**
   * Iterates over all non-scoped properties on the specified <code>object</code> using the <code>options</code> provided
   * and creates a new array containing values derived from the key/value pairs for each property using the given
   * <code>mapper</code>.
   *
   * @param {Object} obj - the object whose non-scoped properties are to be mapped
   * @param {Scopy~PropertyMapper} mapper - the function to be called with the value and name of each non-scoped property
   * and to return a value to be mapped to the result
   * @param {?Scopy~Options} options - the options to be used (may be <code>null/code>)
   * @return {Array} An array containing values derived from the non-scoped properties of <code>obj</code> using
   * <code>mapper</code>.
   * @private
   */
  function mapProperties(obj, mapper, options) {
    options = parseOptions(options);

    var result = [];

    for (var name in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, name) && (options.symbol || name[0] !== '_')) {
        result.push(mapper(obj[name], name));
      }
    }

    return result;
  }

  /**
   * Parses the optional input <code>options</code> provided, normalizing options and applying default values, where
   * needed.
   *
   * @param {?Scopy~Options} options - the input options to be parsed (may be <code>null</code> if none were provided)
   * @return {Scopy~Options} A new options object parsed from <code>options</code>.
   * @private
   */
  function parseOptions(options) {
    if (options == null) {
      options = {};
    }

    var symbol = options.symbol !== false && typeof Symbol === 'function';

    return { symbol: symbol };
  }

  var scopy = Scopy;

  return scopy;

})));

//# sourceMappingURL=scopy.js.map