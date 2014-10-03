"use strict";

var _ = require("../utils");

function makeOutlet(context, unit, spec) {
  unit = unit || {};

  var outlet = null;
  var offset = _.finite(unit.$offset);
  var gain;

  var mul = _.defaults(spec.mul, 1);
  var add = _.defaults(spec.add, 0);

  outlet = (mul === 0) ? null : _.findAudioNode(unit.$outlet);

  if (outlet && mul !== 1) {
    if (outlet.$maddOptimizable) {
      outlet.gain.value = mul;
      outlet.$maddOptimizable = false;
    } else {
      gain = context.createGain();
      gain.gain.value = 0;
      _.connect({ from: outlet, to: gain });
      _.connect({ from: mul, to: gain.gain });
      outlet = gain;
    }
  }

  if (typeof add === "number") {
    offset += add;
  } else if (outlet) {
    gain = context.createGain();
    _.connect({ from: outlet, to: gain });
    _.connect({ from: add   , to: gain });
    outlet = gain;
  } else {
    outlet = add;
  }

  return { outlet: outlet, offset: offset };
}

module.exports = makeOutlet;