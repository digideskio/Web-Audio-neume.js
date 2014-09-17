"use strict";

var neume = require("../src/neume");

neume.use(require("../src/ugen/audio-node"));
neume.use(require("../src/ugen/osc"));

describe("ugen/audio-node", function() {
  it("$(gain, $(sin))", function() {
    var audioContext = neume.Neume.context;
    var synth = neume.Neume(function($) {
      var gain = audioContext.createGain();

      gain.$id = "gain";

      return $(gain, $("sin"));
    })();

    assert.deepEqual(synth.outlet.toJSON(), {
      name: "GainNode#gain",
      gain: {
        value: 1,
        inputs: []
      },
      inputs: [
        {
          name: "OscillatorNode",
          type: "sine",
          frequency: {
            value: 440,
            inputs: []
          },
          detune: {
            value: 0,
            inputs: []
          },
          inputs: []
        }
      ]
    });
  });
  it("$(osc, $(sin))", function() {
    var audioContext = neume.Neume.context;
    var synth = neume.Neume(function($) {
      var osc = audioContext.createOscillator();

      osc.$id = "osc";

      return $(osc, $("sin"));
    })();

    assert.deepEqual(synth.outlet.toJSON(), {
      name: "OscillatorNode#osc",
      type: "sine",
      frequency: {
        value: 440,
        inputs: []
      },
      detune: {
        value: 0,
        inputs: []
      },
      inputs: []
    });
  });
});
