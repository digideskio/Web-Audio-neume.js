module.exports = function(neume, util) {
  "use strict";

  var ITERATE = 0;
  var FINISHED = 1;

  /**
   * $("iter", {
   *   iter: [iterator] = null
   *   tC: [number] = 0
   * } ... inputs)
   *
   * methods:
   *   next(t)
   *   reset(t)
   *
   * +--------+      +-------+
   * | inputs |  or  | DC(1) |
   * +--------+      +-------+
   *   ||||||
   * +----------------------+
   * | GainNode             |
   * | - gain: array[index] |
   * +----------------------+
   *   |
   */
  neume.register("iter", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.$context;

    var iter = util.defaults(spec.iter, null);
    var state = ITERATE;
    var param = new neume.Param(context, 0, spec);
    var outlet = inputs.length ? param.toAudioNode(inputs) : param;

    function start(t) {
      var items = iterNext();

      if (items.done) {
        state = FINISHED;
        ugen.emit("end", { playbackTime: t }, ugen.$synth);
      } else {
        param.setValueAtTime(util.finite(items.value), t);
      }
    }

    function setValue(e) {
      if (typeof e.value === "object" && typeof e.value.next === "function") {
        iter = e.value;
      }
    }

    function next(e) {
      if (state === ITERATE) {
        var items = iterNext();
        var t0 = util.finite(context.toSeconds(e.playbackTime));

        if (items.done) {
          state = FINISHED;
          ugen.emit("end", { playbackTime: t0 }, ugen.$synth);
        } else {
          param.update(util.finite(items.value), t0);
        }
      }
    }

    function iterNext() {
      if (iter == null) {
        return { value: undefined, done: true };
      }
      var items;
      if (typeof iter.next === "function") {
        items = iter.next();
        if (!util.isObject(items)) {
          items = { value: items, done: false };
        }
      } else {
        items = { value: iter.valueOf(), done: false };
      }
      return items;
    }

    return new neume.Unit({
      outlet: outlet,
      start: start,
      methods: {
        setValue: setValue,
        next: next
      }
    });
  }

};
