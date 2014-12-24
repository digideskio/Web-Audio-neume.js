"use strict";

var C = require("../const");
var util = require("../util");
var neume = require("../namespace");
var toSeconds = require("../util/toSeconds");

var INIT = 0;
var START = 1;
var MAX_RENDERING_SEC = C.MAX_RENDERING_SEC;

var schedId = 1;

function NeuContext(destination, duration) {
  this.context = this;
  this.destination = destination;
  this.audioContext = destination.context;
  this.sampleRate = this.audioContext.sampleRate;
  this.listener = this.audioContext.listener;
  this.analyser = this.audioContext.createAnalyser();

  this._bpm = 120;
  this._scriptProcessor = null;
  this._audioBuses = [];
  this._processBufSize = C.PROCESS_BUF_SIZE;

  this.connect(this.analyser, this.destination);

  Object.defineProperties(this, {
    currentTime: {
      get: function() {
        return this._currentTime || this.audioContext.currentTime;
      },
      enumerable: true
    },
    bpm: {
      get: function() {
        return this._bpm;
      },
      set: function(value) {
        this._bpm = Math.max(1e-6, util.finite(value));
      },
      enumerable: true
    },
  });

  this._duration = duration;
  this.reset();
}
NeuContext.$$name = "NeuContext";

Object.keys(neume.webaudio.AudioContext.prototype).forEach(function(key) {
  var desc = Object.getOwnPropertyDescriptor(neume.webaudio.AudioContext.prototype, key);

  /* istanbul ignore next */
  if (typeof desc.value !== "function") {
    return;
  }

  var method = neume.webaudio.AudioContext.prototype[key];

  NeuContext.prototype[key] = function() {
    return method.apply(this.audioContext, arguments);
  };
});

NeuContext.prototype.getAudioBus = function(index) {
  index = util.clip(util.int(util.defaults(index, 0)), 0, C.AUDIO_BUS_CHANNELS);
  if (!this._audioBuses[index]) {
    this._audioBuses[index] = new neume.AudioBus(this);
  }
  return this._audioBuses[index];
};

NeuContext.prototype.reset = function() {
  this._audioBuses.splice(0).forEach(function(bus) {
    bus.toAudioNode().disconnect();
  }, this);
  this.disconnect(this._scriptProcessor);

  this._events = [];
  this._nextTicks = [];
  this._state = INIT;
  this._currentTime = 0;
  this._scriptProcessor = null;

  return this;
};

NeuContext.prototype.start = function() {
  if (this._state === INIT) {
    this._state = START;
    this.connect(this.getAudioBus(0).outlet, this.analyser);
    if (this.audioContext instanceof neume.webaudio.OfflineAudioContext) {
      startRendering.call(this);
    } else {
      startAudioTimer.call(this);
    }
  }
  return this;
};

function startRendering() {
  this._currentTimeIncr = util.clip(util.finite(this._duration), 0, MAX_RENDERING_SEC);
  onaudioprocess.call(this, { playbackTime: 0 });
}

function startAudioTimer() {
  var context = this.audioContext;
  var scriptProcessor = context.createScriptProcessor(this._processBufSize, 1, 1);
  var bufferSource = context.createBufferSource();

  this._currentTimeIncr = this._processBufSize / context.sampleRate;
  this._scriptProcessor = scriptProcessor;
  scriptProcessor.onaudioprocess = onaudioprocess.bind(this);

  // this is needed for iOS Safari
  bufferSource.start(0);
  this.connect(bufferSource, scriptProcessor);

  this.connect(scriptProcessor, context.destination);
}

NeuContext.prototype.stop = function() {
  return this;
};

NeuContext.prototype.sched = function(time, callback, ctx) {
  time = util.finite(time);

  if (typeof callback !== "function") {
    return 0;
  }

  var events = this._events;
  var event = {
    id: schedId++,
    time: time,
    callback: callback,
    context: ctx || this
  };

  if (events.length === 0 || events[events.length - 1].time <= time) {
    events.push(event);
  } else {
    for (var i = 0, imax = events.length; i < imax; i++) {
      if (time < events[i].time) {
        events.splice(i, 0, event);
        break;
      }
    }
  }

  return event.id;
};

NeuContext.prototype.unsched = function(id) {
  id = util.finite(id);

  if (id !== 0) {
    var events = this._events;
    for (var i = 0, imax = events.length; i < imax; i++) {
      if (id === events[i].id) {
        events.splice(i, 1);
        break;
      }
    }
  }

  return id;
};

NeuContext.prototype.nextTick = function(callback, ctx) {
  this._nextTicks.push(callback.bind(ctx || this));
  return this;
};

NeuContext.prototype.toAudioNode = function(obj) {
  if (obj && obj.toAudioNode) {
    obj = obj.toAudioNode();
  } else if (typeof obj === "number") {
    obj = new neume.DC(this, obj).toAudioNode();
  }
  if (!(obj instanceof neume.webaudio.AudioNode)) {
    obj = null;
  }
  return obj;
};

NeuContext.prototype.toAudioBuffer = function(obj) {
  if (obj && obj.toAudioBuffer) {
    return obj.toAudioBuffer();
  }
  if (!(obj instanceof neume.webaudio.AudioBuffer)) {
    obj = null;
  }
  return obj;
};

NeuContext.prototype.connect = function(from, to) {
  if (to) {
    if (Array.isArray(from)) {
      if (from.length) {
        new neume.Sum(this, from).connect(to);
      }
    } else if (from instanceof neume.Component || from instanceof neume.UGen) {
      from.connect(to);
    } else if (to instanceof neume.webaudio.AudioParam) {
      if (typeof from === "number") {
        to.value = util.finite(from);
      } else {
        from = this.toAudioNode(from);
        if (from) {
          from.connect(to);
        }
      }
    } else if (to instanceof neume.webaudio.AudioNode) {
      from = this.toAudioNode(from);
      if (from) {
        from.connect(to);
      }
    } else if (to instanceof neume.AudioBus) {
      this.connect(from, to.toAudioNode());
    }
    if (to.onconnected) {
      to.onconnected(from);
    }
  }
  return this;
};

NeuContext.prototype.disconnect = function(node) {
  if (node) {
    if (typeof node.disconnect === "function") {
      node.disconnect();
      if (node.$$outputs) {
        node.$$outputs.forEach(function(to) {
          return to.ondisconnected && to.ondisconnected(node);
        });
      }
    } else if (Array.isArray(node)) {
      node.forEach(function(node) {
        this.disconnect(node);
      }, this);
    }
  }
  return this;
};

NeuContext.prototype.toSeconds = function(value) {
  return toSeconds(value, this._bpm, this.sampleRate, this.currentTime);
};

function onaudioprocess(e) {
  // Safari 7.0.6 does not support e.playbackTime
  var currentTime = e.playbackTime || /* istanbul ignore next */ this.audioContext.currentTime;
  var nextCurrentTime = currentTime + this._currentTimeIncr;
  var events = this._events;

  this._currentTime = currentTime;

  this._nextTicks.splice(0).forEach(function(callback) {
    callback(currentTime);
  });

  while (events.length && events[0].time <= nextCurrentTime) {
    var event = events.shift();

    this._currentTime = Math.max(this._currentTime, event.time);

    event.callback.call(event.context, event.time);
  }
}

module.exports = neume.Context = NeuContext;
