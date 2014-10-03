"use strict";

// Safari 7.0.6  needs webkit prefix
window.AudioContext = window.AudioContext || /* istanbul ignore next */ window.webkitAudioContext;
window.OfflineAudioContext = window.OfflineAudioContext || /* istanbul ignore next */ window.webkitOfflineAudioContext;

var _ = require("../utils");

var neume = function(context) {
  function Neume(spec) {
    return new neume.SynthDef(context, spec);
  }

  Object.defineProperties(Neume, {
    context: {
      value: context.$context,
      enumerable: true
    },
    destination: {
      value: context.$destination,
      enumerable: true
    },
    sampleRate: {
      value: context.sampleRate,
      enumerable: true
    },
    currentTime: {
      get: function() {
        return context.currentTime;
      },
      enumerable: true
    },
    Buffer: {
      value: Object.defineProperties(function(channels, length, sampleRate) {
        return neume.Buffer.create(context, channels, length, sampleRate);
      }, {
        from: {
          value: function(data) {
            return neume.Buffer.from(context, data);
          },
          enumerable: true
        },
        load: {
          value: function(url) {
            return neume.Buffer.load(context, url);
          },
          enumerable: true
        }
      }),
      enumerable: true
    },
    Interval: {
      value: function(interval, callback) {
        return new neume.Interval(context, interval, callback);
      },
      enumerable: true
    },
    Timeout: {
      value: function(interval, callback) {
        return new neume.Timeout(context, interval, callback);
      },
      enumerable: true
    },
  });

  return Neume;
};

neume._        = _;
neume.Context  = require("./context");
neume.DC       = require("../component/dc");
neume.DryWet   = require("../component/drywet");
neume.Buffer   = require("../control/buffer");
neume.Interval = require("../control/interval");
neume.Timeout  = require("../control/timeout");
neume.FFT      = require("../dsp/fft");
neume.Emitter  = require("../event/emitter");
neume.In       = require("../node/in");
neume.Node     = require("../node/node");
neume.Param    = require("../node/param");
neume.UGen     = require("../node/ugen");
neume.Unit     = require("../node/unit");
neume.SynthDB  = require("../synth/db");
neume.Synth    = require("../synth/synth");
neume.SynthDef = require("../synth/synthdef");

_.each(require("../const"), function(val, key) {
  neume[key] = val;
});

neume.register = function(name, func) {
  neume.UGen.register(name, func);
  return neume;
};

neume.use = function(fn) {
  /* istanbul ignore else */
  if (neume.use.used.indexOf(fn) === -1) {
    fn(neume, _);
    neume.use.used.push(fn);
  }
  return neume;
};
neume.use.used = [];

neume.render = function(context, duration, func) {
  var sampleRate = context.sampleRate;
  var length     = _.int(sampleRate * duration);

  return new Promise(function(resolve) {
    var audioContext = new window.OfflineAudioContext(2, length, sampleRate);
    audioContext.oncomplete = function(e) {
      resolve(new neume.Buffer(context, e.renderedBuffer));
    };
    func(neume(new neume.Context(audioContext.destination, duration)));
    audioContext.startRendering();
  });
};

neume.exports = function(destination) {
  if (destination instanceof window.AudioContext) {
    destination = destination.destination;
  }
  if (!(destination instanceof window.AudioNode)) {
    throw new TypeError("neume(): illegal argument");
  }

  var context = new neume.Context(destination);

  return Object.defineProperties(
    neume(context), {
      render: {
        value: function(duration, func) {
          return neume.render(context, duration, func);
        },
        enumerable: true
      },
      master: {
        get: function() {
          return context.getMasterGain();
        },
        enumerable: true
      },
      analyser: {
        get: function() {
          return context.getAnalyser();
        },
        enumerable: true
      }
    }
  );
};

neume.exports.use = neume.use;

module.exports = neume;