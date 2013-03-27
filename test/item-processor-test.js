/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var test       = require('utest');
var assert     = require('assert');
var sinon      = require('sinon');

var fs         = require('fs');
var processor  = require('../lib/item-processor');
var itemLinker = require('../lib/item-linker');


test('processor', {

  before: function () {
    sinon.stub(fs, 'existsSync').returns(false);
    this.item = { meta : {} };
  },

  after: function () {
    fs.existsSync.restore();
  },

  'adds created and modified for timestamps using multiple formats':
    sinon.test(function () {
      processor.process([this.item], '', {
        dateFormats : {
          fullDate  : 'MMMM Do YYYY',
          someTime  : 'HH:mm:ss'
        }
      });

      assert.equal(this.item.fullDate.created, 'January 1st 1970');
      assert.equal(this.item.fullDate.modified, 'January 1st 1970');
      assert.equal(this.item.someTime.created, '01:00:00');
      assert.equal(this.item.someTime.modified, '01:00:00');
    }),


  'checks for processor.js in given path': function () {
    processor.process([], 'some/path', {});

    sinon.assert.calledOnce(fs.existsSync);
    sinon.assert.calledWith(fs.existsSync,
        process.cwd() + '/some/path/processor.js');
  },


  'requires and calls function exported by processor.js': function () {
    fs.existsSync.returns(true);

    processor.process([this.item], 'test/fixture', {});

    assert(this.item.iWasHere);
  },


  'adds created and modified timestamps to meta': sinon.test(function () {
    processor.process([this.item], '', {});

    assert.equal(this.item.meta.created, '1970-01-01T01:00:00+01:00');
    assert.equal(this.item.meta.modified, '1970-01-01T01:00:00+01:00');
  })

});

