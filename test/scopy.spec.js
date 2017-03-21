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
  // TODO: Complete

  it('should be a function', function() {
    expect(Scopy).to.be.a('function')
  })

  it('should throw an error if instantiated', function() {
    expect(function() {
      return new Scopy('foo')
    }).to.throw(TypeError, 'Scopy is not a constructor')
  })

  context('when no options are provided', function() {
    it('should use symbols', function() {
      expect(Scopy('foo')).to.be.a('symbol')
    })
  })

  context('when "symbol" option is enabled', function() {
    it('should return symbol for specified name', function() {
      var key = Scopy('foo', { symbol: true })

      expect(key).to.be.a('symbol')
      expect(getSymbolDescription(key)).to.equal('foo')
    })

    it('should return unique symbol for same name', function() {
      var key1 = Scopy('foo', { symbol: true })
      var key2 = Scopy('foo', { symbol: true })

      expect(key1).to.be.a('symbol')
      expect(getSymbolDescription(key1)).to.equal('foo')
      expect(key2).to.be.a('symbol')
      expect(getSymbolDescription(key2)).to.equal('foo')
      expect(key1).to.not.equal(key2)
    })
  })

  context('when "symbol" option is disabled', function() {
    it('should return specified name with underscore prefix', function() {
      var key = Scopy('foo', { symbol: false })

      expect(key).to.equal('_foo')
    })
  })

  describe('.all', function() {
    context('when no options are provided', function() {
      it('should use symbols')
    })

    context('when "symbol" option is enabled', function() {
      it('should return object containing symbols mapped to each of specified names')

      it('should return object containing unique symbols mapped to same names')
    })

    context('when "symbol" option is disabled', function() {
      it('should return object containing names with underscore prefixes mapped to specified names')
    })
  })

  describe('.entries', function() {
    context('when no options are provided', function() {
      it('should use symbols')
    })

    context('when "symbol" option is enabled', function() {
      it('should return key/value pairs for all of specified object\'s own enumerable properties')
    })

    context('when "symbol" option is disabled', function() {
      it('should only return key/value pairs for specified object\'s own enumerable properties without underscore prefix')
    })
  })

  describe('.for', function() {
    context('when no options are provided', function() {
      it('should use symbols')
    })

    context('when "symbol" option is enabled', function() {
      it('should return symbol for specified name')

      it('should return same symbol for same name')
    })

    context('when "symbol" option is disabled', function() {
      it('should return specified name with underscore prefix')
    })
  })

  describe('.forAll', function() {
    context('when no options are provided', function() {
      it('should use symbols')
    })

    context('when "symbol" option is enabled', function() {
      it('should return object containing symbols mapped to each of specified names')

      it('should return object containing same symbols mapped to same names')
    })

    context('when "symbol" option is disabled', function() {
      it('should return object containing names with underscore prefixes mapped to specified names')
    })
  })

  describe('.is', function() {
    context('when no options are provided', function() {
      it('should use symbols')
    })

    context('when "symbol" option is enabled', function() {
      context('and specified object is a symbol', function() {
        it('should return true')
      })

      context('and specified object is not a symbol', function() {
        it('should return false')
      })
    })

    context('when "symbol" option is disabled', function() {
      context('and specified object is a string with an underscore prefix', function() {
        it('should return true')
      })

      context('and specified object is a string without an underscore prefix', function() {
        it('should return false')
      })

      context('and specified object is not a string', function() {
        it('should return false')
      })
    })
  })

  describe('.keys', function() {
    context('when no options are provided', function() {
      it('should use symbols')
    })

    context('when "symbol" option is enabled', function() {
      it('should return names of all of specified object\'s own enumerable properties')
    })

    context('when "symbol" option is disabled', function() {
      it('should only return names of specified object\'s own enumerable properties without underscore prefix')
    })
  })

  describe('.values', function() {
    context('when no options are provided', function() {
      it('should use symbols')
    })

    context('when "symbol" option is enabled', function() {
      it('should return values of all of specified object\'s own enumerable properties')
    })

    context('when "symbol" option is disabled', function() {
      it('should only return values of specified object\'s own enumerable properties without underscore prefix')
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
