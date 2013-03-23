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

  'adds created and modified for timestamps using date format': sinon.test(
    function () {
      processor.process([this.item], '', {
        dateFormat : 'dddd, MMMM Do YYYY'
      });

      assert.equal(this.item.date.created, 'Thursday, January 1st 1970');
      assert.equal(this.item.date.modified, 'Thursday, January 1st 1970');
    }
  ),


  'does not add date if not configured': function () {
    processor.process([this.item], '', {});

    assert.strictEqual(this.item.date, undefined);
  },


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
  }),


  'adds link object to results': function () {
    processor.process([this.item], '', {});

    assert.deepEqual(this.item.link, { previous : null, next : null });
  },


  'passes items to itemLinker.previousNext': sinon.test(function () {
    this.stub(itemLinker, 'previousNext');
    var firstItem  = { meta : {} };
    var secondItem = { meta : { } };

    processor.process([firstItem, secondItem], '', {});

    sinon.assert.calledOnce(itemLinker.previousNext);
    sinon.assert.calledWith(itemLinker.previousNext, [firstItem, secondItem]);
  })

});

