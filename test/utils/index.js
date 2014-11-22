"use strict";

var _ = require("../../src/utils");

describe("utils", function() {

  describe(".isArray(value)", function() {
    it("checks if value is an array", function() {
      assert(_.isArray([]) === true);
      assert(_.isArray(arguments) === false);
    });
  });

  describe(".isBoolean(value)", function() {
    it("checks if value is a boolean value", function() {
      assert(_.isBoolean(true ) === true);
      assert(_.isBoolean(false) === true);
      assert(_.isBoolean(null ) === false);
    });
  });

  describe(".isDictionary(value)", function() {
    it("checks if value is an object created by the Object constructor", function() {
      assert(_.isDictionary({}) === true);
      assert(_.isDictionary(new RegExp()) === false);
    });
  });

  describe(".isFunction(value)", function() {
    it("checks if value is a function", function() {
      assert(_.isFunction(it) === true);
      assert(_.isFunction("") === false);
    });
  });

  describe(".isFinite(value)", function() {
    it("checks if value is, or can be coerced to, a finite number", function() {
      assert(_.isFinite(10) === true);
      assert(_.isFinite(Infinity) === false);
      assert(_.isFinite(NaN) === false);
      assert(_.isFinite("10") === false);
    });
  });

  describe(".isNaN", function() {
    it("checks if value is NaN.", function() {
      assert(_.isNaN(NaN) === true);
      assert(_.isNaN(10) === false);
      assert(_.isNaN(Infinity) === false);
      assert(_.isNaN("NaN") === false);
    });
  });

  describe(".isNull(value)", function() {
    it("checks if value is null", function() {
      assert(_.isNull(null) === true);
      assert(_.isNull(0) === false);
      assert(_.isNull(undefined) === false);
    });
  });

  describe(".isNumber(value)", function() {
    it("checks if value is a number", function() {
      assert(_.isNumber(10) === true);
      assert(_.isNumber(Infinity) === true);
      assert(_.isNumber(NaN) === false);
      assert(_.isNumber("10") === false);
    });
  });

  describe(".isObject(value)", function() {
    it("checks if value is the language type of Object", function() {
      assert(_.isObject({}) === true);
      assert(_.isObject(it) === true);
      assert(_.isObject(null) === false);
      assert(_.isObject(1000) === false);
      assert(_.isObject("10") === false);
    });
  });

  describe(".isString(value)", function() {
    it("checks if value is a string.", function() {
      assert(_.isString("") === true);
      assert(_.isString([]) === false);
    });
  });

  describe(".isTypedArray(value)", function() {
    it("checks if value is an instance of TypedArray", function() {
      assert(_.isTypedArray(new Float32Array()) === true);
      assert(_.isTypedArray(new Uint8Array()) === true);
      assert(_.isTypedArray(new Int8Array()) === true);
      assert(_.isTypedArray(new Uint16Array()) === true);
      assert(_.isTypedArray(new Int16Array()) === true);
      assert(_.isTypedArray(new Uint32Array()) === true);
      assert(_.isTypedArray(new Int32Array()) === true);
      assert(_.isTypedArray(new Float64Array()) === true);
      assert(_.isTypedArray(new Uint8ClampedArray()) === true);
      assert(_.isTypedArray([]) === false);
      assert(_.isTypedArray("") === false);
    });
  });

  describe(".isUndefined(value)", function() {
    it("checks if value is undefined", function() {
      assert(_.isUndefined(undefined) === true);
      assert(_.isUndefined(0) === false);
      assert(_.isUndefined(null) === false);
    });
  });

  describe(".toArray(list)", function() {
    it("converts the list to an array", function() {
      assert.deepEqual(_.toArray(arguments), []);
      assert.deepEqual(_.toArray([ 5, 10 ]), [ 5, 10 ]);
      assert.deepEqual(_.toArray(null), []);
    });
  });

  describe(".clipAt(list, index)", function() {
    it("gets the element with the clipped index", function() {
      var list = [ 0, 1, 2, 3, 4, 5 ];
      assert(_.clipAt(list, -9) === 0);
      assert(_.clipAt(list, -8) === 0);
      assert(_.clipAt(list, -7) === 0);
      assert(_.clipAt(list, -6) === 0);
      assert(_.clipAt(list, -5) === 0);
      assert(_.clipAt(list, -4) === 0);
      assert(_.clipAt(list, -3) === 0);
      assert(_.clipAt(list, -2) === 0);
      assert(_.clipAt(list, -1) === 0);
      assert(_.clipAt(list,  0) === 0);
      assert(_.clipAt(list,  1) === 1);
      assert(_.clipAt(list,  2) === 2);
      assert(_.clipAt(list,  3) === 3);
      assert(_.clipAt(list,  4) === 4);
      assert(_.clipAt(list,  5) === 5);
      assert(_.clipAt(list,  6) === 5);
      assert(_.clipAt(list,  7) === 5);
      assert(_.clipAt(list,  8) === 5);
      assert(_.clipAt(list,  9) === 5);
    });
  });

  describe(".wrapAt(list, index)", function() {
    it("gets the element with the clipped index", function() {
      var list = [ 0, 1, 2, 3, 4, 5 ];
      assert(_.wrapAt(list, -9) === 3);
      assert(_.wrapAt(list, -8) === 4);
      assert(_.wrapAt(list, -7) === 5);
      assert(_.wrapAt(list, -6) === 0);
      assert(_.wrapAt(list, -5) === 1);
      assert(_.wrapAt(list, -4) === 2);
      assert(_.wrapAt(list, -3) === 3);
      assert(_.wrapAt(list, -2) === 4);
      assert(_.wrapAt(list, -1) === 5);
      assert(_.wrapAt(list,  0) === 0);
      assert(_.wrapAt(list,  1) === 1);
      assert(_.wrapAt(list,  2) === 2);
      assert(_.wrapAt(list,  3) === 3);
      assert(_.wrapAt(list,  4) === 4);
      assert(_.wrapAt(list,  5) === 5);
      assert(_.wrapAt(list,  6) === 0);
      assert(_.wrapAt(list,  7) === 1);
      assert(_.wrapAt(list,  8) === 2);
      assert(_.wrapAt(list,  9) === 3);
    });
  });

  describe(".foldAt(list, index)", function() {
    it("gets the element with the clipped index", function() {
      var list = [ 0, 1, 2, 3, 4, 5 ];
      assert(_.foldAt(list, -9) === 1);
      assert(_.foldAt(list, -8) === 2);
      assert(_.foldAt(list, -7) === 3);
      assert(_.foldAt(list, -6) === 4);
      assert(_.foldAt(list, -5) === 5);
      assert(_.foldAt(list, -4) === 4);
      assert(_.foldAt(list, -3) === 3);
      assert(_.foldAt(list, -2) === 2);
      assert(_.foldAt(list, -1) === 1);
      assert(_.foldAt(list,  0) === 0);
      assert(_.foldAt(list,  1) === 1);
      assert(_.foldAt(list,  2) === 2);
      assert(_.foldAt(list,  3) === 3);
      assert(_.foldAt(list,  4) === 4);
      assert(_.foldAt(list,  5) === 5);
      assert(_.foldAt(list,  6) === 4);
      assert(_.foldAt(list,  7) === 3);
      assert(_.foldAt(list,  8) === 2);
      assert(_.foldAt(list,  9) === 1);
    });
  });

  describe(".definePropertyIfNotExists(obj, prop, descriptor)", function() {
    it("defines a property if not exists", function() {
      var obj = {};

      _.definePropertyIfNotExists(obj, "value", { value: 100 });
      _.definePropertyIfNotExists(obj, "value", { value: 200 });

      assert(obj.value === 100);
    });
  });

  describe(".format(fmt, dict)", function() {
    it("should format with an array", function() {
      assert(_.format("#{0} is #{1}", [
        "rock and roll", "dead", "!?"
      ]) === "rock and roll is dead");
    });
    it("should format with a dictionary", function() {
      assert(_.format("#{a} is #{b}", {
        a: "rock and roll", b: "dead", ".": "!?"
      }) === "rock and roll is dead");
    });
  });

  describe(".num(value)", function() {
    it("converts into a number", function() {
      assert(_.num(10) === 10);
      assert(_.num("10") === 10);
      assert(_.num(Infinity) === Infinity);
      assert(_.num(NaN) === 0);
      assert(_.num("zero") === 0);
    });
  });

  describe(".int(value)", function() {
    it("converts into an integer", function() {
      assert(_.int(10.5) === 10);
      assert(_.int("10.5") === 10);
      assert(_.int(Infinity) === 0);
      assert(_.int(NaN) === 0);
      assert(_.int("zero") === 0);
    });
  });

  describe(".finite(value)", function() {
    it("converts into a finite number", function() {
      assert(_.finite(10) === 10);
      assert(_.finite(10.5) === 10.5);
      assert(_.finite("10") === 10);
      assert(_.finite("10.5") === 10.5);
      assert(_.finite(Infinity) === 0);
      assert(_.finite(NaN) === 0);
      assert(_.finite("zero") === 0);
    });
  });

  describe(".clip(value, min, max)", function() {
    it("clip a value", function() {
      assert(_.clip(-1.5, -1, +1) === -1);
      assert(_.clip(-0.5, -1, +1) === -0.5);
      assert(_.clip(+0.5, -1, +1) === +0.5);
      assert(_.clip(+1.5, -1, +1) === +1);
    });
  });

  describe(".typeOf(value)", function() {
    it("returns type name", function() {
      assert(_.typeOf(10) === "number");
      assert(_.typeOf([]) === "array");
      assert(_.typeOf("") === "string");
      assert(_.typeOf(it) === "function");
      assert(_.typeOf(true) === "boolean");
      assert(_.typeOf(null) === "null");
      assert(_.typeOf(undefined) === "undefined");
      assert(_.typeOf(NaN) === "nan");
      assert(_.typeOf(new Float32Array()) === "float32array");
      assert(_.typeOf({ constructor: null }) === "object");
      assert(_.typeOf({ constructor: true }) === "object");

      function A() {} // minified
      A.$name = "NeuBuffer";

      var a = new A();

      assert(_.typeOf(a) === "neubuffer");
    });
  });

  describe(".defaults(value, defaultValue)", function() {
    it("return default value if it receives null or undefined", function() {
      assert(_.defaults(1, 10) === 1);
      assert(_.defaults(0, 10) === 0);
      assert(_.defaults(null, 10) === 10);
      assert(_.defaults(undefined, 10) === 10);
    });
  });

  describe(".inherits(ctor, superCtor)", function() {
    it("inherit the prototype methods from one constructor into another. ", function() {
      function A() {}
      function B() {}
      _.inherits(B, A);
      assert(new B() instanceof A);
    });
  });

});
