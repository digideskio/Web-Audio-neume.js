"use strict";

var _ = require("./utils");
var Emitter = require("./emitter");
var NeuUnit = require("./unit");
var makeOutlet = require("./ugen-makeOutlet");
var selectorParser = require("./selector-parser");

function NeuUGen(synth, key, spec, inputs) {
  Emitter.call(this);

  var parsed = selectorParser.parse(key);

  this.$synth   = synth;
  this.$context = synth.$context;
  this.$key   = parsed.key;
  this.$class = parsed.class;
  this.$id    = parsed.id;

  if (!NeuUGen.registered.hasOwnProperty(parsed.key)) {
    throw new Error("unknown key: " + key);
  }

  var unit = NeuUGen.registered[parsed.key](this, spec, inputs);

  if (!(unit instanceof NeuUnit)) {
    throw new Error("invalid key: " + key);
  }

  this.$unit   = unit;
  this.$outlet = makeOutlet(this.$context, unit, spec);

  Object.defineProperties(this, {
    context: {
      value: _.findAudioContext(this.$context),
      enumerable: true
    },
    outlet: {
      value: _.findAudioNode(this.$outlet),
      enumerable: true
    },
  });

  _.each(unit.$methods, function(method, name) {
    _.definePropertyIfNotExists(this, name, {
      value: method
    });
  }, this);
}
_.inherits(NeuUGen, Emitter);

NeuUGen.registered = {};

NeuUGen.register = function(name, func) {
  if (!selectorParser.isValidUGenName(name)) {
    throw new Error("invalid ugen name: " + name);
  }
  if (!_.isFunction(func)) {
    throw new TypeError("ugen must be a function");
  }
  NeuUGen.registered[name] = func;
};

NeuUGen.build = function(synth, key, spec, inputs) {
  if (!_.isString(key)) {
    spec.value = key;
    key = _.typeOf(key);
  }

  return new NeuUGen(synth, key, spec, inputs);
};

NeuUGen.prototype.add = function(node) {
  return new NeuUGen(this.$synth, "+", {}, [ this, _.defaults(node, 0) ]);
};

NeuUGen.prototype.mul = function(node) {
  return new NeuUGen(this.$synth, "*", {}, [ this, _.defaults(node, 1) ]);
};

NeuUGen.prototype.madd = function(mul, add) {
  return this.mul(_.defaults(mul, 1)).add(_.defaults(add, 0));
};

module.exports = NeuUGen;
