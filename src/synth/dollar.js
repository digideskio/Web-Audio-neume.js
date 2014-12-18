"use strict";

var util = require("../util");
var neume = require("../namespace");

require("../component/param");
require("./ugen");
require("./ugen-promise");

function NeuSynthDollar(synth) {
  var db = new neume.DB();

  var atParam = createParamBuilder(synth);
  var promises = {};

  function builder() {
    var args = util.toArray(arguments);
    var key = args.shift();
    var spec = util.isDictionary(args[0]) ? args.shift() : {};
    var inputs = util.flatten(args);
    var ugen, promise;

    if (typeof key === "string") {
      if (key.charAt(0) === "@") {
        key = key.substr(1);
        return atParam(key, spec, inputs.pop(), inputs);
      }
      if (key.charAt(0) === "#") {
        key = key.substr(1);
        ugen = promises[key] || db.find({ id: key })[0];
        if (ugen == null) {
          ugen = new neume.UGenPromise(synth, key);
          promises[key] = ugen;
        }
        return ugen;
      }
    }

    ugen = neume.UGen.build(synth, key, spec, inputs);

    if (ugen.$id) {
      promise = promises[ugen.$id];
      if (promise) {
        promise.resolve(ugen);
      }
      promises[ugen.$id] = null;
    }

    db.append(ugen);

    return ugen;
  }

  builder.timeout = function(value) {
    return {
      next: function() {
        return { value: value, done: true };
      }
    };
  };
  builder.interval = function(value) {
    return {
      next: function() {
        return { value: value, done: false };
      }
    };
  };
  builder.stop = function(stopTime) {
    synth.$context.sched(synth.$context.toSeconds(stopTime), function(t0) {
      synth.stop(t0);
    });
  };

  this.db = db;
  this.builder = builder;
}

function createParamBuilder(synth) {
  var params = {};

  return function(name, spec, defaultValue, inputs) {
    if (params.hasOwnProperty(name)) {
      return params[name];
    }
    validateParam(name, defaultValue);

    defaultValue = util.finite(util.defaults(defaultValue, 0));

    var param = new neume.Param(synth.$context, defaultValue, spec);

    Object.defineProperty(synth, name, {
      value: param,
      enumerable: true
    });

    var ugen;

    if (inputs.length) {
      ugen = neume.UGen.build(synth, "+", spec, [ inputs ]);
      ugen = neume.UGen.build(synth, "+", { mul: param }, [ ugen ]);
    } else {
      ugen = neume.UGen.build(synth, "+", spec, [ param ]);
    }

    params[name] = ugen;

    return ugen;
  };
}

function validateParam(name) {
  if (!/^[a-z]\w*$/.test(name)) {
    throw new TypeError(util.format(
      "invalid parameter name: #{name}", { name: name }
    ));
  }
}

module.exports = neume.SynthDollar = NeuSynthDollar;
