/*
 * Copyright (C) 2017 Alasdair Mercer, Skelp
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

'use strict'

var expect = require('chai').expect

var Scopy = require('../src/scopy')

describe('Scopy', function() {
  var Test

  before(function() {
    Test = function() {
      this.foo = true
      this.bar = 123
      this._fu = 'Hello'
      this[Symbol('baz')] = 'World'
    }

    Test.prototype.fizz = function() {
      return 'buzz'
    }
  })

  it('should be a function', function() {
    expect(Scopy).to.be.a('function')
  })

  context('when instantiated', function() {
    it('should throw an error', function() {
      expect(function() {
        return new Scopy('foo')
      }).to.throw(TypeError, 'Scopy is not a constructor')
    })
  })

  context('when no options are provided', function() {
    it('should use symbols', function() {
      expect(Scopy('foo')).to.be.a('symbol')
    })
  })

  context('when "symbol" option is enabled', function() {
    it('should return symbol for specified name', function() {
      var key1 = Scopy('foo', { symbol: true })
      var key2 = Scopy('bar', { symbol: true })

      expect(key1).to.be.a('symbol')
      expect(getSymbolDescription(key1)).to.equal('foo')
      expect(key2).to.be.a('symbol')
      expect(getSymbolDescription(key2)).to.equal('bar')
      expect(key1).to.not.equal(key2)
    })

    it('should return unique symbol for same name', function() {
      var key1 = Scopy('foo', { symbol: true })
      var key2 = Scopy('foo', { symbol: true })

      expect(key1).to.not.equal(key2)
    })
  })

  context('when "symbol" option is disabled', function() {
    it('should return specified name with underscore prefix', function() {
      var key1 = Scopy('foo', { symbol: false })
      var key2 = Scopy('bar', { symbol: false })

      expect(key1).to.equal('_foo')
      expect(key2).to.equal('_bar')
    })
  })

  describe('.all', function() {
    context('when no names are provided', function() {
      it('should return an empty array', function() {
        expect(Scopy.all()).to.be.empty
      })
    })

    context('when no options are provided', function() {
      it('should use symbols (where possible)', function() {
        var keys = Scopy.all([ 'foo', 'bar' ])

        expect(keys).to.have.all.keys([ 'foo', 'bar' ])
        expect(keys.foo).to.be.a('symbol')
        expect(keys.bar).to.be.a('symbol')
      })
    })

    context('when "symbol" option is enabled', function() {
      it('should return object containing symbols mapped to each of specified names', function() {
        var keys = Scopy.all([ 'foo', 'bar', 'foo' ], { symbol: true })

        expect(keys).to.have.all.keys([ 'foo', 'bar' ])
        expect(keys.foo).to.be.a('symbol')
        expect(getSymbolDescription(keys.foo)).to.equal('foo')
        expect(keys.bar).to.be.a('symbol')
        expect(getSymbolDescription(keys.bar)).to.equal('bar')
        expect(keys.foo).to.not.equal(keys.bar)
      })

      it('should return object containing unique symbols mapped to same names', function() {
        var keys1 = Scopy.all([ 'foo', 'bar' ], { symbol: true })
        var keys2 = Scopy.all([ 'foo', 'bar' ], { symbol: true })

        expect(keys1.foo).to.not.equal(keys2.foo)
        expect(keys1.bar).to.not.equal(keys2.bar)
      })
    })

    context('when "symbol" option is disabled', function() {
      it('should return object containing names with underscore prefixes mapped to specified names', function() {
        var keys = Scopy.all([ 'foo', 'bar', 'foo' ], { symbol: false })

        expect(keys).to.have.all.keys([ 'foo', 'bar' ])
        expect(keys.foo).to.equal('_foo')
        expect(keys.bar).to.equal('_bar')
      })
    })
  })

  describe('.entries', function() {
    context('when no options are provided', function() {
      it('should use symbols (where possible)', function() {
        var expectedValues = {
          foo: true,
          bar: 123,
          _fu: 'Hello'
        }

        var entries = Scopy.entries(new Test())

        expect(entries).to.have.lengthOf(3)
        expect(expectedValues).to.have.ownProperty(entries[0][0])
        expect(expectedValues[entries[0][0]]).to.equal(entries[0][1])
        expect(expectedValues).to.have.ownProperty(entries[1][0])
        expect(expectedValues[entries[1][0]]).to.equal(entries[1][1])
        expect(expectedValues).to.have.ownProperty(entries[2][0])
        expect(expectedValues[entries[2][0]]).to.equal(entries[2][1])
      })
    })

    context('when "symbol" option is enabled', function() {
      it('should return entries for all of specified object\'s properties', function() {
        var expectedValues = {
          foo: true,
          bar: 123,
          _fu: 'Hello'
        }

        var entries = Scopy.entries(new Test(), { symbol: true })

        expect(entries).to.have.lengthOf(3)
        expect(expectedValues).to.have.ownProperty(entries[0][0])
        expect(expectedValues[entries[0][0]]).to.equal(entries[0][1])
        expect(expectedValues).to.have.ownProperty(entries[1][0])
        expect(expectedValues[entries[1][0]]).to.equal(entries[1][1])
        expect(expectedValues).to.have.ownProperty(entries[2][0])
        expect(expectedValues[entries[2][0]]).to.equal(entries[2][1])
      })
    })

    context('when "symbol" option is disabled', function() {
      it('should only return entries for specified object\'s properties without underscore prefix', function() {
        var expectedValues = {
          foo: true,
          bar: 123
        }

        var entries = Scopy.entries(new Test(), { symbol: false })

        expect(entries).to.have.lengthOf(2)
        expect(expectedValues).to.have.ownProperty(entries[0][0])
        expect(expectedValues[entries[0][0]]).to.equal(entries[0][1])
        expect(expectedValues).to.have.ownProperty(entries[1][0])
        expect(expectedValues[entries[1][0]]).to.equal(entries[1][1])
      })
    })
  })

  describe('.for', function() {
    var counter = 0
    var namePrefix

    beforeEach(function() {
      counter++
      namePrefix = 'for.t' + counter + '.'
    })

    context('when no options are provided', function() {
      it('should use symbols', function() {
        var foo = namePrefix + 'foo'

        expect(Scopy.for(foo)).to.be.a('symbol')
      })
    })

    context('when "symbol" option is enabled', function() {
      it('should return symbol for specified name', function() {
        var foo = namePrefix + 'foo'
        var bar = namePrefix + 'bar'

        var key1 = Scopy.for(foo, { symbol: true })
        var key2 = Scopy.for(bar, { symbol: true })

        expect(key1).to.be.a('symbol')
        expect(getSymbolDescription(key1)).to.equal(foo)
        expect(key2).to.be.a('symbol')
        expect(getSymbolDescription(key2)).to.equal(bar)
        expect(key1).to.not.equal(key2)
      })

      it('should return same symbol for same name', function() {
        var foo = namePrefix + 'foo'

        var key1 = Scopy.for(foo, { symbol: true })
        var key2 = Scopy.for(foo, { symbol: true })

        expect(key1).to.equal(key2)
      })
    })

    context('when "symbol" option is disabled', function() {
      it('should return specified name with underscore prefix', function() {
        var foo = namePrefix + 'foo'
        var bar = namePrefix + 'bar'

        var key1 = Scopy.for(foo, { symbol: false })
        var key2 = Scopy.for(bar, { symbol: false })

        expect(key1).to.equal('_' + foo)
        expect(key2).to.equal('_' + bar)
      })
    })
  })

  describe('.for.all', function() {
    var counter = 0
    var namePrefix

    beforeEach(function() {
      counter++
      namePrefix = 'for.all.t' + counter + '.'
    })

    context('when no names are provided', function() {
      it('should return an empty array', function() {
        expect(Scopy.for.all()).to.be.empty
      })
    })

    context('when no options are provided', function() {
      it('should use symbols (where possible)', function() {
        var foo = namePrefix + 'foo'
        var bar = namePrefix + 'bar'

        var keys = Scopy.for.all([ foo, bar, foo ])

        expect(keys).to.have.all.keys([ foo, bar ])
        expect(keys[foo]).to.be.a('symbol')
        expect(keys[bar]).to.be.a('symbol')
      })
    })

    context('when "symbol" option is enabled', function() {
      it('should return object containing symbols mapped to each of specified names', function() {
        var foo = namePrefix + 'foo'
        var bar = namePrefix + 'bar'

        var keys = Scopy.for.all([ foo, bar, foo ], { symbol: true })

        expect(keys).to.have.all.keys([ foo, bar ])
        expect(keys[foo]).to.be.a('symbol')
        expect(getSymbolDescription(keys[foo])).to.equal(foo)
        expect(keys[bar]).to.be.a('symbol')
        expect(getSymbolDescription(keys[bar])).to.equal(bar)
        expect(keys[foo]).to.not.equal(keys[bar])
      })

      it('should return object containing same symbols mapped to same names', function() {
        var foo = namePrefix + 'foo'
        var bar = namePrefix + 'bar'

        var keys1 = Scopy.for.all([ foo, bar ], { symbol: true })
        var keys2 = Scopy.for.all([ foo, bar ], { symbol: true })

        expect(keys1[foo]).to.equal(keys2[foo])
        expect(keys1[bar]).to.equal(keys2[bar])
      })
    })

    context('when "symbol" option is disabled', function() {
      it('should return object containing names with underscore prefixes mapped to specified names', function() {
        var foo = namePrefix + 'foo'
        var bar = namePrefix + 'bar'

        var keys = Scopy.for.all([ foo, bar, foo ], { symbol: false })

        expect(keys).to.have.all.keys([ foo, bar ])
        expect(keys[foo]).to.equal('_' + foo)
        expect(keys[bar]).to.equal('_' + bar)
      })
    })
  })

  describe('.forAll', function() {
    it('should be an alias for Scopy.for.all', function() {
      expect(Scopy.forAll).to.equal(Scopy.for.all)
    })
  })

  describe('.is', function() {
    context('when no options are provided', function() {
      it('should use symbols', function() {
        expect(Scopy.is(Symbol())).to.be.true
      })
    })

    context('when no specified object is null', function() {
      it('should return false', function() {
        expect(Scopy.is(null)).to.be.false
      })
    })

    context('when "symbol" option is enabled', function() {
      context('and specified object is a symbol', function() {
        it('should return true', function() {
          expect(Scopy.is(Symbol('foo'), { symbol: true })).to.be.true
        })
      })

      context('and specified object is not a symbol', function() {
        it('should return false', function() {
          expect(Scopy.is('', { symbol: true })).to.be.false
          expect(Scopy.is('foo', { symbol: true })).to.be.false
          expect(Scopy.is('_foo', { symbol: true })).to.be.false
          expect(Scopy.is('__foo', { symbol: true })).to.be.false
          expect(Scopy.is('_foo_', { symbol: true })).to.be.false
          expect(Scopy.is('foo_', { symbol: true })).to.be.false
        })
      })
    })

    context('when "symbol" option is disabled', function() {
      context('and specified object is a string with an underscore prefix', function() {
        it('should return true', function() {
          expect(Scopy.is('_foo', { symbol: false })).to.be.true
          expect(Scopy.is('__foo', { symbol: false })).to.be.true
          expect(Scopy.is('_foo_', { symbol: false })).to.be.true
        })
      })

      context('and specified object is a string without an underscore prefix', function() {
        it('should return false', function() {
          expect(Scopy.is('', { symbol: false })).to.be.false
          expect(Scopy.is('foo', { symbol: false })).to.be.false
          expect(Scopy.is('foo_', { symbol: false })).to.be.false
          expect(Scopy.is(' _foo', { symbol: false })).to.be.false
        })
      })

      context('and specified object is not a string', function() {
        it('should return false', function() {
          expect(Scopy.is(Symbol('foo'), { symbol: false })).to.be.false
        })
      })
    })
  })

  describe('.keys', function() {
    context('when no options are provided', function() {
      it('should use symbols (where possible)', function() {
        var keys = Scopy.keys(new Test())

        expect(keys).to.have.lengthOf(3)
        expect(keys).to.include('foo')
        expect(keys).to.include('bar')
        expect(keys).to.include('_fu')
      })
    })

    context('when "symbol" option is enabled', function() {
      it('should return names of all of specified object\'s properties', function() {
        var keys = Scopy.keys(new Test(), { symbol: true })

        expect(keys).to.have.lengthOf(3)
        expect(keys).to.include('foo')
        expect(keys).to.include('bar')
        expect(keys).to.include('_fu')
      })
    })

    context('when "symbol" option is disabled', function() {
      it('should only return names of specified object\'s properties without underscore prefix', function() {
        var keys = Scopy.keys(new Test(), { symbol: false })

        expect(keys).to.have.lengthOf(2)
        expect(keys).to.include('foo')
        expect(keys).to.include('bar')
      })
    })
  })

  describe('.using', function() {
    var BoundScopy
    var counter = 0
    var namePrefix

    beforeEach(function() {
      counter++
      namePrefix = 'using.t' + counter + '.'
    })

    context('when no options are provided', function() {
      before(function() {
        BoundScopy = Scopy.using()
      })

      it('should use symbols (where possible)', function() {
        var foo = namePrefix + 'foo'
        var bar = namePrefix + 'bar'

        var expectedValues = {
          foo: true,
          bar: 123,
          _fu: 'Hello'
        }

        expect(BoundScopy('foo')).to.be.a('symbol')

        var scopedKeys = BoundScopy.all([ 'foo', 'bar' ])

        expect(scopedKeys).to.have.all.keys([ 'foo', 'bar' ])
        expect(scopedKeys.foo).to.be.a('symbol')
        expect(scopedKeys.bar).to.be.a('symbol')

        expect(BoundScopy.for(foo)).to.be.a('symbol')

        var globalKeys = BoundScopy.for.all([ foo, bar ])

        expect(globalKeys).to.have.all.keys([ foo, bar ])
        expect(globalKeys[foo]).to.be.a('symbol')
        expect(globalKeys[bar]).to.be.a('symbol')

        expect(globalKeys).to.deep.equal(BoundScopy.forAll([ foo, bar ]))

        expect(BoundScopy.is(Symbol('foo'))).to.be.true
        expect(BoundScopy.is('_foo')).to.be.false

        var entries = BoundScopy.entries(new Test())

        expect(entries).to.have.lengthOf(3)
        expect(expectedValues).to.have.ownProperty(entries[0][0])
        expect(expectedValues[entries[0][0]]).to.equal(entries[0][1])
        expect(expectedValues).to.have.ownProperty(entries[1][0])
        expect(expectedValues[entries[1][0]]).to.equal(entries[1][1])
        expect(expectedValues).to.have.ownProperty(entries[2][0])
        expect(expectedValues[entries[2][0]]).to.equal(entries[2][1])

        var keys = BoundScopy.keys(new Test())

        expect(keys).to.have.lengthOf(3)
        expect(keys).to.include('foo')
        expect(keys).to.include('bar')
        expect(keys).to.include('_fu')

        var values = BoundScopy.values(new Test())

        expect(values).to.have.lengthOf(3)
        expect(values).to.include(true)
        expect(values).to.include(123)
        expect(values).to.include('Hello')

        expect(BoundScopy.using({ symbol: false })('foo')).to.equal('_foo')
      })

      it('should ignore any options passed to methods', function() {
        expect(BoundScopy('foo', { symbol: false })).to.be.a('symbol')
      })
    })

    context('when options are provided', function() {
      before(function() {
        BoundScopy = Scopy.using({ symbol: false })
      })

      it('should apply options to all methods', function() {
        var foo = namePrefix + 'foo'
        var bar = namePrefix + 'bar'

        var expectedValues = {
          foo: true,
          bar: 123
        }

        expect(BoundScopy('foo')).to.equal('_foo')
        expect(BoundScopy.all([ 'foo', 'bar' ])).to.deep.equal({
          foo: '_foo',
          bar: '_bar'
        })
        expect(BoundScopy.for(foo)).to.equal('_' + foo)

        var globalKeys = BoundScopy.for.all([ foo, bar ])

        expect(globalKeys[foo]).to.equal('_' + foo)
        expect(globalKeys[bar]).to.equal('_' + bar)

        expect(globalKeys).to.deep.equal(BoundScopy.forAll([ foo, bar ]))

        expect(BoundScopy.is('_foo')).to.be.true
        expect(BoundScopy.is(Symbol('foo'))).to.be.false

        var entries = BoundScopy.entries(new Test())

        expect(entries).to.have.lengthOf(2)
        expect(expectedValues).to.have.ownProperty(entries[0][0])
        expect(expectedValues[entries[0][0]]).to.equal(entries[0][1])
        expect(expectedValues).to.have.ownProperty(entries[1][0])
        expect(expectedValues[entries[1][0]]).to.equal(entries[1][1])

        var keys = BoundScopy.keys(new Test())

        expect(keys).to.have.lengthOf(2)
        expect(keys).to.include('foo')
        expect(keys).to.include('bar')

        var values = BoundScopy.values(new Test())

        expect(values).to.have.lengthOf(2)
        expect(values).to.include(true)
        expect(values).to.include(123)

        expect(BoundScopy.using({ symbol: true })('foo')).to.be.a('symbol')
      })

      it('should ignore any options passed to methods', function() {
        expect(BoundScopy('foo', { symbol: true })).to.equal('_foo')
      })
    })
  })

  describe('.values', function() {
    context('when no options are provided', function() {
      it('should use symbols (where possible)', function() {
        var values = Scopy.values(new Test())

        expect(values).to.have.lengthOf(3)
        expect(values).to.include(true)
        expect(values).to.include(123)
        expect(values).to.include('Hello')
      })
    })

    context('when "symbol" option is enabled', function() {
      it('should return values of all of specified object\'s properties', function() {
        var values = Scopy.values(new Test(), { symbol: true })

        expect(values).to.have.lengthOf(3)
        expect(values).to.include(true)
        expect(values).to.include(123)
        expect(values).to.include('Hello')
      })
    })

    context('when "symbol" option is disabled', function() {
      it('should only return values of specified object\'s properties without underscore prefix', function() {
        var values = Scopy.values(new Test(), { symbol: false })

        expect(values).to.have.lengthOf(2)
        expect(values).to.include(true)
        expect(values).to.include(123)
      })
    })
  })

  /**
   * Returns the description that was used for the specified <code>symbol</code>.
   *
   * @param {symbol} symbol - the ES2015 <code>Symbol</code> whose description is to be returned
   * @return {string} The description for <code>symbol</code>.
   * @private
   */
  function getSymbolDescription(symbol) {
    var match = symbol.toString().match(/^Symbol\((.+)\)$/)

    return match && match[1]
  }
})
