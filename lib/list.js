/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var util = require('util');


function resolve(object, path) {
  var p = path.indexOf('.'), obj;
  if (p !== -1) {
    var key = path.substring(0, p);
    obj = object[key];
    if (obj === undefined) {
      throw new Error(util.format('Unknown property "%s"', key));
    }
    return resolve(obj, path.substring(p + 1));
  }
  obj = object[path];
  if (obj === undefined) {
    throw new Error(util.format('Unknown property "%s"', path));
  }
  return obj;
}

function sortBy(key) {
  return function (a, b) {
    a = resolve(a, key);
    b = resolve(b, key);
    return a > b ? 1 : (a < b ? -1 : 0);
  };
}

function matchRegExp(value, re) {
  var match = value.match(re);
  if (match) {
    return match;
  }
  throw new SyntaxError('Illegal expression');
}

function equals(expecation) {
  return function (value) {
    return value === expecation;
  };
}

function matches(re) {
  return function (value) {
    return re.test(value);
  };
}

function not(fn) {
  return function (v) {
    return !fn(v);
  };
}

function filter(key, comparator) {
  return function (item) {
    return comparator(String(item[key]));
  };
}

function rethrow(e, verb, value) {
  e.message = util.format('Cannot %s by "%s"; %s', verb, value, e.message);
  throw e;
}

exports.create = function (items, config) {
  var match;

  if (config.filter) {
    /*jslint regexp: true*/
    try {
      match = matchRegExp(config.filter,
          /^([\w\-\.]+) ?(=|\!=) ?([^\*]+)(\*)?$/);
      var value      = match[3];
      var comparator = match[4] ?
          matches(new RegExp('^' + value)) : equals(value);
      if (match[2] === '!=') {
        comparator = not(comparator);
      }
      items = items.filter(filter(match[1], comparator));
    } catch (e1) {
      rethrow(e1, 'filter', config.filter);
    }
  }

  if (config.sort) {
    try {
      match = matchRegExp(config.sort, /^([\w\-\.]+)(?: (ASC|DESC))?$/);
      items = items.sort(sortBy(match[1]));
    } catch (e2) {
      rethrow(e2, 'sort', config.sort);
    }
    if (match[2] === 'DESC') {
      items = items.reverse();
    }
  }

  if (config.limit) {
    return items.slice(0, config.limit);
  }

  return items;
};