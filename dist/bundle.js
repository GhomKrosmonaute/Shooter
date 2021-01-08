var __commonJS = (callback, module2) => () => {
  if (!module2) {
    module2 = {exports: {}};
    callback(module2.exports, module2);
  }
  return module2.exports;
};

// node_modules/es6-promise-polyfill/promise.js
var require_promise = __commonJS((exports2) => {
  (function(global2) {
    var NativePromise = global2["Promise"];
    var nativePromiseSupported = NativePromise && "resolve" in NativePromise && "reject" in NativePromise && "all" in NativePromise && "race" in NativePromise && function() {
      var resolve2;
      new NativePromise(function(r) {
        resolve2 = r;
      });
      return typeof resolve2 === "function";
    }();
    if (typeof exports2 !== "undefined" && exports2) {
      exports2.Promise = nativePromiseSupported ? NativePromise : Promise2;
      exports2.Polyfill = Promise2;
    } else {
      if (typeof define == "function" && define.amd) {
        define(function() {
          return nativePromiseSupported ? NativePromise : Promise2;
        });
      } else {
        if (!nativePromiseSupported)
          global2["Promise"] = Promise2;
      }
    }
    var PENDING = "pending";
    var SEALED = "sealed";
    var FULFILLED = "fulfilled";
    var REJECTED = "rejected";
    var NOOP = function() {
    };
    function isArray(value) {
      return Object.prototype.toString.call(value) === "[object Array]";
    }
    var asyncSetTimer = typeof setImmediate !== "undefined" ? setImmediate : setTimeout;
    var asyncQueue = [];
    var asyncTimer;
    function asyncFlush() {
      for (var i = 0; i < asyncQueue.length; i++)
        asyncQueue[i][0](asyncQueue[i][1]);
      asyncQueue = [];
      asyncTimer = false;
    }
    function asyncCall(callback, arg) {
      asyncQueue.push([callback, arg]);
      if (!asyncTimer) {
        asyncTimer = true;
        asyncSetTimer(asyncFlush, 0);
      }
    }
    function invokeResolver(resolver, promise) {
      function resolvePromise(value) {
        resolve(promise, value);
      }
      function rejectPromise(reason) {
        reject(promise, reason);
      }
      try {
        resolver(resolvePromise, rejectPromise);
      } catch (e) {
        rejectPromise(e);
      }
    }
    function invokeCallback(subscriber) {
      var owner = subscriber.owner;
      var settled = owner.state_;
      var value = owner.data_;
      var callback = subscriber[settled];
      var promise = subscriber.then;
      if (typeof callback === "function") {
        settled = FULFILLED;
        try {
          value = callback(value);
        } catch (e) {
          reject(promise, e);
        }
      }
      if (!handleThenable(promise, value)) {
        if (settled === FULFILLED)
          resolve(promise, value);
        if (settled === REJECTED)
          reject(promise, value);
      }
    }
    function handleThenable(promise, value) {
      var resolved;
      try {
        if (promise === value)
          throw new TypeError("A promises callback cannot return that same promise.");
        if (value && (typeof value === "function" || typeof value === "object")) {
          var then = value.then;
          if (typeof then === "function") {
            then.call(value, function(val) {
              if (!resolved) {
                resolved = true;
                if (value !== val)
                  resolve(promise, val);
                else
                  fulfill(promise, val);
              }
            }, function(reason) {
              if (!resolved) {
                resolved = true;
                reject(promise, reason);
              }
            });
            return true;
          }
        }
      } catch (e) {
        if (!resolved)
          reject(promise, e);
        return true;
      }
      return false;
    }
    function resolve(promise, value) {
      if (promise === value || !handleThenable(promise, value))
        fulfill(promise, value);
    }
    function fulfill(promise, value) {
      if (promise.state_ === PENDING) {
        promise.state_ = SEALED;
        promise.data_ = value;
        asyncCall(publishFulfillment, promise);
      }
    }
    function reject(promise, reason) {
      if (promise.state_ === PENDING) {
        promise.state_ = SEALED;
        promise.data_ = reason;
        asyncCall(publishRejection, promise);
      }
    }
    function publish(promise) {
      var callbacks = promise.then_;
      promise.then_ = void 0;
      for (var i = 0; i < callbacks.length; i++) {
        invokeCallback(callbacks[i]);
      }
    }
    function publishFulfillment(promise) {
      promise.state_ = FULFILLED;
      publish(promise);
    }
    function publishRejection(promise) {
      promise.state_ = REJECTED;
      publish(promise);
    }
    function Promise2(resolver) {
      if (typeof resolver !== "function")
        throw new TypeError("Promise constructor takes a function argument");
      if (this instanceof Promise2 === false)
        throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
      this.then_ = [];
      invokeResolver(resolver, this);
    }
    Promise2.prototype = {
      constructor: Promise2,
      state_: PENDING,
      then_: null,
      data_: void 0,
      then: function(onFulfillment, onRejection) {
        var subscriber = {
          owner: this,
          then: new this.constructor(NOOP),
          fulfilled: onFulfillment,
          rejected: onRejection
        };
        if (this.state_ === FULFILLED || this.state_ === REJECTED) {
          asyncCall(invokeCallback, subscriber);
        } else {
          this.then_.push(subscriber);
        }
        return subscriber.then;
      },
      catch: function(onRejection) {
        return this.then(null, onRejection);
      }
    };
    Promise2.all = function(promises) {
      var Class = this;
      if (!isArray(promises))
        throw new TypeError("You must pass an array to Promise.all().");
      return new Class(function(resolve2, reject2) {
        var results = [];
        var remaining = 0;
        function resolver(index) {
          remaining++;
          return function(value) {
            results[index] = value;
            if (!--remaining)
              resolve2(results);
          };
        }
        for (var i = 0, promise; i < promises.length; i++) {
          promise = promises[i];
          if (promise && typeof promise.then === "function")
            promise.then(resolver(i), reject2);
          else
            results[i] = promise;
        }
        if (!remaining)
          resolve2(results);
      });
    };
    Promise2.race = function(promises) {
      var Class = this;
      if (!isArray(promises))
        throw new TypeError("You must pass an array to Promise.race().");
      return new Class(function(resolve2, reject2) {
        for (var i = 0, promise; i < promises.length; i++) {
          promise = promises[i];
          if (promise && typeof promise.then === "function")
            promise.then(resolve2, reject2);
          else
            resolve2(promise);
        }
      });
    };
    Promise2.resolve = function(value) {
      var Class = this;
      if (value && typeof value === "object" && value.constructor === Class)
        return value;
      return new Class(function(resolve2) {
        resolve2(value);
      });
    };
    Promise2.reject = function(reason) {
      var Class = this;
      return new Class(function(resolve2, reject2) {
        reject2(reason);
      });
    };
  })(typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : exports2);
});

// node_modules/object-assign/index.js
var require_object_assign = __commonJS((exports2, module2) => {
  /*
  object-assign
  (c) Sindre Sorhus
  @license MIT
  */
  "use strict";
  var getOwnPropertySymbols = Object.getOwnPropertySymbols;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var propIsEnumerable = Object.prototype.propertyIsEnumerable;
  function toObject(val) {
    if (val === null || val === void 0) {
      throw new TypeError("Object.assign cannot be called with null or undefined");
    }
    return Object(val);
  }
  function shouldUseNative() {
    try {
      if (!Object.assign) {
        return false;
      }
      var test1 = new String("abc");
      test1[5] = "de";
      if (Object.getOwnPropertyNames(test1)[0] === "5") {
        return false;
      }
      var test2 = {};
      for (var i = 0; i < 10; i++) {
        test2["_" + String.fromCharCode(i)] = i;
      }
      var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
        return test2[n];
      });
      if (order2.join("") !== "0123456789") {
        return false;
      }
      var test3 = {};
      "abcdefghijklmnopqrst".split("").forEach(function(letter) {
        test3[letter] = letter;
      });
      if (Object.keys(Object.assign({}, test3)).join("") !== "abcdefghijklmnopqrst") {
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  }
  module2.exports = shouldUseNative() ? Object.assign : function(target, source) {
    var from;
    var to = toObject(target);
    var symbols;
    for (var s = 1; s < arguments.length; s++) {
      from = Object(arguments[s]);
      for (var key in from) {
        if (hasOwnProperty.call(from, key)) {
          to[key] = from[key];
        }
      }
      if (getOwnPropertySymbols) {
        symbols = getOwnPropertySymbols(from);
        for (var i = 0; i < symbols.length; i++) {
          if (propIsEnumerable.call(from, symbols[i])) {
            to[symbols[i]] = from[symbols[i]];
          }
        }
      }
    }
    return to;
  };
});

// node_modules/@pixi/polyfill/lib/polyfill.js
var require_polyfill = __commonJS(() => {
  /*!
   * @pixi/polyfill - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/polyfill is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  function _interopDefault(ex) {
    return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
  }
  var es6PromisePolyfill = require_promise();
  var objectAssign = _interopDefault(require_object_assign());
  if (!window.Promise) {
    window.Promise = es6PromisePolyfill.Polyfill;
  }
  if (!Object.assign) {
    Object.assign = objectAssign;
  }
  var ONE_FRAME_TIME = 16;
  if (!(Date.now && Date.prototype.getTime)) {
    Date.now = function now() {
      return new Date().getTime();
    };
  }
  if (!(window.performance && window.performance.now)) {
    startTime_1 = Date.now();
    if (!window.performance) {
      window.performance = {};
    }
    window.performance.now = function() {
      return Date.now() - startTime_1;
    };
  }
  var startTime_1;
  var lastTime = Date.now();
  var vendors = ["ms", "moz", "webkit", "o"];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    p = vendors[x];
    window.requestAnimationFrame = window[p + "RequestAnimationFrame"];
    window.cancelAnimationFrame = window[p + "CancelAnimationFrame"] || window[p + "CancelRequestAnimationFrame"];
  }
  var p;
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      if (typeof callback !== "function") {
        throw new TypeError(callback + "is not a function");
      }
      var currentTime = Date.now();
      var delay = ONE_FRAME_TIME + lastTime - currentTime;
      if (delay < 0) {
        delay = 0;
      }
      lastTime = currentTime;
      return window.setTimeout(function() {
        lastTime = Date.now();
        callback(performance.now());
      }, delay);
    };
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      return clearTimeout(id);
    };
  }
  if (!Math.sign) {
    Math.sign = function mathSign(x2) {
      x2 = Number(x2);
      if (x2 === 0 || isNaN(x2)) {
        return x2;
      }
      return x2 > 0 ? 1 : -1;
    };
  }
  if (!Number.isInteger) {
    Number.isInteger = function numberIsInteger(value) {
      return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
    };
  }
  if (!window.ArrayBuffer) {
    window.ArrayBuffer = Array;
  }
  if (!window.Float32Array) {
    window.Float32Array = Array;
  }
  if (!window.Uint32Array) {
    window.Uint32Array = Array;
  }
  if (!window.Uint16Array) {
    window.Uint16Array = Array;
  }
  if (!window.Uint8Array) {
    window.Uint8Array = Array;
  }
  if (!window.Int32Array) {
    window.Int32Array = Array;
  }
});

// node_modules/ismobilejs/cjs/isMobile.js
var require_isMobile = __commonJS((exports2) => {
  "use strict";
  exports2.__esModule = true;
  var appleIphone = /iPhone/i;
  var appleIpod = /iPod/i;
  var appleTablet = /iPad/i;
  var appleUniversal = /\biOS-universal(?:.+)Mac\b/i;
  var androidPhone = /\bAndroid(?:.+)Mobile\b/i;
  var androidTablet = /Android/i;
  var amazonPhone = /(?:SD4930UR|\bSilk(?:.+)Mobile\b)/i;
  var amazonTablet = /Silk/i;
  var windowsPhone = /Windows Phone/i;
  var windowsTablet = /\bWindows(?:.+)ARM\b/i;
  var otherBlackBerry = /BlackBerry/i;
  var otherBlackBerry10 = /BB10/i;
  var otherOpera = /Opera Mini/i;
  var otherChrome = /\b(CriOS|Chrome)(?:.+)Mobile/i;
  var otherFirefox = /Mobile(?:.+)Firefox\b/i;
  var isAppleTabletOnIos13 = function(navigator2) {
    return typeof navigator2 !== "undefined" && navigator2.platform === "MacIntel" && typeof navigator2.maxTouchPoints === "number" && navigator2.maxTouchPoints > 1 && typeof MSStream === "undefined";
  };
  function createMatch(userAgent) {
    return function(regex) {
      return regex.test(userAgent);
    };
  }
  function isMobile(param) {
    var nav = {
      userAgent: "",
      platform: "",
      maxTouchPoints: 0
    };
    if (!param && typeof navigator !== "undefined") {
      nav = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        maxTouchPoints: navigator.maxTouchPoints || 0
      };
    } else if (typeof param === "string") {
      nav.userAgent = param;
    } else if (param && param.userAgent) {
      nav = {
        userAgent: param.userAgent,
        platform: param.platform,
        maxTouchPoints: param.maxTouchPoints || 0
      };
    }
    var userAgent = nav.userAgent;
    var tmp = userAgent.split("[FBAN");
    if (typeof tmp[1] !== "undefined") {
      userAgent = tmp[0];
    }
    tmp = userAgent.split("Twitter");
    if (typeof tmp[1] !== "undefined") {
      userAgent = tmp[0];
    }
    var match = createMatch(userAgent);
    var result = {
      apple: {
        phone: match(appleIphone) && !match(windowsPhone),
        ipod: match(appleIpod),
        tablet: !match(appleIphone) && (match(appleTablet) || isAppleTabletOnIos13(nav)) && !match(windowsPhone),
        universal: match(appleUniversal),
        device: (match(appleIphone) || match(appleIpod) || match(appleTablet) || match(appleUniversal) || isAppleTabletOnIos13(nav)) && !match(windowsPhone)
      },
      amazon: {
        phone: match(amazonPhone),
        tablet: !match(amazonPhone) && match(amazonTablet),
        device: match(amazonPhone) || match(amazonTablet)
      },
      android: {
        phone: !match(windowsPhone) && match(amazonPhone) || !match(windowsPhone) && match(androidPhone),
        tablet: !match(windowsPhone) && !match(amazonPhone) && !match(androidPhone) && (match(amazonTablet) || match(androidTablet)),
        device: !match(windowsPhone) && (match(amazonPhone) || match(amazonTablet) || match(androidPhone) || match(androidTablet)) || match(/\bokhttp\b/i)
      },
      windows: {
        phone: match(windowsPhone),
        tablet: match(windowsTablet),
        device: match(windowsPhone) || match(windowsTablet)
      },
      other: {
        blackberry: match(otherBlackBerry),
        blackberry10: match(otherBlackBerry10),
        opera: match(otherOpera),
        firefox: match(otherFirefox),
        chrome: match(otherChrome),
        device: match(otherBlackBerry) || match(otherBlackBerry10) || match(otherOpera) || match(otherFirefox) || match(otherChrome)
      },
      any: false,
      phone: false,
      tablet: false
    };
    result.any = result.apple.device || result.android.device || result.windows.device || result.other.device;
    result.phone = result.apple.phone || result.android.phone || result.windows.phone;
    result.tablet = result.apple.tablet || result.android.tablet || result.windows.tablet;
    return result;
  }
  exports2["default"] = isMobile;
});

// node_modules/ismobilejs/cjs/index.js
var require_cjs = __commonJS((exports2) => {
  "use strict";
  function __export(m) {
    for (var p in m)
      if (!exports2.hasOwnProperty(p))
        exports2[p] = m[p];
  }
  exports2.__esModule = true;
  __export(require_isMobile());
  var isMobile_1 = require_isMobile();
  exports2["default"] = isMobile_1["default"];
});

// node_modules/@pixi/settings/lib/settings.js
var require_settings = __commonJS((exports2) => {
  /*!
   * @pixi/settings - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/settings is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  function _interopDefault(ex) {
    return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
  }
  var isMobileCall = _interopDefault(require_cjs());
  var isMobile = isMobileCall(window.navigator);
  function maxRecommendedTextures(max) {
    var allowMax = true;
    if (isMobile.tablet || isMobile.phone) {
      if (isMobile.apple.device) {
        var match = navigator.userAgent.match(/OS (\d+)_(\d+)?/);
        if (match) {
          var majorVersion = parseInt(match[1], 10);
          if (majorVersion < 11) {
            allowMax = false;
          }
        }
      }
      if (isMobile.android.device) {
        var match = navigator.userAgent.match(/Android\s([0-9.]*)/);
        if (match) {
          var majorVersion = parseInt(match[1], 10);
          if (majorVersion < 7) {
            allowMax = false;
          }
        }
      }
    }
    return allowMax ? max : 4;
  }
  function canUploadSameBuffer() {
    return !isMobile.apple.device;
  }
  var settings = {
    MIPMAP_TEXTURES: 1,
    ANISOTROPIC_LEVEL: 0,
    RESOLUTION: 1,
    FILTER_RESOLUTION: 1,
    SPRITE_MAX_TEXTURES: maxRecommendedTextures(32),
    SPRITE_BATCH_SIZE: 4096,
    RENDER_OPTIONS: {
      view: null,
      antialias: false,
      autoDensity: false,
      transparent: false,
      backgroundColor: 0,
      clearBeforeRender: true,
      preserveDrawingBuffer: false,
      width: 800,
      height: 600,
      legacy: false
    },
    GC_MODE: 0,
    GC_MAX_IDLE: 60 * 60,
    GC_MAX_CHECK_COUNT: 60 * 10,
    WRAP_MODE: 33071,
    SCALE_MODE: 1,
    PRECISION_VERTEX: "highp",
    PRECISION_FRAGMENT: isMobile.apple.device ? "highp" : "mediump",
    CAN_UPLOAD_SAME_BUFFER: canUploadSameBuffer(),
    CREATE_IMAGE_BITMAP: false,
    ROUND_PIXELS: false
  };
  exports2.isMobile = isMobile;
  exports2.settings = settings;
});

// node_modules/eventemitter3/index.js
var require_eventemitter3 = __commonJS((exports2, module2) => {
  "use strict";
  var has = Object.prototype.hasOwnProperty;
  var prefix = "~";
  function Events() {
  }
  if (Object.create) {
    Events.prototype = Object.create(null);
    if (!new Events().__proto__)
      prefix = false;
  }
  function EE(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
  }
  function addListener(emitter, event, fn, context, once) {
    if (typeof fn !== "function") {
      throw new TypeError("The listener must be a function");
    }
    var listener = new EE(fn, context || emitter, once), evt = prefix ? prefix + event : event;
    if (!emitter._events[evt])
      emitter._events[evt] = listener, emitter._eventsCount++;
    else if (!emitter._events[evt].fn)
      emitter._events[evt].push(listener);
    else
      emitter._events[evt] = [emitter._events[evt], listener];
    return emitter;
  }
  function clearEvent(emitter, evt) {
    if (--emitter._eventsCount === 0)
      emitter._events = new Events();
    else
      delete emitter._events[evt];
  }
  function EventEmitter() {
    this._events = new Events();
    this._eventsCount = 0;
  }
  EventEmitter.prototype.eventNames = function eventNames() {
    var names = [], events, name;
    if (this._eventsCount === 0)
      return names;
    for (name in events = this._events) {
      if (has.call(events, name))
        names.push(prefix ? name.slice(1) : name);
    }
    if (Object.getOwnPropertySymbols) {
      return names.concat(Object.getOwnPropertySymbols(events));
    }
    return names;
  };
  EventEmitter.prototype.listeners = function listeners(event) {
    var evt = prefix ? prefix + event : event, handlers = this._events[evt];
    if (!handlers)
      return [];
    if (handlers.fn)
      return [handlers.fn];
    for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
      ee[i] = handlers[i].fn;
    }
    return ee;
  };
  EventEmitter.prototype.listenerCount = function listenerCount(event) {
    var evt = prefix ? prefix + event : event, listeners = this._events[evt];
    if (!listeners)
      return 0;
    if (listeners.fn)
      return 1;
    return listeners.length;
  };
  EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
    var evt = prefix ? prefix + event : event;
    if (!this._events[evt])
      return false;
    var listeners = this._events[evt], len = arguments.length, args, i;
    if (listeners.fn) {
      if (listeners.once)
        this.removeListener(event, listeners.fn, void 0, true);
      switch (len) {
        case 1:
          return listeners.fn.call(listeners.context), true;
        case 2:
          return listeners.fn.call(listeners.context, a1), true;
        case 3:
          return listeners.fn.call(listeners.context, a1, a2), true;
        case 4:
          return listeners.fn.call(listeners.context, a1, a2, a3), true;
        case 5:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
        case 6:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
      }
      for (i = 1, args = new Array(len - 1); i < len; i++) {
        args[i - 1] = arguments[i];
      }
      listeners.fn.apply(listeners.context, args);
    } else {
      var length = listeners.length, j;
      for (i = 0; i < length; i++) {
        if (listeners[i].once)
          this.removeListener(event, listeners[i].fn, void 0, true);
        switch (len) {
          case 1:
            listeners[i].fn.call(listeners[i].context);
            break;
          case 2:
            listeners[i].fn.call(listeners[i].context, a1);
            break;
          case 3:
            listeners[i].fn.call(listeners[i].context, a1, a2);
            break;
          case 4:
            listeners[i].fn.call(listeners[i].context, a1, a2, a3);
            break;
          default:
            if (!args)
              for (j = 1, args = new Array(len - 1); j < len; j++) {
                args[j - 1] = arguments[j];
              }
            listeners[i].fn.apply(listeners[i].context, args);
        }
      }
    }
    return true;
  };
  EventEmitter.prototype.on = function on(event, fn, context) {
    return addListener(this, event, fn, context, false);
  };
  EventEmitter.prototype.once = function once(event, fn, context) {
    return addListener(this, event, fn, context, true);
  };
  EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
    var evt = prefix ? prefix + event : event;
    if (!this._events[evt])
      return this;
    if (!fn) {
      clearEvent(this, evt);
      return this;
    }
    var listeners = this._events[evt];
    if (listeners.fn) {
      if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
        clearEvent(this, evt);
      }
    } else {
      for (var i = 0, events = [], length = listeners.length; i < length; i++) {
        if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
          events.push(listeners[i]);
        }
      }
      if (events.length)
        this._events[evt] = events.length === 1 ? events[0] : events;
      else
        clearEvent(this, evt);
    }
    return this;
  };
  EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
    var evt;
    if (event) {
      evt = prefix ? prefix + event : event;
      if (this._events[evt])
        clearEvent(this, evt);
    } else {
      this._events = new Events();
      this._eventsCount = 0;
    }
    return this;
  };
  EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
  EventEmitter.prototype.addListener = EventEmitter.prototype.on;
  EventEmitter.prefixed = prefix;
  EventEmitter.EventEmitter = EventEmitter;
  if (typeof module2 !== "undefined") {
    module2.exports = EventEmitter;
  }
});

// node_modules/earcut/src/earcut.js
var require_earcut = __commonJS((exports2, module2) => {
  "use strict";
  module2.exports = earcut;
  module2.exports.default = earcut;
  function earcut(data, holeIndices, dim) {
    dim = dim || 2;
    var hasHoles = holeIndices && holeIndices.length, outerLen = hasHoles ? holeIndices[0] * dim : data.length, outerNode = linkedList(data, 0, outerLen, dim, true), triangles = [];
    if (!outerNode || outerNode.next === outerNode.prev)
      return triangles;
    var minX, minY, maxX, maxY, x, y, invSize;
    if (hasHoles)
      outerNode = eliminateHoles(data, holeIndices, outerNode, dim);
    if (data.length > 80 * dim) {
      minX = maxX = data[0];
      minY = maxY = data[1];
      for (var i = dim; i < outerLen; i += dim) {
        x = data[i];
        y = data[i + 1];
        if (x < minX)
          minX = x;
        if (y < minY)
          minY = y;
        if (x > maxX)
          maxX = x;
        if (y > maxY)
          maxY = y;
      }
      invSize = Math.max(maxX - minX, maxY - minY);
      invSize = invSize !== 0 ? 1 / invSize : 0;
    }
    earcutLinked(outerNode, triangles, dim, minX, minY, invSize);
    return triangles;
  }
  function linkedList(data, start, end, dim, clockwise) {
    var i, last;
    if (clockwise === signedArea(data, start, end, dim) > 0) {
      for (i = start; i < end; i += dim)
        last = insertNode(i, data[i], data[i + 1], last);
    } else {
      for (i = end - dim; i >= start; i -= dim)
        last = insertNode(i, data[i], data[i + 1], last);
    }
    if (last && equals(last, last.next)) {
      removeNode(last);
      last = last.next;
    }
    return last;
  }
  function filterPoints(start, end) {
    if (!start)
      return start;
    if (!end)
      end = start;
    var p = start, again;
    do {
      again = false;
      if (!p.steiner && (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {
        removeNode(p);
        p = end = p.prev;
        if (p === p.next)
          break;
        again = true;
      } else {
        p = p.next;
      }
    } while (again || p !== end);
    return end;
  }
  function earcutLinked(ear, triangles, dim, minX, minY, invSize, pass) {
    if (!ear)
      return;
    if (!pass && invSize)
      indexCurve(ear, minX, minY, invSize);
    var stop = ear, prev, next;
    while (ear.prev !== ear.next) {
      prev = ear.prev;
      next = ear.next;
      if (invSize ? isEarHashed(ear, minX, minY, invSize) : isEar(ear)) {
        triangles.push(prev.i / dim);
        triangles.push(ear.i / dim);
        triangles.push(next.i / dim);
        removeNode(ear);
        ear = next.next;
        stop = next.next;
        continue;
      }
      ear = next;
      if (ear === stop) {
        if (!pass) {
          earcutLinked(filterPoints(ear), triangles, dim, minX, minY, invSize, 1);
        } else if (pass === 1) {
          ear = cureLocalIntersections(filterPoints(ear), triangles, dim);
          earcutLinked(ear, triangles, dim, minX, minY, invSize, 2);
        } else if (pass === 2) {
          splitEarcut(ear, triangles, dim, minX, minY, invSize);
        }
        break;
      }
    }
  }
  function isEar(ear) {
    var a = ear.prev, b = ear, c = ear.next;
    if (area(a, b, c) >= 0)
      return false;
    var p = ear.next.next;
    while (p !== ear.prev) {
      if (pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) && area(p.prev, p, p.next) >= 0)
        return false;
      p = p.next;
    }
    return true;
  }
  function isEarHashed(ear, minX, minY, invSize) {
    var a = ear.prev, b = ear, c = ear.next;
    if (area(a, b, c) >= 0)
      return false;
    var minTX = a.x < b.x ? a.x < c.x ? a.x : c.x : b.x < c.x ? b.x : c.x, minTY = a.y < b.y ? a.y < c.y ? a.y : c.y : b.y < c.y ? b.y : c.y, maxTX = a.x > b.x ? a.x > c.x ? a.x : c.x : b.x > c.x ? b.x : c.x, maxTY = a.y > b.y ? a.y > c.y ? a.y : c.y : b.y > c.y ? b.y : c.y;
    var minZ = zOrder(minTX, minTY, minX, minY, invSize), maxZ = zOrder(maxTX, maxTY, minX, minY, invSize);
    var p = ear.prevZ, n = ear.nextZ;
    while (p && p.z >= minZ && n && n.z <= maxZ) {
      if (p !== ear.prev && p !== ear.next && pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) && area(p.prev, p, p.next) >= 0)
        return false;
      p = p.prevZ;
      if (n !== ear.prev && n !== ear.next && pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) && area(n.prev, n, n.next) >= 0)
        return false;
      n = n.nextZ;
    }
    while (p && p.z >= minZ) {
      if (p !== ear.prev && p !== ear.next && pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) && area(p.prev, p, p.next) >= 0)
        return false;
      p = p.prevZ;
    }
    while (n && n.z <= maxZ) {
      if (n !== ear.prev && n !== ear.next && pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) && area(n.prev, n, n.next) >= 0)
        return false;
      n = n.nextZ;
    }
    return true;
  }
  function cureLocalIntersections(start, triangles, dim) {
    var p = start;
    do {
      var a = p.prev, b = p.next.next;
      if (!equals(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {
        triangles.push(a.i / dim);
        triangles.push(p.i / dim);
        triangles.push(b.i / dim);
        removeNode(p);
        removeNode(p.next);
        p = start = b;
      }
      p = p.next;
    } while (p !== start);
    return filterPoints(p);
  }
  function splitEarcut(start, triangles, dim, minX, minY, invSize) {
    var a = start;
    do {
      var b = a.next.next;
      while (b !== a.prev) {
        if (a.i !== b.i && isValidDiagonal(a, b)) {
          var c = splitPolygon(a, b);
          a = filterPoints(a, a.next);
          c = filterPoints(c, c.next);
          earcutLinked(a, triangles, dim, minX, minY, invSize);
          earcutLinked(c, triangles, dim, minX, minY, invSize);
          return;
        }
        b = b.next;
      }
      a = a.next;
    } while (a !== start);
  }
  function eliminateHoles(data, holeIndices, outerNode, dim) {
    var queue = [], i, len, start, end, list;
    for (i = 0, len = holeIndices.length; i < len; i++) {
      start = holeIndices[i] * dim;
      end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
      list = linkedList(data, start, end, dim, false);
      if (list === list.next)
        list.steiner = true;
      queue.push(getLeftmost(list));
    }
    queue.sort(compareX);
    for (i = 0; i < queue.length; i++) {
      eliminateHole(queue[i], outerNode);
      outerNode = filterPoints(outerNode, outerNode.next);
    }
    return outerNode;
  }
  function compareX(a, b) {
    return a.x - b.x;
  }
  function eliminateHole(hole, outerNode) {
    outerNode = findHoleBridge(hole, outerNode);
    if (outerNode) {
      var b = splitPolygon(outerNode, hole);
      filterPoints(outerNode, outerNode.next);
      filterPoints(b, b.next);
    }
  }
  function findHoleBridge(hole, outerNode) {
    var p = outerNode, hx = hole.x, hy = hole.y, qx = -Infinity, m;
    do {
      if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
        var x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);
        if (x <= hx && x > qx) {
          qx = x;
          if (x === hx) {
            if (hy === p.y)
              return p;
            if (hy === p.next.y)
              return p.next;
          }
          m = p.x < p.next.x ? p : p.next;
        }
      }
      p = p.next;
    } while (p !== outerNode);
    if (!m)
      return null;
    if (hx === qx)
      return m;
    var stop = m, mx = m.x, my = m.y, tanMin = Infinity, tan;
    p = m;
    do {
      if (hx >= p.x && p.x >= mx && hx !== p.x && pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {
        tan = Math.abs(hy - p.y) / (hx - p.x);
        if (locallyInside(p, hole) && (tan < tanMin || tan === tanMin && (p.x > m.x || p.x === m.x && sectorContainsSector(m, p)))) {
          m = p;
          tanMin = tan;
        }
      }
      p = p.next;
    } while (p !== stop);
    return m;
  }
  function sectorContainsSector(m, p) {
    return area(m.prev, m, p.prev) < 0 && area(p.next, m, m.next) < 0;
  }
  function indexCurve(start, minX, minY, invSize) {
    var p = start;
    do {
      if (p.z === null)
        p.z = zOrder(p.x, p.y, minX, minY, invSize);
      p.prevZ = p.prev;
      p.nextZ = p.next;
      p = p.next;
    } while (p !== start);
    p.prevZ.nextZ = null;
    p.prevZ = null;
    sortLinked(p);
  }
  function sortLinked(list) {
    var i, p, q, e, tail, numMerges, pSize, qSize, inSize = 1;
    do {
      p = list;
      list = null;
      tail = null;
      numMerges = 0;
      while (p) {
        numMerges++;
        q = p;
        pSize = 0;
        for (i = 0; i < inSize; i++) {
          pSize++;
          q = q.nextZ;
          if (!q)
            break;
        }
        qSize = inSize;
        while (pSize > 0 || qSize > 0 && q) {
          if (pSize !== 0 && (qSize === 0 || !q || p.z <= q.z)) {
            e = p;
            p = p.nextZ;
            pSize--;
          } else {
            e = q;
            q = q.nextZ;
            qSize--;
          }
          if (tail)
            tail.nextZ = e;
          else
            list = e;
          e.prevZ = tail;
          tail = e;
        }
        p = q;
      }
      tail.nextZ = null;
      inSize *= 2;
    } while (numMerges > 1);
    return list;
  }
  function zOrder(x, y, minX, minY, invSize) {
    x = 32767 * (x - minX) * invSize;
    y = 32767 * (y - minY) * invSize;
    x = (x | x << 8) & 16711935;
    x = (x | x << 4) & 252645135;
    x = (x | x << 2) & 858993459;
    x = (x | x << 1) & 1431655765;
    y = (y | y << 8) & 16711935;
    y = (y | y << 4) & 252645135;
    y = (y | y << 2) & 858993459;
    y = (y | y << 1) & 1431655765;
    return x | y << 1;
  }
  function getLeftmost(start) {
    var p = start, leftmost = start;
    do {
      if (p.x < leftmost.x || p.x === leftmost.x && p.y < leftmost.y)
        leftmost = p;
      p = p.next;
    } while (p !== start);
    return leftmost;
  }
  function pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
    return (cx - px) * (ay - py) - (ax - px) * (cy - py) >= 0 && (ax - px) * (by - py) - (bx - px) * (ay - py) >= 0 && (bx - px) * (cy - py) - (cx - px) * (by - py) >= 0;
  }
  function isValidDiagonal(a, b) {
    return a.next.i !== b.i && a.prev.i !== b.i && !intersectsPolygon(a, b) && (locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b) && (area(a.prev, a, b.prev) || area(a, b.prev, b)) || equals(a, b) && area(a.prev, a, a.next) > 0 && area(b.prev, b, b.next) > 0);
  }
  function area(p, q, r) {
    return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  }
  function equals(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
  }
  function intersects(p1, q1, p2, q2) {
    var o1 = sign(area(p1, q1, p2));
    var o2 = sign(area(p1, q1, q2));
    var o3 = sign(area(p2, q2, p1));
    var o4 = sign(area(p2, q2, q1));
    if (o1 !== o2 && o3 !== o4)
      return true;
    if (o1 === 0 && onSegment(p1, p2, q1))
      return true;
    if (o2 === 0 && onSegment(p1, q2, q1))
      return true;
    if (o3 === 0 && onSegment(p2, p1, q2))
      return true;
    if (o4 === 0 && onSegment(p2, q1, q2))
      return true;
    return false;
  }
  function onSegment(p, q, r) {
    return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
  }
  function sign(num) {
    return num > 0 ? 1 : num < 0 ? -1 : 0;
  }
  function intersectsPolygon(a, b) {
    var p = a;
    do {
      if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i && intersects(p, p.next, a, b))
        return true;
      p = p.next;
    } while (p !== a);
    return false;
  }
  function locallyInside(a, b) {
    return area(a.prev, a, a.next) < 0 ? area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0 : area(a, b, a.prev) < 0 || area(a, a.next, b) < 0;
  }
  function middleInside(a, b) {
    var p = a, inside = false, px = (a.x + b.x) / 2, py = (a.y + b.y) / 2;
    do {
      if (p.y > py !== p.next.y > py && p.next.y !== p.y && px < (p.next.x - p.x) * (py - p.y) / (p.next.y - p.y) + p.x)
        inside = !inside;
      p = p.next;
    } while (p !== a);
    return inside;
  }
  function splitPolygon(a, b) {
    var a2 = new Node(a.i, a.x, a.y), b2 = new Node(b.i, b.x, b.y), an = a.next, bp = b.prev;
    a.next = b;
    b.prev = a;
    a2.next = an;
    an.prev = a2;
    b2.next = a2;
    a2.prev = b2;
    bp.next = b2;
    b2.prev = bp;
    return b2;
  }
  function insertNode(i, x, y, last) {
    var p = new Node(i, x, y);
    if (!last) {
      p.prev = p;
      p.next = p;
    } else {
      p.next = last.next;
      p.prev = last;
      last.next.prev = p;
      last.next = p;
    }
    return p;
  }
  function removeNode(p) {
    p.next.prev = p.prev;
    p.prev.next = p.next;
    if (p.prevZ)
      p.prevZ.nextZ = p.nextZ;
    if (p.nextZ)
      p.nextZ.prevZ = p.prevZ;
  }
  function Node(i, x, y) {
    this.i = i;
    this.x = x;
    this.y = y;
    this.prev = null;
    this.next = null;
    this.z = null;
    this.prevZ = null;
    this.nextZ = null;
    this.steiner = false;
  }
  earcut.deviation = function(data, holeIndices, dim, triangles) {
    var hasHoles = holeIndices && holeIndices.length;
    var outerLen = hasHoles ? holeIndices[0] * dim : data.length;
    var polygonArea = Math.abs(signedArea(data, 0, outerLen, dim));
    if (hasHoles) {
      for (var i = 0, len = holeIndices.length; i < len; i++) {
        var start = holeIndices[i] * dim;
        var end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
        polygonArea -= Math.abs(signedArea(data, start, end, dim));
      }
    }
    var trianglesArea = 0;
    for (i = 0; i < triangles.length; i += 3) {
      var a = triangles[i] * dim;
      var b = triangles[i + 1] * dim;
      var c = triangles[i + 2] * dim;
      trianglesArea += Math.abs((data[a] - data[c]) * (data[b + 1] - data[a + 1]) - (data[a] - data[b]) * (data[c + 1] - data[a + 1]));
    }
    return polygonArea === 0 && trianglesArea === 0 ? 0 : Math.abs((trianglesArea - polygonArea) / polygonArea);
  };
  function signedArea(data, start, end, dim) {
    var sum = 0;
    for (var i = start, j = end - dim; i < end; i += dim) {
      sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
      j = i;
    }
    return sum;
  }
  earcut.flatten = function(data) {
    var dim = data[0][0].length, result = {vertices: [], holes: [], dimensions: dim}, holeIndex = 0;
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data[i].length; j++) {
        for (var d = 0; d < dim; d++)
          result.vertices.push(data[i][j][d]);
      }
      if (i > 0) {
        holeIndex += data[i - 1].length;
        result.holes.push(holeIndex);
      }
    }
    return result;
  };
});

// node_modules/@pixi/constants/lib/constants.js
var require_constants = __commonJS((exports2) => {
  /*!
   * @pixi/constants - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/constants is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  (function(ENV) {
    ENV[ENV["WEBGL_LEGACY"] = 0] = "WEBGL_LEGACY";
    ENV[ENV["WEBGL"] = 1] = "WEBGL";
    ENV[ENV["WEBGL2"] = 2] = "WEBGL2";
  })(exports2.ENV || (exports2.ENV = {}));
  (function(RENDERER_TYPE) {
    RENDERER_TYPE[RENDERER_TYPE["UNKNOWN"] = 0] = "UNKNOWN";
    RENDERER_TYPE[RENDERER_TYPE["WEBGL"] = 1] = "WEBGL";
    RENDERER_TYPE[RENDERER_TYPE["CANVAS"] = 2] = "CANVAS";
  })(exports2.RENDERER_TYPE || (exports2.RENDERER_TYPE = {}));
  (function(BUFFER_BITS) {
    BUFFER_BITS[BUFFER_BITS["COLOR"] = 16384] = "COLOR";
    BUFFER_BITS[BUFFER_BITS["DEPTH"] = 256] = "DEPTH";
    BUFFER_BITS[BUFFER_BITS["STENCIL"] = 1024] = "STENCIL";
  })(exports2.BUFFER_BITS || (exports2.BUFFER_BITS = {}));
  (function(BLEND_MODES) {
    BLEND_MODES[BLEND_MODES["NORMAL"] = 0] = "NORMAL";
    BLEND_MODES[BLEND_MODES["ADD"] = 1] = "ADD";
    BLEND_MODES[BLEND_MODES["MULTIPLY"] = 2] = "MULTIPLY";
    BLEND_MODES[BLEND_MODES["SCREEN"] = 3] = "SCREEN";
    BLEND_MODES[BLEND_MODES["OVERLAY"] = 4] = "OVERLAY";
    BLEND_MODES[BLEND_MODES["DARKEN"] = 5] = "DARKEN";
    BLEND_MODES[BLEND_MODES["LIGHTEN"] = 6] = "LIGHTEN";
    BLEND_MODES[BLEND_MODES["COLOR_DODGE"] = 7] = "COLOR_DODGE";
    BLEND_MODES[BLEND_MODES["COLOR_BURN"] = 8] = "COLOR_BURN";
    BLEND_MODES[BLEND_MODES["HARD_LIGHT"] = 9] = "HARD_LIGHT";
    BLEND_MODES[BLEND_MODES["SOFT_LIGHT"] = 10] = "SOFT_LIGHT";
    BLEND_MODES[BLEND_MODES["DIFFERENCE"] = 11] = "DIFFERENCE";
    BLEND_MODES[BLEND_MODES["EXCLUSION"] = 12] = "EXCLUSION";
    BLEND_MODES[BLEND_MODES["HUE"] = 13] = "HUE";
    BLEND_MODES[BLEND_MODES["SATURATION"] = 14] = "SATURATION";
    BLEND_MODES[BLEND_MODES["COLOR"] = 15] = "COLOR";
    BLEND_MODES[BLEND_MODES["LUMINOSITY"] = 16] = "LUMINOSITY";
    BLEND_MODES[BLEND_MODES["NORMAL_NPM"] = 17] = "NORMAL_NPM";
    BLEND_MODES[BLEND_MODES["ADD_NPM"] = 18] = "ADD_NPM";
    BLEND_MODES[BLEND_MODES["SCREEN_NPM"] = 19] = "SCREEN_NPM";
    BLEND_MODES[BLEND_MODES["NONE"] = 20] = "NONE";
    BLEND_MODES[BLEND_MODES["SRC_OVER"] = 0] = "SRC_OVER";
    BLEND_MODES[BLEND_MODES["SRC_IN"] = 21] = "SRC_IN";
    BLEND_MODES[BLEND_MODES["SRC_OUT"] = 22] = "SRC_OUT";
    BLEND_MODES[BLEND_MODES["SRC_ATOP"] = 23] = "SRC_ATOP";
    BLEND_MODES[BLEND_MODES["DST_OVER"] = 24] = "DST_OVER";
    BLEND_MODES[BLEND_MODES["DST_IN"] = 25] = "DST_IN";
    BLEND_MODES[BLEND_MODES["DST_OUT"] = 26] = "DST_OUT";
    BLEND_MODES[BLEND_MODES["DST_ATOP"] = 27] = "DST_ATOP";
    BLEND_MODES[BLEND_MODES["ERASE"] = 26] = "ERASE";
    BLEND_MODES[BLEND_MODES["SUBTRACT"] = 28] = "SUBTRACT";
    BLEND_MODES[BLEND_MODES["XOR"] = 29] = "XOR";
  })(exports2.BLEND_MODES || (exports2.BLEND_MODES = {}));
  (function(DRAW_MODES) {
    DRAW_MODES[DRAW_MODES["POINTS"] = 0] = "POINTS";
    DRAW_MODES[DRAW_MODES["LINES"] = 1] = "LINES";
    DRAW_MODES[DRAW_MODES["LINE_LOOP"] = 2] = "LINE_LOOP";
    DRAW_MODES[DRAW_MODES["LINE_STRIP"] = 3] = "LINE_STRIP";
    DRAW_MODES[DRAW_MODES["TRIANGLES"] = 4] = "TRIANGLES";
    DRAW_MODES[DRAW_MODES["TRIANGLE_STRIP"] = 5] = "TRIANGLE_STRIP";
    DRAW_MODES[DRAW_MODES["TRIANGLE_FAN"] = 6] = "TRIANGLE_FAN";
  })(exports2.DRAW_MODES || (exports2.DRAW_MODES = {}));
  (function(FORMATS) {
    FORMATS[FORMATS["RGBA"] = 6408] = "RGBA";
    FORMATS[FORMATS["RGB"] = 6407] = "RGB";
    FORMATS[FORMATS["ALPHA"] = 6406] = "ALPHA";
    FORMATS[FORMATS["LUMINANCE"] = 6409] = "LUMINANCE";
    FORMATS[FORMATS["LUMINANCE_ALPHA"] = 6410] = "LUMINANCE_ALPHA";
    FORMATS[FORMATS["DEPTH_COMPONENT"] = 6402] = "DEPTH_COMPONENT";
    FORMATS[FORMATS["DEPTH_STENCIL"] = 34041] = "DEPTH_STENCIL";
  })(exports2.FORMATS || (exports2.FORMATS = {}));
  (function(TARGETS) {
    TARGETS[TARGETS["TEXTURE_2D"] = 3553] = "TEXTURE_2D";
    TARGETS[TARGETS["TEXTURE_CUBE_MAP"] = 34067] = "TEXTURE_CUBE_MAP";
    TARGETS[TARGETS["TEXTURE_2D_ARRAY"] = 35866] = "TEXTURE_2D_ARRAY";
    TARGETS[TARGETS["TEXTURE_CUBE_MAP_POSITIVE_X"] = 34069] = "TEXTURE_CUBE_MAP_POSITIVE_X";
    TARGETS[TARGETS["TEXTURE_CUBE_MAP_NEGATIVE_X"] = 34070] = "TEXTURE_CUBE_MAP_NEGATIVE_X";
    TARGETS[TARGETS["TEXTURE_CUBE_MAP_POSITIVE_Y"] = 34071] = "TEXTURE_CUBE_MAP_POSITIVE_Y";
    TARGETS[TARGETS["TEXTURE_CUBE_MAP_NEGATIVE_Y"] = 34072] = "TEXTURE_CUBE_MAP_NEGATIVE_Y";
    TARGETS[TARGETS["TEXTURE_CUBE_MAP_POSITIVE_Z"] = 34073] = "TEXTURE_CUBE_MAP_POSITIVE_Z";
    TARGETS[TARGETS["TEXTURE_CUBE_MAP_NEGATIVE_Z"] = 34074] = "TEXTURE_CUBE_MAP_NEGATIVE_Z";
  })(exports2.TARGETS || (exports2.TARGETS = {}));
  (function(TYPES) {
    TYPES[TYPES["UNSIGNED_BYTE"] = 5121] = "UNSIGNED_BYTE";
    TYPES[TYPES["UNSIGNED_SHORT"] = 5123] = "UNSIGNED_SHORT";
    TYPES[TYPES["UNSIGNED_SHORT_5_6_5"] = 33635] = "UNSIGNED_SHORT_5_6_5";
    TYPES[TYPES["UNSIGNED_SHORT_4_4_4_4"] = 32819] = "UNSIGNED_SHORT_4_4_4_4";
    TYPES[TYPES["UNSIGNED_SHORT_5_5_5_1"] = 32820] = "UNSIGNED_SHORT_5_5_5_1";
    TYPES[TYPES["FLOAT"] = 5126] = "FLOAT";
    TYPES[TYPES["HALF_FLOAT"] = 36193] = "HALF_FLOAT";
  })(exports2.TYPES || (exports2.TYPES = {}));
  (function(SCALE_MODES) {
    SCALE_MODES[SCALE_MODES["NEAREST"] = 0] = "NEAREST";
    SCALE_MODES[SCALE_MODES["LINEAR"] = 1] = "LINEAR";
  })(exports2.SCALE_MODES || (exports2.SCALE_MODES = {}));
  (function(WRAP_MODES) {
    WRAP_MODES[WRAP_MODES["CLAMP"] = 33071] = "CLAMP";
    WRAP_MODES[WRAP_MODES["REPEAT"] = 10497] = "REPEAT";
    WRAP_MODES[WRAP_MODES["MIRRORED_REPEAT"] = 33648] = "MIRRORED_REPEAT";
  })(exports2.WRAP_MODES || (exports2.WRAP_MODES = {}));
  (function(MIPMAP_MODES) {
    MIPMAP_MODES[MIPMAP_MODES["OFF"] = 0] = "OFF";
    MIPMAP_MODES[MIPMAP_MODES["POW2"] = 1] = "POW2";
    MIPMAP_MODES[MIPMAP_MODES["ON"] = 2] = "ON";
  })(exports2.MIPMAP_MODES || (exports2.MIPMAP_MODES = {}));
  (function(ALPHA_MODES) {
    ALPHA_MODES[ALPHA_MODES["NPM"] = 0] = "NPM";
    ALPHA_MODES[ALPHA_MODES["UNPACK"] = 1] = "UNPACK";
    ALPHA_MODES[ALPHA_MODES["PMA"] = 2] = "PMA";
    ALPHA_MODES[ALPHA_MODES["NO_PREMULTIPLIED_ALPHA"] = 0] = "NO_PREMULTIPLIED_ALPHA";
    ALPHA_MODES[ALPHA_MODES["PREMULTIPLY_ON_UPLOAD"] = 1] = "PREMULTIPLY_ON_UPLOAD";
    ALPHA_MODES[ALPHA_MODES["PREMULTIPLY_ALPHA"] = 2] = "PREMULTIPLY_ALPHA";
  })(exports2.ALPHA_MODES || (exports2.ALPHA_MODES = {}));
  (function(CLEAR_MODES) {
    CLEAR_MODES[CLEAR_MODES["NO"] = 0] = "NO";
    CLEAR_MODES[CLEAR_MODES["YES"] = 1] = "YES";
    CLEAR_MODES[CLEAR_MODES["AUTO"] = 2] = "AUTO";
    CLEAR_MODES[CLEAR_MODES["BLEND"] = 0] = "BLEND";
    CLEAR_MODES[CLEAR_MODES["CLEAR"] = 1] = "CLEAR";
    CLEAR_MODES[CLEAR_MODES["BLIT"] = 2] = "BLIT";
  })(exports2.CLEAR_MODES || (exports2.CLEAR_MODES = {}));
  (function(GC_MODES) {
    GC_MODES[GC_MODES["AUTO"] = 0] = "AUTO";
    GC_MODES[GC_MODES["MANUAL"] = 1] = "MANUAL";
  })(exports2.GC_MODES || (exports2.GC_MODES = {}));
  (function(PRECISION) {
    PRECISION["LOW"] = "lowp";
    PRECISION["MEDIUM"] = "mediump";
    PRECISION["HIGH"] = "highp";
  })(exports2.PRECISION || (exports2.PRECISION = {}));
  (function(MASK_TYPES) {
    MASK_TYPES[MASK_TYPES["NONE"] = 0] = "NONE";
    MASK_TYPES[MASK_TYPES["SCISSOR"] = 1] = "SCISSOR";
    MASK_TYPES[MASK_TYPES["STENCIL"] = 2] = "STENCIL";
    MASK_TYPES[MASK_TYPES["SPRITE"] = 3] = "SPRITE";
  })(exports2.MASK_TYPES || (exports2.MASK_TYPES = {}));
  (function(MSAA_QUALITY) {
    MSAA_QUALITY[MSAA_QUALITY["NONE"] = 0] = "NONE";
    MSAA_QUALITY[MSAA_QUALITY["LOW"] = 2] = "LOW";
    MSAA_QUALITY[MSAA_QUALITY["MEDIUM"] = 4] = "MEDIUM";
    MSAA_QUALITY[MSAA_QUALITY["HIGH"] = 8] = "HIGH";
  })(exports2.MSAA_QUALITY || (exports2.MSAA_QUALITY = {}));
});

// node_modules/@pixi/utils/lib/utils.js
var require_utils = __commonJS((exports2) => {
  /*!
   * @pixi/utils - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/utils is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  function _interopDefault(ex) {
    return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
  }
  var settings = require_settings();
  var eventemitter3 = _interopDefault(require_eventemitter3());
  var earcut = _interopDefault(require_earcut());
  var _url = require("url");
  var _url__default = _interopDefault(_url);
  var constants = require_constants();
  settings.settings.RETINA_PREFIX = /@([0-9\.]+)x/;
  settings.settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT = true;
  var saidHello = false;
  var VERSION = "5.3.7";
  function skipHello() {
    saidHello = true;
  }
  function sayHello(type) {
    var _a;
    if (saidHello) {
      return;
    }
    if (navigator.userAgent.toLowerCase().indexOf("chrome") > -1) {
      var args = [
        "\n %c %c %c PixiJS " + VERSION + " - \u2730 " + type + " \u2730  %c  %c  http://www.pixijs.com/  %c %c \u2665%c\u2665%c\u2665 \n\n",
        "background: #ff66a5; padding:5px 0;",
        "background: #ff66a5; padding:5px 0;",
        "color: #ff66a5; background: #030307; padding:5px 0;",
        "background: #ff66a5; padding:5px 0;",
        "background: #ffc3dc; padding:5px 0;",
        "background: #ff66a5; padding:5px 0;",
        "color: #ff2424; background: #fff; padding:5px 0;",
        "color: #ff2424; background: #fff; padding:5px 0;",
        "color: #ff2424; background: #fff; padding:5px 0;"
      ];
      (_a = window.console).log.apply(_a, args);
    } else if (window.console) {
      window.console.log("PixiJS " + VERSION + " - " + type + " - http://www.pixijs.com/");
    }
    saidHello = true;
  }
  var supported;
  function isWebGLSupported() {
    if (typeof supported === "undefined") {
      supported = function supported2() {
        var contextOptions = {
          stencil: true,
          failIfMajorPerformanceCaveat: settings.settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT
        };
        try {
          if (!window.WebGLRenderingContext) {
            return false;
          }
          var canvas = document.createElement("canvas");
          var gl = canvas.getContext("webgl", contextOptions) || canvas.getContext("experimental-webgl", contextOptions);
          var success = !!(gl && gl.getContextAttributes().stencil);
          if (gl) {
            var loseContext = gl.getExtension("WEBGL_lose_context");
            if (loseContext) {
              loseContext.loseContext();
            }
          }
          gl = null;
          return success;
        } catch (e) {
          return false;
        }
      }();
    }
    return supported;
  }
  function hex2rgb(hex, out) {
    if (out === void 0) {
      out = [];
    }
    out[0] = (hex >> 16 & 255) / 255;
    out[1] = (hex >> 8 & 255) / 255;
    out[2] = (hex & 255) / 255;
    return out;
  }
  function hex2string(hex) {
    var hexString = hex.toString(16);
    hexString = "000000".substr(0, 6 - hexString.length) + hexString;
    return "#" + hexString;
  }
  function string2hex(string) {
    if (typeof string === "string" && string[0] === "#") {
      string = string.substr(1);
    }
    return parseInt(string, 16);
  }
  function rgb2hex(rgb) {
    return (rgb[0] * 255 << 16) + (rgb[1] * 255 << 8) + (rgb[2] * 255 | 0);
  }
  function mapPremultipliedBlendModes() {
    var pm = [];
    var npm = [];
    for (var i = 0; i < 32; i++) {
      pm[i] = i;
      npm[i] = i;
    }
    pm[constants.BLEND_MODES.NORMAL_NPM] = constants.BLEND_MODES.NORMAL;
    pm[constants.BLEND_MODES.ADD_NPM] = constants.BLEND_MODES.ADD;
    pm[constants.BLEND_MODES.SCREEN_NPM] = constants.BLEND_MODES.SCREEN;
    npm[constants.BLEND_MODES.NORMAL] = constants.BLEND_MODES.NORMAL_NPM;
    npm[constants.BLEND_MODES.ADD] = constants.BLEND_MODES.ADD_NPM;
    npm[constants.BLEND_MODES.SCREEN] = constants.BLEND_MODES.SCREEN_NPM;
    var array = [];
    array.push(npm);
    array.push(pm);
    return array;
  }
  var premultiplyBlendMode = mapPremultipliedBlendModes();
  function correctBlendMode(blendMode, premultiplied) {
    return premultiplyBlendMode[premultiplied ? 1 : 0][blendMode];
  }
  function premultiplyRgba(rgb, alpha, out, premultiply) {
    out = out || new Float32Array(4);
    if (premultiply || premultiply === void 0) {
      out[0] = rgb[0] * alpha;
      out[1] = rgb[1] * alpha;
      out[2] = rgb[2] * alpha;
    } else {
      out[0] = rgb[0];
      out[1] = rgb[1];
      out[2] = rgb[2];
    }
    out[3] = alpha;
    return out;
  }
  function premultiplyTint(tint, alpha) {
    if (alpha === 1) {
      return (alpha * 255 << 24) + tint;
    }
    if (alpha === 0) {
      return 0;
    }
    var R = tint >> 16 & 255;
    var G = tint >> 8 & 255;
    var B = tint & 255;
    R = R * alpha + 0.5 | 0;
    G = G * alpha + 0.5 | 0;
    B = B * alpha + 0.5 | 0;
    return (alpha * 255 << 24) + (R << 16) + (G << 8) + B;
  }
  function premultiplyTintToRgba(tint, alpha, out, premultiply) {
    out = out || new Float32Array(4);
    out[0] = (tint >> 16 & 255) / 255;
    out[1] = (tint >> 8 & 255) / 255;
    out[2] = (tint & 255) / 255;
    if (premultiply || premultiply === void 0) {
      out[0] *= alpha;
      out[1] *= alpha;
      out[2] *= alpha;
    }
    out[3] = alpha;
    return out;
  }
  function createIndicesForQuads(size, outBuffer) {
    if (outBuffer === void 0) {
      outBuffer = null;
    }
    var totalIndices = size * 6;
    outBuffer = outBuffer || new Uint16Array(totalIndices);
    if (outBuffer.length !== totalIndices) {
      throw new Error("Out buffer length is incorrect, got " + outBuffer.length + " and expected " + totalIndices);
    }
    for (var i = 0, j = 0; i < totalIndices; i += 6, j += 4) {
      outBuffer[i + 0] = j + 0;
      outBuffer[i + 1] = j + 1;
      outBuffer[i + 2] = j + 2;
      outBuffer[i + 3] = j + 0;
      outBuffer[i + 4] = j + 2;
      outBuffer[i + 5] = j + 3;
    }
    return outBuffer;
  }
  function getBufferType(array) {
    if (array.BYTES_PER_ELEMENT === 4) {
      if (array instanceof Float32Array) {
        return "Float32Array";
      } else if (array instanceof Uint32Array) {
        return "Uint32Array";
      }
      return "Int32Array";
    } else if (array.BYTES_PER_ELEMENT === 2) {
      if (array instanceof Uint16Array) {
        return "Uint16Array";
      }
    } else if (array.BYTES_PER_ELEMENT === 1) {
      if (array instanceof Uint8Array) {
        return "Uint8Array";
      }
    }
    return null;
  }
  var map = {Float32Array, Uint32Array, Int32Array, Uint8Array};
  function interleaveTypedArrays(arrays, sizes) {
    var outSize = 0;
    var stride = 0;
    var views = {};
    for (var i = 0; i < arrays.length; i++) {
      stride += sizes[i];
      outSize += arrays[i].length;
    }
    var buffer = new ArrayBuffer(outSize * 4);
    var out = null;
    var littleOffset = 0;
    for (var i = 0; i < arrays.length; i++) {
      var size = sizes[i];
      var array = arrays[i];
      var type = getBufferType(array);
      if (!views[type]) {
        views[type] = new map[type](buffer);
      }
      out = views[type];
      for (var j = 0; j < array.length; j++) {
        var indexStart = (j / size | 0) * stride + littleOffset;
        var index = j % size;
        out[indexStart + index] = array[j];
      }
      littleOffset += size;
    }
    return new Float32Array(buffer);
  }
  function nextPow2(v) {
    v += v === 0 ? 1 : 0;
    --v;
    v |= v >>> 1;
    v |= v >>> 2;
    v |= v >>> 4;
    v |= v >>> 8;
    v |= v >>> 16;
    return v + 1;
  }
  function isPow2(v) {
    return !(v & v - 1) && !!v;
  }
  function log2(v) {
    var r = (v > 65535 ? 1 : 0) << 4;
    v >>>= r;
    var shift = (v > 255 ? 1 : 0) << 3;
    v >>>= shift;
    r |= shift;
    shift = (v > 15 ? 1 : 0) << 2;
    v >>>= shift;
    r |= shift;
    shift = (v > 3 ? 1 : 0) << 1;
    v >>>= shift;
    r |= shift;
    return r | v >> 1;
  }
  function removeItems(arr, startIdx, removeCount) {
    var length = arr.length;
    var i;
    if (startIdx >= length || removeCount === 0) {
      return;
    }
    removeCount = startIdx + removeCount > length ? length - startIdx : removeCount;
    var len = length - removeCount;
    for (i = startIdx; i < len; ++i) {
      arr[i] = arr[i + removeCount];
    }
    arr.length = len;
  }
  function sign(n) {
    if (n === 0) {
      return 0;
    }
    return n < 0 ? -1 : 1;
  }
  var nextUid = 0;
  function uid() {
    return ++nextUid;
  }
  var warnings = {};
  function deprecation(version, message, ignoreDepth) {
    if (ignoreDepth === void 0) {
      ignoreDepth = 3;
    }
    if (warnings[message]) {
      return;
    }
    var stack = new Error().stack;
    if (typeof stack === "undefined") {
      console.warn("PixiJS Deprecation Warning: ", message + "\nDeprecated since v" + version);
    } else {
      stack = stack.split("\n").splice(ignoreDepth).join("\n");
      if (console.groupCollapsed) {
        console.groupCollapsed("%cPixiJS Deprecation Warning: %c%s", "color:#614108;background:#fffbe6", "font-weight:normal;color:#614108;background:#fffbe6", message + "\nDeprecated since v" + version);
        console.warn(stack);
        console.groupEnd();
      } else {
        console.warn("PixiJS Deprecation Warning: ", message + "\nDeprecated since v" + version);
        console.warn(stack);
      }
    }
    warnings[message] = true;
  }
  var ProgramCache = {};
  var TextureCache = Object.create(null);
  var BaseTextureCache = Object.create(null);
  function destroyTextureCache() {
    var key;
    for (key in TextureCache) {
      TextureCache[key].destroy();
    }
    for (key in BaseTextureCache) {
      BaseTextureCache[key].destroy();
    }
  }
  function clearTextureCache() {
    var key;
    for (key in TextureCache) {
      delete TextureCache[key];
    }
    for (key in BaseTextureCache) {
      delete BaseTextureCache[key];
    }
  }
  var CanvasRenderTarget = function() {
    function CanvasRenderTarget2(width, height, resolution) {
      this.canvas = document.createElement("canvas");
      this.context = this.canvas.getContext("2d");
      this.resolution = resolution || settings.settings.RESOLUTION;
      this.resize(width, height);
    }
    CanvasRenderTarget2.prototype.clear = function() {
      this.context.setTransform(1, 0, 0, 1, 0, 0);
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    CanvasRenderTarget2.prototype.resize = function(width, height) {
      this.canvas.width = width * this.resolution;
      this.canvas.height = height * this.resolution;
    };
    CanvasRenderTarget2.prototype.destroy = function() {
      this.context = null;
      this.canvas = null;
    };
    Object.defineProperty(CanvasRenderTarget2.prototype, "width", {
      get: function() {
        return this.canvas.width;
      },
      set: function(val) {
        this.canvas.width = val;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(CanvasRenderTarget2.prototype, "height", {
      get: function() {
        return this.canvas.height;
      },
      set: function(val) {
        this.canvas.height = val;
      },
      enumerable: false,
      configurable: true
    });
    return CanvasRenderTarget2;
  }();
  function trimCanvas(canvas) {
    var width = canvas.width;
    var height = canvas.height;
    var context = canvas.getContext("2d");
    var imageData = context.getImageData(0, 0, width, height);
    var pixels = imageData.data;
    var len = pixels.length;
    var bound = {
      top: null,
      left: null,
      right: null,
      bottom: null
    };
    var data = null;
    var i;
    var x;
    var y;
    for (i = 0; i < len; i += 4) {
      if (pixels[i + 3] !== 0) {
        x = i / 4 % width;
        y = ~~(i / 4 / width);
        if (bound.top === null) {
          bound.top = y;
        }
        if (bound.left === null) {
          bound.left = x;
        } else if (x < bound.left) {
          bound.left = x;
        }
        if (bound.right === null) {
          bound.right = x + 1;
        } else if (bound.right < x) {
          bound.right = x + 1;
        }
        if (bound.bottom === null) {
          bound.bottom = y;
        } else if (bound.bottom < y) {
          bound.bottom = y;
        }
      }
    }
    if (bound.top !== null) {
      width = bound.right - bound.left;
      height = bound.bottom - bound.top + 1;
      data = context.getImageData(bound.left, bound.top, width, height);
    }
    return {
      height,
      width,
      data
    };
  }
  var DATA_URI = /^\s*data:(?:([\w-]+)\/([\w+.-]+))?(?:;charset=([\w-]+))?(?:;(base64))?,(.*)/i;
  function decomposeDataUri(dataUri) {
    var dataUriMatch = DATA_URI.exec(dataUri);
    if (dataUriMatch) {
      return {
        mediaType: dataUriMatch[1] ? dataUriMatch[1].toLowerCase() : void 0,
        subType: dataUriMatch[2] ? dataUriMatch[2].toLowerCase() : void 0,
        charset: dataUriMatch[3] ? dataUriMatch[3].toLowerCase() : void 0,
        encoding: dataUriMatch[4] ? dataUriMatch[4].toLowerCase() : void 0,
        data: dataUriMatch[5]
      };
    }
    return void 0;
  }
  var tempAnchor;
  function determineCrossOrigin(url, loc) {
    if (loc === void 0) {
      loc = window.location;
    }
    if (url.indexOf("data:") === 0) {
      return "";
    }
    loc = loc || window.location;
    if (!tempAnchor) {
      tempAnchor = document.createElement("a");
    }
    tempAnchor.href = url;
    var parsedUrl = _url.parse(tempAnchor.href);
    var samePort = !parsedUrl.port && loc.port === "" || parsedUrl.port === loc.port;
    if (parsedUrl.hostname !== loc.hostname || !samePort || parsedUrl.protocol !== loc.protocol) {
      return "anonymous";
    }
    return "";
  }
  function getResolutionOfUrl(url, defaultValue) {
    var resolution = settings.settings.RETINA_PREFIX.exec(url);
    if (resolution) {
      return parseFloat(resolution[1]);
    }
    return defaultValue !== void 0 ? defaultValue : 1;
  }
  Object.defineProperty(exports2, "isMobile", {
    enumerable: true,
    get: function() {
      return settings.isMobile;
    }
  });
  exports2.EventEmitter = eventemitter3;
  exports2.earcut = earcut;
  exports2.url = _url__default;
  exports2.BaseTextureCache = BaseTextureCache;
  exports2.CanvasRenderTarget = CanvasRenderTarget;
  exports2.DATA_URI = DATA_URI;
  exports2.ProgramCache = ProgramCache;
  exports2.TextureCache = TextureCache;
  exports2.clearTextureCache = clearTextureCache;
  exports2.correctBlendMode = correctBlendMode;
  exports2.createIndicesForQuads = createIndicesForQuads;
  exports2.decomposeDataUri = decomposeDataUri;
  exports2.deprecation = deprecation;
  exports2.destroyTextureCache = destroyTextureCache;
  exports2.determineCrossOrigin = determineCrossOrigin;
  exports2.getBufferType = getBufferType;
  exports2.getResolutionOfUrl = getResolutionOfUrl;
  exports2.hex2rgb = hex2rgb;
  exports2.hex2string = hex2string;
  exports2.interleaveTypedArrays = interleaveTypedArrays;
  exports2.isPow2 = isPow2;
  exports2.isWebGLSupported = isWebGLSupported;
  exports2.log2 = log2;
  exports2.nextPow2 = nextPow2;
  exports2.premultiplyBlendMode = premultiplyBlendMode;
  exports2.premultiplyRgba = premultiplyRgba;
  exports2.premultiplyTint = premultiplyTint;
  exports2.premultiplyTintToRgba = premultiplyTintToRgba;
  exports2.removeItems = removeItems;
  exports2.rgb2hex = rgb2hex;
  exports2.sayHello = sayHello;
  exports2.sign = sign;
  exports2.skipHello = skipHello;
  exports2.string2hex = string2hex;
  exports2.trimCanvas = trimCanvas;
  exports2.uid = uid;
});

// node_modules/@pixi/math/lib/math.js
var require_math = __commonJS((exports2) => {
  /*!
   * @pixi/math - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/math is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var PI_2 = Math.PI * 2;
  var RAD_TO_DEG = 180 / Math.PI;
  var DEG_TO_RAD = Math.PI / 180;
  (function(SHAPES) {
    SHAPES[SHAPES["POLY"] = 0] = "POLY";
    SHAPES[SHAPES["RECT"] = 1] = "RECT";
    SHAPES[SHAPES["CIRC"] = 2] = "CIRC";
    SHAPES[SHAPES["ELIP"] = 3] = "ELIP";
    SHAPES[SHAPES["RREC"] = 4] = "RREC";
  })(exports2.SHAPES || (exports2.SHAPES = {}));
  var Rectangle = function() {
    function Rectangle2(x, y, width, height) {
      if (x === void 0) {
        x = 0;
      }
      if (y === void 0) {
        y = 0;
      }
      if (width === void 0) {
        width = 0;
      }
      if (height === void 0) {
        height = 0;
      }
      this.x = Number(x);
      this.y = Number(y);
      this.width = Number(width);
      this.height = Number(height);
      this.type = exports2.SHAPES.RECT;
    }
    Object.defineProperty(Rectangle2.prototype, "left", {
      get: function() {
        return this.x;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Rectangle2.prototype, "right", {
      get: function() {
        return this.x + this.width;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Rectangle2.prototype, "top", {
      get: function() {
        return this.y;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Rectangle2.prototype, "bottom", {
      get: function() {
        return this.y + this.height;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Rectangle2, "EMPTY", {
      get: function() {
        return new Rectangle2(0, 0, 0, 0);
      },
      enumerable: false,
      configurable: true
    });
    Rectangle2.prototype.clone = function() {
      return new Rectangle2(this.x, this.y, this.width, this.height);
    };
    Rectangle2.prototype.copyFrom = function(rectangle) {
      this.x = rectangle.x;
      this.y = rectangle.y;
      this.width = rectangle.width;
      this.height = rectangle.height;
      return this;
    };
    Rectangle2.prototype.copyTo = function(rectangle) {
      rectangle.x = this.x;
      rectangle.y = this.y;
      rectangle.width = this.width;
      rectangle.height = this.height;
      return rectangle;
    };
    Rectangle2.prototype.contains = function(x, y) {
      if (this.width <= 0 || this.height <= 0) {
        return false;
      }
      if (x >= this.x && x < this.x + this.width) {
        if (y >= this.y && y < this.y + this.height) {
          return true;
        }
      }
      return false;
    };
    Rectangle2.prototype.pad = function(paddingX, paddingY) {
      if (paddingX === void 0) {
        paddingX = 0;
      }
      if (paddingY === void 0) {
        paddingY = paddingX;
      }
      this.x -= paddingX;
      this.y -= paddingY;
      this.width += paddingX * 2;
      this.height += paddingY * 2;
      return this;
    };
    Rectangle2.prototype.fit = function(rectangle) {
      var x1 = Math.max(this.x, rectangle.x);
      var x2 = Math.min(this.x + this.width, rectangle.x + rectangle.width);
      var y1 = Math.max(this.y, rectangle.y);
      var y2 = Math.min(this.y + this.height, rectangle.y + rectangle.height);
      this.x = x1;
      this.width = Math.max(x2 - x1, 0);
      this.y = y1;
      this.height = Math.max(y2 - y1, 0);
      return this;
    };
    Rectangle2.prototype.ceil = function(resolution, eps) {
      if (resolution === void 0) {
        resolution = 1;
      }
      if (eps === void 0) {
        eps = 1e-3;
      }
      var x2 = Math.ceil((this.x + this.width - eps) * resolution) / resolution;
      var y2 = Math.ceil((this.y + this.height - eps) * resolution) / resolution;
      this.x = Math.floor((this.x + eps) * resolution) / resolution;
      this.y = Math.floor((this.y + eps) * resolution) / resolution;
      this.width = x2 - this.x;
      this.height = y2 - this.y;
      return this;
    };
    Rectangle2.prototype.enlarge = function(rectangle) {
      var x1 = Math.min(this.x, rectangle.x);
      var x2 = Math.max(this.x + this.width, rectangle.x + rectangle.width);
      var y1 = Math.min(this.y, rectangle.y);
      var y2 = Math.max(this.y + this.height, rectangle.y + rectangle.height);
      this.x = x1;
      this.width = x2 - x1;
      this.y = y1;
      this.height = y2 - y1;
      return this;
    };
    return Rectangle2;
  }();
  var Circle = function() {
    function Circle2(x, y, radius) {
      if (x === void 0) {
        x = 0;
      }
      if (y === void 0) {
        y = 0;
      }
      if (radius === void 0) {
        radius = 0;
      }
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.type = exports2.SHAPES.CIRC;
    }
    Circle2.prototype.clone = function() {
      return new Circle2(this.x, this.y, this.radius);
    };
    Circle2.prototype.contains = function(x, y) {
      if (this.radius <= 0) {
        return false;
      }
      var r2 = this.radius * this.radius;
      var dx = this.x - x;
      var dy = this.y - y;
      dx *= dx;
      dy *= dy;
      return dx + dy <= r2;
    };
    Circle2.prototype.getBounds = function() {
      return new Rectangle(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
    };
    return Circle2;
  }();
  var Ellipse = function() {
    function Ellipse2(x, y, halfWidth, halfHeight) {
      if (x === void 0) {
        x = 0;
      }
      if (y === void 0) {
        y = 0;
      }
      if (halfWidth === void 0) {
        halfWidth = 0;
      }
      if (halfHeight === void 0) {
        halfHeight = 0;
      }
      this.x = x;
      this.y = y;
      this.width = halfWidth;
      this.height = halfHeight;
      this.type = exports2.SHAPES.ELIP;
    }
    Ellipse2.prototype.clone = function() {
      return new Ellipse2(this.x, this.y, this.width, this.height);
    };
    Ellipse2.prototype.contains = function(x, y) {
      if (this.width <= 0 || this.height <= 0) {
        return false;
      }
      var normx = (x - this.x) / this.width;
      var normy = (y - this.y) / this.height;
      normx *= normx;
      normy *= normy;
      return normx + normy <= 1;
    };
    Ellipse2.prototype.getBounds = function() {
      return new Rectangle(this.x - this.width, this.y - this.height, this.width, this.height);
    };
    return Ellipse2;
  }();
  var Polygon = function() {
    function Polygon2() {
      var arguments$1 = arguments;
      var points = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        points[_i] = arguments$1[_i];
      }
      var flat = Array.isArray(points[0]) ? points[0] : points;
      if (typeof flat[0] !== "number") {
        var p = [];
        for (var i = 0, il = flat.length; i < il; i++) {
          p.push(flat[i].x, flat[i].y);
        }
        flat = p;
      }
      this.points = flat;
      this.type = exports2.SHAPES.POLY;
      this.closeStroke = true;
    }
    Polygon2.prototype.clone = function() {
      var points = this.points.slice();
      var polygon = new Polygon2(points);
      polygon.closeStroke = this.closeStroke;
      return polygon;
    };
    Polygon2.prototype.contains = function(x, y) {
      var inside = false;
      var length = this.points.length / 2;
      for (var i = 0, j = length - 1; i < length; j = i++) {
        var xi = this.points[i * 2];
        var yi = this.points[i * 2 + 1];
        var xj = this.points[j * 2];
        var yj = this.points[j * 2 + 1];
        var intersect = yi > y !== yj > y && x < (xj - xi) * ((y - yi) / (yj - yi)) + xi;
        if (intersect) {
          inside = !inside;
        }
      }
      return inside;
    };
    return Polygon2;
  }();
  var RoundedRectangle = function() {
    function RoundedRectangle2(x, y, width, height, radius) {
      if (x === void 0) {
        x = 0;
      }
      if (y === void 0) {
        y = 0;
      }
      if (width === void 0) {
        width = 0;
      }
      if (height === void 0) {
        height = 0;
      }
      if (radius === void 0) {
        radius = 20;
      }
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.radius = radius;
      this.type = exports2.SHAPES.RREC;
    }
    RoundedRectangle2.prototype.clone = function() {
      return new RoundedRectangle2(this.x, this.y, this.width, this.height, this.radius);
    };
    RoundedRectangle2.prototype.contains = function(x, y) {
      if (this.width <= 0 || this.height <= 0) {
        return false;
      }
      if (x >= this.x && x <= this.x + this.width) {
        if (y >= this.y && y <= this.y + this.height) {
          if (y >= this.y + this.radius && y <= this.y + this.height - this.radius || x >= this.x + this.radius && x <= this.x + this.width - this.radius) {
            return true;
          }
          var dx = x - (this.x + this.radius);
          var dy = y - (this.y + this.radius);
          var radius2 = this.radius * this.radius;
          if (dx * dx + dy * dy <= radius2) {
            return true;
          }
          dx = x - (this.x + this.width - this.radius);
          if (dx * dx + dy * dy <= radius2) {
            return true;
          }
          dy = y - (this.y + this.height - this.radius);
          if (dx * dx + dy * dy <= radius2) {
            return true;
          }
          dx = x - (this.x + this.radius);
          if (dx * dx + dy * dy <= radius2) {
            return true;
          }
        }
      }
      return false;
    };
    return RoundedRectangle2;
  }();
  var Point = function() {
    function Point2(x, y) {
      if (x === void 0) {
        x = 0;
      }
      if (y === void 0) {
        y = 0;
      }
      this.x = x;
      this.y = y;
    }
    Point2.prototype.clone = function() {
      return new Point2(this.x, this.y);
    };
    Point2.prototype.copyFrom = function(p) {
      this.set(p.x, p.y);
      return this;
    };
    Point2.prototype.copyTo = function(p) {
      p.set(this.x, this.y);
      return p;
    };
    Point2.prototype.equals = function(p) {
      return p.x === this.x && p.y === this.y;
    };
    Point2.prototype.set = function(x, y) {
      if (x === void 0) {
        x = 0;
      }
      if (y === void 0) {
        y = x;
      }
      this.x = x;
      this.y = y;
      return this;
    };
    return Point2;
  }();
  var ObservablePoint = function() {
    function ObservablePoint2(cb, scope, x, y) {
      if (x === void 0) {
        x = 0;
      }
      if (y === void 0) {
        y = 0;
      }
      this._x = x;
      this._y = y;
      this.cb = cb;
      this.scope = scope;
    }
    ObservablePoint2.prototype.clone = function(cb, scope) {
      if (cb === void 0) {
        cb = this.cb;
      }
      if (scope === void 0) {
        scope = this.scope;
      }
      return new ObservablePoint2(cb, scope, this._x, this._y);
    };
    ObservablePoint2.prototype.set = function(x, y) {
      if (x === void 0) {
        x = 0;
      }
      if (y === void 0) {
        y = x;
      }
      if (this._x !== x || this._y !== y) {
        this._x = x;
        this._y = y;
        this.cb.call(this.scope);
      }
      return this;
    };
    ObservablePoint2.prototype.copyFrom = function(p) {
      if (this._x !== p.x || this._y !== p.y) {
        this._x = p.x;
        this._y = p.y;
        this.cb.call(this.scope);
      }
      return this;
    };
    ObservablePoint2.prototype.copyTo = function(p) {
      p.set(this._x, this._y);
      return p;
    };
    ObservablePoint2.prototype.equals = function(p) {
      return p.x === this._x && p.y === this._y;
    };
    Object.defineProperty(ObservablePoint2.prototype, "x", {
      get: function() {
        return this._x;
      },
      set: function(value) {
        if (this._x !== value) {
          this._x = value;
          this.cb.call(this.scope);
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(ObservablePoint2.prototype, "y", {
      get: function() {
        return this._y;
      },
      set: function(value) {
        if (this._y !== value) {
          this._y = value;
          this.cb.call(this.scope);
        }
      },
      enumerable: false,
      configurable: true
    });
    return ObservablePoint2;
  }();
  var Matrix = function() {
    function Matrix2(a, b, c, d, tx, ty) {
      if (a === void 0) {
        a = 1;
      }
      if (b === void 0) {
        b = 0;
      }
      if (c === void 0) {
        c = 0;
      }
      if (d === void 0) {
        d = 1;
      }
      if (tx === void 0) {
        tx = 0;
      }
      if (ty === void 0) {
        ty = 0;
      }
      this.array = null;
      this.a = a;
      this.b = b;
      this.c = c;
      this.d = d;
      this.tx = tx;
      this.ty = ty;
    }
    Matrix2.prototype.fromArray = function(array) {
      this.a = array[0];
      this.b = array[1];
      this.c = array[3];
      this.d = array[4];
      this.tx = array[2];
      this.ty = array[5];
    };
    Matrix2.prototype.set = function(a, b, c, d, tx, ty) {
      this.a = a;
      this.b = b;
      this.c = c;
      this.d = d;
      this.tx = tx;
      this.ty = ty;
      return this;
    };
    Matrix2.prototype.toArray = function(transpose, out) {
      if (!this.array) {
        this.array = new Float32Array(9);
      }
      var array = out || this.array;
      if (transpose) {
        array[0] = this.a;
        array[1] = this.b;
        array[2] = 0;
        array[3] = this.c;
        array[4] = this.d;
        array[5] = 0;
        array[6] = this.tx;
        array[7] = this.ty;
        array[8] = 1;
      } else {
        array[0] = this.a;
        array[1] = this.c;
        array[2] = this.tx;
        array[3] = this.b;
        array[4] = this.d;
        array[5] = this.ty;
        array[6] = 0;
        array[7] = 0;
        array[8] = 1;
      }
      return array;
    };
    Matrix2.prototype.apply = function(pos, newPos) {
      newPos = newPos || new Point();
      var x = pos.x;
      var y = pos.y;
      newPos.x = this.a * x + this.c * y + this.tx;
      newPos.y = this.b * x + this.d * y + this.ty;
      return newPos;
    };
    Matrix2.prototype.applyInverse = function(pos, newPos) {
      newPos = newPos || new Point();
      var id = 1 / (this.a * this.d + this.c * -this.b);
      var x = pos.x;
      var y = pos.y;
      newPos.x = this.d * id * x + -this.c * id * y + (this.ty * this.c - this.tx * this.d) * id;
      newPos.y = this.a * id * y + -this.b * id * x + (-this.ty * this.a + this.tx * this.b) * id;
      return newPos;
    };
    Matrix2.prototype.translate = function(x, y) {
      this.tx += x;
      this.ty += y;
      return this;
    };
    Matrix2.prototype.scale = function(x, y) {
      this.a *= x;
      this.d *= y;
      this.c *= x;
      this.b *= y;
      this.tx *= x;
      this.ty *= y;
      return this;
    };
    Matrix2.prototype.rotate = function(angle) {
      var cos = Math.cos(angle);
      var sin = Math.sin(angle);
      var a1 = this.a;
      var c1 = this.c;
      var tx1 = this.tx;
      this.a = a1 * cos - this.b * sin;
      this.b = a1 * sin + this.b * cos;
      this.c = c1 * cos - this.d * sin;
      this.d = c1 * sin + this.d * cos;
      this.tx = tx1 * cos - this.ty * sin;
      this.ty = tx1 * sin + this.ty * cos;
      return this;
    };
    Matrix2.prototype.append = function(matrix) {
      var a1 = this.a;
      var b1 = this.b;
      var c1 = this.c;
      var d1 = this.d;
      this.a = matrix.a * a1 + matrix.b * c1;
      this.b = matrix.a * b1 + matrix.b * d1;
      this.c = matrix.c * a1 + matrix.d * c1;
      this.d = matrix.c * b1 + matrix.d * d1;
      this.tx = matrix.tx * a1 + matrix.ty * c1 + this.tx;
      this.ty = matrix.tx * b1 + matrix.ty * d1 + this.ty;
      return this;
    };
    Matrix2.prototype.setTransform = function(x, y, pivotX, pivotY, scaleX, scaleY, rotation, skewX, skewY) {
      this.a = Math.cos(rotation + skewY) * scaleX;
      this.b = Math.sin(rotation + skewY) * scaleX;
      this.c = -Math.sin(rotation - skewX) * scaleY;
      this.d = Math.cos(rotation - skewX) * scaleY;
      this.tx = x - (pivotX * this.a + pivotY * this.c);
      this.ty = y - (pivotX * this.b + pivotY * this.d);
      return this;
    };
    Matrix2.prototype.prepend = function(matrix) {
      var tx1 = this.tx;
      if (matrix.a !== 1 || matrix.b !== 0 || matrix.c !== 0 || matrix.d !== 1) {
        var a1 = this.a;
        var c1 = this.c;
        this.a = a1 * matrix.a + this.b * matrix.c;
        this.b = a1 * matrix.b + this.b * matrix.d;
        this.c = c1 * matrix.a + this.d * matrix.c;
        this.d = c1 * matrix.b + this.d * matrix.d;
      }
      this.tx = tx1 * matrix.a + this.ty * matrix.c + matrix.tx;
      this.ty = tx1 * matrix.b + this.ty * matrix.d + matrix.ty;
      return this;
    };
    Matrix2.prototype.decompose = function(transform) {
      var a = this.a;
      var b = this.b;
      var c = this.c;
      var d = this.d;
      var skewX = -Math.atan2(-c, d);
      var skewY = Math.atan2(b, a);
      var delta = Math.abs(skewX + skewY);
      if (delta < 1e-5 || Math.abs(PI_2 - delta) < 1e-5) {
        transform.rotation = skewY;
        transform.skew.x = transform.skew.y = 0;
      } else {
        transform.rotation = 0;
        transform.skew.x = skewX;
        transform.skew.y = skewY;
      }
      transform.scale.x = Math.sqrt(a * a + b * b);
      transform.scale.y = Math.sqrt(c * c + d * d);
      transform.position.x = this.tx;
      transform.position.y = this.ty;
      return transform;
    };
    Matrix2.prototype.invert = function() {
      var a1 = this.a;
      var b1 = this.b;
      var c1 = this.c;
      var d1 = this.d;
      var tx1 = this.tx;
      var n = a1 * d1 - b1 * c1;
      this.a = d1 / n;
      this.b = -b1 / n;
      this.c = -c1 / n;
      this.d = a1 / n;
      this.tx = (c1 * this.ty - d1 * tx1) / n;
      this.ty = -(a1 * this.ty - b1 * tx1) / n;
      return this;
    };
    Matrix2.prototype.identity = function() {
      this.a = 1;
      this.b = 0;
      this.c = 0;
      this.d = 1;
      this.tx = 0;
      this.ty = 0;
      return this;
    };
    Matrix2.prototype.clone = function() {
      var matrix = new Matrix2();
      matrix.a = this.a;
      matrix.b = this.b;
      matrix.c = this.c;
      matrix.d = this.d;
      matrix.tx = this.tx;
      matrix.ty = this.ty;
      return matrix;
    };
    Matrix2.prototype.copyTo = function(matrix) {
      matrix.a = this.a;
      matrix.b = this.b;
      matrix.c = this.c;
      matrix.d = this.d;
      matrix.tx = this.tx;
      matrix.ty = this.ty;
      return matrix;
    };
    Matrix2.prototype.copyFrom = function(matrix) {
      this.a = matrix.a;
      this.b = matrix.b;
      this.c = matrix.c;
      this.d = matrix.d;
      this.tx = matrix.tx;
      this.ty = matrix.ty;
      return this;
    };
    Object.defineProperty(Matrix2, "IDENTITY", {
      get: function() {
        return new Matrix2();
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Matrix2, "TEMP_MATRIX", {
      get: function() {
        return new Matrix2();
      },
      enumerable: false,
      configurable: true
    });
    return Matrix2;
  }();
  var ux = [1, 1, 0, -1, -1, -1, 0, 1, 1, 1, 0, -1, -1, -1, 0, 1];
  var uy = [0, 1, 1, 1, 0, -1, -1, -1, 0, 1, 1, 1, 0, -1, -1, -1];
  var vx = [0, -1, -1, -1, 0, 1, 1, 1, 0, 1, 1, 1, 0, -1, -1, -1];
  var vy = [1, 1, 0, -1, -1, -1, 0, 1, -1, -1, 0, 1, 1, 1, 0, -1];
  var rotationCayley = [];
  var rotationMatrices = [];
  var signum = Math.sign;
  function init() {
    for (var i = 0; i < 16; i++) {
      var row = [];
      rotationCayley.push(row);
      for (var j = 0; j < 16; j++) {
        var _ux = signum(ux[i] * ux[j] + vx[i] * uy[j]);
        var _uy = signum(uy[i] * ux[j] + vy[i] * uy[j]);
        var _vx = signum(ux[i] * vx[j] + vx[i] * vy[j]);
        var _vy = signum(uy[i] * vx[j] + vy[i] * vy[j]);
        for (var k = 0; k < 16; k++) {
          if (ux[k] === _ux && uy[k] === _uy && vx[k] === _vx && vy[k] === _vy) {
            row.push(k);
            break;
          }
        }
      }
    }
    for (var i = 0; i < 16; i++) {
      var mat = new Matrix();
      mat.set(ux[i], uy[i], vx[i], vy[i], 0, 0);
      rotationMatrices.push(mat);
    }
  }
  init();
  var groupD8 = {
    E: 0,
    SE: 1,
    S: 2,
    SW: 3,
    W: 4,
    NW: 5,
    N: 6,
    NE: 7,
    MIRROR_VERTICAL: 8,
    MAIN_DIAGONAL: 10,
    MIRROR_HORIZONTAL: 12,
    REVERSE_DIAGONAL: 14,
    uX: function(ind) {
      return ux[ind];
    },
    uY: function(ind) {
      return uy[ind];
    },
    vX: function(ind) {
      return vx[ind];
    },
    vY: function(ind) {
      return vy[ind];
    },
    inv: function(rotation) {
      if (rotation & 8) {
        return rotation & 15;
      }
      return -rotation & 7;
    },
    add: function(rotationSecond, rotationFirst) {
      return rotationCayley[rotationSecond][rotationFirst];
    },
    sub: function(rotationSecond, rotationFirst) {
      return rotationCayley[rotationSecond][groupD8.inv(rotationFirst)];
    },
    rotate180: function(rotation) {
      return rotation ^ 4;
    },
    isVertical: function(rotation) {
      return (rotation & 3) === 2;
    },
    byDirection: function(dx, dy) {
      if (Math.abs(dx) * 2 <= Math.abs(dy)) {
        if (dy >= 0) {
          return groupD8.S;
        }
        return groupD8.N;
      } else if (Math.abs(dy) * 2 <= Math.abs(dx)) {
        if (dx > 0) {
          return groupD8.E;
        }
        return groupD8.W;
      } else if (dy > 0) {
        if (dx > 0) {
          return groupD8.SE;
        }
        return groupD8.SW;
      } else if (dx > 0) {
        return groupD8.NE;
      }
      return groupD8.NW;
    },
    matrixAppendRotationInv: function(matrix, rotation, tx, ty) {
      if (tx === void 0) {
        tx = 0;
      }
      if (ty === void 0) {
        ty = 0;
      }
      var mat = rotationMatrices[groupD8.inv(rotation)];
      mat.tx = tx;
      mat.ty = ty;
      matrix.append(mat);
    }
  };
  var Transform = function() {
    function Transform2() {
      this.worldTransform = new Matrix();
      this.localTransform = new Matrix();
      this.position = new ObservablePoint(this.onChange, this, 0, 0);
      this.scale = new ObservablePoint(this.onChange, this, 1, 1);
      this.pivot = new ObservablePoint(this.onChange, this, 0, 0);
      this.skew = new ObservablePoint(this.updateSkew, this, 0, 0);
      this._rotation = 0;
      this._cx = 1;
      this._sx = 0;
      this._cy = 0;
      this._sy = 1;
      this._localID = 0;
      this._currentLocalID = 0;
      this._worldID = 0;
      this._parentID = 0;
    }
    Transform2.prototype.onChange = function() {
      this._localID++;
    };
    Transform2.prototype.updateSkew = function() {
      this._cx = Math.cos(this._rotation + this.skew.y);
      this._sx = Math.sin(this._rotation + this.skew.y);
      this._cy = -Math.sin(this._rotation - this.skew.x);
      this._sy = Math.cos(this._rotation - this.skew.x);
      this._localID++;
    };
    Transform2.prototype.updateLocalTransform = function() {
      var lt = this.localTransform;
      if (this._localID !== this._currentLocalID) {
        lt.a = this._cx * this.scale.x;
        lt.b = this._sx * this.scale.x;
        lt.c = this._cy * this.scale.y;
        lt.d = this._sy * this.scale.y;
        lt.tx = this.position.x - (this.pivot.x * lt.a + this.pivot.y * lt.c);
        lt.ty = this.position.y - (this.pivot.x * lt.b + this.pivot.y * lt.d);
        this._currentLocalID = this._localID;
        this._parentID = -1;
      }
    };
    Transform2.prototype.updateTransform = function(parentTransform) {
      var lt = this.localTransform;
      if (this._localID !== this._currentLocalID) {
        lt.a = this._cx * this.scale.x;
        lt.b = this._sx * this.scale.x;
        lt.c = this._cy * this.scale.y;
        lt.d = this._sy * this.scale.y;
        lt.tx = this.position.x - (this.pivot.x * lt.a + this.pivot.y * lt.c);
        lt.ty = this.position.y - (this.pivot.x * lt.b + this.pivot.y * lt.d);
        this._currentLocalID = this._localID;
        this._parentID = -1;
      }
      if (this._parentID !== parentTransform._worldID) {
        var pt = parentTransform.worldTransform;
        var wt = this.worldTransform;
        wt.a = lt.a * pt.a + lt.b * pt.c;
        wt.b = lt.a * pt.b + lt.b * pt.d;
        wt.c = lt.c * pt.a + lt.d * pt.c;
        wt.d = lt.c * pt.b + lt.d * pt.d;
        wt.tx = lt.tx * pt.a + lt.ty * pt.c + pt.tx;
        wt.ty = lt.tx * pt.b + lt.ty * pt.d + pt.ty;
        this._parentID = parentTransform._worldID;
        this._worldID++;
      }
    };
    Transform2.prototype.setFromMatrix = function(matrix) {
      matrix.decompose(this);
      this._localID++;
    };
    Object.defineProperty(Transform2.prototype, "rotation", {
      get: function() {
        return this._rotation;
      },
      set: function(value) {
        if (this._rotation !== value) {
          this._rotation = value;
          this.updateSkew();
        }
      },
      enumerable: false,
      configurable: true
    });
    Transform2.IDENTITY = new Transform2();
    return Transform2;
  }();
  exports2.Circle = Circle;
  exports2.DEG_TO_RAD = DEG_TO_RAD;
  exports2.Ellipse = Ellipse;
  exports2.Matrix = Matrix;
  exports2.ObservablePoint = ObservablePoint;
  exports2.PI_2 = PI_2;
  exports2.Point = Point;
  exports2.Polygon = Polygon;
  exports2.RAD_TO_DEG = RAD_TO_DEG;
  exports2.Rectangle = Rectangle;
  exports2.RoundedRectangle = RoundedRectangle;
  exports2.Transform = Transform;
  exports2.groupD8 = groupD8;
});

// node_modules/@pixi/display/lib/display.js
var require_display = __commonJS((exports2) => {
  /*!
   * @pixi/display - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/display is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var settings = require_settings();
  var math = require_math();
  var utils = require_utils();
  settings.settings.SORTABLE_CHILDREN = false;
  var Bounds = function() {
    function Bounds2() {
      this.minX = Infinity;
      this.minY = Infinity;
      this.maxX = -Infinity;
      this.maxY = -Infinity;
      this.rect = null;
      this.updateID = -1;
    }
    Bounds2.prototype.isEmpty = function() {
      return this.minX > this.maxX || this.minY > this.maxY;
    };
    Bounds2.prototype.clear = function() {
      this.minX = Infinity;
      this.minY = Infinity;
      this.maxX = -Infinity;
      this.maxY = -Infinity;
    };
    Bounds2.prototype.getRectangle = function(rect) {
      if (this.minX > this.maxX || this.minY > this.maxY) {
        return math.Rectangle.EMPTY;
      }
      rect = rect || new math.Rectangle(0, 0, 1, 1);
      rect.x = this.minX;
      rect.y = this.minY;
      rect.width = this.maxX - this.minX;
      rect.height = this.maxY - this.minY;
      return rect;
    };
    Bounds2.prototype.addPoint = function(point) {
      this.minX = Math.min(this.minX, point.x);
      this.maxX = Math.max(this.maxX, point.x);
      this.minY = Math.min(this.minY, point.y);
      this.maxY = Math.max(this.maxY, point.y);
    };
    Bounds2.prototype.addQuad = function(vertices) {
      var minX = this.minX;
      var minY = this.minY;
      var maxX = this.maxX;
      var maxY = this.maxY;
      var x = vertices[0];
      var y = vertices[1];
      minX = x < minX ? x : minX;
      minY = y < minY ? y : minY;
      maxX = x > maxX ? x : maxX;
      maxY = y > maxY ? y : maxY;
      x = vertices[2];
      y = vertices[3];
      minX = x < minX ? x : minX;
      minY = y < minY ? y : minY;
      maxX = x > maxX ? x : maxX;
      maxY = y > maxY ? y : maxY;
      x = vertices[4];
      y = vertices[5];
      minX = x < minX ? x : minX;
      minY = y < minY ? y : minY;
      maxX = x > maxX ? x : maxX;
      maxY = y > maxY ? y : maxY;
      x = vertices[6];
      y = vertices[7];
      minX = x < minX ? x : minX;
      minY = y < minY ? y : minY;
      maxX = x > maxX ? x : maxX;
      maxY = y > maxY ? y : maxY;
      this.minX = minX;
      this.minY = minY;
      this.maxX = maxX;
      this.maxY = maxY;
    };
    Bounds2.prototype.addFrame = function(transform, x0, y0, x1, y1) {
      this.addFrameMatrix(transform.worldTransform, x0, y0, x1, y1);
    };
    Bounds2.prototype.addFrameMatrix = function(matrix, x0, y0, x1, y1) {
      var a = matrix.a;
      var b = matrix.b;
      var c = matrix.c;
      var d = matrix.d;
      var tx = matrix.tx;
      var ty = matrix.ty;
      var minX = this.minX;
      var minY = this.minY;
      var maxX = this.maxX;
      var maxY = this.maxY;
      var x = a * x0 + c * y0 + tx;
      var y = b * x0 + d * y0 + ty;
      minX = x < minX ? x : minX;
      minY = y < minY ? y : minY;
      maxX = x > maxX ? x : maxX;
      maxY = y > maxY ? y : maxY;
      x = a * x1 + c * y0 + tx;
      y = b * x1 + d * y0 + ty;
      minX = x < minX ? x : minX;
      minY = y < minY ? y : minY;
      maxX = x > maxX ? x : maxX;
      maxY = y > maxY ? y : maxY;
      x = a * x0 + c * y1 + tx;
      y = b * x0 + d * y1 + ty;
      minX = x < minX ? x : minX;
      minY = y < minY ? y : minY;
      maxX = x > maxX ? x : maxX;
      maxY = y > maxY ? y : maxY;
      x = a * x1 + c * y1 + tx;
      y = b * x1 + d * y1 + ty;
      minX = x < minX ? x : minX;
      minY = y < minY ? y : minY;
      maxX = x > maxX ? x : maxX;
      maxY = y > maxY ? y : maxY;
      this.minX = minX;
      this.minY = minY;
      this.maxX = maxX;
      this.maxY = maxY;
    };
    Bounds2.prototype.addVertexData = function(vertexData, beginOffset, endOffset) {
      var minX = this.minX;
      var minY = this.minY;
      var maxX = this.maxX;
      var maxY = this.maxY;
      for (var i = beginOffset; i < endOffset; i += 2) {
        var x = vertexData[i];
        var y = vertexData[i + 1];
        minX = x < minX ? x : minX;
        minY = y < minY ? y : minY;
        maxX = x > maxX ? x : maxX;
        maxY = y > maxY ? y : maxY;
      }
      this.minX = minX;
      this.minY = minY;
      this.maxX = maxX;
      this.maxY = maxY;
    };
    Bounds2.prototype.addVertices = function(transform, vertices, beginOffset, endOffset) {
      this.addVerticesMatrix(transform.worldTransform, vertices, beginOffset, endOffset);
    };
    Bounds2.prototype.addVerticesMatrix = function(matrix, vertices, beginOffset, endOffset, padX, padY) {
      if (padX === void 0) {
        padX = 0;
      }
      if (padY === void 0) {
        padY = padX;
      }
      var a = matrix.a;
      var b = matrix.b;
      var c = matrix.c;
      var d = matrix.d;
      var tx = matrix.tx;
      var ty = matrix.ty;
      var minX = this.minX;
      var minY = this.minY;
      var maxX = this.maxX;
      var maxY = this.maxY;
      for (var i = beginOffset; i < endOffset; i += 2) {
        var rawX = vertices[i];
        var rawY = vertices[i + 1];
        var x = a * rawX + c * rawY + tx;
        var y = d * rawY + b * rawX + ty;
        minX = Math.min(minX, x - padX);
        maxX = Math.max(maxX, x + padX);
        minY = Math.min(minY, y - padY);
        maxY = Math.max(maxY, y + padY);
      }
      this.minX = minX;
      this.minY = minY;
      this.maxX = maxX;
      this.maxY = maxY;
    };
    Bounds2.prototype.addBounds = function(bounds) {
      var minX = this.minX;
      var minY = this.minY;
      var maxX = this.maxX;
      var maxY = this.maxY;
      this.minX = bounds.minX < minX ? bounds.minX : minX;
      this.minY = bounds.minY < minY ? bounds.minY : minY;
      this.maxX = bounds.maxX > maxX ? bounds.maxX : maxX;
      this.maxY = bounds.maxY > maxY ? bounds.maxY : maxY;
    };
    Bounds2.prototype.addBoundsMask = function(bounds, mask) {
      var _minX = bounds.minX > mask.minX ? bounds.minX : mask.minX;
      var _minY = bounds.minY > mask.minY ? bounds.minY : mask.minY;
      var _maxX = bounds.maxX < mask.maxX ? bounds.maxX : mask.maxX;
      var _maxY = bounds.maxY < mask.maxY ? bounds.maxY : mask.maxY;
      if (_minX <= _maxX && _minY <= _maxY) {
        var minX = this.minX;
        var minY = this.minY;
        var maxX = this.maxX;
        var maxY = this.maxY;
        this.minX = _minX < minX ? _minX : minX;
        this.minY = _minY < minY ? _minY : minY;
        this.maxX = _maxX > maxX ? _maxX : maxX;
        this.maxY = _maxY > maxY ? _maxY : maxY;
      }
    };
    Bounds2.prototype.addBoundsMatrix = function(bounds, matrix) {
      this.addFrameMatrix(matrix, bounds.minX, bounds.minY, bounds.maxX, bounds.maxY);
    };
    Bounds2.prototype.addBoundsArea = function(bounds, area) {
      var _minX = bounds.minX > area.x ? bounds.minX : area.x;
      var _minY = bounds.minY > area.y ? bounds.minY : area.y;
      var _maxX = bounds.maxX < area.x + area.width ? bounds.maxX : area.x + area.width;
      var _maxY = bounds.maxY < area.y + area.height ? bounds.maxY : area.y + area.height;
      if (_minX <= _maxX && _minY <= _maxY) {
        var minX = this.minX;
        var minY = this.minY;
        var maxX = this.maxX;
        var maxY = this.maxY;
        this.minX = _minX < minX ? _minX : minX;
        this.minY = _minY < minY ? _minY : minY;
        this.maxX = _maxX > maxX ? _maxX : maxX;
        this.maxY = _maxY > maxY ? _maxY : maxY;
      }
    };
    Bounds2.prototype.pad = function(paddingX, paddingY) {
      if (paddingX === void 0) {
        paddingX = 0;
      }
      if (paddingY === void 0) {
        paddingY = paddingX;
      }
      if (!this.isEmpty()) {
        this.minX -= paddingX;
        this.maxX += paddingX;
        this.minY -= paddingY;
        this.maxY += paddingY;
      }
    };
    Bounds2.prototype.addFramePad = function(x0, y0, x1, y1, padX, padY) {
      x0 -= padX;
      y0 -= padY;
      x1 += padX;
      y1 += padY;
      this.minX = this.minX < x0 ? this.minX : x0;
      this.maxX = this.maxX > x1 ? this.maxX : x1;
      this.minY = this.minY < y0 ? this.minY : y0;
      this.maxY = this.maxY > y1 ? this.maxY : y1;
    };
    return Bounds2;
  }();
  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0
  
  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.
  
  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || {__proto__: []} instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) {
        if (b2.hasOwnProperty(p)) {
          d2[p] = b2[p];
        }
      }
    };
    return extendStatics(d, b);
  };
  function __extends(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  var DisplayObject = function(_super) {
    __extends(DisplayObject2, _super);
    function DisplayObject2() {
      var _this = _super.call(this) || this;
      _this.tempDisplayObjectParent = null;
      _this.transform = new math.Transform();
      _this.alpha = 1;
      _this.visible = true;
      _this.renderable = true;
      _this.parent = null;
      _this.worldAlpha = 1;
      _this._lastSortedIndex = 0;
      _this._zIndex = 0;
      _this.filterArea = null;
      _this.filters = null;
      _this._enabledFilters = null;
      _this._bounds = new Bounds();
      _this._localBounds = null;
      _this._boundsID = 0;
      _this._boundsRect = null;
      _this._localBoundsRect = null;
      _this._mask = null;
      _this._destroyed = false;
      _this.isSprite = false;
      _this.isMask = false;
      return _this;
    }
    DisplayObject2.mixin = function(source) {
      var keys = Object.keys(source);
      for (var i = 0; i < keys.length; ++i) {
        var propertyName = keys[i];
        Object.defineProperty(DisplayObject2.prototype, propertyName, Object.getOwnPropertyDescriptor(source, propertyName));
      }
    };
    DisplayObject2.prototype._recursivePostUpdateTransform = function() {
      if (this.parent) {
        this.parent._recursivePostUpdateTransform();
        this.transform.updateTransform(this.parent.transform);
      } else {
        this.transform.updateTransform(this._tempDisplayObjectParent.transform);
      }
    };
    DisplayObject2.prototype.updateTransform = function() {
      this._boundsID++;
      this.transform.updateTransform(this.parent.transform);
      this.worldAlpha = this.alpha * this.parent.worldAlpha;
    };
    DisplayObject2.prototype.getBounds = function(skipUpdate, rect) {
      if (!skipUpdate) {
        if (!this.parent) {
          this.parent = this._tempDisplayObjectParent;
          this.updateTransform();
          this.parent = null;
        } else {
          this._recursivePostUpdateTransform();
          this.updateTransform();
        }
      }
      if (this._bounds.updateID !== this._boundsID) {
        this.calculateBounds();
        this._bounds.updateID = this._boundsID;
      }
      if (!rect) {
        if (!this._boundsRect) {
          this._boundsRect = new math.Rectangle();
        }
        rect = this._boundsRect;
      }
      return this._bounds.getRectangle(rect);
    };
    DisplayObject2.prototype.getLocalBounds = function(rect) {
      if (!rect) {
        if (!this._localBoundsRect) {
          this._localBoundsRect = new math.Rectangle();
        }
        rect = this._localBoundsRect;
      }
      if (!this._localBounds) {
        this._localBounds = new Bounds();
      }
      var transformRef = this.transform;
      var parentRef = this.parent;
      this.parent = null;
      this.transform = this._tempDisplayObjectParent.transform;
      var worldBounds = this._bounds;
      var worldBoundsID = this._boundsID;
      this._bounds = this._localBounds;
      var bounds = this.getBounds(false, rect);
      this.parent = parentRef;
      this.transform = transformRef;
      this._bounds = worldBounds;
      this._bounds.updateID += this._boundsID - worldBoundsID;
      return bounds;
    };
    DisplayObject2.prototype.toGlobal = function(position, point, skipUpdate) {
      if (skipUpdate === void 0) {
        skipUpdate = false;
      }
      if (!skipUpdate) {
        this._recursivePostUpdateTransform();
        if (!this.parent) {
          this.parent = this._tempDisplayObjectParent;
          this.displayObjectUpdateTransform();
          this.parent = null;
        } else {
          this.displayObjectUpdateTransform();
        }
      }
      return this.worldTransform.apply(position, point);
    };
    DisplayObject2.prototype.toLocal = function(position, from, point, skipUpdate) {
      if (from) {
        position = from.toGlobal(position, point, skipUpdate);
      }
      if (!skipUpdate) {
        this._recursivePostUpdateTransform();
        if (!this.parent) {
          this.parent = this._tempDisplayObjectParent;
          this.displayObjectUpdateTransform();
          this.parent = null;
        } else {
          this.displayObjectUpdateTransform();
        }
      }
      return this.worldTransform.applyInverse(position, point);
    };
    DisplayObject2.prototype.setParent = function(container) {
      if (!container || !container.addChild) {
        throw new Error("setParent: Argument must be a Container");
      }
      container.addChild(this);
      return container;
    };
    DisplayObject2.prototype.setTransform = function(x, y, scaleX, scaleY, rotation, skewX, skewY, pivotX, pivotY) {
      if (x === void 0) {
        x = 0;
      }
      if (y === void 0) {
        y = 0;
      }
      if (scaleX === void 0) {
        scaleX = 1;
      }
      if (scaleY === void 0) {
        scaleY = 1;
      }
      if (rotation === void 0) {
        rotation = 0;
      }
      if (skewX === void 0) {
        skewX = 0;
      }
      if (skewY === void 0) {
        skewY = 0;
      }
      if (pivotX === void 0) {
        pivotX = 0;
      }
      if (pivotY === void 0) {
        pivotY = 0;
      }
      this.position.x = x;
      this.position.y = y;
      this.scale.x = !scaleX ? 1 : scaleX;
      this.scale.y = !scaleY ? 1 : scaleY;
      this.rotation = rotation;
      this.skew.x = skewX;
      this.skew.y = skewY;
      this.pivot.x = pivotX;
      this.pivot.y = pivotY;
      return this;
    };
    DisplayObject2.prototype.destroy = function(_options) {
      if (this.parent) {
        this.parent.removeChild(this);
      }
      this.removeAllListeners();
      this.transform = null;
      this.parent = null;
      this._bounds = null;
      this._mask = null;
      this.filters = null;
      this.filterArea = null;
      this.hitArea = null;
      this.interactive = false;
      this.interactiveChildren = false;
      this._destroyed = true;
    };
    Object.defineProperty(DisplayObject2.prototype, "_tempDisplayObjectParent", {
      get: function() {
        if (this.tempDisplayObjectParent === null) {
          this.tempDisplayObjectParent = new TemporaryDisplayObject();
        }
        return this.tempDisplayObjectParent;
      },
      enumerable: false,
      configurable: true
    });
    DisplayObject2.prototype.enableTempParent = function() {
      var myParent = this.parent;
      this.parent = this._tempDisplayObjectParent;
      return myParent;
    };
    DisplayObject2.prototype.disableTempParent = function(cacheParent) {
      this.parent = cacheParent;
    };
    Object.defineProperty(DisplayObject2.prototype, "x", {
      get: function() {
        return this.position.x;
      },
      set: function(value) {
        this.transform.position.x = value;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(DisplayObject2.prototype, "y", {
      get: function() {
        return this.position.y;
      },
      set: function(value) {
        this.transform.position.y = value;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(DisplayObject2.prototype, "worldTransform", {
      get: function() {
        return this.transform.worldTransform;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(DisplayObject2.prototype, "localTransform", {
      get: function() {
        return this.transform.localTransform;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(DisplayObject2.prototype, "position", {
      get: function() {
        return this.transform.position;
      },
      set: function(value) {
        this.transform.position.copyFrom(value);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(DisplayObject2.prototype, "scale", {
      get: function() {
        return this.transform.scale;
      },
      set: function(value) {
        this.transform.scale.copyFrom(value);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(DisplayObject2.prototype, "pivot", {
      get: function() {
        return this.transform.pivot;
      },
      set: function(value) {
        this.transform.pivot.copyFrom(value);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(DisplayObject2.prototype, "skew", {
      get: function() {
        return this.transform.skew;
      },
      set: function(value) {
        this.transform.skew.copyFrom(value);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(DisplayObject2.prototype, "rotation", {
      get: function() {
        return this.transform.rotation;
      },
      set: function(value) {
        this.transform.rotation = value;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(DisplayObject2.prototype, "angle", {
      get: function() {
        return this.transform.rotation * math.RAD_TO_DEG;
      },
      set: function(value) {
        this.transform.rotation = value * math.DEG_TO_RAD;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(DisplayObject2.prototype, "zIndex", {
      get: function() {
        return this._zIndex;
      },
      set: function(value) {
        this._zIndex = value;
        if (this.parent) {
          this.parent.sortDirty = true;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(DisplayObject2.prototype, "worldVisible", {
      get: function() {
        var item = this;
        do {
          if (!item.visible) {
            return false;
          }
          item = item.parent;
        } while (item);
        return true;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(DisplayObject2.prototype, "mask", {
      get: function() {
        return this._mask;
      },
      set: function(value) {
        if (this._mask) {
          var maskObject = this._mask.maskObject || this._mask;
          maskObject.renderable = true;
          maskObject.isMask = false;
        }
        this._mask = value;
        if (this._mask) {
          var maskObject = this._mask.maskObject || this._mask;
          maskObject.renderable = false;
          maskObject.isMask = true;
        }
      },
      enumerable: false,
      configurable: true
    });
    return DisplayObject2;
  }(utils.EventEmitter);
  var TemporaryDisplayObject = function(_super) {
    __extends(TemporaryDisplayObject2, _super);
    function TemporaryDisplayObject2() {
      var _this = _super !== null && _super.apply(this, arguments) || this;
      _this.sortDirty = null;
      return _this;
    }
    return TemporaryDisplayObject2;
  }(DisplayObject);
  DisplayObject.prototype.displayObjectUpdateTransform = DisplayObject.prototype.updateTransform;
  function sortChildren(a, b) {
    if (a.zIndex === b.zIndex) {
      return a._lastSortedIndex - b._lastSortedIndex;
    }
    return a.zIndex - b.zIndex;
  }
  var Container = function(_super) {
    __extends(Container2, _super);
    function Container2() {
      var _this = _super.call(this) || this;
      _this.children = [];
      _this.sortableChildren = settings.settings.SORTABLE_CHILDREN;
      _this.sortDirty = false;
      return _this;
    }
    Container2.prototype.onChildrenChange = function(_length) {
    };
    Container2.prototype.addChild = function() {
      var arguments$1 = arguments;
      var children = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        children[_i] = arguments$1[_i];
      }
      if (children.length > 1) {
        for (var i = 0; i < children.length; i++) {
          this.addChild(children[i]);
        }
      } else {
        var child = children[0];
        if (child.parent) {
          child.parent.removeChild(child);
        }
        child.parent = this;
        this.sortDirty = true;
        child.transform._parentID = -1;
        this.children.push(child);
        this._boundsID++;
        this.onChildrenChange(this.children.length - 1);
        this.emit("childAdded", child, this, this.children.length - 1);
        child.emit("added", this);
      }
      return children[0];
    };
    Container2.prototype.addChildAt = function(child, index) {
      if (index < 0 || index > this.children.length) {
        throw new Error(child + "addChildAt: The index " + index + " supplied is out of bounds " + this.children.length);
      }
      if (child.parent) {
        child.parent.removeChild(child);
      }
      child.parent = this;
      this.sortDirty = true;
      child.transform._parentID = -1;
      this.children.splice(index, 0, child);
      this._boundsID++;
      this.onChildrenChange(index);
      child.emit("added", this);
      this.emit("childAdded", child, this, index);
      return child;
    };
    Container2.prototype.swapChildren = function(child, child2) {
      if (child === child2) {
        return;
      }
      var index1 = this.getChildIndex(child);
      var index2 = this.getChildIndex(child2);
      this.children[index1] = child2;
      this.children[index2] = child;
      this.onChildrenChange(index1 < index2 ? index1 : index2);
    };
    Container2.prototype.getChildIndex = function(child) {
      var index = this.children.indexOf(child);
      if (index === -1) {
        throw new Error("The supplied DisplayObject must be a child of the caller");
      }
      return index;
    };
    Container2.prototype.setChildIndex = function(child, index) {
      if (index < 0 || index >= this.children.length) {
        throw new Error("The index " + index + " supplied is out of bounds " + this.children.length);
      }
      var currentIndex = this.getChildIndex(child);
      utils.removeItems(this.children, currentIndex, 1);
      this.children.splice(index, 0, child);
      this.onChildrenChange(index);
    };
    Container2.prototype.getChildAt = function(index) {
      if (index < 0 || index >= this.children.length) {
        throw new Error("getChildAt: Index (" + index + ") does not exist.");
      }
      return this.children[index];
    };
    Container2.prototype.removeChild = function() {
      var arguments$1 = arguments;
      var children = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        children[_i] = arguments$1[_i];
      }
      if (children.length > 1) {
        for (var i = 0; i < children.length; i++) {
          this.removeChild(children[i]);
        }
      } else {
        var child = children[0];
        var index = this.children.indexOf(child);
        if (index === -1) {
          return null;
        }
        child.parent = null;
        child.transform._parentID = -1;
        utils.removeItems(this.children, index, 1);
        this._boundsID++;
        this.onChildrenChange(index);
        child.emit("removed", this);
        this.emit("childRemoved", child, this, index);
      }
      return children[0];
    };
    Container2.prototype.removeChildAt = function(index) {
      var child = this.getChildAt(index);
      child.parent = null;
      child.transform._parentID = -1;
      utils.removeItems(this.children, index, 1);
      this._boundsID++;
      this.onChildrenChange(index);
      child.emit("removed", this);
      this.emit("childRemoved", child, this, index);
      return child;
    };
    Container2.prototype.removeChildren = function(beginIndex, endIndex) {
      if (beginIndex === void 0) {
        beginIndex = 0;
      }
      if (endIndex === void 0) {
        endIndex = this.children.length;
      }
      var begin = beginIndex;
      var end = endIndex;
      var range = end - begin;
      var removed;
      if (range > 0 && range <= end) {
        removed = this.children.splice(begin, range);
        for (var i = 0; i < removed.length; ++i) {
          removed[i].parent = null;
          if (removed[i].transform) {
            removed[i].transform._parentID = -1;
          }
        }
        this._boundsID++;
        this.onChildrenChange(beginIndex);
        for (var i = 0; i < removed.length; ++i) {
          removed[i].emit("removed", this);
          this.emit("childRemoved", removed[i], this, i);
        }
        return removed;
      } else if (range === 0 && this.children.length === 0) {
        return [];
      }
      throw new RangeError("removeChildren: numeric values are outside the acceptable range.");
    };
    Container2.prototype.sortChildren = function() {
      var sortRequired = false;
      for (var i = 0, j = this.children.length; i < j; ++i) {
        var child = this.children[i];
        child._lastSortedIndex = i;
        if (!sortRequired && child.zIndex !== 0) {
          sortRequired = true;
        }
      }
      if (sortRequired && this.children.length > 1) {
        this.children.sort(sortChildren);
      }
      this.sortDirty = false;
    };
    Container2.prototype.updateTransform = function() {
      if (this.sortableChildren && this.sortDirty) {
        this.sortChildren();
      }
      this._boundsID++;
      this.transform.updateTransform(this.parent.transform);
      this.worldAlpha = this.alpha * this.parent.worldAlpha;
      for (var i = 0, j = this.children.length; i < j; ++i) {
        var child = this.children[i];
        if (child.visible) {
          child.updateTransform();
        }
      }
    };
    Container2.prototype.calculateBounds = function() {
      this._bounds.clear();
      this._calculateBounds();
      for (var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
        if (!child.visible || !child.renderable) {
          continue;
        }
        child.calculateBounds();
        if (child._mask) {
          var maskObject = child._mask.maskObject || child._mask;
          maskObject.calculateBounds();
          this._bounds.addBoundsMask(child._bounds, maskObject._bounds);
        } else if (child.filterArea) {
          this._bounds.addBoundsArea(child._bounds, child.filterArea);
        } else {
          this._bounds.addBounds(child._bounds);
        }
      }
      this._bounds.updateID = this._boundsID;
    };
    Container2.prototype.getLocalBounds = function(rect, skipChildrenUpdate) {
      if (skipChildrenUpdate === void 0) {
        skipChildrenUpdate = false;
      }
      var result = _super.prototype.getLocalBounds.call(this, rect);
      if (!skipChildrenUpdate) {
        for (var i = 0, j = this.children.length; i < j; ++i) {
          var child = this.children[i];
          if (child.visible) {
            child.updateTransform();
          }
        }
      }
      return result;
    };
    Container2.prototype._calculateBounds = function() {
    };
    Container2.prototype.render = function(renderer) {
      if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
        return;
      }
      if (this._mask || this.filters && this.filters.length) {
        this.renderAdvanced(renderer);
      } else {
        this._render(renderer);
        for (var i = 0, j = this.children.length; i < j; ++i) {
          this.children[i].render(renderer);
        }
      }
    };
    Container2.prototype.renderAdvanced = function(renderer) {
      renderer.batch.flush();
      var filters = this.filters;
      var mask = this._mask;
      if (filters) {
        if (!this._enabledFilters) {
          this._enabledFilters = [];
        }
        this._enabledFilters.length = 0;
        for (var i = 0; i < filters.length; i++) {
          if (filters[i].enabled) {
            this._enabledFilters.push(filters[i]);
          }
        }
        if (this._enabledFilters.length) {
          renderer.filter.push(this, this._enabledFilters);
        }
      }
      if (mask) {
        renderer.mask.push(this, this._mask);
      }
      this._render(renderer);
      for (var i = 0, j = this.children.length; i < j; i++) {
        this.children[i].render(renderer);
      }
      renderer.batch.flush();
      if (mask) {
        renderer.mask.pop(this);
      }
      if (filters && this._enabledFilters && this._enabledFilters.length) {
        renderer.filter.pop();
      }
    };
    Container2.prototype._render = function(_renderer) {
    };
    Container2.prototype.destroy = function(options) {
      _super.prototype.destroy.call(this);
      this.sortDirty = false;
      var destroyChildren = typeof options === "boolean" ? options : options && options.children;
      var oldChildren = this.removeChildren(0, this.children.length);
      if (destroyChildren) {
        for (var i = 0; i < oldChildren.length; ++i) {
          oldChildren[i].destroy(options);
        }
      }
    };
    Object.defineProperty(Container2.prototype, "width", {
      get: function() {
        return this.scale.x * this.getLocalBounds().width;
      },
      set: function(value) {
        var width = this.getLocalBounds().width;
        if (width !== 0) {
          this.scale.x = value / width;
        } else {
          this.scale.x = 1;
        }
        this._width = value;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Container2.prototype, "height", {
      get: function() {
        return this.scale.y * this.getLocalBounds().height;
      },
      set: function(value) {
        var height = this.getLocalBounds().height;
        if (height !== 0) {
          this.scale.y = value / height;
        } else {
          this.scale.y = 1;
        }
        this._height = value;
      },
      enumerable: false,
      configurable: true
    });
    return Container2;
  }(DisplayObject);
  Container.prototype.containerUpdateTransform = Container.prototype.updateTransform;
  exports2.Bounds = Bounds;
  exports2.Container = Container;
  exports2.DisplayObject = DisplayObject;
  exports2.TemporaryDisplayObject = TemporaryDisplayObject;
});

// node_modules/@pixi/accessibility/lib/accessibility.js
var require_accessibility = __commonJS((exports2) => {
  /*!
   * @pixi/accessibility - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/accessibility is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var display = require_display();
  var utils = require_utils();
  var accessibleTarget = {
    accessible: false,
    accessibleTitle: null,
    accessibleHint: null,
    tabIndex: 0,
    _accessibleActive: false,
    _accessibleDiv: null,
    accessibleType: "button",
    accessiblePointerEvents: "auto",
    accessibleChildren: true,
    renderId: -1
  };
  display.DisplayObject.mixin(accessibleTarget);
  var KEY_CODE_TAB = 9;
  var DIV_TOUCH_SIZE = 100;
  var DIV_TOUCH_POS_X = 0;
  var DIV_TOUCH_POS_Y = 0;
  var DIV_TOUCH_ZINDEX = 2;
  var DIV_HOOK_SIZE = 1;
  var DIV_HOOK_POS_X = -1e3;
  var DIV_HOOK_POS_Y = -1e3;
  var DIV_HOOK_ZINDEX = 2;
  var AccessibilityManager = function() {
    function AccessibilityManager2(renderer) {
      this._hookDiv = null;
      if (utils.isMobile.tablet || utils.isMobile.phone) {
        this.createTouchHook();
      }
      var div = document.createElement("div");
      div.style.width = DIV_TOUCH_SIZE + "px";
      div.style.height = DIV_TOUCH_SIZE + "px";
      div.style.position = "absolute";
      div.style.top = DIV_TOUCH_POS_X + "px";
      div.style.left = DIV_TOUCH_POS_Y + "px";
      div.style.zIndex = DIV_TOUCH_ZINDEX.toString();
      this.div = div;
      this.pool = [];
      this.renderId = 0;
      this.debug = false;
      this.renderer = renderer;
      this.children = [];
      this._onKeyDown = this._onKeyDown.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);
      this._isActive = false;
      this._isMobileAccessibility = false;
      this.androidUpdateCount = 0;
      this.androidUpdateFrequency = 500;
      window.addEventListener("keydown", this._onKeyDown, false);
    }
    Object.defineProperty(AccessibilityManager2.prototype, "isActive", {
      get: function() {
        return this._isActive;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(AccessibilityManager2.prototype, "isMobileAccessibility", {
      get: function() {
        return this._isMobileAccessibility;
      },
      enumerable: false,
      configurable: true
    });
    AccessibilityManager2.prototype.createTouchHook = function() {
      var _this = this;
      var hookDiv = document.createElement("button");
      hookDiv.style.width = DIV_HOOK_SIZE + "px";
      hookDiv.style.height = DIV_HOOK_SIZE + "px";
      hookDiv.style.position = "absolute";
      hookDiv.style.top = DIV_HOOK_POS_X + "px";
      hookDiv.style.left = DIV_HOOK_POS_Y + "px";
      hookDiv.style.zIndex = DIV_HOOK_ZINDEX.toString();
      hookDiv.style.backgroundColor = "#FF0000";
      hookDiv.title = "select to enable accessability for this content";
      hookDiv.addEventListener("focus", function() {
        _this._isMobileAccessibility = true;
        _this.activate();
        _this.destroyTouchHook();
      });
      document.body.appendChild(hookDiv);
      this._hookDiv = hookDiv;
    };
    AccessibilityManager2.prototype.destroyTouchHook = function() {
      if (!this._hookDiv) {
        return;
      }
      document.body.removeChild(this._hookDiv);
      this._hookDiv = null;
    };
    AccessibilityManager2.prototype.activate = function() {
      if (this._isActive) {
        return;
      }
      this._isActive = true;
      window.document.addEventListener("mousemove", this._onMouseMove, true);
      window.removeEventListener("keydown", this._onKeyDown, false);
      this.renderer.on("postrender", this.update, this);
      if (this.renderer.view.parentNode) {
        this.renderer.view.parentNode.appendChild(this.div);
      }
    };
    AccessibilityManager2.prototype.deactivate = function() {
      if (!this._isActive || this._isMobileAccessibility) {
        return;
      }
      this._isActive = false;
      window.document.removeEventListener("mousemove", this._onMouseMove, true);
      window.addEventListener("keydown", this._onKeyDown, false);
      this.renderer.off("postrender", this.update);
      if (this.div.parentNode) {
        this.div.parentNode.removeChild(this.div);
      }
    };
    AccessibilityManager2.prototype.updateAccessibleObjects = function(displayObject) {
      if (!displayObject.visible || !displayObject.accessibleChildren) {
        return;
      }
      if (displayObject.accessible && displayObject.interactive) {
        if (!displayObject._accessibleActive) {
          this.addChild(displayObject);
        }
        displayObject.renderId = this.renderId;
      }
      var children = displayObject.children;
      for (var i = 0; i < children.length; i++) {
        this.updateAccessibleObjects(children[i]);
      }
    };
    AccessibilityManager2.prototype.update = function() {
      var now = performance.now();
      if (utils.isMobile.android.device && now < this.androidUpdateCount) {
        return;
      }
      this.androidUpdateCount = now + this.androidUpdateFrequency;
      if (!this.renderer.renderingToScreen) {
        return;
      }
      if (this.renderer._lastObjectRendered) {
        this.updateAccessibleObjects(this.renderer._lastObjectRendered);
      }
      var rect = this.renderer.view.getBoundingClientRect();
      var resolution = this.renderer.resolution;
      var sx = rect.width / this.renderer.width * resolution;
      var sy = rect.height / this.renderer.height * resolution;
      var div = this.div;
      div.style.left = rect.left + "px";
      div.style.top = rect.top + "px";
      div.style.width = this.renderer.width + "px";
      div.style.height = this.renderer.height + "px";
      for (var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
        if (child.renderId !== this.renderId) {
          child._accessibleActive = false;
          utils.removeItems(this.children, i, 1);
          this.div.removeChild(child._accessibleDiv);
          this.pool.push(child._accessibleDiv);
          child._accessibleDiv = null;
          i--;
        } else {
          div = child._accessibleDiv;
          var hitArea = child.hitArea;
          var wt = child.worldTransform;
          if (child.hitArea) {
            div.style.left = (wt.tx + hitArea.x * wt.a) * sx + "px";
            div.style.top = (wt.ty + hitArea.y * wt.d) * sy + "px";
            div.style.width = hitArea.width * wt.a * sx + "px";
            div.style.height = hitArea.height * wt.d * sy + "px";
          } else {
            hitArea = child.getBounds();
            this.capHitArea(hitArea);
            div.style.left = hitArea.x * sx + "px";
            div.style.top = hitArea.y * sy + "px";
            div.style.width = hitArea.width * sx + "px";
            div.style.height = hitArea.height * sy + "px";
            if (div.title !== child.accessibleTitle && child.accessibleTitle !== null) {
              div.title = child.accessibleTitle;
            }
            if (div.getAttribute("aria-label") !== child.accessibleHint && child.accessibleHint !== null) {
              div.setAttribute("aria-label", child.accessibleHint);
            }
          }
          if (child.accessibleTitle !== div.title || child.tabIndex !== div.tabIndex) {
            div.title = child.accessibleTitle;
            div.tabIndex = child.tabIndex;
            if (this.debug) {
              this.updateDebugHTML(div);
            }
          }
        }
      }
      this.renderId++;
    };
    AccessibilityManager2.prototype.updateDebugHTML = function(div) {
      div.innerHTML = "type: " + div.type + "</br> title : " + div.title + "</br> tabIndex: " + div.tabIndex;
    };
    AccessibilityManager2.prototype.capHitArea = function(hitArea) {
      if (hitArea.x < 0) {
        hitArea.width += hitArea.x;
        hitArea.x = 0;
      }
      if (hitArea.y < 0) {
        hitArea.height += hitArea.y;
        hitArea.y = 0;
      }
      if (hitArea.x + hitArea.width > this.renderer.width) {
        hitArea.width = this.renderer.width - hitArea.x;
      }
      if (hitArea.y + hitArea.height > this.renderer.height) {
        hitArea.height = this.renderer.height - hitArea.y;
      }
    };
    AccessibilityManager2.prototype.addChild = function(displayObject) {
      var div = this.pool.pop();
      if (!div) {
        div = document.createElement("button");
        div.style.width = DIV_TOUCH_SIZE + "px";
        div.style.height = DIV_TOUCH_SIZE + "px";
        div.style.backgroundColor = this.debug ? "rgba(255,255,255,0.5)" : "transparent";
        div.style.position = "absolute";
        div.style.zIndex = DIV_TOUCH_ZINDEX.toString();
        div.style.borderStyle = "none";
        if (navigator.userAgent.toLowerCase().indexOf("chrome") > -1) {
          div.setAttribute("aria-live", "off");
        } else {
          div.setAttribute("aria-live", "polite");
        }
        if (navigator.userAgent.match(/rv:.*Gecko\//)) {
          div.setAttribute("aria-relevant", "additions");
        } else {
          div.setAttribute("aria-relevant", "text");
        }
        div.addEventListener("click", this._onClick.bind(this));
        div.addEventListener("focus", this._onFocus.bind(this));
        div.addEventListener("focusout", this._onFocusOut.bind(this));
      }
      div.style.pointerEvents = displayObject.accessiblePointerEvents;
      div.type = displayObject.accessibleType;
      if (displayObject.accessibleTitle && displayObject.accessibleTitle !== null) {
        div.title = displayObject.accessibleTitle;
      } else if (!displayObject.accessibleHint || displayObject.accessibleHint === null) {
        div.title = "displayObject " + displayObject.tabIndex;
      }
      if (displayObject.accessibleHint && displayObject.accessibleHint !== null) {
        div.setAttribute("aria-label", displayObject.accessibleHint);
      }
      if (this.debug) {
        this.updateDebugHTML(div);
      }
      displayObject._accessibleActive = true;
      displayObject._accessibleDiv = div;
      div.displayObject = displayObject;
      this.children.push(displayObject);
      this.div.appendChild(displayObject._accessibleDiv);
      displayObject._accessibleDiv.tabIndex = displayObject.tabIndex;
    };
    AccessibilityManager2.prototype._onClick = function(e) {
      var interactionManager = this.renderer.plugins.interaction;
      interactionManager.dispatchEvent(e.target.displayObject, "click", interactionManager.eventData);
      interactionManager.dispatchEvent(e.target.displayObject, "pointertap", interactionManager.eventData);
      interactionManager.dispatchEvent(e.target.displayObject, "tap", interactionManager.eventData);
    };
    AccessibilityManager2.prototype._onFocus = function(e) {
      if (!e.target.getAttribute("aria-live")) {
        e.target.setAttribute("aria-live", "assertive");
      }
      var interactionManager = this.renderer.plugins.interaction;
      interactionManager.dispatchEvent(e.target.displayObject, "mouseover", interactionManager.eventData);
    };
    AccessibilityManager2.prototype._onFocusOut = function(e) {
      if (!e.target.getAttribute("aria-live")) {
        e.target.setAttribute("aria-live", "polite");
      }
      var interactionManager = this.renderer.plugins.interaction;
      interactionManager.dispatchEvent(e.target.displayObject, "mouseout", interactionManager.eventData);
    };
    AccessibilityManager2.prototype._onKeyDown = function(e) {
      if (e.keyCode !== KEY_CODE_TAB) {
        return;
      }
      this.activate();
    };
    AccessibilityManager2.prototype._onMouseMove = function(e) {
      if (e.movementX === 0 && e.movementY === 0) {
        return;
      }
      this.deactivate();
    };
    AccessibilityManager2.prototype.destroy = function() {
      this.destroyTouchHook();
      this.div = null;
      window.document.removeEventListener("mousemove", this._onMouseMove, true);
      window.removeEventListener("keydown", this._onKeyDown);
      this.pool = null;
      this.children = null;
      this.renderer = null;
    };
    return AccessibilityManager2;
  }();
  exports2.AccessibilityManager = AccessibilityManager;
  exports2.accessibleTarget = accessibleTarget;
});

// node_modules/@pixi/ticker/lib/ticker.js
var require_ticker = __commonJS((exports2) => {
  /*!
   * @pixi/ticker - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/ticker is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var settings = require_settings();
  settings.settings.TARGET_FPMS = 0.06;
  (function(UPDATE_PRIORITY) {
    UPDATE_PRIORITY[UPDATE_PRIORITY["INTERACTION"] = 50] = "INTERACTION";
    UPDATE_PRIORITY[UPDATE_PRIORITY["HIGH"] = 25] = "HIGH";
    UPDATE_PRIORITY[UPDATE_PRIORITY["NORMAL"] = 0] = "NORMAL";
    UPDATE_PRIORITY[UPDATE_PRIORITY["LOW"] = -25] = "LOW";
    UPDATE_PRIORITY[UPDATE_PRIORITY["UTILITY"] = -50] = "UTILITY";
  })(exports2.UPDATE_PRIORITY || (exports2.UPDATE_PRIORITY = {}));
  var TickerListener = function() {
    function TickerListener2(fn, context, priority, once) {
      if (context === void 0) {
        context = null;
      }
      if (priority === void 0) {
        priority = 0;
      }
      if (once === void 0) {
        once = false;
      }
      this.fn = fn;
      this.context = context;
      this.priority = priority;
      this.once = once;
      this.next = null;
      this.previous = null;
      this._destroyed = false;
    }
    TickerListener2.prototype.match = function(fn, context) {
      if (context === void 0) {
        context = null;
      }
      return this.fn === fn && this.context === context;
    };
    TickerListener2.prototype.emit = function(deltaTime) {
      if (this.fn) {
        if (this.context) {
          this.fn.call(this.context, deltaTime);
        } else {
          this.fn(deltaTime);
        }
      }
      var redirect = this.next;
      if (this.once) {
        this.destroy(true);
      }
      if (this._destroyed) {
        this.next = null;
      }
      return redirect;
    };
    TickerListener2.prototype.connect = function(previous) {
      this.previous = previous;
      if (previous.next) {
        previous.next.previous = this;
      }
      this.next = previous.next;
      previous.next = this;
    };
    TickerListener2.prototype.destroy = function(hard) {
      if (hard === void 0) {
        hard = false;
      }
      this._destroyed = true;
      this.fn = null;
      this.context = null;
      if (this.previous) {
        this.previous.next = this.next;
      }
      if (this.next) {
        this.next.previous = this.previous;
      }
      var redirect = this.next;
      this.next = hard ? null : redirect;
      this.previous = null;
      return redirect;
    };
    return TickerListener2;
  }();
  var Ticker = function() {
    function Ticker2() {
      var _this = this;
      this._head = new TickerListener(null, null, Infinity);
      this._requestId = null;
      this._maxElapsedMS = 100;
      this._minElapsedMS = 0;
      this.autoStart = false;
      this.deltaTime = 1;
      this.deltaMS = 1 / settings.settings.TARGET_FPMS;
      this.elapsedMS = 1 / settings.settings.TARGET_FPMS;
      this.lastTime = -1;
      this.speed = 1;
      this.started = false;
      this._protected = false;
      this._lastFrame = -1;
      this._tick = function(time) {
        _this._requestId = null;
        if (_this.started) {
          _this.update(time);
          if (_this.started && _this._requestId === null && _this._head.next) {
            _this._requestId = requestAnimationFrame(_this._tick);
          }
        }
      };
    }
    Ticker2.prototype._requestIfNeeded = function() {
      if (this._requestId === null && this._head.next) {
        this.lastTime = performance.now();
        this._lastFrame = this.lastTime;
        this._requestId = requestAnimationFrame(this._tick);
      }
    };
    Ticker2.prototype._cancelIfNeeded = function() {
      if (this._requestId !== null) {
        cancelAnimationFrame(this._requestId);
        this._requestId = null;
      }
    };
    Ticker2.prototype._startIfPossible = function() {
      if (this.started) {
        this._requestIfNeeded();
      } else if (this.autoStart) {
        this.start();
      }
    };
    Ticker2.prototype.add = function(fn, context, priority) {
      if (priority === void 0) {
        priority = exports2.UPDATE_PRIORITY.NORMAL;
      }
      return this._addListener(new TickerListener(fn, context, priority));
    };
    Ticker2.prototype.addOnce = function(fn, context, priority) {
      if (priority === void 0) {
        priority = exports2.UPDATE_PRIORITY.NORMAL;
      }
      return this._addListener(new TickerListener(fn, context, priority, true));
    };
    Ticker2.prototype._addListener = function(listener) {
      var current = this._head.next;
      var previous = this._head;
      if (!current) {
        listener.connect(previous);
      } else {
        while (current) {
          if (listener.priority > current.priority) {
            listener.connect(previous);
            break;
          }
          previous = current;
          current = current.next;
        }
        if (!listener.previous) {
          listener.connect(previous);
        }
      }
      this._startIfPossible();
      return this;
    };
    Ticker2.prototype.remove = function(fn, context) {
      var listener = this._head.next;
      while (listener) {
        if (listener.match(fn, context)) {
          listener = listener.destroy();
        } else {
          listener = listener.next;
        }
      }
      if (!this._head.next) {
        this._cancelIfNeeded();
      }
      return this;
    };
    Object.defineProperty(Ticker2.prototype, "count", {
      get: function() {
        if (!this._head) {
          return 0;
        }
        var count = 0;
        var current = this._head;
        while (current = current.next) {
          count++;
        }
        return count;
      },
      enumerable: false,
      configurable: true
    });
    Ticker2.prototype.start = function() {
      if (!this.started) {
        this.started = true;
        this._requestIfNeeded();
      }
    };
    Ticker2.prototype.stop = function() {
      if (this.started) {
        this.started = false;
        this._cancelIfNeeded();
      }
    };
    Ticker2.prototype.destroy = function() {
      if (!this._protected) {
        this.stop();
        var listener = this._head.next;
        while (listener) {
          listener = listener.destroy(true);
        }
        this._head.destroy();
        this._head = null;
      }
    };
    Ticker2.prototype.update = function(currentTime) {
      if (currentTime === void 0) {
        currentTime = performance.now();
      }
      var elapsedMS;
      if (currentTime > this.lastTime) {
        elapsedMS = this.elapsedMS = currentTime - this.lastTime;
        if (elapsedMS > this._maxElapsedMS) {
          elapsedMS = this._maxElapsedMS;
        }
        elapsedMS *= this.speed;
        if (this._minElapsedMS) {
          var delta = currentTime - this._lastFrame | 0;
          if (delta < this._minElapsedMS) {
            return;
          }
          this._lastFrame = currentTime - delta % this._minElapsedMS;
        }
        this.deltaMS = elapsedMS;
        this.deltaTime = this.deltaMS * settings.settings.TARGET_FPMS;
        var head = this._head;
        var listener = head.next;
        while (listener) {
          listener = listener.emit(this.deltaTime);
        }
        if (!head.next) {
          this._cancelIfNeeded();
        }
      } else {
        this.deltaTime = this.deltaMS = this.elapsedMS = 0;
      }
      this.lastTime = currentTime;
    };
    Object.defineProperty(Ticker2.prototype, "FPS", {
      get: function() {
        return 1e3 / this.elapsedMS;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Ticker2.prototype, "minFPS", {
      get: function() {
        return 1e3 / this._maxElapsedMS;
      },
      set: function(fps) {
        var minFPS = Math.min(this.maxFPS, fps);
        var minFPMS = Math.min(Math.max(0, minFPS) / 1e3, settings.settings.TARGET_FPMS);
        this._maxElapsedMS = 1 / minFPMS;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Ticker2.prototype, "maxFPS", {
      get: function() {
        if (this._minElapsedMS) {
          return Math.round(1e3 / this._minElapsedMS);
        }
        return 0;
      },
      set: function(fps) {
        if (fps === 0) {
          this._minElapsedMS = 0;
        } else {
          var maxFPS = Math.max(this.minFPS, fps);
          this._minElapsedMS = 1 / (maxFPS / 1e3);
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Ticker2, "shared", {
      get: function() {
        if (!Ticker2._shared) {
          var shared = Ticker2._shared = new Ticker2();
          shared.autoStart = true;
          shared._protected = true;
        }
        return Ticker2._shared;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Ticker2, "system", {
      get: function() {
        if (!Ticker2._system) {
          var system = Ticker2._system = new Ticker2();
          system.autoStart = true;
          system._protected = true;
        }
        return Ticker2._system;
      },
      enumerable: false,
      configurable: true
    });
    return Ticker2;
  }();
  var TickerPlugin = function() {
    function TickerPlugin2() {
    }
    TickerPlugin2.init = function(options) {
      var _this = this;
      options = Object.assign({
        autoStart: true,
        sharedTicker: false
      }, options);
      Object.defineProperty(this, "ticker", {
        set: function(ticker) {
          if (this._ticker) {
            this._ticker.remove(this.render, this);
          }
          this._ticker = ticker;
          if (ticker) {
            ticker.add(this.render, this, exports2.UPDATE_PRIORITY.LOW);
          }
        },
        get: function() {
          return this._ticker;
        }
      });
      this.stop = function() {
        _this._ticker.stop();
      };
      this.start = function() {
        _this._ticker.start();
      };
      this._ticker = null;
      this.ticker = options.sharedTicker ? Ticker.shared : new Ticker();
      if (options.autoStart) {
        this.start();
      }
    };
    TickerPlugin2.destroy = function() {
      if (this._ticker) {
        var oldTicker = this._ticker;
        this.ticker = null;
        oldTicker.destroy();
      }
    };
    return TickerPlugin2;
  }();
  exports2.Ticker = Ticker;
  exports2.TickerPlugin = TickerPlugin;
});

// node_modules/@pixi/interaction/lib/interaction.js
var require_interaction = __commonJS((exports2) => {
  /*!
   * @pixi/interaction - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/interaction is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var math = require_math();
  var ticker = require_ticker();
  var display = require_display();
  var utils = require_utils();
  var InteractionData = function() {
    function InteractionData2() {
      this.pressure = 0;
      this.rotationAngle = 0;
      this.twist = 0;
      this.tangentialPressure = 0;
      this.global = new math.Point();
      this.target = null;
      this.originalEvent = null;
      this.identifier = null;
      this.isPrimary = false;
      this.button = 0;
      this.buttons = 0;
      this.width = 0;
      this.height = 0;
      this.tiltX = 0;
      this.tiltY = 0;
      this.pointerType = null;
      this.pressure = 0;
      this.rotationAngle = 0;
      this.twist = 0;
      this.tangentialPressure = 0;
    }
    Object.defineProperty(InteractionData2.prototype, "pointerId", {
      get: function() {
        return this.identifier;
      },
      enumerable: false,
      configurable: true
    });
    InteractionData2.prototype.getLocalPosition = function(displayObject, point, globalPos) {
      return displayObject.worldTransform.applyInverse(globalPos || this.global, point);
    };
    InteractionData2.prototype.copyEvent = function(event) {
      if ("isPrimary" in event && event.isPrimary) {
        this.isPrimary = true;
      }
      this.button = "button" in event && event.button;
      var buttons = "buttons" in event && event.buttons;
      this.buttons = Number.isInteger(buttons) ? buttons : "which" in event && event.which;
      this.width = "width" in event && event.width;
      this.height = "height" in event && event.height;
      this.tiltX = "tiltX" in event && event.tiltX;
      this.tiltY = "tiltY" in event && event.tiltY;
      this.pointerType = "pointerType" in event && event.pointerType;
      this.pressure = "pressure" in event && event.pressure;
      this.rotationAngle = "rotationAngle" in event && event.rotationAngle;
      this.twist = "twist" in event && event.twist || 0;
      this.tangentialPressure = "tangentialPressure" in event && event.tangentialPressure || 0;
    };
    InteractionData2.prototype.reset = function() {
      this.isPrimary = false;
    };
    return InteractionData2;
  }();
  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0
  
  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.
  
  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || {__proto__: []} instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) {
        if (b2.hasOwnProperty(p)) {
          d2[p] = b2[p];
        }
      }
    };
    return extendStatics(d, b);
  };
  function __extends(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  var InteractionEvent = function() {
    function InteractionEvent2() {
      this.stopped = false;
      this.stopsPropagatingAt = null;
      this.stopPropagationHint = false;
      this.target = null;
      this.currentTarget = null;
      this.type = null;
      this.data = null;
    }
    InteractionEvent2.prototype.stopPropagation = function() {
      this.stopped = true;
      this.stopPropagationHint = true;
      this.stopsPropagatingAt = this.currentTarget;
    };
    InteractionEvent2.prototype.reset = function() {
      this.stopped = false;
      this.stopsPropagatingAt = null;
      this.stopPropagationHint = false;
      this.currentTarget = null;
      this.target = null;
    };
    return InteractionEvent2;
  }();
  var InteractionTrackingData = function() {
    function InteractionTrackingData2(pointerId) {
      this._pointerId = pointerId;
      this._flags = InteractionTrackingData2.FLAGS.NONE;
    }
    InteractionTrackingData2.prototype._doSet = function(flag, yn) {
      if (yn) {
        this._flags = this._flags | flag;
      } else {
        this._flags = this._flags & ~flag;
      }
    };
    Object.defineProperty(InteractionTrackingData2.prototype, "pointerId", {
      get: function() {
        return this._pointerId;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(InteractionTrackingData2.prototype, "flags", {
      get: function() {
        return this._flags;
      },
      set: function(flags) {
        this._flags = flags;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(InteractionTrackingData2.prototype, "none", {
      get: function() {
        return this._flags === InteractionTrackingData2.FLAGS.NONE;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(InteractionTrackingData2.prototype, "over", {
      get: function() {
        return (this._flags & InteractionTrackingData2.FLAGS.OVER) !== 0;
      },
      set: function(yn) {
        this._doSet(InteractionTrackingData2.FLAGS.OVER, yn);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(InteractionTrackingData2.prototype, "rightDown", {
      get: function() {
        return (this._flags & InteractionTrackingData2.FLAGS.RIGHT_DOWN) !== 0;
      },
      set: function(yn) {
        this._doSet(InteractionTrackingData2.FLAGS.RIGHT_DOWN, yn);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(InteractionTrackingData2.prototype, "leftDown", {
      get: function() {
        return (this._flags & InteractionTrackingData2.FLAGS.LEFT_DOWN) !== 0;
      },
      set: function(yn) {
        this._doSet(InteractionTrackingData2.FLAGS.LEFT_DOWN, yn);
      },
      enumerable: false,
      configurable: true
    });
    InteractionTrackingData2.FLAGS = Object.freeze({
      NONE: 0,
      OVER: 1 << 0,
      LEFT_DOWN: 1 << 1,
      RIGHT_DOWN: 1 << 2
    });
    return InteractionTrackingData2;
  }();
  var TreeSearch = function() {
    function TreeSearch2() {
      this._tempPoint = new math.Point();
    }
    TreeSearch2.prototype.recursiveFindHit = function(interactionEvent, displayObject, func, hitTest, interactive) {
      if (!displayObject || !displayObject.visible) {
        return false;
      }
      var point = interactionEvent.data.global;
      interactive = displayObject.interactive || interactive;
      var hit = false;
      var interactiveParent = interactive;
      var hitTestChildren = true;
      if (displayObject.hitArea) {
        if (hitTest) {
          displayObject.worldTransform.applyInverse(point, this._tempPoint);
          if (!displayObject.hitArea.contains(this._tempPoint.x, this._tempPoint.y)) {
            hitTest = false;
            hitTestChildren = false;
          } else {
            hit = true;
          }
        }
        interactiveParent = false;
      } else if (displayObject._mask) {
        if (hitTest) {
          if (!(displayObject._mask.containsPoint && displayObject._mask.containsPoint(point))) {
            hitTest = false;
          }
        }
      }
      if (hitTestChildren && displayObject.interactiveChildren && displayObject.children) {
        var children = displayObject.children;
        for (var i = children.length - 1; i >= 0; i--) {
          var child = children[i];
          var childHit = this.recursiveFindHit(interactionEvent, child, func, hitTest, interactiveParent);
          if (childHit) {
            if (!child.parent) {
              continue;
            }
            interactiveParent = false;
            if (childHit) {
              if (interactionEvent.target) {
                hitTest = false;
              }
              hit = true;
            }
          }
        }
      }
      if (interactive) {
        if (hitTest && !interactionEvent.target) {
          if (!displayObject.hitArea && displayObject.containsPoint) {
            if (displayObject.containsPoint(point)) {
              hit = true;
            }
          }
        }
        if (displayObject.interactive) {
          if (hit && !interactionEvent.target) {
            interactionEvent.target = displayObject;
          }
          if (func) {
            func(interactionEvent, displayObject, !!hit);
          }
        }
      }
      return hit;
    };
    TreeSearch2.prototype.findHit = function(interactionEvent, displayObject, func, hitTest) {
      this.recursiveFindHit(interactionEvent, displayObject, func, hitTest, false);
    };
    return TreeSearch2;
  }();
  var interactiveTarget = {
    interactive: false,
    interactiveChildren: true,
    hitArea: null,
    get buttonMode() {
      return this.cursor === "pointer";
    },
    set buttonMode(value) {
      if (value) {
        this.cursor = "pointer";
      } else if (this.cursor === "pointer") {
        this.cursor = null;
      }
    },
    cursor: null,
    get trackedPointers() {
      if (this._trackedPointers === void 0) {
        this._trackedPointers = {};
      }
      return this._trackedPointers;
    },
    _trackedPointers: void 0
  };
  display.DisplayObject.mixin(interactiveTarget);
  var MOUSE_POINTER_ID = 1;
  var hitTestEvent = {
    target: null,
    data: {
      global: null
    }
  };
  var InteractionManager = function(_super) {
    __extends(InteractionManager2, _super);
    function InteractionManager2(renderer, options) {
      var _this = _super.call(this) || this;
      options = options || {};
      _this.renderer = renderer;
      _this.autoPreventDefault = options.autoPreventDefault !== void 0 ? options.autoPreventDefault : true;
      _this.interactionFrequency = options.interactionFrequency || 10;
      _this.mouse = new InteractionData();
      _this.mouse.identifier = MOUSE_POINTER_ID;
      _this.mouse.global.set(-999999);
      _this.activeInteractionData = {};
      _this.activeInteractionData[MOUSE_POINTER_ID] = _this.mouse;
      _this.interactionDataPool = [];
      _this.eventData = new InteractionEvent();
      _this.interactionDOMElement = null;
      _this.moveWhenInside = false;
      _this.eventsAdded = false;
      _this.tickerAdded = false;
      _this.mouseOverRenderer = false;
      _this.supportsTouchEvents = "ontouchstart" in window;
      _this.supportsPointerEvents = !!window.PointerEvent;
      _this.onPointerUp = _this.onPointerUp.bind(_this);
      _this.processPointerUp = _this.processPointerUp.bind(_this);
      _this.onPointerCancel = _this.onPointerCancel.bind(_this);
      _this.processPointerCancel = _this.processPointerCancel.bind(_this);
      _this.onPointerDown = _this.onPointerDown.bind(_this);
      _this.processPointerDown = _this.processPointerDown.bind(_this);
      _this.onPointerMove = _this.onPointerMove.bind(_this);
      _this.processPointerMove = _this.processPointerMove.bind(_this);
      _this.onPointerOut = _this.onPointerOut.bind(_this);
      _this.processPointerOverOut = _this.processPointerOverOut.bind(_this);
      _this.onPointerOver = _this.onPointerOver.bind(_this);
      _this.cursorStyles = {
        default: "inherit",
        pointer: "pointer"
      };
      _this.currentCursorMode = null;
      _this.cursor = null;
      _this.resolution = 1;
      _this.delayedEvents = [];
      _this.search = new TreeSearch();
      _this._tempDisplayObject = new display.TemporaryDisplayObject();
      _this._useSystemTicker = options.useSystemTicker !== void 0 ? options.useSystemTicker : true;
      _this.setTargetElement(_this.renderer.view, _this.renderer.resolution);
      return _this;
    }
    Object.defineProperty(InteractionManager2.prototype, "useSystemTicker", {
      get: function() {
        return this._useSystemTicker;
      },
      set: function(useSystemTicker) {
        this._useSystemTicker = useSystemTicker;
        if (useSystemTicker) {
          this.addTickerListener();
        } else {
          this.removeTickerListener();
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(InteractionManager2.prototype, "lastObjectRendered", {
      get: function() {
        return this.renderer._lastObjectRendered || this._tempDisplayObject;
      },
      enumerable: false,
      configurable: true
    });
    InteractionManager2.prototype.hitTest = function(globalPoint, root) {
      hitTestEvent.target = null;
      hitTestEvent.data.global = globalPoint;
      if (!root) {
        root = this.lastObjectRendered;
      }
      this.processInteractive(hitTestEvent, root, null, true);
      return hitTestEvent.target;
    };
    InteractionManager2.prototype.setTargetElement = function(element, resolution) {
      if (resolution === void 0) {
        resolution = 1;
      }
      this.removeTickerListener();
      this.removeEvents();
      this.interactionDOMElement = element;
      this.resolution = resolution;
      this.addEvents();
      this.addTickerListener();
    };
    InteractionManager2.prototype.addTickerListener = function() {
      if (this.tickerAdded || !this.interactionDOMElement || !this._useSystemTicker) {
        return;
      }
      ticker.Ticker.system.add(this.tickerUpdate, this, ticker.UPDATE_PRIORITY.INTERACTION);
      this.tickerAdded = true;
    };
    InteractionManager2.prototype.removeTickerListener = function() {
      if (!this.tickerAdded) {
        return;
      }
      ticker.Ticker.system.remove(this.tickerUpdate, this);
      this.tickerAdded = false;
    };
    InteractionManager2.prototype.addEvents = function() {
      if (this.eventsAdded || !this.interactionDOMElement) {
        return;
      }
      var style = this.interactionDOMElement.style;
      if (window.navigator.msPointerEnabled) {
        style.msContentZooming = "none";
        style.msTouchAction = "none";
      } else if (this.supportsPointerEvents) {
        style.touchAction = "none";
      }
      if (this.supportsPointerEvents) {
        window.document.addEventListener("pointermove", this.onPointerMove, true);
        this.interactionDOMElement.addEventListener("pointerdown", this.onPointerDown, true);
        this.interactionDOMElement.addEventListener("pointerleave", this.onPointerOut, true);
        this.interactionDOMElement.addEventListener("pointerover", this.onPointerOver, true);
        window.addEventListener("pointercancel", this.onPointerCancel, true);
        window.addEventListener("pointerup", this.onPointerUp, true);
      } else {
        window.document.addEventListener("mousemove", this.onPointerMove, true);
        this.interactionDOMElement.addEventListener("mousedown", this.onPointerDown, true);
        this.interactionDOMElement.addEventListener("mouseout", this.onPointerOut, true);
        this.interactionDOMElement.addEventListener("mouseover", this.onPointerOver, true);
        window.addEventListener("mouseup", this.onPointerUp, true);
      }
      if (this.supportsTouchEvents) {
        this.interactionDOMElement.addEventListener("touchstart", this.onPointerDown, true);
        this.interactionDOMElement.addEventListener("touchcancel", this.onPointerCancel, true);
        this.interactionDOMElement.addEventListener("touchend", this.onPointerUp, true);
        this.interactionDOMElement.addEventListener("touchmove", this.onPointerMove, true);
      }
      this.eventsAdded = true;
    };
    InteractionManager2.prototype.removeEvents = function() {
      if (!this.eventsAdded || !this.interactionDOMElement) {
        return;
      }
      var style = this.interactionDOMElement.style;
      if (window.navigator.msPointerEnabled) {
        style.msContentZooming = "";
        style.msTouchAction = "";
      } else if (this.supportsPointerEvents) {
        style.touchAction = "";
      }
      if (this.supportsPointerEvents) {
        window.document.removeEventListener("pointermove", this.onPointerMove, true);
        this.interactionDOMElement.removeEventListener("pointerdown", this.onPointerDown, true);
        this.interactionDOMElement.removeEventListener("pointerleave", this.onPointerOut, true);
        this.interactionDOMElement.removeEventListener("pointerover", this.onPointerOver, true);
        window.removeEventListener("pointercancel", this.onPointerCancel, true);
        window.removeEventListener("pointerup", this.onPointerUp, true);
      } else {
        window.document.removeEventListener("mousemove", this.onPointerMove, true);
        this.interactionDOMElement.removeEventListener("mousedown", this.onPointerDown, true);
        this.interactionDOMElement.removeEventListener("mouseout", this.onPointerOut, true);
        this.interactionDOMElement.removeEventListener("mouseover", this.onPointerOver, true);
        window.removeEventListener("mouseup", this.onPointerUp, true);
      }
      if (this.supportsTouchEvents) {
        this.interactionDOMElement.removeEventListener("touchstart", this.onPointerDown, true);
        this.interactionDOMElement.removeEventListener("touchcancel", this.onPointerCancel, true);
        this.interactionDOMElement.removeEventListener("touchend", this.onPointerUp, true);
        this.interactionDOMElement.removeEventListener("touchmove", this.onPointerMove, true);
      }
      this.interactionDOMElement = null;
      this.eventsAdded = false;
    };
    InteractionManager2.prototype.tickerUpdate = function(deltaTime) {
      this._deltaTime += deltaTime;
      if (this._deltaTime < this.interactionFrequency) {
        return;
      }
      this._deltaTime = 0;
      this.update();
    };
    InteractionManager2.prototype.update = function() {
      if (!this.interactionDOMElement) {
        return;
      }
      if (this._didMove) {
        this._didMove = false;
        return;
      }
      this.cursor = null;
      for (var k in this.activeInteractionData) {
        if (this.activeInteractionData.hasOwnProperty(k)) {
          var interactionData = this.activeInteractionData[k];
          if (interactionData.originalEvent && interactionData.pointerType !== "touch") {
            var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, interactionData.originalEvent, interactionData);
            this.processInteractive(interactionEvent, this.lastObjectRendered, this.processPointerOverOut, true);
          }
        }
      }
      this.setCursorMode(this.cursor);
    };
    InteractionManager2.prototype.setCursorMode = function(mode) {
      mode = mode || "default";
      if (this.currentCursorMode === mode) {
        return;
      }
      this.currentCursorMode = mode;
      var style = this.cursorStyles[mode];
      if (style) {
        switch (typeof style) {
          case "string":
            this.interactionDOMElement.style.cursor = style;
            break;
          case "function":
            style(mode);
            break;
          case "object":
            Object.assign(this.interactionDOMElement.style, style);
            break;
        }
      } else if (typeof mode === "string" && !Object.prototype.hasOwnProperty.call(this.cursorStyles, mode)) {
        this.interactionDOMElement.style.cursor = mode;
      }
    };
    InteractionManager2.prototype.dispatchEvent = function(displayObject, eventString, eventData) {
      if (!eventData.stopPropagationHint || displayObject === eventData.stopsPropagatingAt) {
        eventData.currentTarget = displayObject;
        eventData.type = eventString;
        displayObject.emit(eventString, eventData);
        if (displayObject[eventString]) {
          displayObject[eventString](eventData);
        }
      }
    };
    InteractionManager2.prototype.delayDispatchEvent = function(displayObject, eventString, eventData) {
      this.delayedEvents.push({displayObject, eventString, eventData});
    };
    InteractionManager2.prototype.mapPositionToPoint = function(point, x, y) {
      var rect;
      if (!this.interactionDOMElement.parentElement) {
        rect = {x: 0, y: 0, width: 0, height: 0};
      } else {
        rect = this.interactionDOMElement.getBoundingClientRect();
      }
      var resolutionMultiplier = 1 / this.resolution;
      point.x = (x - rect.left) * (this.interactionDOMElement.width / rect.width) * resolutionMultiplier;
      point.y = (y - rect.top) * (this.interactionDOMElement.height / rect.height) * resolutionMultiplier;
    };
    InteractionManager2.prototype.processInteractive = function(interactionEvent, displayObject, func, hitTest) {
      var hit = this.search.findHit(interactionEvent, displayObject, func, hitTest);
      var delayedEvents = this.delayedEvents;
      if (!delayedEvents.length) {
        return hit;
      }
      interactionEvent.stopPropagationHint = false;
      var delayedLen = delayedEvents.length;
      this.delayedEvents = [];
      for (var i = 0; i < delayedLen; i++) {
        var _a = delayedEvents[i], displayObject_1 = _a.displayObject, eventString = _a.eventString, eventData = _a.eventData;
        if (eventData.stopsPropagatingAt === displayObject_1) {
          eventData.stopPropagationHint = true;
        }
        this.dispatchEvent(displayObject_1, eventString, eventData);
      }
      return hit;
    };
    InteractionManager2.prototype.onPointerDown = function(originalEvent) {
      if (this.supportsTouchEvents && originalEvent.pointerType === "touch") {
        return;
      }
      var events = this.normalizeToPointerData(originalEvent);
      if (this.autoPreventDefault && events[0].isNormalized) {
        var cancelable = originalEvent.cancelable || !("cancelable" in originalEvent);
        if (cancelable) {
          originalEvent.preventDefault();
        }
      }
      var eventLen = events.length;
      for (var i = 0; i < eventLen; i++) {
        var event = events[i];
        var interactionData = this.getInteractionDataForPointerId(event);
        var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);
        interactionEvent.data.originalEvent = originalEvent;
        this.processInteractive(interactionEvent, this.lastObjectRendered, this.processPointerDown, true);
        this.emit("pointerdown", interactionEvent);
        if (event.pointerType === "touch") {
          this.emit("touchstart", interactionEvent);
        } else if (event.pointerType === "mouse" || event.pointerType === "pen") {
          var isRightButton = event.button === 2;
          this.emit(isRightButton ? "rightdown" : "mousedown", this.eventData);
        }
      }
    };
    InteractionManager2.prototype.processPointerDown = function(interactionEvent, displayObject, hit) {
      var data = interactionEvent.data;
      var id = interactionEvent.data.identifier;
      if (hit) {
        if (!displayObject.trackedPointers[id]) {
          displayObject.trackedPointers[id] = new InteractionTrackingData(id);
        }
        this.dispatchEvent(displayObject, "pointerdown", interactionEvent);
        if (data.pointerType === "touch") {
          this.dispatchEvent(displayObject, "touchstart", interactionEvent);
        } else if (data.pointerType === "mouse" || data.pointerType === "pen") {
          var isRightButton = data.button === 2;
          if (isRightButton) {
            displayObject.trackedPointers[id].rightDown = true;
          } else {
            displayObject.trackedPointers[id].leftDown = true;
          }
          this.dispatchEvent(displayObject, isRightButton ? "rightdown" : "mousedown", interactionEvent);
        }
      }
    };
    InteractionManager2.prototype.onPointerComplete = function(originalEvent, cancelled, func) {
      var events = this.normalizeToPointerData(originalEvent);
      var eventLen = events.length;
      var eventAppend = originalEvent.target !== this.interactionDOMElement ? "outside" : "";
      for (var i = 0; i < eventLen; i++) {
        var event = events[i];
        var interactionData = this.getInteractionDataForPointerId(event);
        var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);
        interactionEvent.data.originalEvent = originalEvent;
        this.processInteractive(interactionEvent, this.lastObjectRendered, func, cancelled || !eventAppend);
        this.emit(cancelled ? "pointercancel" : "pointerup" + eventAppend, interactionEvent);
        if (event.pointerType === "mouse" || event.pointerType === "pen") {
          var isRightButton = event.button === 2;
          this.emit(isRightButton ? "rightup" + eventAppend : "mouseup" + eventAppend, interactionEvent);
        } else if (event.pointerType === "touch") {
          this.emit(cancelled ? "touchcancel" : "touchend" + eventAppend, interactionEvent);
          this.releaseInteractionDataForPointerId(event.pointerId);
        }
      }
    };
    InteractionManager2.prototype.onPointerCancel = function(event) {
      if (this.supportsTouchEvents && event.pointerType === "touch") {
        return;
      }
      this.onPointerComplete(event, true, this.processPointerCancel);
    };
    InteractionManager2.prototype.processPointerCancel = function(interactionEvent, displayObject) {
      var data = interactionEvent.data;
      var id = interactionEvent.data.identifier;
      if (displayObject.trackedPointers[id] !== void 0) {
        delete displayObject.trackedPointers[id];
        this.dispatchEvent(displayObject, "pointercancel", interactionEvent);
        if (data.pointerType === "touch") {
          this.dispatchEvent(displayObject, "touchcancel", interactionEvent);
        }
      }
    };
    InteractionManager2.prototype.onPointerUp = function(event) {
      if (this.supportsTouchEvents && event.pointerType === "touch") {
        return;
      }
      this.onPointerComplete(event, false, this.processPointerUp);
    };
    InteractionManager2.prototype.processPointerUp = function(interactionEvent, displayObject, hit) {
      var data = interactionEvent.data;
      var id = interactionEvent.data.identifier;
      var trackingData = displayObject.trackedPointers[id];
      var isTouch = data.pointerType === "touch";
      var isMouse = data.pointerType === "mouse" || data.pointerType === "pen";
      var isMouseTap = false;
      if (isMouse) {
        var isRightButton = data.button === 2;
        var flags = InteractionTrackingData.FLAGS;
        var test = isRightButton ? flags.RIGHT_DOWN : flags.LEFT_DOWN;
        var isDown = trackingData !== void 0 && trackingData.flags & test;
        if (hit) {
          this.dispatchEvent(displayObject, isRightButton ? "rightup" : "mouseup", interactionEvent);
          if (isDown) {
            this.dispatchEvent(displayObject, isRightButton ? "rightclick" : "click", interactionEvent);
            isMouseTap = true;
          }
        } else if (isDown) {
          this.dispatchEvent(displayObject, isRightButton ? "rightupoutside" : "mouseupoutside", interactionEvent);
        }
        if (trackingData) {
          if (isRightButton) {
            trackingData.rightDown = false;
          } else {
            trackingData.leftDown = false;
          }
        }
      }
      if (hit) {
        this.dispatchEvent(displayObject, "pointerup", interactionEvent);
        if (isTouch) {
          this.dispatchEvent(displayObject, "touchend", interactionEvent);
        }
        if (trackingData) {
          if (!isMouse || isMouseTap) {
            this.dispatchEvent(displayObject, "pointertap", interactionEvent);
          }
          if (isTouch) {
            this.dispatchEvent(displayObject, "tap", interactionEvent);
            trackingData.over = false;
          }
        }
      } else if (trackingData) {
        this.dispatchEvent(displayObject, "pointerupoutside", interactionEvent);
        if (isTouch) {
          this.dispatchEvent(displayObject, "touchendoutside", interactionEvent);
        }
      }
      if (trackingData && trackingData.none) {
        delete displayObject.trackedPointers[id];
      }
    };
    InteractionManager2.prototype.onPointerMove = function(originalEvent) {
      if (this.supportsTouchEvents && originalEvent.pointerType === "touch") {
        return;
      }
      var events = this.normalizeToPointerData(originalEvent);
      if (events[0].pointerType === "mouse" || events[0].pointerType === "pen") {
        this._didMove = true;
        this.cursor = null;
      }
      var eventLen = events.length;
      for (var i = 0; i < eventLen; i++) {
        var event = events[i];
        var interactionData = this.getInteractionDataForPointerId(event);
        var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);
        interactionEvent.data.originalEvent = originalEvent;
        this.processInteractive(interactionEvent, this.lastObjectRendered, this.processPointerMove, true);
        this.emit("pointermove", interactionEvent);
        if (event.pointerType === "touch") {
          this.emit("touchmove", interactionEvent);
        }
        if (event.pointerType === "mouse" || event.pointerType === "pen") {
          this.emit("mousemove", interactionEvent);
        }
      }
      if (events[0].pointerType === "mouse") {
        this.setCursorMode(this.cursor);
      }
    };
    InteractionManager2.prototype.processPointerMove = function(interactionEvent, displayObject, hit) {
      var data = interactionEvent.data;
      var isTouch = data.pointerType === "touch";
      var isMouse = data.pointerType === "mouse" || data.pointerType === "pen";
      if (isMouse) {
        this.processPointerOverOut(interactionEvent, displayObject, hit);
      }
      if (!this.moveWhenInside || hit) {
        this.dispatchEvent(displayObject, "pointermove", interactionEvent);
        if (isTouch) {
          this.dispatchEvent(displayObject, "touchmove", interactionEvent);
        }
        if (isMouse) {
          this.dispatchEvent(displayObject, "mousemove", interactionEvent);
        }
      }
    };
    InteractionManager2.prototype.onPointerOut = function(originalEvent) {
      if (this.supportsTouchEvents && originalEvent.pointerType === "touch") {
        return;
      }
      var events = this.normalizeToPointerData(originalEvent);
      var event = events[0];
      if (event.pointerType === "mouse") {
        this.mouseOverRenderer = false;
        this.setCursorMode(null);
      }
      var interactionData = this.getInteractionDataForPointerId(event);
      var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);
      interactionEvent.data.originalEvent = event;
      this.processInteractive(interactionEvent, this.lastObjectRendered, this.processPointerOverOut, false);
      this.emit("pointerout", interactionEvent);
      if (event.pointerType === "mouse" || event.pointerType === "pen") {
        this.emit("mouseout", interactionEvent);
      } else {
        this.releaseInteractionDataForPointerId(interactionData.identifier);
      }
    };
    InteractionManager2.prototype.processPointerOverOut = function(interactionEvent, displayObject, hit) {
      var data = interactionEvent.data;
      var id = interactionEvent.data.identifier;
      var isMouse = data.pointerType === "mouse" || data.pointerType === "pen";
      var trackingData = displayObject.trackedPointers[id];
      if (hit && !trackingData) {
        trackingData = displayObject.trackedPointers[id] = new InteractionTrackingData(id);
      }
      if (trackingData === void 0) {
        return;
      }
      if (hit && this.mouseOverRenderer) {
        if (!trackingData.over) {
          trackingData.over = true;
          this.delayDispatchEvent(displayObject, "pointerover", interactionEvent);
          if (isMouse) {
            this.delayDispatchEvent(displayObject, "mouseover", interactionEvent);
          }
        }
        if (isMouse && this.cursor === null) {
          this.cursor = displayObject.cursor;
        }
      } else if (trackingData.over) {
        trackingData.over = false;
        this.dispatchEvent(displayObject, "pointerout", this.eventData);
        if (isMouse) {
          this.dispatchEvent(displayObject, "mouseout", interactionEvent);
        }
        if (trackingData.none) {
          delete displayObject.trackedPointers[id];
        }
      }
    };
    InteractionManager2.prototype.onPointerOver = function(originalEvent) {
      var events = this.normalizeToPointerData(originalEvent);
      var event = events[0];
      var interactionData = this.getInteractionDataForPointerId(event);
      var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);
      interactionEvent.data.originalEvent = event;
      if (event.pointerType === "mouse") {
        this.mouseOverRenderer = true;
      }
      this.emit("pointerover", interactionEvent);
      if (event.pointerType === "mouse" || event.pointerType === "pen") {
        this.emit("mouseover", interactionEvent);
      }
    };
    InteractionManager2.prototype.getInteractionDataForPointerId = function(event) {
      var pointerId = event.pointerId;
      var interactionData;
      if (pointerId === MOUSE_POINTER_ID || event.pointerType === "mouse") {
        interactionData = this.mouse;
      } else if (this.activeInteractionData[pointerId]) {
        interactionData = this.activeInteractionData[pointerId];
      } else {
        interactionData = this.interactionDataPool.pop() || new InteractionData();
        interactionData.identifier = pointerId;
        this.activeInteractionData[pointerId] = interactionData;
      }
      interactionData.copyEvent(event);
      return interactionData;
    };
    InteractionManager2.prototype.releaseInteractionDataForPointerId = function(pointerId) {
      var interactionData = this.activeInteractionData[pointerId];
      if (interactionData) {
        delete this.activeInteractionData[pointerId];
        interactionData.reset();
        this.interactionDataPool.push(interactionData);
      }
    };
    InteractionManager2.prototype.configureInteractionEventForDOMEvent = function(interactionEvent, pointerEvent, interactionData) {
      interactionEvent.data = interactionData;
      this.mapPositionToPoint(interactionData.global, pointerEvent.clientX, pointerEvent.clientY);
      if (pointerEvent.pointerType === "touch") {
        pointerEvent.globalX = interactionData.global.x;
        pointerEvent.globalY = interactionData.global.y;
      }
      interactionData.originalEvent = pointerEvent;
      interactionEvent.reset();
      return interactionEvent;
    };
    InteractionManager2.prototype.normalizeToPointerData = function(event) {
      var normalizedEvents = [];
      if (this.supportsTouchEvents && event instanceof TouchEvent) {
        for (var i = 0, li = event.changedTouches.length; i < li; i++) {
          var touch = event.changedTouches[i];
          if (typeof touch.button === "undefined") {
            touch.button = event.touches.length ? 1 : 0;
          }
          if (typeof touch.buttons === "undefined") {
            touch.buttons = event.touches.length ? 1 : 0;
          }
          if (typeof touch.isPrimary === "undefined") {
            touch.isPrimary = event.touches.length === 1 && event.type === "touchstart";
          }
          if (typeof touch.width === "undefined") {
            touch.width = touch.radiusX || 1;
          }
          if (typeof touch.height === "undefined") {
            touch.height = touch.radiusY || 1;
          }
          if (typeof touch.tiltX === "undefined") {
            touch.tiltX = 0;
          }
          if (typeof touch.tiltY === "undefined") {
            touch.tiltY = 0;
          }
          if (typeof touch.pointerType === "undefined") {
            touch.pointerType = "touch";
          }
          if (typeof touch.pointerId === "undefined") {
            touch.pointerId = touch.identifier || 0;
          }
          if (typeof touch.pressure === "undefined") {
            touch.pressure = touch.force || 0.5;
          }
          if (typeof touch.twist === "undefined") {
            touch.twist = 0;
          }
          if (typeof touch.tangentialPressure === "undefined") {
            touch.tangentialPressure = 0;
          }
          if (typeof touch.layerX === "undefined") {
            touch.layerX = touch.offsetX = touch.clientX;
          }
          if (typeof touch.layerY === "undefined") {
            touch.layerY = touch.offsetY = touch.clientY;
          }
          touch.isNormalized = true;
          normalizedEvents.push(touch);
        }
      } else if (event instanceof MouseEvent && (!this.supportsPointerEvents || !(event instanceof window.PointerEvent))) {
        var tempEvent = event;
        if (typeof tempEvent.isPrimary === "undefined") {
          tempEvent.isPrimary = true;
        }
        if (typeof tempEvent.width === "undefined") {
          tempEvent.width = 1;
        }
        if (typeof tempEvent.height === "undefined") {
          tempEvent.height = 1;
        }
        if (typeof tempEvent.tiltX === "undefined") {
          tempEvent.tiltX = 0;
        }
        if (typeof tempEvent.tiltY === "undefined") {
          tempEvent.tiltY = 0;
        }
        if (typeof tempEvent.pointerType === "undefined") {
          tempEvent.pointerType = "mouse";
        }
        if (typeof tempEvent.pointerId === "undefined") {
          tempEvent.pointerId = MOUSE_POINTER_ID;
        }
        if (typeof tempEvent.pressure === "undefined") {
          tempEvent.pressure = 0.5;
        }
        if (typeof tempEvent.twist === "undefined") {
          tempEvent.twist = 0;
        }
        if (typeof tempEvent.tangentialPressure === "undefined") {
          tempEvent.tangentialPressure = 0;
        }
        tempEvent.isNormalized = true;
        normalizedEvents.push(tempEvent);
      } else {
        normalizedEvents.push(event);
      }
      return normalizedEvents;
    };
    InteractionManager2.prototype.destroy = function() {
      this.removeEvents();
      this.removeTickerListener();
      this.removeAllListeners();
      this.renderer = null;
      this.mouse = null;
      this.eventData = null;
      this.interactionDOMElement = null;
      this.onPointerDown = null;
      this.processPointerDown = null;
      this.onPointerUp = null;
      this.processPointerUp = null;
      this.onPointerCancel = null;
      this.processPointerCancel = null;
      this.onPointerMove = null;
      this.processPointerMove = null;
      this.onPointerOut = null;
      this.processPointerOverOut = null;
      this.onPointerOver = null;
      this.search = null;
    };
    return InteractionManager2;
  }(utils.EventEmitter);
  exports2.InteractionData = InteractionData;
  exports2.InteractionEvent = InteractionEvent;
  exports2.InteractionManager = InteractionManager;
  exports2.InteractionTrackingData = InteractionTrackingData;
  exports2.interactiveTarget = interactiveTarget;
});

// node_modules/@pixi/runner/lib/runner.js
var require_runner = __commonJS((exports2) => {
  /*!
   * @pixi/runner - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/runner is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var Runner = function() {
    function Runner2(name) {
      this.items = [];
      this._name = name;
      this._aliasCount = 0;
    }
    Runner2.prototype.emit = function(a0, a1, a2, a3, a4, a5, a6, a7) {
      if (arguments.length > 8) {
        throw new Error("max arguments reached");
      }
      var _a = this, name = _a.name, items = _a.items;
      this._aliasCount++;
      for (var i = 0, len = items.length; i < len; i++) {
        items[i][name](a0, a1, a2, a3, a4, a5, a6, a7);
      }
      if (items === this.items) {
        this._aliasCount--;
      }
      return this;
    };
    Runner2.prototype.ensureNonAliasedItems = function() {
      if (this._aliasCount > 0 && this.items.length > 1) {
        this._aliasCount = 0;
        this.items = this.items.slice(0);
      }
    };
    Runner2.prototype.add = function(item) {
      if (item[this._name]) {
        this.ensureNonAliasedItems();
        this.remove(item);
        this.items.push(item);
      }
      return this;
    };
    Runner2.prototype.remove = function(item) {
      var index = this.items.indexOf(item);
      if (index !== -1) {
        this.ensureNonAliasedItems();
        this.items.splice(index, 1);
      }
      return this;
    };
    Runner2.prototype.contains = function(item) {
      return this.items.indexOf(item) !== -1;
    };
    Runner2.prototype.removeAll = function() {
      this.ensureNonAliasedItems();
      this.items.length = 0;
      return this;
    };
    Runner2.prototype.destroy = function() {
      this.removeAll();
      this.items = null;
      this._name = null;
    };
    Object.defineProperty(Runner2.prototype, "empty", {
      get: function() {
        return this.items.length === 0;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Runner2.prototype, "name", {
      get: function() {
        return this._name;
      },
      enumerable: false,
      configurable: true
    });
    return Runner2;
  }();
  Object.defineProperties(Runner.prototype, {
    dispatch: {value: Runner.prototype.emit},
    run: {value: Runner.prototype.emit}
  });
  exports2.Runner = Runner;
});

// node_modules/@pixi/core/lib/core.js
var require_core = __commonJS((exports2) => {
  /*!
   * @pixi/core - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/core is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var settings = require_settings();
  var constants = require_constants();
  var utils = require_utils();
  var runner = require_runner();
  var ticker = require_ticker();
  var math = require_math();
  settings.settings.PREFER_ENV = utils.isMobile.any ? constants.ENV.WEBGL : constants.ENV.WEBGL2;
  settings.settings.STRICT_TEXTURE_CACHE = false;
  var INSTALLED = [];
  function autoDetectResource(source, options) {
    if (!source) {
      return null;
    }
    var extension = "";
    if (typeof source === "string") {
      var result = /\.(\w{3,4})(?:$|\?|#)/i.exec(source);
      if (result) {
        extension = result[1].toLowerCase();
      }
    }
    for (var i = INSTALLED.length - 1; i >= 0; --i) {
      var ResourcePlugin = INSTALLED[i];
      if (ResourcePlugin.test && ResourcePlugin.test(source, extension)) {
        return new ResourcePlugin(source, options);
      }
    }
    throw new Error("Unrecognized source type to auto-detect Resource");
  }
  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0
  
  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.
  
  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || {__proto__: []} instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) {
        if (b2.hasOwnProperty(p)) {
          d2[p] = b2[p];
        }
      }
    };
    return extendStatics(d, b);
  };
  function __extends(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  var Resource = function() {
    function Resource2(width, height) {
      if (width === void 0) {
        width = 0;
      }
      if (height === void 0) {
        height = 0;
      }
      this._width = width;
      this._height = height;
      this.destroyed = false;
      this.internal = false;
      this.onResize = new runner.Runner("setRealSize");
      this.onUpdate = new runner.Runner("update");
      this.onError = new runner.Runner("onError");
    }
    Resource2.prototype.bind = function(baseTexture) {
      this.onResize.add(baseTexture);
      this.onUpdate.add(baseTexture);
      this.onError.add(baseTexture);
      if (this._width || this._height) {
        this.onResize.emit(this._width, this._height);
      }
    };
    Resource2.prototype.unbind = function(baseTexture) {
      this.onResize.remove(baseTexture);
      this.onUpdate.remove(baseTexture);
      this.onError.remove(baseTexture);
    };
    Resource2.prototype.resize = function(width, height) {
      if (width !== this._width || height !== this._height) {
        this._width = width;
        this._height = height;
        this.onResize.emit(width, height);
      }
    };
    Object.defineProperty(Resource2.prototype, "valid", {
      get: function() {
        return !!this._width && !!this._height;
      },
      enumerable: false,
      configurable: true
    });
    Resource2.prototype.update = function() {
      if (!this.destroyed) {
        this.onUpdate.emit();
      }
    };
    Resource2.prototype.load = function() {
      return Promise.resolve(this);
    };
    Object.defineProperty(Resource2.prototype, "width", {
      get: function() {
        return this._width;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Resource2.prototype, "height", {
      get: function() {
        return this._height;
      },
      enumerable: false,
      configurable: true
    });
    Resource2.prototype.style = function(_renderer, _baseTexture, _glTexture) {
      return false;
    };
    Resource2.prototype.dispose = function() {
    };
    Resource2.prototype.destroy = function() {
      if (!this.destroyed) {
        this.destroyed = true;
        this.dispose();
        this.onError.removeAll();
        this.onError = null;
        this.onResize.removeAll();
        this.onResize = null;
        this.onUpdate.removeAll();
        this.onUpdate = null;
      }
    };
    Resource2.test = function(_source, _extension) {
      return false;
    };
    return Resource2;
  }();
  var BufferResource = function(_super) {
    __extends(BufferResource2, _super);
    function BufferResource2(source, options) {
      var _this = this;
      var _a = options || {}, width = _a.width, height = _a.height;
      if (!width || !height) {
        throw new Error("BufferResource width or height invalid");
      }
      _this = _super.call(this, width, height) || this;
      _this.data = source;
      return _this;
    }
    BufferResource2.prototype.upload = function(renderer, baseTexture, glTexture) {
      var gl = renderer.gl;
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, baseTexture.alphaMode === constants.ALPHA_MODES.UNPACK);
      if (glTexture.width === baseTexture.width && glTexture.height === baseTexture.height) {
        gl.texSubImage2D(baseTexture.target, 0, 0, 0, baseTexture.width, baseTexture.height, baseTexture.format, baseTexture.type, this.data);
      } else {
        glTexture.width = baseTexture.width;
        glTexture.height = baseTexture.height;
        gl.texImage2D(baseTexture.target, 0, glTexture.internalFormat, baseTexture.width, baseTexture.height, 0, baseTexture.format, glTexture.type, this.data);
      }
      return true;
    };
    BufferResource2.prototype.dispose = function() {
      this.data = null;
    };
    BufferResource2.test = function(source) {
      return source instanceof Float32Array || source instanceof Uint8Array || source instanceof Uint32Array;
    };
    return BufferResource2;
  }(Resource);
  var defaultBufferOptions = {
    scaleMode: constants.SCALE_MODES.NEAREST,
    format: constants.FORMATS.RGBA,
    alphaMode: constants.ALPHA_MODES.NPM
  };
  var BaseTexture = function(_super) {
    __extends(BaseTexture2, _super);
    function BaseTexture2(resource, options) {
      if (resource === void 0) {
        resource = null;
      }
      if (options === void 0) {
        options = null;
      }
      var _this = _super.call(this) || this;
      options = options || {};
      var alphaMode = options.alphaMode, mipmap = options.mipmap, anisotropicLevel = options.anisotropicLevel, scaleMode = options.scaleMode, width = options.width, height = options.height, wrapMode = options.wrapMode, format = options.format, type = options.type, target = options.target, resolution = options.resolution, resourceOptions = options.resourceOptions;
      if (resource && !(resource instanceof Resource)) {
        resource = autoDetectResource(resource, resourceOptions);
        resource.internal = true;
      }
      _this.width = width || 0;
      _this.height = height || 0;
      _this.resolution = resolution || settings.settings.RESOLUTION;
      _this.mipmap = mipmap !== void 0 ? mipmap : settings.settings.MIPMAP_TEXTURES;
      _this.anisotropicLevel = anisotropicLevel !== void 0 ? anisotropicLevel : settings.settings.ANISOTROPIC_LEVEL;
      _this.wrapMode = wrapMode || settings.settings.WRAP_MODE;
      _this.scaleMode = scaleMode !== void 0 ? scaleMode : settings.settings.SCALE_MODE;
      _this.format = format || constants.FORMATS.RGBA;
      _this.type = type || constants.TYPES.UNSIGNED_BYTE;
      _this.target = target || constants.TARGETS.TEXTURE_2D;
      _this.alphaMode = alphaMode !== void 0 ? alphaMode : constants.ALPHA_MODES.UNPACK;
      if (options.premultiplyAlpha !== void 0) {
        _this.premultiplyAlpha = options.premultiplyAlpha;
      }
      _this.uid = utils.uid();
      _this.touched = 0;
      _this.isPowerOfTwo = false;
      _this._refreshPOT();
      _this._glTextures = {};
      _this.dirtyId = 0;
      _this.dirtyStyleId = 0;
      _this.cacheId = null;
      _this.valid = width > 0 && height > 0;
      _this.textureCacheIds = [];
      _this.destroyed = false;
      _this.resource = null;
      _this._batchEnabled = 0;
      _this._batchLocation = 0;
      _this.parentTextureArray = null;
      _this.setResource(resource);
      return _this;
    }
    Object.defineProperty(BaseTexture2.prototype, "realWidth", {
      get: function() {
        return Math.ceil(this.width * this.resolution - 1e-4);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(BaseTexture2.prototype, "realHeight", {
      get: function() {
        return Math.ceil(this.height * this.resolution - 1e-4);
      },
      enumerable: false,
      configurable: true
    });
    BaseTexture2.prototype.setStyle = function(scaleMode, mipmap) {
      var dirty;
      if (scaleMode !== void 0 && scaleMode !== this.scaleMode) {
        this.scaleMode = scaleMode;
        dirty = true;
      }
      if (mipmap !== void 0 && mipmap !== this.mipmap) {
        this.mipmap = mipmap;
        dirty = true;
      }
      if (dirty) {
        this.dirtyStyleId++;
      }
      return this;
    };
    BaseTexture2.prototype.setSize = function(width, height, resolution) {
      this.resolution = resolution || this.resolution;
      this.width = width;
      this.height = height;
      this._refreshPOT();
      this.update();
      return this;
    };
    BaseTexture2.prototype.setRealSize = function(realWidth, realHeight, resolution) {
      this.resolution = resolution || this.resolution;
      this.width = realWidth / this.resolution;
      this.height = realHeight / this.resolution;
      this._refreshPOT();
      this.update();
      return this;
    };
    BaseTexture2.prototype._refreshPOT = function() {
      this.isPowerOfTwo = utils.isPow2(this.realWidth) && utils.isPow2(this.realHeight);
    };
    BaseTexture2.prototype.setResolution = function(resolution) {
      var oldResolution = this.resolution;
      if (oldResolution === resolution) {
        return this;
      }
      this.resolution = resolution;
      if (this.valid) {
        this.width = this.width * oldResolution / resolution;
        this.height = this.height * oldResolution / resolution;
        this.emit("update", this);
      }
      this._refreshPOT();
      return this;
    };
    BaseTexture2.prototype.setResource = function(resource) {
      if (this.resource === resource) {
        return this;
      }
      if (this.resource) {
        throw new Error("Resource can be set only once");
      }
      resource.bind(this);
      this.resource = resource;
      return this;
    };
    BaseTexture2.prototype.update = function() {
      if (!this.valid) {
        if (this.width > 0 && this.height > 0) {
          this.valid = true;
          this.emit("loaded", this);
          this.emit("update", this);
        }
      } else {
        this.dirtyId++;
        this.dirtyStyleId++;
        this.emit("update", this);
      }
    };
    BaseTexture2.prototype.onError = function(event) {
      this.emit("error", this, event);
    };
    BaseTexture2.prototype.destroy = function() {
      if (this.resource) {
        this.resource.unbind(this);
        if (this.resource.internal) {
          this.resource.destroy();
        }
        this.resource = null;
      }
      if (this.cacheId) {
        delete utils.BaseTextureCache[this.cacheId];
        delete utils.TextureCache[this.cacheId];
        this.cacheId = null;
      }
      this.dispose();
      BaseTexture2.removeFromCache(this);
      this.textureCacheIds = null;
      this.destroyed = true;
    };
    BaseTexture2.prototype.dispose = function() {
      this.emit("dispose", this);
    };
    BaseTexture2.prototype.castToBaseTexture = function() {
      return this;
    };
    BaseTexture2.from = function(source, options, strict) {
      if (strict === void 0) {
        strict = settings.settings.STRICT_TEXTURE_CACHE;
      }
      var isFrame = typeof source === "string";
      var cacheId = null;
      if (isFrame) {
        cacheId = source;
      } else {
        if (!source._pixiId) {
          source._pixiId = "pixiid_" + utils.uid();
        }
        cacheId = source._pixiId;
      }
      var baseTexture = utils.BaseTextureCache[cacheId];
      if (isFrame && strict && !baseTexture) {
        throw new Error('The cacheId "' + cacheId + '" does not exist in BaseTextureCache.');
      }
      if (!baseTexture) {
        baseTexture = new BaseTexture2(source, options);
        baseTexture.cacheId = cacheId;
        BaseTexture2.addToCache(baseTexture, cacheId);
      }
      return baseTexture;
    };
    BaseTexture2.fromBuffer = function(buffer, width, height, options) {
      buffer = buffer || new Float32Array(width * height * 4);
      var resource = new BufferResource(buffer, {width, height});
      var type = buffer instanceof Float32Array ? constants.TYPES.FLOAT : constants.TYPES.UNSIGNED_BYTE;
      return new BaseTexture2(resource, Object.assign(defaultBufferOptions, options || {width, height, type}));
    };
    BaseTexture2.addToCache = function(baseTexture, id) {
      if (id) {
        if (baseTexture.textureCacheIds.indexOf(id) === -1) {
          baseTexture.textureCacheIds.push(id);
        }
        if (utils.BaseTextureCache[id]) {
          console.warn("BaseTexture added to the cache with an id [" + id + "] that already had an entry");
        }
        utils.BaseTextureCache[id] = baseTexture;
      }
    };
    BaseTexture2.removeFromCache = function(baseTexture) {
      if (typeof baseTexture === "string") {
        var baseTextureFromCache = utils.BaseTextureCache[baseTexture];
        if (baseTextureFromCache) {
          var index2 = baseTextureFromCache.textureCacheIds.indexOf(baseTexture);
          if (index2 > -1) {
            baseTextureFromCache.textureCacheIds.splice(index2, 1);
          }
          delete utils.BaseTextureCache[baseTexture];
          return baseTextureFromCache;
        }
      } else if (baseTexture && baseTexture.textureCacheIds) {
        for (var i = 0; i < baseTexture.textureCacheIds.length; ++i) {
          delete utils.BaseTextureCache[baseTexture.textureCacheIds[i]];
        }
        baseTexture.textureCacheIds.length = 0;
        return baseTexture;
      }
      return null;
    };
    BaseTexture2._globalBatch = 0;
    return BaseTexture2;
  }(utils.EventEmitter);
  var AbstractMultiResource = function(_super) {
    __extends(AbstractMultiResource2, _super);
    function AbstractMultiResource2(length, options) {
      var _this = this;
      var _a = options || {}, width = _a.width, height = _a.height;
      _this = _super.call(this, width, height) || this;
      _this.items = [];
      _this.itemDirtyIds = [];
      for (var i = 0; i < length; i++) {
        var partTexture = new BaseTexture();
        _this.items.push(partTexture);
        _this.itemDirtyIds.push(-2);
      }
      _this.length = length;
      _this._load = null;
      _this.baseTexture = null;
      return _this;
    }
    AbstractMultiResource2.prototype.initFromArray = function(resources, options) {
      for (var i = 0; i < this.length; i++) {
        if (!resources[i]) {
          continue;
        }
        if (resources[i].castToBaseTexture) {
          this.addBaseTextureAt(resources[i].castToBaseTexture(), i);
        } else if (resources[i] instanceof Resource) {
          this.addResourceAt(resources[i], i);
        } else {
          this.addResourceAt(autoDetectResource(resources[i], options), i);
        }
      }
    };
    AbstractMultiResource2.prototype.dispose = function() {
      for (var i = 0, len = this.length; i < len; i++) {
        this.items[i].destroy();
      }
      this.items = null;
      this.itemDirtyIds = null;
      this._load = null;
    };
    AbstractMultiResource2.prototype.addResourceAt = function(resource, index2) {
      if (!this.items[index2]) {
        throw new Error("Index " + index2 + " is out of bounds");
      }
      if (resource.valid && !this.valid) {
        this.resize(resource.width, resource.height);
      }
      this.items[index2].setResource(resource);
      return this;
    };
    AbstractMultiResource2.prototype.bind = function(baseTexture) {
      if (this.baseTexture !== null) {
        throw new Error("Only one base texture per TextureArray is allowed");
      }
      _super.prototype.bind.call(this, baseTexture);
      for (var i = 0; i < this.length; i++) {
        this.items[i].parentTextureArray = baseTexture;
        this.items[i].on("update", baseTexture.update, baseTexture);
      }
    };
    AbstractMultiResource2.prototype.unbind = function(baseTexture) {
      _super.prototype.unbind.call(this, baseTexture);
      for (var i = 0; i < this.length; i++) {
        this.items[i].parentTextureArray = null;
        this.items[i].off("update", baseTexture.update, baseTexture);
      }
    };
    AbstractMultiResource2.prototype.load = function() {
      var _this = this;
      if (this._load) {
        return this._load;
      }
      var resources = this.items.map(function(item) {
        return item.resource;
      }).filter(function(item) {
        return item;
      });
      var promises = resources.map(function(item) {
        return item.load();
      });
      this._load = Promise.all(promises).then(function() {
        var _a = _this.items[0], realWidth = _a.realWidth, realHeight = _a.realHeight;
        _this.resize(realWidth, realHeight);
        return Promise.resolve(_this);
      });
      return this._load;
    };
    return AbstractMultiResource2;
  }(Resource);
  var ArrayResource = function(_super) {
    __extends(ArrayResource2, _super);
    function ArrayResource2(source, options) {
      var _this = this;
      var _a = options || {}, width = _a.width, height = _a.height;
      var urls;
      var length;
      if (Array.isArray(source)) {
        urls = source;
        length = source.length;
      } else {
        length = source;
      }
      _this = _super.call(this, length, {width, height}) || this;
      if (urls) {
        _this.initFromArray(urls, options);
      }
      return _this;
    }
    ArrayResource2.prototype.addBaseTextureAt = function(baseTexture, index2) {
      if (baseTexture.resource) {
        this.addResourceAt(baseTexture.resource, index2);
      } else {
        throw new Error("ArrayResource does not support RenderTexture");
      }
      return this;
    };
    ArrayResource2.prototype.bind = function(baseTexture) {
      _super.prototype.bind.call(this, baseTexture);
      baseTexture.target = constants.TARGETS.TEXTURE_2D_ARRAY;
    };
    ArrayResource2.prototype.upload = function(renderer, texture, glTexture) {
      var _a = this, length = _a.length, itemDirtyIds = _a.itemDirtyIds, items = _a.items;
      var gl = renderer.gl;
      if (glTexture.dirtyId < 0) {
        gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, texture.format, this._width, this._height, length, 0, texture.format, texture.type, null);
      }
      for (var i = 0; i < length; i++) {
        var item = items[i];
        if (itemDirtyIds[i] < item.dirtyId) {
          itemDirtyIds[i] = item.dirtyId;
          if (item.valid) {
            gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, i, item.resource.width, item.resource.height, 1, texture.format, texture.type, item.resource.source);
          }
        }
      }
      return true;
    };
    return ArrayResource2;
  }(AbstractMultiResource);
  var BaseImageResource = function(_super) {
    __extends(BaseImageResource2, _super);
    function BaseImageResource2(source) {
      var _this = this;
      var sourceAny = source;
      var width = sourceAny.naturalWidth || sourceAny.videoWidth || sourceAny.width;
      var height = sourceAny.naturalHeight || sourceAny.videoHeight || sourceAny.height;
      _this = _super.call(this, width, height) || this;
      _this.source = source;
      _this.noSubImage = false;
      return _this;
    }
    BaseImageResource2.crossOrigin = function(element, url, crossorigin) {
      if (crossorigin === void 0 && url.indexOf("data:") !== 0) {
        element.crossOrigin = utils.determineCrossOrigin(url);
      } else if (crossorigin !== false) {
        element.crossOrigin = typeof crossorigin === "string" ? crossorigin : "anonymous";
      }
    };
    BaseImageResource2.prototype.upload = function(renderer, baseTexture, glTexture, source) {
      var gl = renderer.gl;
      var width = baseTexture.realWidth;
      var height = baseTexture.realHeight;
      source = source || this.source;
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, baseTexture.alphaMode === constants.ALPHA_MODES.UNPACK);
      if (!this.noSubImage && baseTexture.target === gl.TEXTURE_2D && glTexture.width === width && glTexture.height === height) {
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, baseTexture.format, baseTexture.type, source);
      } else {
        glTexture.width = width;
        glTexture.height = height;
        gl.texImage2D(baseTexture.target, 0, baseTexture.format, baseTexture.format, baseTexture.type, source);
      }
      return true;
    };
    BaseImageResource2.prototype.update = function() {
      if (this.destroyed) {
        return;
      }
      var source = this.source;
      var width = source.naturalWidth || source.videoWidth || source.width;
      var height = source.naturalHeight || source.videoHeight || source.height;
      this.resize(width, height);
      _super.prototype.update.call(this);
    };
    BaseImageResource2.prototype.dispose = function() {
      this.source = null;
    };
    return BaseImageResource2;
  }(Resource);
  var CanvasResource = function(_super) {
    __extends(CanvasResource2, _super);
    function CanvasResource2() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    CanvasResource2.test = function(source) {
      var OffscreenCanvas2 = window.OffscreenCanvas;
      if (OffscreenCanvas2 && source instanceof OffscreenCanvas2) {
        return true;
      }
      return source instanceof HTMLCanvasElement;
    };
    return CanvasResource2;
  }(BaseImageResource);
  var CubeResource = function(_super) {
    __extends(CubeResource2, _super);
    function CubeResource2(source, options) {
      var _this = this;
      var _a = options || {}, width = _a.width, height = _a.height, autoLoad = _a.autoLoad, linkBaseTexture = _a.linkBaseTexture;
      if (source && source.length !== CubeResource2.SIDES) {
        throw new Error("Invalid length. Got " + source.length + ", expected 6");
      }
      _this = _super.call(this, 6, {width, height}) || this;
      for (var i = 0; i < CubeResource2.SIDES; i++) {
        _this.items[i].target = constants.TARGETS.TEXTURE_CUBE_MAP_POSITIVE_X + i;
      }
      _this.linkBaseTexture = linkBaseTexture !== false;
      if (source) {
        _this.initFromArray(source, options);
      }
      if (autoLoad !== false) {
        _this.load();
      }
      return _this;
    }
    CubeResource2.prototype.bind = function(baseTexture) {
      _super.prototype.bind.call(this, baseTexture);
      baseTexture.target = constants.TARGETS.TEXTURE_CUBE_MAP;
    };
    CubeResource2.prototype.addBaseTextureAt = function(baseTexture, index2, linkBaseTexture) {
      if (linkBaseTexture === void 0) {
        linkBaseTexture = this.linkBaseTexture;
      }
      if (!this.items[index2]) {
        throw new Error("Index " + index2 + " is out of bounds");
      }
      if (!this.linkBaseTexture || baseTexture.parentTextureArray || Object.keys(baseTexture._glTextures).length > 0) {
        if (baseTexture.resource) {
          this.addResourceAt(baseTexture.resource, index2);
        } else {
          throw new Error("CubeResource does not support copying of renderTexture.");
        }
      } else {
        baseTexture.target = constants.TARGETS.TEXTURE_CUBE_MAP_POSITIVE_X + index2;
        baseTexture.parentTextureArray = this.baseTexture;
        this.items[index2] = baseTexture;
      }
      if (baseTexture.valid && !this.valid) {
        this.resize(baseTexture.realWidth, baseTexture.realHeight);
      }
      this.items[index2] = baseTexture;
      return this;
    };
    CubeResource2.prototype.upload = function(renderer, _baseTexture, glTexture) {
      var dirty = this.itemDirtyIds;
      for (var i = 0; i < CubeResource2.SIDES; i++) {
        var side = this.items[i];
        if (dirty[i] < side.dirtyId) {
          if (side.valid && side.resource) {
            side.resource.upload(renderer, side, glTexture);
            dirty[i] = side.dirtyId;
          } else if (dirty[i] < -1) {
            renderer.gl.texImage2D(side.target, 0, glTexture.internalFormat, _baseTexture.realWidth, _baseTexture.realHeight, 0, _baseTexture.format, glTexture.type, null);
            dirty[i] = -1;
          }
        }
      }
      return true;
    };
    CubeResource2.test = function(source) {
      return Array.isArray(source) && source.length === CubeResource2.SIDES;
    };
    CubeResource2.SIDES = 6;
    return CubeResource2;
  }(AbstractMultiResource);
  var ImageResource = function(_super) {
    __extends(ImageResource2, _super);
    function ImageResource2(source, options) {
      var _this = this;
      options = options || {};
      if (!(source instanceof HTMLImageElement)) {
        var imageElement = new Image();
        BaseImageResource.crossOrigin(imageElement, source, options.crossorigin);
        imageElement.src = source;
        source = imageElement;
      }
      _this = _super.call(this, source) || this;
      if (!source.complete && !!_this._width && !!_this._height) {
        _this._width = 0;
        _this._height = 0;
      }
      _this.url = source.src;
      _this._process = null;
      _this.preserveBitmap = false;
      _this.createBitmap = (options.createBitmap !== void 0 ? options.createBitmap : settings.settings.CREATE_IMAGE_BITMAP) && !!window.createImageBitmap;
      _this.alphaMode = typeof options.alphaMode === "number" ? options.alphaMode : null;
      if (options.premultiplyAlpha !== void 0) {
        _this.premultiplyAlpha = options.premultiplyAlpha;
      }
      _this.bitmap = null;
      _this._load = null;
      if (options.autoLoad !== false) {
        _this.load();
      }
      return _this;
    }
    ImageResource2.prototype.load = function(createBitmap) {
      var _this = this;
      if (this._load) {
        return this._load;
      }
      if (createBitmap !== void 0) {
        this.createBitmap = createBitmap;
      }
      this._load = new Promise(function(resolve, reject) {
        var source = _this.source;
        _this.url = source.src;
        var completed = function() {
          if (_this.destroyed) {
            return;
          }
          source.onload = null;
          source.onerror = null;
          _this.resize(source.width, source.height);
          _this._load = null;
          if (_this.createBitmap) {
            resolve(_this.process());
          } else {
            resolve(_this);
          }
        };
        if (source.complete && source.src) {
          completed();
        } else {
          source.onload = completed;
          source.onerror = function(event) {
            reject(event);
            _this.onError.emit(event);
          };
        }
      });
      return this._load;
    };
    ImageResource2.prototype.process = function() {
      var _this = this;
      var source = this.source;
      if (this._process !== null) {
        return this._process;
      }
      if (this.bitmap !== null || !window.createImageBitmap) {
        return Promise.resolve(this);
      }
      this._process = window.createImageBitmap(source, 0, 0, source.width, source.height, {
        premultiplyAlpha: this.alphaMode === constants.ALPHA_MODES.UNPACK ? "premultiply" : "none"
      }).then(function(bitmap) {
        if (_this.destroyed) {
          return Promise.reject();
        }
        _this.bitmap = bitmap;
        _this.update();
        _this._process = null;
        return Promise.resolve(_this);
      });
      return this._process;
    };
    ImageResource2.prototype.upload = function(renderer, baseTexture, glTexture) {
      if (typeof this.alphaMode === "number") {
        baseTexture.alphaMode = this.alphaMode;
      }
      if (!this.createBitmap) {
        return _super.prototype.upload.call(this, renderer, baseTexture, glTexture);
      }
      if (!this.bitmap) {
        this.process();
        if (!this.bitmap) {
          return false;
        }
      }
      _super.prototype.upload.call(this, renderer, baseTexture, glTexture, this.bitmap);
      if (!this.preserveBitmap) {
        var flag = true;
        var glTextures = baseTexture._glTextures;
        for (var key in glTextures) {
          var otherTex = glTextures[key];
          if (otherTex !== glTexture && otherTex.dirtyId !== baseTexture.dirtyId) {
            flag = false;
            break;
          }
        }
        if (flag) {
          if (this.bitmap.close) {
            this.bitmap.close();
          }
          this.bitmap = null;
        }
      }
      return true;
    };
    ImageResource2.prototype.dispose = function() {
      this.source.onload = null;
      this.source.onerror = null;
      _super.prototype.dispose.call(this);
      if (this.bitmap) {
        this.bitmap.close();
        this.bitmap = null;
      }
      this._process = null;
      this._load = null;
    };
    ImageResource2.test = function(source) {
      return typeof source === "string" || source instanceof HTMLImageElement;
    };
    return ImageResource2;
  }(BaseImageResource);
  var SVGResource = function(_super) {
    __extends(SVGResource2, _super);
    function SVGResource2(sourceBase64, options) {
      var _this = this;
      options = options || {};
      _this = _super.call(this, document.createElement("canvas")) || this;
      _this._width = 0;
      _this._height = 0;
      _this.svg = sourceBase64;
      _this.scale = options.scale || 1;
      _this._overrideWidth = options.width;
      _this._overrideHeight = options.height;
      _this._resolve = null;
      _this._crossorigin = options.crossorigin;
      _this._load = null;
      if (options.autoLoad !== false) {
        _this.load();
      }
      return _this;
    }
    SVGResource2.prototype.load = function() {
      var _this = this;
      if (this._load) {
        return this._load;
      }
      this._load = new Promise(function(resolve) {
        _this._resolve = function() {
          _this.resize(_this.source.width, _this.source.height);
          resolve(_this);
        };
        if (/^\<svg/.test(_this.svg.trim())) {
          if (!btoa) {
            throw new Error("Your browser doesn't support base64 conversions.");
          }
          _this.svg = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(_this.svg)));
        }
        _this._loadSvg();
      });
      return this._load;
    };
    SVGResource2.prototype._loadSvg = function() {
      var _this = this;
      var tempImage = new Image();
      BaseImageResource.crossOrigin(tempImage, this.svg, this._crossorigin);
      tempImage.src = this.svg;
      tempImage.onerror = function(event) {
        if (!_this._resolve) {
          return;
        }
        tempImage.onerror = null;
        _this.onError.emit(event);
      };
      tempImage.onload = function() {
        if (!_this._resolve) {
          return;
        }
        var svgWidth = tempImage.width;
        var svgHeight = tempImage.height;
        if (!svgWidth || !svgHeight) {
          throw new Error("The SVG image must have width and height defined (in pixels), canvas API needs them.");
        }
        var width = svgWidth * _this.scale;
        var height = svgHeight * _this.scale;
        if (_this._overrideWidth || _this._overrideHeight) {
          width = _this._overrideWidth || _this._overrideHeight / svgHeight * svgWidth;
          height = _this._overrideHeight || _this._overrideWidth / svgWidth * svgHeight;
        }
        width = Math.round(width);
        height = Math.round(height);
        var canvas = _this.source;
        canvas.width = width;
        canvas.height = height;
        canvas._pixiId = "canvas_" + utils.uid();
        canvas.getContext("2d").drawImage(tempImage, 0, 0, svgWidth, svgHeight, 0, 0, width, height);
        _this._resolve();
        _this._resolve = null;
      };
    };
    SVGResource2.getSize = function(svgString) {
      var sizeMatch = SVGResource2.SVG_SIZE.exec(svgString);
      var size = {};
      if (sizeMatch) {
        size[sizeMatch[1]] = Math.round(parseFloat(sizeMatch[3]));
        size[sizeMatch[5]] = Math.round(parseFloat(sizeMatch[7]));
      }
      return size;
    };
    SVGResource2.prototype.dispose = function() {
      _super.prototype.dispose.call(this);
      this._resolve = null;
      this._crossorigin = null;
    };
    SVGResource2.test = function(source, extension) {
      return extension === "svg" || typeof source === "string" && /^data:image\/svg\+xml(;(charset=utf8|utf8))?;base64/.test(source) || typeof source === "string" && source.indexOf("<svg") === 0;
    };
    SVGResource2.SVG_SIZE = /<svg[^>]*(?:\s(width|height)=('|")(\d*(?:\.\d+)?)(?:px)?('|"))[^>]*(?:\s(width|height)=('|")(\d*(?:\.\d+)?)(?:px)?('|"))[^>]*>/i;
    return SVGResource2;
  }(BaseImageResource);
  var VideoResource = function(_super) {
    __extends(VideoResource2, _super);
    function VideoResource2(source, options) {
      var _this = this;
      options = options || {};
      if (!(source instanceof HTMLVideoElement)) {
        var videoElement = document.createElement("video");
        videoElement.setAttribute("preload", "auto");
        videoElement.setAttribute("webkit-playsinline", "");
        videoElement.setAttribute("playsinline", "");
        if (typeof source === "string") {
          source = [source];
        }
        var firstSrc = source[0].src || source[0];
        BaseImageResource.crossOrigin(videoElement, firstSrc, options.crossorigin);
        for (var i = 0; i < source.length; ++i) {
          var sourceElement = document.createElement("source");
          var _a = source[i], src = _a.src, mime = _a.mime;
          src = src || source[i];
          var baseSrc = src.split("?").shift().toLowerCase();
          var ext = baseSrc.substr(baseSrc.lastIndexOf(".") + 1);
          mime = mime || VideoResource2.MIME_TYPES[ext] || "video/" + ext;
          sourceElement.src = src;
          sourceElement.type = mime;
          videoElement.appendChild(sourceElement);
        }
        source = videoElement;
      }
      _this = _super.call(this, source) || this;
      _this.noSubImage = true;
      _this._autoUpdate = true;
      _this._isConnectedToTicker = false;
      _this._updateFPS = options.updateFPS || 0;
      _this._msToNextUpdate = 0;
      _this.autoPlay = options.autoPlay !== false;
      _this._load = null;
      _this._resolve = null;
      _this._onCanPlay = _this._onCanPlay.bind(_this);
      _this._onError = _this._onError.bind(_this);
      if (options.autoLoad !== false) {
        _this.load();
      }
      return _this;
    }
    VideoResource2.prototype.update = function(_deltaTime) {
      if (_deltaTime === void 0) {
        _deltaTime = 0;
      }
      if (!this.destroyed) {
        var elapsedMS = ticker.Ticker.shared.elapsedMS * this.source.playbackRate;
        this._msToNextUpdate = Math.floor(this._msToNextUpdate - elapsedMS);
        if (!this._updateFPS || this._msToNextUpdate <= 0) {
          _super.prototype.update.call(this);
          this._msToNextUpdate = this._updateFPS ? Math.floor(1e3 / this._updateFPS) : 0;
        }
      }
    };
    VideoResource2.prototype.load = function() {
      var _this = this;
      if (this._load) {
        return this._load;
      }
      var source = this.source;
      if ((source.readyState === source.HAVE_ENOUGH_DATA || source.readyState === source.HAVE_FUTURE_DATA) && source.width && source.height) {
        source.complete = true;
      }
      source.addEventListener("play", this._onPlayStart.bind(this));
      source.addEventListener("pause", this._onPlayStop.bind(this));
      if (!this._isSourceReady()) {
        source.addEventListener("canplay", this._onCanPlay);
        source.addEventListener("canplaythrough", this._onCanPlay);
        source.addEventListener("error", this._onError, true);
      } else {
        this._onCanPlay();
      }
      this._load = new Promise(function(resolve) {
        if (_this.valid) {
          resolve(_this);
        } else {
          _this._resolve = resolve;
          source.load();
        }
      });
      return this._load;
    };
    VideoResource2.prototype._onError = function(event) {
      this.source.removeEventListener("error", this._onError, true);
      this.onError.emit(event);
    };
    VideoResource2.prototype._isSourcePlaying = function() {
      var source = this.source;
      return source.currentTime > 0 && source.paused === false && source.ended === false && source.readyState > 2;
    };
    VideoResource2.prototype._isSourceReady = function() {
      var source = this.source;
      return source.readyState === 3 || source.readyState === 4;
    };
    VideoResource2.prototype._onPlayStart = function() {
      if (!this.valid) {
        this._onCanPlay();
      }
      if (this.autoUpdate && !this._isConnectedToTicker) {
        ticker.Ticker.shared.add(this.update, this);
        this._isConnectedToTicker = true;
      }
    };
    VideoResource2.prototype._onPlayStop = function() {
      if (this._isConnectedToTicker) {
        ticker.Ticker.shared.remove(this.update, this);
        this._isConnectedToTicker = false;
      }
    };
    VideoResource2.prototype._onCanPlay = function() {
      var source = this.source;
      source.removeEventListener("canplay", this._onCanPlay);
      source.removeEventListener("canplaythrough", this._onCanPlay);
      var valid = this.valid;
      this.resize(source.videoWidth, source.videoHeight);
      if (!valid && this._resolve) {
        this._resolve(this);
        this._resolve = null;
      }
      if (this._isSourcePlaying()) {
        this._onPlayStart();
      } else if (this.autoPlay) {
        source.play();
      }
    };
    VideoResource2.prototype.dispose = function() {
      if (this._isConnectedToTicker) {
        ticker.Ticker.shared.remove(this.update, this);
      }
      var source = this.source;
      if (source) {
        source.removeEventListener("error", this._onError, true);
        source.pause();
        source.src = "";
        source.load();
      }
      _super.prototype.dispose.call(this);
    };
    Object.defineProperty(VideoResource2.prototype, "autoUpdate", {
      get: function() {
        return this._autoUpdate;
      },
      set: function(value) {
        if (value !== this._autoUpdate) {
          this._autoUpdate = value;
          if (!this._autoUpdate && this._isConnectedToTicker) {
            ticker.Ticker.shared.remove(this.update, this);
            this._isConnectedToTicker = false;
          } else if (this._autoUpdate && !this._isConnectedToTicker && this._isSourcePlaying()) {
            ticker.Ticker.shared.add(this.update, this);
            this._isConnectedToTicker = true;
          }
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(VideoResource2.prototype, "updateFPS", {
      get: function() {
        return this._updateFPS;
      },
      set: function(value) {
        if (value !== this._updateFPS) {
          this._updateFPS = value;
        }
      },
      enumerable: false,
      configurable: true
    });
    VideoResource2.test = function(source, extension) {
      return source instanceof HTMLVideoElement || VideoResource2.TYPES.indexOf(extension) > -1;
    };
    VideoResource2.TYPES = ["mp4", "m4v", "webm", "ogg", "ogv", "h264", "avi", "mov"];
    VideoResource2.MIME_TYPES = {
      ogv: "video/ogg",
      mov: "video/quicktime",
      m4v: "video/mp4"
    };
    return VideoResource2;
  }(BaseImageResource);
  var ImageBitmapResource = function(_super) {
    __extends(ImageBitmapResource2, _super);
    function ImageBitmapResource2() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    ImageBitmapResource2.test = function(source) {
      return !!window.createImageBitmap && source instanceof ImageBitmap;
    };
    return ImageBitmapResource2;
  }(BaseImageResource);
  INSTALLED.push(ImageResource, ImageBitmapResource, CanvasResource, VideoResource, SVGResource, BufferResource, CubeResource, ArrayResource);
  var index = {
    Resource,
    BaseImageResource,
    INSTALLED,
    autoDetectResource,
    AbstractMultiResource,
    ArrayResource,
    BufferResource,
    CanvasResource,
    CubeResource,
    ImageResource,
    SVGResource,
    VideoResource,
    ImageBitmapResource
  };
  var System = function() {
    function System2(renderer) {
      this.renderer = renderer;
    }
    System2.prototype.destroy = function() {
      this.renderer = null;
    };
    return System2;
  }();
  var DepthResource = function(_super) {
    __extends(DepthResource2, _super);
    function DepthResource2() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    DepthResource2.prototype.upload = function(renderer, baseTexture, glTexture) {
      var gl = renderer.gl;
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, baseTexture.alphaMode === constants.ALPHA_MODES.UNPACK);
      if (glTexture.width === baseTexture.width && glTexture.height === baseTexture.height) {
        gl.texSubImage2D(baseTexture.target, 0, 0, 0, baseTexture.width, baseTexture.height, baseTexture.format, baseTexture.type, this.data);
      } else {
        glTexture.width = baseTexture.width;
        glTexture.height = baseTexture.height;
        gl.texImage2D(baseTexture.target, 0, renderer.context.webGLVersion === 1 ? gl.DEPTH_COMPONENT : gl.DEPTH_COMPONENT16, baseTexture.width, baseTexture.height, 0, baseTexture.format, baseTexture.type, this.data);
      }
      return true;
    };
    return DepthResource2;
  }(BufferResource);
  var Framebuffer = function() {
    function Framebuffer2(width, height) {
      this.width = Math.ceil(width || 100);
      this.height = Math.ceil(height || 100);
      this.stencil = false;
      this.depth = false;
      this.dirtyId = 0;
      this.dirtyFormat = 0;
      this.dirtySize = 0;
      this.depthTexture = null;
      this.colorTextures = [];
      this.glFramebuffers = {};
      this.disposeRunner = new runner.Runner("disposeFramebuffer");
      this.multisample = constants.MSAA_QUALITY.NONE;
    }
    Object.defineProperty(Framebuffer2.prototype, "colorTexture", {
      get: function() {
        return this.colorTextures[0];
      },
      enumerable: false,
      configurable: true
    });
    Framebuffer2.prototype.addColorTexture = function(index2, texture) {
      if (index2 === void 0) {
        index2 = 0;
      }
      this.colorTextures[index2] = texture || new BaseTexture(null, {
        scaleMode: constants.SCALE_MODES.NEAREST,
        resolution: 1,
        mipmap: constants.MIPMAP_MODES.OFF,
        width: this.width,
        height: this.height
      });
      this.dirtyId++;
      this.dirtyFormat++;
      return this;
    };
    Framebuffer2.prototype.addDepthTexture = function(texture) {
      this.depthTexture = texture || new BaseTexture(new DepthResource(null, {width: this.width, height: this.height}), {
        scaleMode: constants.SCALE_MODES.NEAREST,
        resolution: 1,
        width: this.width,
        height: this.height,
        mipmap: constants.MIPMAP_MODES.OFF,
        format: constants.FORMATS.DEPTH_COMPONENT,
        type: constants.TYPES.UNSIGNED_SHORT
      });
      this.dirtyId++;
      this.dirtyFormat++;
      return this;
    };
    Framebuffer2.prototype.enableDepth = function() {
      this.depth = true;
      this.dirtyId++;
      this.dirtyFormat++;
      return this;
    };
    Framebuffer2.prototype.enableStencil = function() {
      this.stencil = true;
      this.dirtyId++;
      this.dirtyFormat++;
      return this;
    };
    Framebuffer2.prototype.resize = function(width, height) {
      width = Math.ceil(width);
      height = Math.ceil(height);
      if (width === this.width && height === this.height) {
        return;
      }
      this.width = width;
      this.height = height;
      this.dirtyId++;
      this.dirtySize++;
      for (var i = 0; i < this.colorTextures.length; i++) {
        var texture = this.colorTextures[i];
        var resolution = texture.resolution;
        texture.setSize(width / resolution, height / resolution);
      }
      if (this.depthTexture) {
        var resolution = this.depthTexture.resolution;
        this.depthTexture.setSize(width / resolution, height / resolution);
      }
    };
    Framebuffer2.prototype.dispose = function() {
      this.disposeRunner.emit(this, false);
    };
    Framebuffer2.prototype.destroyDepthTexture = function() {
      if (this.depthTexture) {
        this.depthTexture.destroy();
        this.depthTexture = null;
        ++this.dirtyId;
        ++this.dirtyFormat;
      }
    };
    return Framebuffer2;
  }();
  var BaseRenderTexture = function(_super) {
    __extends(BaseRenderTexture2, _super);
    function BaseRenderTexture2(options) {
      var _this = this;
      if (typeof options === "number") {
        var width_1 = arguments[0];
        var height_1 = arguments[1];
        var scaleMode = arguments[2];
        var resolution = arguments[3];
        options = {width: width_1, height: height_1, scaleMode, resolution};
      }
      _this = _super.call(this, null, options) || this;
      var _a = options || {}, width = _a.width, height = _a.height;
      _this.mipmap = 0;
      _this.width = Math.ceil(width) || 100;
      _this.height = Math.ceil(height) || 100;
      _this.valid = true;
      _this.clearColor = [0, 0, 0, 0];
      _this.framebuffer = new Framebuffer(_this.width * _this.resolution, _this.height * _this.resolution).addColorTexture(0, _this);
      _this.maskStack = [];
      _this.filterStack = [{}];
      return _this;
    }
    BaseRenderTexture2.prototype.resize = function(width, height) {
      width = Math.ceil(width);
      height = Math.ceil(height);
      this.framebuffer.resize(width * this.resolution, height * this.resolution);
    };
    BaseRenderTexture2.prototype.dispose = function() {
      this.framebuffer.dispose();
      _super.prototype.dispose.call(this);
    };
    BaseRenderTexture2.prototype.destroy = function() {
      _super.prototype.destroy.call(this);
      this.framebuffer.destroyDepthTexture();
      this.framebuffer = null;
    };
    return BaseRenderTexture2;
  }(BaseTexture);
  var TextureUvs = function() {
    function TextureUvs2() {
      this.x0 = 0;
      this.y0 = 0;
      this.x1 = 1;
      this.y1 = 0;
      this.x2 = 1;
      this.y2 = 1;
      this.x3 = 0;
      this.y3 = 1;
      this.uvsFloat32 = new Float32Array(8);
    }
    TextureUvs2.prototype.set = function(frame, baseFrame, rotate) {
      var tw = baseFrame.width;
      var th = baseFrame.height;
      if (rotate) {
        var w2 = frame.width / 2 / tw;
        var h2 = frame.height / 2 / th;
        var cX = frame.x / tw + w2;
        var cY = frame.y / th + h2;
        rotate = math.groupD8.add(rotate, math.groupD8.NW);
        this.x0 = cX + w2 * math.groupD8.uX(rotate);
        this.y0 = cY + h2 * math.groupD8.uY(rotate);
        rotate = math.groupD8.add(rotate, 2);
        this.x1 = cX + w2 * math.groupD8.uX(rotate);
        this.y1 = cY + h2 * math.groupD8.uY(rotate);
        rotate = math.groupD8.add(rotate, 2);
        this.x2 = cX + w2 * math.groupD8.uX(rotate);
        this.y2 = cY + h2 * math.groupD8.uY(rotate);
        rotate = math.groupD8.add(rotate, 2);
        this.x3 = cX + w2 * math.groupD8.uX(rotate);
        this.y3 = cY + h2 * math.groupD8.uY(rotate);
      } else {
        this.x0 = frame.x / tw;
        this.y0 = frame.y / th;
        this.x1 = (frame.x + frame.width) / tw;
        this.y1 = frame.y / th;
        this.x2 = (frame.x + frame.width) / tw;
        this.y2 = (frame.y + frame.height) / th;
        this.x3 = frame.x / tw;
        this.y3 = (frame.y + frame.height) / th;
      }
      this.uvsFloat32[0] = this.x0;
      this.uvsFloat32[1] = this.y0;
      this.uvsFloat32[2] = this.x1;
      this.uvsFloat32[3] = this.y1;
      this.uvsFloat32[4] = this.x2;
      this.uvsFloat32[5] = this.y2;
      this.uvsFloat32[6] = this.x3;
      this.uvsFloat32[7] = this.y3;
    };
    return TextureUvs2;
  }();
  var DEFAULT_UVS = new TextureUvs();
  var Texture = function(_super) {
    __extends(Texture2, _super);
    function Texture2(baseTexture, frame, orig, trim, rotate, anchor) {
      var _this = _super.call(this) || this;
      _this.noFrame = false;
      if (!frame) {
        _this.noFrame = true;
        frame = new math.Rectangle(0, 0, 1, 1);
      }
      if (baseTexture instanceof Texture2) {
        baseTexture = baseTexture.baseTexture;
      }
      _this.baseTexture = baseTexture;
      _this._frame = frame;
      _this.trim = trim;
      _this.valid = false;
      _this._uvs = DEFAULT_UVS;
      _this.uvMatrix = null;
      _this.orig = orig || frame;
      _this._rotate = Number(rotate || 0);
      if (rotate === true) {
        _this._rotate = 2;
      } else if (_this._rotate % 2 !== 0) {
        throw new Error("attempt to use diamond-shaped UVs. If you are sure, set rotation manually");
      }
      _this.defaultAnchor = anchor ? new math.Point(anchor.x, anchor.y) : new math.Point(0, 0);
      _this._updateID = 0;
      _this.textureCacheIds = [];
      if (!baseTexture.valid) {
        baseTexture.once("loaded", _this.onBaseTextureUpdated, _this);
      } else if (_this.noFrame) {
        if (baseTexture.valid) {
          _this.onBaseTextureUpdated(baseTexture);
        }
      } else {
        _this.frame = frame;
      }
      if (_this.noFrame) {
        baseTexture.on("update", _this.onBaseTextureUpdated, _this);
      }
      return _this;
    }
    Texture2.prototype.update = function() {
      if (this.baseTexture.resource) {
        this.baseTexture.resource.update();
      }
    };
    Texture2.prototype.onBaseTextureUpdated = function(baseTexture) {
      if (this.noFrame) {
        if (!this.baseTexture.valid) {
          return;
        }
        this._frame.width = baseTexture.width;
        this._frame.height = baseTexture.height;
        this.valid = true;
        this.updateUvs();
      } else {
        this.frame = this._frame;
      }
      this.emit("update", this);
    };
    Texture2.prototype.destroy = function(destroyBase) {
      if (this.baseTexture) {
        if (destroyBase) {
          var resource = this.baseTexture;
          if (resource && resource.url && utils.TextureCache[resource.url]) {
            Texture2.removeFromCache(resource.url);
          }
          this.baseTexture.destroy();
        }
        this.baseTexture.off("loaded", this.onBaseTextureUpdated, this);
        this.baseTexture.off("update", this.onBaseTextureUpdated, this);
        this.baseTexture = null;
      }
      this._frame = null;
      this._uvs = null;
      this.trim = null;
      this.orig = null;
      this.valid = false;
      Texture2.removeFromCache(this);
      this.textureCacheIds = null;
    };
    Texture2.prototype.clone = function() {
      return new Texture2(this.baseTexture, this.frame.clone(), this.orig.clone(), this.trim && this.trim.clone(), this.rotate, this.defaultAnchor);
    };
    Texture2.prototype.updateUvs = function() {
      if (this._uvs === DEFAULT_UVS) {
        this._uvs = new TextureUvs();
      }
      this._uvs.set(this._frame, this.baseTexture, this.rotate);
      this._updateID++;
    };
    Texture2.from = function(source, options, strict) {
      if (options === void 0) {
        options = {};
      }
      if (strict === void 0) {
        strict = settings.settings.STRICT_TEXTURE_CACHE;
      }
      var isFrame = typeof source === "string";
      var cacheId = null;
      if (isFrame) {
        cacheId = source;
      } else {
        if (!source._pixiId) {
          source._pixiId = "pixiid_" + utils.uid();
        }
        cacheId = source._pixiId;
      }
      var texture = utils.TextureCache[cacheId];
      if (isFrame && strict && !texture) {
        throw new Error('The cacheId "' + cacheId + '" does not exist in TextureCache.');
      }
      if (!texture) {
        if (!options.resolution) {
          options.resolution = utils.getResolutionOfUrl(source);
        }
        texture = new Texture2(new BaseTexture(source, options));
        texture.baseTexture.cacheId = cacheId;
        BaseTexture.addToCache(texture.baseTexture, cacheId);
        Texture2.addToCache(texture, cacheId);
      }
      return texture;
    };
    Texture2.fromURL = function(url, options) {
      var resourceOptions = Object.assign({autoLoad: false}, options === null || options === void 0 ? void 0 : options.resourceOptions);
      var texture = Texture2.from(url, Object.assign({resourceOptions}, options), false);
      var resource = texture.baseTexture.resource;
      if (texture.baseTexture.valid) {
        return Promise.resolve(texture);
      }
      return resource.load().then(function() {
        return Promise.resolve(texture);
      });
    };
    Texture2.fromBuffer = function(buffer, width, height, options) {
      return new Texture2(BaseTexture.fromBuffer(buffer, width, height, options));
    };
    Texture2.fromLoader = function(source, imageUrl, name) {
      var resource = new ImageResource(source);
      resource.url = imageUrl;
      var baseTexture = new BaseTexture(resource, {
        scaleMode: settings.settings.SCALE_MODE,
        resolution: utils.getResolutionOfUrl(imageUrl)
      });
      var texture = new Texture2(baseTexture);
      if (!name) {
        name = imageUrl;
      }
      BaseTexture.addToCache(texture.baseTexture, name);
      Texture2.addToCache(texture, name);
      if (name !== imageUrl) {
        BaseTexture.addToCache(texture.baseTexture, imageUrl);
        Texture2.addToCache(texture, imageUrl);
      }
      return texture;
    };
    Texture2.addToCache = function(texture, id) {
      if (id) {
        if (texture.textureCacheIds.indexOf(id) === -1) {
          texture.textureCacheIds.push(id);
        }
        if (utils.TextureCache[id]) {
          console.warn("Texture added to the cache with an id [" + id + "] that already had an entry");
        }
        utils.TextureCache[id] = texture;
      }
    };
    Texture2.removeFromCache = function(texture) {
      if (typeof texture === "string") {
        var textureFromCache = utils.TextureCache[texture];
        if (textureFromCache) {
          var index2 = textureFromCache.textureCacheIds.indexOf(texture);
          if (index2 > -1) {
            textureFromCache.textureCacheIds.splice(index2, 1);
          }
          delete utils.TextureCache[texture];
          return textureFromCache;
        }
      } else if (texture && texture.textureCacheIds) {
        for (var i = 0; i < texture.textureCacheIds.length; ++i) {
          if (utils.TextureCache[texture.textureCacheIds[i]] === texture) {
            delete utils.TextureCache[texture.textureCacheIds[i]];
          }
        }
        texture.textureCacheIds.length = 0;
        return texture;
      }
      return null;
    };
    Object.defineProperty(Texture2.prototype, "resolution", {
      get: function() {
        return this.baseTexture.resolution;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Texture2.prototype, "frame", {
      get: function() {
        return this._frame;
      },
      set: function(frame) {
        this._frame = frame;
        this.noFrame = false;
        var x = frame.x, y = frame.y, width = frame.width, height = frame.height;
        var xNotFit = x + width > this.baseTexture.width;
        var yNotFit = y + height > this.baseTexture.height;
        if (xNotFit || yNotFit) {
          var relationship = xNotFit && yNotFit ? "and" : "or";
          var errorX = "X: " + x + " + " + width + " = " + (x + width) + " > " + this.baseTexture.width;
          var errorY = "Y: " + y + " + " + height + " = " + (y + height) + " > " + this.baseTexture.height;
          throw new Error("Texture Error: frame does not fit inside the base Texture dimensions: " + (errorX + " " + relationship + " " + errorY));
        }
        this.valid = width && height && this.baseTexture.valid;
        if (!this.trim && !this.rotate) {
          this.orig = frame;
        }
        if (this.valid) {
          this.updateUvs();
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Texture2.prototype, "rotate", {
      get: function() {
        return this._rotate;
      },
      set: function(rotate) {
        this._rotate = rotate;
        if (this.valid) {
          this.updateUvs();
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Texture2.prototype, "width", {
      get: function() {
        return this.orig.width;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Texture2.prototype, "height", {
      get: function() {
        return this.orig.height;
      },
      enumerable: false,
      configurable: true
    });
    Texture2.prototype.castToBaseTexture = function() {
      return this.baseTexture;
    };
    return Texture2;
  }(utils.EventEmitter);
  function createWhiteTexture() {
    var canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    var context2 = canvas.getContext("2d");
    context2.fillStyle = "white";
    context2.fillRect(0, 0, 16, 16);
    return new Texture(new BaseTexture(new CanvasResource(canvas)));
  }
  function removeAllHandlers(tex) {
    tex.destroy = function _emptyDestroy() {
    };
    tex.on = function _emptyOn() {
    };
    tex.once = function _emptyOnce() {
    };
    tex.emit = function _emptyEmit() {
    };
  }
  Texture.EMPTY = new Texture(new BaseTexture());
  removeAllHandlers(Texture.EMPTY);
  removeAllHandlers(Texture.EMPTY.baseTexture);
  Texture.WHITE = createWhiteTexture();
  removeAllHandlers(Texture.WHITE);
  removeAllHandlers(Texture.WHITE.baseTexture);
  var RenderTexture = function(_super) {
    __extends(RenderTexture2, _super);
    function RenderTexture2(baseRenderTexture, frame) {
      var _this = this;
      var _legacyRenderer = null;
      if (!(baseRenderTexture instanceof BaseRenderTexture)) {
        var width = arguments[1];
        var height = arguments[2];
        var scaleMode = arguments[3];
        var resolution = arguments[4];
        console.warn("Please use RenderTexture.create(" + width + ", " + height + ") instead of the ctor directly.");
        _legacyRenderer = arguments[0];
        frame = null;
        baseRenderTexture = new BaseRenderTexture({
          width,
          height,
          scaleMode,
          resolution
        });
      }
      _this = _super.call(this, baseRenderTexture, frame) || this;
      _this.legacyRenderer = _legacyRenderer;
      _this.valid = true;
      _this.filterFrame = null;
      _this.filterPoolKey = null;
      _this.updateUvs();
      return _this;
    }
    Object.defineProperty(RenderTexture2.prototype, "framebuffer", {
      get: function() {
        return this.baseTexture.framebuffer;
      },
      enumerable: false,
      configurable: true
    });
    RenderTexture2.prototype.resize = function(width, height, resizeBaseTexture) {
      if (resizeBaseTexture === void 0) {
        resizeBaseTexture = true;
      }
      width = Math.ceil(width);
      height = Math.ceil(height);
      this.valid = width > 0 && height > 0;
      this._frame.width = this.orig.width = width;
      this._frame.height = this.orig.height = height;
      if (resizeBaseTexture) {
        this.baseTexture.resize(width, height);
      }
      this.updateUvs();
    };
    RenderTexture2.prototype.setResolution = function(resolution) {
      var baseTexture = this.baseTexture;
      if (baseTexture.resolution === resolution) {
        return;
      }
      baseTexture.setResolution(resolution);
      this.resize(baseTexture.width, baseTexture.height, false);
    };
    RenderTexture2.create = function(options) {
      if (typeof options === "number") {
        options = {
          width: options,
          height: arguments[1],
          scaleMode: arguments[2],
          resolution: arguments[3]
        };
      }
      return new RenderTexture2(new BaseRenderTexture(options));
    };
    return RenderTexture2;
  }(Texture);
  var RenderTexturePool = function() {
    function RenderTexturePool2(textureOptions) {
      this.texturePool = {};
      this.textureOptions = textureOptions || {};
      this.enableFullScreen = false;
      this._pixelsWidth = 0;
      this._pixelsHeight = 0;
    }
    RenderTexturePool2.prototype.createTexture = function(realWidth, realHeight) {
      var baseRenderTexture = new BaseRenderTexture(Object.assign({
        width: realWidth,
        height: realHeight,
        resolution: 1
      }, this.textureOptions));
      return new RenderTexture(baseRenderTexture);
    };
    RenderTexturePool2.prototype.getOptimalTexture = function(minWidth, minHeight, resolution) {
      if (resolution === void 0) {
        resolution = 1;
      }
      var key = RenderTexturePool2.SCREEN_KEY;
      minWidth *= resolution;
      minHeight *= resolution;
      if (!this.enableFullScreen || minWidth !== this._pixelsWidth || minHeight !== this._pixelsHeight) {
        minWidth = utils.nextPow2(minWidth);
        minHeight = utils.nextPow2(minHeight);
        key = (minWidth & 65535) << 16 | minHeight & 65535;
      }
      if (!this.texturePool[key]) {
        this.texturePool[key] = [];
      }
      var renderTexture = this.texturePool[key].pop();
      if (!renderTexture) {
        renderTexture = this.createTexture(minWidth, minHeight);
      }
      renderTexture.filterPoolKey = key;
      renderTexture.setResolution(resolution);
      return renderTexture;
    };
    RenderTexturePool2.prototype.getFilterTexture = function(input, resolution) {
      var filterTexture = this.getOptimalTexture(input.width, input.height, resolution || input.resolution);
      filterTexture.filterFrame = input.filterFrame;
      return filterTexture;
    };
    RenderTexturePool2.prototype.returnTexture = function(renderTexture) {
      var key = renderTexture.filterPoolKey;
      renderTexture.filterFrame = null;
      this.texturePool[key].push(renderTexture);
    };
    RenderTexturePool2.prototype.returnFilterTexture = function(renderTexture) {
      this.returnTexture(renderTexture);
    };
    RenderTexturePool2.prototype.clear = function(destroyTextures) {
      destroyTextures = destroyTextures !== false;
      if (destroyTextures) {
        for (var i in this.texturePool) {
          var textures = this.texturePool[i];
          if (textures) {
            for (var j = 0; j < textures.length; j++) {
              textures[j].destroy(true);
            }
          }
        }
      }
      this.texturePool = {};
    };
    RenderTexturePool2.prototype.setScreenSize = function(size) {
      if (size.width === this._pixelsWidth && size.height === this._pixelsHeight) {
        return;
      }
      var screenKey = RenderTexturePool2.SCREEN_KEY;
      var textures = this.texturePool[screenKey];
      this.enableFullScreen = size.width > 0 && size.height > 0;
      if (textures) {
        for (var j = 0; j < textures.length; j++) {
          textures[j].destroy(true);
        }
      }
      this.texturePool[screenKey] = [];
      this._pixelsWidth = size.width;
      this._pixelsHeight = size.height;
    };
    RenderTexturePool2.SCREEN_KEY = "screen";
    return RenderTexturePool2;
  }();
  var Attribute = function() {
    function Attribute2(buffer, size, normalized, type, stride, start, instance) {
      if (size === void 0) {
        size = 0;
      }
      if (normalized === void 0) {
        normalized = false;
      }
      if (type === void 0) {
        type = 5126;
      }
      this.buffer = buffer;
      this.size = size;
      this.normalized = normalized;
      this.type = type;
      this.stride = stride;
      this.start = start;
      this.instance = instance;
    }
    Attribute2.prototype.destroy = function() {
      this.buffer = null;
    };
    Attribute2.from = function(buffer, size, normalized, type, stride) {
      return new Attribute2(buffer, size, normalized, type, stride);
    };
    return Attribute2;
  }();
  var UID = 0;
  var Buffer2 = function() {
    function Buffer3(data, _static, index2) {
      if (_static === void 0) {
        _static = true;
      }
      if (index2 === void 0) {
        index2 = false;
      }
      this.data = data || new Float32Array(1);
      this._glBuffers = {};
      this._updateID = 0;
      this.index = index2;
      this.static = _static;
      this.id = UID++;
      this.disposeRunner = new runner.Runner("disposeBuffer");
    }
    Buffer3.prototype.update = function(data) {
      this.data = data || this.data;
      this._updateID++;
    };
    Buffer3.prototype.dispose = function() {
      this.disposeRunner.emit(this, false);
    };
    Buffer3.prototype.destroy = function() {
      this.dispose();
      this.data = null;
    };
    Buffer3.from = function(data) {
      if (data instanceof Array) {
        data = new Float32Array(data);
      }
      return new Buffer3(data);
    };
    return Buffer3;
  }();
  function getBufferType(array) {
    if (array.BYTES_PER_ELEMENT === 4) {
      if (array instanceof Float32Array) {
        return "Float32Array";
      } else if (array instanceof Uint32Array) {
        return "Uint32Array";
      }
      return "Int32Array";
    } else if (array.BYTES_PER_ELEMENT === 2) {
      if (array instanceof Uint16Array) {
        return "Uint16Array";
      }
    } else if (array.BYTES_PER_ELEMENT === 1) {
      if (array instanceof Uint8Array) {
        return "Uint8Array";
      }
    }
    return null;
  }
  var map = {
    Float32Array,
    Uint32Array,
    Int32Array,
    Uint8Array
  };
  function interleaveTypedArrays(arrays, sizes) {
    var outSize = 0;
    var stride = 0;
    var views = {};
    for (var i = 0; i < arrays.length; i++) {
      stride += sizes[i];
      outSize += arrays[i].length;
    }
    var buffer = new ArrayBuffer(outSize * 4);
    var out = null;
    var littleOffset = 0;
    for (var i = 0; i < arrays.length; i++) {
      var size = sizes[i];
      var array = arrays[i];
      var type = getBufferType(array);
      if (!views[type]) {
        views[type] = new map[type](buffer);
      }
      out = views[type];
      for (var j = 0; j < array.length; j++) {
        var indexStart = (j / size | 0) * stride + littleOffset;
        var index2 = j % size;
        out[indexStart + index2] = array[j];
      }
      littleOffset += size;
    }
    return new Float32Array(buffer);
  }
  var byteSizeMap = {5126: 4, 5123: 2, 5121: 1};
  var UID$1 = 0;
  var map$1 = {
    Float32Array,
    Uint32Array,
    Int32Array,
    Uint8Array,
    Uint16Array
  };
  var Geometry = function() {
    function Geometry2(buffers, attributes) {
      if (buffers === void 0) {
        buffers = [];
      }
      if (attributes === void 0) {
        attributes = {};
      }
      this.buffers = buffers;
      this.indexBuffer = null;
      this.attributes = attributes;
      this.glVertexArrayObjects = {};
      this.id = UID$1++;
      this.instanced = false;
      this.instanceCount = 1;
      this.disposeRunner = new runner.Runner("disposeGeometry");
      this.refCount = 0;
    }
    Geometry2.prototype.addAttribute = function(id, buffer, size, normalized, type, stride, start, instance) {
      if (size === void 0) {
        size = 0;
      }
      if (normalized === void 0) {
        normalized = false;
      }
      if (instance === void 0) {
        instance = false;
      }
      if (!buffer) {
        throw new Error("You must pass a buffer when creating an attribute");
      }
      if (!(buffer instanceof Buffer2)) {
        if (buffer instanceof Array) {
          buffer = new Float32Array(buffer);
        }
        buffer = new Buffer2(buffer);
      }
      var ids = id.split("|");
      if (ids.length > 1) {
        for (var i = 0; i < ids.length; i++) {
          this.addAttribute(ids[i], buffer, size, normalized, type);
        }
        return this;
      }
      var bufferIndex = this.buffers.indexOf(buffer);
      if (bufferIndex === -1) {
        this.buffers.push(buffer);
        bufferIndex = this.buffers.length - 1;
      }
      this.attributes[id] = new Attribute(bufferIndex, size, normalized, type, stride, start, instance);
      this.instanced = this.instanced || instance;
      return this;
    };
    Geometry2.prototype.getAttribute = function(id) {
      return this.attributes[id];
    };
    Geometry2.prototype.getBuffer = function(id) {
      return this.buffers[this.getAttribute(id).buffer];
    };
    Geometry2.prototype.addIndex = function(buffer) {
      if (!(buffer instanceof Buffer2)) {
        if (buffer instanceof Array) {
          buffer = new Uint16Array(buffer);
        }
        buffer = new Buffer2(buffer);
      }
      buffer.index = true;
      this.indexBuffer = buffer;
      if (this.buffers.indexOf(buffer) === -1) {
        this.buffers.push(buffer);
      }
      return this;
    };
    Geometry2.prototype.getIndex = function() {
      return this.indexBuffer;
    };
    Geometry2.prototype.interleave = function() {
      if (this.buffers.length === 1 || this.buffers.length === 2 && this.indexBuffer) {
        return this;
      }
      var arrays = [];
      var sizes = [];
      var interleavedBuffer = new Buffer2();
      var i;
      for (i in this.attributes) {
        var attribute = this.attributes[i];
        var buffer = this.buffers[attribute.buffer];
        arrays.push(buffer.data);
        sizes.push(attribute.size * byteSizeMap[attribute.type] / 4);
        attribute.buffer = 0;
      }
      interleavedBuffer.data = interleaveTypedArrays(arrays, sizes);
      for (i = 0; i < this.buffers.length; i++) {
        if (this.buffers[i] !== this.indexBuffer) {
          this.buffers[i].destroy();
        }
      }
      this.buffers = [interleavedBuffer];
      if (this.indexBuffer) {
        this.buffers.push(this.indexBuffer);
      }
      return this;
    };
    Geometry2.prototype.getSize = function() {
      for (var i in this.attributes) {
        var attribute = this.attributes[i];
        var buffer = this.buffers[attribute.buffer];
        return buffer.data.length / (attribute.stride / 4 || attribute.size);
      }
      return 0;
    };
    Geometry2.prototype.dispose = function() {
      this.disposeRunner.emit(this, false);
    };
    Geometry2.prototype.destroy = function() {
      this.dispose();
      this.buffers = null;
      this.indexBuffer = null;
      this.attributes = null;
    };
    Geometry2.prototype.clone = function() {
      var geometry = new Geometry2();
      for (var i = 0; i < this.buffers.length; i++) {
        geometry.buffers[i] = new Buffer2(this.buffers[i].data.slice(0));
      }
      for (var i in this.attributes) {
        var attrib = this.attributes[i];
        geometry.attributes[i] = new Attribute(attrib.buffer, attrib.size, attrib.normalized, attrib.type, attrib.stride, attrib.start, attrib.instance);
      }
      if (this.indexBuffer) {
        geometry.indexBuffer = geometry.buffers[this.buffers.indexOf(this.indexBuffer)];
        geometry.indexBuffer.index = true;
      }
      return geometry;
    };
    Geometry2.merge = function(geometries) {
      var geometryOut = new Geometry2();
      var arrays = [];
      var sizes = [];
      var offsets = [];
      var geometry;
      for (var i = 0; i < geometries.length; i++) {
        geometry = geometries[i];
        for (var j = 0; j < geometry.buffers.length; j++) {
          sizes[j] = sizes[j] || 0;
          sizes[j] += geometry.buffers[j].data.length;
          offsets[j] = 0;
        }
      }
      for (var i = 0; i < geometry.buffers.length; i++) {
        arrays[i] = new map$1[getBufferType(geometry.buffers[i].data)](sizes[i]);
        geometryOut.buffers[i] = new Buffer2(arrays[i]);
      }
      for (var i = 0; i < geometries.length; i++) {
        geometry = geometries[i];
        for (var j = 0; j < geometry.buffers.length; j++) {
          arrays[j].set(geometry.buffers[j].data, offsets[j]);
          offsets[j] += geometry.buffers[j].data.length;
        }
      }
      geometryOut.attributes = geometry.attributes;
      if (geometry.indexBuffer) {
        geometryOut.indexBuffer = geometryOut.buffers[geometry.buffers.indexOf(geometry.indexBuffer)];
        geometryOut.indexBuffer.index = true;
        var offset = 0;
        var stride = 0;
        var offset2 = 0;
        var bufferIndexToCount = 0;
        for (var i = 0; i < geometry.buffers.length; i++) {
          if (geometry.buffers[i] !== geometry.indexBuffer) {
            bufferIndexToCount = i;
            break;
          }
        }
        for (var i in geometry.attributes) {
          var attribute = geometry.attributes[i];
          if ((attribute.buffer | 0) === bufferIndexToCount) {
            stride += attribute.size * byteSizeMap[attribute.type] / 4;
          }
        }
        for (var i = 0; i < geometries.length; i++) {
          var indexBufferData = geometries[i].indexBuffer.data;
          for (var j = 0; j < indexBufferData.length; j++) {
            geometryOut.indexBuffer.data[j + offset2] += offset;
          }
          offset += geometry.buffers[bufferIndexToCount].data.length / stride;
          offset2 += indexBufferData.length;
        }
      }
      return geometryOut;
    };
    return Geometry2;
  }();
  var Quad = function(_super) {
    __extends(Quad2, _super);
    function Quad2() {
      var _this = _super.call(this) || this;
      _this.addAttribute("aVertexPosition", new Float32Array([
        0,
        0,
        1,
        0,
        1,
        1,
        0,
        1
      ])).addIndex([0, 1, 3, 2]);
      return _this;
    }
    return Quad2;
  }(Geometry);
  var QuadUv = function(_super) {
    __extends(QuadUv2, _super);
    function QuadUv2() {
      var _this = _super.call(this) || this;
      _this.vertices = new Float32Array([
        -1,
        -1,
        1,
        -1,
        1,
        1,
        -1,
        1
      ]);
      _this.uvs = new Float32Array([
        0,
        0,
        1,
        0,
        1,
        1,
        0,
        1
      ]);
      _this.vertexBuffer = new Buffer2(_this.vertices);
      _this.uvBuffer = new Buffer2(_this.uvs);
      _this.addAttribute("aVertexPosition", _this.vertexBuffer).addAttribute("aTextureCoord", _this.uvBuffer).addIndex([0, 1, 2, 0, 2, 3]);
      return _this;
    }
    QuadUv2.prototype.map = function(targetTextureFrame, destinationFrame) {
      var x = 0;
      var y = 0;
      this.uvs[0] = x;
      this.uvs[1] = y;
      this.uvs[2] = x + destinationFrame.width / targetTextureFrame.width;
      this.uvs[3] = y;
      this.uvs[4] = x + destinationFrame.width / targetTextureFrame.width;
      this.uvs[5] = y + destinationFrame.height / targetTextureFrame.height;
      this.uvs[6] = x;
      this.uvs[7] = y + destinationFrame.height / targetTextureFrame.height;
      x = destinationFrame.x;
      y = destinationFrame.y;
      this.vertices[0] = x;
      this.vertices[1] = y;
      this.vertices[2] = x + destinationFrame.width;
      this.vertices[3] = y;
      this.vertices[4] = x + destinationFrame.width;
      this.vertices[5] = y + destinationFrame.height;
      this.vertices[6] = x;
      this.vertices[7] = y + destinationFrame.height;
      this.invalidate();
      return this;
    };
    QuadUv2.prototype.invalidate = function() {
      this.vertexBuffer._updateID++;
      this.uvBuffer._updateID++;
      return this;
    };
    return QuadUv2;
  }(Geometry);
  var UID$2 = 0;
  var UniformGroup = function() {
    function UniformGroup2(uniforms, _static) {
      this.uniforms = uniforms;
      this.group = true;
      this.syncUniforms = {};
      this.dirtyId = 0;
      this.id = UID$2++;
      this.static = !!_static;
    }
    UniformGroup2.prototype.update = function() {
      this.dirtyId++;
    };
    UniformGroup2.prototype.add = function(name, uniforms, _static) {
      this.uniforms[name] = new UniformGroup2(uniforms, _static);
    };
    UniformGroup2.from = function(uniforms, _static) {
      return new UniformGroup2(uniforms, _static);
    };
    return UniformGroup2;
  }();
  var FilterState = function() {
    function FilterState2() {
      this.renderTexture = null;
      this.target = null;
      this.legacy = false;
      this.resolution = 1;
      this.sourceFrame = new math.Rectangle();
      this.destinationFrame = new math.Rectangle();
      this.filters = [];
    }
    FilterState2.prototype.clear = function() {
      this.target = null;
      this.filters = null;
      this.renderTexture = null;
    };
    return FilterState2;
  }();
  var FilterSystem = function(_super) {
    __extends(FilterSystem2, _super);
    function FilterSystem2(renderer) {
      var _this = _super.call(this, renderer) || this;
      _this.defaultFilterStack = [{}];
      _this.texturePool = new RenderTexturePool();
      _this.texturePool.setScreenSize(renderer.view);
      _this.statePool = [];
      _this.quad = new Quad();
      _this.quadUv = new QuadUv();
      _this.tempRect = new math.Rectangle();
      _this.activeState = {};
      _this.globalUniforms = new UniformGroup({
        outputFrame: _this.tempRect,
        inputSize: new Float32Array(4),
        inputPixel: new Float32Array(4),
        inputClamp: new Float32Array(4),
        resolution: 1,
        filterArea: new Float32Array(4),
        filterClamp: new Float32Array(4)
      }, true);
      _this.forceClear = false;
      _this.useMaxPadding = false;
      return _this;
    }
    FilterSystem2.prototype.push = function(target, filters) {
      var renderer = this.renderer;
      var filterStack = this.defaultFilterStack;
      var state = this.statePool.pop() || new FilterState();
      var resolution = filters[0].resolution;
      var padding = filters[0].padding;
      var autoFit = filters[0].autoFit;
      var legacy = filters[0].legacy;
      for (var i = 1; i < filters.length; i++) {
        var filter = filters[i];
        resolution = Math.min(resolution, filter.resolution);
        padding = this.useMaxPadding ? Math.max(padding, filter.padding) : padding + filter.padding;
        autoFit = autoFit && filter.autoFit;
        legacy = legacy || filter.legacy;
      }
      if (filterStack.length === 1) {
        this.defaultFilterStack[0].renderTexture = renderer.renderTexture.current;
      }
      filterStack.push(state);
      state.resolution = resolution;
      state.legacy = legacy;
      state.target = target;
      state.sourceFrame.copyFrom(target.filterArea || target.getBounds(true));
      state.sourceFrame.pad(padding);
      if (autoFit) {
        state.sourceFrame.fit(this.renderer.renderTexture.sourceFrame);
      }
      state.sourceFrame.ceil(resolution);
      state.renderTexture = this.getOptimalFilterTexture(state.sourceFrame.width, state.sourceFrame.height, resolution);
      state.filters = filters;
      state.destinationFrame.width = state.renderTexture.width;
      state.destinationFrame.height = state.renderTexture.height;
      var destinationFrame = this.tempRect;
      destinationFrame.width = state.sourceFrame.width;
      destinationFrame.height = state.sourceFrame.height;
      state.renderTexture.filterFrame = state.sourceFrame;
      renderer.renderTexture.bind(state.renderTexture, state.sourceFrame, destinationFrame);
      renderer.renderTexture.clear();
    };
    FilterSystem2.prototype.pop = function() {
      var filterStack = this.defaultFilterStack;
      var state = filterStack.pop();
      var filters = state.filters;
      this.activeState = state;
      var globalUniforms = this.globalUniforms.uniforms;
      globalUniforms.outputFrame = state.sourceFrame;
      globalUniforms.resolution = state.resolution;
      var inputSize = globalUniforms.inputSize;
      var inputPixel = globalUniforms.inputPixel;
      var inputClamp = globalUniforms.inputClamp;
      inputSize[0] = state.destinationFrame.width;
      inputSize[1] = state.destinationFrame.height;
      inputSize[2] = 1 / inputSize[0];
      inputSize[3] = 1 / inputSize[1];
      inputPixel[0] = inputSize[0] * state.resolution;
      inputPixel[1] = inputSize[1] * state.resolution;
      inputPixel[2] = 1 / inputPixel[0];
      inputPixel[3] = 1 / inputPixel[1];
      inputClamp[0] = 0.5 * inputPixel[2];
      inputClamp[1] = 0.5 * inputPixel[3];
      inputClamp[2] = state.sourceFrame.width * inputSize[2] - 0.5 * inputPixel[2];
      inputClamp[3] = state.sourceFrame.height * inputSize[3] - 0.5 * inputPixel[3];
      if (state.legacy) {
        var filterArea = globalUniforms.filterArea;
        filterArea[0] = state.destinationFrame.width;
        filterArea[1] = state.destinationFrame.height;
        filterArea[2] = state.sourceFrame.x;
        filterArea[3] = state.sourceFrame.y;
        globalUniforms.filterClamp = globalUniforms.inputClamp;
      }
      this.globalUniforms.update();
      var lastState = filterStack[filterStack.length - 1];
      if (state.renderTexture.framebuffer.multisample > 1) {
        this.renderer.framebuffer.blit();
      }
      if (filters.length === 1) {
        filters[0].apply(this, state.renderTexture, lastState.renderTexture, constants.CLEAR_MODES.BLEND, state);
        this.returnFilterTexture(state.renderTexture);
      } else {
        var flip = state.renderTexture;
        var flop = this.getOptimalFilterTexture(flip.width, flip.height, state.resolution);
        flop.filterFrame = flip.filterFrame;
        var i = 0;
        for (i = 0; i < filters.length - 1; ++i) {
          filters[i].apply(this, flip, flop, constants.CLEAR_MODES.CLEAR, state);
          var t = flip;
          flip = flop;
          flop = t;
        }
        filters[i].apply(this, flip, lastState.renderTexture, constants.CLEAR_MODES.BLEND, state);
        this.returnFilterTexture(flip);
        this.returnFilterTexture(flop);
      }
      state.clear();
      this.statePool.push(state);
    };
    FilterSystem2.prototype.bindAndClear = function(filterTexture, clearMode) {
      if (clearMode === void 0) {
        clearMode = constants.CLEAR_MODES.CLEAR;
      }
      if (filterTexture && filterTexture.filterFrame) {
        var destinationFrame = this.tempRect;
        destinationFrame.width = filterTexture.filterFrame.width;
        destinationFrame.height = filterTexture.filterFrame.height;
        this.renderer.renderTexture.bind(filterTexture, filterTexture.filterFrame, destinationFrame);
      } else {
        this.renderer.renderTexture.bind(filterTexture);
      }
      if (typeof clearMode === "boolean") {
        clearMode = clearMode ? constants.CLEAR_MODES.CLEAR : constants.CLEAR_MODES.BLEND;
        utils.deprecation("5.2.1", "Use CLEAR_MODES when using clear applyFilter option");
      }
      if (clearMode === constants.CLEAR_MODES.CLEAR || clearMode === constants.CLEAR_MODES.BLIT && this.forceClear) {
        this.renderer.renderTexture.clear();
      }
    };
    FilterSystem2.prototype.applyFilter = function(filter, input, output, clearMode) {
      var renderer = this.renderer;
      this.bindAndClear(output, clearMode);
      filter.uniforms.uSampler = input;
      filter.uniforms.filterGlobals = this.globalUniforms;
      renderer.state.set(filter.state);
      renderer.shader.bind(filter);
      if (filter.legacy) {
        this.quadUv.map(input._frame, input.filterFrame);
        renderer.geometry.bind(this.quadUv);
        renderer.geometry.draw(constants.DRAW_MODES.TRIANGLES);
      } else {
        renderer.geometry.bind(this.quad);
        renderer.geometry.draw(constants.DRAW_MODES.TRIANGLE_STRIP);
      }
    };
    FilterSystem2.prototype.calculateSpriteMatrix = function(outputMatrix, sprite) {
      var _a = this.activeState, sourceFrame = _a.sourceFrame, destinationFrame = _a.destinationFrame;
      var orig = sprite._texture.orig;
      var mappedMatrix = outputMatrix.set(destinationFrame.width, 0, 0, destinationFrame.height, sourceFrame.x, sourceFrame.y);
      var worldTransform = sprite.worldTransform.copyTo(math.Matrix.TEMP_MATRIX);
      worldTransform.invert();
      mappedMatrix.prepend(worldTransform);
      mappedMatrix.scale(1 / orig.width, 1 / orig.height);
      mappedMatrix.translate(sprite.anchor.x, sprite.anchor.y);
      return mappedMatrix;
    };
    FilterSystem2.prototype.destroy = function() {
      this.texturePool.clear(false);
    };
    FilterSystem2.prototype.getOptimalFilterTexture = function(minWidth, minHeight, resolution) {
      if (resolution === void 0) {
        resolution = 1;
      }
      return this.texturePool.getOptimalTexture(minWidth, minHeight, resolution);
    };
    FilterSystem2.prototype.getFilterTexture = function(input, resolution) {
      if (typeof input === "number") {
        var swap = input;
        input = resolution;
        resolution = swap;
      }
      input = input || this.activeState.renderTexture;
      var filterTexture = this.texturePool.getOptimalTexture(input.width, input.height, resolution || input.resolution);
      filterTexture.filterFrame = input.filterFrame;
      return filterTexture;
    };
    FilterSystem2.prototype.returnFilterTexture = function(renderTexture) {
      this.texturePool.returnTexture(renderTexture);
    };
    FilterSystem2.prototype.emptyPool = function() {
      this.texturePool.clear(true);
    };
    FilterSystem2.prototype.resize = function() {
      this.texturePool.setScreenSize(this.renderer.view);
    };
    return FilterSystem2;
  }(System);
  var ObjectRenderer = function() {
    function ObjectRenderer2(renderer) {
      this.renderer = renderer;
    }
    ObjectRenderer2.prototype.flush = function() {
    };
    ObjectRenderer2.prototype.destroy = function() {
      this.renderer = null;
    };
    ObjectRenderer2.prototype.start = function() {
    };
    ObjectRenderer2.prototype.stop = function() {
      this.flush();
    };
    ObjectRenderer2.prototype.render = function(_object) {
    };
    return ObjectRenderer2;
  }();
  var BatchSystem = function(_super) {
    __extends(BatchSystem2, _super);
    function BatchSystem2(renderer) {
      var _this = _super.call(this, renderer) || this;
      _this.emptyRenderer = new ObjectRenderer(renderer);
      _this.currentRenderer = _this.emptyRenderer;
      return _this;
    }
    BatchSystem2.prototype.setObjectRenderer = function(objectRenderer) {
      if (this.currentRenderer === objectRenderer) {
        return;
      }
      this.currentRenderer.stop();
      this.currentRenderer = objectRenderer;
      this.currentRenderer.start();
    };
    BatchSystem2.prototype.flush = function() {
      this.setObjectRenderer(this.emptyRenderer);
    };
    BatchSystem2.prototype.reset = function() {
      this.setObjectRenderer(this.emptyRenderer);
    };
    BatchSystem2.prototype.copyBoundTextures = function(arr, maxTextures) {
      var boundTextures = this.renderer.texture.boundTextures;
      for (var i = maxTextures - 1; i >= 0; --i) {
        arr[i] = boundTextures[i] || null;
        if (arr[i]) {
          arr[i]._batchLocation = i;
        }
      }
    };
    BatchSystem2.prototype.boundArray = function(texArray, boundTextures, batchId, maxTextures) {
      var elements = texArray.elements, ids = texArray.ids, count = texArray.count;
      var j = 0;
      for (var i = 0; i < count; i++) {
        var tex = elements[i];
        var loc = tex._batchLocation;
        if (loc >= 0 && loc < maxTextures && boundTextures[loc] === tex) {
          ids[i] = loc;
          continue;
        }
        while (j < maxTextures) {
          var bound = boundTextures[j];
          if (bound && bound._batchEnabled === batchId && bound._batchLocation === j) {
            j++;
            continue;
          }
          ids[i] = j;
          tex._batchLocation = j;
          boundTextures[j] = tex;
          break;
        }
      }
    };
    return BatchSystem2;
  }(System);
  var CONTEXT_UID_COUNTER = 0;
  var ContextSystem = function(_super) {
    __extends(ContextSystem2, _super);
    function ContextSystem2(renderer) {
      var _this = _super.call(this, renderer) || this;
      _this.webGLVersion = 1;
      _this.extensions = {};
      _this.supports = {
        uint32Indices: false
      };
      _this.handleContextLost = _this.handleContextLost.bind(_this);
      _this.handleContextRestored = _this.handleContextRestored.bind(_this);
      renderer.view.addEventListener("webglcontextlost", _this.handleContextLost, false);
      renderer.view.addEventListener("webglcontextrestored", _this.handleContextRestored, false);
      return _this;
    }
    Object.defineProperty(ContextSystem2.prototype, "isLost", {
      get: function() {
        return !this.gl || this.gl.isContextLost();
      },
      enumerable: false,
      configurable: true
    });
    ContextSystem2.prototype.contextChange = function(gl) {
      this.gl = gl;
      this.renderer.gl = gl;
      this.renderer.CONTEXT_UID = CONTEXT_UID_COUNTER++;
      if (gl.isContextLost() && gl.getExtension("WEBGL_lose_context")) {
        gl.getExtension("WEBGL_lose_context").restoreContext();
      }
    };
    ContextSystem2.prototype.initFromContext = function(gl) {
      this.gl = gl;
      this.validateContext(gl);
      this.renderer.gl = gl;
      this.renderer.CONTEXT_UID = CONTEXT_UID_COUNTER++;
      this.renderer.runners.contextChange.emit(gl);
    };
    ContextSystem2.prototype.initFromOptions = function(options) {
      var gl = this.createContext(this.renderer.view, options);
      this.initFromContext(gl);
    };
    ContextSystem2.prototype.createContext = function(canvas, options) {
      var gl;
      if (settings.settings.PREFER_ENV >= constants.ENV.WEBGL2) {
        gl = canvas.getContext("webgl2", options);
      }
      if (gl) {
        this.webGLVersion = 2;
      } else {
        this.webGLVersion = 1;
        gl = canvas.getContext("webgl", options) || canvas.getContext("experimental-webgl", options);
        if (!gl) {
          throw new Error("This browser does not support WebGL. Try using the canvas renderer");
        }
      }
      this.gl = gl;
      this.getExtensions();
      return this.gl;
    };
    ContextSystem2.prototype.getExtensions = function() {
      var gl = this.gl;
      if (this.webGLVersion === 1) {
        Object.assign(this.extensions, {
          drawBuffers: gl.getExtension("WEBGL_draw_buffers"),
          depthTexture: gl.getExtension("WEBGL_depth_texture"),
          loseContext: gl.getExtension("WEBGL_lose_context"),
          vertexArrayObject: gl.getExtension("OES_vertex_array_object") || gl.getExtension("MOZ_OES_vertex_array_object") || gl.getExtension("WEBKIT_OES_vertex_array_object"),
          anisotropicFiltering: gl.getExtension("EXT_texture_filter_anisotropic"),
          uint32ElementIndex: gl.getExtension("OES_element_index_uint"),
          floatTexture: gl.getExtension("OES_texture_float"),
          floatTextureLinear: gl.getExtension("OES_texture_float_linear"),
          textureHalfFloat: gl.getExtension("OES_texture_half_float"),
          textureHalfFloatLinear: gl.getExtension("OES_texture_half_float_linear")
        });
      } else if (this.webGLVersion === 2) {
        Object.assign(this.extensions, {
          anisotropicFiltering: gl.getExtension("EXT_texture_filter_anisotropic"),
          colorBufferFloat: gl.getExtension("EXT_color_buffer_float"),
          floatTextureLinear: gl.getExtension("OES_texture_float_linear")
        });
      }
    };
    ContextSystem2.prototype.handleContextLost = function(event) {
      event.preventDefault();
    };
    ContextSystem2.prototype.handleContextRestored = function() {
      this.renderer.runners.contextChange.emit(this.gl);
    };
    ContextSystem2.prototype.destroy = function() {
      var view = this.renderer.view;
      view.removeEventListener("webglcontextlost", this.handleContextLost);
      view.removeEventListener("webglcontextrestored", this.handleContextRestored);
      this.gl.useProgram(null);
      if (this.extensions.loseContext) {
        this.extensions.loseContext.loseContext();
      }
    };
    ContextSystem2.prototype.postrender = function() {
      if (this.renderer.renderingToScreen) {
        this.gl.flush();
      }
    };
    ContextSystem2.prototype.validateContext = function(gl) {
      var attributes = gl.getContextAttributes();
      var isWebGl2 = "WebGL2RenderingContext" in window && gl instanceof window.WebGL2RenderingContext;
      if (isWebGl2) {
        this.webGLVersion = 2;
      }
      if (!attributes.stencil) {
        console.warn("Provided WebGL context does not have a stencil buffer, masks may not render correctly");
      }
      var hasuint32 = isWebGl2 || !!gl.getExtension("OES_element_index_uint");
      this.supports.uint32Indices = hasuint32;
      if (!hasuint32) {
        console.warn("Provided WebGL context does not support 32 index buffer, complex graphics may not render correctly");
      }
    };
    return ContextSystem2;
  }(System);
  var GLFramebuffer = function() {
    function GLFramebuffer2(framebuffer) {
      this.framebuffer = framebuffer;
      this.stencil = null;
      this.dirtyId = 0;
      this.dirtyFormat = 0;
      this.dirtySize = 0;
      this.multisample = constants.MSAA_QUALITY.NONE;
      this.msaaBuffer = null;
      this.blitFramebuffer = null;
    }
    return GLFramebuffer2;
  }();
  var tempRectangle = new math.Rectangle();
  var FramebufferSystem = function(_super) {
    __extends(FramebufferSystem2, _super);
    function FramebufferSystem2(renderer) {
      var _this = _super.call(this, renderer) || this;
      _this.managedFramebuffers = [];
      _this.unknownFramebuffer = new Framebuffer(10, 10);
      _this.msaaSamples = null;
      return _this;
    }
    FramebufferSystem2.prototype.contextChange = function() {
      var gl = this.gl = this.renderer.gl;
      this.CONTEXT_UID = this.renderer.CONTEXT_UID;
      this.current = this.unknownFramebuffer;
      this.viewport = new math.Rectangle();
      this.hasMRT = true;
      this.writeDepthTexture = true;
      this.disposeAll(true);
      if (this.renderer.context.webGLVersion === 1) {
        var nativeDrawBuffersExtension_1 = this.renderer.context.extensions.drawBuffers;
        var nativeDepthTextureExtension = this.renderer.context.extensions.depthTexture;
        if (settings.settings.PREFER_ENV === constants.ENV.WEBGL_LEGACY) {
          nativeDrawBuffersExtension_1 = null;
          nativeDepthTextureExtension = null;
        }
        if (nativeDrawBuffersExtension_1) {
          gl.drawBuffers = function(activeTextures) {
            return nativeDrawBuffersExtension_1.drawBuffersWEBGL(activeTextures);
          };
        } else {
          this.hasMRT = false;
          gl.drawBuffers = function() {
          };
        }
        if (!nativeDepthTextureExtension) {
          this.writeDepthTexture = false;
        }
      } else {
        this.msaaSamples = gl.getInternalformatParameter(gl.RENDERBUFFER, gl.RGBA8, gl.SAMPLES);
      }
    };
    FramebufferSystem2.prototype.bind = function(framebuffer, frame) {
      var gl = this.gl;
      if (framebuffer) {
        var fbo = framebuffer.glFramebuffers[this.CONTEXT_UID] || this.initFramebuffer(framebuffer);
        if (this.current !== framebuffer) {
          this.current = framebuffer;
          gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.framebuffer);
        }
        if (fbo.dirtyId !== framebuffer.dirtyId) {
          fbo.dirtyId = framebuffer.dirtyId;
          if (fbo.dirtyFormat !== framebuffer.dirtyFormat) {
            fbo.dirtyFormat = framebuffer.dirtyFormat;
            this.updateFramebuffer(framebuffer);
          } else if (fbo.dirtySize !== framebuffer.dirtySize) {
            fbo.dirtySize = framebuffer.dirtySize;
            this.resizeFramebuffer(framebuffer);
          }
        }
        for (var i = 0; i < framebuffer.colorTextures.length; i++) {
          var tex = framebuffer.colorTextures[i];
          this.renderer.texture.unbind(tex.parentTextureArray || tex);
        }
        if (framebuffer.depthTexture) {
          this.renderer.texture.unbind(framebuffer.depthTexture);
        }
        if (frame) {
          this.setViewport(frame.x, frame.y, frame.width, frame.height);
        } else {
          this.setViewport(0, 0, framebuffer.width, framebuffer.height);
        }
      } else {
        if (this.current) {
          this.current = null;
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
        if (frame) {
          this.setViewport(frame.x, frame.y, frame.width, frame.height);
        } else {
          this.setViewport(0, 0, this.renderer.width, this.renderer.height);
        }
      }
    };
    FramebufferSystem2.prototype.setViewport = function(x, y, width, height) {
      var v = this.viewport;
      if (v.width !== width || v.height !== height || v.x !== x || v.y !== y) {
        v.x = x;
        v.y = y;
        v.width = width;
        v.height = height;
        this.gl.viewport(x, y, width, height);
      }
    };
    Object.defineProperty(FramebufferSystem2.prototype, "size", {
      get: function() {
        if (this.current) {
          return {x: 0, y: 0, width: this.current.width, height: this.current.height};
        }
        return {x: 0, y: 0, width: this.renderer.width, height: this.renderer.height};
      },
      enumerable: false,
      configurable: true
    });
    FramebufferSystem2.prototype.clear = function(r, g, b, a, mask) {
      if (mask === void 0) {
        mask = constants.BUFFER_BITS.COLOR | constants.BUFFER_BITS.DEPTH;
      }
      var gl = this.gl;
      gl.clearColor(r, g, b, a);
      gl.clear(mask);
    };
    FramebufferSystem2.prototype.initFramebuffer = function(framebuffer) {
      var gl = this.gl;
      var fbo = new GLFramebuffer(gl.createFramebuffer());
      fbo.multisample = this.detectSamples(framebuffer.multisample);
      framebuffer.glFramebuffers[this.CONTEXT_UID] = fbo;
      this.managedFramebuffers.push(framebuffer);
      framebuffer.disposeRunner.add(this);
      return fbo;
    };
    FramebufferSystem2.prototype.resizeFramebuffer = function(framebuffer) {
      var gl = this.gl;
      var fbo = framebuffer.glFramebuffers[this.CONTEXT_UID];
      if (fbo.stencil) {
        gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.stencil);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, framebuffer.width, framebuffer.height);
      }
      var colorTextures = framebuffer.colorTextures;
      for (var i = 0; i < colorTextures.length; i++) {
        this.renderer.texture.bind(colorTextures[i], 0);
      }
      if (framebuffer.depthTexture) {
        this.renderer.texture.bind(framebuffer.depthTexture, 0);
      }
    };
    FramebufferSystem2.prototype.updateFramebuffer = function(framebuffer) {
      var gl = this.gl;
      var fbo = framebuffer.glFramebuffers[this.CONTEXT_UID];
      var colorTextures = framebuffer.colorTextures;
      var count = colorTextures.length;
      if (!gl.drawBuffers) {
        count = Math.min(count, 1);
      }
      if (fbo.multisample > 1) {
        fbo.msaaBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.msaaBuffer);
        gl.renderbufferStorageMultisample(gl.RENDERBUFFER, fbo.multisample, gl.RGBA8, framebuffer.width, framebuffer.height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, fbo.msaaBuffer);
      }
      var activeTextures = [];
      for (var i = 0; i < count; i++) {
        if (i === 0 && fbo.multisample > 1) {
          continue;
        }
        var texture = framebuffer.colorTextures[i];
        var parentTexture = texture.parentTextureArray || texture;
        this.renderer.texture.bind(parentTexture, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, texture.target, parentTexture._glTextures[this.CONTEXT_UID].texture, 0);
        activeTextures.push(gl.COLOR_ATTACHMENT0 + i);
      }
      if (activeTextures.length > 1) {
        gl.drawBuffers(activeTextures);
      }
      if (framebuffer.depthTexture) {
        var writeDepthTexture = this.writeDepthTexture;
        if (writeDepthTexture) {
          var depthTexture = framebuffer.depthTexture;
          this.renderer.texture.bind(depthTexture, 0);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture._glTextures[this.CONTEXT_UID].texture, 0);
        }
      }
      if (!fbo.stencil && (framebuffer.stencil || framebuffer.depth)) {
        fbo.stencil = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.stencil);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, framebuffer.width, framebuffer.height);
        if (!framebuffer.depthTexture) {
          gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, fbo.stencil);
        }
      }
    };
    FramebufferSystem2.prototype.detectSamples = function(samples) {
      var msaaSamples = this.msaaSamples;
      var res = constants.MSAA_QUALITY.NONE;
      if (samples <= 1 || msaaSamples === null) {
        return res;
      }
      for (var i = 0; i < msaaSamples.length; i++) {
        if (msaaSamples[i] <= samples) {
          res = msaaSamples[i];
          break;
        }
      }
      if (res === 1) {
        res = constants.MSAA_QUALITY.NONE;
      }
      return res;
    };
    FramebufferSystem2.prototype.blit = function(framebuffer, sourcePixels, destPixels) {
      var _a = this, current = _a.current, renderer = _a.renderer, gl = _a.gl, CONTEXT_UID = _a.CONTEXT_UID;
      if (renderer.context.webGLVersion !== 2) {
        return;
      }
      if (!current) {
        return;
      }
      var fbo = current.glFramebuffers[CONTEXT_UID];
      if (!fbo) {
        return;
      }
      if (!framebuffer) {
        if (fbo.multisample <= 1) {
          return;
        }
        if (!fbo.blitFramebuffer) {
          fbo.blitFramebuffer = new Framebuffer(current.width, current.height);
          fbo.blitFramebuffer.addColorTexture(0, current.colorTextures[0]);
        }
        framebuffer = fbo.blitFramebuffer;
        framebuffer.width = current.width;
        framebuffer.height = current.height;
      }
      if (!sourcePixels) {
        sourcePixels = tempRectangle;
        sourcePixels.width = current.width;
        sourcePixels.height = current.height;
      }
      if (!destPixels) {
        destPixels = sourcePixels;
      }
      var sameSize = sourcePixels.width === destPixels.width && sourcePixels.height === destPixels.height;
      this.bind(framebuffer);
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, fbo.framebuffer);
      gl.blitFramebuffer(sourcePixels.x, sourcePixels.y, sourcePixels.width, sourcePixels.height, destPixels.x, destPixels.y, destPixels.width, destPixels.height, gl.COLOR_BUFFER_BIT, sameSize ? gl.NEAREST : gl.LINEAR);
    };
    FramebufferSystem2.prototype.disposeFramebuffer = function(framebuffer, contextLost) {
      var fbo = framebuffer.glFramebuffers[this.CONTEXT_UID];
      var gl = this.gl;
      if (!fbo) {
        return;
      }
      delete framebuffer.glFramebuffers[this.CONTEXT_UID];
      var index2 = this.managedFramebuffers.indexOf(framebuffer);
      if (index2 >= 0) {
        this.managedFramebuffers.splice(index2, 1);
      }
      framebuffer.disposeRunner.remove(this);
      if (!contextLost) {
        gl.deleteFramebuffer(fbo.framebuffer);
        if (fbo.stencil) {
          gl.deleteRenderbuffer(fbo.stencil);
        }
      }
    };
    FramebufferSystem2.prototype.disposeAll = function(contextLost) {
      var list = this.managedFramebuffers;
      this.managedFramebuffers = [];
      for (var i = 0; i < list.length; i++) {
        this.disposeFramebuffer(list[i], contextLost);
      }
    };
    FramebufferSystem2.prototype.forceStencil = function() {
      var framebuffer = this.current;
      if (!framebuffer) {
        return;
      }
      var fbo = framebuffer.glFramebuffers[this.CONTEXT_UID];
      if (!fbo || fbo.stencil) {
        return;
      }
      framebuffer.enableStencil();
      var w = framebuffer.width;
      var h = framebuffer.height;
      var gl = this.gl;
      var stencil = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, stencil);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, w, h);
      fbo.stencil = stencil;
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, stencil);
    };
    FramebufferSystem2.prototype.reset = function() {
      this.current = this.unknownFramebuffer;
      this.viewport = new math.Rectangle();
    };
    return FramebufferSystem2;
  }(System);
  var GLBuffer = function() {
    function GLBuffer2(buffer) {
      this.buffer = buffer || null;
      this.updateID = -1;
      this.byteLength = -1;
      this.refCount = 0;
    }
    return GLBuffer2;
  }();
  var byteSizeMap$1 = {5126: 4, 5123: 2, 5121: 1};
  var GeometrySystem = function(_super) {
    __extends(GeometrySystem2, _super);
    function GeometrySystem2(renderer) {
      var _this = _super.call(this, renderer) || this;
      _this._activeGeometry = null;
      _this._activeVao = null;
      _this.hasVao = true;
      _this.hasInstance = true;
      _this.canUseUInt32ElementIndex = false;
      _this.managedGeometries = {};
      _this.managedBuffers = {};
      return _this;
    }
    GeometrySystem2.prototype.contextChange = function() {
      this.disposeAll(true);
      var gl = this.gl = this.renderer.gl;
      var context2 = this.renderer.context;
      this.CONTEXT_UID = this.renderer.CONTEXT_UID;
      if (context2.webGLVersion !== 2) {
        var nativeVaoExtension_1 = this.renderer.context.extensions.vertexArrayObject;
        if (settings.settings.PREFER_ENV === constants.ENV.WEBGL_LEGACY) {
          nativeVaoExtension_1 = null;
        }
        if (nativeVaoExtension_1) {
          gl.createVertexArray = function() {
            return nativeVaoExtension_1.createVertexArrayOES();
          };
          gl.bindVertexArray = function(vao) {
            return nativeVaoExtension_1.bindVertexArrayOES(vao);
          };
          gl.deleteVertexArray = function(vao) {
            return nativeVaoExtension_1.deleteVertexArrayOES(vao);
          };
        } else {
          this.hasVao = false;
          gl.createVertexArray = function() {
            return null;
          };
          gl.bindVertexArray = function() {
            return null;
          };
          gl.deleteVertexArray = function() {
            return null;
          };
        }
      }
      if (context2.webGLVersion !== 2) {
        var instanceExt_1 = gl.getExtension("ANGLE_instanced_arrays");
        if (instanceExt_1) {
          gl.vertexAttribDivisor = function(a, b) {
            return instanceExt_1.vertexAttribDivisorANGLE(a, b);
          };
          gl.drawElementsInstanced = function(a, b, c, d, e) {
            return instanceExt_1.drawElementsInstancedANGLE(a, b, c, d, e);
          };
          gl.drawArraysInstanced = function(a, b, c, d) {
            return instanceExt_1.drawArraysInstancedANGLE(a, b, c, d);
          };
        } else {
          this.hasInstance = false;
        }
      }
      this.canUseUInt32ElementIndex = context2.webGLVersion === 2 || !!context2.extensions.uint32ElementIndex;
    };
    GeometrySystem2.prototype.bind = function(geometry, shader) {
      shader = shader || this.renderer.shader.shader;
      var gl = this.gl;
      var vaos = geometry.glVertexArrayObjects[this.CONTEXT_UID];
      var incRefCount = false;
      if (!vaos) {
        this.managedGeometries[geometry.id] = geometry;
        geometry.disposeRunner.add(this);
        geometry.glVertexArrayObjects[this.CONTEXT_UID] = vaos = {};
        incRefCount = true;
      }
      var vao = vaos[shader.program.id] || this.initGeometryVao(geometry, shader.program, incRefCount);
      this._activeGeometry = geometry;
      if (this._activeVao !== vao) {
        this._activeVao = vao;
        if (this.hasVao) {
          gl.bindVertexArray(vao);
        } else {
          this.activateVao(geometry, shader.program);
        }
      }
      this.updateBuffers();
    };
    GeometrySystem2.prototype.reset = function() {
      this.unbind();
    };
    GeometrySystem2.prototype.updateBuffers = function() {
      var geometry = this._activeGeometry;
      var gl = this.gl;
      for (var i = 0; i < geometry.buffers.length; i++) {
        var buffer = geometry.buffers[i];
        var glBuffer = buffer._glBuffers[this.CONTEXT_UID];
        if (buffer._updateID !== glBuffer.updateID) {
          glBuffer.updateID = buffer._updateID;
          var type = buffer.index ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
          gl.bindBuffer(type, glBuffer.buffer);
          this._boundBuffer = glBuffer;
          if (glBuffer.byteLength >= buffer.data.byteLength) {
            gl.bufferSubData(type, 0, buffer.data);
          } else {
            var drawType = buffer.static ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW;
            glBuffer.byteLength = buffer.data.byteLength;
            gl.bufferData(type, buffer.data, drawType);
          }
        }
      }
    };
    GeometrySystem2.prototype.checkCompatibility = function(geometry, program) {
      var geometryAttributes = geometry.attributes;
      var shaderAttributes = program.attributeData;
      for (var j in shaderAttributes) {
        if (!geometryAttributes[j]) {
          throw new Error('shader and geometry incompatible, geometry missing the "' + j + '" attribute');
        }
      }
    };
    GeometrySystem2.prototype.getSignature = function(geometry, program) {
      var attribs = geometry.attributes;
      var shaderAttributes = program.attributeData;
      var strings = ["g", geometry.id];
      for (var i in attribs) {
        if (shaderAttributes[i]) {
          strings.push(i);
        }
      }
      return strings.join("-");
    };
    GeometrySystem2.prototype.initGeometryVao = function(geometry, program, incRefCount) {
      if (incRefCount === void 0) {
        incRefCount = true;
      }
      this.checkCompatibility(geometry, program);
      var gl = this.gl;
      var CONTEXT_UID = this.CONTEXT_UID;
      var signature = this.getSignature(geometry, program);
      var vaoObjectHash = geometry.glVertexArrayObjects[this.CONTEXT_UID];
      var vao = vaoObjectHash[signature];
      if (vao) {
        vaoObjectHash[program.id] = vao;
        return vao;
      }
      var buffers = geometry.buffers;
      var attributes = geometry.attributes;
      var tempStride = {};
      var tempStart = {};
      for (var j in buffers) {
        tempStride[j] = 0;
        tempStart[j] = 0;
      }
      for (var j in attributes) {
        if (!attributes[j].size && program.attributeData[j]) {
          attributes[j].size = program.attributeData[j].size;
        } else if (!attributes[j].size) {
          console.warn("PIXI Geometry attribute '" + j + "' size cannot be determined (likely the bound shader does not have the attribute)");
        }
        tempStride[attributes[j].buffer] += attributes[j].size * byteSizeMap$1[attributes[j].type];
      }
      for (var j in attributes) {
        var attribute = attributes[j];
        var attribSize = attribute.size;
        if (attribute.stride === void 0) {
          if (tempStride[attribute.buffer] === attribSize * byteSizeMap$1[attribute.type]) {
            attribute.stride = 0;
          } else {
            attribute.stride = tempStride[attribute.buffer];
          }
        }
        if (attribute.start === void 0) {
          attribute.start = tempStart[attribute.buffer];
          tempStart[attribute.buffer] += attribSize * byteSizeMap$1[attribute.type];
        }
      }
      vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      for (var i = 0; i < buffers.length; i++) {
        var buffer = buffers[i];
        if (!buffer._glBuffers[CONTEXT_UID]) {
          buffer._glBuffers[CONTEXT_UID] = new GLBuffer(gl.createBuffer());
          this.managedBuffers[buffer.id] = buffer;
          buffer.disposeRunner.add(this);
        }
        if (incRefCount) {
          buffer._glBuffers[CONTEXT_UID].refCount++;
        }
      }
      this.activateVao(geometry, program);
      this._activeVao = vao;
      vaoObjectHash[program.id] = vao;
      vaoObjectHash[signature] = vao;
      return vao;
    };
    GeometrySystem2.prototype.disposeBuffer = function(buffer, contextLost) {
      if (!this.managedBuffers[buffer.id]) {
        return;
      }
      delete this.managedBuffers[buffer.id];
      var glBuffer = buffer._glBuffers[this.CONTEXT_UID];
      var gl = this.gl;
      buffer.disposeRunner.remove(this);
      if (!glBuffer) {
        return;
      }
      if (!contextLost) {
        gl.deleteBuffer(glBuffer.buffer);
      }
      delete buffer._glBuffers[this.CONTEXT_UID];
    };
    GeometrySystem2.prototype.disposeGeometry = function(geometry, contextLost) {
      if (!this.managedGeometries[geometry.id]) {
        return;
      }
      delete this.managedGeometries[geometry.id];
      var vaos = geometry.glVertexArrayObjects[this.CONTEXT_UID];
      var gl = this.gl;
      var buffers = geometry.buffers;
      geometry.disposeRunner.remove(this);
      if (!vaos) {
        return;
      }
      for (var i = 0; i < buffers.length; i++) {
        var buf = buffers[i]._glBuffers[this.CONTEXT_UID];
        buf.refCount--;
        if (buf.refCount === 0 && !contextLost) {
          this.disposeBuffer(buffers[i], contextLost);
        }
      }
      if (!contextLost) {
        for (var vaoId in vaos) {
          if (vaoId[0] === "g") {
            var vao = vaos[vaoId];
            if (this._activeVao === vao) {
              this.unbind();
            }
            gl.deleteVertexArray(vao);
          }
        }
      }
      delete geometry.glVertexArrayObjects[this.CONTEXT_UID];
    };
    GeometrySystem2.prototype.disposeAll = function(contextLost) {
      var all = Object.keys(this.managedGeometries);
      for (var i = 0; i < all.length; i++) {
        this.disposeGeometry(this.managedGeometries[all[i]], contextLost);
      }
      all = Object.keys(this.managedBuffers);
      for (var i = 0; i < all.length; i++) {
        this.disposeBuffer(this.managedBuffers[all[i]], contextLost);
      }
    };
    GeometrySystem2.prototype.activateVao = function(geometry, program) {
      var gl = this.gl;
      var CONTEXT_UID = this.CONTEXT_UID;
      var buffers = geometry.buffers;
      var attributes = geometry.attributes;
      if (geometry.indexBuffer) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.indexBuffer._glBuffers[CONTEXT_UID].buffer);
      }
      var lastBuffer = null;
      for (var j in attributes) {
        var attribute = attributes[j];
        var buffer = buffers[attribute.buffer];
        var glBuffer = buffer._glBuffers[CONTEXT_UID];
        if (program.attributeData[j]) {
          if (lastBuffer !== glBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer.buffer);
            lastBuffer = glBuffer;
          }
          var location = program.attributeData[j].location;
          gl.enableVertexAttribArray(location);
          gl.vertexAttribPointer(location, attribute.size, attribute.type || gl.FLOAT, attribute.normalized, attribute.stride, attribute.start);
          if (attribute.instance) {
            if (this.hasInstance) {
              gl.vertexAttribDivisor(location, 1);
            } else {
              throw new Error("geometry error, GPU Instancing is not supported on this device");
            }
          }
        }
      }
    };
    GeometrySystem2.prototype.draw = function(type, size, start, instanceCount) {
      var gl = this.gl;
      var geometry = this._activeGeometry;
      if (geometry.indexBuffer) {
        var byteSize = geometry.indexBuffer.data.BYTES_PER_ELEMENT;
        var glType = byteSize === 2 ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT;
        if (byteSize === 2 || byteSize === 4 && this.canUseUInt32ElementIndex) {
          if (geometry.instanced) {
            gl.drawElementsInstanced(type, size || geometry.indexBuffer.data.length, glType, (start || 0) * byteSize, instanceCount || 1);
          } else {
            gl.drawElements(type, size || geometry.indexBuffer.data.length, glType, (start || 0) * byteSize);
          }
        } else {
          console.warn("unsupported index buffer type: uint32");
        }
      } else if (geometry.instanced) {
        gl.drawArraysInstanced(type, start, size || geometry.getSize(), instanceCount || 1);
      } else {
        gl.drawArrays(type, start, size || geometry.getSize());
      }
      return this;
    };
    GeometrySystem2.prototype.unbind = function() {
      this.gl.bindVertexArray(null);
      this._activeVao = null;
      this._activeGeometry = null;
    };
    return GeometrySystem2;
  }(System);
  var MaskData = function() {
    function MaskData2(maskObject) {
      if (maskObject === void 0) {
        maskObject = null;
      }
      this.type = constants.MASK_TYPES.NONE;
      this.autoDetect = true;
      this.maskObject = maskObject || null;
      this.pooled = false;
      this.isMaskData = true;
      this._stencilCounter = 0;
      this._scissorCounter = 0;
      this._scissorRect = null;
      this._target = null;
    }
    MaskData2.prototype.reset = function() {
      if (this.pooled) {
        this.maskObject = null;
        this.type = constants.MASK_TYPES.NONE;
        this.autoDetect = true;
      }
      this._target = null;
    };
    MaskData2.prototype.copyCountersOrReset = function(maskAbove) {
      if (maskAbove) {
        this._stencilCounter = maskAbove._stencilCounter;
        this._scissorCounter = maskAbove._scissorCounter;
        this._scissorRect = maskAbove._scissorRect;
      } else {
        this._stencilCounter = 0;
        this._scissorCounter = 0;
        this._scissorRect = null;
      }
    };
    return MaskData2;
  }();
  function compileShader(gl, type, src) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    return shader;
  }
  function compileProgram(gl, vertexSrc, fragmentSrc, attributeLocations) {
    var glVertShader = compileShader(gl, gl.VERTEX_SHADER, vertexSrc);
    var glFragShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);
    var program = gl.createProgram();
    gl.attachShader(program, glVertShader);
    gl.attachShader(program, glFragShader);
    if (attributeLocations) {
      for (var i in attributeLocations) {
        gl.bindAttribLocation(program, attributeLocations[i], i);
      }
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      if (!gl.getShaderParameter(glVertShader, gl.COMPILE_STATUS)) {
        console.warn(vertexSrc);
        console.error(gl.getShaderInfoLog(glVertShader));
      }
      if (!gl.getShaderParameter(glFragShader, gl.COMPILE_STATUS)) {
        console.warn(fragmentSrc);
        console.error(gl.getShaderInfoLog(glFragShader));
      }
      console.error("Pixi.js Error: Could not initialize shader.");
      console.error("gl.VALIDATE_STATUS", gl.getProgramParameter(program, gl.VALIDATE_STATUS));
      console.error("gl.getError()", gl.getError());
      if (gl.getProgramInfoLog(program) !== "") {
        console.warn("Pixi.js Warning: gl.getProgramInfoLog()", gl.getProgramInfoLog(program));
      }
      gl.deleteProgram(program);
      program = null;
    }
    gl.deleteShader(glVertShader);
    gl.deleteShader(glFragShader);
    return program;
  }
  function booleanArray(size) {
    var array = new Array(size);
    for (var i = 0; i < array.length; i++) {
      array[i] = false;
    }
    return array;
  }
  function defaultValue(type, size) {
    switch (type) {
      case "float":
        return 0;
      case "vec2":
        return new Float32Array(2 * size);
      case "vec3":
        return new Float32Array(3 * size);
      case "vec4":
        return new Float32Array(4 * size);
      case "int":
      case "sampler2D":
      case "sampler2DArray":
        return 0;
      case "ivec2":
        return new Int32Array(2 * size);
      case "ivec3":
        return new Int32Array(3 * size);
      case "ivec4":
        return new Int32Array(4 * size);
      case "bool":
        return false;
      case "bvec2":
        return booleanArray(2 * size);
      case "bvec3":
        return booleanArray(3 * size);
      case "bvec4":
        return booleanArray(4 * size);
      case "mat2":
        return new Float32Array([
          1,
          0,
          0,
          1
        ]);
      case "mat3":
        return new Float32Array([
          1,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          1
        ]);
      case "mat4":
        return new Float32Array([
          1,
          0,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          1
        ]);
    }
    return null;
  }
  var unknownContext = {};
  var context = unknownContext;
  function getTestContext() {
    if (context === unknownContext || context && context.isContextLost()) {
      var canvas = document.createElement("canvas");
      var gl = void 0;
      if (settings.settings.PREFER_ENV >= constants.ENV.WEBGL2) {
        gl = canvas.getContext("webgl2", {});
      }
      if (!gl) {
        gl = canvas.getContext("webgl", {}) || canvas.getContext("experimental-webgl", {});
        if (!gl) {
          gl = null;
        } else {
          gl.getExtension("WEBGL_draw_buffers");
        }
      }
      context = gl;
    }
    return context;
  }
  var maxFragmentPrecision;
  function getMaxFragmentPrecision() {
    if (!maxFragmentPrecision) {
      maxFragmentPrecision = constants.PRECISION.MEDIUM;
      var gl = getTestContext();
      if (gl) {
        if (gl.getShaderPrecisionFormat) {
          var shaderFragment = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
          maxFragmentPrecision = shaderFragment.precision ? constants.PRECISION.HIGH : constants.PRECISION.MEDIUM;
        }
      }
    }
    return maxFragmentPrecision;
  }
  function setPrecision(src, requestedPrecision, maxSupportedPrecision) {
    if (src.substring(0, 9) !== "precision") {
      var precision = requestedPrecision;
      if (requestedPrecision === constants.PRECISION.HIGH && maxSupportedPrecision !== constants.PRECISION.HIGH) {
        precision = constants.PRECISION.MEDIUM;
      }
      return "precision " + precision + " float;\n" + src;
    } else if (maxSupportedPrecision !== constants.PRECISION.HIGH && src.substring(0, 15) === "precision highp") {
      return src.replace("precision highp", "precision mediump");
    }
    return src;
  }
  var GLSL_TO_SIZE = {
    float: 1,
    vec2: 2,
    vec3: 3,
    vec4: 4,
    int: 1,
    ivec2: 2,
    ivec3: 3,
    ivec4: 4,
    bool: 1,
    bvec2: 2,
    bvec3: 3,
    bvec4: 4,
    mat2: 4,
    mat3: 9,
    mat4: 16,
    sampler2D: 1
  };
  function mapSize(type) {
    return GLSL_TO_SIZE[type];
  }
  var GL_TABLE = null;
  var GL_TO_GLSL_TYPES = {
    FLOAT: "float",
    FLOAT_VEC2: "vec2",
    FLOAT_VEC3: "vec3",
    FLOAT_VEC4: "vec4",
    INT: "int",
    INT_VEC2: "ivec2",
    INT_VEC3: "ivec3",
    INT_VEC4: "ivec4",
    BOOL: "bool",
    BOOL_VEC2: "bvec2",
    BOOL_VEC3: "bvec3",
    BOOL_VEC4: "bvec4",
    FLOAT_MAT2: "mat2",
    FLOAT_MAT3: "mat3",
    FLOAT_MAT4: "mat4",
    SAMPLER_2D: "sampler2D",
    INT_SAMPLER_2D: "sampler2D",
    UNSIGNED_INT_SAMPLER_2D: "sampler2D",
    SAMPLER_CUBE: "samplerCube",
    INT_SAMPLER_CUBE: "samplerCube",
    UNSIGNED_INT_SAMPLER_CUBE: "samplerCube",
    SAMPLER_2D_ARRAY: "sampler2DArray",
    INT_SAMPLER_2D_ARRAY: "sampler2DArray",
    UNSIGNED_INT_SAMPLER_2D_ARRAY: "sampler2DArray"
  };
  function mapType(gl, type) {
    if (!GL_TABLE) {
      var typeNames = Object.keys(GL_TO_GLSL_TYPES);
      GL_TABLE = {};
      for (var i = 0; i < typeNames.length; ++i) {
        var tn = typeNames[i];
        GL_TABLE[gl[tn]] = GL_TO_GLSL_TYPES[tn];
      }
    }
    return GL_TABLE[type];
  }
  var uniformParsers = [
    {
      test: function(data) {
        return data.type === "float" && data.size === 1;
      },
      code: function(name) {
        return '\n            if(uv["' + name + '"] !== ud["' + name + '"].value)\n            {\n                ud["' + name + '"].value = uv["' + name + '"]\n                gl.uniform1f(ud["' + name + '"].location, uv["' + name + '"])\n            }\n            ';
      }
    },
    {
      test: function(data) {
        return (data.type === "sampler2D" || data.type === "samplerCube" || data.type === "sampler2DArray") && data.size === 1 && !data.isArray;
      },
      code: function(name) {
        return 't = syncData.textureCount++;\n\n            renderer.texture.bind(uv["' + name + '"], t);\n\n            if(ud["' + name + '"].value !== t)\n            {\n                ud["' + name + '"].value = t;\n                gl.uniform1i(ud["' + name + '"].location, t);\n; // eslint-disable-line max-len\n            }';
      }
    },
    {
      test: function(data, uniform) {
        return data.type === "mat3" && data.size === 1 && uniform.a !== void 0;
      },
      code: function(name) {
        return '\n            gl.uniformMatrix3fv(ud["' + name + '"].location, false, uv["' + name + '"].toArray(true));\n            ';
      }
    },
    {
      test: function(data, uniform) {
        return data.type === "vec2" && data.size === 1 && uniform.x !== void 0;
      },
      code: function(name) {
        return '\n                cv = ud["' + name + '"].value;\n                v = uv["' + name + '"];\n\n                if(cv[0] !== v.x || cv[1] !== v.y)\n                {\n                    cv[0] = v.x;\n                    cv[1] = v.y;\n                    gl.uniform2f(ud["' + name + '"].location, v.x, v.y);\n                }';
      }
    },
    {
      test: function(data) {
        return data.type === "vec2" && data.size === 1;
      },
      code: function(name) {
        return '\n                cv = ud["' + name + '"].value;\n                v = uv["' + name + '"];\n\n                if(cv[0] !== v[0] || cv[1] !== v[1])\n                {\n                    cv[0] = v[0];\n                    cv[1] = v[1];\n                    gl.uniform2f(ud["' + name + '"].location, v[0], v[1]);\n                }\n            ';
      }
    },
    {
      test: function(data, uniform) {
        return data.type === "vec4" && data.size === 1 && uniform.width !== void 0;
      },
      code: function(name) {
        return '\n                cv = ud["' + name + '"].value;\n                v = uv["' + name + '"];\n\n                if(cv[0] !== v.x || cv[1] !== v.y || cv[2] !== v.width || cv[3] !== v.height)\n                {\n                    cv[0] = v.x;\n                    cv[1] = v.y;\n                    cv[2] = v.width;\n                    cv[3] = v.height;\n                    gl.uniform4f(ud["' + name + '"].location, v.x, v.y, v.width, v.height)\n                }';
      }
    },
    {
      test: function(data) {
        return data.type === "vec4" && data.size === 1;
      },
      code: function(name) {
        return '\n                cv = ud["' + name + '"].value;\n                v = uv["' + name + '"];\n\n                if(cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])\n                {\n                    cv[0] = v[0];\n                    cv[1] = v[1];\n                    cv[2] = v[2];\n                    cv[3] = v[3];\n\n                    gl.uniform4f(ud["' + name + '"].location, v[0], v[1], v[2], v[3])\n                }';
      }
    }
  ];
  var GLSL_TO_SINGLE_SETTERS_CACHED = {
    float: "\n    if(cv !== v)\n    {\n        cv.v = v;\n        gl.uniform1f(location, v)\n    }",
    vec2: "\n    if(cv[0] !== v[0] || cv[1] !== v[1])\n    {\n        cv[0] = v[0];\n        cv[1] = v[1];\n        gl.uniform2f(location, v[0], v[1])\n    }",
    vec3: "\n    if(cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])\n    {\n        cv[0] = v[0];\n        cv[1] = v[1];\n        cv[2] = v[2];\n\n        gl.uniform3f(location, v[0], v[1], v[2])\n    }",
    vec4: "gl.uniform4f(location, v[0], v[1], v[2], v[3])",
    int: "gl.uniform1i(location, v)",
    ivec2: "gl.uniform2i(location, v[0], v[1])",
    ivec3: "gl.uniform3i(location, v[0], v[1], v[2])",
    ivec4: "gl.uniform4i(location, v[0], v[1], v[2], v[3])",
    bool: "gl.uniform1i(location, v)",
    bvec2: "gl.uniform2i(location, v[0], v[1])",
    bvec3: "gl.uniform3i(location, v[0], v[1], v[2])",
    bvec4: "gl.uniform4i(location, v[0], v[1], v[2], v[3])",
    mat2: "gl.uniformMatrix2fv(location, false, v)",
    mat3: "gl.uniformMatrix3fv(location, false, v)",
    mat4: "gl.uniformMatrix4fv(location, false, v)",
    sampler2D: "gl.uniform1i(location, v)",
    samplerCube: "gl.uniform1i(location, v)",
    sampler2DArray: "gl.uniform1i(location, v)"
  };
  var GLSL_TO_ARRAY_SETTERS = {
    float: "gl.uniform1fv(location, v)",
    vec2: "gl.uniform2fv(location, v)",
    vec3: "gl.uniform3fv(location, v)",
    vec4: "gl.uniform4fv(location, v)",
    mat4: "gl.uniformMatrix4fv(location, false, v)",
    mat3: "gl.uniformMatrix3fv(location, false, v)",
    mat2: "gl.uniformMatrix2fv(location, false, v)",
    int: "gl.uniform1iv(location, v)",
    ivec2: "gl.uniform2iv(location, v)",
    ivec3: "gl.uniform3iv(location, v)",
    ivec4: "gl.uniform4iv(location, v)",
    bool: "gl.uniform1iv(location, v)",
    bvec2: "gl.uniform2iv(location, v)",
    bvec3: "gl.uniform3iv(location, v)",
    bvec4: "gl.uniform4iv(location, v)",
    sampler2D: "gl.uniform1iv(location, v)",
    samplerCube: "gl.uniform1iv(location, v)",
    sampler2DArray: "gl.uniform1iv(location, v)"
  };
  function generateUniformsSync(group, uniformData) {
    var funcFragments = ["\n        var v = null;\n        var cv = null\n        var t = 0;\n        var gl = renderer.gl\n    "];
    for (var i in group.uniforms) {
      var data = uniformData[i];
      if (!data) {
        if (group.uniforms[i].group) {
          funcFragments.push('\n                    renderer.shader.syncUniformGroup(uv["' + i + '"], syncData);\n                ');
        }
        continue;
      }
      var uniform = group.uniforms[i];
      var parsed = false;
      for (var j = 0; j < uniformParsers.length; j++) {
        if (uniformParsers[j].test(data, uniform)) {
          funcFragments.push(uniformParsers[j].code(i, uniform));
          parsed = true;
          break;
        }
      }
      if (!parsed) {
        var templateType = data.size === 1 ? GLSL_TO_SINGLE_SETTERS_CACHED : GLSL_TO_ARRAY_SETTERS;
        var template = templateType[data.type].replace("location", 'ud["' + i + '"].location');
        funcFragments.push('\n            cv = ud["' + i + '"].value;\n            v = uv["' + i + '"];\n            ' + template + ";");
      }
    }
    return new Function("ud", "uv", "renderer", "syncData", funcFragments.join("\n"));
  }
  var fragTemplate = [
    "precision mediump float;",
    "void main(void){",
    "float test = 0.1;",
    "%forloop%",
    "gl_FragColor = vec4(0.0);",
    "}"
  ].join("\n");
  function generateIfTestSrc(maxIfs) {
    var src = "";
    for (var i = 0; i < maxIfs; ++i) {
      if (i > 0) {
        src += "\nelse ";
      }
      if (i < maxIfs - 1) {
        src += "if(test == " + i + ".0){}";
      }
    }
    return src;
  }
  function checkMaxIfStatementsInShader(maxIfs, gl) {
    if (maxIfs === 0) {
      throw new Error("Invalid value of `0` passed to `checkMaxIfStatementsInShader`");
    }
    var shader = gl.createShader(gl.FRAGMENT_SHADER);
    while (true) {
      var fragmentSrc = fragTemplate.replace(/%forloop%/gi, generateIfTestSrc(maxIfs));
      gl.shaderSource(shader, fragmentSrc);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        maxIfs = maxIfs / 2 | 0;
      } else {
        break;
      }
    }
    return maxIfs;
  }
  var unsafeEval;
  function unsafeEvalSupported() {
    if (typeof unsafeEval === "boolean") {
      return unsafeEval;
    }
    try {
      var func = new Function("param1", "param2", "param3", "return param1[param2] === param3;");
      unsafeEval = func({a: "b"}, "a", "b") === true;
    } catch (e) {
      unsafeEval = false;
    }
    return unsafeEval;
  }
  var defaultFragment = "varying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\n\nvoid main(void){\n   gl_FragColor *= texture2D(uSampler, vTextureCoord);\n}";
  var defaultVertex = "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void){\n   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n   vTextureCoord = aTextureCoord;\n}\n";
  var UID$3 = 0;
  var nameCache = {};
  var Program = function() {
    function Program2(vertexSrc, fragmentSrc, name) {
      if (name === void 0) {
        name = "pixi-shader";
      }
      this.id = UID$3++;
      this.vertexSrc = vertexSrc || Program2.defaultVertexSrc;
      this.fragmentSrc = fragmentSrc || Program2.defaultFragmentSrc;
      this.vertexSrc = this.vertexSrc.trim();
      this.fragmentSrc = this.fragmentSrc.trim();
      if (this.vertexSrc.substring(0, 8) !== "#version") {
        name = name.replace(/\s+/g, "-");
        if (nameCache[name]) {
          nameCache[name]++;
          name += "-" + nameCache[name];
        } else {
          nameCache[name] = 1;
        }
        this.vertexSrc = "#define SHADER_NAME " + name + "\n" + this.vertexSrc;
        this.fragmentSrc = "#define SHADER_NAME " + name + "\n" + this.fragmentSrc;
        this.vertexSrc = setPrecision(this.vertexSrc, settings.settings.PRECISION_VERTEX, constants.PRECISION.HIGH);
        this.fragmentSrc = setPrecision(this.fragmentSrc, settings.settings.PRECISION_FRAGMENT, getMaxFragmentPrecision());
      }
      this.extractData(this.vertexSrc, this.fragmentSrc);
      this.glPrograms = {};
      this.syncUniforms = null;
    }
    Program2.prototype.extractData = function(vertexSrc, fragmentSrc) {
      var gl = getTestContext();
      if (gl) {
        var program = compileProgram(gl, vertexSrc, fragmentSrc);
        this.attributeData = this.getAttributeData(program, gl);
        this.uniformData = this.getUniformData(program, gl);
        gl.deleteProgram(program);
      } else {
        this.uniformData = {};
        this.attributeData = {};
      }
    };
    Program2.prototype.getAttributeData = function(program, gl) {
      var attributes = {};
      var attributesArray = [];
      var totalAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
      for (var i = 0; i < totalAttributes; i++) {
        var attribData = gl.getActiveAttrib(program, i);
        var type = mapType(gl, attribData.type);
        var data = {
          type,
          name: attribData.name,
          size: mapSize(type),
          location: 0
        };
        attributes[attribData.name] = data;
        attributesArray.push(data);
      }
      attributesArray.sort(function(a, b) {
        return a.name > b.name ? 1 : -1;
      });
      for (var i = 0; i < attributesArray.length; i++) {
        attributesArray[i].location = i;
      }
      return attributes;
    };
    Program2.prototype.getUniformData = function(program, gl) {
      var uniforms = {};
      var totalUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      for (var i = 0; i < totalUniforms; i++) {
        var uniformData = gl.getActiveUniform(program, i);
        var name = uniformData.name.replace(/\[.*?\]$/, "");
        var isArray = uniformData.name.match(/\[.*?\]$/);
        var type = mapType(gl, uniformData.type);
        uniforms[name] = {
          type,
          size: uniformData.size,
          isArray,
          value: defaultValue(type, uniformData.size)
        };
      }
      return uniforms;
    };
    Object.defineProperty(Program2, "defaultVertexSrc", {
      get: function() {
        return defaultVertex;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Program2, "defaultFragmentSrc", {
      get: function() {
        return defaultFragment;
      },
      enumerable: false,
      configurable: true
    });
    Program2.from = function(vertexSrc, fragmentSrc, name) {
      var key = vertexSrc + fragmentSrc;
      var program = utils.ProgramCache[key];
      if (!program) {
        utils.ProgramCache[key] = program = new Program2(vertexSrc, fragmentSrc, name);
      }
      return program;
    };
    return Program2;
  }();
  var Shader = function() {
    function Shader2(program, uniforms) {
      this.program = program;
      if (uniforms) {
        if (uniforms instanceof UniformGroup) {
          this.uniformGroup = uniforms;
        } else {
          this.uniformGroup = new UniformGroup(uniforms);
        }
      } else {
        this.uniformGroup = new UniformGroup({});
      }
      for (var i in program.uniformData) {
        if (this.uniformGroup.uniforms[i] instanceof Array) {
          this.uniformGroup.uniforms[i] = new Float32Array(this.uniformGroup.uniforms[i]);
        }
      }
    }
    Shader2.prototype.checkUniformExists = function(name, group) {
      if (group.uniforms[name]) {
        return true;
      }
      for (var i in group.uniforms) {
        var uniform = group.uniforms[i];
        if (uniform.group) {
          if (this.checkUniformExists(name, uniform)) {
            return true;
          }
        }
      }
      return false;
    };
    Shader2.prototype.destroy = function() {
      this.uniformGroup = null;
    };
    Object.defineProperty(Shader2.prototype, "uniforms", {
      get: function() {
        return this.uniformGroup.uniforms;
      },
      enumerable: false,
      configurable: true
    });
    Shader2.from = function(vertexSrc, fragmentSrc, uniforms) {
      var program = Program.from(vertexSrc, fragmentSrc);
      return new Shader2(program, uniforms);
    };
    return Shader2;
  }();
  var BLEND = 0;
  var OFFSET = 1;
  var CULLING = 2;
  var DEPTH_TEST = 3;
  var WINDING = 4;
  var State = function() {
    function State2() {
      this.data = 0;
      this.blendMode = constants.BLEND_MODES.NORMAL;
      this.polygonOffset = 0;
      this.blend = true;
    }
    Object.defineProperty(State2.prototype, "blend", {
      get: function() {
        return !!(this.data & 1 << BLEND);
      },
      set: function(value) {
        if (!!(this.data & 1 << BLEND) !== value) {
          this.data ^= 1 << BLEND;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(State2.prototype, "offsets", {
      get: function() {
        return !!(this.data & 1 << OFFSET);
      },
      set: function(value) {
        if (!!(this.data & 1 << OFFSET) !== value) {
          this.data ^= 1 << OFFSET;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(State2.prototype, "culling", {
      get: function() {
        return !!(this.data & 1 << CULLING);
      },
      set: function(value) {
        if (!!(this.data & 1 << CULLING) !== value) {
          this.data ^= 1 << CULLING;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(State2.prototype, "depthTest", {
      get: function() {
        return !!(this.data & 1 << DEPTH_TEST);
      },
      set: function(value) {
        if (!!(this.data & 1 << DEPTH_TEST) !== value) {
          this.data ^= 1 << DEPTH_TEST;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(State2.prototype, "clockwiseFrontFace", {
      get: function() {
        return !!(this.data & 1 << WINDING);
      },
      set: function(value) {
        if (!!(this.data & 1 << WINDING) !== value) {
          this.data ^= 1 << WINDING;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(State2.prototype, "blendMode", {
      get: function() {
        return this._blendMode;
      },
      set: function(value) {
        this.blend = value !== constants.BLEND_MODES.NONE;
        this._blendMode = value;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(State2.prototype, "polygonOffset", {
      get: function() {
        return this._polygonOffset;
      },
      set: function(value) {
        this.offsets = !!value;
        this._polygonOffset = value;
      },
      enumerable: false,
      configurable: true
    });
    State2.for2d = function() {
      var state = new State2();
      state.depthTest = false;
      state.blend = true;
      return state;
    };
    return State2;
  }();
  var defaultVertex$1 = "attribute vec2 aVertexPosition;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nuniform vec4 inputSize;\nuniform vec4 outputFrame;\n\nvec4 filterVertexPosition( void )\n{\n    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;\n\n    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);\n}\n\nvec2 filterTextureCoord( void )\n{\n    return aVertexPosition * (outputFrame.zw * inputSize.zw);\n}\n\nvoid main(void)\n{\n    gl_Position = filterVertexPosition();\n    vTextureCoord = filterTextureCoord();\n}\n";
  var defaultFragment$1 = "varying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\n\nvoid main(void){\n   gl_FragColor = texture2D(uSampler, vTextureCoord);\n}\n";
  var Filter = function(_super) {
    __extends(Filter2, _super);
    function Filter2(vertexSrc, fragmentSrc, uniforms) {
      var _this = this;
      var program = Program.from(vertexSrc || Filter2.defaultVertexSrc, fragmentSrc || Filter2.defaultFragmentSrc);
      _this = _super.call(this, program, uniforms) || this;
      _this.padding = 0;
      _this.resolution = settings.settings.FILTER_RESOLUTION;
      _this.enabled = true;
      _this.autoFit = true;
      _this.legacy = !!_this.program.attributeData.aTextureCoord;
      _this.state = new State();
      return _this;
    }
    Filter2.prototype.apply = function(filterManager, input, output, clearMode, _currentState) {
      filterManager.applyFilter(this, input, output, clearMode);
    };
    Object.defineProperty(Filter2.prototype, "blendMode", {
      get: function() {
        return this.state.blendMode;
      },
      set: function(value) {
        this.state.blendMode = value;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Filter2, "defaultVertexSrc", {
      get: function() {
        return defaultVertex$1;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Filter2, "defaultFragmentSrc", {
      get: function() {
        return defaultFragment$1;
      },
      enumerable: false,
      configurable: true
    });
    return Filter2;
  }(Shader);
  var vertex = "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\nuniform mat3 otherMatrix;\n\nvarying vec2 vMaskCoord;\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n    vTextureCoord = aTextureCoord;\n    vMaskCoord = ( otherMatrix * vec3( aTextureCoord, 1.0)  ).xy;\n}\n";
  var fragment = "varying vec2 vMaskCoord;\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform sampler2D mask;\nuniform float alpha;\nuniform float npmAlpha;\nuniform vec4 maskClamp;\n\nvoid main(void)\n{\n    float clip = step(3.5,\n        step(maskClamp.x, vMaskCoord.x) +\n        step(maskClamp.y, vMaskCoord.y) +\n        step(vMaskCoord.x, maskClamp.z) +\n        step(vMaskCoord.y, maskClamp.w));\n\n    vec4 original = texture2D(uSampler, vTextureCoord);\n    vec4 masky = texture2D(mask, vMaskCoord);\n    float alphaMul = 1.0 - npmAlpha * (1.0 - masky.a);\n\n    original *= (alphaMul * masky.r * alpha * clip);\n\n    gl_FragColor = original;\n}\n";
  var tempMat = new math.Matrix();
  var TextureMatrix = function() {
    function TextureMatrix2(texture, clampMargin) {
      this._texture = texture;
      this.mapCoord = new math.Matrix();
      this.uClampFrame = new Float32Array(4);
      this.uClampOffset = new Float32Array(2);
      this._textureID = -1;
      this._updateID = 0;
      this.clampOffset = 0;
      this.clampMargin = typeof clampMargin === "undefined" ? 0.5 : clampMargin;
      this.isSimple = false;
    }
    Object.defineProperty(TextureMatrix2.prototype, "texture", {
      get: function() {
        return this._texture;
      },
      set: function(value) {
        this._texture = value;
        this._textureID = -1;
      },
      enumerable: false,
      configurable: true
    });
    TextureMatrix2.prototype.multiplyUvs = function(uvs, out) {
      if (out === void 0) {
        out = uvs;
      }
      var mat = this.mapCoord;
      for (var i = 0; i < uvs.length; i += 2) {
        var x = uvs[i];
        var y = uvs[i + 1];
        out[i] = x * mat.a + y * mat.c + mat.tx;
        out[i + 1] = x * mat.b + y * mat.d + mat.ty;
      }
      return out;
    };
    TextureMatrix2.prototype.update = function(forceUpdate) {
      var tex = this._texture;
      if (!tex || !tex.valid) {
        return false;
      }
      if (!forceUpdate && this._textureID === tex._updateID) {
        return false;
      }
      this._textureID = tex._updateID;
      this._updateID++;
      var uvs = tex._uvs;
      this.mapCoord.set(uvs.x1 - uvs.x0, uvs.y1 - uvs.y0, uvs.x3 - uvs.x0, uvs.y3 - uvs.y0, uvs.x0, uvs.y0);
      var orig = tex.orig;
      var trim = tex.trim;
      if (trim) {
        tempMat.set(orig.width / trim.width, 0, 0, orig.height / trim.height, -trim.x / trim.width, -trim.y / trim.height);
        this.mapCoord.append(tempMat);
      }
      var texBase = tex.baseTexture;
      var frame = this.uClampFrame;
      var margin = this.clampMargin / texBase.resolution;
      var offset = this.clampOffset;
      frame[0] = (tex._frame.x + margin + offset) / texBase.width;
      frame[1] = (tex._frame.y + margin + offset) / texBase.height;
      frame[2] = (tex._frame.x + tex._frame.width - margin + offset) / texBase.width;
      frame[3] = (tex._frame.y + tex._frame.height - margin + offset) / texBase.height;
      this.uClampOffset[0] = offset / texBase.realWidth;
      this.uClampOffset[1] = offset / texBase.realHeight;
      this.isSimple = tex._frame.width === texBase.width && tex._frame.height === texBase.height && tex.rotate === 0;
      return true;
    };
    return TextureMatrix2;
  }();
  var SpriteMaskFilter = function(_super) {
    __extends(SpriteMaskFilter2, _super);
    function SpriteMaskFilter2(sprite) {
      var _this = this;
      var maskMatrix = new math.Matrix();
      _this = _super.call(this, vertex, fragment) || this;
      sprite.renderable = false;
      _this.maskSprite = sprite;
      _this.maskMatrix = maskMatrix;
      return _this;
    }
    SpriteMaskFilter2.prototype.apply = function(filterManager, input, output, clearMode) {
      var maskSprite = this.maskSprite;
      var tex = maskSprite._texture;
      if (!tex.valid) {
        return;
      }
      if (!tex.uvMatrix) {
        tex.uvMatrix = new TextureMatrix(tex, 0);
      }
      tex.uvMatrix.update();
      this.uniforms.npmAlpha = tex.baseTexture.alphaMode ? 0 : 1;
      this.uniforms.mask = tex;
      this.uniforms.otherMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, maskSprite).prepend(tex.uvMatrix.mapCoord);
      this.uniforms.alpha = maskSprite.worldAlpha;
      this.uniforms.maskClamp = tex.uvMatrix.uClampFrame;
      filterManager.applyFilter(this, input, output, clearMode);
    };
    return SpriteMaskFilter2;
  }(Filter);
  var MaskSystem = function(_super) {
    __extends(MaskSystem2, _super);
    function MaskSystem2(renderer) {
      var _this = _super.call(this, renderer) || this;
      _this.enableScissor = false;
      _this.alphaMaskPool = [];
      _this.maskDataPool = [];
      _this.maskStack = [];
      _this.alphaMaskIndex = 0;
      return _this;
    }
    MaskSystem2.prototype.setMaskStack = function(maskStack) {
      this.maskStack = maskStack;
      this.renderer.scissor.setMaskStack(maskStack);
      this.renderer.stencil.setMaskStack(maskStack);
    };
    MaskSystem2.prototype.push = function(target, maskDataOrTarget) {
      var maskData = maskDataOrTarget;
      if (!maskData.isMaskData) {
        var d = this.maskDataPool.pop() || new MaskData();
        d.pooled = true;
        d.maskObject = maskDataOrTarget;
        maskData = d;
      }
      if (maskData.autoDetect) {
        this.detect(maskData);
      }
      maskData.copyCountersOrReset(this.maskStack[this.maskStack.length - 1]);
      maskData._target = target;
      switch (maskData.type) {
        case constants.MASK_TYPES.SCISSOR:
          this.maskStack.push(maskData);
          this.renderer.scissor.push(maskData);
          break;
        case constants.MASK_TYPES.STENCIL:
          this.maskStack.push(maskData);
          this.renderer.stencil.push(maskData);
          break;
        case constants.MASK_TYPES.SPRITE:
          maskData.copyCountersOrReset(null);
          this.pushSpriteMask(maskData);
          this.maskStack.push(maskData);
          break;
        default:
          break;
      }
    };
    MaskSystem2.prototype.pop = function(target) {
      var maskData = this.maskStack.pop();
      if (!maskData || maskData._target !== target) {
        return;
      }
      switch (maskData.type) {
        case constants.MASK_TYPES.SCISSOR:
          this.renderer.scissor.pop();
          break;
        case constants.MASK_TYPES.STENCIL:
          this.renderer.stencil.pop(maskData.maskObject);
          break;
        case constants.MASK_TYPES.SPRITE:
          this.popSpriteMask();
          break;
        default:
          break;
      }
      maskData.reset();
      if (maskData.pooled) {
        this.maskDataPool.push(maskData);
      }
    };
    MaskSystem2.prototype.detect = function(maskData) {
      var maskObject = maskData.maskObject;
      if (maskObject.isSprite) {
        maskData.type = constants.MASK_TYPES.SPRITE;
        return;
      }
      maskData.type = constants.MASK_TYPES.STENCIL;
      if (this.enableScissor && maskObject.isFastRect && maskObject.isFastRect()) {
        var matrix = maskObject.worldTransform;
        var rotX = Math.atan2(matrix.b, matrix.a);
        var rotXY = Math.atan2(matrix.d, matrix.c);
        rotX = Math.round(rotX * (180 / Math.PI) * 100);
        rotXY = Math.round(rotXY * (180 / Math.PI) * 100) - rotX;
        rotX = (rotX % 9e3 + 9e3) % 9e3;
        rotXY = (rotXY % 18e3 + 18e3) % 18e3;
        if (rotX === 0 && rotXY === 9e3) {
          maskData.type = constants.MASK_TYPES.SCISSOR;
        }
      }
    };
    MaskSystem2.prototype.pushSpriteMask = function(maskData) {
      var maskObject = maskData.maskObject;
      var target = maskData._target;
      var alphaMaskFilter = this.alphaMaskPool[this.alphaMaskIndex];
      if (!alphaMaskFilter) {
        alphaMaskFilter = this.alphaMaskPool[this.alphaMaskIndex] = [new SpriteMaskFilter(maskObject)];
      }
      alphaMaskFilter[0].resolution = this.renderer.resolution;
      alphaMaskFilter[0].maskSprite = maskObject;
      var stashFilterArea = target.filterArea;
      target.filterArea = maskObject.getBounds(true);
      this.renderer.filter.push(target, alphaMaskFilter);
      target.filterArea = stashFilterArea;
      this.alphaMaskIndex++;
    };
    MaskSystem2.prototype.popSpriteMask = function() {
      this.renderer.filter.pop();
      this.alphaMaskIndex--;
    };
    return MaskSystem2;
  }(System);
  var AbstractMaskSystem = function(_super) {
    __extends(AbstractMaskSystem2, _super);
    function AbstractMaskSystem2(renderer) {
      var _this = _super.call(this, renderer) || this;
      _this.maskStack = [];
      _this.glConst = 0;
      return _this;
    }
    AbstractMaskSystem2.prototype.getStackLength = function() {
      return this.maskStack.length;
    };
    AbstractMaskSystem2.prototype.setMaskStack = function(maskStack) {
      var gl = this.renderer.gl;
      var curStackLen = this.getStackLength();
      this.maskStack = maskStack;
      var newStackLen = this.getStackLength();
      if (newStackLen !== curStackLen) {
        if (newStackLen === 0) {
          gl.disable(this.glConst);
        } else {
          gl.enable(this.glConst);
          this._useCurrent();
        }
      }
    };
    AbstractMaskSystem2.prototype._useCurrent = function() {
    };
    AbstractMaskSystem2.prototype.destroy = function() {
      _super.prototype.destroy.call(this);
      this.maskStack = null;
    };
    return AbstractMaskSystem2;
  }(System);
  var ScissorSystem = function(_super) {
    __extends(ScissorSystem2, _super);
    function ScissorSystem2(renderer) {
      var _this = _super.call(this, renderer) || this;
      _this.glConst = WebGLRenderingContext.SCISSOR_TEST;
      return _this;
    }
    ScissorSystem2.prototype.getStackLength = function() {
      var maskData = this.maskStack[this.maskStack.length - 1];
      if (maskData) {
        return maskData._scissorCounter;
      }
      return 0;
    };
    ScissorSystem2.prototype.push = function(maskData) {
      var maskObject = maskData.maskObject;
      maskObject.renderable = true;
      var prevData = maskData._scissorRect;
      var bounds = maskObject.getBounds(true);
      var gl = this.renderer.gl;
      maskObject.renderable = false;
      if (prevData) {
        bounds.fit(prevData);
      } else {
        gl.enable(gl.SCISSOR_TEST);
      }
      maskData._scissorCounter++;
      maskData._scissorRect = bounds;
      this._useCurrent();
    };
    ScissorSystem2.prototype.pop = function() {
      var gl = this.renderer.gl;
      if (this.getStackLength() > 0) {
        this._useCurrent();
      } else {
        gl.disable(gl.SCISSOR_TEST);
      }
    };
    ScissorSystem2.prototype._useCurrent = function() {
      var rect = this.maskStack[this.maskStack.length - 1]._scissorRect;
      var rt = this.renderer.renderTexture.current;
      var _a = this.renderer.projection, transform = _a.transform, sourceFrame = _a.sourceFrame, destinationFrame = _a.destinationFrame;
      var resolution = rt ? rt.resolution : this.renderer.resolution;
      var x = (rect.x - sourceFrame.x) * resolution + destinationFrame.x;
      var y = (rect.y - sourceFrame.y) * resolution + destinationFrame.y;
      var width = rect.width * resolution;
      var height = rect.height * resolution;
      if (transform) {
        x += transform.tx * resolution;
        y += transform.ty * resolution;
      }
      if (!rt) {
        y = this.renderer.height - height - y;
      }
      this.renderer.gl.scissor(x, y, width, height);
    };
    return ScissorSystem2;
  }(AbstractMaskSystem);
  var StencilSystem = function(_super) {
    __extends(StencilSystem2, _super);
    function StencilSystem2(renderer) {
      var _this = _super.call(this, renderer) || this;
      _this.glConst = WebGLRenderingContext.STENCIL_TEST;
      return _this;
    }
    StencilSystem2.prototype.getStackLength = function() {
      var maskData = this.maskStack[this.maskStack.length - 1];
      if (maskData) {
        return maskData._stencilCounter;
      }
      return 0;
    };
    StencilSystem2.prototype.push = function(maskData) {
      var maskObject = maskData.maskObject;
      var gl = this.renderer.gl;
      var prevMaskCount = maskData._stencilCounter;
      if (prevMaskCount === 0) {
        this.renderer.framebuffer.forceStencil();
        gl.enable(gl.STENCIL_TEST);
      }
      maskData._stencilCounter++;
      gl.colorMask(false, false, false, false);
      gl.stencilFunc(gl.EQUAL, prevMaskCount, this._getBitwiseMask());
      gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
      maskObject.renderable = true;
      maskObject.render(this.renderer);
      this.renderer.batch.flush();
      maskObject.renderable = false;
      this._useCurrent();
    };
    StencilSystem2.prototype.pop = function(maskObject) {
      var gl = this.renderer.gl;
      if (this.getStackLength() === 0) {
        gl.disable(gl.STENCIL_TEST);
        gl.clear(gl.STENCIL_BUFFER_BIT);
        gl.clearStencil(0);
      } else {
        gl.colorMask(false, false, false, false);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);
        maskObject.renderable = true;
        maskObject.render(this.renderer);
        this.renderer.batch.flush();
        maskObject.renderable = false;
        this._useCurrent();
      }
    };
    StencilSystem2.prototype._useCurrent = function() {
      var gl = this.renderer.gl;
      gl.colorMask(true, true, true, true);
      gl.stencilFunc(gl.EQUAL, this.getStackLength(), this._getBitwiseMask());
      gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
    };
    StencilSystem2.prototype._getBitwiseMask = function() {
      return (1 << this.getStackLength()) - 1;
    };
    return StencilSystem2;
  }(AbstractMaskSystem);
  var ProjectionSystem = function(_super) {
    __extends(ProjectionSystem2, _super);
    function ProjectionSystem2(renderer) {
      var _this = _super.call(this, renderer) || this;
      _this.destinationFrame = null;
      _this.sourceFrame = null;
      _this.defaultFrame = null;
      _this.projectionMatrix = new math.Matrix();
      _this.transform = null;
      return _this;
    }
    ProjectionSystem2.prototype.update = function(destinationFrame, sourceFrame, resolution, root) {
      this.destinationFrame = destinationFrame || this.destinationFrame || this.defaultFrame;
      this.sourceFrame = sourceFrame || this.sourceFrame || destinationFrame;
      this.calculateProjection(this.destinationFrame, this.sourceFrame, resolution, root);
      if (this.transform) {
        this.projectionMatrix.append(this.transform);
      }
      var renderer = this.renderer;
      renderer.globalUniforms.uniforms.projectionMatrix = this.projectionMatrix;
      renderer.globalUniforms.update();
      if (renderer.shader.shader) {
        renderer.shader.syncUniformGroup(renderer.shader.shader.uniforms.globals);
      }
    };
    ProjectionSystem2.prototype.calculateProjection = function(_destinationFrame, sourceFrame, _resolution, root) {
      var pm = this.projectionMatrix;
      var sign = !root ? 1 : -1;
      pm.identity();
      pm.a = 1 / sourceFrame.width * 2;
      pm.d = sign * (1 / sourceFrame.height * 2);
      pm.tx = -1 - sourceFrame.x * pm.a;
      pm.ty = -sign - sourceFrame.y * pm.d;
    };
    ProjectionSystem2.prototype.setTransform = function(_matrix) {
    };
    return ProjectionSystem2;
  }(System);
  var tempRect = new math.Rectangle();
  var tempRect2 = new math.Rectangle();
  var viewportFrame = new math.Rectangle();
  var RenderTextureSystem = function(_super) {
    __extends(RenderTextureSystem2, _super);
    function RenderTextureSystem2(renderer) {
      var _this = _super.call(this, renderer) || this;
      _this.clearColor = renderer._backgroundColorRgba;
      _this.defaultMaskStack = [];
      _this.current = null;
      _this.sourceFrame = new math.Rectangle();
      _this.destinationFrame = new math.Rectangle();
      return _this;
    }
    RenderTextureSystem2.prototype.bind = function(renderTexture, sourceFrame, destinationFrame) {
      if (renderTexture === void 0) {
        renderTexture = null;
      }
      var renderer = this.renderer;
      this.current = renderTexture;
      var baseTexture;
      var framebuffer;
      var resolution;
      if (renderTexture) {
        baseTexture = renderTexture.baseTexture;
        resolution = baseTexture.resolution;
        if (!sourceFrame) {
          tempRect.width = renderTexture.frame.width;
          tempRect.height = renderTexture.frame.height;
          sourceFrame = tempRect;
        }
        if (!destinationFrame) {
          tempRect2.x = renderTexture.frame.x;
          tempRect2.y = renderTexture.frame.y;
          tempRect2.width = sourceFrame.width;
          tempRect2.height = sourceFrame.height;
          destinationFrame = tempRect2;
        }
        framebuffer = baseTexture.framebuffer;
      } else {
        resolution = renderer.resolution;
        if (!sourceFrame) {
          tempRect.width = renderer.screen.width;
          tempRect.height = renderer.screen.height;
          sourceFrame = tempRect;
        }
        if (!destinationFrame) {
          destinationFrame = tempRect;
          destinationFrame.width = sourceFrame.width;
          destinationFrame.height = sourceFrame.height;
        }
      }
      viewportFrame.x = destinationFrame.x * resolution;
      viewportFrame.y = destinationFrame.y * resolution;
      viewportFrame.width = destinationFrame.width * resolution;
      viewportFrame.height = destinationFrame.height * resolution;
      this.renderer.framebuffer.bind(framebuffer, viewportFrame);
      this.renderer.projection.update(destinationFrame, sourceFrame, resolution, !framebuffer);
      if (renderTexture) {
        this.renderer.mask.setMaskStack(baseTexture.maskStack);
      } else {
        this.renderer.mask.setMaskStack(this.defaultMaskStack);
      }
      this.sourceFrame.copyFrom(sourceFrame);
      this.destinationFrame.copyFrom(destinationFrame);
    };
    RenderTextureSystem2.prototype.clear = function(clearColor, mask) {
      if (this.current) {
        clearColor = clearColor || this.current.baseTexture.clearColor;
      } else {
        clearColor = clearColor || this.clearColor;
      }
      this.renderer.framebuffer.clear(clearColor[0], clearColor[1], clearColor[2], clearColor[3], mask);
    };
    RenderTextureSystem2.prototype.resize = function() {
      this.bind(null);
    };
    RenderTextureSystem2.prototype.reset = function() {
      this.bind(null);
    };
    return RenderTextureSystem2;
  }(System);
  var IGLUniformData = function() {
    function IGLUniformData2() {
    }
    return IGLUniformData2;
  }();
  var GLProgram = function() {
    function GLProgram2(program, uniformData) {
      this.program = program;
      this.uniformData = uniformData;
      this.uniformGroups = {};
    }
    GLProgram2.prototype.destroy = function() {
      this.uniformData = null;
      this.uniformGroups = null;
      this.program = null;
    };
    return GLProgram2;
  }();
  var UID$4 = 0;
  var defaultSyncData = {textureCount: 0};
  var ShaderSystem = function(_super) {
    __extends(ShaderSystem2, _super);
    function ShaderSystem2(renderer) {
      var _this = _super.call(this, renderer) || this;
      _this.destroyed = false;
      _this.systemCheck();
      _this.gl = null;
      _this.shader = null;
      _this.program = null;
      _this.cache = {};
      _this.id = UID$4++;
      return _this;
    }
    ShaderSystem2.prototype.systemCheck = function() {
      if (!unsafeEvalSupported()) {
        throw new Error("Current environment does not allow unsafe-eval, please use @pixi/unsafe-eval module to enable support.");
      }
    };
    ShaderSystem2.prototype.contextChange = function(gl) {
      this.gl = gl;
      this.reset();
    };
    ShaderSystem2.prototype.bind = function(shader, dontSync) {
      shader.uniforms.globals = this.renderer.globalUniforms;
      var program = shader.program;
      var glProgram = program.glPrograms[this.renderer.CONTEXT_UID] || this.generateShader(shader);
      this.shader = shader;
      if (this.program !== program) {
        this.program = program;
        this.gl.useProgram(glProgram.program);
      }
      if (!dontSync) {
        defaultSyncData.textureCount = 0;
        this.syncUniformGroup(shader.uniformGroup, defaultSyncData);
      }
      return glProgram;
    };
    ShaderSystem2.prototype.setUniforms = function(uniforms) {
      var shader = this.shader.program;
      var glProgram = shader.glPrograms[this.renderer.CONTEXT_UID];
      shader.syncUniforms(glProgram.uniformData, uniforms, this.renderer);
    };
    ShaderSystem2.prototype.syncUniformGroup = function(group, syncData) {
      var glProgram = this.getglProgram();
      if (!group.static || group.dirtyId !== glProgram.uniformGroups[group.id]) {
        glProgram.uniformGroups[group.id] = group.dirtyId;
        this.syncUniforms(group, glProgram, syncData);
      }
    };
    ShaderSystem2.prototype.syncUniforms = function(group, glProgram, syncData) {
      var syncFunc = group.syncUniforms[this.shader.program.id] || this.createSyncGroups(group);
      syncFunc(glProgram.uniformData, group.uniforms, this.renderer, syncData);
    };
    ShaderSystem2.prototype.createSyncGroups = function(group) {
      var id = this.getSignature(group, this.shader.program.uniformData);
      if (!this.cache[id]) {
        this.cache[id] = generateUniformsSync(group, this.shader.program.uniformData);
      }
      group.syncUniforms[this.shader.program.id] = this.cache[id];
      return group.syncUniforms[this.shader.program.id];
    };
    ShaderSystem2.prototype.getSignature = function(group, uniformData) {
      var uniforms = group.uniforms;
      var strings = [];
      for (var i in uniforms) {
        strings.push(i);
        if (uniformData[i]) {
          strings.push(uniformData[i].type);
        }
      }
      return strings.join("-");
    };
    ShaderSystem2.prototype.getglProgram = function() {
      if (this.shader) {
        return this.shader.program.glPrograms[this.renderer.CONTEXT_UID];
      }
      return null;
    };
    ShaderSystem2.prototype.generateShader = function(shader) {
      var gl = this.gl;
      var program = shader.program;
      var attribMap = {};
      for (var i in program.attributeData) {
        attribMap[i] = program.attributeData[i].location;
      }
      var shaderProgram = compileProgram(gl, program.vertexSrc, program.fragmentSrc, attribMap);
      var uniformData = {};
      for (var i in program.uniformData) {
        var data = program.uniformData[i];
        uniformData[i] = {
          location: gl.getUniformLocation(shaderProgram, i),
          value: defaultValue(data.type, data.size)
        };
      }
      var glProgram = new GLProgram(shaderProgram, uniformData);
      program.glPrograms[this.renderer.CONTEXT_UID] = glProgram;
      return glProgram;
    };
    ShaderSystem2.prototype.reset = function() {
      this.program = null;
      this.shader = null;
    };
    ShaderSystem2.prototype.destroy = function() {
      this.destroyed = true;
    };
    return ShaderSystem2;
  }(System);
  function mapWebGLBlendModesToPixi(gl, array) {
    if (array === void 0) {
      array = [];
    }
    array[constants.BLEND_MODES.NORMAL] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[constants.BLEND_MODES.ADD] = [gl.ONE, gl.ONE];
    array[constants.BLEND_MODES.MULTIPLY] = [gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[constants.BLEND_MODES.SCREEN] = [gl.ONE, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[constants.BLEND_MODES.OVERLAY] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[constants.BLEND_MODES.DARKEN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[constants.BLEND_MODES.LIGHTEN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[constants.BLEND_MODES.COLOR_DODGE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[constants.BLEND_MODES.COLOR_BURN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[constants.BLEND_MODES.HARD_LIGHT] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[constants.BLEND_MODES.SOFT_LIGHT] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[constants.BLEND_MODES.DIFFERENCE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[constants.BLEND_MODES.EXCLUSION] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[constants.BLEND_MODES.HUE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[constants.BLEND_MODES.SATURATION] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[constants.BLEND_MODES.COLOR] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[constants.BLEND_MODES.LUMINOSITY] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[constants.BLEND_MODES.NONE] = [0, 0];
    array[constants.BLEND_MODES.NORMAL_NPM] = [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[constants.BLEND_MODES.ADD_NPM] = [gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE];
    array[constants.BLEND_MODES.SCREEN_NPM] = [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[constants.BLEND_MODES.SRC_IN] = [gl.DST_ALPHA, gl.ZERO];
    array[constants.BLEND_MODES.SRC_OUT] = [gl.ONE_MINUS_DST_ALPHA, gl.ZERO];
    array[constants.BLEND_MODES.SRC_ATOP] = [gl.DST_ALPHA, gl.ONE_MINUS_SRC_ALPHA];
    array[constants.BLEND_MODES.DST_OVER] = [gl.ONE_MINUS_DST_ALPHA, gl.ONE];
    array[constants.BLEND_MODES.DST_IN] = [gl.ZERO, gl.SRC_ALPHA];
    array[constants.BLEND_MODES.DST_OUT] = [gl.ZERO, gl.ONE_MINUS_SRC_ALPHA];
    array[constants.BLEND_MODES.DST_ATOP] = [gl.ONE_MINUS_DST_ALPHA, gl.SRC_ALPHA];
    array[constants.BLEND_MODES.XOR] = [gl.ONE_MINUS_DST_ALPHA, gl.ONE_MINUS_SRC_ALPHA];
    array[constants.BLEND_MODES.SUBTRACT] = [gl.ONE, gl.ONE, gl.ONE, gl.ONE, gl.FUNC_REVERSE_SUBTRACT, gl.FUNC_ADD];
    return array;
  }
  var BLEND$1 = 0;
  var OFFSET$1 = 1;
  var CULLING$1 = 2;
  var DEPTH_TEST$1 = 3;
  var WINDING$1 = 4;
  var StateSystem = function(_super) {
    __extends(StateSystem2, _super);
    function StateSystem2(renderer) {
      var _this = _super.call(this, renderer) || this;
      _this.gl = null;
      _this.stateId = 0;
      _this.polygonOffset = 0;
      _this.blendMode = constants.BLEND_MODES.NONE;
      _this._blendEq = false;
      _this.map = [];
      _this.map[BLEND$1] = _this.setBlend;
      _this.map[OFFSET$1] = _this.setOffset;
      _this.map[CULLING$1] = _this.setCullFace;
      _this.map[DEPTH_TEST$1] = _this.setDepthTest;
      _this.map[WINDING$1] = _this.setFrontFace;
      _this.checks = [];
      _this.defaultState = new State();
      _this.defaultState.blend = true;
      return _this;
    }
    StateSystem2.prototype.contextChange = function(gl) {
      this.gl = gl;
      this.blendModes = mapWebGLBlendModesToPixi(gl);
      this.set(this.defaultState);
      this.reset();
    };
    StateSystem2.prototype.set = function(state) {
      state = state || this.defaultState;
      if (this.stateId !== state.data) {
        var diff = this.stateId ^ state.data;
        var i = 0;
        while (diff) {
          if (diff & 1) {
            this.map[i].call(this, !!(state.data & 1 << i));
          }
          diff = diff >> 1;
          i++;
        }
        this.stateId = state.data;
      }
      for (var i = 0; i < this.checks.length; i++) {
        this.checks[i](this, state);
      }
    };
    StateSystem2.prototype.forceState = function(state) {
      state = state || this.defaultState;
      for (var i = 0; i < this.map.length; i++) {
        this.map[i].call(this, !!(state.data & 1 << i));
      }
      for (var i = 0; i < this.checks.length; i++) {
        this.checks[i](this, state);
      }
      this.stateId = state.data;
    };
    StateSystem2.prototype.setBlend = function(value) {
      this.updateCheck(StateSystem2.checkBlendMode, value);
      this.gl[value ? "enable" : "disable"](this.gl.BLEND);
    };
    StateSystem2.prototype.setOffset = function(value) {
      this.updateCheck(StateSystem2.checkPolygonOffset, value);
      this.gl[value ? "enable" : "disable"](this.gl.POLYGON_OFFSET_FILL);
    };
    StateSystem2.prototype.setDepthTest = function(value) {
      this.gl[value ? "enable" : "disable"](this.gl.DEPTH_TEST);
    };
    StateSystem2.prototype.setCullFace = function(value) {
      this.gl[value ? "enable" : "disable"](this.gl.CULL_FACE);
    };
    StateSystem2.prototype.setFrontFace = function(value) {
      this.gl.frontFace(this.gl[value ? "CW" : "CCW"]);
    };
    StateSystem2.prototype.setBlendMode = function(value) {
      if (value === this.blendMode) {
        return;
      }
      this.blendMode = value;
      var mode = this.blendModes[value];
      var gl = this.gl;
      if (mode.length === 2) {
        gl.blendFunc(mode[0], mode[1]);
      } else {
        gl.blendFuncSeparate(mode[0], mode[1], mode[2], mode[3]);
      }
      if (mode.length === 6) {
        this._blendEq = true;
        gl.blendEquationSeparate(mode[4], mode[5]);
      } else if (this._blendEq) {
        this._blendEq = false;
        gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
      }
    };
    StateSystem2.prototype.setPolygonOffset = function(value, scale) {
      this.gl.polygonOffset(value, scale);
    };
    StateSystem2.prototype.reset = function() {
      this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);
      this.forceState(this.defaultState);
      this._blendEq = true;
      this.blendMode = -1;
      this.setBlendMode(0);
    };
    StateSystem2.prototype.updateCheck = function(func, value) {
      var index2 = this.checks.indexOf(func);
      if (value && index2 === -1) {
        this.checks.push(func);
      } else if (!value && index2 !== -1) {
        this.checks.splice(index2, 1);
      }
    };
    StateSystem2.checkBlendMode = function(system, state) {
      system.setBlendMode(state.blendMode);
    };
    StateSystem2.checkPolygonOffset = function(system, state) {
      system.setPolygonOffset(1, state.polygonOffset);
    };
    return StateSystem2;
  }(System);
  var TextureGCSystem = function(_super) {
    __extends(TextureGCSystem2, _super);
    function TextureGCSystem2(renderer) {
      var _this = _super.call(this, renderer) || this;
      _this.count = 0;
      _this.checkCount = 0;
      _this.maxIdle = settings.settings.GC_MAX_IDLE;
      _this.checkCountMax = settings.settings.GC_MAX_CHECK_COUNT;
      _this.mode = settings.settings.GC_MODE;
      return _this;
    }
    TextureGCSystem2.prototype.postrender = function() {
      if (!this.renderer.renderingToScreen) {
        return;
      }
      this.count++;
      if (this.mode === constants.GC_MODES.MANUAL) {
        return;
      }
      this.checkCount++;
      if (this.checkCount > this.checkCountMax) {
        this.checkCount = 0;
        this.run();
      }
    };
    TextureGCSystem2.prototype.run = function() {
      var tm = this.renderer.texture;
      var managedTextures = tm.managedTextures;
      var wasRemoved = false;
      for (var i = 0; i < managedTextures.length; i++) {
        var texture = managedTextures[i];
        if (!texture.framebuffer && this.count - texture.touched > this.maxIdle) {
          tm.destroyTexture(texture, true);
          managedTextures[i] = null;
          wasRemoved = true;
        }
      }
      if (wasRemoved) {
        var j = 0;
        for (var i = 0; i < managedTextures.length; i++) {
          if (managedTextures[i] !== null) {
            managedTextures[j++] = managedTextures[i];
          }
        }
        managedTextures.length = j;
      }
    };
    TextureGCSystem2.prototype.unload = function(displayObject) {
      var _a;
      var tm = this.renderer.texture;
      if ((_a = displayObject._texture) === null || _a === void 0 ? void 0 : _a.framebuffer) {
        tm.destroyTexture(displayObject._texture);
      }
      for (var i = displayObject.children.length - 1; i >= 0; i--) {
        this.unload(displayObject.children[i]);
      }
    };
    return TextureGCSystem2;
  }(System);
  var GLTexture = function() {
    function GLTexture2(texture) {
      this.texture = texture;
      this.width = -1;
      this.height = -1;
      this.dirtyId = -1;
      this.dirtyStyleId = -1;
      this.mipmap = false;
      this.wrapMode = 33071;
      this.type = 6408;
      this.internalFormat = 5121;
    }
    return GLTexture2;
  }();
  var TextureSystem = function(_super) {
    __extends(TextureSystem2, _super);
    function TextureSystem2(renderer) {
      var _this = _super.call(this, renderer) || this;
      _this.boundTextures = [];
      _this.currentLocation = -1;
      _this.managedTextures = [];
      _this._unknownBoundTextures = false;
      _this.unknownTexture = new BaseTexture();
      return _this;
    }
    TextureSystem2.prototype.contextChange = function() {
      var gl = this.gl = this.renderer.gl;
      this.CONTEXT_UID = this.renderer.CONTEXT_UID;
      this.webGLVersion = this.renderer.context.webGLVersion;
      var maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
      this.boundTextures.length = maxTextures;
      for (var i = 0; i < maxTextures; i++) {
        this.boundTextures[i] = null;
      }
      this.emptyTextures = {};
      var emptyTexture2D = new GLTexture(gl.createTexture());
      gl.bindTexture(gl.TEXTURE_2D, emptyTexture2D.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
      this.emptyTextures[gl.TEXTURE_2D] = emptyTexture2D;
      this.emptyTextures[gl.TEXTURE_CUBE_MAP] = new GLTexture(gl.createTexture());
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.emptyTextures[gl.TEXTURE_CUBE_MAP].texture);
      for (var i = 0; i < 6; i++) {
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      }
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      for (var i = 0; i < this.boundTextures.length; i++) {
        this.bind(null, i);
      }
    };
    TextureSystem2.prototype.bind = function(texture, location) {
      if (location === void 0) {
        location = 0;
      }
      var gl = this.gl;
      if (texture) {
        texture = texture.castToBaseTexture();
        if (texture.parentTextureArray) {
          return;
        }
        if (texture.valid) {
          texture.touched = this.renderer.textureGC.count;
          var glTexture = texture._glTextures[this.CONTEXT_UID] || this.initTexture(texture);
          if (this.boundTextures[location] !== texture) {
            if (this.currentLocation !== location) {
              this.currentLocation = location;
              gl.activeTexture(gl.TEXTURE0 + location);
            }
            gl.bindTexture(texture.target, glTexture.texture);
          }
          if (glTexture.dirtyId !== texture.dirtyId) {
            if (this.currentLocation !== location) {
              this.currentLocation = location;
              gl.activeTexture(gl.TEXTURE0 + location);
            }
            this.updateTexture(texture);
          }
          this.boundTextures[location] = texture;
        }
      } else {
        if (this.currentLocation !== location) {
          this.currentLocation = location;
          gl.activeTexture(gl.TEXTURE0 + location);
        }
        gl.bindTexture(gl.TEXTURE_2D, this.emptyTextures[gl.TEXTURE_2D].texture);
        this.boundTextures[location] = null;
      }
    };
    TextureSystem2.prototype.reset = function() {
      this._unknownBoundTextures = true;
      this.currentLocation = -1;
      for (var i = 0; i < this.boundTextures.length; i++) {
        this.boundTextures[i] = this.unknownTexture;
      }
    };
    TextureSystem2.prototype.unbind = function(texture) {
      var _a = this, gl = _a.gl, boundTextures = _a.boundTextures;
      if (this._unknownBoundTextures) {
        this._unknownBoundTextures = false;
        for (var i = 0; i < boundTextures.length; i++) {
          if (boundTextures[i] === this.unknownTexture) {
            this.bind(null, i);
          }
        }
      }
      for (var i = 0; i < boundTextures.length; i++) {
        if (boundTextures[i] === texture) {
          if (this.currentLocation !== i) {
            gl.activeTexture(gl.TEXTURE0 + i);
            this.currentLocation = i;
          }
          gl.bindTexture(texture.target, this.emptyTextures[texture.target].texture);
          boundTextures[i] = null;
        }
      }
    };
    TextureSystem2.prototype.initTexture = function(texture) {
      var glTexture = new GLTexture(this.gl.createTexture());
      glTexture.dirtyId = -1;
      texture._glTextures[this.CONTEXT_UID] = glTexture;
      this.managedTextures.push(texture);
      texture.on("dispose", this.destroyTexture, this);
      return glTexture;
    };
    TextureSystem2.prototype.initTextureType = function(texture, glTexture) {
      glTexture.internalFormat = texture.format;
      glTexture.type = texture.type;
      if (this.webGLVersion !== 2) {
        return;
      }
      var gl = this.renderer.gl;
      if (texture.type === gl.FLOAT && texture.format === gl.RGBA) {
        glTexture.internalFormat = gl.RGBA32F;
      }
      if (texture.type === constants.TYPES.HALF_FLOAT) {
        glTexture.type = gl.HALF_FLOAT;
      }
      if (glTexture.type === gl.HALF_FLOAT && texture.format === gl.RGBA) {
        glTexture.internalFormat = gl.RGBA16F;
      }
    };
    TextureSystem2.prototype.updateTexture = function(texture) {
      var glTexture = texture._glTextures[this.CONTEXT_UID];
      if (!glTexture) {
        return;
      }
      var renderer = this.renderer;
      this.initTextureType(texture, glTexture);
      if (texture.resource && texture.resource.upload(renderer, texture, glTexture))
        ;
      else {
        var width = texture.realWidth;
        var height = texture.realHeight;
        var gl = renderer.gl;
        if (glTexture.width !== width || glTexture.height !== height || glTexture.dirtyId < 0) {
          glTexture.width = width;
          glTexture.height = height;
          gl.texImage2D(texture.target, 0, glTexture.internalFormat, width, height, 0, texture.format, glTexture.type, null);
        }
      }
      if (texture.dirtyStyleId !== glTexture.dirtyStyleId) {
        this.updateTextureStyle(texture);
      }
      glTexture.dirtyId = texture.dirtyId;
    };
    TextureSystem2.prototype.destroyTexture = function(texture, skipRemove) {
      var gl = this.gl;
      texture = texture.castToBaseTexture();
      if (texture._glTextures[this.CONTEXT_UID]) {
        this.unbind(texture);
        gl.deleteTexture(texture._glTextures[this.CONTEXT_UID].texture);
        texture.off("dispose", this.destroyTexture, this);
        delete texture._glTextures[this.CONTEXT_UID];
        if (!skipRemove) {
          var i = this.managedTextures.indexOf(texture);
          if (i !== -1) {
            utils.removeItems(this.managedTextures, i, 1);
          }
        }
      }
    };
    TextureSystem2.prototype.updateTextureStyle = function(texture) {
      var glTexture = texture._glTextures[this.CONTEXT_UID];
      if (!glTexture) {
        return;
      }
      if ((texture.mipmap === constants.MIPMAP_MODES.POW2 || this.webGLVersion !== 2) && !texture.isPowerOfTwo) {
        glTexture.mipmap = false;
      } else {
        glTexture.mipmap = texture.mipmap >= 1;
      }
      if (this.webGLVersion !== 2 && !texture.isPowerOfTwo) {
        glTexture.wrapMode = constants.WRAP_MODES.CLAMP;
      } else {
        glTexture.wrapMode = texture.wrapMode;
      }
      if (texture.resource && texture.resource.style(this.renderer, texture, glTexture))
        ;
      else {
        this.setStyle(texture, glTexture);
      }
      glTexture.dirtyStyleId = texture.dirtyStyleId;
    };
    TextureSystem2.prototype.setStyle = function(texture, glTexture) {
      var gl = this.gl;
      if (glTexture.mipmap) {
        gl.generateMipmap(texture.target);
      }
      gl.texParameteri(texture.target, gl.TEXTURE_WRAP_S, glTexture.wrapMode);
      gl.texParameteri(texture.target, gl.TEXTURE_WRAP_T, glTexture.wrapMode);
      if (glTexture.mipmap) {
        gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, texture.scaleMode === constants.SCALE_MODES.LINEAR ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST_MIPMAP_NEAREST);
        var anisotropicExt = this.renderer.context.extensions.anisotropicFiltering;
        if (anisotropicExt && texture.anisotropicLevel > 0 && texture.scaleMode === constants.SCALE_MODES.LINEAR) {
          var level = Math.min(texture.anisotropicLevel, gl.getParameter(anisotropicExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT));
          gl.texParameterf(texture.target, anisotropicExt.TEXTURE_MAX_ANISOTROPY_EXT, level);
        }
      } else {
        gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, texture.scaleMode === constants.SCALE_MODES.LINEAR ? gl.LINEAR : gl.NEAREST);
      }
      gl.texParameteri(texture.target, gl.TEXTURE_MAG_FILTER, texture.scaleMode === constants.SCALE_MODES.LINEAR ? gl.LINEAR : gl.NEAREST);
    };
    return TextureSystem2;
  }(System);
  var systems = {
    FilterSystem,
    BatchSystem,
    ContextSystem,
    FramebufferSystem,
    GeometrySystem,
    MaskSystem,
    ScissorSystem,
    StencilSystem,
    ProjectionSystem,
    RenderTextureSystem,
    ShaderSystem,
    StateSystem,
    TextureGCSystem,
    TextureSystem
  };
  var tempMatrix = new math.Matrix();
  var AbstractRenderer = function(_super) {
    __extends(AbstractRenderer2, _super);
    function AbstractRenderer2(type, options) {
      if (type === void 0) {
        type = constants.RENDERER_TYPE.UNKNOWN;
      }
      var _this = _super.call(this) || this;
      options = Object.assign({}, settings.settings.RENDER_OPTIONS, options);
      if (options.roundPixels) {
        settings.settings.ROUND_PIXELS = options.roundPixels;
        utils.deprecation("5.0.0", "Renderer roundPixels option is deprecated, please use PIXI.settings.ROUND_PIXELS", 2);
      }
      _this.options = options;
      _this.type = type;
      _this.screen = new math.Rectangle(0, 0, options.width, options.height);
      _this.view = options.view || document.createElement("canvas");
      _this.resolution = options.resolution || settings.settings.RESOLUTION;
      _this.transparent = options.transparent;
      _this.autoDensity = options.autoDensity || options.autoResize || false;
      _this.preserveDrawingBuffer = options.preserveDrawingBuffer;
      _this.clearBeforeRender = options.clearBeforeRender;
      _this._backgroundColor = 0;
      _this._backgroundColorRgba = [0, 0, 0, 0];
      _this._backgroundColorString = "#000000";
      _this.backgroundColor = options.backgroundColor || _this._backgroundColor;
      _this._lastObjectRendered = null;
      _this.plugins = {};
      return _this;
    }
    AbstractRenderer2.prototype.initPlugins = function(staticMap) {
      for (var o in staticMap) {
        this.plugins[o] = new staticMap[o](this);
      }
    };
    Object.defineProperty(AbstractRenderer2.prototype, "width", {
      get: function() {
        return this.view.width;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(AbstractRenderer2.prototype, "height", {
      get: function() {
        return this.view.height;
      },
      enumerable: false,
      configurable: true
    });
    AbstractRenderer2.prototype.resize = function(screenWidth, screenHeight) {
      this.screen.width = screenWidth;
      this.screen.height = screenHeight;
      this.view.width = screenWidth * this.resolution;
      this.view.height = screenHeight * this.resolution;
      if (this.autoDensity) {
        this.view.style.width = screenWidth + "px";
        this.view.style.height = screenHeight + "px";
      }
      this.emit("resize", screenWidth, screenHeight);
    };
    AbstractRenderer2.prototype.generateTexture = function(displayObject, scaleMode, resolution, region) {
      region = region || displayObject.getLocalBounds(null, true);
      if (region.width === 0) {
        region.width = 1;
      }
      if (region.height === 0) {
        region.height = 1;
      }
      var renderTexture = RenderTexture.create({
        width: region.width | 0,
        height: region.height | 0,
        scaleMode,
        resolution
      });
      tempMatrix.tx = -region.x;
      tempMatrix.ty = -region.y;
      this.render(displayObject, renderTexture, false, tempMatrix, !!displayObject.parent);
      return renderTexture;
    };
    AbstractRenderer2.prototype.destroy = function(removeView) {
      for (var o in this.plugins) {
        this.plugins[o].destroy();
        this.plugins[o] = null;
      }
      if (removeView && this.view.parentNode) {
        this.view.parentNode.removeChild(this.view);
      }
      var thisAny = this;
      thisAny.plugins = null;
      thisAny.type = constants.RENDERER_TYPE.UNKNOWN;
      thisAny.view = null;
      thisAny.screen = null;
      thisAny._tempDisplayObjectParent = null;
      thisAny.options = null;
      this._backgroundColorRgba = null;
      this._backgroundColorString = null;
      this._lastObjectRendered = null;
    };
    Object.defineProperty(AbstractRenderer2.prototype, "backgroundColor", {
      get: function() {
        return this._backgroundColor;
      },
      set: function(value) {
        this._backgroundColor = value;
        this._backgroundColorString = utils.hex2string(value);
        utils.hex2rgb(value, this._backgroundColorRgba);
      },
      enumerable: false,
      configurable: true
    });
    return AbstractRenderer2;
  }(utils.EventEmitter);
  var Renderer = function(_super) {
    __extends(Renderer2, _super);
    function Renderer2(options) {
      var _this = _super.call(this, constants.RENDERER_TYPE.WEBGL, options) || this;
      options = _this.options;
      _this.gl = null;
      _this.CONTEXT_UID = 0;
      _this.runners = {
        destroy: new runner.Runner("destroy"),
        contextChange: new runner.Runner("contextChange"),
        reset: new runner.Runner("reset"),
        update: new runner.Runner("update"),
        postrender: new runner.Runner("postrender"),
        prerender: new runner.Runner("prerender"),
        resize: new runner.Runner("resize")
      };
      _this.globalUniforms = new UniformGroup({
        projectionMatrix: new math.Matrix()
      }, true);
      _this.addSystem(MaskSystem, "mask").addSystem(ContextSystem, "context").addSystem(StateSystem, "state").addSystem(ShaderSystem, "shader").addSystem(TextureSystem, "texture").addSystem(GeometrySystem, "geometry").addSystem(FramebufferSystem, "framebuffer").addSystem(ScissorSystem, "scissor").addSystem(StencilSystem, "stencil").addSystem(ProjectionSystem, "projection").addSystem(TextureGCSystem, "textureGC").addSystem(FilterSystem, "filter").addSystem(RenderTextureSystem, "renderTexture").addSystem(BatchSystem, "batch");
      _this.initPlugins(Renderer2.__plugins);
      if (options.context) {
        _this.context.initFromContext(options.context);
      } else {
        _this.context.initFromOptions({
          alpha: !!_this.transparent,
          antialias: options.antialias,
          premultipliedAlpha: _this.transparent && _this.transparent !== "notMultiplied",
          stencil: true,
          preserveDrawingBuffer: options.preserveDrawingBuffer,
          powerPreference: _this.options.powerPreference
        });
      }
      _this.renderingToScreen = true;
      utils.sayHello(_this.context.webGLVersion === 2 ? "WebGL 2" : "WebGL 1");
      _this.resize(_this.options.width, _this.options.height);
      return _this;
    }
    Renderer2.create = function(options) {
      if (utils.isWebGLSupported()) {
        return new Renderer2(options);
      }
      throw new Error('WebGL unsupported in this browser, use "pixi.js-legacy" for fallback canvas2d support.');
    };
    Renderer2.prototype.addSystem = function(ClassRef, name) {
      if (!name) {
        name = ClassRef.name;
      }
      var system = new ClassRef(this);
      if (this[name]) {
        throw new Error('Whoops! The name "' + name + '" is already in use');
      }
      this[name] = system;
      for (var i in this.runners) {
        this.runners[i].add(system);
      }
      return this;
    };
    Renderer2.prototype.render = function(displayObject, renderTexture, clear, transform, skipUpdateTransform) {
      this.renderingToScreen = !renderTexture;
      this.runners.prerender.emit();
      this.emit("prerender");
      this.projection.transform = transform;
      if (this.context.isLost) {
        return;
      }
      if (!renderTexture) {
        this._lastObjectRendered = displayObject;
      }
      if (!skipUpdateTransform) {
        var cacheParent = displayObject.enableTempParent();
        displayObject.updateTransform();
        displayObject.disableTempParent(cacheParent);
      }
      this.renderTexture.bind(renderTexture);
      this.batch.currentRenderer.start();
      if (clear !== void 0 ? clear : this.clearBeforeRender) {
        this.renderTexture.clear();
      }
      displayObject.render(this);
      this.batch.currentRenderer.flush();
      if (renderTexture) {
        renderTexture.baseTexture.update();
      }
      this.runners.postrender.emit();
      this.projection.transform = null;
      this.emit("postrender");
    };
    Renderer2.prototype.resize = function(screenWidth, screenHeight) {
      _super.prototype.resize.call(this, screenWidth, screenHeight);
      this.runners.resize.emit(screenWidth, screenHeight);
    };
    Renderer2.prototype.reset = function() {
      this.runners.reset.emit();
      return this;
    };
    Renderer2.prototype.clear = function() {
      this.renderTexture.bind();
      this.renderTexture.clear();
    };
    Renderer2.prototype.destroy = function(removeView) {
      this.runners.destroy.emit();
      for (var r in this.runners) {
        this.runners[r].destroy();
      }
      _super.prototype.destroy.call(this, removeView);
      this.gl = null;
    };
    Renderer2.registerPlugin = function(pluginName, ctor) {
      Renderer2.__plugins = Renderer2.__plugins || {};
      Renderer2.__plugins[pluginName] = ctor;
    };
    return Renderer2;
  }(AbstractRenderer);
  function autoDetectRenderer(options) {
    return Renderer.create(options);
  }
  var _default = "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n}";
  var defaultFilter = "attribute vec2 aVertexPosition;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nuniform vec4 inputSize;\nuniform vec4 outputFrame;\n\nvec4 filterVertexPosition( void )\n{\n    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;\n\n    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);\n}\n\nvec2 filterTextureCoord( void )\n{\n    return aVertexPosition * (outputFrame.zw * inputSize.zw);\n}\n\nvoid main(void)\n{\n    gl_Position = filterVertexPosition();\n    vTextureCoord = filterTextureCoord();\n}\n";
  var BatchDrawCall = function() {
    function BatchDrawCall2() {
      this.texArray = null;
      this.blend = 0;
      this.type = constants.DRAW_MODES.TRIANGLES;
      this.start = 0;
      this.size = 0;
      this.data = null;
    }
    return BatchDrawCall2;
  }();
  var BatchTextureArray = function() {
    function BatchTextureArray2() {
      this.elements = [];
      this.ids = [];
      this.count = 0;
    }
    BatchTextureArray2.prototype.clear = function() {
      for (var i = 0; i < this.count; i++) {
        this.elements[i] = null;
      }
      this.count = 0;
    };
    return BatchTextureArray2;
  }();
  var ViewableBuffer = function() {
    function ViewableBuffer2(size) {
      this.rawBinaryData = new ArrayBuffer(size);
      this.uint32View = new Uint32Array(this.rawBinaryData);
      this.float32View = new Float32Array(this.rawBinaryData);
    }
    Object.defineProperty(ViewableBuffer2.prototype, "int8View", {
      get: function() {
        if (!this._int8View) {
          this._int8View = new Int8Array(this.rawBinaryData);
        }
        return this._int8View;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(ViewableBuffer2.prototype, "uint8View", {
      get: function() {
        if (!this._uint8View) {
          this._uint8View = new Uint8Array(this.rawBinaryData);
        }
        return this._uint8View;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(ViewableBuffer2.prototype, "int16View", {
      get: function() {
        if (!this._int16View) {
          this._int16View = new Int16Array(this.rawBinaryData);
        }
        return this._int16View;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(ViewableBuffer2.prototype, "uint16View", {
      get: function() {
        if (!this._uint16View) {
          this._uint16View = new Uint16Array(this.rawBinaryData);
        }
        return this._uint16View;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(ViewableBuffer2.prototype, "int32View", {
      get: function() {
        if (!this._int32View) {
          this._int32View = new Int32Array(this.rawBinaryData);
        }
        return this._int32View;
      },
      enumerable: false,
      configurable: true
    });
    ViewableBuffer2.prototype.view = function(type) {
      return this[type + "View"];
    };
    ViewableBuffer2.prototype.destroy = function() {
      this.rawBinaryData = null;
      this._int8View = null;
      this._uint8View = null;
      this._int16View = null;
      this._uint16View = null;
      this._int32View = null;
      this.uint32View = null;
      this.float32View = null;
    };
    ViewableBuffer2.sizeOf = function(type) {
      switch (type) {
        case "int8":
        case "uint8":
          return 1;
        case "int16":
        case "uint16":
          return 2;
        case "int32":
        case "uint32":
        case "float32":
          return 4;
        default:
          throw new Error(type + " isn't a valid view type");
      }
    };
    return ViewableBuffer2;
  }();
  var AbstractBatchRenderer = function(_super) {
    __extends(AbstractBatchRenderer2, _super);
    function AbstractBatchRenderer2(renderer) {
      var _this = _super.call(this, renderer) || this;
      _this.shaderGenerator = null;
      _this.geometryClass = null;
      _this.vertexSize = null;
      _this.state = State.for2d();
      _this.size = settings.settings.SPRITE_BATCH_SIZE * 4;
      _this._vertexCount = 0;
      _this._indexCount = 0;
      _this._bufferedElements = [];
      _this._bufferedTextures = [];
      _this._bufferSize = 0;
      _this._shader = null;
      _this._packedGeometries = [];
      _this._packedGeometryPoolSize = 2;
      _this._flushId = 0;
      _this._aBuffers = {};
      _this._iBuffers = {};
      _this.MAX_TEXTURES = 1;
      _this.renderer.on("prerender", _this.onPrerender, _this);
      renderer.runners.contextChange.add(_this);
      _this._dcIndex = 0;
      _this._aIndex = 0;
      _this._iIndex = 0;
      _this._attributeBuffer = null;
      _this._indexBuffer = null;
      _this._tempBoundTextures = [];
      return _this;
    }
    AbstractBatchRenderer2.prototype.contextChange = function() {
      var gl = this.renderer.gl;
      if (settings.settings.PREFER_ENV === constants.ENV.WEBGL_LEGACY) {
        this.MAX_TEXTURES = 1;
      } else {
        this.MAX_TEXTURES = Math.min(gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS), settings.settings.SPRITE_MAX_TEXTURES);
        this.MAX_TEXTURES = checkMaxIfStatementsInShader(this.MAX_TEXTURES, gl);
      }
      this._shader = this.shaderGenerator.generateShader(this.MAX_TEXTURES);
      for (var i = 0; i < this._packedGeometryPoolSize; i++) {
        this._packedGeometries[i] = new this.geometryClass();
      }
      this.initFlushBuffers();
    };
    AbstractBatchRenderer2.prototype.initFlushBuffers = function() {
      var _drawCallPool = AbstractBatchRenderer2._drawCallPool, _textureArrayPool = AbstractBatchRenderer2._textureArrayPool;
      var MAX_SPRITES = this.size / 4;
      var MAX_TA = Math.floor(MAX_SPRITES / this.MAX_TEXTURES) + 1;
      while (_drawCallPool.length < MAX_SPRITES) {
        _drawCallPool.push(new BatchDrawCall());
      }
      while (_textureArrayPool.length < MAX_TA) {
        _textureArrayPool.push(new BatchTextureArray());
      }
      for (var i = 0; i < this.MAX_TEXTURES; i++) {
        this._tempBoundTextures[i] = null;
      }
    };
    AbstractBatchRenderer2.prototype.onPrerender = function() {
      this._flushId = 0;
    };
    AbstractBatchRenderer2.prototype.render = function(element) {
      if (!element._texture.valid) {
        return;
      }
      if (this._vertexCount + element.vertexData.length / 2 > this.size) {
        this.flush();
      }
      this._vertexCount += element.vertexData.length / 2;
      this._indexCount += element.indices.length;
      this._bufferedTextures[this._bufferSize] = element._texture.baseTexture;
      this._bufferedElements[this._bufferSize++] = element;
    };
    AbstractBatchRenderer2.prototype.buildTexturesAndDrawCalls = function() {
      var _a = this, textures = _a._bufferedTextures, MAX_TEXTURES = _a.MAX_TEXTURES;
      var textureArrays = AbstractBatchRenderer2._textureArrayPool;
      var batch = this.renderer.batch;
      var boundTextures = this._tempBoundTextures;
      var touch = this.renderer.textureGC.count;
      var TICK = ++BaseTexture._globalBatch;
      var countTexArrays = 0;
      var texArray = textureArrays[0];
      var start = 0;
      batch.copyBoundTextures(boundTextures, MAX_TEXTURES);
      for (var i = 0; i < this._bufferSize; ++i) {
        var tex = textures[i];
        textures[i] = null;
        if (tex._batchEnabled === TICK) {
          continue;
        }
        if (texArray.count >= MAX_TEXTURES) {
          batch.boundArray(texArray, boundTextures, TICK, MAX_TEXTURES);
          this.buildDrawCalls(texArray, start, i);
          start = i;
          texArray = textureArrays[++countTexArrays];
          ++TICK;
        }
        tex._batchEnabled = TICK;
        tex.touched = touch;
        texArray.elements[texArray.count++] = tex;
      }
      if (texArray.count > 0) {
        batch.boundArray(texArray, boundTextures, TICK, MAX_TEXTURES);
        this.buildDrawCalls(texArray, start, this._bufferSize);
        ++countTexArrays;
        ++TICK;
      }
      for (var i = 0; i < boundTextures.length; i++) {
        boundTextures[i] = null;
      }
      BaseTexture._globalBatch = TICK;
    };
    AbstractBatchRenderer2.prototype.buildDrawCalls = function(texArray, start, finish) {
      var _a = this, elements = _a._bufferedElements, _attributeBuffer = _a._attributeBuffer, _indexBuffer = _a._indexBuffer, vertexSize = _a.vertexSize;
      var drawCalls = AbstractBatchRenderer2._drawCallPool;
      var dcIndex = this._dcIndex;
      var aIndex = this._aIndex;
      var iIndex = this._iIndex;
      var drawCall = drawCalls[dcIndex];
      drawCall.start = this._iIndex;
      drawCall.texArray = texArray;
      for (var i = start; i < finish; ++i) {
        var sprite = elements[i];
        var tex = sprite._texture.baseTexture;
        var spriteBlendMode = utils.premultiplyBlendMode[tex.alphaMode ? 1 : 0][sprite.blendMode];
        elements[i] = null;
        if (start < i && drawCall.blend !== spriteBlendMode) {
          drawCall.size = iIndex - drawCall.start;
          start = i;
          drawCall = drawCalls[++dcIndex];
          drawCall.texArray = texArray;
          drawCall.start = iIndex;
        }
        this.packInterleavedGeometry(sprite, _attributeBuffer, _indexBuffer, aIndex, iIndex);
        aIndex += sprite.vertexData.length / 2 * vertexSize;
        iIndex += sprite.indices.length;
        drawCall.blend = spriteBlendMode;
      }
      if (start < finish) {
        drawCall.size = iIndex - drawCall.start;
        ++dcIndex;
      }
      this._dcIndex = dcIndex;
      this._aIndex = aIndex;
      this._iIndex = iIndex;
    };
    AbstractBatchRenderer2.prototype.bindAndClearTexArray = function(texArray) {
      var textureSystem = this.renderer.texture;
      for (var j = 0; j < texArray.count; j++) {
        textureSystem.bind(texArray.elements[j], texArray.ids[j]);
        texArray.elements[j] = null;
      }
      texArray.count = 0;
    };
    AbstractBatchRenderer2.prototype.updateGeometry = function() {
      var _a = this, packedGeometries = _a._packedGeometries, attributeBuffer = _a._attributeBuffer, indexBuffer = _a._indexBuffer;
      if (!settings.settings.CAN_UPLOAD_SAME_BUFFER) {
        if (this._packedGeometryPoolSize <= this._flushId) {
          this._packedGeometryPoolSize++;
          packedGeometries[this._flushId] = new this.geometryClass();
        }
        packedGeometries[this._flushId]._buffer.update(attributeBuffer.rawBinaryData);
        packedGeometries[this._flushId]._indexBuffer.update(indexBuffer);
        this.renderer.geometry.bind(packedGeometries[this._flushId]);
        this.renderer.geometry.updateBuffers();
        this._flushId++;
      } else {
        packedGeometries[this._flushId]._buffer.update(attributeBuffer.rawBinaryData);
        packedGeometries[this._flushId]._indexBuffer.update(indexBuffer);
        this.renderer.geometry.updateBuffers();
      }
    };
    AbstractBatchRenderer2.prototype.drawBatches = function() {
      var dcCount = this._dcIndex;
      var _a = this.renderer, gl = _a.gl, stateSystem = _a.state;
      var drawCalls = AbstractBatchRenderer2._drawCallPool;
      var curTexArray = null;
      for (var i = 0; i < dcCount; i++) {
        var _b = drawCalls[i], texArray = _b.texArray, type = _b.type, size = _b.size, start = _b.start, blend = _b.blend;
        if (curTexArray !== texArray) {
          curTexArray = texArray;
          this.bindAndClearTexArray(texArray);
        }
        this.state.blendMode = blend;
        stateSystem.set(this.state);
        gl.drawElements(type, size, gl.UNSIGNED_SHORT, start * 2);
      }
    };
    AbstractBatchRenderer2.prototype.flush = function() {
      if (this._vertexCount === 0) {
        return;
      }
      this._attributeBuffer = this.getAttributeBuffer(this._vertexCount);
      this._indexBuffer = this.getIndexBuffer(this._indexCount);
      this._aIndex = 0;
      this._iIndex = 0;
      this._dcIndex = 0;
      this.buildTexturesAndDrawCalls();
      this.updateGeometry();
      this.drawBatches();
      this._bufferSize = 0;
      this._vertexCount = 0;
      this._indexCount = 0;
    };
    AbstractBatchRenderer2.prototype.start = function() {
      this.renderer.state.set(this.state);
      this.renderer.shader.bind(this._shader);
      if (settings.settings.CAN_UPLOAD_SAME_BUFFER) {
        this.renderer.geometry.bind(this._packedGeometries[this._flushId]);
      }
    };
    AbstractBatchRenderer2.prototype.stop = function() {
      this.flush();
    };
    AbstractBatchRenderer2.prototype.destroy = function() {
      for (var i = 0; i < this._packedGeometryPoolSize; i++) {
        if (this._packedGeometries[i]) {
          this._packedGeometries[i].destroy();
        }
      }
      this.renderer.off("prerender", this.onPrerender, this);
      this._aBuffers = null;
      this._iBuffers = null;
      this._packedGeometries = null;
      this._attributeBuffer = null;
      this._indexBuffer = null;
      if (this._shader) {
        this._shader.destroy();
        this._shader = null;
      }
      _super.prototype.destroy.call(this);
    };
    AbstractBatchRenderer2.prototype.getAttributeBuffer = function(size) {
      var roundedP2 = utils.nextPow2(Math.ceil(size / 8));
      var roundedSizeIndex = utils.log2(roundedP2);
      var roundedSize = roundedP2 * 8;
      if (this._aBuffers.length <= roundedSizeIndex) {
        this._iBuffers.length = roundedSizeIndex + 1;
      }
      var buffer = this._aBuffers[roundedSize];
      if (!buffer) {
        this._aBuffers[roundedSize] = buffer = new ViewableBuffer(roundedSize * this.vertexSize * 4);
      }
      return buffer;
    };
    AbstractBatchRenderer2.prototype.getIndexBuffer = function(size) {
      var roundedP2 = utils.nextPow2(Math.ceil(size / 12));
      var roundedSizeIndex = utils.log2(roundedP2);
      var roundedSize = roundedP2 * 12;
      if (this._iBuffers.length <= roundedSizeIndex) {
        this._iBuffers.length = roundedSizeIndex + 1;
      }
      var buffer = this._iBuffers[roundedSizeIndex];
      if (!buffer) {
        this._iBuffers[roundedSizeIndex] = buffer = new Uint16Array(roundedSize);
      }
      return buffer;
    };
    AbstractBatchRenderer2.prototype.packInterleavedGeometry = function(element, attributeBuffer, indexBuffer, aIndex, iIndex) {
      var uint32View = attributeBuffer.uint32View, float32View = attributeBuffer.float32View;
      var packedVertices = aIndex / this.vertexSize;
      var uvs = element.uvs;
      var indicies = element.indices;
      var vertexData = element.vertexData;
      var textureId = element._texture.baseTexture._batchLocation;
      var alpha = Math.min(element.worldAlpha, 1);
      var argb = alpha < 1 && element._texture.baseTexture.alphaMode ? utils.premultiplyTint(element._tintRGB, alpha) : element._tintRGB + (alpha * 255 << 24);
      for (var i = 0; i < vertexData.length; i += 2) {
        float32View[aIndex++] = vertexData[i];
        float32View[aIndex++] = vertexData[i + 1];
        float32View[aIndex++] = uvs[i];
        float32View[aIndex++] = uvs[i + 1];
        uint32View[aIndex++] = argb;
        float32View[aIndex++] = textureId;
      }
      for (var i = 0; i < indicies.length; i++) {
        indexBuffer[iIndex++] = packedVertices + indicies[i];
      }
    };
    AbstractBatchRenderer2._drawCallPool = [];
    AbstractBatchRenderer2._textureArrayPool = [];
    return AbstractBatchRenderer2;
  }(ObjectRenderer);
  var BatchShaderGenerator = function() {
    function BatchShaderGenerator2(vertexSrc, fragTemplate2) {
      this.vertexSrc = vertexSrc;
      this.fragTemplate = fragTemplate2;
      this.programCache = {};
      this.defaultGroupCache = {};
      if (fragTemplate2.indexOf("%count%") < 0) {
        throw new Error('Fragment template must contain "%count%".');
      }
      if (fragTemplate2.indexOf("%forloop%") < 0) {
        throw new Error('Fragment template must contain "%forloop%".');
      }
    }
    BatchShaderGenerator2.prototype.generateShader = function(maxTextures) {
      if (!this.programCache[maxTextures]) {
        var sampleValues = new Int32Array(maxTextures);
        for (var i = 0; i < maxTextures; i++) {
          sampleValues[i] = i;
        }
        this.defaultGroupCache[maxTextures] = UniformGroup.from({uSamplers: sampleValues}, true);
        var fragmentSrc = this.fragTemplate;
        fragmentSrc = fragmentSrc.replace(/%count%/gi, "" + maxTextures);
        fragmentSrc = fragmentSrc.replace(/%forloop%/gi, this.generateSampleSrc(maxTextures));
        this.programCache[maxTextures] = new Program(this.vertexSrc, fragmentSrc);
      }
      var uniforms = {
        tint: new Float32Array([1, 1, 1, 1]),
        translationMatrix: new math.Matrix(),
        default: this.defaultGroupCache[maxTextures]
      };
      return new Shader(this.programCache[maxTextures], uniforms);
    };
    BatchShaderGenerator2.prototype.generateSampleSrc = function(maxTextures) {
      var src = "";
      src += "\n";
      src += "\n";
      for (var i = 0; i < maxTextures; i++) {
        if (i > 0) {
          src += "\nelse ";
        }
        if (i < maxTextures - 1) {
          src += "if(vTextureId < " + i + ".5)";
        }
        src += "\n{";
        src += "\n	color = texture2D(uSamplers[" + i + "], vTextureCoord);";
        src += "\n}";
      }
      src += "\n";
      src += "\n";
      return src;
    };
    return BatchShaderGenerator2;
  }();
  var BatchGeometry = function(_super) {
    __extends(BatchGeometry2, _super);
    function BatchGeometry2(_static) {
      if (_static === void 0) {
        _static = false;
      }
      var _this = _super.call(this) || this;
      _this._buffer = new Buffer2(null, _static, false);
      _this._indexBuffer = new Buffer2(null, _static, true);
      _this.addAttribute("aVertexPosition", _this._buffer, 2, false, constants.TYPES.FLOAT).addAttribute("aTextureCoord", _this._buffer, 2, false, constants.TYPES.FLOAT).addAttribute("aColor", _this._buffer, 4, true, constants.TYPES.UNSIGNED_BYTE).addAttribute("aTextureId", _this._buffer, 1, true, constants.TYPES.FLOAT).addIndex(_this._indexBuffer);
      return _this;
    }
    return BatchGeometry2;
  }(Geometry);
  var defaultVertex$2 = "precision highp float;\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\nattribute float aTextureId;\n\nuniform mat3 projectionMatrix;\nuniform mat3 translationMatrix;\nuniform vec4 tint;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying float vTextureId;\n\nvoid main(void){\n    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n    vTextureCoord = aTextureCoord;\n    vTextureId = aTextureId;\n    vColor = aColor * tint;\n}\n";
  var defaultFragment$2 = "varying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying float vTextureId;\nuniform sampler2D uSamplers[%count%];\n\nvoid main(void){\n    vec4 color;\n    %forloop%\n    gl_FragColor = color * vColor;\n}\n";
  var BatchPluginFactory = function() {
    function BatchPluginFactory2() {
    }
    BatchPluginFactory2.create = function(options) {
      var _a = Object.assign({
        vertex: defaultVertex$2,
        fragment: defaultFragment$2,
        geometryClass: BatchGeometry,
        vertexSize: 6
      }, options), vertex2 = _a.vertex, fragment2 = _a.fragment, vertexSize = _a.vertexSize, geometryClass = _a.geometryClass;
      return function(_super) {
        __extends(BatchPlugin, _super);
        function BatchPlugin(renderer) {
          var _this = _super.call(this, renderer) || this;
          _this.shaderGenerator = new BatchShaderGenerator(vertex2, fragment2);
          _this.geometryClass = geometryClass;
          _this.vertexSize = vertexSize;
          return _this;
        }
        return BatchPlugin;
      }(AbstractBatchRenderer);
    };
    Object.defineProperty(BatchPluginFactory2, "defaultVertexSrc", {
      get: function() {
        return defaultVertex$2;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(BatchPluginFactory2, "defaultFragmentTemplate", {
      get: function() {
        return defaultFragment$2;
      },
      enumerable: false,
      configurable: true
    });
    return BatchPluginFactory2;
  }();
  var BatchRenderer = BatchPluginFactory.create();
  exports2.AbstractBatchRenderer = AbstractBatchRenderer;
  exports2.AbstractRenderer = AbstractRenderer;
  exports2.Attribute = Attribute;
  exports2.BaseRenderTexture = BaseRenderTexture;
  exports2.BaseTexture = BaseTexture;
  exports2.BatchDrawCall = BatchDrawCall;
  exports2.BatchGeometry = BatchGeometry;
  exports2.BatchPluginFactory = BatchPluginFactory;
  exports2.BatchRenderer = BatchRenderer;
  exports2.BatchShaderGenerator = BatchShaderGenerator;
  exports2.BatchTextureArray = BatchTextureArray;
  exports2.Buffer = Buffer2;
  exports2.Filter = Filter;
  exports2.FilterState = FilterState;
  exports2.Framebuffer = Framebuffer;
  exports2.GLFramebuffer = GLFramebuffer;
  exports2.GLProgram = GLProgram;
  exports2.GLTexture = GLTexture;
  exports2.Geometry = Geometry;
  exports2.IGLUniformData = IGLUniformData;
  exports2.MaskData = MaskData;
  exports2.ObjectRenderer = ObjectRenderer;
  exports2.Program = Program;
  exports2.Quad = Quad;
  exports2.QuadUv = QuadUv;
  exports2.RenderTexture = RenderTexture;
  exports2.RenderTexturePool = RenderTexturePool;
  exports2.Renderer = Renderer;
  exports2.Shader = Shader;
  exports2.SpriteMaskFilter = SpriteMaskFilter;
  exports2.State = State;
  exports2.System = System;
  exports2.Texture = Texture;
  exports2.TextureMatrix = TextureMatrix;
  exports2.TextureUvs = TextureUvs;
  exports2.UniformGroup = UniformGroup;
  exports2.ViewableBuffer = ViewableBuffer;
  exports2.autoDetectRenderer = autoDetectRenderer;
  exports2.checkMaxIfStatementsInShader = checkMaxIfStatementsInShader;
  exports2.defaultFilterVertex = defaultFilter;
  exports2.defaultVertex = _default;
  exports2.resources = index;
  exports2.systems = systems;
  exports2.uniformParsers = uniformParsers;
});

// node_modules/@pixi/app/lib/app.js
var require_app = __commonJS((exports2) => {
  /*!
   * @pixi/app - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/app is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var display = require_display();
  var core = require_core();
  var Application = function() {
    function Application2(options) {
      var _this = this;
      options = Object.assign({
        forceCanvas: false
      }, options);
      this.renderer = core.autoDetectRenderer(options);
      this.stage = new display.Container();
      Application2._plugins.forEach(function(plugin) {
        plugin.init.call(_this, options);
      });
    }
    Application2.registerPlugin = function(plugin) {
      Application2._plugins.push(plugin);
    };
    Application2.prototype.render = function() {
      this.renderer.render(this.stage);
    };
    Object.defineProperty(Application2.prototype, "view", {
      get: function() {
        return this.renderer.view;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Application2.prototype, "screen", {
      get: function() {
        return this.renderer.screen;
      },
      enumerable: false,
      configurable: true
    });
    Application2.prototype.destroy = function(removeView, stageOptions) {
      var _this = this;
      var plugins = Application2._plugins.slice(0);
      plugins.reverse();
      plugins.forEach(function(plugin) {
        plugin.destroy.call(_this);
      });
      this.stage.destroy(stageOptions);
      this.stage = null;
      this.renderer.destroy(removeView);
      this.renderer = null;
    };
    return Application2;
  }();
  Application._plugins = [];
  var ResizePlugin = function() {
    function ResizePlugin2() {
    }
    ResizePlugin2.init = function(options) {
      var _this = this;
      Object.defineProperty(this, "resizeTo", {
        set: function(dom) {
          window.removeEventListener("resize", this.queueResize);
          this._resizeTo = dom;
          if (dom) {
            window.addEventListener("resize", this.queueResize);
            this.resize();
          }
        },
        get: function() {
          return this._resizeTo;
        }
      });
      this.queueResize = function() {
        if (!_this._resizeTo) {
          return;
        }
        _this.cancelResize();
        _this._resizeId = requestAnimationFrame(function() {
          return _this.resize();
        });
      };
      this.cancelResize = function() {
        if (_this._resizeId) {
          cancelAnimationFrame(_this._resizeId);
          _this._resizeId = null;
        }
      };
      this.resize = function() {
        if (!_this._resizeTo) {
          return;
        }
        _this.cancelResize();
        var width;
        var height;
        if (_this._resizeTo === window) {
          width = window.innerWidth;
          height = window.innerHeight;
        } else {
          var _a = _this._resizeTo, clientWidth = _a.clientWidth, clientHeight = _a.clientHeight;
          width = clientWidth;
          height = clientHeight;
        }
        _this.renderer.resize(width, height);
      };
      this._resizeId = null;
      this._resizeTo = null;
      this.resizeTo = options.resizeTo || null;
    };
    ResizePlugin2.destroy = function() {
      this.cancelResize();
      this.cancelResize = null;
      this.queueResize = null;
      this.resizeTo = null;
      this.resize = null;
    };
    return ResizePlugin2;
  }();
  Application.registerPlugin(ResizePlugin);
  exports2.Application = Application;
});

// node_modules/@pixi/extract/lib/extract.js
var require_extract = __commonJS((exports2) => {
  /*!
   * @pixi/extract - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/extract is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var utils = require_utils();
  var math = require_math();
  var core = require_core();
  var TEMP_RECT = new math.Rectangle();
  var BYTES_PER_PIXEL = 4;
  var Extract = function() {
    function Extract2(renderer) {
      this.renderer = renderer;
      renderer.extract = this;
    }
    Extract2.prototype.image = function(target, format, quality) {
      var image = new Image();
      image.src = this.base64(target, format, quality);
      return image;
    };
    Extract2.prototype.base64 = function(target, format, quality) {
      return this.canvas(target).toDataURL(format, quality);
    };
    Extract2.prototype.canvas = function(target) {
      var renderer = this.renderer;
      var resolution;
      var frame;
      var flipY = false;
      var renderTexture;
      var generated = false;
      if (target) {
        if (target instanceof core.RenderTexture) {
          renderTexture = target;
        } else {
          renderTexture = this.renderer.generateTexture(target);
          generated = true;
        }
      }
      if (renderTexture) {
        resolution = renderTexture.baseTexture.resolution;
        frame = renderTexture.frame;
        flipY = false;
        renderer.renderTexture.bind(renderTexture);
      } else {
        resolution = this.renderer.resolution;
        flipY = true;
        frame = TEMP_RECT;
        frame.width = this.renderer.width;
        frame.height = this.renderer.height;
        renderer.renderTexture.bind(null);
      }
      var width = Math.floor(frame.width * resolution + 1e-4);
      var height = Math.floor(frame.height * resolution + 1e-4);
      var canvasBuffer = new utils.CanvasRenderTarget(width, height, 1);
      var webglPixels = new Uint8Array(BYTES_PER_PIXEL * width * height);
      var gl = renderer.gl;
      gl.readPixels(frame.x * resolution, frame.y * resolution, width, height, gl.RGBA, gl.UNSIGNED_BYTE, webglPixels);
      var canvasData = canvasBuffer.context.getImageData(0, 0, width, height);
      Extract2.arrayPostDivide(webglPixels, canvasData.data);
      canvasBuffer.context.putImageData(canvasData, 0, 0);
      if (flipY) {
        var target_1 = new utils.CanvasRenderTarget(canvasBuffer.width, canvasBuffer.height, 1);
        target_1.context.scale(1, -1);
        target_1.context.drawImage(canvasBuffer.canvas, 0, -height);
        canvasBuffer.destroy();
        canvasBuffer = target_1;
      }
      if (generated) {
        renderTexture.destroy(true);
      }
      return canvasBuffer.canvas;
    };
    Extract2.prototype.pixels = function(target) {
      var renderer = this.renderer;
      var resolution;
      var frame;
      var renderTexture;
      var generated = false;
      if (target) {
        if (target instanceof core.RenderTexture) {
          renderTexture = target;
        } else {
          renderTexture = this.renderer.generateTexture(target);
          generated = true;
        }
      }
      if (renderTexture) {
        resolution = renderTexture.baseTexture.resolution;
        frame = renderTexture.frame;
        renderer.renderTexture.bind(renderTexture);
      } else {
        resolution = renderer.resolution;
        frame = TEMP_RECT;
        frame.width = renderer.width;
        frame.height = renderer.height;
        renderer.renderTexture.bind(null);
      }
      var width = frame.width * resolution;
      var height = frame.height * resolution;
      var webglPixels = new Uint8Array(BYTES_PER_PIXEL * width * height);
      var gl = renderer.gl;
      gl.readPixels(frame.x * resolution, frame.y * resolution, width, height, gl.RGBA, gl.UNSIGNED_BYTE, webglPixels);
      if (generated) {
        renderTexture.destroy(true);
      }
      Extract2.arrayPostDivide(webglPixels, webglPixels);
      return webglPixels;
    };
    Extract2.prototype.destroy = function() {
      this.renderer.extract = null;
      this.renderer = null;
    };
    Extract2.arrayPostDivide = function(pixels, out) {
      for (var i = 0; i < pixels.length; i += 4) {
        var alpha = out[i + 3] = pixels[i + 3];
        if (alpha !== 0) {
          out[i] = Math.round(Math.min(pixels[i] * 255 / alpha, 255));
          out[i + 1] = Math.round(Math.min(pixels[i + 1] * 255 / alpha, 255));
          out[i + 2] = Math.round(Math.min(pixels[i + 2] * 255 / alpha, 255));
        } else {
          out[i] = pixels[i];
          out[i + 1] = pixels[i + 1];
          out[i + 2] = pixels[i + 2];
        }
      }
    };
    return Extract2;
  }();
  exports2.Extract = Extract;
});

// node_modules/parse-uri/index.js
var require_parse_uri = __commonJS((exports2, module2) => {
  "use strict";
  function parseURI(str, opts) {
    if (!str)
      return void 0;
    opts = opts || {};
    var o = {
      key: [
        "source",
        "protocol",
        "authority",
        "userInfo",
        "user",
        "password",
        "host",
        "port",
        "relative",
        "path",
        "directory",
        "file",
        "query",
        "anchor"
      ],
      q: {
        name: "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
      },
      parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
      }
    };
    var m = o.parser[opts.strictMode ? "strict" : "loose"].exec(str);
    var uri = {};
    var i = 14;
    while (i--)
      uri[o.key[i]] = m[i] || "";
    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function($0, $1, $2) {
      if ($1)
        uri[o.q.name][$1] = $2;
    });
    return uri;
  }
  module2.exports = parseURI;
});

// node_modules/mini-signals/lib/mini-signals.js
var require_mini_signals = __commonJS((exports2, module2) => {
  "use strict";
  Object.defineProperty(exports2, "__esModule", {
    value: true
  });
  var _createClass = function() {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor)
          descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }
    return function(Constructor, protoProps, staticProps) {
      if (protoProps)
        defineProperties(Constructor.prototype, protoProps);
      if (staticProps)
        defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  var MiniSignalBinding = function() {
    function MiniSignalBinding2(fn, once, thisArg) {
      if (once === void 0)
        once = false;
      _classCallCheck(this, MiniSignalBinding2);
      this._fn = fn;
      this._once = once;
      this._thisArg = thisArg;
      this._next = this._prev = this._owner = null;
    }
    _createClass(MiniSignalBinding2, [{
      key: "detach",
      value: function detach() {
        if (this._owner === null)
          return false;
        this._owner.detach(this);
        return true;
      }
    }]);
    return MiniSignalBinding2;
  }();
  function _addMiniSignalBinding(self2, node) {
    if (!self2._head) {
      self2._head = node;
      self2._tail = node;
    } else {
      self2._tail._next = node;
      node._prev = self2._tail;
      self2._tail = node;
    }
    node._owner = self2;
    return node;
  }
  var MiniSignal = function() {
    function MiniSignal2() {
      _classCallCheck(this, MiniSignal2);
      this._head = this._tail = void 0;
    }
    _createClass(MiniSignal2, [{
      key: "handlers",
      value: function handlers() {
        var exists = arguments.length <= 0 || arguments[0] === void 0 ? false : arguments[0];
        var node = this._head;
        if (exists)
          return !!node;
        var ee = [];
        while (node) {
          ee.push(node);
          node = node._next;
        }
        return ee;
      }
    }, {
      key: "has",
      value: function has(node) {
        if (!(node instanceof MiniSignalBinding)) {
          throw new Error("MiniSignal#has(): First arg must be a MiniSignalBinding object.");
        }
        return node._owner === this;
      }
    }, {
      key: "dispatch",
      value: function dispatch() {
        var node = this._head;
        if (!node)
          return false;
        while (node) {
          if (node._once)
            this.detach(node);
          node._fn.apply(node._thisArg, arguments);
          node = node._next;
        }
        return true;
      }
    }, {
      key: "add",
      value: function add(fn) {
        var thisArg = arguments.length <= 1 || arguments[1] === void 0 ? null : arguments[1];
        if (typeof fn !== "function") {
          throw new Error("MiniSignal#add(): First arg must be a Function.");
        }
        return _addMiniSignalBinding(this, new MiniSignalBinding(fn, false, thisArg));
      }
    }, {
      key: "once",
      value: function once(fn) {
        var thisArg = arguments.length <= 1 || arguments[1] === void 0 ? null : arguments[1];
        if (typeof fn !== "function") {
          throw new Error("MiniSignal#once(): First arg must be a Function.");
        }
        return _addMiniSignalBinding(this, new MiniSignalBinding(fn, true, thisArg));
      }
    }, {
      key: "detach",
      value: function detach(node) {
        if (!(node instanceof MiniSignalBinding)) {
          throw new Error("MiniSignal#detach(): First arg must be a MiniSignalBinding object.");
        }
        if (node._owner !== this)
          return this;
        if (node._prev)
          node._prev._next = node._next;
        if (node._next)
          node._next._prev = node._prev;
        if (node === this._head) {
          this._head = node._next;
          if (node._next === null) {
            this._tail = null;
          }
        } else if (node === this._tail) {
          this._tail = node._prev;
          this._tail._next = null;
        }
        node._owner = null;
        return this;
      }
    }, {
      key: "detachAll",
      value: function detachAll() {
        var node = this._head;
        if (!node)
          return this;
        this._head = this._tail = null;
        while (node) {
          node._owner = null;
          node = node._next;
        }
        return this;
      }
    }]);
    return MiniSignal2;
  }();
  MiniSignal.MiniSignalBinding = MiniSignalBinding;
  exports2["default"] = MiniSignal;
  module2.exports = exports2["default"];
});

// node_modules/resource-loader/dist/resource-loader.cjs.js
var require_resource_loader_cjs = __commonJS((exports2) => {
  /*!
   * resource-loader - v3.0.1
   * https://github.com/pixijs/pixi-sound
   * Compiled Tue, 02 Jul 2019 14:06:18 UTC
   *
   * resource-loader is licensed under the MIT license.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  function _interopDefault(ex) {
    return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
  }
  var parseUri = _interopDefault(require_parse_uri());
  var Signal = _interopDefault(require_mini_signals());
  function _noop() {
  }
  function eachSeries(array, iterator, callback, deferNext) {
    var i = 0;
    var len = array.length;
    (function next(err) {
      if (err || i === len) {
        if (callback) {
          callback(err);
        }
        return;
      }
      if (deferNext) {
        setTimeout(function() {
          iterator(array[i++], next);
        }, 1);
      } else {
        iterator(array[i++], next);
      }
    })();
  }
  function onlyOnce(fn) {
    return function onceWrapper() {
      if (fn === null) {
        throw new Error("Callback was already called.");
      }
      var callFn = fn;
      fn = null;
      callFn.apply(this, arguments);
    };
  }
  function queue(worker, concurrency) {
    if (concurrency == null) {
      concurrency = 1;
    } else if (concurrency === 0) {
      throw new Error("Concurrency must not be zero");
    }
    var workers = 0;
    var q = {
      _tasks: [],
      concurrency,
      saturated: _noop,
      unsaturated: _noop,
      buffer: concurrency / 4,
      empty: _noop,
      drain: _noop,
      error: _noop,
      started: false,
      paused: false,
      push: function push(data, callback) {
        _insert(data, false, callback);
      },
      kill: function kill() {
        workers = 0;
        q.drain = _noop;
        q.started = false;
        q._tasks = [];
      },
      unshift: function unshift(data, callback) {
        _insert(data, true, callback);
      },
      process: function process() {
        while (!q.paused && workers < q.concurrency && q._tasks.length) {
          var task = q._tasks.shift();
          if (q._tasks.length === 0) {
            q.empty();
          }
          workers += 1;
          if (workers === q.concurrency) {
            q.saturated();
          }
          worker(task.data, onlyOnce(_next(task)));
        }
      },
      length: function length() {
        return q._tasks.length;
      },
      running: function running() {
        return workers;
      },
      idle: function idle() {
        return q._tasks.length + workers === 0;
      },
      pause: function pause() {
        if (q.paused === true) {
          return;
        }
        q.paused = true;
      },
      resume: function resume() {
        if (q.paused === false) {
          return;
        }
        q.paused = false;
        for (var w = 1; w <= q.concurrency; w++) {
          q.process();
        }
      }
    };
    function _insert(data, insertAtFront, callback) {
      if (callback != null && typeof callback !== "function") {
        throw new Error("task callback must be a function");
      }
      q.started = true;
      if (data == null && q.idle()) {
        setTimeout(function() {
          return q.drain();
        }, 1);
        return;
      }
      var item = {
        data,
        callback: typeof callback === "function" ? callback : _noop
      };
      if (insertAtFront) {
        q._tasks.unshift(item);
      } else {
        q._tasks.push(item);
      }
      setTimeout(function() {
        return q.process();
      }, 1);
    }
    function _next(task) {
      return function next() {
        workers -= 1;
        task.callback.apply(task, arguments);
        if (arguments[0] != null) {
          q.error(arguments[0], task.data);
        }
        if (workers <= q.concurrency - q.buffer) {
          q.unsaturated();
        }
        if (q.idle()) {
          q.drain();
        }
        q.process();
      };
    }
    return q;
  }
  var async = {
    eachSeries,
    queue
  };
  var cache = {};
  function caching(resource, next) {
    var _this = this;
    if (cache[resource.url]) {
      resource.data = cache[resource.url];
      resource.complete();
    } else {
      resource.onComplete.once(function() {
        return cache[_this.url] = _this.data;
      });
    }
    next();
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor)
        descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps)
      _defineProperties(Constructor.prototype, protoProps);
    if (staticProps)
      _defineProperties(Constructor, staticProps);
    return Constructor;
  }
  var useXdr = !!(window.XDomainRequest && !("withCredentials" in new XMLHttpRequest()));
  var tempAnchor = null;
  var STATUS_NONE = 0;
  var STATUS_OK = 200;
  var STATUS_EMPTY = 204;
  var STATUS_IE_BUG_EMPTY = 1223;
  var STATUS_TYPE_OK = 2;
  function _noop$1() {
  }
  var Resource = /* @__PURE__ */ function() {
    Resource2.setExtensionLoadType = function setExtensionLoadType(extname, loadType) {
      setExtMap(Resource2._loadTypeMap, extname, loadType);
    };
    Resource2.setExtensionXhrType = function setExtensionXhrType(extname, xhrType) {
      setExtMap(Resource2._xhrTypeMap, extname, xhrType);
    };
    function Resource2(name, url, options) {
      if (typeof name !== "string" || typeof url !== "string") {
        throw new Error("Both name and url are required for constructing a resource.");
      }
      options = options || {};
      this._flags = 0;
      this._setFlag(Resource2.STATUS_FLAGS.DATA_URL, url.indexOf("data:") === 0);
      this.name = name;
      this.url = url;
      this.extension = this._getExtension();
      this.data = null;
      this.crossOrigin = options.crossOrigin === true ? "anonymous" : options.crossOrigin;
      this.timeout = options.timeout || 0;
      this.loadType = options.loadType || this._determineLoadType();
      this.xhrType = options.xhrType;
      this.metadata = options.metadata || {};
      this.error = null;
      this.xhr = null;
      this.children = [];
      this.type = Resource2.TYPE.UNKNOWN;
      this.progressChunk = 0;
      this._dequeue = _noop$1;
      this._onLoadBinding = null;
      this._elementTimer = 0;
      this._boundComplete = this.complete.bind(this);
      this._boundOnError = this._onError.bind(this);
      this._boundOnProgress = this._onProgress.bind(this);
      this._boundOnTimeout = this._onTimeout.bind(this);
      this._boundXhrOnError = this._xhrOnError.bind(this);
      this._boundXhrOnTimeout = this._xhrOnTimeout.bind(this);
      this._boundXhrOnAbort = this._xhrOnAbort.bind(this);
      this._boundXhrOnLoad = this._xhrOnLoad.bind(this);
      this.onStart = new Signal();
      this.onProgress = new Signal();
      this.onComplete = new Signal();
      this.onAfterMiddleware = new Signal();
    }
    var _proto = Resource2.prototype;
    _proto.complete = function complete() {
      this._clearEvents();
      this._finish();
    };
    _proto.abort = function abort(message) {
      if (this.error) {
        return;
      }
      this.error = new Error(message);
      this._clearEvents();
      if (this.xhr) {
        this.xhr.abort();
      } else if (this.xdr) {
        this.xdr.abort();
      } else if (this.data) {
        if (this.data.src) {
          this.data.src = Resource2.EMPTY_GIF;
        } else {
          while (this.data.firstChild) {
            this.data.removeChild(this.data.firstChild);
          }
        }
      }
      this._finish();
    };
    _proto.load = function load(cb) {
      var _this = this;
      if (this.isLoading) {
        return;
      }
      if (this.isComplete) {
        if (cb) {
          setTimeout(function() {
            return cb(_this);
          }, 1);
        }
        return;
      } else if (cb) {
        this.onComplete.once(cb);
      }
      this._setFlag(Resource2.STATUS_FLAGS.LOADING, true);
      this.onStart.dispatch(this);
      if (this.crossOrigin === false || typeof this.crossOrigin !== "string") {
        this.crossOrigin = this._determineCrossOrigin(this.url);
      }
      switch (this.loadType) {
        case Resource2.LOAD_TYPE.IMAGE:
          this.type = Resource2.TYPE.IMAGE;
          this._loadElement("image");
          break;
        case Resource2.LOAD_TYPE.AUDIO:
          this.type = Resource2.TYPE.AUDIO;
          this._loadSourceElement("audio");
          break;
        case Resource2.LOAD_TYPE.VIDEO:
          this.type = Resource2.TYPE.VIDEO;
          this._loadSourceElement("video");
          break;
        case Resource2.LOAD_TYPE.XHR:
        default:
          if (useXdr && this.crossOrigin) {
            this._loadXdr();
          } else {
            this._loadXhr();
          }
          break;
      }
    };
    _proto._hasFlag = function _hasFlag(flag) {
      return (this._flags & flag) !== 0;
    };
    _proto._setFlag = function _setFlag(flag, value) {
      this._flags = value ? this._flags | flag : this._flags & ~flag;
    };
    _proto._clearEvents = function _clearEvents() {
      clearTimeout(this._elementTimer);
      if (this.data && this.data.removeEventListener) {
        this.data.removeEventListener("error", this._boundOnError, false);
        this.data.removeEventListener("load", this._boundComplete, false);
        this.data.removeEventListener("progress", this._boundOnProgress, false);
        this.data.removeEventListener("canplaythrough", this._boundComplete, false);
      }
      if (this.xhr) {
        if (this.xhr.removeEventListener) {
          this.xhr.removeEventListener("error", this._boundXhrOnError, false);
          this.xhr.removeEventListener("timeout", this._boundXhrOnTimeout, false);
          this.xhr.removeEventListener("abort", this._boundXhrOnAbort, false);
          this.xhr.removeEventListener("progress", this._boundOnProgress, false);
          this.xhr.removeEventListener("load", this._boundXhrOnLoad, false);
        } else {
          this.xhr.onerror = null;
          this.xhr.ontimeout = null;
          this.xhr.onprogress = null;
          this.xhr.onload = null;
        }
      }
    };
    _proto._finish = function _finish() {
      if (this.isComplete) {
        throw new Error("Complete called again for an already completed resource.");
      }
      this._setFlag(Resource2.STATUS_FLAGS.COMPLETE, true);
      this._setFlag(Resource2.STATUS_FLAGS.LOADING, false);
      this.onComplete.dispatch(this);
    };
    _proto._loadElement = function _loadElement(type) {
      if (this.metadata.loadElement) {
        this.data = this.metadata.loadElement;
      } else if (type === "image" && typeof window.Image !== "undefined") {
        this.data = new Image();
      } else {
        this.data = document.createElement(type);
      }
      if (this.crossOrigin) {
        this.data.crossOrigin = this.crossOrigin;
      }
      if (!this.metadata.skipSource) {
        this.data.src = this.url;
      }
      this.data.addEventListener("error", this._boundOnError, false);
      this.data.addEventListener("load", this._boundComplete, false);
      this.data.addEventListener("progress", this._boundOnProgress, false);
      if (this.timeout) {
        this._elementTimer = setTimeout(this._boundOnTimeout, this.timeout);
      }
    };
    _proto._loadSourceElement = function _loadSourceElement(type) {
      if (this.metadata.loadElement) {
        this.data = this.metadata.loadElement;
      } else if (type === "audio" && typeof window.Audio !== "undefined") {
        this.data = new Audio();
      } else {
        this.data = document.createElement(type);
      }
      if (this.data === null) {
        this.abort("Unsupported element: " + type);
        return;
      }
      if (this.crossOrigin) {
        this.data.crossOrigin = this.crossOrigin;
      }
      if (!this.metadata.skipSource) {
        if (navigator.isCocoonJS) {
          this.data.src = Array.isArray(this.url) ? this.url[0] : this.url;
        } else if (Array.isArray(this.url)) {
          var mimeTypes = this.metadata.mimeType;
          for (var i = 0; i < this.url.length; ++i) {
            this.data.appendChild(this._createSource(type, this.url[i], Array.isArray(mimeTypes) ? mimeTypes[i] : mimeTypes));
          }
        } else {
          var _mimeTypes = this.metadata.mimeType;
          this.data.appendChild(this._createSource(type, this.url, Array.isArray(_mimeTypes) ? _mimeTypes[0] : _mimeTypes));
        }
      }
      this.data.addEventListener("error", this._boundOnError, false);
      this.data.addEventListener("load", this._boundComplete, false);
      this.data.addEventListener("progress", this._boundOnProgress, false);
      this.data.addEventListener("canplaythrough", this._boundComplete, false);
      this.data.load();
      if (this.timeout) {
        this._elementTimer = setTimeout(this._boundOnTimeout, this.timeout);
      }
    };
    _proto._loadXhr = function _loadXhr() {
      if (typeof this.xhrType !== "string") {
        this.xhrType = this._determineXhrType();
      }
      var xhr = this.xhr = new XMLHttpRequest();
      xhr.open("GET", this.url, true);
      xhr.timeout = this.timeout;
      if (this.xhrType === Resource2.XHR_RESPONSE_TYPE.JSON || this.xhrType === Resource2.XHR_RESPONSE_TYPE.DOCUMENT) {
        xhr.responseType = Resource2.XHR_RESPONSE_TYPE.TEXT;
      } else {
        xhr.responseType = this.xhrType;
      }
      xhr.addEventListener("error", this._boundXhrOnError, false);
      xhr.addEventListener("timeout", this._boundXhrOnTimeout, false);
      xhr.addEventListener("abort", this._boundXhrOnAbort, false);
      xhr.addEventListener("progress", this._boundOnProgress, false);
      xhr.addEventListener("load", this._boundXhrOnLoad, false);
      xhr.send();
    };
    _proto._loadXdr = function _loadXdr() {
      if (typeof this.xhrType !== "string") {
        this.xhrType = this._determineXhrType();
      }
      var xdr = this.xhr = new XDomainRequest();
      xdr.timeout = this.timeout || 5e3;
      xdr.onerror = this._boundXhrOnError;
      xdr.ontimeout = this._boundXhrOnTimeout;
      xdr.onprogress = this._boundOnProgress;
      xdr.onload = this._boundXhrOnLoad;
      xdr.open("GET", this.url, true);
      setTimeout(function() {
        return xdr.send();
      }, 1);
    };
    _proto._createSource = function _createSource(type, url, mime) {
      if (!mime) {
        mime = type + "/" + this._getExtension(url);
      }
      var source = document.createElement("source");
      source.src = url;
      source.type = mime;
      return source;
    };
    _proto._onError = function _onError(event) {
      this.abort("Failed to load element using: " + event.target.nodeName);
    };
    _proto._onProgress = function _onProgress(event) {
      if (event && event.lengthComputable) {
        this.onProgress.dispatch(this, event.loaded / event.total);
      }
    };
    _proto._onTimeout = function _onTimeout() {
      this.abort("Load timed out.");
    };
    _proto._xhrOnError = function _xhrOnError() {
      var xhr = this.xhr;
      this.abort(reqType(xhr) + " Request failed. Status: " + xhr.status + ', text: "' + xhr.statusText + '"');
    };
    _proto._xhrOnTimeout = function _xhrOnTimeout() {
      var xhr = this.xhr;
      this.abort(reqType(xhr) + " Request timed out.");
    };
    _proto._xhrOnAbort = function _xhrOnAbort() {
      var xhr = this.xhr;
      this.abort(reqType(xhr) + " Request was aborted by the user.");
    };
    _proto._xhrOnLoad = function _xhrOnLoad() {
      var xhr = this.xhr;
      var text = "";
      var status = typeof xhr.status === "undefined" ? STATUS_OK : xhr.status;
      if (xhr.responseType === "" || xhr.responseType === "text" || typeof xhr.responseType === "undefined") {
        text = xhr.responseText;
      }
      if (status === STATUS_NONE && (text.length > 0 || xhr.responseType === Resource2.XHR_RESPONSE_TYPE.BUFFER)) {
        status = STATUS_OK;
      } else if (status === STATUS_IE_BUG_EMPTY) {
        status = STATUS_EMPTY;
      }
      var statusType = status / 100 | 0;
      if (statusType === STATUS_TYPE_OK) {
        if (this.xhrType === Resource2.XHR_RESPONSE_TYPE.TEXT) {
          this.data = text;
          this.type = Resource2.TYPE.TEXT;
        } else if (this.xhrType === Resource2.XHR_RESPONSE_TYPE.JSON) {
          try {
            this.data = JSON.parse(text);
            this.type = Resource2.TYPE.JSON;
          } catch (e) {
            this.abort("Error trying to parse loaded json: " + e);
            return;
          }
        } else if (this.xhrType === Resource2.XHR_RESPONSE_TYPE.DOCUMENT) {
          try {
            if (window.DOMParser) {
              var domparser = new DOMParser();
              this.data = domparser.parseFromString(text, "text/xml");
            } else {
              var div = document.createElement("div");
              div.innerHTML = text;
              this.data = div;
            }
            this.type = Resource2.TYPE.XML;
          } catch (e) {
            this.abort("Error trying to parse loaded xml: " + e);
            return;
          }
        } else {
          this.data = xhr.response || text;
        }
      } else {
        this.abort("[" + xhr.status + "] " + xhr.statusText + ": " + xhr.responseURL);
        return;
      }
      this.complete();
    };
    _proto._determineCrossOrigin = function _determineCrossOrigin(url, loc) {
      if (url.indexOf("data:") === 0) {
        return "";
      }
      if (window.origin !== window.location.origin) {
        return "anonymous";
      }
      loc = loc || window.location;
      if (!tempAnchor) {
        tempAnchor = document.createElement("a");
      }
      tempAnchor.href = url;
      url = parseUri(tempAnchor.href, {
        strictMode: true
      });
      var samePort = !url.port && loc.port === "" || url.port === loc.port;
      var protocol = url.protocol ? url.protocol + ":" : "";
      if (url.host !== loc.hostname || !samePort || protocol !== loc.protocol) {
        return "anonymous";
      }
      return "";
    };
    _proto._determineXhrType = function _determineXhrType() {
      return Resource2._xhrTypeMap[this.extension] || Resource2.XHR_RESPONSE_TYPE.TEXT;
    };
    _proto._determineLoadType = function _determineLoadType() {
      return Resource2._loadTypeMap[this.extension] || Resource2.LOAD_TYPE.XHR;
    };
    _proto._getExtension = function _getExtension() {
      var url = this.url;
      var ext = "";
      if (this.isDataUrl) {
        var slashIndex = url.indexOf("/");
        ext = url.substring(slashIndex + 1, url.indexOf(";", slashIndex));
      } else {
        var queryStart = url.indexOf("?");
        var hashStart = url.indexOf("#");
        var index2 = Math.min(queryStart > -1 ? queryStart : url.length, hashStart > -1 ? hashStart : url.length);
        url = url.substring(0, index2);
        ext = url.substring(url.lastIndexOf(".") + 1);
      }
      return ext.toLowerCase();
    };
    _proto._getMimeFromXhrType = function _getMimeFromXhrType(type) {
      switch (type) {
        case Resource2.XHR_RESPONSE_TYPE.BUFFER:
          return "application/octet-binary";
        case Resource2.XHR_RESPONSE_TYPE.BLOB:
          return "application/blob";
        case Resource2.XHR_RESPONSE_TYPE.DOCUMENT:
          return "application/xml";
        case Resource2.XHR_RESPONSE_TYPE.JSON:
          return "application/json";
        case Resource2.XHR_RESPONSE_TYPE.DEFAULT:
        case Resource2.XHR_RESPONSE_TYPE.TEXT:
        default:
          return "text/plain";
      }
    };
    _createClass(Resource2, [{
      key: "isDataUrl",
      get: function get() {
        return this._hasFlag(Resource2.STATUS_FLAGS.DATA_URL);
      }
    }, {
      key: "isComplete",
      get: function get() {
        return this._hasFlag(Resource2.STATUS_FLAGS.COMPLETE);
      }
    }, {
      key: "isLoading",
      get: function get() {
        return this._hasFlag(Resource2.STATUS_FLAGS.LOADING);
      }
    }]);
    return Resource2;
  }();
  Resource.STATUS_FLAGS = {
    NONE: 0,
    DATA_URL: 1 << 0,
    COMPLETE: 1 << 1,
    LOADING: 1 << 2
  };
  Resource.TYPE = {
    UNKNOWN: 0,
    JSON: 1,
    XML: 2,
    IMAGE: 3,
    AUDIO: 4,
    VIDEO: 5,
    TEXT: 6
  };
  Resource.LOAD_TYPE = {
    XHR: 1,
    IMAGE: 2,
    AUDIO: 3,
    VIDEO: 4
  };
  Resource.XHR_RESPONSE_TYPE = {
    DEFAULT: "text",
    BUFFER: "arraybuffer",
    BLOB: "blob",
    DOCUMENT: "document",
    JSON: "json",
    TEXT: "text"
  };
  Resource._loadTypeMap = {
    gif: Resource.LOAD_TYPE.IMAGE,
    png: Resource.LOAD_TYPE.IMAGE,
    bmp: Resource.LOAD_TYPE.IMAGE,
    jpg: Resource.LOAD_TYPE.IMAGE,
    jpeg: Resource.LOAD_TYPE.IMAGE,
    tif: Resource.LOAD_TYPE.IMAGE,
    tiff: Resource.LOAD_TYPE.IMAGE,
    webp: Resource.LOAD_TYPE.IMAGE,
    tga: Resource.LOAD_TYPE.IMAGE,
    svg: Resource.LOAD_TYPE.IMAGE,
    "svg+xml": Resource.LOAD_TYPE.IMAGE,
    mp3: Resource.LOAD_TYPE.AUDIO,
    ogg: Resource.LOAD_TYPE.AUDIO,
    wav: Resource.LOAD_TYPE.AUDIO,
    mp4: Resource.LOAD_TYPE.VIDEO,
    webm: Resource.LOAD_TYPE.VIDEO
  };
  Resource._xhrTypeMap = {
    xhtml: Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    html: Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    htm: Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    xml: Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    tmx: Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    svg: Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    tsx: Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    gif: Resource.XHR_RESPONSE_TYPE.BLOB,
    png: Resource.XHR_RESPONSE_TYPE.BLOB,
    bmp: Resource.XHR_RESPONSE_TYPE.BLOB,
    jpg: Resource.XHR_RESPONSE_TYPE.BLOB,
    jpeg: Resource.XHR_RESPONSE_TYPE.BLOB,
    tif: Resource.XHR_RESPONSE_TYPE.BLOB,
    tiff: Resource.XHR_RESPONSE_TYPE.BLOB,
    webp: Resource.XHR_RESPONSE_TYPE.BLOB,
    tga: Resource.XHR_RESPONSE_TYPE.BLOB,
    json: Resource.XHR_RESPONSE_TYPE.JSON,
    text: Resource.XHR_RESPONSE_TYPE.TEXT,
    txt: Resource.XHR_RESPONSE_TYPE.TEXT,
    ttf: Resource.XHR_RESPONSE_TYPE.BUFFER,
    otf: Resource.XHR_RESPONSE_TYPE.BUFFER
  };
  Resource.EMPTY_GIF = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
  function setExtMap(map, extname, val) {
    if (extname && extname.indexOf(".") === 0) {
      extname = extname.substring(1);
    }
    if (!extname) {
      return;
    }
    map[extname] = val;
  }
  function reqType(xhr) {
    return xhr.toString().replace("object ", "");
  }
  var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  function encodeBinary(input) {
    var output = "";
    var inx = 0;
    while (inx < input.length) {
      var bytebuffer = [0, 0, 0];
      var encodedCharIndexes = [0, 0, 0, 0];
      for (var jnx = 0; jnx < bytebuffer.length; ++jnx) {
        if (inx < input.length) {
          bytebuffer[jnx] = input.charCodeAt(inx++) & 255;
        } else {
          bytebuffer[jnx] = 0;
        }
      }
      encodedCharIndexes[0] = bytebuffer[0] >> 2;
      encodedCharIndexes[1] = (bytebuffer[0] & 3) << 4 | bytebuffer[1] >> 4;
      encodedCharIndexes[2] = (bytebuffer[1] & 15) << 2 | bytebuffer[2] >> 6;
      encodedCharIndexes[3] = bytebuffer[2] & 63;
      var paddingBytes = inx - (input.length - 1);
      switch (paddingBytes) {
        case 2:
          encodedCharIndexes[3] = 64;
          encodedCharIndexes[2] = 64;
          break;
        case 1:
          encodedCharIndexes[3] = 64;
          break;
        default:
          break;
      }
      for (var _jnx = 0; _jnx < encodedCharIndexes.length; ++_jnx) {
        output += _keyStr.charAt(encodedCharIndexes[_jnx]);
      }
    }
    return output;
  }
  var Url = window.URL || window.webkitURL;
  function parsing(resource, next) {
    if (!resource.data) {
      next();
      return;
    }
    if (resource.xhr && resource.xhrType === Resource.XHR_RESPONSE_TYPE.BLOB) {
      if (!window.Blob || typeof resource.data === "string") {
        var type = resource.xhr.getResponseHeader("content-type");
        if (type && type.indexOf("image") === 0) {
          resource.data = new Image();
          resource.data.src = "data:" + type + ";base64," + encodeBinary(resource.xhr.responseText);
          resource.type = Resource.TYPE.IMAGE;
          resource.data.onload = function() {
            resource.data.onload = null;
            next();
          };
          return;
        }
      } else if (resource.data.type.indexOf("image") === 0) {
        var src = Url.createObjectURL(resource.data);
        resource.blob = resource.data;
        resource.data = new Image();
        resource.data.src = src;
        resource.type = Resource.TYPE.IMAGE;
        resource.data.onload = function() {
          Url.revokeObjectURL(src);
          resource.data.onload = null;
          next();
        };
        return;
      }
    }
    next();
  }
  var index = {
    caching,
    parsing
  };
  var MAX_PROGRESS = 100;
  var rgxExtractUrlHash = /(#[\w-]+)?$/;
  var Loader = /* @__PURE__ */ function() {
    function Loader2(baseUrl, concurrency) {
      var _this = this;
      if (baseUrl === void 0) {
        baseUrl = "";
      }
      if (concurrency === void 0) {
        concurrency = 10;
      }
      this.baseUrl = baseUrl;
      this.progress = 0;
      this.loading = false;
      this.defaultQueryString = "";
      this._beforeMiddleware = [];
      this._afterMiddleware = [];
      this._resourcesParsing = [];
      this._boundLoadResource = function(r, d) {
        return _this._loadResource(r, d);
      };
      this._queue = queue(this._boundLoadResource, concurrency);
      this._queue.pause();
      this.resources = {};
      this.onProgress = new Signal();
      this.onError = new Signal();
      this.onLoad = new Signal();
      this.onStart = new Signal();
      this.onComplete = new Signal();
      for (var i = 0; i < Loader2._defaultBeforeMiddleware.length; ++i) {
        this.pre(Loader2._defaultBeforeMiddleware[i]);
      }
      for (var _i = 0; _i < Loader2._defaultAfterMiddleware.length; ++_i) {
        this.use(Loader2._defaultAfterMiddleware[_i]);
      }
    }
    var _proto = Loader2.prototype;
    _proto.add = function add(name, url, options, cb) {
      if (Array.isArray(name)) {
        for (var i = 0; i < name.length; ++i) {
          this.add(name[i]);
        }
        return this;
      }
      if (typeof name === "object") {
        cb = url || name.callback || name.onComplete;
        options = name;
        url = name.url;
        name = name.name || name.key || name.url;
      }
      if (typeof url !== "string") {
        cb = options;
        options = url;
        url = name;
      }
      if (typeof url !== "string") {
        throw new Error("No url passed to add resource to loader.");
      }
      if (typeof options === "function") {
        cb = options;
        options = null;
      }
      if (this.loading && (!options || !options.parentResource)) {
        throw new Error("Cannot add resources while the loader is running.");
      }
      if (this.resources[name]) {
        throw new Error('Resource named "' + name + '" already exists.');
      }
      url = this._prepareUrl(url);
      this.resources[name] = new Resource(name, url, options);
      if (typeof cb === "function") {
        this.resources[name].onAfterMiddleware.once(cb);
      }
      if (this.loading) {
        var parent = options.parentResource;
        var incompleteChildren = [];
        for (var _i2 = 0; _i2 < parent.children.length; ++_i2) {
          if (!parent.children[_i2].isComplete) {
            incompleteChildren.push(parent.children[_i2]);
          }
        }
        var fullChunk = parent.progressChunk * (incompleteChildren.length + 1);
        var eachChunk = fullChunk / (incompleteChildren.length + 2);
        parent.children.push(this.resources[name]);
        parent.progressChunk = eachChunk;
        for (var _i3 = 0; _i3 < incompleteChildren.length; ++_i3) {
          incompleteChildren[_i3].progressChunk = eachChunk;
        }
        this.resources[name].progressChunk = eachChunk;
      }
      this._queue.push(this.resources[name]);
      return this;
    };
    _proto.pre = function pre(fn) {
      this._beforeMiddleware.push(fn);
      return this;
    };
    _proto.use = function use(fn) {
      this._afterMiddleware.push(fn);
      return this;
    };
    _proto.reset = function reset() {
      this.progress = 0;
      this.loading = false;
      this._queue.kill();
      this._queue.pause();
      for (var k in this.resources) {
        var res = this.resources[k];
        if (res._onLoadBinding) {
          res._onLoadBinding.detach();
        }
        if (res.isLoading) {
          res.abort();
        }
      }
      this.resources = {};
      return this;
    };
    _proto.load = function load(cb) {
      if (typeof cb === "function") {
        this.onComplete.once(cb);
      }
      if (this.loading) {
        return this;
      }
      if (this._queue.idle()) {
        this._onStart();
        this._onComplete();
      } else {
        var numTasks = this._queue._tasks.length;
        var chunk = MAX_PROGRESS / numTasks;
        for (var i = 0; i < this._queue._tasks.length; ++i) {
          this._queue._tasks[i].data.progressChunk = chunk;
        }
        this._onStart();
        this._queue.resume();
      }
      return this;
    };
    _proto._prepareUrl = function _prepareUrl(url) {
      var parsedUrl = parseUri(url, {
        strictMode: true
      });
      var result;
      if (parsedUrl.protocol || !parsedUrl.path || url.indexOf("//") === 0) {
        result = url;
      } else if (this.baseUrl.length && this.baseUrl.lastIndexOf("/") !== this.baseUrl.length - 1 && url.charAt(0) !== "/") {
        result = this.baseUrl + "/" + url;
      } else {
        result = this.baseUrl + url;
      }
      if (this.defaultQueryString) {
        var hash = rgxExtractUrlHash.exec(result)[0];
        result = result.substr(0, result.length - hash.length);
        if (result.indexOf("?") !== -1) {
          result += "&" + this.defaultQueryString;
        } else {
          result += "?" + this.defaultQueryString;
        }
        result += hash;
      }
      return result;
    };
    _proto._loadResource = function _loadResource(resource, dequeue) {
      var _this2 = this;
      resource._dequeue = dequeue;
      eachSeries(this._beforeMiddleware, function(fn, next) {
        fn.call(_this2, resource, function() {
          next(resource.isComplete ? {} : null);
        });
      }, function() {
        if (resource.isComplete) {
          _this2._onLoad(resource);
        } else {
          resource._onLoadBinding = resource.onComplete.once(_this2._onLoad, _this2);
          resource.load();
        }
      }, true);
    };
    _proto._onStart = function _onStart() {
      this.progress = 0;
      this.loading = true;
      this.onStart.dispatch(this);
    };
    _proto._onComplete = function _onComplete() {
      this.progress = MAX_PROGRESS;
      this.loading = false;
      this.onComplete.dispatch(this, this.resources);
    };
    _proto._onLoad = function _onLoad(resource) {
      var _this3 = this;
      resource._onLoadBinding = null;
      this._resourcesParsing.push(resource);
      resource._dequeue();
      eachSeries(this._afterMiddleware, function(fn, next) {
        fn.call(_this3, resource, next);
      }, function() {
        resource.onAfterMiddleware.dispatch(resource);
        _this3.progress = Math.min(MAX_PROGRESS, _this3.progress + resource.progressChunk);
        _this3.onProgress.dispatch(_this3, resource);
        if (resource.error) {
          _this3.onError.dispatch(resource.error, _this3, resource);
        } else {
          _this3.onLoad.dispatch(_this3, resource);
        }
        _this3._resourcesParsing.splice(_this3._resourcesParsing.indexOf(resource), 1);
        if (_this3._queue.idle() && _this3._resourcesParsing.length === 0) {
          _this3._onComplete();
        }
      }, true);
    };
    _createClass(Loader2, [{
      key: "concurrency",
      get: function get() {
        return this._queue.concurrency;
      },
      set: function set(concurrency) {
        this._queue.concurrency = concurrency;
      }
    }]);
    return Loader2;
  }();
  Loader._defaultBeforeMiddleware = [];
  Loader._defaultAfterMiddleware = [];
  Loader.pre = function LoaderPreStatic(fn) {
    Loader._defaultBeforeMiddleware.push(fn);
    return Loader;
  };
  Loader.use = function LoaderUseStatic(fn) {
    Loader._defaultAfterMiddleware.push(fn);
    return Loader;
  };
  exports2.Loader = Loader;
  exports2.Resource = Resource;
  exports2.async = async;
  exports2.encodeBinary = encodeBinary;
  exports2.middleware = index;
});

// node_modules/@pixi/loaders/lib/loaders.js
var require_loaders = __commonJS((exports2) => {
  /*!
   * @pixi/loaders - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/loaders is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var resourceLoader = require_resource_loader_cjs();
  var core = require_core();
  var LoaderResource = resourceLoader.Resource;
  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0
  
  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.
  
  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || {__proto__: []} instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) {
        if (b2.hasOwnProperty(p)) {
          d2[p] = b2[p];
        }
      }
    };
    return extendStatics(d, b);
  };
  function __extends(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  var TextureLoader = function() {
    function TextureLoader2() {
    }
    TextureLoader2.use = function(resource, next) {
      if (resource.data && resource.type === resourceLoader.Resource.TYPE.IMAGE) {
        resource.texture = core.Texture.fromLoader(resource.data, resource.url, resource.name);
      }
      next();
    };
    return TextureLoader2;
  }();
  var Loader = function(_super) {
    __extends(Loader2, _super);
    function Loader2(baseUrl, concurrency) {
      var _this = _super.call(this, baseUrl, concurrency) || this;
      for (var i = 0; i < Loader2._plugins.length; ++i) {
        var plugin = Loader2._plugins[i];
        var pre = plugin.pre, use = plugin.use;
        if (pre) {
          _this.pre(pre);
        }
        if (use) {
          _this.use(use);
        }
      }
      _this._protected = false;
      return _this;
    }
    Loader2.prototype.destroy = function() {
      if (!this._protected) {
        this.reset();
      }
    };
    Object.defineProperty(Loader2, "shared", {
      get: function() {
        var shared = Loader2._shared;
        if (!shared) {
          shared = new Loader2();
          shared._protected = true;
          Loader2._shared = shared;
        }
        return shared;
      },
      enumerable: false,
      configurable: true
    });
    Loader2.registerPlugin = function(plugin) {
      Loader2._plugins.push(plugin);
      if (plugin.add) {
        plugin.add();
      }
      return Loader2;
    };
    Loader2._plugins = [];
    return Loader2;
  }(resourceLoader.Loader);
  Loader.registerPlugin({use: resourceLoader.middleware.parsing});
  Loader.registerPlugin(TextureLoader);
  var AppLoaderPlugin = function() {
    function AppLoaderPlugin2() {
    }
    AppLoaderPlugin2.init = function(options) {
      options = Object.assign({
        sharedLoader: false
      }, options);
      this.loader = options.sharedLoader ? Loader.shared : new Loader();
    };
    AppLoaderPlugin2.destroy = function() {
      if (this.loader) {
        this.loader.destroy();
        this.loader = null;
      }
    };
    return AppLoaderPlugin2;
  }();
  exports2.AppLoaderPlugin = AppLoaderPlugin;
  exports2.Loader = Loader;
  exports2.LoaderResource = LoaderResource;
  exports2.TextureLoader = TextureLoader;
});

// node_modules/@pixi/particles/lib/particles.js
var require_particles = __commonJS((exports2) => {
  /*!
   * @pixi/particles - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/particles is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var constants = require_constants();
  var display = require_display();
  var utils = require_utils();
  var core = require_core();
  var math = require_math();
  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0
  
  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.
  
  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || {__proto__: []} instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) {
        if (b2.hasOwnProperty(p)) {
          d2[p] = b2[p];
        }
      }
    };
    return extendStatics(d, b);
  };
  function __extends(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  var ParticleContainer = function(_super) {
    __extends(ParticleContainer2, _super);
    function ParticleContainer2(maxSize, properties, batchSize, autoResize) {
      if (maxSize === void 0) {
        maxSize = 1500;
      }
      if (batchSize === void 0) {
        batchSize = 16384;
      }
      if (autoResize === void 0) {
        autoResize = false;
      }
      var _this = _super.call(this) || this;
      var maxBatchSize = 16384;
      if (batchSize > maxBatchSize) {
        batchSize = maxBatchSize;
      }
      _this._properties = [false, true, false, false, false];
      _this._maxSize = maxSize;
      _this._batchSize = batchSize;
      _this._buffers = null;
      _this._bufferUpdateIDs = [];
      _this._updateID = 0;
      _this.interactiveChildren = false;
      _this.blendMode = constants.BLEND_MODES.NORMAL;
      _this.autoResize = autoResize;
      _this.roundPixels = true;
      _this.baseTexture = null;
      _this.setProperties(properties);
      _this._tint = 0;
      _this.tintRgb = new Float32Array(4);
      _this.tint = 16777215;
      return _this;
    }
    ParticleContainer2.prototype.setProperties = function(properties) {
      if (properties) {
        this._properties[0] = "vertices" in properties || "scale" in properties ? !!properties.vertices || !!properties.scale : this._properties[0];
        this._properties[1] = "position" in properties ? !!properties.position : this._properties[1];
        this._properties[2] = "rotation" in properties ? !!properties.rotation : this._properties[2];
        this._properties[3] = "uvs" in properties ? !!properties.uvs : this._properties[3];
        this._properties[4] = "tint" in properties || "alpha" in properties ? !!properties.tint || !!properties.alpha : this._properties[4];
      }
    };
    ParticleContainer2.prototype.updateTransform = function() {
      this.displayObjectUpdateTransform();
    };
    Object.defineProperty(ParticleContainer2.prototype, "tint", {
      get: function() {
        return this._tint;
      },
      set: function(value) {
        this._tint = value;
        utils.hex2rgb(value, this.tintRgb);
      },
      enumerable: false,
      configurable: true
    });
    ParticleContainer2.prototype.render = function(renderer) {
      var _this = this;
      if (!this.visible || this.worldAlpha <= 0 || !this.children.length || !this.renderable) {
        return;
      }
      if (!this.baseTexture) {
        this.baseTexture = this.children[0]._texture.baseTexture;
        if (!this.baseTexture.valid) {
          this.baseTexture.once("update", function() {
            return _this.onChildrenChange(0);
          });
        }
      }
      renderer.batch.setObjectRenderer(renderer.plugins.particle);
      renderer.plugins.particle.render(this);
    };
    ParticleContainer2.prototype.onChildrenChange = function(smallestChildIndex) {
      var bufferIndex = Math.floor(smallestChildIndex / this._batchSize);
      while (this._bufferUpdateIDs.length < bufferIndex) {
        this._bufferUpdateIDs.push(0);
      }
      this._bufferUpdateIDs[bufferIndex] = ++this._updateID;
    };
    ParticleContainer2.prototype.dispose = function() {
      if (this._buffers) {
        for (var i = 0; i < this._buffers.length; ++i) {
          this._buffers[i].destroy();
        }
        this._buffers = null;
      }
    };
    ParticleContainer2.prototype.destroy = function(options) {
      _super.prototype.destroy.call(this, options);
      this.dispose();
      this._properties = null;
      this._buffers = null;
      this._bufferUpdateIDs = null;
    };
    return ParticleContainer2;
  }(display.Container);
  var ParticleBuffer = function() {
    function ParticleBuffer2(properties, dynamicPropertyFlags, size) {
      this.geometry = new core.Geometry();
      this.indexBuffer = null;
      this.size = size;
      this.dynamicProperties = [];
      this.staticProperties = [];
      for (var i = 0; i < properties.length; ++i) {
        var property = properties[i];
        property = {
          attributeName: property.attributeName,
          size: property.size,
          uploadFunction: property.uploadFunction,
          type: property.type || constants.TYPES.FLOAT,
          offset: property.offset
        };
        if (dynamicPropertyFlags[i]) {
          this.dynamicProperties.push(property);
        } else {
          this.staticProperties.push(property);
        }
      }
      this.staticStride = 0;
      this.staticBuffer = null;
      this.staticData = null;
      this.staticDataUint32 = null;
      this.dynamicStride = 0;
      this.dynamicBuffer = null;
      this.dynamicData = null;
      this.dynamicDataUint32 = null;
      this._updateID = 0;
      this.initBuffers();
    }
    ParticleBuffer2.prototype.initBuffers = function() {
      var geometry = this.geometry;
      var dynamicOffset = 0;
      this.indexBuffer = new core.Buffer(utils.createIndicesForQuads(this.size), true, true);
      geometry.addIndex(this.indexBuffer);
      this.dynamicStride = 0;
      for (var i = 0; i < this.dynamicProperties.length; ++i) {
        var property = this.dynamicProperties[i];
        property.offset = dynamicOffset;
        dynamicOffset += property.size;
        this.dynamicStride += property.size;
      }
      var dynBuffer = new ArrayBuffer(this.size * this.dynamicStride * 4 * 4);
      this.dynamicData = new Float32Array(dynBuffer);
      this.dynamicDataUint32 = new Uint32Array(dynBuffer);
      this.dynamicBuffer = new core.Buffer(this.dynamicData, false, false);
      var staticOffset = 0;
      this.staticStride = 0;
      for (var i = 0; i < this.staticProperties.length; ++i) {
        var property = this.staticProperties[i];
        property.offset = staticOffset;
        staticOffset += property.size;
        this.staticStride += property.size;
      }
      var statBuffer = new ArrayBuffer(this.size * this.staticStride * 4 * 4);
      this.staticData = new Float32Array(statBuffer);
      this.staticDataUint32 = new Uint32Array(statBuffer);
      this.staticBuffer = new core.Buffer(this.staticData, true, false);
      for (var i = 0; i < this.dynamicProperties.length; ++i) {
        var property = this.dynamicProperties[i];
        geometry.addAttribute(property.attributeName, this.dynamicBuffer, 0, property.type === constants.TYPES.UNSIGNED_BYTE, property.type, this.dynamicStride * 4, property.offset * 4);
      }
      for (var i = 0; i < this.staticProperties.length; ++i) {
        var property = this.staticProperties[i];
        geometry.addAttribute(property.attributeName, this.staticBuffer, 0, property.type === constants.TYPES.UNSIGNED_BYTE, property.type, this.staticStride * 4, property.offset * 4);
      }
    };
    ParticleBuffer2.prototype.uploadDynamic = function(children, startIndex, amount) {
      for (var i = 0; i < this.dynamicProperties.length; i++) {
        var property = this.dynamicProperties[i];
        property.uploadFunction(children, startIndex, amount, property.type === constants.TYPES.UNSIGNED_BYTE ? this.dynamicDataUint32 : this.dynamicData, this.dynamicStride, property.offset);
      }
      this.dynamicBuffer._updateID++;
    };
    ParticleBuffer2.prototype.uploadStatic = function(children, startIndex, amount) {
      for (var i = 0; i < this.staticProperties.length; i++) {
        var property = this.staticProperties[i];
        property.uploadFunction(children, startIndex, amount, property.type === constants.TYPES.UNSIGNED_BYTE ? this.staticDataUint32 : this.staticData, this.staticStride, property.offset);
      }
      this.staticBuffer._updateID++;
    };
    ParticleBuffer2.prototype.destroy = function() {
      this.indexBuffer = null;
      this.dynamicProperties = null;
      this.dynamicBuffer = null;
      this.dynamicData = null;
      this.dynamicDataUint32 = null;
      this.staticProperties = null;
      this.staticBuffer = null;
      this.staticData = null;
      this.staticDataUint32 = null;
      this.geometry.destroy();
    };
    return ParticleBuffer2;
  }();
  var fragment = "varying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform sampler2D uSampler;\n\nvoid main(void){\n    vec4 color = texture2D(uSampler, vTextureCoord) * vColor;\n    gl_FragColor = color;\n}";
  var vertex = "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nattribute vec2 aPositionCoord;\nattribute float aRotation;\n\nuniform mat3 translationMatrix;\nuniform vec4 uColor;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nvoid main(void){\n    float x = (aVertexPosition.x) * cos(aRotation) - (aVertexPosition.y) * sin(aRotation);\n    float y = (aVertexPosition.x) * sin(aRotation) + (aVertexPosition.y) * cos(aRotation);\n\n    vec2 v = vec2(x, y);\n    v = v + aPositionCoord;\n\n    gl_Position = vec4((translationMatrix * vec3(v, 1.0)).xy, 0.0, 1.0);\n\n    vTextureCoord = aTextureCoord;\n    vColor = aColor * uColor;\n}\n";
  var ParticleRenderer = function(_super) {
    __extends(ParticleRenderer2, _super);
    function ParticleRenderer2(renderer) {
      var _this = _super.call(this, renderer) || this;
      _this.shader = null;
      _this.properties = null;
      _this.tempMatrix = new math.Matrix();
      _this.properties = [
        {
          attributeName: "aVertexPosition",
          size: 2,
          uploadFunction: _this.uploadVertices,
          offset: 0
        },
        {
          attributeName: "aPositionCoord",
          size: 2,
          uploadFunction: _this.uploadPosition,
          offset: 0
        },
        {
          attributeName: "aRotation",
          size: 1,
          uploadFunction: _this.uploadRotation,
          offset: 0
        },
        {
          attributeName: "aTextureCoord",
          size: 2,
          uploadFunction: _this.uploadUvs,
          offset: 0
        },
        {
          attributeName: "aColor",
          size: 1,
          type: constants.TYPES.UNSIGNED_BYTE,
          uploadFunction: _this.uploadTint,
          offset: 0
        }
      ];
      _this.shader = core.Shader.from(vertex, fragment, {});
      _this.state = core.State.for2d();
      return _this;
    }
    ParticleRenderer2.prototype.render = function(container) {
      var children = container.children;
      var maxSize = container._maxSize;
      var batchSize = container._batchSize;
      var renderer = this.renderer;
      var totalChildren = children.length;
      if (totalChildren === 0) {
        return;
      } else if (totalChildren > maxSize && !container.autoResize) {
        totalChildren = maxSize;
      }
      var buffers = container._buffers;
      if (!buffers) {
        buffers = container._buffers = this.generateBuffers(container);
      }
      var baseTexture = children[0]._texture.baseTexture;
      this.state.blendMode = utils.correctBlendMode(container.blendMode, baseTexture.alphaMode);
      renderer.state.set(this.state);
      var gl = renderer.gl;
      var m = container.worldTransform.copyTo(this.tempMatrix);
      m.prepend(renderer.globalUniforms.uniforms.projectionMatrix);
      this.shader.uniforms.translationMatrix = m.toArray(true);
      this.shader.uniforms.uColor = utils.premultiplyRgba(container.tintRgb, container.worldAlpha, this.shader.uniforms.uColor, baseTexture.alphaMode);
      this.shader.uniforms.uSampler = baseTexture;
      this.renderer.shader.bind(this.shader);
      var updateStatic = false;
      for (var i = 0, j = 0; i < totalChildren; i += batchSize, j += 1) {
        var amount = totalChildren - i;
        if (amount > batchSize) {
          amount = batchSize;
        }
        if (j >= buffers.length) {
          buffers.push(this._generateOneMoreBuffer(container));
        }
        var buffer = buffers[j];
        buffer.uploadDynamic(children, i, amount);
        var bid = container._bufferUpdateIDs[j] || 0;
        updateStatic = updateStatic || buffer._updateID < bid;
        if (updateStatic) {
          buffer._updateID = container._updateID;
          buffer.uploadStatic(children, i, amount);
        }
        renderer.geometry.bind(buffer.geometry);
        gl.drawElements(gl.TRIANGLES, amount * 6, gl.UNSIGNED_SHORT, 0);
      }
    };
    ParticleRenderer2.prototype.generateBuffers = function(container) {
      var buffers = [];
      var size = container._maxSize;
      var batchSize = container._batchSize;
      var dynamicPropertyFlags = container._properties;
      for (var i = 0; i < size; i += batchSize) {
        buffers.push(new ParticleBuffer(this.properties, dynamicPropertyFlags, batchSize));
      }
      return buffers;
    };
    ParticleRenderer2.prototype._generateOneMoreBuffer = function(container) {
      var batchSize = container._batchSize;
      var dynamicPropertyFlags = container._properties;
      return new ParticleBuffer(this.properties, dynamicPropertyFlags, batchSize);
    };
    ParticleRenderer2.prototype.uploadVertices = function(children, startIndex, amount, array, stride, offset) {
      var w0 = 0;
      var w1 = 0;
      var h0 = 0;
      var h1 = 0;
      for (var i = 0; i < amount; ++i) {
        var sprite = children[startIndex + i];
        var texture = sprite._texture;
        var sx = sprite.scale.x;
        var sy = sprite.scale.y;
        var trim = texture.trim;
        var orig = texture.orig;
        if (trim) {
          w1 = trim.x - sprite.anchor.x * orig.width;
          w0 = w1 + trim.width;
          h1 = trim.y - sprite.anchor.y * orig.height;
          h0 = h1 + trim.height;
        } else {
          w0 = orig.width * (1 - sprite.anchor.x);
          w1 = orig.width * -sprite.anchor.x;
          h0 = orig.height * (1 - sprite.anchor.y);
          h1 = orig.height * -sprite.anchor.y;
        }
        array[offset] = w1 * sx;
        array[offset + 1] = h1 * sy;
        array[offset + stride] = w0 * sx;
        array[offset + stride + 1] = h1 * sy;
        array[offset + stride * 2] = w0 * sx;
        array[offset + stride * 2 + 1] = h0 * sy;
        array[offset + stride * 3] = w1 * sx;
        array[offset + stride * 3 + 1] = h0 * sy;
        offset += stride * 4;
      }
    };
    ParticleRenderer2.prototype.uploadPosition = function(children, startIndex, amount, array, stride, offset) {
      for (var i = 0; i < amount; i++) {
        var spritePosition = children[startIndex + i].position;
        array[offset] = spritePosition.x;
        array[offset + 1] = spritePosition.y;
        array[offset + stride] = spritePosition.x;
        array[offset + stride + 1] = spritePosition.y;
        array[offset + stride * 2] = spritePosition.x;
        array[offset + stride * 2 + 1] = spritePosition.y;
        array[offset + stride * 3] = spritePosition.x;
        array[offset + stride * 3 + 1] = spritePosition.y;
        offset += stride * 4;
      }
    };
    ParticleRenderer2.prototype.uploadRotation = function(children, startIndex, amount, array, stride, offset) {
      for (var i = 0; i < amount; i++) {
        var spriteRotation = children[startIndex + i].rotation;
        array[offset] = spriteRotation;
        array[offset + stride] = spriteRotation;
        array[offset + stride * 2] = spriteRotation;
        array[offset + stride * 3] = spriteRotation;
        offset += stride * 4;
      }
    };
    ParticleRenderer2.prototype.uploadUvs = function(children, startIndex, amount, array, stride, offset) {
      for (var i = 0; i < amount; ++i) {
        var textureUvs = children[startIndex + i]._texture._uvs;
        if (textureUvs) {
          array[offset] = textureUvs.x0;
          array[offset + 1] = textureUvs.y0;
          array[offset + stride] = textureUvs.x1;
          array[offset + stride + 1] = textureUvs.y1;
          array[offset + stride * 2] = textureUvs.x2;
          array[offset + stride * 2 + 1] = textureUvs.y2;
          array[offset + stride * 3] = textureUvs.x3;
          array[offset + stride * 3 + 1] = textureUvs.y3;
          offset += stride * 4;
        } else {
          array[offset] = 0;
          array[offset + 1] = 0;
          array[offset + stride] = 0;
          array[offset + stride + 1] = 0;
          array[offset + stride * 2] = 0;
          array[offset + stride * 2 + 1] = 0;
          array[offset + stride * 3] = 0;
          array[offset + stride * 3 + 1] = 0;
          offset += stride * 4;
        }
      }
    };
    ParticleRenderer2.prototype.uploadTint = function(children, startIndex, amount, array, stride, offset) {
      for (var i = 0; i < amount; ++i) {
        var sprite = children[startIndex + i];
        var premultiplied = sprite._texture.baseTexture.alphaMode > 0;
        var alpha = sprite.alpha;
        var argb = alpha < 1 && premultiplied ? utils.premultiplyTint(sprite._tintRGB, alpha) : sprite._tintRGB + (alpha * 255 << 24);
        array[offset] = argb;
        array[offset + stride] = argb;
        array[offset + stride * 2] = argb;
        array[offset + stride * 3] = argb;
        offset += stride * 4;
      }
    };
    ParticleRenderer2.prototype.destroy = function() {
      _super.prototype.destroy.call(this);
      if (this.shader) {
        this.shader.destroy();
        this.shader = null;
      }
      this.tempMatrix = null;
    };
    return ParticleRenderer2;
  }(core.ObjectRenderer);
  exports2.ParticleContainer = ParticleContainer;
  exports2.ParticleRenderer = ParticleRenderer;
});

// node_modules/@pixi/graphics/lib/graphics.js
var require_graphics = __commonJS((exports2) => {
  /*!
   * @pixi/graphics - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/graphics is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var core = require_core();
  var math = require_math();
  var utils = require_utils();
  var constants = require_constants();
  var display = require_display();
  (function(LINE_JOIN) {
    LINE_JOIN["MITER"] = "miter";
    LINE_JOIN["BEVEL"] = "bevel";
    LINE_JOIN["ROUND"] = "round";
  })(exports2.LINE_JOIN || (exports2.LINE_JOIN = {}));
  (function(LINE_CAP) {
    LINE_CAP["BUTT"] = "butt";
    LINE_CAP["ROUND"] = "round";
    LINE_CAP["SQUARE"] = "square";
  })(exports2.LINE_CAP || (exports2.LINE_CAP = {}));
  var GRAPHICS_CURVES = {
    adaptive: true,
    maxLength: 10,
    minSegments: 8,
    maxSegments: 2048,
    epsilon: 1e-4,
    _segmentsCount: function(length, defaultSegments) {
      if (defaultSegments === void 0) {
        defaultSegments = 20;
      }
      if (!this.adaptive || !length || isNaN(length)) {
        return defaultSegments;
      }
      var result = Math.ceil(length / this.maxLength);
      if (result < this.minSegments) {
        result = this.minSegments;
      } else if (result > this.maxSegments) {
        result = this.maxSegments;
      }
      return result;
    }
  };
  var FillStyle = function() {
    function FillStyle2() {
      this.color = 16777215;
      this.alpha = 1;
      this.texture = core.Texture.WHITE;
      this.matrix = null;
      this.visible = false;
      this.reset();
    }
    FillStyle2.prototype.clone = function() {
      var obj = new FillStyle2();
      obj.color = this.color;
      obj.alpha = this.alpha;
      obj.texture = this.texture;
      obj.matrix = this.matrix;
      obj.visible = this.visible;
      return obj;
    };
    FillStyle2.prototype.reset = function() {
      this.color = 16777215;
      this.alpha = 1;
      this.texture = core.Texture.WHITE;
      this.matrix = null;
      this.visible = false;
    };
    FillStyle2.prototype.destroy = function() {
      this.texture = null;
      this.matrix = null;
    };
    return FillStyle2;
  }();
  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0
  
  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.
  
  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || {__proto__: []} instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) {
        if (b2.hasOwnProperty(p)) {
          d2[p] = b2[p];
        }
      }
    };
    return extendStatics(d, b);
  };
  function __extends(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  var buildPoly = {
    build: function(graphicsData) {
      graphicsData.points = graphicsData.shape.points.slice();
    },
    triangulate: function(graphicsData, graphicsGeometry) {
      var points = graphicsData.points;
      var holes = graphicsData.holes;
      var verts = graphicsGeometry.points;
      var indices = graphicsGeometry.indices;
      if (points.length >= 6) {
        var holeArray = [];
        for (var i = 0; i < holes.length; i++) {
          var hole = holes[i];
          holeArray.push(points.length / 2);
          points = points.concat(hole.points);
        }
        var triangles = utils.earcut(points, holeArray, 2);
        if (!triangles) {
          return;
        }
        var vertPos = verts.length / 2;
        for (var i = 0; i < triangles.length; i += 3) {
          indices.push(triangles[i] + vertPos);
          indices.push(triangles[i + 1] + vertPos);
          indices.push(triangles[i + 2] + vertPos);
        }
        for (var i = 0; i < points.length; i++) {
          verts.push(points[i]);
        }
      }
    }
  };
  var buildCircle = {
    build: function(graphicsData) {
      var circleData = graphicsData.shape;
      var points = graphicsData.points;
      var x = circleData.x;
      var y = circleData.y;
      var width;
      var height;
      points.length = 0;
      if (graphicsData.type === math.SHAPES.CIRC) {
        width = circleData.radius;
        height = circleData.radius;
      } else {
        var ellipseData = graphicsData.shape;
        width = ellipseData.width;
        height = ellipseData.height;
      }
      if (width === 0 || height === 0) {
        return;
      }
      var totalSegs = Math.floor(30 * Math.sqrt(circleData.radius)) || Math.floor(15 * Math.sqrt(width + height));
      totalSegs /= 2.3;
      var seg = Math.PI * 2 / totalSegs;
      for (var i = 0; i < totalSegs - 0.5; i++) {
        points.push(x + Math.sin(-seg * i) * width, y + Math.cos(-seg * i) * height);
      }
      points.push(points[0], points[1]);
    },
    triangulate: function(graphicsData, graphicsGeometry) {
      var points = graphicsData.points;
      var verts = graphicsGeometry.points;
      var indices = graphicsGeometry.indices;
      var vertPos = verts.length / 2;
      var center = vertPos;
      var circle = graphicsData.shape;
      var matrix = graphicsData.matrix;
      var x = circle.x;
      var y = circle.y;
      verts.push(graphicsData.matrix ? matrix.a * x + matrix.c * y + matrix.tx : x, graphicsData.matrix ? matrix.b * x + matrix.d * y + matrix.ty : y);
      for (var i = 0; i < points.length; i += 2) {
        verts.push(points[i], points[i + 1]);
        indices.push(vertPos++, center, vertPos);
      }
    }
  };
  var buildRectangle = {
    build: function(graphicsData) {
      var rectData = graphicsData.shape;
      var x = rectData.x;
      var y = rectData.y;
      var width = rectData.width;
      var height = rectData.height;
      var points = graphicsData.points;
      points.length = 0;
      points.push(x, y, x + width, y, x + width, y + height, x, y + height);
    },
    triangulate: function(graphicsData, graphicsGeometry) {
      var points = graphicsData.points;
      var verts = graphicsGeometry.points;
      var vertPos = verts.length / 2;
      verts.push(points[0], points[1], points[2], points[3], points[6], points[7], points[4], points[5]);
      graphicsGeometry.indices.push(vertPos, vertPos + 1, vertPos + 2, vertPos + 1, vertPos + 2, vertPos + 3);
    }
  };
  function getPt(n1, n2, perc) {
    var diff = n2 - n1;
    return n1 + diff * perc;
  }
  function quadraticBezierCurve(fromX, fromY, cpX, cpY, toX, toY, out) {
    if (out === void 0) {
      out = [];
    }
    var n = 20;
    var points = out;
    var xa = 0;
    var ya = 0;
    var xb = 0;
    var yb = 0;
    var x = 0;
    var y = 0;
    for (var i = 0, j = 0; i <= n; ++i) {
      j = i / n;
      xa = getPt(fromX, cpX, j);
      ya = getPt(fromY, cpY, j);
      xb = getPt(cpX, toX, j);
      yb = getPt(cpY, toY, j);
      x = getPt(xa, xb, j);
      y = getPt(ya, yb, j);
      points.push(x, y);
    }
    return points;
  }
  var buildRoundedRectangle = {
    build: function(graphicsData) {
      var rrectData = graphicsData.shape;
      var points = graphicsData.points;
      var x = rrectData.x;
      var y = rrectData.y;
      var width = rrectData.width;
      var height = rrectData.height;
      var radius = Math.max(0, Math.min(rrectData.radius, Math.min(width, height) / 2));
      points.length = 0;
      if (!radius) {
        points.push(x, y, x + width, y, x + width, y + height, x, y + height);
      } else {
        quadraticBezierCurve(x, y + radius, x, y, x + radius, y, points);
        quadraticBezierCurve(x + width - radius, y, x + width, y, x + width, y + radius, points);
        quadraticBezierCurve(x + width, y + height - radius, x + width, y + height, x + width - radius, y + height, points);
        quadraticBezierCurve(x + radius, y + height, x, y + height, x, y + height - radius, points);
      }
    },
    triangulate: function(graphicsData, graphicsGeometry) {
      var points = graphicsData.points;
      var verts = graphicsGeometry.points;
      var indices = graphicsGeometry.indices;
      var vecPos = verts.length / 2;
      var triangles = utils.earcut(points, null, 2);
      for (var i = 0, j = triangles.length; i < j; i += 3) {
        indices.push(triangles[i] + vecPos);
        indices.push(triangles[i + 1] + vecPos);
        indices.push(triangles[i + 2] + vecPos);
      }
      for (var i = 0, j = points.length; i < j; i++) {
        verts.push(points[i], points[++i]);
      }
    }
  };
  function square(x, y, nx, ny, innerWeight, outerWeight, clockwise, verts) {
    var ix = x - nx * innerWeight;
    var iy = y - ny * innerWeight;
    var ox = x + nx * outerWeight;
    var oy = y + ny * outerWeight;
    var exx;
    var eyy;
    if (clockwise) {
      exx = ny;
      eyy = -nx;
    } else {
      exx = -ny;
      eyy = nx;
    }
    var eix = ix + exx;
    var eiy = iy + eyy;
    var eox = ox + exx;
    var eoy = oy + eyy;
    verts.push(eix, eiy);
    verts.push(eox, eoy);
    return 2;
  }
  function round(cx, cy, sx, sy, ex, ey, verts, clockwise) {
    var cx2p0x = sx - cx;
    var cy2p0y = sy - cy;
    var angle0 = Math.atan2(cx2p0x, cy2p0y);
    var angle1 = Math.atan2(ex - cx, ey - cy);
    if (clockwise && angle0 < angle1) {
      angle0 += Math.PI * 2;
    } else if (!clockwise && angle0 > angle1) {
      angle1 += Math.PI * 2;
    }
    var startAngle = angle0;
    var angleDiff = angle1 - angle0;
    var absAngleDiff = Math.abs(angleDiff);
    var radius = Math.sqrt(cx2p0x * cx2p0x + cy2p0y * cy2p0y);
    var segCount = (15 * absAngleDiff * Math.sqrt(radius) / Math.PI >> 0) + 1;
    var angleInc = angleDiff / segCount;
    startAngle += angleInc;
    if (clockwise) {
      verts.push(cx, cy);
      verts.push(sx, sy);
      for (var i = 1, angle = startAngle; i < segCount; i++, angle += angleInc) {
        verts.push(cx, cy);
        verts.push(cx + Math.sin(angle) * radius, cy + Math.cos(angle) * radius);
      }
      verts.push(cx, cy);
      verts.push(ex, ey);
    } else {
      verts.push(sx, sy);
      verts.push(cx, cy);
      for (var i = 1, angle = startAngle; i < segCount; i++, angle += angleInc) {
        verts.push(cx + Math.sin(angle) * radius, cy + Math.cos(angle) * radius);
        verts.push(cx, cy);
      }
      verts.push(ex, ey);
      verts.push(cx, cy);
    }
    return segCount * 2;
  }
  function buildNonNativeLine(graphicsData, graphicsGeometry) {
    var shape = graphicsData.shape;
    var points = graphicsData.points || shape.points.slice();
    var eps = graphicsGeometry.closePointEps;
    if (points.length === 0) {
      return;
    }
    var style = graphicsData.lineStyle;
    var firstPoint = new math.Point(points[0], points[1]);
    var lastPoint = new math.Point(points[points.length - 2], points[points.length - 1]);
    var closedShape = shape.type !== math.SHAPES.POLY || shape.closeStroke;
    var closedPath = Math.abs(firstPoint.x - lastPoint.x) < eps && Math.abs(firstPoint.y - lastPoint.y) < eps;
    if (closedShape) {
      points = points.slice();
      if (closedPath) {
        points.pop();
        points.pop();
        lastPoint.set(points[points.length - 2], points[points.length - 1]);
      }
      var midPointX = (firstPoint.x + lastPoint.x) * 0.5;
      var midPointY = (lastPoint.y + firstPoint.y) * 0.5;
      points.unshift(midPointX, midPointY);
      points.push(midPointX, midPointY);
    }
    var verts = graphicsGeometry.points;
    var length = points.length / 2;
    var indexCount = points.length;
    var indexStart = verts.length / 2;
    var width = style.width / 2;
    var widthSquared = width * width;
    var miterLimitSquared = style.miterLimit * style.miterLimit;
    var x0 = points[0];
    var y0 = points[1];
    var x1 = points[2];
    var y1 = points[3];
    var x2 = 0;
    var y2 = 0;
    var perpx = -(y0 - y1);
    var perpy = x0 - x1;
    var perp1x = 0;
    var perp1y = 0;
    var dist = Math.sqrt(perpx * perpx + perpy * perpy);
    perpx /= dist;
    perpy /= dist;
    perpx *= width;
    perpy *= width;
    var ratio = style.alignment;
    var innerWeight = (1 - ratio) * 2;
    var outerWeight = ratio * 2;
    if (!closedShape) {
      if (style.cap === exports2.LINE_CAP.ROUND) {
        indexCount += round(x0 - perpx * (innerWeight - outerWeight) * 0.5, y0 - perpy * (innerWeight - outerWeight) * 0.5, x0 - perpx * innerWeight, y0 - perpy * innerWeight, x0 + perpx * outerWeight, y0 + perpy * outerWeight, verts, true) + 2;
      } else if (style.cap === exports2.LINE_CAP.SQUARE) {
        indexCount += square(x0, y0, perpx, perpy, innerWeight, outerWeight, true, verts);
      }
    }
    verts.push(x0 - perpx * innerWeight, y0 - perpy * innerWeight);
    verts.push(x0 + perpx * outerWeight, y0 + perpy * outerWeight);
    for (var i = 1; i < length - 1; ++i) {
      x0 = points[(i - 1) * 2];
      y0 = points[(i - 1) * 2 + 1];
      x1 = points[i * 2];
      y1 = points[i * 2 + 1];
      x2 = points[(i + 1) * 2];
      y2 = points[(i + 1) * 2 + 1];
      perpx = -(y0 - y1);
      perpy = x0 - x1;
      dist = Math.sqrt(perpx * perpx + perpy * perpy);
      perpx /= dist;
      perpy /= dist;
      perpx *= width;
      perpy *= width;
      perp1x = -(y1 - y2);
      perp1y = x1 - x2;
      dist = Math.sqrt(perp1x * perp1x + perp1y * perp1y);
      perp1x /= dist;
      perp1y /= dist;
      perp1x *= width;
      perp1y *= width;
      var dx0 = x1 - x0;
      var dy0 = y0 - y1;
      var dx1 = x1 - x2;
      var dy1 = y2 - y1;
      var cross = dy0 * dx1 - dy1 * dx0;
      var clockwise = cross < 0;
      if (Math.abs(cross) < 0.1) {
        verts.push(x1 - perpx * innerWeight, y1 - perpy * innerWeight);
        verts.push(x1 + perpx * outerWeight, y1 + perpy * outerWeight);
        continue;
      }
      var c1 = (-perpx + x0) * (-perpy + y1) - (-perpx + x1) * (-perpy + y0);
      var c2 = (-perp1x + x2) * (-perp1y + y1) - (-perp1x + x1) * (-perp1y + y2);
      var px = (dx0 * c2 - dx1 * c1) / cross;
      var py = (dy1 * c1 - dy0 * c2) / cross;
      var pdist = (px - x1) * (px - x1) + (py - y1) * (py - y1);
      var imx = x1 + (px - x1) * innerWeight;
      var imy = y1 + (py - y1) * innerWeight;
      var omx = x1 - (px - x1) * outerWeight;
      var omy = y1 - (py - y1) * outerWeight;
      var smallerInsideSegmentSq = Math.min(dx0 * dx0 + dy0 * dy0, dx1 * dx1 + dy1 * dy1);
      var insideWeight = clockwise ? innerWeight : outerWeight;
      var smallerInsideDiagonalSq = smallerInsideSegmentSq + insideWeight * insideWeight * widthSquared;
      var insideMiterOk = pdist <= smallerInsideDiagonalSq;
      if (insideMiterOk) {
        if (style.join === exports2.LINE_JOIN.BEVEL || pdist / widthSquared > miterLimitSquared) {
          if (clockwise) {
            verts.push(imx, imy);
            verts.push(x1 + perpx * outerWeight, y1 + perpy * outerWeight);
            verts.push(imx, imy);
            verts.push(x1 + perp1x * outerWeight, y1 + perp1y * outerWeight);
          } else {
            verts.push(x1 - perpx * innerWeight, y1 - perpy * innerWeight);
            verts.push(omx, omy);
            verts.push(x1 - perp1x * innerWeight, y1 - perp1y * innerWeight);
            verts.push(omx, omy);
          }
          indexCount += 2;
        } else if (style.join === exports2.LINE_JOIN.ROUND) {
          if (clockwise) {
            verts.push(imx, imy);
            verts.push(x1 + perpx * outerWeight, y1 + perpy * outerWeight);
            indexCount += round(x1, y1, x1 + perpx * outerWeight, y1 + perpy * outerWeight, x1 + perp1x * outerWeight, y1 + perp1y * outerWeight, verts, true) + 4;
            verts.push(imx, imy);
            verts.push(x1 + perp1x * outerWeight, y1 + perp1y * outerWeight);
          } else {
            verts.push(x1 - perpx * innerWeight, y1 - perpy * innerWeight);
            verts.push(omx, omy);
            indexCount += round(x1, y1, x1 - perpx * innerWeight, y1 - perpy * innerWeight, x1 - perp1x * innerWeight, y1 - perp1y * innerWeight, verts, false) + 4;
            verts.push(x1 - perp1x * innerWeight, y1 - perp1y * innerWeight);
            verts.push(omx, omy);
          }
        } else {
          verts.push(imx, imy);
          verts.push(omx, omy);
        }
      } else {
        verts.push(x1 - perpx * innerWeight, y1 - perpy * innerWeight);
        verts.push(x1 + perpx * outerWeight, y1 + perpy * outerWeight);
        if (style.join === exports2.LINE_JOIN.BEVEL || pdist / widthSquared > miterLimitSquared)
          ;
        else if (style.join === exports2.LINE_JOIN.ROUND) {
          if (clockwise) {
            indexCount += round(x1, y1, x1 + perpx * outerWeight, y1 + perpy * outerWeight, x1 + perp1x * outerWeight, y1 + perp1y * outerWeight, verts, true) + 2;
          } else {
            indexCount += round(x1, y1, x1 - perpx * innerWeight, y1 - perpy * innerWeight, x1 - perp1x * innerWeight, y1 - perp1y * innerWeight, verts, false) + 2;
          }
        } else {
          if (clockwise) {
            verts.push(omx, omy);
            verts.push(omx, omy);
          } else {
            verts.push(imx, imy);
            verts.push(imx, imy);
          }
          indexCount += 2;
        }
        verts.push(x1 - perp1x * innerWeight, y1 - perp1y * innerWeight);
        verts.push(x1 + perp1x * outerWeight, y1 + perp1y * outerWeight);
        indexCount += 2;
      }
    }
    x0 = points[(length - 2) * 2];
    y0 = points[(length - 2) * 2 + 1];
    x1 = points[(length - 1) * 2];
    y1 = points[(length - 1) * 2 + 1];
    perpx = -(y0 - y1);
    perpy = x0 - x1;
    dist = Math.sqrt(perpx * perpx + perpy * perpy);
    perpx /= dist;
    perpy /= dist;
    perpx *= width;
    perpy *= width;
    verts.push(x1 - perpx * innerWeight, y1 - perpy * innerWeight);
    verts.push(x1 + perpx * outerWeight, y1 + perpy * outerWeight);
    if (!closedShape) {
      if (style.cap === exports2.LINE_CAP.ROUND) {
        indexCount += round(x1 - perpx * (innerWeight - outerWeight) * 0.5, y1 - perpy * (innerWeight - outerWeight) * 0.5, x1 - perpx * innerWeight, y1 - perpy * innerWeight, x1 + perpx * outerWeight, y1 + perpy * outerWeight, verts, false) + 2;
      } else if (style.cap === exports2.LINE_CAP.SQUARE) {
        indexCount += square(x1, y1, perpx, perpy, innerWeight, outerWeight, false, verts);
      }
    }
    var indices = graphicsGeometry.indices;
    var eps2 = GRAPHICS_CURVES.epsilon * GRAPHICS_CURVES.epsilon;
    for (var i = indexStart; i < indexCount + indexStart - 2; ++i) {
      x0 = verts[i * 2];
      y0 = verts[i * 2 + 1];
      x1 = verts[(i + 1) * 2];
      y1 = verts[(i + 1) * 2 + 1];
      x2 = verts[(i + 2) * 2];
      y2 = verts[(i + 2) * 2 + 1];
      if (Math.abs(x0 * (y1 - y2) + x1 * (y2 - y0) + x2 * (y0 - y1)) < eps2) {
        continue;
      }
      indices.push(i, i + 1, i + 2);
    }
  }
  function buildNativeLine(graphicsData, graphicsGeometry) {
    var i = 0;
    var shape = graphicsData.shape;
    var points = graphicsData.points || shape.points;
    var closedShape = shape.type !== math.SHAPES.POLY || shape.closeStroke;
    if (points.length === 0) {
      return;
    }
    var verts = graphicsGeometry.points;
    var indices = graphicsGeometry.indices;
    var length = points.length / 2;
    var startIndex = verts.length / 2;
    var currentIndex = startIndex;
    verts.push(points[0], points[1]);
    for (i = 1; i < length; i++) {
      verts.push(points[i * 2], points[i * 2 + 1]);
      indices.push(currentIndex, currentIndex + 1);
      currentIndex++;
    }
    if (closedShape) {
      indices.push(currentIndex, startIndex);
    }
  }
  function buildLine(graphicsData, graphicsGeometry) {
    if (graphicsData.lineStyle.native) {
      buildNativeLine(graphicsData, graphicsGeometry);
    } else {
      buildNonNativeLine(graphicsData, graphicsGeometry);
    }
  }
  var Star = function(_super) {
    __extends(Star2, _super);
    function Star2(x, y, points, radius, innerRadius, rotation) {
      if (rotation === void 0) {
        rotation = 0;
      }
      var _this = this;
      innerRadius = innerRadius || radius / 2;
      var startAngle = -1 * Math.PI / 2 + rotation;
      var len = points * 2;
      var delta = math.PI_2 / len;
      var polygon = [];
      for (var i = 0; i < len; i++) {
        var r = i % 2 ? innerRadius : radius;
        var angle = i * delta + startAngle;
        polygon.push(x + r * Math.cos(angle), y + r * Math.sin(angle));
      }
      _this = _super.call(this, polygon) || this;
      return _this;
    }
    return Star2;
  }(math.Polygon);
  var ArcUtils = function() {
    function ArcUtils2() {
    }
    ArcUtils2.curveTo = function(x1, y1, x2, y2, radius, points) {
      var fromX = points[points.length - 2];
      var fromY = points[points.length - 1];
      var a1 = fromY - y1;
      var b1 = fromX - x1;
      var a2 = y2 - y1;
      var b2 = x2 - x1;
      var mm = Math.abs(a1 * b2 - b1 * a2);
      if (mm < 1e-8 || radius === 0) {
        if (points[points.length - 2] !== x1 || points[points.length - 1] !== y1) {
          points.push(x1, y1);
        }
        return null;
      }
      var dd = a1 * a1 + b1 * b1;
      var cc = a2 * a2 + b2 * b2;
      var tt = a1 * a2 + b1 * b2;
      var k1 = radius * Math.sqrt(dd) / mm;
      var k2 = radius * Math.sqrt(cc) / mm;
      var j1 = k1 * tt / dd;
      var j2 = k2 * tt / cc;
      var cx = k1 * b2 + k2 * b1;
      var cy = k1 * a2 + k2 * a1;
      var px = b1 * (k2 + j1);
      var py = a1 * (k2 + j1);
      var qx = b2 * (k1 + j2);
      var qy = a2 * (k1 + j2);
      var startAngle = Math.atan2(py - cy, px - cx);
      var endAngle = Math.atan2(qy - cy, qx - cx);
      return {
        cx: cx + x1,
        cy: cy + y1,
        radius,
        startAngle,
        endAngle,
        anticlockwise: b1 * a2 > b2 * a1
      };
    };
    ArcUtils2.arc = function(_startX, _startY, cx, cy, radius, startAngle, endAngle, _anticlockwise, points) {
      var sweep = endAngle - startAngle;
      var n = GRAPHICS_CURVES._segmentsCount(Math.abs(sweep) * radius, Math.ceil(Math.abs(sweep) / math.PI_2) * 40);
      var theta = sweep / (n * 2);
      var theta2 = theta * 2;
      var cTheta = Math.cos(theta);
      var sTheta = Math.sin(theta);
      var segMinus = n - 1;
      var remainder = segMinus % 1 / segMinus;
      for (var i = 0; i <= segMinus; ++i) {
        var real = i + remainder * i;
        var angle = theta + startAngle + theta2 * real;
        var c = Math.cos(angle);
        var s = -Math.sin(angle);
        points.push((cTheta * c + sTheta * s) * radius + cx, (cTheta * -s + sTheta * c) * radius + cy);
      }
    };
    return ArcUtils2;
  }();
  var BezierUtils = function() {
    function BezierUtils2() {
    }
    BezierUtils2.curveLength = function(fromX, fromY, cpX, cpY, cpX2, cpY2, toX, toY) {
      var n = 10;
      var result = 0;
      var t = 0;
      var t2 = 0;
      var t3 = 0;
      var nt = 0;
      var nt2 = 0;
      var nt3 = 0;
      var x = 0;
      var y = 0;
      var dx = 0;
      var dy = 0;
      var prevX = fromX;
      var prevY = fromY;
      for (var i = 1; i <= n; ++i) {
        t = i / n;
        t2 = t * t;
        t3 = t2 * t;
        nt = 1 - t;
        nt2 = nt * nt;
        nt3 = nt2 * nt;
        x = nt3 * fromX + 3 * nt2 * t * cpX + 3 * nt * t2 * cpX2 + t3 * toX;
        y = nt3 * fromY + 3 * nt2 * t * cpY + 3 * nt * t2 * cpY2 + t3 * toY;
        dx = prevX - x;
        dy = prevY - y;
        prevX = x;
        prevY = y;
        result += Math.sqrt(dx * dx + dy * dy);
      }
      return result;
    };
    BezierUtils2.curveTo = function(cpX, cpY, cpX2, cpY2, toX, toY, points) {
      var fromX = points[points.length - 2];
      var fromY = points[points.length - 1];
      points.length -= 2;
      var n = GRAPHICS_CURVES._segmentsCount(BezierUtils2.curveLength(fromX, fromY, cpX, cpY, cpX2, cpY2, toX, toY));
      var dt = 0;
      var dt2 = 0;
      var dt3 = 0;
      var t2 = 0;
      var t3 = 0;
      points.push(fromX, fromY);
      for (var i = 1, j = 0; i <= n; ++i) {
        j = i / n;
        dt = 1 - j;
        dt2 = dt * dt;
        dt3 = dt2 * dt;
        t2 = j * j;
        t3 = t2 * j;
        points.push(dt3 * fromX + 3 * dt2 * j * cpX + 3 * dt * t2 * cpX2 + t3 * toX, dt3 * fromY + 3 * dt2 * j * cpY + 3 * dt * t2 * cpY2 + t3 * toY);
      }
    };
    return BezierUtils2;
  }();
  var QuadraticUtils = function() {
    function QuadraticUtils2() {
    }
    QuadraticUtils2.curveLength = function(fromX, fromY, cpX, cpY, toX, toY) {
      var ax = fromX - 2 * cpX + toX;
      var ay = fromY - 2 * cpY + toY;
      var bx = 2 * cpX - 2 * fromX;
      var by = 2 * cpY - 2 * fromY;
      var a = 4 * (ax * ax + ay * ay);
      var b = 4 * (ax * bx + ay * by);
      var c = bx * bx + by * by;
      var s = 2 * Math.sqrt(a + b + c);
      var a2 = Math.sqrt(a);
      var a32 = 2 * a * a2;
      var c2 = 2 * Math.sqrt(c);
      var ba = b / a2;
      return (a32 * s + a2 * b * (s - c2) + (4 * c * a - b * b) * Math.log((2 * a2 + ba + s) / (ba + c2))) / (4 * a32);
    };
    QuadraticUtils2.curveTo = function(cpX, cpY, toX, toY, points) {
      var fromX = points[points.length - 2];
      var fromY = points[points.length - 1];
      var n = GRAPHICS_CURVES._segmentsCount(QuadraticUtils2.curveLength(fromX, fromY, cpX, cpY, toX, toY));
      var xa = 0;
      var ya = 0;
      for (var i = 1; i <= n; ++i) {
        var j = i / n;
        xa = fromX + (cpX - fromX) * j;
        ya = fromY + (cpY - fromY) * j;
        points.push(xa + (cpX + (toX - cpX) * j - xa) * j, ya + (cpY + (toY - cpY) * j - ya) * j);
      }
    };
    return QuadraticUtils2;
  }();
  var BatchPart = function() {
    function BatchPart2() {
      this.reset();
    }
    BatchPart2.prototype.begin = function(style, startIndex, attribStart) {
      this.reset();
      this.style = style;
      this.start = startIndex;
      this.attribStart = attribStart;
    };
    BatchPart2.prototype.end = function(endIndex, endAttrib) {
      this.attribSize = endAttrib - this.attribStart;
      this.size = endIndex - this.start;
    };
    BatchPart2.prototype.reset = function() {
      this.style = null;
      this.size = 0;
      this.start = 0;
      this.attribStart = 0;
      this.attribSize = 0;
    };
    return BatchPart2;
  }();
  var _a;
  var FILL_COMMANDS = (_a = {}, _a[math.SHAPES.POLY] = buildPoly, _a[math.SHAPES.CIRC] = buildCircle, _a[math.SHAPES.ELIP] = buildCircle, _a[math.SHAPES.RECT] = buildRectangle, _a[math.SHAPES.RREC] = buildRoundedRectangle, _a);
  var BATCH_POOL = [];
  var DRAW_CALL_POOL = [];
  var index = {
    buildPoly,
    buildCircle,
    buildRectangle,
    buildRoundedRectangle,
    FILL_COMMANDS,
    BATCH_POOL,
    DRAW_CALL_POOL,
    buildLine,
    Star,
    ArcUtils,
    BezierUtils,
    QuadraticUtils,
    BatchPart
  };
  var GraphicsData = function() {
    function GraphicsData2(shape, fillStyle, lineStyle, matrix) {
      if (fillStyle === void 0) {
        fillStyle = null;
      }
      if (lineStyle === void 0) {
        lineStyle = null;
      }
      if (matrix === void 0) {
        matrix = null;
      }
      this.shape = shape;
      this.lineStyle = lineStyle;
      this.fillStyle = fillStyle;
      this.matrix = matrix;
      this.type = shape.type;
      this.points = [];
      this.holes = [];
    }
    GraphicsData2.prototype.clone = function() {
      return new GraphicsData2(this.shape, this.fillStyle, this.lineStyle, this.matrix);
    };
    GraphicsData2.prototype.destroy = function() {
      this.shape = null;
      this.holes.length = 0;
      this.holes = null;
      this.points.length = 0;
      this.points = null;
      this.lineStyle = null;
      this.fillStyle = null;
    };
    return GraphicsData2;
  }();
  var tmpPoint = new math.Point();
  var tmpBounds = new display.Bounds();
  var GraphicsGeometry = function(_super) {
    __extends(GraphicsGeometry2, _super);
    function GraphicsGeometry2() {
      var _this = _super.call(this) || this;
      _this.uvsFloat32 = null;
      _this.indicesUint16 = null;
      _this.points = [];
      _this.colors = [];
      _this.uvs = [];
      _this.indices = [];
      _this.textureIds = [];
      _this.graphicsData = [];
      _this.dirty = 0;
      _this.batchDirty = -1;
      _this.cacheDirty = -1;
      _this.clearDirty = 0;
      _this.drawCalls = [];
      _this.batches = [];
      _this.shapeIndex = 0;
      _this._bounds = new display.Bounds();
      _this.boundsDirty = -1;
      _this.boundsPadding = 0;
      _this.batchable = false;
      _this.indicesUint16 = null;
      _this.uvsFloat32 = null;
      _this.closePointEps = 1e-4;
      return _this;
    }
    Object.defineProperty(GraphicsGeometry2.prototype, "bounds", {
      get: function() {
        if (this.boundsDirty !== this.dirty) {
          this.boundsDirty = this.dirty;
          this.calculateBounds();
        }
        return this._bounds;
      },
      enumerable: false,
      configurable: true
    });
    GraphicsGeometry2.prototype.invalidate = function() {
      this.boundsDirty = -1;
      this.dirty++;
      this.batchDirty++;
      this.shapeIndex = 0;
      this.points.length = 0;
      this.colors.length = 0;
      this.uvs.length = 0;
      this.indices.length = 0;
      this.textureIds.length = 0;
      for (var i = 0; i < this.drawCalls.length; i++) {
        this.drawCalls[i].texArray.clear();
        DRAW_CALL_POOL.push(this.drawCalls[i]);
      }
      this.drawCalls.length = 0;
      for (var i = 0; i < this.batches.length; i++) {
        var batchPart = this.batches[i];
        batchPart.reset();
        BATCH_POOL.push(batchPart);
      }
      this.batches.length = 0;
    };
    GraphicsGeometry2.prototype.clear = function() {
      if (this.graphicsData.length > 0) {
        this.invalidate();
        this.clearDirty++;
        this.graphicsData.length = 0;
      }
      return this;
    };
    GraphicsGeometry2.prototype.drawShape = function(shape, fillStyle, lineStyle, matrix) {
      if (fillStyle === void 0) {
        fillStyle = null;
      }
      if (lineStyle === void 0) {
        lineStyle = null;
      }
      if (matrix === void 0) {
        matrix = null;
      }
      var data = new GraphicsData(shape, fillStyle, lineStyle, matrix);
      this.graphicsData.push(data);
      this.dirty++;
      return this;
    };
    GraphicsGeometry2.prototype.drawHole = function(shape, matrix) {
      if (matrix === void 0) {
        matrix = null;
      }
      if (!this.graphicsData.length) {
        return null;
      }
      var data = new GraphicsData(shape, null, null, matrix);
      var lastShape = this.graphicsData[this.graphicsData.length - 1];
      data.lineStyle = lastShape.lineStyle;
      lastShape.holes.push(data);
      this.dirty++;
      return this;
    };
    GraphicsGeometry2.prototype.destroy = function() {
      _super.prototype.destroy.call(this);
      for (var i = 0; i < this.graphicsData.length; ++i) {
        this.graphicsData[i].destroy();
      }
      this.points.length = 0;
      this.points = null;
      this.colors.length = 0;
      this.colors = null;
      this.uvs.length = 0;
      this.uvs = null;
      this.indices.length = 0;
      this.indices = null;
      this.indexBuffer.destroy();
      this.indexBuffer = null;
      this.graphicsData.length = 0;
      this.graphicsData = null;
      this.drawCalls.length = 0;
      this.drawCalls = null;
      this.batches.length = 0;
      this.batches = null;
      this._bounds = null;
    };
    GraphicsGeometry2.prototype.containsPoint = function(point) {
      var graphicsData = this.graphicsData;
      for (var i = 0; i < graphicsData.length; ++i) {
        var data = graphicsData[i];
        if (!data.fillStyle.visible) {
          continue;
        }
        if (data.shape) {
          if (data.matrix) {
            data.matrix.applyInverse(point, tmpPoint);
          } else {
            tmpPoint.copyFrom(point);
          }
          if (data.shape.contains(tmpPoint.x, tmpPoint.y)) {
            var hitHole = false;
            if (data.holes) {
              for (var i_1 = 0; i_1 < data.holes.length; i_1++) {
                var hole = data.holes[i_1];
                if (hole.shape.contains(tmpPoint.x, tmpPoint.y)) {
                  hitHole = true;
                  break;
                }
              }
            }
            if (!hitHole) {
              return true;
            }
          }
        }
      }
      return false;
    };
    GraphicsGeometry2.prototype.updateBatches = function(allow32Indices) {
      if (!this.graphicsData.length) {
        this.batchable = true;
        return;
      }
      if (!this.validateBatching()) {
        return;
      }
      this.cacheDirty = this.dirty;
      var uvs = this.uvs;
      var graphicsData = this.graphicsData;
      var batchPart = null;
      var currentStyle = null;
      if (this.batches.length > 0) {
        batchPart = this.batches[this.batches.length - 1];
        currentStyle = batchPart.style;
      }
      for (var i = this.shapeIndex; i < graphicsData.length; i++) {
        this.shapeIndex++;
        var data = graphicsData[i];
        var fillStyle = data.fillStyle;
        var lineStyle = data.lineStyle;
        var command = FILL_COMMANDS[data.type];
        command.build(data);
        if (data.matrix) {
          this.transformPoints(data.points, data.matrix);
        }
        for (var j = 0; j < 2; j++) {
          var style = j === 0 ? fillStyle : lineStyle;
          if (!style.visible) {
            continue;
          }
          var nextTexture = style.texture.baseTexture;
          var index_1 = this.indices.length;
          var attribIndex = this.points.length / 2;
          nextTexture.wrapMode = constants.WRAP_MODES.REPEAT;
          if (j === 0) {
            this.processFill(data);
          } else {
            this.processLine(data);
          }
          var size = this.points.length / 2 - attribIndex;
          if (size === 0) {
            continue;
          }
          if (batchPart && !this._compareStyles(currentStyle, style)) {
            batchPart.end(index_1, attribIndex);
            batchPart = null;
          }
          if (!batchPart) {
            batchPart = BATCH_POOL.pop() || new BatchPart();
            batchPart.begin(style, index_1, attribIndex);
            this.batches.push(batchPart);
            currentStyle = style;
          }
          this.addUvs(this.points, uvs, style.texture, attribIndex, size, style.matrix);
        }
      }
      var index2 = this.indices.length;
      var attrib = this.points.length / 2;
      if (batchPart) {
        batchPart.end(index2, attrib);
      }
      if (this.batches.length === 0) {
        this.batchable = true;
        return;
      }
      if (this.indicesUint16 && this.indices.length === this.indicesUint16.length) {
        this.indicesUint16.set(this.indices);
      } else {
        var need32 = attrib > 65535 && allow32Indices;
        this.indicesUint16 = need32 ? new Uint32Array(this.indices) : new Uint16Array(this.indices);
      }
      this.batchable = this.isBatchable();
      if (this.batchable) {
        this.packBatches();
      } else {
        this.buildDrawCalls();
      }
    };
    GraphicsGeometry2.prototype._compareStyles = function(styleA, styleB) {
      if (!styleA || !styleB) {
        return false;
      }
      if (styleA.texture.baseTexture !== styleB.texture.baseTexture) {
        return false;
      }
      if (styleA.color + styleA.alpha !== styleB.color + styleB.alpha) {
        return false;
      }
      if (!!styleA.native !== !!styleB.native) {
        return false;
      }
      return true;
    };
    GraphicsGeometry2.prototype.validateBatching = function() {
      if (this.dirty === this.cacheDirty || !this.graphicsData.length) {
        return false;
      }
      for (var i = 0, l = this.graphicsData.length; i < l; i++) {
        var data = this.graphicsData[i];
        var fill = data.fillStyle;
        var line = data.lineStyle;
        if (fill && !fill.texture.baseTexture.valid) {
          return false;
        }
        if (line && !line.texture.baseTexture.valid) {
          return false;
        }
      }
      return true;
    };
    GraphicsGeometry2.prototype.packBatches = function() {
      this.batchDirty++;
      this.uvsFloat32 = new Float32Array(this.uvs);
      var batches = this.batches;
      for (var i = 0, l = batches.length; i < l; i++) {
        var batch = batches[i];
        for (var j = 0; j < batch.size; j++) {
          var index2 = batch.start + j;
          this.indicesUint16[index2] = this.indicesUint16[index2] - batch.attribStart;
        }
      }
    };
    GraphicsGeometry2.prototype.isBatchable = function() {
      if (this.points.length > 65535 * 2) {
        return false;
      }
      var batches = this.batches;
      for (var i = 0; i < batches.length; i++) {
        if (batches[i].style.native) {
          return false;
        }
      }
      return this.points.length < GraphicsGeometry2.BATCHABLE_SIZE * 2;
    };
    GraphicsGeometry2.prototype.buildDrawCalls = function() {
      var TICK = ++core.BaseTexture._globalBatch;
      for (var i = 0; i < this.drawCalls.length; i++) {
        this.drawCalls[i].texArray.clear();
        DRAW_CALL_POOL.push(this.drawCalls[i]);
      }
      this.drawCalls.length = 0;
      var colors = this.colors;
      var textureIds = this.textureIds;
      var currentGroup = DRAW_CALL_POOL.pop();
      if (!currentGroup) {
        currentGroup = new core.BatchDrawCall();
        currentGroup.texArray = new core.BatchTextureArray();
      }
      currentGroup.texArray.count = 0;
      currentGroup.start = 0;
      currentGroup.size = 0;
      currentGroup.type = constants.DRAW_MODES.TRIANGLES;
      var textureCount = 0;
      var currentTexture = null;
      var textureId = 0;
      var native = false;
      var drawMode = constants.DRAW_MODES.TRIANGLES;
      var index2 = 0;
      this.drawCalls.push(currentGroup);
      for (var i = 0; i < this.batches.length; i++) {
        var data = this.batches[i];
        var MAX_TEXTURES = 8;
        var style = data.style;
        var nextTexture = style.texture.baseTexture;
        if (native !== !!style.native) {
          native = !!style.native;
          drawMode = native ? constants.DRAW_MODES.LINES : constants.DRAW_MODES.TRIANGLES;
          currentTexture = null;
          textureCount = MAX_TEXTURES;
          TICK++;
        }
        if (currentTexture !== nextTexture) {
          currentTexture = nextTexture;
          if (nextTexture._batchEnabled !== TICK) {
            if (textureCount === MAX_TEXTURES) {
              TICK++;
              textureCount = 0;
              if (currentGroup.size > 0) {
                currentGroup = DRAW_CALL_POOL.pop();
                if (!currentGroup) {
                  currentGroup = new core.BatchDrawCall();
                  currentGroup.texArray = new core.BatchTextureArray();
                }
                this.drawCalls.push(currentGroup);
              }
              currentGroup.start = index2;
              currentGroup.size = 0;
              currentGroup.texArray.count = 0;
              currentGroup.type = drawMode;
            }
            nextTexture.touched = 1;
            nextTexture._batchEnabled = TICK;
            nextTexture._batchLocation = textureCount;
            nextTexture.wrapMode = 10497;
            currentGroup.texArray.elements[currentGroup.texArray.count++] = nextTexture;
            textureCount++;
          }
        }
        currentGroup.size += data.size;
        index2 += data.size;
        textureId = nextTexture._batchLocation;
        this.addColors(colors, style.color, style.alpha, data.attribSize);
        this.addTextureIds(textureIds, textureId, data.attribSize);
      }
      core.BaseTexture._globalBatch = TICK;
      this.packAttributes();
    };
    GraphicsGeometry2.prototype.packAttributes = function() {
      var verts = this.points;
      var uvs = this.uvs;
      var colors = this.colors;
      var textureIds = this.textureIds;
      var glPoints = new ArrayBuffer(verts.length * 3 * 4);
      var f32 = new Float32Array(glPoints);
      var u32 = new Uint32Array(glPoints);
      var p = 0;
      for (var i = 0; i < verts.length / 2; i++) {
        f32[p++] = verts[i * 2];
        f32[p++] = verts[i * 2 + 1];
        f32[p++] = uvs[i * 2];
        f32[p++] = uvs[i * 2 + 1];
        u32[p++] = colors[i];
        f32[p++] = textureIds[i];
      }
      this._buffer.update(glPoints);
      this._indexBuffer.update(this.indicesUint16);
    };
    GraphicsGeometry2.prototype.processFill = function(data) {
      if (data.holes.length) {
        this.processHoles(data.holes);
        buildPoly.triangulate(data, this);
      } else {
        var command = FILL_COMMANDS[data.type];
        command.triangulate(data, this);
      }
    };
    GraphicsGeometry2.prototype.processLine = function(data) {
      buildLine(data, this);
      for (var i = 0; i < data.holes.length; i++) {
        buildLine(data.holes[i], this);
      }
    };
    GraphicsGeometry2.prototype.processHoles = function(holes) {
      for (var i = 0; i < holes.length; i++) {
        var hole = holes[i];
        var command = FILL_COMMANDS[hole.type];
        command.build(hole);
        if (hole.matrix) {
          this.transformPoints(hole.points, hole.matrix);
        }
      }
    };
    GraphicsGeometry2.prototype.calculateBounds = function() {
      var bounds = this._bounds;
      var sequenceBounds = tmpBounds;
      var curMatrix = math.Matrix.IDENTITY;
      this._bounds.clear();
      sequenceBounds.clear();
      for (var i = 0; i < this.graphicsData.length; i++) {
        var data = this.graphicsData[i];
        var shape = data.shape;
        var type = data.type;
        var lineStyle = data.lineStyle;
        var nextMatrix = data.matrix || math.Matrix.IDENTITY;
        var lineWidth = 0;
        if (lineStyle && lineStyle.visible) {
          var alignment = lineStyle.alignment;
          lineWidth = lineStyle.width;
          if (type === math.SHAPES.POLY) {
            lineWidth = lineWidth * (0.5 + Math.abs(0.5 - alignment));
          } else {
            lineWidth = lineWidth * Math.max(0, alignment);
          }
        }
        if (curMatrix !== nextMatrix) {
          if (!sequenceBounds.isEmpty()) {
            bounds.addBoundsMatrix(sequenceBounds, curMatrix);
            sequenceBounds.clear();
          }
          curMatrix = nextMatrix;
        }
        if (type === math.SHAPES.RECT || type === math.SHAPES.RREC) {
          var rect = shape;
          sequenceBounds.addFramePad(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height, lineWidth, lineWidth);
        } else if (type === math.SHAPES.CIRC) {
          var circle = shape;
          sequenceBounds.addFramePad(circle.x, circle.y, circle.x, circle.y, circle.radius + lineWidth, circle.radius + lineWidth);
        } else if (type === math.SHAPES.ELIP) {
          var ellipse = shape;
          sequenceBounds.addFramePad(ellipse.x, ellipse.y, ellipse.x, ellipse.y, ellipse.width + lineWidth, ellipse.height + lineWidth);
        } else {
          var poly = shape;
          bounds.addVerticesMatrix(curMatrix, poly.points, 0, poly.points.length, lineWidth, lineWidth);
        }
      }
      if (!sequenceBounds.isEmpty()) {
        bounds.addBoundsMatrix(sequenceBounds, curMatrix);
      }
      bounds.pad(this.boundsPadding, this.boundsPadding);
    };
    GraphicsGeometry2.prototype.transformPoints = function(points, matrix) {
      for (var i = 0; i < points.length / 2; i++) {
        var x = points[i * 2];
        var y = points[i * 2 + 1];
        points[i * 2] = matrix.a * x + matrix.c * y + matrix.tx;
        points[i * 2 + 1] = matrix.b * x + matrix.d * y + matrix.ty;
      }
    };
    GraphicsGeometry2.prototype.addColors = function(colors, color, alpha, size) {
      var rgb = (color >> 16) + (color & 65280) + ((color & 255) << 16);
      var rgba = utils.premultiplyTint(rgb, alpha);
      while (size-- > 0) {
        colors.push(rgba);
      }
    };
    GraphicsGeometry2.prototype.addTextureIds = function(textureIds, id, size) {
      while (size-- > 0) {
        textureIds.push(id);
      }
    };
    GraphicsGeometry2.prototype.addUvs = function(verts, uvs, texture, start, size, matrix) {
      if (matrix === void 0) {
        matrix = null;
      }
      var index2 = 0;
      var uvsStart = uvs.length;
      var frame = texture.frame;
      while (index2 < size) {
        var x = verts[(start + index2) * 2];
        var y = verts[(start + index2) * 2 + 1];
        if (matrix) {
          var nx = matrix.a * x + matrix.c * y + matrix.tx;
          y = matrix.b * x + matrix.d * y + matrix.ty;
          x = nx;
        }
        index2++;
        uvs.push(x / frame.width, y / frame.height);
      }
      var baseTexture = texture.baseTexture;
      if (frame.width < baseTexture.width || frame.height < baseTexture.height) {
        this.adjustUvs(uvs, texture, uvsStart, size);
      }
    };
    GraphicsGeometry2.prototype.adjustUvs = function(uvs, texture, start, size) {
      var baseTexture = texture.baseTexture;
      var eps = 1e-6;
      var finish = start + size * 2;
      var frame = texture.frame;
      var scaleX = frame.width / baseTexture.width;
      var scaleY = frame.height / baseTexture.height;
      var offsetX = frame.x / frame.width;
      var offsetY = frame.y / frame.height;
      var minX = Math.floor(uvs[start] + eps);
      var minY = Math.floor(uvs[start + 1] + eps);
      for (var i = start + 2; i < finish; i += 2) {
        minX = Math.min(minX, Math.floor(uvs[i] + eps));
        minY = Math.min(minY, Math.floor(uvs[i + 1] + eps));
      }
      offsetX -= minX;
      offsetY -= minY;
      for (var i = start; i < finish; i += 2) {
        uvs[i] = (uvs[i] + offsetX) * scaleX;
        uvs[i + 1] = (uvs[i + 1] + offsetY) * scaleY;
      }
    };
    GraphicsGeometry2.BATCHABLE_SIZE = 100;
    return GraphicsGeometry2;
  }(core.BatchGeometry);
  var LineStyle = function(_super) {
    __extends(LineStyle2, _super);
    function LineStyle2() {
      var _this = _super !== null && _super.apply(this, arguments) || this;
      _this.width = 0;
      _this.alignment = 0.5;
      _this.native = false;
      _this.cap = exports2.LINE_CAP.BUTT;
      _this.join = exports2.LINE_JOIN.MITER;
      _this.miterLimit = 10;
      return _this;
    }
    LineStyle2.prototype.clone = function() {
      var obj = new LineStyle2();
      obj.color = this.color;
      obj.alpha = this.alpha;
      obj.texture = this.texture;
      obj.matrix = this.matrix;
      obj.visible = this.visible;
      obj.width = this.width;
      obj.alignment = this.alignment;
      obj.native = this.native;
      obj.cap = this.cap;
      obj.join = this.join;
      obj.miterLimit = this.miterLimit;
      return obj;
    };
    LineStyle2.prototype.reset = function() {
      _super.prototype.reset.call(this);
      this.color = 0;
      this.alignment = 0.5;
      this.width = 0;
      this.native = false;
    };
    return LineStyle2;
  }(FillStyle);
  var temp = new Float32Array(3);
  var DEFAULT_SHADERS = {};
  var Graphics = function(_super) {
    __extends(Graphics2, _super);
    function Graphics2(geometry) {
      if (geometry === void 0) {
        geometry = null;
      }
      var _this = _super.call(this) || this;
      _this._geometry = geometry || new GraphicsGeometry();
      _this._geometry.refCount++;
      _this.shader = null;
      _this.state = core.State.for2d();
      _this._fillStyle = new FillStyle();
      _this._lineStyle = new LineStyle();
      _this._matrix = null;
      _this._holeMode = false;
      _this.currentPath = null;
      _this.batches = [];
      _this.batchTint = -1;
      _this.batchDirty = -1;
      _this.vertexData = null;
      _this.pluginName = "batch";
      _this._transformID = -1;
      _this.tint = 16777215;
      _this.blendMode = constants.BLEND_MODES.NORMAL;
      return _this;
    }
    Object.defineProperty(Graphics2.prototype, "geometry", {
      get: function() {
        return this._geometry;
      },
      enumerable: false,
      configurable: true
    });
    Graphics2.prototype.clone = function() {
      this.finishPoly();
      return new Graphics2(this._geometry);
    };
    Object.defineProperty(Graphics2.prototype, "blendMode", {
      get: function() {
        return this.state.blendMode;
      },
      set: function(value) {
        this.state.blendMode = value;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Graphics2.prototype, "tint", {
      get: function() {
        return this._tint;
      },
      set: function(value) {
        this._tint = value;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Graphics2.prototype, "fill", {
      get: function() {
        return this._fillStyle;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Graphics2.prototype, "line", {
      get: function() {
        return this._lineStyle;
      },
      enumerable: false,
      configurable: true
    });
    Graphics2.prototype.lineStyle = function(options) {
      if (options === void 0) {
        options = null;
      }
      if (typeof options === "number") {
        var args = arguments;
        options = {
          width: args[0] || 0,
          color: args[1] || 0,
          alpha: args[2] !== void 0 ? args[2] : 1,
          alignment: args[3] !== void 0 ? args[3] : 0.5,
          native: !!args[4]
        };
      }
      return this.lineTextureStyle(options);
    };
    Graphics2.prototype.lineTextureStyle = function(options) {
      if (typeof options === "number") {
        utils.deprecation("v5.2.0", "Please use object-based options for Graphics#lineTextureStyle");
        var _a2 = arguments, width = _a2[0], texture = _a2[1], color = _a2[2], alpha = _a2[3], matrix = _a2[4], alignment = _a2[5], native = _a2[6];
        options = {width, texture, color, alpha, matrix, alignment, native};
        Object.keys(options).forEach(function(key) {
          return options[key] === void 0 && delete options[key];
        });
      }
      options = Object.assign({
        width: 0,
        texture: core.Texture.WHITE,
        color: options && options.texture ? 16777215 : 0,
        alpha: 1,
        matrix: null,
        alignment: 0.5,
        native: false,
        cap: exports2.LINE_CAP.BUTT,
        join: exports2.LINE_JOIN.MITER,
        miterLimit: 10
      }, options);
      if (this.currentPath) {
        this.startPoly();
      }
      var visible = options.width > 0 && options.alpha > 0;
      if (!visible) {
        this._lineStyle.reset();
      } else {
        if (options.matrix) {
          options.matrix = options.matrix.clone();
          options.matrix.invert();
        }
        Object.assign(this._lineStyle, {visible}, options);
      }
      return this;
    };
    Graphics2.prototype.startPoly = function() {
      if (this.currentPath) {
        var points = this.currentPath.points;
        var len = this.currentPath.points.length;
        if (len > 2) {
          this.drawShape(this.currentPath);
          this.currentPath = new math.Polygon();
          this.currentPath.closeStroke = false;
          this.currentPath.points.push(points[len - 2], points[len - 1]);
        }
      } else {
        this.currentPath = new math.Polygon();
        this.currentPath.closeStroke = false;
      }
    };
    Graphics2.prototype.finishPoly = function() {
      if (this.currentPath) {
        if (this.currentPath.points.length > 2) {
          this.drawShape(this.currentPath);
          this.currentPath = null;
        } else {
          this.currentPath.points.length = 0;
        }
      }
    };
    Graphics2.prototype.moveTo = function(x, y) {
      this.startPoly();
      this.currentPath.points[0] = x;
      this.currentPath.points[1] = y;
      return this;
    };
    Graphics2.prototype.lineTo = function(x, y) {
      if (!this.currentPath) {
        this.moveTo(0, 0);
      }
      var points = this.currentPath.points;
      var fromX = points[points.length - 2];
      var fromY = points[points.length - 1];
      if (fromX !== x || fromY !== y) {
        points.push(x, y);
      }
      return this;
    };
    Graphics2.prototype._initCurve = function(x, y) {
      if (x === void 0) {
        x = 0;
      }
      if (y === void 0) {
        y = 0;
      }
      if (this.currentPath) {
        if (this.currentPath.points.length === 0) {
          this.currentPath.points = [x, y];
        }
      } else {
        this.moveTo(x, y);
      }
    };
    Graphics2.prototype.quadraticCurveTo = function(cpX, cpY, toX, toY) {
      this._initCurve();
      var points = this.currentPath.points;
      if (points.length === 0) {
        this.moveTo(0, 0);
      }
      QuadraticUtils.curveTo(cpX, cpY, toX, toY, points);
      return this;
    };
    Graphics2.prototype.bezierCurveTo = function(cpX, cpY, cpX2, cpY2, toX, toY) {
      this._initCurve();
      BezierUtils.curveTo(cpX, cpY, cpX2, cpY2, toX, toY, this.currentPath.points);
      return this;
    };
    Graphics2.prototype.arcTo = function(x1, y1, x2, y2, radius) {
      this._initCurve(x1, y1);
      var points = this.currentPath.points;
      var result = ArcUtils.curveTo(x1, y1, x2, y2, radius, points);
      if (result) {
        var cx = result.cx, cy = result.cy, radius_1 = result.radius, startAngle = result.startAngle, endAngle = result.endAngle, anticlockwise = result.anticlockwise;
        this.arc(cx, cy, radius_1, startAngle, endAngle, anticlockwise);
      }
      return this;
    };
    Graphics2.prototype.arc = function(cx, cy, radius, startAngle, endAngle, anticlockwise) {
      if (anticlockwise === void 0) {
        anticlockwise = false;
      }
      if (startAngle === endAngle) {
        return this;
      }
      if (!anticlockwise && endAngle <= startAngle) {
        endAngle += math.PI_2;
      } else if (anticlockwise && startAngle <= endAngle) {
        startAngle += math.PI_2;
      }
      var sweep = endAngle - startAngle;
      if (sweep === 0) {
        return this;
      }
      var startX = cx + Math.cos(startAngle) * radius;
      var startY = cy + Math.sin(startAngle) * radius;
      var eps = this._geometry.closePointEps;
      var points = this.currentPath ? this.currentPath.points : null;
      if (points) {
        var xDiff = Math.abs(points[points.length - 2] - startX);
        var yDiff = Math.abs(points[points.length - 1] - startY);
        if (xDiff < eps && yDiff < eps)
          ;
        else {
          points.push(startX, startY);
        }
      } else {
        this.moveTo(startX, startY);
        points = this.currentPath.points;
      }
      ArcUtils.arc(startX, startY, cx, cy, radius, startAngle, endAngle, anticlockwise, points);
      return this;
    };
    Graphics2.prototype.beginFill = function(color, alpha) {
      if (color === void 0) {
        color = 0;
      }
      if (alpha === void 0) {
        alpha = 1;
      }
      return this.beginTextureFill({texture: core.Texture.WHITE, color, alpha});
    };
    Graphics2.prototype.beginTextureFill = function(options) {
      if (options instanceof core.Texture) {
        utils.deprecation("v5.2.0", "Please use object-based options for Graphics#beginTextureFill");
        var _a2 = arguments, texture = _a2[0], color = _a2[1], alpha = _a2[2], matrix = _a2[3];
        options = {texture, color, alpha, matrix};
        Object.keys(options).forEach(function(key) {
          return options[key] === void 0 && delete options[key];
        });
      }
      options = Object.assign({
        texture: core.Texture.WHITE,
        color: 16777215,
        alpha: 1,
        matrix: null
      }, options);
      if (this.currentPath) {
        this.startPoly();
      }
      var visible = options.alpha > 0;
      if (!visible) {
        this._fillStyle.reset();
      } else {
        if (options.matrix) {
          options.matrix = options.matrix.clone();
          options.matrix.invert();
        }
        Object.assign(this._fillStyle, {visible}, options);
      }
      return this;
    };
    Graphics2.prototype.endFill = function() {
      this.finishPoly();
      this._fillStyle.reset();
      return this;
    };
    Graphics2.prototype.drawRect = function(x, y, width, height) {
      return this.drawShape(new math.Rectangle(x, y, width, height));
    };
    Graphics2.prototype.drawRoundedRect = function(x, y, width, height, radius) {
      return this.drawShape(new math.RoundedRectangle(x, y, width, height, radius));
    };
    Graphics2.prototype.drawCircle = function(x, y, radius) {
      return this.drawShape(new math.Circle(x, y, radius));
    };
    Graphics2.prototype.drawEllipse = function(x, y, width, height) {
      return this.drawShape(new math.Ellipse(x, y, width, height));
    };
    Graphics2.prototype.drawPolygon = function() {
      var arguments$1 = arguments;
      var path = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        path[_i] = arguments$1[_i];
      }
      var points;
      var closeStroke = true;
      var poly = path[0];
      if (poly.points) {
        closeStroke = poly.closeStroke;
        points = poly.points;
      } else if (Array.isArray(path[0])) {
        points = path[0];
      } else {
        points = path;
      }
      var shape = new math.Polygon(points);
      shape.closeStroke = closeStroke;
      this.drawShape(shape);
      return this;
    };
    Graphics2.prototype.drawShape = function(shape) {
      if (!this._holeMode) {
        this._geometry.drawShape(shape, this._fillStyle.clone(), this._lineStyle.clone(), this._matrix);
      } else {
        this._geometry.drawHole(shape, this._matrix);
      }
      return this;
    };
    Graphics2.prototype.drawStar = function(x, y, points, radius, innerRadius, rotation) {
      if (rotation === void 0) {
        rotation = 0;
      }
      return this.drawPolygon(new Star(x, y, points, radius, innerRadius, rotation));
    };
    Graphics2.prototype.clear = function() {
      this._geometry.clear();
      this._lineStyle.reset();
      this._fillStyle.reset();
      this._boundsID++;
      this._matrix = null;
      this._holeMode = false;
      this.currentPath = null;
      return this;
    };
    Graphics2.prototype.isFastRect = function() {
      var data = this._geometry.graphicsData;
      return data.length === 1 && data[0].shape.type === math.SHAPES.RECT && !(data[0].lineStyle.visible && data[0].lineStyle.width);
    };
    Graphics2.prototype._render = function(renderer) {
      this.finishPoly();
      var geometry = this._geometry;
      var hasuint32 = renderer.context.supports.uint32Indices;
      geometry.updateBatches(hasuint32);
      if (geometry.batchable) {
        if (this.batchDirty !== geometry.batchDirty) {
          this._populateBatches();
        }
        this._renderBatched(renderer);
      } else {
        renderer.batch.flush();
        this._renderDirect(renderer);
      }
    };
    Graphics2.prototype._populateBatches = function() {
      var geometry = this._geometry;
      var blendMode = this.blendMode;
      var len = geometry.batches.length;
      this.batchTint = -1;
      this._transformID = -1;
      this.batchDirty = geometry.batchDirty;
      this.batches.length = len;
      this.vertexData = new Float32Array(geometry.points);
      for (var i = 0; i < len; i++) {
        var gI = geometry.batches[i];
        var color = gI.style.color;
        var vertexData = new Float32Array(this.vertexData.buffer, gI.attribStart * 4 * 2, gI.attribSize * 2);
        var uvs = new Float32Array(geometry.uvsFloat32.buffer, gI.attribStart * 4 * 2, gI.attribSize * 2);
        var indices = new Uint16Array(geometry.indicesUint16.buffer, gI.start * 2, gI.size);
        var batch = {
          vertexData,
          blendMode,
          indices,
          uvs,
          _batchRGB: utils.hex2rgb(color),
          _tintRGB: color,
          _texture: gI.style.texture,
          alpha: gI.style.alpha,
          worldAlpha: 1
        };
        this.batches[i] = batch;
      }
    };
    Graphics2.prototype._renderBatched = function(renderer) {
      if (!this.batches.length) {
        return;
      }
      renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);
      this.calculateVertices();
      this.calculateTints();
      for (var i = 0, l = this.batches.length; i < l; i++) {
        var batch = this.batches[i];
        batch.worldAlpha = this.worldAlpha * batch.alpha;
        renderer.plugins[this.pluginName].render(batch);
      }
    };
    Graphics2.prototype._renderDirect = function(renderer) {
      var shader = this._resolveDirectShader(renderer);
      var geometry = this._geometry;
      var tint = this.tint;
      var worldAlpha = this.worldAlpha;
      var uniforms = shader.uniforms;
      var drawCalls = geometry.drawCalls;
      uniforms.translationMatrix = this.transform.worldTransform;
      uniforms.tint[0] = (tint >> 16 & 255) / 255 * worldAlpha;
      uniforms.tint[1] = (tint >> 8 & 255) / 255 * worldAlpha;
      uniforms.tint[2] = (tint & 255) / 255 * worldAlpha;
      uniforms.tint[3] = worldAlpha;
      renderer.shader.bind(shader);
      renderer.geometry.bind(geometry, shader);
      renderer.state.set(this.state);
      for (var i = 0, l = drawCalls.length; i < l; i++) {
        this._renderDrawCallDirect(renderer, geometry.drawCalls[i]);
      }
    };
    Graphics2.prototype._renderDrawCallDirect = function(renderer, drawCall) {
      var texArray = drawCall.texArray, type = drawCall.type, size = drawCall.size, start = drawCall.start;
      var groupTextureCount = texArray.count;
      for (var j = 0; j < groupTextureCount; j++) {
        renderer.texture.bind(texArray.elements[j], j);
      }
      renderer.geometry.draw(type, size, start);
    };
    Graphics2.prototype._resolveDirectShader = function(renderer) {
      var shader = this.shader;
      var pluginName = this.pluginName;
      if (!shader) {
        if (!DEFAULT_SHADERS[pluginName]) {
          var MAX_TEXTURES = renderer.plugins.batch.MAX_TEXTURES;
          var sampleValues = new Int32Array(MAX_TEXTURES);
          for (var i = 0; i < MAX_TEXTURES; i++) {
            sampleValues[i] = i;
          }
          var uniforms = {
            tint: new Float32Array([1, 1, 1, 1]),
            translationMatrix: new math.Matrix(),
            default: core.UniformGroup.from({uSamplers: sampleValues}, true)
          };
          var program = renderer.plugins[pluginName]._shader.program;
          DEFAULT_SHADERS[pluginName] = new core.Shader(program, uniforms);
        }
        shader = DEFAULT_SHADERS[pluginName];
      }
      return shader;
    };
    Graphics2.prototype._calculateBounds = function() {
      this.finishPoly();
      var geometry = this._geometry;
      if (!geometry.graphicsData.length) {
        return;
      }
      var _a2 = geometry.bounds, minX = _a2.minX, minY = _a2.minY, maxX = _a2.maxX, maxY = _a2.maxY;
      this._bounds.addFrame(this.transform, minX, minY, maxX, maxY);
    };
    Graphics2.prototype.containsPoint = function(point) {
      this.worldTransform.applyInverse(point, Graphics2._TEMP_POINT);
      return this._geometry.containsPoint(Graphics2._TEMP_POINT);
    };
    Graphics2.prototype.calculateTints = function() {
      if (this.batchTint !== this.tint) {
        this.batchTint = this.tint;
        var tintRGB = utils.hex2rgb(this.tint, temp);
        for (var i = 0; i < this.batches.length; i++) {
          var batch = this.batches[i];
          var batchTint = batch._batchRGB;
          var r = tintRGB[0] * batchTint[0] * 255;
          var g = tintRGB[1] * batchTint[1] * 255;
          var b = tintRGB[2] * batchTint[2] * 255;
          var color = (r << 16) + (g << 8) + (b | 0);
          batch._tintRGB = (color >> 16) + (color & 65280) + ((color & 255) << 16);
        }
      }
    };
    Graphics2.prototype.calculateVertices = function() {
      var wtID = this.transform._worldID;
      if (this._transformID === wtID) {
        return;
      }
      this._transformID = wtID;
      var wt = this.transform.worldTransform;
      var a = wt.a;
      var b = wt.b;
      var c = wt.c;
      var d = wt.d;
      var tx = wt.tx;
      var ty = wt.ty;
      var data = this._geometry.points;
      var vertexData = this.vertexData;
      var count = 0;
      for (var i = 0; i < data.length; i += 2) {
        var x = data[i];
        var y = data[i + 1];
        vertexData[count++] = a * x + c * y + tx;
        vertexData[count++] = d * y + b * x + ty;
      }
    };
    Graphics2.prototype.closePath = function() {
      var currentPath = this.currentPath;
      if (currentPath) {
        currentPath.closeStroke = true;
      }
      return this;
    };
    Graphics2.prototype.setMatrix = function(matrix) {
      this._matrix = matrix;
      return this;
    };
    Graphics2.prototype.beginHole = function() {
      this.finishPoly();
      this._holeMode = true;
      return this;
    };
    Graphics2.prototype.endHole = function() {
      this.finishPoly();
      this._holeMode = false;
      return this;
    };
    Graphics2.prototype.destroy = function(options) {
      this._geometry.refCount--;
      if (this._geometry.refCount === 0) {
        this._geometry.dispose();
      }
      this._matrix = null;
      this.currentPath = null;
      this._lineStyle.destroy();
      this._lineStyle = null;
      this._fillStyle.destroy();
      this._fillStyle = null;
      this._geometry = null;
      this.shader = null;
      this.vertexData = null;
      this.batches.length = 0;
      this.batches = null;
      _super.prototype.destroy.call(this, options);
    };
    Graphics2._TEMP_POINT = new math.Point();
    return Graphics2;
  }(display.Container);
  exports2.FillStyle = FillStyle;
  exports2.GRAPHICS_CURVES = GRAPHICS_CURVES;
  exports2.Graphics = Graphics;
  exports2.GraphicsData = GraphicsData;
  exports2.GraphicsGeometry = GraphicsGeometry;
  exports2.LineStyle = LineStyle;
  exports2.graphicsUtils = index;
});

// node_modules/@pixi/sprite/lib/sprite.js
var require_sprite = __commonJS((exports2) => {
  /*!
   * @pixi/sprite - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/sprite is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var constants = require_constants();
  var core = require_core();
  var display = require_display();
  var math = require_math();
  var settings = require_settings();
  var utils = require_utils();
  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0
  
  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.
  
  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || {__proto__: []} instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) {
        if (b2.hasOwnProperty(p)) {
          d2[p] = b2[p];
        }
      }
    };
    return extendStatics(d, b);
  };
  function __extends(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  var tempPoint = new math.Point();
  var indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
  var Sprite = function(_super) {
    __extends(Sprite2, _super);
    function Sprite2(texture) {
      var _this = _super.call(this) || this;
      _this._anchor = new math.ObservablePoint(_this._onAnchorUpdate, _this, texture ? texture.defaultAnchor.x : 0, texture ? texture.defaultAnchor.y : 0);
      _this._texture = null;
      _this._width = 0;
      _this._height = 0;
      _this._tint = null;
      _this._tintRGB = null;
      _this.tint = 16777215;
      _this.blendMode = constants.BLEND_MODES.NORMAL;
      _this._cachedTint = 16777215;
      _this.uvs = null;
      _this.texture = texture || core.Texture.EMPTY;
      _this.vertexData = new Float32Array(8);
      _this.vertexTrimmedData = null;
      _this._transformID = -1;
      _this._textureID = -1;
      _this._transformTrimmedID = -1;
      _this._textureTrimmedID = -1;
      _this.indices = indices;
      _this.pluginName = "batch";
      _this.isSprite = true;
      _this._roundPixels = settings.settings.ROUND_PIXELS;
      return _this;
    }
    Sprite2.prototype._onTextureUpdate = function() {
      this._textureID = -1;
      this._textureTrimmedID = -1;
      this._cachedTint = 16777215;
      if (this._width) {
        this.scale.x = utils.sign(this.scale.x) * this._width / this._texture.orig.width;
      }
      if (this._height) {
        this.scale.y = utils.sign(this.scale.y) * this._height / this._texture.orig.height;
      }
    };
    Sprite2.prototype._onAnchorUpdate = function() {
      this._transformID = -1;
      this._transformTrimmedID = -1;
    };
    Sprite2.prototype.calculateVertices = function() {
      var texture = this._texture;
      if (this._transformID === this.transform._worldID && this._textureID === texture._updateID) {
        return;
      }
      if (this._textureID !== texture._updateID) {
        this.uvs = this._texture._uvs.uvsFloat32;
      }
      this._transformID = this.transform._worldID;
      this._textureID = texture._updateID;
      var wt = this.transform.worldTransform;
      var a = wt.a;
      var b = wt.b;
      var c = wt.c;
      var d = wt.d;
      var tx = wt.tx;
      var ty = wt.ty;
      var vertexData = this.vertexData;
      var trim = texture.trim;
      var orig = texture.orig;
      var anchor = this._anchor;
      var w0 = 0;
      var w1 = 0;
      var h0 = 0;
      var h1 = 0;
      if (trim) {
        w1 = trim.x - anchor._x * orig.width;
        w0 = w1 + trim.width;
        h1 = trim.y - anchor._y * orig.height;
        h0 = h1 + trim.height;
      } else {
        w1 = -anchor._x * orig.width;
        w0 = w1 + orig.width;
        h1 = -anchor._y * orig.height;
        h0 = h1 + orig.height;
      }
      vertexData[0] = a * w1 + c * h1 + tx;
      vertexData[1] = d * h1 + b * w1 + ty;
      vertexData[2] = a * w0 + c * h1 + tx;
      vertexData[3] = d * h1 + b * w0 + ty;
      vertexData[4] = a * w0 + c * h0 + tx;
      vertexData[5] = d * h0 + b * w0 + ty;
      vertexData[6] = a * w1 + c * h0 + tx;
      vertexData[7] = d * h0 + b * w1 + ty;
      if (this._roundPixels) {
        var resolution = settings.settings.RESOLUTION;
        for (var i = 0; i < vertexData.length; ++i) {
          vertexData[i] = Math.round((vertexData[i] * resolution | 0) / resolution);
        }
      }
    };
    Sprite2.prototype.calculateTrimmedVertices = function() {
      if (!this.vertexTrimmedData) {
        this.vertexTrimmedData = new Float32Array(8);
      } else if (this._transformTrimmedID === this.transform._worldID && this._textureTrimmedID === this._texture._updateID) {
        return;
      }
      this._transformTrimmedID = this.transform._worldID;
      this._textureTrimmedID = this._texture._updateID;
      var texture = this._texture;
      var vertexData = this.vertexTrimmedData;
      var orig = texture.orig;
      var anchor = this._anchor;
      var wt = this.transform.worldTransform;
      var a = wt.a;
      var b = wt.b;
      var c = wt.c;
      var d = wt.d;
      var tx = wt.tx;
      var ty = wt.ty;
      var w1 = -anchor._x * orig.width;
      var w0 = w1 + orig.width;
      var h1 = -anchor._y * orig.height;
      var h0 = h1 + orig.height;
      vertexData[0] = a * w1 + c * h1 + tx;
      vertexData[1] = d * h1 + b * w1 + ty;
      vertexData[2] = a * w0 + c * h1 + tx;
      vertexData[3] = d * h1 + b * w0 + ty;
      vertexData[4] = a * w0 + c * h0 + tx;
      vertexData[5] = d * h0 + b * w0 + ty;
      vertexData[6] = a * w1 + c * h0 + tx;
      vertexData[7] = d * h0 + b * w1 + ty;
    };
    Sprite2.prototype._render = function(renderer) {
      this.calculateVertices();
      renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);
      renderer.plugins[this.pluginName].render(this);
    };
    Sprite2.prototype._calculateBounds = function() {
      var trim = this._texture.trim;
      var orig = this._texture.orig;
      if (!trim || trim.width === orig.width && trim.height === orig.height) {
        this.calculateVertices();
        this._bounds.addQuad(this.vertexData);
      } else {
        this.calculateTrimmedVertices();
        this._bounds.addQuad(this.vertexTrimmedData);
      }
    };
    Sprite2.prototype.getLocalBounds = function(rect) {
      if (this.children.length === 0) {
        this._bounds.minX = this._texture.orig.width * -this._anchor._x;
        this._bounds.minY = this._texture.orig.height * -this._anchor._y;
        this._bounds.maxX = this._texture.orig.width * (1 - this._anchor._x);
        this._bounds.maxY = this._texture.orig.height * (1 - this._anchor._y);
        if (!rect) {
          if (!this._localBoundsRect) {
            this._localBoundsRect = new math.Rectangle();
          }
          rect = this._localBoundsRect;
        }
        return this._bounds.getRectangle(rect);
      }
      return _super.prototype.getLocalBounds.call(this, rect);
    };
    Sprite2.prototype.containsPoint = function(point) {
      this.worldTransform.applyInverse(point, tempPoint);
      var width = this._texture.orig.width;
      var height = this._texture.orig.height;
      var x1 = -width * this.anchor.x;
      var y1 = 0;
      if (tempPoint.x >= x1 && tempPoint.x < x1 + width) {
        y1 = -height * this.anchor.y;
        if (tempPoint.y >= y1 && tempPoint.y < y1 + height) {
          return true;
        }
      }
      return false;
    };
    Sprite2.prototype.destroy = function(options) {
      _super.prototype.destroy.call(this, options);
      this._texture.off("update", this._onTextureUpdate, this);
      this._anchor = null;
      var destroyTexture = typeof options === "boolean" ? options : options && options.texture;
      if (destroyTexture) {
        var destroyBaseTexture = typeof options === "boolean" ? options : options && options.baseTexture;
        this._texture.destroy(!!destroyBaseTexture);
      }
      this._texture = null;
    };
    Sprite2.from = function(source, options) {
      var texture = source instanceof core.Texture ? source : core.Texture.from(source, options);
      return new Sprite2(texture);
    };
    Object.defineProperty(Sprite2.prototype, "roundPixels", {
      get: function() {
        return this._roundPixels;
      },
      set: function(value) {
        if (this._roundPixels !== value) {
          this._transformID = -1;
        }
        this._roundPixels = value;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Sprite2.prototype, "width", {
      get: function() {
        return Math.abs(this.scale.x) * this._texture.orig.width;
      },
      set: function(value) {
        var s = utils.sign(this.scale.x) || 1;
        this.scale.x = s * value / this._texture.orig.width;
        this._width = value;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Sprite2.prototype, "height", {
      get: function() {
        return Math.abs(this.scale.y) * this._texture.orig.height;
      },
      set: function(value) {
        var s = utils.sign(this.scale.y) || 1;
        this.scale.y = s * value / this._texture.orig.height;
        this._height = value;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Sprite2.prototype, "anchor", {
      get: function() {
        return this._anchor;
      },
      set: function(value) {
        this._anchor.copyFrom(value);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Sprite2.prototype, "tint", {
      get: function() {
        return this._tint;
      },
      set: function(value) {
        this._tint = value;
        this._tintRGB = (value >> 16) + (value & 65280) + ((value & 255) << 16);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Sprite2.prototype, "texture", {
      get: function() {
        return this._texture;
      },
      set: function(value) {
        if (this._texture === value) {
          return;
        }
        if (this._texture) {
          this._texture.off("update", this._onTextureUpdate, this);
        }
        this._texture = value || core.Texture.EMPTY;
        this._cachedTint = 16777215;
        this._textureID = -1;
        this._textureTrimmedID = -1;
        if (value) {
          if (value.baseTexture.valid) {
            this._onTextureUpdate();
          } else {
            value.once("update", this._onTextureUpdate, this);
          }
        }
      },
      enumerable: false,
      configurable: true
    });
    return Sprite2;
  }(display.Container);
  exports2.Sprite = Sprite;
});

// node_modules/@pixi/text/lib/text.js
var require_text = __commonJS((exports2) => {
  /*!
   * @pixi/text - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/text is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var sprite = require_sprite();
  var core = require_core();
  var settings = require_settings();
  var math = require_math();
  var utils = require_utils();
  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0
  
  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.
  
  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || {__proto__: []} instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) {
        if (b2.hasOwnProperty(p)) {
          d2[p] = b2[p];
        }
      }
    };
    return extendStatics(d, b);
  };
  function __extends(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  (function(TEXT_GRADIENT) {
    TEXT_GRADIENT[TEXT_GRADIENT["LINEAR_VERTICAL"] = 0] = "LINEAR_VERTICAL";
    TEXT_GRADIENT[TEXT_GRADIENT["LINEAR_HORIZONTAL"] = 1] = "LINEAR_HORIZONTAL";
  })(exports2.TEXT_GRADIENT || (exports2.TEXT_GRADIENT = {}));
  var defaultStyle = {
    align: "left",
    breakWords: false,
    dropShadow: false,
    dropShadowAlpha: 1,
    dropShadowAngle: Math.PI / 6,
    dropShadowBlur: 0,
    dropShadowColor: "black",
    dropShadowDistance: 5,
    fill: "black",
    fillGradientType: exports2.TEXT_GRADIENT.LINEAR_VERTICAL,
    fillGradientStops: [],
    fontFamily: "Arial",
    fontSize: 26,
    fontStyle: "normal",
    fontVariant: "normal",
    fontWeight: "normal",
    letterSpacing: 0,
    lineHeight: 0,
    lineJoin: "miter",
    miterLimit: 10,
    padding: 0,
    stroke: "black",
    strokeThickness: 0,
    textBaseline: "alphabetic",
    trim: false,
    whiteSpace: "pre",
    wordWrap: false,
    wordWrapWidth: 100,
    leading: 0
  };
  var genericFontFamilies = [
    "serif",
    "sans-serif",
    "monospace",
    "cursive",
    "fantasy",
    "system-ui"
  ];
  var TextStyle = function() {
    function TextStyle2(style) {
      this.styleID = 0;
      this.reset();
      deepCopyProperties(this, style, style);
    }
    TextStyle2.prototype.clone = function() {
      var clonedProperties = {};
      deepCopyProperties(clonedProperties, this, defaultStyle);
      return new TextStyle2(clonedProperties);
    };
    TextStyle2.prototype.reset = function() {
      deepCopyProperties(this, defaultStyle, defaultStyle);
    };
    Object.defineProperty(TextStyle2.prototype, "align", {
      get: function() {
        return this._align;
      },
      set: function(align) {
        if (this._align !== align) {
          this._align = align;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "breakWords", {
      get: function() {
        return this._breakWords;
      },
      set: function(breakWords) {
        if (this._breakWords !== breakWords) {
          this._breakWords = breakWords;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "dropShadow", {
      get: function() {
        return this._dropShadow;
      },
      set: function(dropShadow) {
        if (this._dropShadow !== dropShadow) {
          this._dropShadow = dropShadow;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "dropShadowAlpha", {
      get: function() {
        return this._dropShadowAlpha;
      },
      set: function(dropShadowAlpha) {
        if (this._dropShadowAlpha !== dropShadowAlpha) {
          this._dropShadowAlpha = dropShadowAlpha;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "dropShadowAngle", {
      get: function() {
        return this._dropShadowAngle;
      },
      set: function(dropShadowAngle) {
        if (this._dropShadowAngle !== dropShadowAngle) {
          this._dropShadowAngle = dropShadowAngle;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "dropShadowBlur", {
      get: function() {
        return this._dropShadowBlur;
      },
      set: function(dropShadowBlur) {
        if (this._dropShadowBlur !== dropShadowBlur) {
          this._dropShadowBlur = dropShadowBlur;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "dropShadowColor", {
      get: function() {
        return this._dropShadowColor;
      },
      set: function(dropShadowColor) {
        var outputColor = getColor(dropShadowColor);
        if (this._dropShadowColor !== outputColor) {
          this._dropShadowColor = outputColor;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "dropShadowDistance", {
      get: function() {
        return this._dropShadowDistance;
      },
      set: function(dropShadowDistance) {
        if (this._dropShadowDistance !== dropShadowDistance) {
          this._dropShadowDistance = dropShadowDistance;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "fill", {
      get: function() {
        return this._fill;
      },
      set: function(fill) {
        var outputColor = getColor(fill);
        if (this._fill !== outputColor) {
          this._fill = outputColor;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "fillGradientType", {
      get: function() {
        return this._fillGradientType;
      },
      set: function(fillGradientType) {
        if (this._fillGradientType !== fillGradientType) {
          this._fillGradientType = fillGradientType;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "fillGradientStops", {
      get: function() {
        return this._fillGradientStops;
      },
      set: function(fillGradientStops) {
        if (!areArraysEqual(this._fillGradientStops, fillGradientStops)) {
          this._fillGradientStops = fillGradientStops;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "fontFamily", {
      get: function() {
        return this._fontFamily;
      },
      set: function(fontFamily) {
        if (this.fontFamily !== fontFamily) {
          this._fontFamily = fontFamily;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "fontSize", {
      get: function() {
        return this._fontSize;
      },
      set: function(fontSize) {
        if (this._fontSize !== fontSize) {
          this._fontSize = fontSize;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "fontStyle", {
      get: function() {
        return this._fontStyle;
      },
      set: function(fontStyle) {
        if (this._fontStyle !== fontStyle) {
          this._fontStyle = fontStyle;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "fontVariant", {
      get: function() {
        return this._fontVariant;
      },
      set: function(fontVariant) {
        if (this._fontVariant !== fontVariant) {
          this._fontVariant = fontVariant;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "fontWeight", {
      get: function() {
        return this._fontWeight;
      },
      set: function(fontWeight) {
        if (this._fontWeight !== fontWeight) {
          this._fontWeight = fontWeight;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "letterSpacing", {
      get: function() {
        return this._letterSpacing;
      },
      set: function(letterSpacing) {
        if (this._letterSpacing !== letterSpacing) {
          this._letterSpacing = letterSpacing;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "lineHeight", {
      get: function() {
        return this._lineHeight;
      },
      set: function(lineHeight) {
        if (this._lineHeight !== lineHeight) {
          this._lineHeight = lineHeight;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "leading", {
      get: function() {
        return this._leading;
      },
      set: function(leading) {
        if (this._leading !== leading) {
          this._leading = leading;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "lineJoin", {
      get: function() {
        return this._lineJoin;
      },
      set: function(lineJoin) {
        if (this._lineJoin !== lineJoin) {
          this._lineJoin = lineJoin;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "miterLimit", {
      get: function() {
        return this._miterLimit;
      },
      set: function(miterLimit) {
        if (this._miterLimit !== miterLimit) {
          this._miterLimit = miterLimit;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "padding", {
      get: function() {
        return this._padding;
      },
      set: function(padding) {
        if (this._padding !== padding) {
          this._padding = padding;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "stroke", {
      get: function() {
        return this._stroke;
      },
      set: function(stroke) {
        var outputColor = getColor(stroke);
        if (this._stroke !== outputColor) {
          this._stroke = outputColor;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "strokeThickness", {
      get: function() {
        return this._strokeThickness;
      },
      set: function(strokeThickness) {
        if (this._strokeThickness !== strokeThickness) {
          this._strokeThickness = strokeThickness;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "textBaseline", {
      get: function() {
        return this._textBaseline;
      },
      set: function(textBaseline) {
        if (this._textBaseline !== textBaseline) {
          this._textBaseline = textBaseline;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "trim", {
      get: function() {
        return this._trim;
      },
      set: function(trim) {
        if (this._trim !== trim) {
          this._trim = trim;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "whiteSpace", {
      get: function() {
        return this._whiteSpace;
      },
      set: function(whiteSpace) {
        if (this._whiteSpace !== whiteSpace) {
          this._whiteSpace = whiteSpace;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "wordWrap", {
      get: function() {
        return this._wordWrap;
      },
      set: function(wordWrap) {
        if (this._wordWrap !== wordWrap) {
          this._wordWrap = wordWrap;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TextStyle2.prototype, "wordWrapWidth", {
      get: function() {
        return this._wordWrapWidth;
      },
      set: function(wordWrapWidth) {
        if (this._wordWrapWidth !== wordWrapWidth) {
          this._wordWrapWidth = wordWrapWidth;
          this.styleID++;
        }
      },
      enumerable: false,
      configurable: true
    });
    TextStyle2.prototype.toFontString = function() {
      var fontSizeString = typeof this.fontSize === "number" ? this.fontSize + "px" : this.fontSize;
      var fontFamilies = this.fontFamily;
      if (!Array.isArray(this.fontFamily)) {
        fontFamilies = this.fontFamily.split(",");
      }
      for (var i = fontFamilies.length - 1; i >= 0; i--) {
        var fontFamily = fontFamilies[i].trim();
        if (!/([\"\'])[^\'\"]+\1/.test(fontFamily) && genericFontFamilies.indexOf(fontFamily) < 0) {
          fontFamily = '"' + fontFamily + '"';
        }
        fontFamilies[i] = fontFamily;
      }
      return this.fontStyle + " " + this.fontVariant + " " + this.fontWeight + " " + fontSizeString + " " + fontFamilies.join(",");
    };
    return TextStyle2;
  }();
  function getSingleColor(color) {
    if (typeof color === "number") {
      return utils.hex2string(color);
    } else if (typeof color === "string") {
      if (color.indexOf("0x") === 0) {
        color = color.replace("0x", "#");
      }
    }
    return color;
  }
  function getColor(color) {
    if (!Array.isArray(color)) {
      return getSingleColor(color);
    } else {
      for (var i = 0; i < color.length; ++i) {
        color[i] = getSingleColor(color[i]);
      }
      return color;
    }
  }
  function areArraysEqual(array1, array2) {
    if (!Array.isArray(array1) || !Array.isArray(array2)) {
      return false;
    }
    if (array1.length !== array2.length) {
      return false;
    }
    for (var i = 0; i < array1.length; ++i) {
      if (array1[i] !== array2[i]) {
        return false;
      }
    }
    return true;
  }
  function deepCopyProperties(target, source, propertyObj) {
    for (var prop in propertyObj) {
      if (Array.isArray(source[prop])) {
        target[prop] = source[prop].slice();
      } else {
        target[prop] = source[prop];
      }
    }
  }
  var TextMetrics = function() {
    function TextMetrics2(text, style, width, height, lines, lineWidths, lineHeight, maxLineWidth, fontProperties) {
      this.text = text;
      this.style = style;
      this.width = width;
      this.height = height;
      this.lines = lines;
      this.lineWidths = lineWidths;
      this.lineHeight = lineHeight;
      this.maxLineWidth = maxLineWidth;
      this.fontProperties = fontProperties;
    }
    TextMetrics2.measureText = function(text, style, wordWrap, canvas2) {
      if (canvas2 === void 0) {
        canvas2 = TextMetrics2._canvas;
      }
      wordWrap = wordWrap === void 0 || wordWrap === null ? style.wordWrap : wordWrap;
      var font = style.toFontString();
      var fontProperties = TextMetrics2.measureFont(font);
      if (fontProperties.fontSize === 0) {
        fontProperties.fontSize = style.fontSize;
        fontProperties.ascent = style.fontSize;
      }
      var context = canvas2.getContext("2d");
      context.font = font;
      var outputText = wordWrap ? TextMetrics2.wordWrap(text, style, canvas2) : text;
      var lines = outputText.split(/(?:\r\n|\r|\n)/);
      var lineWidths = new Array(lines.length);
      var maxLineWidth = 0;
      for (var i = 0; i < lines.length; i++) {
        var lineWidth = context.measureText(lines[i]).width + (lines[i].length - 1) * style.letterSpacing;
        lineWidths[i] = lineWidth;
        maxLineWidth = Math.max(maxLineWidth, lineWidth);
      }
      var width = maxLineWidth + style.strokeThickness;
      if (style.dropShadow) {
        width += style.dropShadowDistance;
      }
      var lineHeight = style.lineHeight || fontProperties.fontSize + style.strokeThickness;
      var height = Math.max(lineHeight, fontProperties.fontSize + style.strokeThickness) + (lines.length - 1) * (lineHeight + style.leading);
      if (style.dropShadow) {
        height += style.dropShadowDistance;
      }
      return new TextMetrics2(text, style, width, height, lines, lineWidths, lineHeight + style.leading, maxLineWidth, fontProperties);
    };
    TextMetrics2.wordWrap = function(text, style, canvas2) {
      if (canvas2 === void 0) {
        canvas2 = TextMetrics2._canvas;
      }
      var context = canvas2.getContext("2d");
      var width = 0;
      var line = "";
      var lines = "";
      var cache = Object.create(null);
      var letterSpacing = style.letterSpacing, whiteSpace = style.whiteSpace;
      var collapseSpaces = TextMetrics2.collapseSpaces(whiteSpace);
      var collapseNewlines = TextMetrics2.collapseNewlines(whiteSpace);
      var canPrependSpaces = !collapseSpaces;
      var wordWrapWidth = style.wordWrapWidth + letterSpacing;
      var tokens = TextMetrics2.tokenize(text);
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        if (TextMetrics2.isNewline(token)) {
          if (!collapseNewlines) {
            lines += TextMetrics2.addLine(line);
            canPrependSpaces = !collapseSpaces;
            line = "";
            width = 0;
            continue;
          }
          token = " ";
        }
        if (collapseSpaces) {
          var currIsBreakingSpace = TextMetrics2.isBreakingSpace(token);
          var lastIsBreakingSpace = TextMetrics2.isBreakingSpace(line[line.length - 1]);
          if (currIsBreakingSpace && lastIsBreakingSpace) {
            continue;
          }
        }
        var tokenWidth = TextMetrics2.getFromCache(token, letterSpacing, cache, context);
        if (tokenWidth > wordWrapWidth) {
          if (line !== "") {
            lines += TextMetrics2.addLine(line);
            line = "";
            width = 0;
          }
          if (TextMetrics2.canBreakWords(token, style.breakWords)) {
            var characters = TextMetrics2.wordWrapSplit(token);
            for (var j = 0; j < characters.length; j++) {
              var char = characters[j];
              var k = 1;
              while (characters[j + k]) {
                var nextChar = characters[j + k];
                var lastChar = char[char.length - 1];
                if (!TextMetrics2.canBreakChars(lastChar, nextChar, token, j, style.breakWords)) {
                  char += nextChar;
                } else {
                  break;
                }
                k++;
              }
              j += char.length - 1;
              var characterWidth = TextMetrics2.getFromCache(char, letterSpacing, cache, context);
              if (characterWidth + width > wordWrapWidth) {
                lines += TextMetrics2.addLine(line);
                canPrependSpaces = false;
                line = "";
                width = 0;
              }
              line += char;
              width += characterWidth;
            }
          } else {
            if (line.length > 0) {
              lines += TextMetrics2.addLine(line);
              line = "";
              width = 0;
            }
            var isLastToken = i === tokens.length - 1;
            lines += TextMetrics2.addLine(token, !isLastToken);
            canPrependSpaces = false;
            line = "";
            width = 0;
          }
        } else {
          if (tokenWidth + width > wordWrapWidth) {
            canPrependSpaces = false;
            lines += TextMetrics2.addLine(line);
            line = "";
            width = 0;
          }
          if (line.length > 0 || !TextMetrics2.isBreakingSpace(token) || canPrependSpaces) {
            line += token;
            width += tokenWidth;
          }
        }
      }
      lines += TextMetrics2.addLine(line, false);
      return lines;
    };
    TextMetrics2.addLine = function(line, newLine) {
      if (newLine === void 0) {
        newLine = true;
      }
      line = TextMetrics2.trimRight(line);
      line = newLine ? line + "\n" : line;
      return line;
    };
    TextMetrics2.getFromCache = function(key, letterSpacing, cache, context) {
      var width = cache[key];
      if (typeof width !== "number") {
        var spacing = key.length * letterSpacing;
        width = context.measureText(key).width + spacing;
        cache[key] = width;
      }
      return width;
    };
    TextMetrics2.collapseSpaces = function(whiteSpace) {
      return whiteSpace === "normal" || whiteSpace === "pre-line";
    };
    TextMetrics2.collapseNewlines = function(whiteSpace) {
      return whiteSpace === "normal";
    };
    TextMetrics2.trimRight = function(text) {
      if (typeof text !== "string") {
        return "";
      }
      for (var i = text.length - 1; i >= 0; i--) {
        var char = text[i];
        if (!TextMetrics2.isBreakingSpace(char)) {
          break;
        }
        text = text.slice(0, -1);
      }
      return text;
    };
    TextMetrics2.isNewline = function(char) {
      if (typeof char !== "string") {
        return false;
      }
      return TextMetrics2._newlines.indexOf(char.charCodeAt(0)) >= 0;
    };
    TextMetrics2.isBreakingSpace = function(char) {
      if (typeof char !== "string") {
        return false;
      }
      return TextMetrics2._breakingSpaces.indexOf(char.charCodeAt(0)) >= 0;
    };
    TextMetrics2.tokenize = function(text) {
      var tokens = [];
      var token = "";
      if (typeof text !== "string") {
        return tokens;
      }
      for (var i = 0; i < text.length; i++) {
        var char = text[i];
        if (TextMetrics2.isBreakingSpace(char) || TextMetrics2.isNewline(char)) {
          if (token !== "") {
            tokens.push(token);
            token = "";
          }
          tokens.push(char);
          continue;
        }
        token += char;
      }
      if (token !== "") {
        tokens.push(token);
      }
      return tokens;
    };
    TextMetrics2.canBreakWords = function(_token, breakWords) {
      return breakWords;
    };
    TextMetrics2.canBreakChars = function(_char, _nextChar, _token, _index, _breakWords) {
      return true;
    };
    TextMetrics2.wordWrapSplit = function(token) {
      return token.split("");
    };
    TextMetrics2.measureFont = function(font) {
      if (TextMetrics2._fonts[font]) {
        return TextMetrics2._fonts[font];
      }
      var properties = {
        ascent: 0,
        descent: 0,
        fontSize: 0
      };
      var canvas2 = TextMetrics2._canvas;
      var context = TextMetrics2._context;
      context.font = font;
      var metricsString = TextMetrics2.METRICS_STRING + TextMetrics2.BASELINE_SYMBOL;
      var width = Math.ceil(context.measureText(metricsString).width);
      var baseline = Math.ceil(context.measureText(TextMetrics2.BASELINE_SYMBOL).width);
      var height = 2 * baseline;
      baseline = baseline * TextMetrics2.BASELINE_MULTIPLIER | 0;
      canvas2.width = width;
      canvas2.height = height;
      context.fillStyle = "#f00";
      context.fillRect(0, 0, width, height);
      context.font = font;
      context.textBaseline = "alphabetic";
      context.fillStyle = "#000";
      context.fillText(metricsString, 0, baseline);
      var imagedata = context.getImageData(0, 0, width, height).data;
      var pixels = imagedata.length;
      var line = width * 4;
      var i = 0;
      var idx = 0;
      var stop = false;
      for (i = 0; i < baseline; ++i) {
        for (var j = 0; j < line; j += 4) {
          if (imagedata[idx + j] !== 255) {
            stop = true;
            break;
          }
        }
        if (!stop) {
          idx += line;
        } else {
          break;
        }
      }
      properties.ascent = baseline - i;
      idx = pixels - line;
      stop = false;
      for (i = height; i > baseline; --i) {
        for (var j = 0; j < line; j += 4) {
          if (imagedata[idx + j] !== 255) {
            stop = true;
            break;
          }
        }
        if (!stop) {
          idx -= line;
        } else {
          break;
        }
      }
      properties.descent = i - baseline;
      properties.fontSize = properties.ascent + properties.descent;
      TextMetrics2._fonts[font] = properties;
      return properties;
    };
    TextMetrics2.clearMetrics = function(font) {
      if (font === void 0) {
        font = "";
      }
      if (font) {
        delete TextMetrics2._fonts[font];
      } else {
        TextMetrics2._fonts = {};
      }
    };
    return TextMetrics2;
  }();
  var canvas = function() {
    try {
      var c = new OffscreenCanvas(0, 0);
      var context = c.getContext("2d");
      if (context && context.measureText) {
        return c;
      }
      return document.createElement("canvas");
    } catch (ex) {
      return document.createElement("canvas");
    }
  }();
  canvas.width = canvas.height = 10;
  TextMetrics._canvas = canvas;
  TextMetrics._context = canvas.getContext("2d");
  TextMetrics._fonts = {};
  TextMetrics.METRICS_STRING = "|\xC9q\xC5";
  TextMetrics.BASELINE_SYMBOL = "M";
  TextMetrics.BASELINE_MULTIPLIER = 1.4;
  TextMetrics._newlines = [
    10,
    13
  ];
  TextMetrics._breakingSpaces = [
    9,
    32,
    8192,
    8193,
    8194,
    8195,
    8196,
    8197,
    8198,
    8200,
    8201,
    8202,
    8287,
    12288
  ];
  var defaultDestroyOptions = {
    texture: true,
    children: false,
    baseTexture: true
  };
  var Text = function(_super) {
    __extends(Text2, _super);
    function Text2(text, style, canvas2) {
      var _this = this;
      var ownCanvas = false;
      if (!canvas2) {
        canvas2 = document.createElement("canvas");
        ownCanvas = true;
      }
      canvas2.width = 3;
      canvas2.height = 3;
      var texture = core.Texture.from(canvas2);
      texture.orig = new math.Rectangle();
      texture.trim = new math.Rectangle();
      _this = _super.call(this, texture) || this;
      _this._ownCanvas = ownCanvas;
      _this.canvas = canvas2;
      _this.context = _this.canvas.getContext("2d");
      _this._resolution = settings.settings.RESOLUTION;
      _this._autoResolution = true;
      _this._text = null;
      _this._style = null;
      _this._styleListener = null;
      _this._font = "";
      _this.text = text;
      _this.style = style;
      _this.localStyleID = -1;
      return _this;
    }
    Text2.prototype.updateText = function(respectDirty) {
      var style = this._style;
      if (this.localStyleID !== style.styleID) {
        this.dirty = true;
        this.localStyleID = style.styleID;
      }
      if (!this.dirty && respectDirty) {
        return;
      }
      this._font = this._style.toFontString();
      var context = this.context;
      var measured = TextMetrics.measureText(this._text || " ", this._style, this._style.wordWrap, this.canvas);
      var width = measured.width;
      var height = measured.height;
      var lines = measured.lines;
      var lineHeight = measured.lineHeight;
      var lineWidths = measured.lineWidths;
      var maxLineWidth = measured.maxLineWidth;
      var fontProperties = measured.fontProperties;
      this.canvas.width = Math.ceil((Math.max(1, width) + style.padding * 2) * this._resolution);
      this.canvas.height = Math.ceil((Math.max(1, height) + style.padding * 2) * this._resolution);
      context.scale(this._resolution, this._resolution);
      context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      context.font = this._font;
      context.lineWidth = style.strokeThickness;
      context.textBaseline = style.textBaseline;
      context.lineJoin = style.lineJoin;
      context.miterLimit = style.miterLimit;
      var linePositionX;
      var linePositionY;
      var passesCount = style.dropShadow ? 2 : 1;
      for (var i = 0; i < passesCount; ++i) {
        var isShadowPass = style.dropShadow && i === 0;
        var dsOffsetText = isShadowPass ? Math.ceil(Math.max(1, height) + style.padding * 2) : 0;
        var dsOffsetShadow = dsOffsetText * this._resolution;
        if (isShadowPass) {
          context.fillStyle = "black";
          context.strokeStyle = "black";
          var dropShadowColor = style.dropShadowColor;
          var rgb = utils.hex2rgb(typeof dropShadowColor === "number" ? dropShadowColor : utils.string2hex(dropShadowColor));
          context.shadowColor = "rgba(" + rgb[0] * 255 + "," + rgb[1] * 255 + "," + rgb[2] * 255 + "," + style.dropShadowAlpha + ")";
          context.shadowBlur = style.dropShadowBlur;
          context.shadowOffsetX = Math.cos(style.dropShadowAngle) * style.dropShadowDistance;
          context.shadowOffsetY = Math.sin(style.dropShadowAngle) * style.dropShadowDistance + dsOffsetShadow;
        } else {
          context.fillStyle = this._generateFillStyle(style, lines, measured);
          context.strokeStyle = style.stroke;
          context.shadowColor = "black";
          context.shadowBlur = 0;
          context.shadowOffsetX = 0;
          context.shadowOffsetY = 0;
        }
        for (var i_1 = 0; i_1 < lines.length; i_1++) {
          linePositionX = style.strokeThickness / 2;
          linePositionY = style.strokeThickness / 2 + i_1 * lineHeight + fontProperties.ascent;
          if (style.align === "right") {
            linePositionX += maxLineWidth - lineWidths[i_1];
          } else if (style.align === "center") {
            linePositionX += (maxLineWidth - lineWidths[i_1]) / 2;
          }
          if (style.stroke && style.strokeThickness) {
            this.drawLetterSpacing(lines[i_1], linePositionX + style.padding, linePositionY + style.padding - dsOffsetText, true);
          }
          if (style.fill) {
            this.drawLetterSpacing(lines[i_1], linePositionX + style.padding, linePositionY + style.padding - dsOffsetText);
          }
        }
      }
      this.updateTexture();
    };
    Text2.prototype.drawLetterSpacing = function(text, x, y, isStroke) {
      if (isStroke === void 0) {
        isStroke = false;
      }
      var style = this._style;
      var letterSpacing = style.letterSpacing;
      if (letterSpacing === 0) {
        if (isStroke) {
          this.context.strokeText(text, x, y);
        } else {
          this.context.fillText(text, x, y);
        }
        return;
      }
      var currentPosition = x;
      var stringArray = Array.from ? Array.from(text) : text.split("");
      var previousWidth = this.context.measureText(text).width;
      var currentWidth = 0;
      for (var i = 0; i < stringArray.length; ++i) {
        var currentChar = stringArray[i];
        if (isStroke) {
          this.context.strokeText(currentChar, currentPosition, y);
        } else {
          this.context.fillText(currentChar, currentPosition, y);
        }
        currentWidth = this.context.measureText(text.substring(i + 1)).width;
        currentPosition += previousWidth - currentWidth + letterSpacing;
        previousWidth = currentWidth;
      }
    };
    Text2.prototype.updateTexture = function() {
      var canvas2 = this.canvas;
      if (this._style.trim) {
        var trimmed = utils.trimCanvas(canvas2);
        if (trimmed.data) {
          canvas2.width = trimmed.width;
          canvas2.height = trimmed.height;
          this.context.putImageData(trimmed.data, 0, 0);
        }
      }
      var texture = this._texture;
      var style = this._style;
      var padding = style.trim ? 0 : style.padding;
      var baseTexture = texture.baseTexture;
      texture.trim.width = texture._frame.width = Math.ceil(canvas2.width / this._resolution);
      texture.trim.height = texture._frame.height = Math.ceil(canvas2.height / this._resolution);
      texture.trim.x = -padding;
      texture.trim.y = -padding;
      texture.orig.width = texture._frame.width - padding * 2;
      texture.orig.height = texture._frame.height - padding * 2;
      this._onTextureUpdate();
      baseTexture.setRealSize(canvas2.width, canvas2.height, this._resolution);
      this._recursivePostUpdateTransform();
      this.dirty = false;
    };
    Text2.prototype._render = function(renderer) {
      if (this._autoResolution && this._resolution !== renderer.resolution) {
        this._resolution = renderer.resolution;
        this.dirty = true;
      }
      this.updateText(true);
      _super.prototype._render.call(this, renderer);
    };
    Text2.prototype.getLocalBounds = function(rect) {
      this.updateText(true);
      return _super.prototype.getLocalBounds.call(this, rect);
    };
    Text2.prototype._calculateBounds = function() {
      this.updateText(true);
      this.calculateVertices();
      this._bounds.addQuad(this.vertexData);
    };
    Text2.prototype._generateFillStyle = function(style, lines, metrics) {
      var fillStyle = style.fill;
      if (!Array.isArray(fillStyle)) {
        return fillStyle;
      } else if (fillStyle.length === 1) {
        return fillStyle[0];
      }
      var gradient;
      var dropShadowCorrection = style.dropShadow ? style.dropShadowDistance : 0;
      var padding = style.padding || 0;
      var width = Math.ceil(this.canvas.width / this._resolution) - dropShadowCorrection - padding * 2;
      var height = Math.ceil(this.canvas.height / this._resolution) - dropShadowCorrection - padding * 2;
      var fill = fillStyle.slice();
      var fillGradientStops = style.fillGradientStops.slice();
      if (!fillGradientStops.length) {
        var lengthPlus1 = fill.length + 1;
        for (var i = 1; i < lengthPlus1; ++i) {
          fillGradientStops.push(i / lengthPlus1);
        }
      }
      fill.unshift(fillStyle[0]);
      fillGradientStops.unshift(0);
      fill.push(fillStyle[fillStyle.length - 1]);
      fillGradientStops.push(1);
      if (style.fillGradientType === exports2.TEXT_GRADIENT.LINEAR_VERTICAL) {
        gradient = this.context.createLinearGradient(width / 2, padding, width / 2, height + padding);
        var lastIterationStop = 0;
        var textHeight = metrics.fontProperties.fontSize + style.strokeThickness;
        var gradStopLineHeight = textHeight / height;
        for (var i = 0; i < lines.length; i++) {
          var thisLineTop = metrics.lineHeight * i;
          for (var j = 0; j < fill.length; j++) {
            var lineStop = 0;
            if (typeof fillGradientStops[j] === "number") {
              lineStop = fillGradientStops[j];
            } else {
              lineStop = j / fill.length;
            }
            var globalStop = thisLineTop / height + lineStop * gradStopLineHeight;
            var clampedStop = Math.max(lastIterationStop, globalStop);
            clampedStop = Math.min(clampedStop, 1);
            gradient.addColorStop(clampedStop, fill[j]);
            lastIterationStop = clampedStop;
          }
        }
      } else {
        gradient = this.context.createLinearGradient(padding, height / 2, width + padding, height / 2);
        var totalIterations = fill.length + 1;
        var currentIteration = 1;
        for (var i = 0; i < fill.length; i++) {
          var stop = void 0;
          if (typeof fillGradientStops[i] === "number") {
            stop = fillGradientStops[i];
          } else {
            stop = currentIteration / totalIterations;
          }
          gradient.addColorStop(stop, fill[i]);
          currentIteration++;
        }
      }
      return gradient;
    };
    Text2.prototype.destroy = function(options) {
      if (typeof options === "boolean") {
        options = {children: options};
      }
      options = Object.assign({}, defaultDestroyOptions, options);
      _super.prototype.destroy.call(this, options);
      if (this._ownCanvas) {
        this.canvas.height = this.canvas.width = 0;
      }
      this.context = null;
      this.canvas = null;
      this._style = null;
    };
    Object.defineProperty(Text2.prototype, "width", {
      get: function() {
        this.updateText(true);
        return Math.abs(this.scale.x) * this._texture.orig.width;
      },
      set: function(value) {
        this.updateText(true);
        var s = utils.sign(this.scale.x) || 1;
        this.scale.x = s * value / this._texture.orig.width;
        this._width = value;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Text2.prototype, "height", {
      get: function() {
        this.updateText(true);
        return Math.abs(this.scale.y) * this._texture.orig.height;
      },
      set: function(value) {
        this.updateText(true);
        var s = utils.sign(this.scale.y) || 1;
        this.scale.y = s * value / this._texture.orig.height;
        this._height = value;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Text2.prototype, "style", {
      get: function() {
        return this._style;
      },
      set: function(style) {
        style = style || {};
        if (style instanceof TextStyle) {
          this._style = style;
        } else {
          this._style = new TextStyle(style);
        }
        this.localStyleID = -1;
        this.dirty = true;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Text2.prototype, "text", {
      get: function() {
        return this._text;
      },
      set: function(text) {
        text = String(text === null || text === void 0 ? "" : text);
        if (this._text === text) {
          return;
        }
        this._text = text;
        this.dirty = true;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Text2.prototype, "resolution", {
      get: function() {
        return this._resolution;
      },
      set: function(value) {
        this._autoResolution = false;
        if (this._resolution === value) {
          return;
        }
        this._resolution = value;
        this.dirty = true;
      },
      enumerable: false,
      configurable: true
    });
    return Text2;
  }(sprite.Sprite);
  exports2.Text = Text;
  exports2.TextMetrics = TextMetrics;
  exports2.TextStyle = TextStyle;
});

// node_modules/@pixi/prepare/lib/prepare.js
var require_prepare = __commonJS((exports2) => {
  /*!
   * @pixi/prepare - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/prepare is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var settings = require_settings();
  var core = require_core();
  var graphics = require_graphics();
  var ticker = require_ticker();
  var display = require_display();
  var text = require_text();
  settings.settings.UPLOADS_PER_FRAME = 4;
  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0
  
  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.
  
  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || {__proto__: []} instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) {
        if (b2.hasOwnProperty(p)) {
          d2[p] = b2[p];
        }
      }
    };
    return extendStatics(d, b);
  };
  function __extends(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  var CountLimiter = function() {
    function CountLimiter2(maxItemsPerFrame) {
      this.maxItemsPerFrame = maxItemsPerFrame;
      this.itemsLeft = 0;
    }
    CountLimiter2.prototype.beginFrame = function() {
      this.itemsLeft = this.maxItemsPerFrame;
    };
    CountLimiter2.prototype.allowedToUpload = function() {
      return this.itemsLeft-- > 0;
    };
    return CountLimiter2;
  }();
  function findMultipleBaseTextures(item, queue) {
    var result = false;
    if (item && item._textures && item._textures.length) {
      for (var i = 0; i < item._textures.length; i++) {
        if (item._textures[i] instanceof core.Texture) {
          var baseTexture = item._textures[i].baseTexture;
          if (queue.indexOf(baseTexture) === -1) {
            queue.push(baseTexture);
            result = true;
          }
        }
      }
    }
    return result;
  }
  function findBaseTexture(item, queue) {
    if (item.baseTexture instanceof core.BaseTexture) {
      var texture = item.baseTexture;
      if (queue.indexOf(texture) === -1) {
        queue.push(texture);
      }
      return true;
    }
    return false;
  }
  function findTexture(item, queue) {
    if (item._texture && item._texture instanceof core.Texture) {
      var texture = item._texture.baseTexture;
      if (queue.indexOf(texture) === -1) {
        queue.push(texture);
      }
      return true;
    }
    return false;
  }
  function drawText(_helper, item) {
    if (item instanceof text.Text) {
      item.updateText(true);
      return true;
    }
    return false;
  }
  function calculateTextStyle(_helper, item) {
    if (item instanceof text.TextStyle) {
      var font = item.toFontString();
      text.TextMetrics.measureFont(font);
      return true;
    }
    return false;
  }
  function findText(item, queue) {
    if (item instanceof text.Text) {
      if (queue.indexOf(item.style) === -1) {
        queue.push(item.style);
      }
      if (queue.indexOf(item) === -1) {
        queue.push(item);
      }
      var texture = item._texture.baseTexture;
      if (queue.indexOf(texture) === -1) {
        queue.push(texture);
      }
      return true;
    }
    return false;
  }
  function findTextStyle(item, queue) {
    if (item instanceof text.TextStyle) {
      if (queue.indexOf(item) === -1) {
        queue.push(item);
      }
      return true;
    }
    return false;
  }
  var BasePrepare = function() {
    function BasePrepare2(renderer) {
      var _this = this;
      this.limiter = new CountLimiter(settings.settings.UPLOADS_PER_FRAME);
      this.renderer = renderer;
      this.uploadHookHelper = null;
      this.queue = [];
      this.addHooks = [];
      this.uploadHooks = [];
      this.completes = [];
      this.ticking = false;
      this.delayedTick = function() {
        if (!_this.queue) {
          return;
        }
        _this.prepareItems();
      };
      this.registerFindHook(findText);
      this.registerFindHook(findTextStyle);
      this.registerFindHook(findMultipleBaseTextures);
      this.registerFindHook(findBaseTexture);
      this.registerFindHook(findTexture);
      this.registerUploadHook(drawText);
      this.registerUploadHook(calculateTextStyle);
    }
    BasePrepare2.prototype.upload = function(item, done) {
      if (typeof item === "function") {
        done = item;
        item = null;
      }
      if (item) {
        this.add(item);
      }
      if (this.queue.length) {
        if (done) {
          this.completes.push(done);
        }
        if (!this.ticking) {
          this.ticking = true;
          ticker.Ticker.system.addOnce(this.tick, this, ticker.UPDATE_PRIORITY.UTILITY);
        }
      } else if (done) {
        done();
      }
    };
    BasePrepare2.prototype.tick = function() {
      setTimeout(this.delayedTick, 0);
    };
    BasePrepare2.prototype.prepareItems = function() {
      this.limiter.beginFrame();
      while (this.queue.length && this.limiter.allowedToUpload()) {
        var item = this.queue[0];
        var uploaded = false;
        if (item && !item._destroyed) {
          for (var i = 0, len = this.uploadHooks.length; i < len; i++) {
            if (this.uploadHooks[i](this.uploadHookHelper, item)) {
              this.queue.shift();
              uploaded = true;
              break;
            }
          }
        }
        if (!uploaded) {
          this.queue.shift();
        }
      }
      if (!this.queue.length) {
        this.ticking = false;
        var completes = this.completes.slice(0);
        this.completes.length = 0;
        for (var i = 0, len = completes.length; i < len; i++) {
          completes[i]();
        }
      } else {
        ticker.Ticker.system.addOnce(this.tick, this, ticker.UPDATE_PRIORITY.UTILITY);
      }
    };
    BasePrepare2.prototype.registerFindHook = function(addHook) {
      if (addHook) {
        this.addHooks.push(addHook);
      }
      return this;
    };
    BasePrepare2.prototype.registerUploadHook = function(uploadHook) {
      if (uploadHook) {
        this.uploadHooks.push(uploadHook);
      }
      return this;
    };
    BasePrepare2.prototype.add = function(item) {
      for (var i = 0, len = this.addHooks.length; i < len; i++) {
        if (this.addHooks[i](item, this.queue)) {
          break;
        }
      }
      if (item instanceof display.Container) {
        for (var i = item.children.length - 1; i >= 0; i--) {
          this.add(item.children[i]);
        }
      }
      return this;
    };
    BasePrepare2.prototype.destroy = function() {
      if (this.ticking) {
        ticker.Ticker.system.remove(this.tick, this);
      }
      this.ticking = false;
      this.addHooks = null;
      this.uploadHooks = null;
      this.renderer = null;
      this.completes = null;
      this.queue = null;
      this.limiter = null;
      this.uploadHookHelper = null;
    };
    return BasePrepare2;
  }();
  function uploadBaseTextures(renderer, item) {
    if (item instanceof core.BaseTexture) {
      if (!item._glTextures[renderer.CONTEXT_UID]) {
        renderer.texture.bind(item);
      }
      return true;
    }
    return false;
  }
  function uploadGraphics(renderer, item) {
    if (!(item instanceof graphics.Graphics)) {
      return false;
    }
    var geometry = item.geometry;
    item.finishPoly();
    geometry.updateBatches();
    var batches = geometry.batches;
    for (var i = 0; i < batches.length; i++) {
      var texture = batches[i].style.texture;
      if (texture) {
        uploadBaseTextures(renderer, texture.baseTexture);
      }
    }
    if (!geometry.batchable) {
      renderer.geometry.bind(geometry, item._resolveDirectShader(renderer));
    }
    return true;
  }
  function findGraphics(item, queue) {
    if (item instanceof graphics.Graphics) {
      queue.push(item);
      return true;
    }
    return false;
  }
  var Prepare = function(_super) {
    __extends(Prepare2, _super);
    function Prepare2(renderer) {
      var _this = _super.call(this, renderer) || this;
      _this.uploadHookHelper = _this.renderer;
      _this.registerFindHook(findGraphics);
      _this.registerUploadHook(uploadBaseTextures);
      _this.registerUploadHook(uploadGraphics);
      return _this;
    }
    return Prepare2;
  }(BasePrepare);
  var TimeLimiter = function() {
    function TimeLimiter2(maxMilliseconds) {
      this.maxMilliseconds = maxMilliseconds;
      this.frameStart = 0;
    }
    TimeLimiter2.prototype.beginFrame = function() {
      this.frameStart = Date.now();
    };
    TimeLimiter2.prototype.allowedToUpload = function() {
      return Date.now() - this.frameStart < this.maxMilliseconds;
    };
    return TimeLimiter2;
  }();
  exports2.BasePrepare = BasePrepare;
  exports2.CountLimiter = CountLimiter;
  exports2.Prepare = Prepare;
  exports2.TimeLimiter = TimeLimiter;
});

// node_modules/@pixi/spritesheet/lib/spritesheet.js
var require_spritesheet = __commonJS((exports2) => {
  /*!
   * @pixi/spritesheet - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/spritesheet is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var math = require_math();
  var core = require_core();
  var utils = require_utils();
  var loaders = require_loaders();
  var Spritesheet = function() {
    function Spritesheet2(texture, data, resolutionFilename) {
      if (resolutionFilename === void 0) {
        resolutionFilename = null;
      }
      this._texture = texture instanceof core.Texture ? texture : null;
      this.baseTexture = texture instanceof core.BaseTexture ? texture : this._texture.baseTexture;
      this.textures = {};
      this.animations = {};
      this.data = data;
      var resource = this.baseTexture.resource;
      this.resolution = this._updateResolution(resolutionFilename || (resource ? resource.url : null));
      this._frames = this.data.frames;
      this._frameKeys = Object.keys(this._frames);
      this._batchIndex = 0;
      this._callback = null;
    }
    Spritesheet2.prototype._updateResolution = function(resolutionFilename) {
      if (resolutionFilename === void 0) {
        resolutionFilename = null;
      }
      var scale = this.data.meta.scale;
      var resolution = utils.getResolutionOfUrl(resolutionFilename, null);
      if (resolution === null) {
        resolution = scale !== void 0 ? parseFloat(scale) : 1;
      }
      if (resolution !== 1) {
        this.baseTexture.setResolution(resolution);
      }
      return resolution;
    };
    Spritesheet2.prototype.parse = function(callback) {
      this._batchIndex = 0;
      this._callback = callback;
      if (this._frameKeys.length <= Spritesheet2.BATCH_SIZE) {
        this._processFrames(0);
        this._processAnimations();
        this._parseComplete();
      } else {
        this._nextBatch();
      }
    };
    Spritesheet2.prototype._processFrames = function(initialFrameIndex) {
      var frameIndex = initialFrameIndex;
      var maxFrames = Spritesheet2.BATCH_SIZE;
      while (frameIndex - initialFrameIndex < maxFrames && frameIndex < this._frameKeys.length) {
        var i = this._frameKeys[frameIndex];
        var data = this._frames[i];
        var rect = data.frame;
        if (rect) {
          var frame = null;
          var trim = null;
          var sourceSize = data.trimmed !== false && data.sourceSize ? data.sourceSize : data.frame;
          var orig = new math.Rectangle(0, 0, Math.floor(sourceSize.w) / this.resolution, Math.floor(sourceSize.h) / this.resolution);
          if (data.rotated) {
            frame = new math.Rectangle(Math.floor(rect.x) / this.resolution, Math.floor(rect.y) / this.resolution, Math.floor(rect.h) / this.resolution, Math.floor(rect.w) / this.resolution);
          } else {
            frame = new math.Rectangle(Math.floor(rect.x) / this.resolution, Math.floor(rect.y) / this.resolution, Math.floor(rect.w) / this.resolution, Math.floor(rect.h) / this.resolution);
          }
          if (data.trimmed !== false && data.spriteSourceSize) {
            trim = new math.Rectangle(Math.floor(data.spriteSourceSize.x) / this.resolution, Math.floor(data.spriteSourceSize.y) / this.resolution, Math.floor(rect.w) / this.resolution, Math.floor(rect.h) / this.resolution);
          }
          this.textures[i] = new core.Texture(this.baseTexture, frame, orig, trim, data.rotated ? 2 : 0, data.anchor);
          core.Texture.addToCache(this.textures[i], i);
        }
        frameIndex++;
      }
    };
    Spritesheet2.prototype._processAnimations = function() {
      var animations = this.data.animations || {};
      for (var animName in animations) {
        this.animations[animName] = [];
        for (var i = 0; i < animations[animName].length; i++) {
          var frameName = animations[animName][i];
          this.animations[animName].push(this.textures[frameName]);
        }
      }
    };
    Spritesheet2.prototype._parseComplete = function() {
      var callback = this._callback;
      this._callback = null;
      this._batchIndex = 0;
      callback.call(this, this.textures);
    };
    Spritesheet2.prototype._nextBatch = function() {
      var _this = this;
      this._processFrames(this._batchIndex * Spritesheet2.BATCH_SIZE);
      this._batchIndex++;
      setTimeout(function() {
        if (_this._batchIndex * Spritesheet2.BATCH_SIZE < _this._frameKeys.length) {
          _this._nextBatch();
        } else {
          _this._processAnimations();
          _this._parseComplete();
        }
      }, 0);
    };
    Spritesheet2.prototype.destroy = function(destroyBase) {
      var _a;
      if (destroyBase === void 0) {
        destroyBase = false;
      }
      for (var i in this.textures) {
        this.textures[i].destroy();
      }
      this._frames = null;
      this._frameKeys = null;
      this.data = null;
      this.textures = null;
      if (destroyBase) {
        (_a = this._texture) === null || _a === void 0 ? void 0 : _a.destroy();
        this.baseTexture.destroy();
      }
      this._texture = null;
      this.baseTexture = null;
    };
    Spritesheet2.BATCH_SIZE = 1e3;
    return Spritesheet2;
  }();
  var SpritesheetLoader = function() {
    function SpritesheetLoader2() {
    }
    SpritesheetLoader2.use = function(resource, next) {
      var loader = this;
      var imageResourceName = resource.name + "_image";
      if (!resource.data || resource.type !== loaders.LoaderResource.TYPE.JSON || !resource.data.frames || loader.resources[imageResourceName]) {
        next();
        return;
      }
      var loadOptions = {
        crossOrigin: resource.crossOrigin,
        metadata: resource.metadata.imageMetadata,
        parentResource: resource
      };
      var resourcePath = SpritesheetLoader2.getResourcePath(resource, loader.baseUrl);
      loader.add(imageResourceName, resourcePath, loadOptions, function onImageLoad(res) {
        if (res.error) {
          next(res.error);
          return;
        }
        var spritesheet = new Spritesheet(res.texture, resource.data, resource.url);
        spritesheet.parse(function() {
          resource.spritesheet = spritesheet;
          resource.textures = spritesheet.textures;
          next();
        });
      });
    };
    SpritesheetLoader2.getResourcePath = function(resource, baseUrl) {
      if (resource.isDataUrl) {
        return resource.data.meta.image;
      }
      return utils.url.resolve(resource.url.replace(baseUrl, ""), resource.data.meta.image);
    };
    return SpritesheetLoader2;
  }();
  exports2.Spritesheet = Spritesheet;
  exports2.SpritesheetLoader = SpritesheetLoader;
});

// node_modules/@pixi/sprite-tiling/lib/sprite-tiling.js
var require_sprite_tiling = __commonJS((exports2) => {
  /*!
   * @pixi/sprite-tiling - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/sprite-tiling is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var core = require_core();
  var math = require_math();
  var sprite = require_sprite();
  var utils = require_utils();
  var constants = require_constants();
  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0
  
  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.
  
  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || {__proto__: []} instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) {
        if (b2.hasOwnProperty(p)) {
          d2[p] = b2[p];
        }
      }
    };
    return extendStatics(d, b);
  };
  function __extends(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  var tempPoint = new math.Point();
  var TilingSprite = function(_super) {
    __extends(TilingSprite2, _super);
    function TilingSprite2(texture, width, height) {
      if (width === void 0) {
        width = 100;
      }
      if (height === void 0) {
        height = 100;
      }
      var _this = _super.call(this, texture) || this;
      _this.tileTransform = new math.Transform();
      _this._width = width;
      _this._height = height;
      _this.uvMatrix = _this.texture.uvMatrix || new core.TextureMatrix(texture);
      _this.pluginName = "tilingSprite";
      _this.uvRespectAnchor = false;
      return _this;
    }
    Object.defineProperty(TilingSprite2.prototype, "clampMargin", {
      get: function() {
        return this.uvMatrix.clampMargin;
      },
      set: function(value) {
        this.uvMatrix.clampMargin = value;
        this.uvMatrix.update(true);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TilingSprite2.prototype, "tileScale", {
      get: function() {
        return this.tileTransform.scale;
      },
      set: function(value) {
        this.tileTransform.scale.copyFrom(value);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TilingSprite2.prototype, "tilePosition", {
      get: function() {
        return this.tileTransform.position;
      },
      set: function(value) {
        this.tileTransform.position.copyFrom(value);
      },
      enumerable: false,
      configurable: true
    });
    TilingSprite2.prototype._onTextureUpdate = function() {
      if (this.uvMatrix) {
        this.uvMatrix.texture = this._texture;
      }
      this._cachedTint = 16777215;
    };
    TilingSprite2.prototype._render = function(renderer) {
      var texture = this._texture;
      if (!texture || !texture.valid) {
        return;
      }
      this.tileTransform.updateLocalTransform();
      this.uvMatrix.update();
      renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);
      renderer.plugins[this.pluginName].render(this);
    };
    TilingSprite2.prototype._calculateBounds = function() {
      var minX = this._width * -this._anchor._x;
      var minY = this._height * -this._anchor._y;
      var maxX = this._width * (1 - this._anchor._x);
      var maxY = this._height * (1 - this._anchor._y);
      this._bounds.addFrame(this.transform, minX, minY, maxX, maxY);
    };
    TilingSprite2.prototype.getLocalBounds = function(rect) {
      if (this.children.length === 0) {
        this._bounds.minX = this._width * -this._anchor._x;
        this._bounds.minY = this._height * -this._anchor._y;
        this._bounds.maxX = this._width * (1 - this._anchor._x);
        this._bounds.maxY = this._height * (1 - this._anchor._y);
        if (!rect) {
          if (!this._localBoundsRect) {
            this._localBoundsRect = new math.Rectangle();
          }
          rect = this._localBoundsRect;
        }
        return this._bounds.getRectangle(rect);
      }
      return _super.prototype.getLocalBounds.call(this, rect);
    };
    TilingSprite2.prototype.containsPoint = function(point) {
      this.worldTransform.applyInverse(point, tempPoint);
      var width = this._width;
      var height = this._height;
      var x1 = -width * this.anchor._x;
      if (tempPoint.x >= x1 && tempPoint.x < x1 + width) {
        var y1 = -height * this.anchor._y;
        if (tempPoint.y >= y1 && tempPoint.y < y1 + height) {
          return true;
        }
      }
      return false;
    };
    TilingSprite2.prototype.destroy = function(options) {
      _super.prototype.destroy.call(this, options);
      this.tileTransform = null;
      this.uvMatrix = null;
    };
    TilingSprite2.from = function(source, options) {
      if (typeof options === "number") {
        utils.deprecation("5.3.0", "TilingSprite.from use options instead of width and height args");
        options = {width: options, height: arguments[2]};
      }
      return new TilingSprite2(core.Texture.from(source, options), options.width, options.height);
    };
    Object.defineProperty(TilingSprite2.prototype, "width", {
      get: function() {
        return this._width;
      },
      set: function(value) {
        this._width = value;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(TilingSprite2.prototype, "height", {
      get: function() {
        return this._height;
      },
      set: function(value) {
        this._height = value;
      },
      enumerable: false,
      configurable: true
    });
    return TilingSprite2;
  }(sprite.Sprite);
  var vertex = "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\nuniform mat3 translationMatrix;\nuniform mat3 uTransform;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n    vTextureCoord = (uTransform * vec3(aTextureCoord, 1.0)).xy;\n}\n";
  var fragment = "varying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec4 uColor;\nuniform mat3 uMapCoord;\nuniform vec4 uClampFrame;\nuniform vec2 uClampOffset;\n\nvoid main(void)\n{\n    vec2 coord = vTextureCoord + ceil(uClampOffset - vTextureCoord);\n    coord = (uMapCoord * vec3(coord, 1.0)).xy;\n    coord = clamp(coord, uClampFrame.xy, uClampFrame.zw);\n\n    vec4 texSample = texture2D(uSampler, coord);\n    gl_FragColor = texSample * uColor;\n}\n";
  var fragmentSimple = "varying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec4 uColor;\n\nvoid main(void)\n{\n    vec4 sample = texture2D(uSampler, vTextureCoord);\n    gl_FragColor = sample * uColor;\n}\n";
  var tempMat = new math.Matrix();
  var TilingSpriteRenderer = function(_super) {
    __extends(TilingSpriteRenderer2, _super);
    function TilingSpriteRenderer2(renderer) {
      var _this = _super.call(this, renderer) || this;
      var uniforms = {globals: _this.renderer.globalUniforms};
      _this.shader = core.Shader.from(vertex, fragment, uniforms);
      _this.simpleShader = core.Shader.from(vertex, fragmentSimple, uniforms);
      _this.quad = new core.QuadUv();
      _this.state = core.State.for2d();
      return _this;
    }
    TilingSpriteRenderer2.prototype.render = function(ts) {
      var renderer = this.renderer;
      var quad = this.quad;
      var vertices = quad.vertices;
      vertices[0] = vertices[6] = ts._width * -ts.anchor.x;
      vertices[1] = vertices[3] = ts._height * -ts.anchor.y;
      vertices[2] = vertices[4] = ts._width * (1 - ts.anchor.x);
      vertices[5] = vertices[7] = ts._height * (1 - ts.anchor.y);
      if (ts.uvRespectAnchor) {
        vertices = quad.uvs;
        vertices[0] = vertices[6] = -ts.anchor.x;
        vertices[1] = vertices[3] = -ts.anchor.y;
        vertices[2] = vertices[4] = 1 - ts.anchor.x;
        vertices[5] = vertices[7] = 1 - ts.anchor.y;
      }
      quad.invalidate();
      var tex = ts._texture;
      var baseTex = tex.baseTexture;
      var lt = ts.tileTransform.localTransform;
      var uv = ts.uvMatrix;
      var isSimple = baseTex.isPowerOfTwo && tex.frame.width === baseTex.width && tex.frame.height === baseTex.height;
      if (isSimple) {
        if (!baseTex._glTextures[renderer.CONTEXT_UID]) {
          if (baseTex.wrapMode === constants.WRAP_MODES.CLAMP) {
            baseTex.wrapMode = constants.WRAP_MODES.REPEAT;
          }
        } else {
          isSimple = baseTex.wrapMode !== constants.WRAP_MODES.CLAMP;
        }
      }
      var shader = isSimple ? this.simpleShader : this.shader;
      var w = tex.width;
      var h = tex.height;
      var W = ts._width;
      var H = ts._height;
      tempMat.set(lt.a * w / W, lt.b * w / H, lt.c * h / W, lt.d * h / H, lt.tx / W, lt.ty / H);
      tempMat.invert();
      if (isSimple) {
        tempMat.prepend(uv.mapCoord);
      } else {
        shader.uniforms.uMapCoord = uv.mapCoord.toArray(true);
        shader.uniforms.uClampFrame = uv.uClampFrame;
        shader.uniforms.uClampOffset = uv.uClampOffset;
      }
      shader.uniforms.uTransform = tempMat.toArray(true);
      shader.uniforms.uColor = utils.premultiplyTintToRgba(ts.tint, ts.worldAlpha, shader.uniforms.uColor, baseTex.alphaMode);
      shader.uniforms.translationMatrix = ts.transform.worldTransform.toArray(true);
      shader.uniforms.uSampler = tex;
      renderer.shader.bind(shader);
      renderer.geometry.bind(quad);
      this.state.blendMode = utils.correctBlendMode(ts.blendMode, baseTex.alphaMode);
      renderer.state.set(this.state);
      renderer.geometry.draw(this.renderer.gl.TRIANGLES, 6, 0);
    };
    return TilingSpriteRenderer2;
  }(core.ObjectRenderer);
  exports2.TilingSprite = TilingSprite;
  exports2.TilingSpriteRenderer = TilingSpriteRenderer;
});

// node_modules/@pixi/mesh/lib/mesh.js
var require_mesh = __commonJS((exports2) => {
  /*!
   * @pixi/mesh - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/mesh is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var core = require_core();
  var math = require_math();
  var constants = require_constants();
  var display = require_display();
  var settings = require_settings();
  var utils = require_utils();
  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0
  
  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.
  
  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || {__proto__: []} instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) {
        if (b2.hasOwnProperty(p)) {
          d2[p] = b2[p];
        }
      }
    };
    return extendStatics(d, b);
  };
  function __extends(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  var MeshBatchUvs = function() {
    function MeshBatchUvs2(uvBuffer, uvMatrix) {
      this.uvBuffer = uvBuffer;
      this.uvMatrix = uvMatrix;
      this.data = null;
      this._bufferUpdateId = -1;
      this._textureUpdateId = -1;
      this._updateID = 0;
    }
    MeshBatchUvs2.prototype.update = function(forceUpdate) {
      if (!forceUpdate && this._bufferUpdateId === this.uvBuffer._updateID && this._textureUpdateId === this.uvMatrix._updateID) {
        return;
      }
      this._bufferUpdateId = this.uvBuffer._updateID;
      this._textureUpdateId = this.uvMatrix._updateID;
      var data = this.uvBuffer.data;
      if (!this.data || this.data.length !== data.length) {
        this.data = new Float32Array(data.length);
      }
      this.uvMatrix.multiplyUvs(data, this.data);
      this._updateID++;
    };
    return MeshBatchUvs2;
  }();
  var tempPoint = new math.Point();
  var tempPolygon = new math.Polygon();
  var Mesh = function(_super) {
    __extends(Mesh2, _super);
    function Mesh2(geometry, shader, state, drawMode) {
      if (drawMode === void 0) {
        drawMode = constants.DRAW_MODES.TRIANGLES;
      }
      var _this = _super.call(this) || this;
      _this.geometry = geometry;
      geometry.refCount++;
      _this.shader = shader;
      _this.state = state || core.State.for2d();
      _this.drawMode = drawMode;
      _this.start = 0;
      _this.size = 0;
      _this.uvs = null;
      _this.indices = null;
      _this.vertexData = new Float32Array(1);
      _this.vertexDirty = 0;
      _this._transformID = -1;
      _this._roundPixels = settings.settings.ROUND_PIXELS;
      _this.batchUvs = null;
      return _this;
    }
    Object.defineProperty(Mesh2.prototype, "uvBuffer", {
      get: function() {
        return this.geometry.buffers[1];
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Mesh2.prototype, "verticesBuffer", {
      get: function() {
        return this.geometry.buffers[0];
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Mesh2.prototype, "material", {
      get: function() {
        return this.shader;
      },
      set: function(value) {
        this.shader = value;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Mesh2.prototype, "blendMode", {
      get: function() {
        return this.state.blendMode;
      },
      set: function(value) {
        this.state.blendMode = value;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Mesh2.prototype, "roundPixels", {
      get: function() {
        return this._roundPixels;
      },
      set: function(value) {
        if (this._roundPixels !== value) {
          this._transformID = -1;
        }
        this._roundPixels = value;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Mesh2.prototype, "tint", {
      get: function() {
        return this.shader.tint;
      },
      set: function(value) {
        this.shader.tint = value;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Mesh2.prototype, "texture", {
      get: function() {
        return this.shader.texture;
      },
      set: function(value) {
        this.shader.texture = value;
      },
      enumerable: false,
      configurable: true
    });
    Mesh2.prototype._render = function(renderer) {
      var vertices = this.geometry.buffers[0].data;
      if (this.shader.batchable && this.drawMode === constants.DRAW_MODES.TRIANGLES && vertices.length < Mesh2.BATCHABLE_SIZE * 2) {
        this._renderToBatch(renderer);
      } else {
        this._renderDefault(renderer);
      }
    };
    Mesh2.prototype._renderDefault = function(renderer) {
      var shader = this.shader;
      shader.alpha = this.worldAlpha;
      if (shader.update) {
        shader.update();
      }
      renderer.batch.flush();
      if (shader.program.uniformData.translationMatrix) {
        shader.uniforms.translationMatrix = this.transform.worldTransform.toArray(true);
      }
      renderer.shader.bind(shader);
      renderer.state.set(this.state);
      renderer.geometry.bind(this.geometry, shader);
      renderer.geometry.draw(this.drawMode, this.size, this.start, this.geometry.instanceCount);
    };
    Mesh2.prototype._renderToBatch = function(renderer) {
      var geometry = this.geometry;
      if (this.shader.uvMatrix) {
        this.shader.uvMatrix.update();
        this.calculateUvs();
      }
      this.calculateVertices();
      this.indices = geometry.indexBuffer.data;
      this._tintRGB = this.shader._tintRGB;
      this._texture = this.shader.texture;
      var pluginName = this.material.pluginName;
      renderer.batch.setObjectRenderer(renderer.plugins[pluginName]);
      renderer.plugins[pluginName].render(this);
    };
    Mesh2.prototype.calculateVertices = function() {
      var geometry = this.geometry;
      var vertices = geometry.buffers[0].data;
      if (geometry.vertexDirtyId === this.vertexDirty && this._transformID === this.transform._worldID) {
        return;
      }
      this._transformID = this.transform._worldID;
      if (this.vertexData.length !== vertices.length) {
        this.vertexData = new Float32Array(vertices.length);
      }
      var wt = this.transform.worldTransform;
      var a = wt.a;
      var b = wt.b;
      var c = wt.c;
      var d = wt.d;
      var tx = wt.tx;
      var ty = wt.ty;
      var vertexData = this.vertexData;
      for (var i = 0; i < vertexData.length / 2; i++) {
        var x = vertices[i * 2];
        var y = vertices[i * 2 + 1];
        vertexData[i * 2] = a * x + c * y + tx;
        vertexData[i * 2 + 1] = b * x + d * y + ty;
      }
      if (this._roundPixels) {
        var resolution = settings.settings.RESOLUTION;
        for (var i = 0; i < vertexData.length; ++i) {
          vertexData[i] = Math.round((vertexData[i] * resolution | 0) / resolution);
        }
      }
      this.vertexDirty = geometry.vertexDirtyId;
    };
    Mesh2.prototype.calculateUvs = function() {
      var geomUvs = this.geometry.buffers[1];
      if (!this.shader.uvMatrix.isSimple) {
        if (!this.batchUvs) {
          this.batchUvs = new MeshBatchUvs(geomUvs, this.shader.uvMatrix);
        }
        this.batchUvs.update();
        this.uvs = this.batchUvs.data;
      } else {
        this.uvs = geomUvs.data;
      }
    };
    Mesh2.prototype._calculateBounds = function() {
      this.calculateVertices();
      this._bounds.addVertexData(this.vertexData, 0, this.vertexData.length);
    };
    Mesh2.prototype.containsPoint = function(point) {
      if (!this.getBounds().contains(point.x, point.y)) {
        return false;
      }
      this.worldTransform.applyInverse(point, tempPoint);
      var vertices = this.geometry.getBuffer("aVertexPosition").data;
      var points = tempPolygon.points;
      var indices = this.geometry.getIndex().data;
      var len = indices.length;
      var step = this.drawMode === 4 ? 3 : 1;
      for (var i = 0; i + 2 < len; i += step) {
        var ind0 = indices[i] * 2;
        var ind1 = indices[i + 1] * 2;
        var ind2 = indices[i + 2] * 2;
        points[0] = vertices[ind0];
        points[1] = vertices[ind0 + 1];
        points[2] = vertices[ind1];
        points[3] = vertices[ind1 + 1];
        points[4] = vertices[ind2];
        points[5] = vertices[ind2 + 1];
        if (tempPolygon.contains(tempPoint.x, tempPoint.y)) {
          return true;
        }
      }
      return false;
    };
    Mesh2.prototype.destroy = function(options) {
      _super.prototype.destroy.call(this, options);
      this.geometry.refCount--;
      if (this.geometry.refCount === 0) {
        this.geometry.dispose();
      }
      this.geometry = null;
      this.shader = null;
      this.state = null;
      this.uvs = null;
      this.indices = null;
      this.vertexData = null;
    };
    Mesh2.BATCHABLE_SIZE = 100;
    return Mesh2;
  }(display.Container);
  var fragment = "varying vec2 vTextureCoord;\nuniform vec4 uColor;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    gl_FragColor = texture2D(uSampler, vTextureCoord) * uColor;\n}\n";
  var vertex = "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\nuniform mat3 translationMatrix;\nuniform mat3 uTextureMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n    vTextureCoord = (uTextureMatrix * vec3(aTextureCoord, 1.0)).xy;\n}\n";
  var MeshMaterial = function(_super) {
    __extends(MeshMaterial2, _super);
    function MeshMaterial2(uSampler, options) {
      var _this = this;
      var uniforms = {
        uSampler,
        alpha: 1,
        uTextureMatrix: math.Matrix.IDENTITY,
        uColor: new Float32Array([1, 1, 1, 1])
      };
      options = Object.assign({
        tint: 16777215,
        alpha: 1,
        pluginName: "batch"
      }, options);
      if (options.uniforms) {
        Object.assign(uniforms, options.uniforms);
      }
      _this = _super.call(this, options.program || core.Program.from(vertex, fragment), uniforms) || this;
      _this._colorDirty = false;
      _this.uvMatrix = new core.TextureMatrix(uSampler);
      _this.batchable = options.program === void 0;
      _this.pluginName = options.pluginName;
      _this.tint = options.tint;
      _this.alpha = options.alpha;
      return _this;
    }
    Object.defineProperty(MeshMaterial2.prototype, "texture", {
      get: function() {
        return this.uniforms.uSampler;
      },
      set: function(value) {
        if (this.uniforms.uSampler !== value) {
          this.uniforms.uSampler = value;
          this.uvMatrix.texture = value;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(MeshMaterial2.prototype, "alpha", {
      get: function() {
        return this._alpha;
      },
      set: function(value) {
        if (value === this._alpha) {
          return;
        }
        this._alpha = value;
        this._colorDirty = true;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(MeshMaterial2.prototype, "tint", {
      get: function() {
        return this._tint;
      },
      set: function(value) {
        if (value === this._tint) {
          return;
        }
        this._tint = value;
        this._tintRGB = (value >> 16) + (value & 65280) + ((value & 255) << 16);
        this._colorDirty = true;
      },
      enumerable: false,
      configurable: true
    });
    MeshMaterial2.prototype.update = function() {
      if (this._colorDirty) {
        this._colorDirty = false;
        var baseTexture = this.texture.baseTexture;
        utils.premultiplyTintToRgba(this._tint, this._alpha, this.uniforms.uColor, baseTexture.alphaMode);
      }
      if (this.uvMatrix.update()) {
        this.uniforms.uTextureMatrix = this.uvMatrix.mapCoord;
      }
    };
    return MeshMaterial2;
  }(core.Shader);
  var MeshGeometry = function(_super) {
    __extends(MeshGeometry2, _super);
    function MeshGeometry2(vertices, uvs, index) {
      var _this = _super.call(this) || this;
      var verticesBuffer = new core.Buffer(vertices);
      var uvsBuffer = new core.Buffer(uvs, true);
      var indexBuffer = new core.Buffer(index, true, true);
      _this.addAttribute("aVertexPosition", verticesBuffer, 2, false, constants.TYPES.FLOAT).addAttribute("aTextureCoord", uvsBuffer, 2, false, constants.TYPES.FLOAT).addIndex(indexBuffer);
      _this._updateId = -1;
      return _this;
    }
    Object.defineProperty(MeshGeometry2.prototype, "vertexDirtyId", {
      get: function() {
        return this.buffers[0]._updateID;
      },
      enumerable: false,
      configurable: true
    });
    return MeshGeometry2;
  }(core.Geometry);
  exports2.Mesh = Mesh;
  exports2.MeshBatchUvs = MeshBatchUvs;
  exports2.MeshGeometry = MeshGeometry;
  exports2.MeshMaterial = MeshMaterial;
});

// node_modules/@pixi/text-bitmap/lib/text-bitmap.js
var require_text_bitmap = __commonJS((exports2) => {
  /*!
   * @pixi/text-bitmap - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/text-bitmap is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var math = require_math();
  var settings = require_settings();
  var mesh = require_mesh();
  var utils = require_utils();
  var core = require_core();
  var text = require_text();
  var display = require_display();
  var loaders = require_loaders();
  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0
  
  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.
  
  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || {__proto__: []} instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) {
        if (b2.hasOwnProperty(p)) {
          d2[p] = b2[p];
        }
      }
    };
    return extendStatics(d, b);
  };
  function __extends(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  var BitmapFontData = function() {
    function BitmapFontData2() {
      this.info = [];
      this.common = [];
      this.page = [];
      this.char = [];
      this.kerning = [];
    }
    return BitmapFontData2;
  }();
  var TextFormat = function() {
    function TextFormat2() {
    }
    TextFormat2.test = function(data) {
      return typeof data === "string" && data.indexOf("info face=") === 0;
    };
    TextFormat2.parse = function(txt) {
      var items = txt.match(/^[a-z]+\s+.+$/gm);
      var rawData = {
        info: [],
        common: [],
        page: [],
        char: [],
        chars: [],
        kerning: [],
        kernings: []
      };
      for (var i in items) {
        var name = items[i].match(/^[a-z]+/gm)[0];
        var attributeList = items[i].match(/[a-zA-Z]+=([^\s"']+|"([^"]*)")/gm);
        var itemData = {};
        for (var i_1 in attributeList) {
          var split = attributeList[i_1].split("=");
          var key = split[0];
          var strValue = split[1].replace(/"/gm, "");
          var floatValue = parseFloat(strValue);
          var value = isNaN(floatValue) ? strValue : floatValue;
          itemData[key] = value;
        }
        rawData[name].push(itemData);
      }
      var font = new BitmapFontData();
      rawData.info.forEach(function(info) {
        return font.info.push({
          face: info.face,
          size: parseInt(info.size, 10)
        });
      });
      rawData.common.forEach(function(common) {
        return font.common.push({
          lineHeight: parseInt(common.lineHeight, 10)
        });
      });
      rawData.page.forEach(function(page) {
        return font.page.push({
          id: parseInt(page.id, 10),
          file: page.file
        });
      });
      rawData.char.forEach(function(char) {
        return font.char.push({
          id: parseInt(char.id, 10),
          page: parseInt(char.page, 10),
          x: parseInt(char.x, 10),
          y: parseInt(char.y, 10),
          width: parseInt(char.width, 10),
          height: parseInt(char.height, 10),
          xoffset: parseInt(char.xoffset, 10),
          yoffset: parseInt(char.yoffset, 10),
          xadvance: parseInt(char.xadvance, 10)
        });
      });
      rawData.kerning.forEach(function(kerning) {
        return font.kerning.push({
          first: parseInt(kerning.first, 10),
          second: parseInt(kerning.second, 10),
          amount: parseInt(kerning.amount, 10)
        });
      });
      return font;
    };
    return TextFormat2;
  }();
  var XMLFormat = function() {
    function XMLFormat2() {
    }
    XMLFormat2.test = function(data) {
      return data instanceof XMLDocument && data.getElementsByTagName("page").length && data.getElementsByTagName("info")[0].getAttribute("face") !== null;
    };
    XMLFormat2.parse = function(xml) {
      var data = new BitmapFontData();
      var info = xml.getElementsByTagName("info");
      var common = xml.getElementsByTagName("common");
      var page = xml.getElementsByTagName("page");
      var char = xml.getElementsByTagName("char");
      var kerning = xml.getElementsByTagName("kerning");
      for (var i = 0; i < info.length; i++) {
        data.info.push({
          face: info[i].getAttribute("face"),
          size: parseInt(info[i].getAttribute("size"), 10)
        });
      }
      for (var i = 0; i < common.length; i++) {
        data.common.push({
          lineHeight: parseInt(common[i].getAttribute("lineHeight"), 10)
        });
      }
      for (var i = 0; i < page.length; i++) {
        data.page.push({
          id: parseInt(page[i].getAttribute("id"), 10) || 0,
          file: page[i].getAttribute("file")
        });
      }
      for (var i = 0; i < char.length; i++) {
        var letter = char[i];
        data.char.push({
          id: parseInt(letter.getAttribute("id"), 10),
          page: parseInt(letter.getAttribute("page"), 10) || 0,
          x: parseInt(letter.getAttribute("x"), 10),
          y: parseInt(letter.getAttribute("y"), 10),
          width: parseInt(letter.getAttribute("width"), 10),
          height: parseInt(letter.getAttribute("height"), 10),
          xoffset: parseInt(letter.getAttribute("xoffset"), 10),
          yoffset: parseInt(letter.getAttribute("yoffset"), 10),
          xadvance: parseInt(letter.getAttribute("xadvance"), 10)
        });
      }
      for (var i = 0; i < kerning.length; i++) {
        data.kerning.push({
          first: parseInt(kerning[i].getAttribute("first"), 10),
          second: parseInt(kerning[i].getAttribute("second"), 10),
          amount: parseInt(kerning[i].getAttribute("amount"), 10)
        });
      }
      return data;
    };
    return XMLFormat2;
  }();
  var XMLStringFormat = function() {
    function XMLStringFormat2() {
    }
    XMLStringFormat2.test = function(data) {
      if (typeof data === "string" && data.indexOf("<font>") > -1) {
        var xml = new self.DOMParser().parseFromString(data, "text/xml");
        return XMLFormat.test(xml);
      }
      return false;
    };
    XMLStringFormat2.parse = function(xmlTxt) {
      var xml = new window.DOMParser().parseFromString(xmlTxt, "text/xml");
      return XMLFormat.parse(xml);
    };
    return XMLStringFormat2;
  }();
  var formats = [
    TextFormat,
    XMLFormat,
    XMLStringFormat
  ];
  function autoDetectFormat(data) {
    for (var i = 0; i < formats.length; i++) {
      if (formats[i].test(data)) {
        return formats[i];
      }
    }
    return null;
  }
  function generateFillStyle(canvas, context, style, resolution, lines, metrics) {
    var fillStyle = style.fill;
    if (!Array.isArray(fillStyle)) {
      return fillStyle;
    } else if (fillStyle.length === 1) {
      return fillStyle[0];
    }
    var gradient;
    var dropShadowCorrection = style.dropShadow ? style.dropShadowDistance : 0;
    var padding = style.padding || 0;
    var width = Math.ceil(canvas.width / resolution) - dropShadowCorrection - padding * 2;
    var height = Math.ceil(canvas.height / resolution) - dropShadowCorrection - padding * 2;
    var fill = fillStyle.slice();
    var fillGradientStops = style.fillGradientStops.slice();
    if (!fillGradientStops.length) {
      var lengthPlus1 = fill.length + 1;
      for (var i = 1; i < lengthPlus1; ++i) {
        fillGradientStops.push(i / lengthPlus1);
      }
    }
    fill.unshift(fillStyle[0]);
    fillGradientStops.unshift(0);
    fill.push(fillStyle[fillStyle.length - 1]);
    fillGradientStops.push(1);
    if (style.fillGradientType === text.TEXT_GRADIENT.LINEAR_VERTICAL) {
      gradient = context.createLinearGradient(width / 2, padding, width / 2, height + padding);
      var lastIterationStop = 0;
      var textHeight = metrics.fontProperties.fontSize + style.strokeThickness;
      var gradStopLineHeight = textHeight / height;
      for (var i = 0; i < lines.length; i++) {
        var thisLineTop = metrics.lineHeight * i;
        for (var j = 0; j < fill.length; j++) {
          var lineStop = 0;
          if (typeof fillGradientStops[j] === "number") {
            lineStop = fillGradientStops[j];
          } else {
            lineStop = j / fill.length;
          }
          var globalStop = thisLineTop / height + lineStop * gradStopLineHeight;
          var clampedStop = Math.max(lastIterationStop, globalStop);
          clampedStop = Math.min(clampedStop, 1);
          gradient.addColorStop(clampedStop, fill[j]);
          lastIterationStop = clampedStop;
        }
      }
    } else {
      gradient = context.createLinearGradient(padding, height / 2, width + padding, height / 2);
      var totalIterations = fill.length + 1;
      var currentIteration = 1;
      for (var i = 0; i < fill.length; i++) {
        var stop = void 0;
        if (typeof fillGradientStops[i] === "number") {
          stop = fillGradientStops[i];
        } else {
          stop = currentIteration / totalIterations;
        }
        gradient.addColorStop(stop, fill[i]);
        currentIteration++;
      }
    }
    return gradient;
  }
  function drawGlyph(canvas, context, metrics, x, y, resolution, style) {
    var char = metrics.text;
    var fontProperties = metrics.fontProperties;
    context.translate(x, y);
    context.scale(resolution, resolution);
    var tx = style.strokeThickness / 2;
    var ty = -(style.strokeThickness / 2);
    context.font = style.toFontString();
    context.lineWidth = style.strokeThickness;
    context.textBaseline = style.textBaseline;
    context.lineJoin = style.lineJoin;
    context.miterLimit = style.miterLimit;
    context.fillStyle = generateFillStyle(canvas, context, style, resolution, [char], metrics);
    context.strokeStyle = style.stroke;
    context.font = style.toFontString();
    context.lineWidth = style.strokeThickness;
    context.textBaseline = style.textBaseline;
    context.lineJoin = style.lineJoin;
    context.miterLimit = style.miterLimit;
    context.fillStyle = generateFillStyle(canvas, context, style, resolution, [char], metrics);
    context.strokeStyle = style.stroke;
    var dropShadowColor = style.dropShadowColor;
    var rgb = utils.hex2rgb(typeof dropShadowColor === "number" ? dropShadowColor : utils.string2hex(dropShadowColor));
    if (style.dropShadow) {
      context.shadowColor = "rgba(" + rgb[0] * 255 + "," + rgb[1] * 255 + "," + rgb[2] * 255 + "," + style.dropShadowAlpha + ")";
      context.shadowBlur = style.dropShadowBlur;
      context.shadowOffsetX = Math.cos(style.dropShadowAngle) * style.dropShadowDistance;
      context.shadowOffsetY = Math.sin(style.dropShadowAngle) * style.dropShadowDistance;
    } else {
      context.shadowColor = "black";
      context.shadowBlur = 0;
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 0;
    }
    if (style.stroke && style.strokeThickness) {
      context.strokeText(char, tx, ty + metrics.lineHeight - fontProperties.descent);
    }
    if (style.fill) {
      context.fillText(char, tx, ty + metrics.lineHeight - fontProperties.descent);
    }
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = "rgba(0, 0, 0, 0)";
  }
  function resolveCharacters(chars) {
    if (typeof chars === "string") {
      chars = [chars];
    }
    var result = [];
    for (var i = 0, j = chars.length; i < j; i++) {
      var item = chars[i];
      if (Array.isArray(item)) {
        if (item.length !== 2) {
          throw new Error("[BitmapFont]: Invalid character range length, expecting 2 got " + item.length + ".");
        }
        var startCode = item[0].charCodeAt(0);
        var endCode = item[1].charCodeAt(0);
        if (endCode < startCode) {
          throw new Error("[BitmapFont]: Invalid character range.");
        }
        for (var i_1 = startCode, j_1 = endCode; i_1 <= j_1; i_1++) {
          result.push(String.fromCharCode(i_1));
        }
      } else {
        result.push.apply(result, item.split(""));
      }
    }
    if (result.length === 0) {
      throw new Error("[BitmapFont]: Empty set when resolving characters.");
    }
    return result;
  }
  var BitmapFont = function() {
    function BitmapFont2(data, textures) {
      var info = data.info[0];
      var common = data.common[0];
      var page = data.page[0];
      var res = utils.getResolutionOfUrl(page.file);
      var pageTextures = {};
      this.font = info.face;
      this.size = info.size;
      this.lineHeight = common.lineHeight / res;
      this.chars = {};
      this.pageTextures = pageTextures;
      for (var i = 0; i < data.page.length; i++) {
        var _a = data.page[i], id = _a.id, file = _a.file;
        pageTextures[id] = textures instanceof Array ? textures[i] : textures[file];
      }
      for (var i = 0; i < data.char.length; i++) {
        var _b = data.char[i], id = _b.id, page_1 = _b.page;
        var _c = data.char[i], x = _c.x, y = _c.y, width = _c.width, height = _c.height, xoffset = _c.xoffset, yoffset = _c.yoffset, xadvance = _c.xadvance;
        x /= res;
        y /= res;
        width /= res;
        height /= res;
        xoffset /= res;
        yoffset /= res;
        xadvance /= res;
        var rect = new math.Rectangle(x + pageTextures[page_1].frame.x / res, y + pageTextures[page_1].frame.y / res, width, height);
        this.chars[id] = {
          xOffset: xoffset,
          yOffset: yoffset,
          xAdvance: xadvance,
          kerning: {},
          texture: new core.Texture(pageTextures[page_1].baseTexture, rect),
          page: page_1
        };
      }
      for (var i = 0; i < data.kerning.length; i++) {
        var _d = data.kerning[i], first = _d.first, second = _d.second, amount = _d.amount;
        first /= res;
        second /= res;
        amount /= res;
        if (this.chars[second]) {
          this.chars[second].kerning[first] = amount;
        }
      }
    }
    BitmapFont2.prototype.destroy = function() {
      for (var id in this.chars) {
        this.chars[id].texture.destroy();
        this.chars[id].texture = null;
      }
      for (var id in this.pageTextures) {
        this.pageTextures[id].destroy(true);
        this.pageTextures[id] = null;
      }
      this.chars = null;
      this.pageTextures = null;
    };
    BitmapFont2.install = function(data, textures) {
      var fontData;
      if (data instanceof BitmapFontData) {
        fontData = data;
      } else {
        var format = autoDetectFormat(data);
        if (!format) {
          throw new Error("Unrecognized data format for font.");
        }
        fontData = format.parse(data);
      }
      if (textures instanceof core.Texture) {
        textures = [textures];
      }
      var font = new BitmapFont2(fontData, textures);
      BitmapFont2.available[font.font] = font;
      return font;
    };
    BitmapFont2.uninstall = function(name) {
      var font = BitmapFont2.available[name];
      if (!font) {
        throw new Error("No font found named '" + name + "'");
      }
      font.destroy();
      delete BitmapFont2.available[name];
    };
    BitmapFont2.from = function(name, textStyle, options) {
      if (!name) {
        throw new Error("[BitmapFont] Property `name` is required.");
      }
      var _a = Object.assign({}, BitmapFont2.defaultOptions, options), chars = _a.chars, padding = _a.padding, resolution = _a.resolution, textureWidth = _a.textureWidth, textureHeight = _a.textureHeight;
      var charsList = resolveCharacters(chars);
      var style = textStyle instanceof text.TextStyle ? textStyle : new text.TextStyle(textStyle);
      var lineWidth = textureWidth;
      var fontData = new BitmapFontData();
      fontData.info[0] = {
        face: style.fontFamily,
        size: style.fontSize
      };
      fontData.common[0] = {
        lineHeight: style.fontSize
      };
      var positionX = 0;
      var positionY = 0;
      var canvas;
      var context;
      var baseTexture;
      var maxCharHeight = 0;
      var textures = [];
      for (var i = 0; i < charsList.length; i++) {
        if (!canvas) {
          canvas = document.createElement("canvas");
          canvas.width = textureWidth;
          canvas.height = textureHeight;
          context = canvas.getContext("2d");
          baseTexture = new core.BaseTexture(canvas, {resolution});
          textures.push(new core.Texture(baseTexture));
          fontData.page.push({
            id: textures.length - 1,
            file: ""
          });
        }
        var metrics = text.TextMetrics.measureText(charsList[i], style, false, canvas);
        var width = metrics.width;
        var height = Math.ceil(metrics.height);
        var textureGlyphWidth = Math.ceil((style.fontStyle === "italic" ? 2 : 1) * width);
        if (positionY >= textureHeight - height * resolution) {
          if (positionY === 0) {
            throw new Error("[BitmapFont] textureHeight " + textureHeight + "px is " + ("too small for " + style.fontSize + "px fonts"));
          }
          --i;
          canvas = null;
          context = null;
          baseTexture = null;
          positionY = 0;
          positionX = 0;
          maxCharHeight = 0;
          continue;
        }
        maxCharHeight = Math.max(height + metrics.fontProperties.descent, maxCharHeight);
        if (textureGlyphWidth * resolution + positionX >= lineWidth) {
          --i;
          positionY += maxCharHeight * resolution;
          positionY = Math.ceil(positionY);
          positionX = 0;
          maxCharHeight = 0;
          continue;
        }
        drawGlyph(canvas, context, metrics, positionX, positionY, resolution, style);
        var id = metrics.text.charCodeAt(0);
        fontData.char.push({
          id,
          page: textures.length - 1,
          x: positionX / resolution,
          y: positionY / resolution,
          width: textureGlyphWidth,
          height,
          xoffset: 0,
          yoffset: 0,
          xadvance: Math.ceil(width - (style.dropShadow ? style.dropShadowDistance : 0) - (style.stroke ? style.strokeThickness : 0))
        });
        positionX += (textureGlyphWidth + 2 * padding) * resolution;
        positionX = Math.ceil(positionX);
      }
      var font = new BitmapFont2(fontData, textures);
      if (BitmapFont2.available[name] !== void 0) {
        BitmapFont2.uninstall(name);
      }
      BitmapFont2.available[name] = font;
      return font;
    };
    BitmapFont2.ALPHA = [["a", "z"], ["A", "Z"], " "];
    BitmapFont2.NUMERIC = [["0", "9"]];
    BitmapFont2.ALPHANUMERIC = [["a", "z"], ["A", "Z"], ["0", "9"], " "];
    BitmapFont2.ASCII = [[" ", "~"]];
    BitmapFont2.defaultOptions = {
      resolution: 1,
      textureWidth: 512,
      textureHeight: 512,
      padding: 4,
      chars: BitmapFont2.ALPHANUMERIC
    };
    BitmapFont2.available = {};
    return BitmapFont2;
  }();
  var pageMeshDataPool = [];
  var charRenderDataPool = [];
  var BitmapText = function(_super) {
    __extends(BitmapText2, _super);
    function BitmapText2(text2, style) {
      if (style === void 0) {
        style = {};
      }
      var _this = _super.call(this) || this;
      _this._tint = 16777215;
      if (style.font) {
        utils.deprecation("5.3.0", "PIXI.BitmapText constructor style.font property is deprecated.");
        _this._upgradeStyle(style);
      }
      var _a = Object.assign({}, BitmapText2.styleDefaults, style), align = _a.align, tint = _a.tint, maxWidth = _a.maxWidth, letterSpacing = _a.letterSpacing, fontName = _a.fontName, fontSize = _a.fontSize;
      if (!BitmapFont.available[fontName]) {
        throw new Error('Missing BitmapFont "' + fontName + '"');
      }
      _this._activePagesMeshData = [];
      _this._textWidth = 0;
      _this._textHeight = 0;
      _this._align = align;
      _this._tint = tint;
      _this._fontName = fontName;
      _this._fontSize = fontSize || BitmapFont.available[fontName].size;
      _this._text = text2;
      _this._maxWidth = maxWidth;
      _this._maxLineHeight = 0;
      _this._letterSpacing = letterSpacing;
      _this._anchor = new math.ObservablePoint(function() {
        _this.dirty = true;
      }, _this, 0, 0);
      _this._roundPixels = settings.settings.ROUND_PIXELS;
      _this.dirty = true;
      _this._textureCache = {};
      return _this;
    }
    BitmapText2.prototype.updateText = function() {
      var _a;
      var data = BitmapFont.available[this._fontName];
      var scale = this._fontSize / data.size;
      var pos = new math.Point();
      var chars = [];
      var lineWidths = [];
      var text2 = this._text.replace(/(?:\r\n|\r)/g, "\n") || " ";
      var textLength = text2.length;
      var maxWidth = this._maxWidth * data.size / this._fontSize;
      var prevCharCode = null;
      var lastLineWidth = 0;
      var maxLineWidth = 0;
      var line = 0;
      var lastBreakPos = -1;
      var lastBreakWidth = 0;
      var spacesRemoved = 0;
      var maxLineHeight = 0;
      for (var i = 0; i < textLength; i++) {
        var charCode = text2.charCodeAt(i);
        var char = text2.charAt(i);
        if (/(?:\s)/.test(char)) {
          lastBreakPos = i;
          lastBreakWidth = lastLineWidth;
        }
        if (char === "\r" || char === "\n") {
          lineWidths.push(lastLineWidth);
          maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
          ++line;
          ++spacesRemoved;
          pos.x = 0;
          pos.y += data.lineHeight;
          prevCharCode = null;
          continue;
        }
        var charData = data.chars[charCode];
        if (!charData) {
          continue;
        }
        if (prevCharCode && charData.kerning[prevCharCode]) {
          pos.x += charData.kerning[prevCharCode];
        }
        var charRenderData = charRenderDataPool.pop() || {
          texture: core.Texture.EMPTY,
          line: 0,
          charCode: 0,
          position: new math.Point()
        };
        charRenderData.texture = charData.texture;
        charRenderData.line = line;
        charRenderData.charCode = charCode;
        charRenderData.position.x = pos.x + charData.xOffset + this._letterSpacing / 2;
        charRenderData.position.y = pos.y + charData.yOffset;
        chars.push(charRenderData);
        pos.x += charData.xAdvance + this._letterSpacing;
        lastLineWidth = pos.x;
        maxLineHeight = Math.max(maxLineHeight, charData.yOffset + charData.texture.height);
        prevCharCode = charCode;
        if (lastBreakPos !== -1 && maxWidth > 0 && pos.x > maxWidth) {
          ++spacesRemoved;
          utils.removeItems(chars, 1 + lastBreakPos - spacesRemoved, 1 + i - lastBreakPos);
          i = lastBreakPos;
          lastBreakPos = -1;
          lineWidths.push(lastBreakWidth);
          maxLineWidth = Math.max(maxLineWidth, lastBreakWidth);
          line++;
          pos.x = 0;
          pos.y += data.lineHeight;
          prevCharCode = null;
        }
      }
      var lastChar = text2.charAt(text2.length - 1);
      if (lastChar !== "\r" && lastChar !== "\n") {
        if (/(?:\s)/.test(lastChar)) {
          lastLineWidth = lastBreakWidth;
        }
        lineWidths.push(lastLineWidth);
        maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
      }
      var lineAlignOffsets = [];
      for (var i = 0; i <= line; i++) {
        var alignOffset = 0;
        if (this._align === "right") {
          alignOffset = maxLineWidth - lineWidths[i];
        } else if (this._align === "center") {
          alignOffset = (maxLineWidth - lineWidths[i]) / 2;
        }
        lineAlignOffsets.push(alignOffset);
      }
      var lenChars = chars.length;
      var pagesMeshData = {};
      var newPagesMeshData = [];
      var activePagesMeshData = this._activePagesMeshData;
      for (var i = 0; i < activePagesMeshData.length; i++) {
        pageMeshDataPool.push(activePagesMeshData[i]);
      }
      for (var i = 0; i < lenChars; i++) {
        var texture = chars[i].texture;
        var baseTextureUid = texture.baseTexture.uid;
        if (!pagesMeshData[baseTextureUid]) {
          var pageMeshData = pageMeshDataPool.pop();
          if (!pageMeshData) {
            var geometry = new mesh.MeshGeometry();
            var material = new mesh.MeshMaterial(core.Texture.EMPTY);
            var mesh$1 = new mesh.Mesh(geometry, material);
            pageMeshData = {
              index: 0,
              indexCount: 0,
              vertexCount: 0,
              uvsCount: 0,
              total: 0,
              mesh: mesh$1,
              vertices: null,
              uvs: null,
              indices: null
            };
          }
          pageMeshData.index = 0;
          pageMeshData.indexCount = 0;
          pageMeshData.vertexCount = 0;
          pageMeshData.uvsCount = 0;
          pageMeshData.total = 0;
          var _textureCache = this._textureCache;
          _textureCache[baseTextureUid] = _textureCache[baseTextureUid] || new core.Texture(texture.baseTexture);
          pageMeshData.mesh.texture = _textureCache[baseTextureUid];
          pageMeshData.mesh.tint = this._tint;
          newPagesMeshData.push(pageMeshData);
          pagesMeshData[baseTextureUid] = pageMeshData;
        }
        pagesMeshData[baseTextureUid].total++;
      }
      for (var i = 0; i < activePagesMeshData.length; i++) {
        if (newPagesMeshData.indexOf(activePagesMeshData[i]) === -1) {
          this.removeChild(activePagesMeshData[i].mesh);
        }
      }
      for (var i = 0; i < newPagesMeshData.length; i++) {
        if (newPagesMeshData[i].mesh.parent !== this) {
          this.addChild(newPagesMeshData[i].mesh);
        }
      }
      this._activePagesMeshData = newPagesMeshData;
      for (var i in pagesMeshData) {
        var pageMeshData = pagesMeshData[i];
        var total = pageMeshData.total;
        if (!(((_a = pageMeshData.indices) === null || _a === void 0 ? void 0 : _a.length) > 6 * total) || pageMeshData.vertices.length < mesh.Mesh.BATCHABLE_SIZE * 2) {
          pageMeshData.vertices = new Float32Array(4 * 2 * total);
          pageMeshData.uvs = new Float32Array(4 * 2 * total);
          pageMeshData.indices = new Uint16Array(6 * total);
        } else {
          var total_1 = pageMeshData.total;
          var vertices = pageMeshData.vertices;
          for (var i_1 = total_1 * 4 * 2; i_1 < vertices.length; i_1++) {
            vertices[i_1] = 0;
          }
        }
        pageMeshData.mesh.size = 6 * total;
      }
      for (var i = 0; i < lenChars; i++) {
        var char = chars[i];
        var offset = char.position.x + lineAlignOffsets[char.line];
        if (this._roundPixels) {
          offset = Math.round(offset);
        }
        var xPos = offset * scale;
        var yPos = char.position.y * scale;
        var texture = char.texture;
        var pageMesh = pagesMeshData[texture.baseTexture.uid];
        var textureFrame = texture.frame;
        var textureUvs = texture._uvs;
        var index = pageMesh.index++;
        pageMesh.indices[index * 6 + 0] = 0 + index * 4;
        pageMesh.indices[index * 6 + 1] = 1 + index * 4;
        pageMesh.indices[index * 6 + 2] = 2 + index * 4;
        pageMesh.indices[index * 6 + 3] = 0 + index * 4;
        pageMesh.indices[index * 6 + 4] = 2 + index * 4;
        pageMesh.indices[index * 6 + 5] = 3 + index * 4;
        pageMesh.vertices[index * 8 + 0] = xPos;
        pageMesh.vertices[index * 8 + 1] = yPos;
        pageMesh.vertices[index * 8 + 2] = xPos + textureFrame.width * scale;
        pageMesh.vertices[index * 8 + 3] = yPos;
        pageMesh.vertices[index * 8 + 4] = xPos + textureFrame.width * scale;
        pageMesh.vertices[index * 8 + 5] = yPos + textureFrame.height * scale;
        pageMesh.vertices[index * 8 + 6] = xPos;
        pageMesh.vertices[index * 8 + 7] = yPos + textureFrame.height * scale;
        pageMesh.uvs[index * 8 + 0] = textureUvs.x0;
        pageMesh.uvs[index * 8 + 1] = textureUvs.y0;
        pageMesh.uvs[index * 8 + 2] = textureUvs.x1;
        pageMesh.uvs[index * 8 + 3] = textureUvs.y1;
        pageMesh.uvs[index * 8 + 4] = textureUvs.x2;
        pageMesh.uvs[index * 8 + 5] = textureUvs.y2;
        pageMesh.uvs[index * 8 + 6] = textureUvs.x3;
        pageMesh.uvs[index * 8 + 7] = textureUvs.y3;
      }
      this._textWidth = maxLineWidth * scale;
      this._textHeight = (pos.y + data.lineHeight) * scale;
      for (var i in pagesMeshData) {
        var pageMeshData = pagesMeshData[i];
        if (this.anchor.x !== 0 || this.anchor.y !== 0) {
          var vertexCount = 0;
          var anchorOffsetX = this._textWidth * this.anchor.x;
          var anchorOffsetY = this._textHeight * this.anchor.y;
          for (var i_2 = 0; i_2 < pageMeshData.total; i_2++) {
            pageMeshData.vertices[vertexCount++] -= anchorOffsetX;
            pageMeshData.vertices[vertexCount++] -= anchorOffsetY;
            pageMeshData.vertices[vertexCount++] -= anchorOffsetX;
            pageMeshData.vertices[vertexCount++] -= anchorOffsetY;
            pageMeshData.vertices[vertexCount++] -= anchorOffsetX;
            pageMeshData.vertices[vertexCount++] -= anchorOffsetY;
            pageMeshData.vertices[vertexCount++] -= anchorOffsetX;
            pageMeshData.vertices[vertexCount++] -= anchorOffsetY;
          }
        }
        this._maxLineHeight = maxLineHeight * scale;
        var vertexBuffer = pageMeshData.mesh.geometry.getBuffer("aVertexPosition");
        var textureBuffer = pageMeshData.mesh.geometry.getBuffer("aTextureCoord");
        var indexBuffer = pageMeshData.mesh.geometry.getIndex();
        vertexBuffer.data = pageMeshData.vertices;
        textureBuffer.data = pageMeshData.uvs;
        indexBuffer.data = pageMeshData.indices;
        vertexBuffer.update();
        textureBuffer.update();
        indexBuffer.update();
      }
      for (var i = 0; i < chars.length; i++) {
        charRenderDataPool.push(chars[i]);
      }
    };
    BitmapText2.prototype.updateTransform = function() {
      this.validate();
      this.containerUpdateTransform();
    };
    BitmapText2.prototype.getLocalBounds = function() {
      this.validate();
      return _super.prototype.getLocalBounds.call(this);
    };
    BitmapText2.prototype.validate = function() {
      if (this.dirty) {
        this.updateText();
        this.dirty = false;
      }
    };
    Object.defineProperty(BitmapText2.prototype, "tint", {
      get: function() {
        return this._tint;
      },
      set: function(value) {
        if (this._tint === value) {
          return;
        }
        this._tint = value;
        for (var i = 0; i < this._activePagesMeshData.length; i++) {
          this._activePagesMeshData[i].mesh.tint = value;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(BitmapText2.prototype, "align", {
      get: function() {
        return this._align;
      },
      set: function(value) {
        if (this._align !== value) {
          this._align = value;
          this.dirty = true;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(BitmapText2.prototype, "fontName", {
      get: function() {
        return this._fontName;
      },
      set: function(value) {
        if (!BitmapFont.available[value]) {
          throw new Error('Missing BitmapFont "' + value + '"');
        }
        if (this._fontName !== value) {
          this._fontName = value;
          this.dirty = true;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(BitmapText2.prototype, "fontSize", {
      get: function() {
        return this._fontSize;
      },
      set: function(value) {
        if (this._fontSize !== value) {
          this._fontSize = value;
          this.dirty = true;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(BitmapText2.prototype, "anchor", {
      get: function() {
        return this._anchor;
      },
      set: function(value) {
        if (typeof value === "number") {
          this._anchor.set(value);
        } else {
          this._anchor.copyFrom(value);
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(BitmapText2.prototype, "text", {
      get: function() {
        return this._text;
      },
      set: function(text2) {
        text2 = String(text2 === null || text2 === void 0 ? "" : text2);
        if (this._text === text2) {
          return;
        }
        this._text = text2;
        this.dirty = true;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(BitmapText2.prototype, "maxWidth", {
      get: function() {
        return this._maxWidth;
      },
      set: function(value) {
        if (this._maxWidth === value) {
          return;
        }
        this._maxWidth = value;
        this.dirty = true;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(BitmapText2.prototype, "maxLineHeight", {
      get: function() {
        this.validate();
        return this._maxLineHeight;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(BitmapText2.prototype, "textWidth", {
      get: function() {
        this.validate();
        return this._textWidth;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(BitmapText2.prototype, "letterSpacing", {
      get: function() {
        return this._letterSpacing;
      },
      set: function(value) {
        if (this._letterSpacing !== value) {
          this._letterSpacing = value;
          this.dirty = true;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(BitmapText2.prototype, "roundPixels", {
      get: function() {
        return this._roundPixels;
      },
      set: function(value) {
        if (value !== this._roundPixels) {
          this._roundPixels = value;
          this.dirty = true;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(BitmapText2.prototype, "textHeight", {
      get: function() {
        this.validate();
        return this._textHeight;
      },
      enumerable: false,
      configurable: true
    });
    BitmapText2.prototype._upgradeStyle = function(style) {
      if (typeof style.font === "string") {
        var valueSplit = style.font.split(" ");
        style.fontName = valueSplit.length === 1 ? valueSplit[0] : valueSplit.slice(1).join(" ");
        if (valueSplit.length >= 2) {
          style.fontSize = parseInt(valueSplit[0], 10);
        }
      } else {
        style.fontName = style.font.name;
        style.fontSize = typeof style.font.size === "number" ? style.font.size : parseInt(style.font.size, 10);
      }
    };
    BitmapText2.prototype.destroy = function(options) {
      var _textureCache = this._textureCache;
      for (var id in _textureCache) {
        var texture = _textureCache[id];
        texture.destroy();
        delete _textureCache[id];
      }
      this._textureCache = null;
      _super.prototype.destroy.call(this, options);
    };
    BitmapText2.registerFont = function(data, textures) {
      utils.deprecation("5.3.0", "PIXI.BitmapText.registerFont is deprecated, use PIXI.BitmapFont.install");
      return BitmapFont.install(data, textures);
    };
    Object.defineProperty(BitmapText2, "fonts", {
      get: function() {
        utils.deprecation("5.3.0", "PIXI.BitmapText.fonts is deprecated, use PIXI.BitmapFont.available");
        return BitmapFont.available;
      },
      enumerable: false,
      configurable: true
    });
    BitmapText2.styleDefaults = {
      align: "left",
      tint: 16777215,
      maxWidth: 0,
      letterSpacing: 0
    };
    return BitmapText2;
  }(display.Container);
  var BitmapFontLoader = function() {
    function BitmapFontLoader2() {
    }
    BitmapFontLoader2.add = function() {
      loaders.LoaderResource.setExtensionXhrType("fnt", loaders.LoaderResource.XHR_RESPONSE_TYPE.TEXT);
    };
    BitmapFontLoader2.use = function(resource, next) {
      var format = autoDetectFormat(resource.data);
      if (!format) {
        next();
        return;
      }
      var baseUrl = BitmapFontLoader2.getBaseUrl(this, resource);
      var data = format.parse(resource.data);
      var textures = {};
      var completed = function(page) {
        textures[page.metadata.pageFile] = page.texture;
        if (Object.keys(textures).length === data.page.length) {
          resource.bitmapFont = BitmapFont.install(data, textures);
          next();
        }
      };
      for (var i = 0; i < data.page.length; ++i) {
        var pageFile = data.page[i].file;
        var url = baseUrl + pageFile;
        var exists = false;
        for (var name in this.resources) {
          var bitmapResource = this.resources[name];
          if (bitmapResource.url === url) {
            bitmapResource.metadata.pageFile = pageFile;
            if (bitmapResource.texture) {
              completed(bitmapResource);
            } else {
              bitmapResource.onAfterMiddleware.add(completed);
            }
            exists = true;
            break;
          }
        }
        if (!exists) {
          var options = {
            crossOrigin: resource.crossOrigin,
            loadType: loaders.LoaderResource.LOAD_TYPE.IMAGE,
            metadata: Object.assign({pageFile}, resource.metadata.imageMetadata),
            parentResource: resource
          };
          this.add(url, options, completed);
        }
      }
    };
    BitmapFontLoader2.getBaseUrl = function(loader, resource) {
      var resUrl = !resource.isDataUrl ? BitmapFontLoader2.dirname(resource.url) : "";
      if (resource.isDataUrl) {
        if (resUrl === ".") {
          resUrl = "";
        }
        if (loader.baseUrl && resUrl) {
          if (loader.baseUrl.charAt(loader.baseUrl.length - 1) === "/") {
            resUrl += "/";
          }
        }
      }
      resUrl = resUrl.replace(loader.baseUrl, "");
      if (resUrl && resUrl.charAt(resUrl.length - 1) !== "/") {
        resUrl += "/";
      }
      return resUrl;
    };
    BitmapFontLoader2.dirname = function(url) {
      var dir = url.replace(/\\/g, "/").replace(/\/$/, "").replace(/\/[^\/]*$/, "");
      if (dir === url) {
        return ".";
      } else if (dir === "") {
        return "/";
      }
      return dir;
    };
    return BitmapFontLoader2;
  }();
  exports2.BitmapFont = BitmapFont;
  exports2.BitmapFontData = BitmapFontData;
  exports2.BitmapFontLoader = BitmapFontLoader;
  exports2.BitmapText = BitmapText;
});

// node_modules/@pixi/filter-alpha/lib/filter-alpha.js
var require_filter_alpha = __commonJS((exports2) => {
  /*!
   * @pixi/filter-alpha - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/filter-alpha is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var core = require_core();
  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0
  
  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.
  
  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || {__proto__: []} instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) {
        if (b2.hasOwnProperty(p)) {
          d2[p] = b2[p];
        }
      }
    };
    return extendStatics(d, b);
  };
  function __extends(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  var fragment = "varying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float uAlpha;\n\nvoid main(void)\n{\n   gl_FragColor = texture2D(uSampler, vTextureCoord) * uAlpha;\n}\n";
  var AlphaFilter = function(_super) {
    __extends(AlphaFilter2, _super);
    function AlphaFilter2(alpha) {
      if (alpha === void 0) {
        alpha = 1;
      }
      var _this = _super.call(this, core.defaultVertex, fragment, {uAlpha: 1}) || this;
      _this.alpha = alpha;
      return _this;
    }
    Object.defineProperty(AlphaFilter2.prototype, "alpha", {
      get: function() {
        return this.uniforms.uAlpha;
      },
      set: function(value) {
        this.uniforms.uAlpha = value;
      },
      enumerable: false,
      configurable: true
    });
    return AlphaFilter2;
  }(core.Filter);
  exports2.AlphaFilter = AlphaFilter;
});

// node_modules/@pixi/filter-blur/lib/filter-blur.js
var require_filter_blur = __commonJS((exports2) => {
  /*!
   * @pixi/filter-blur - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/filter-blur is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var core = require_core();
  var settings = require_settings();
  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0
  
  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.
  
  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || {__proto__: []} instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) {
        if (b2.hasOwnProperty(p)) {
          d2[p] = b2[p];
        }
      }
    };
    return extendStatics(d, b);
  };
  function __extends(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  var vertTemplate = "\n    attribute vec2 aVertexPosition;\n\n    uniform mat3 projectionMatrix;\n\n    uniform float strength;\n\n    varying vec2 vBlurTexCoords[%size%];\n\n    uniform vec4 inputSize;\n    uniform vec4 outputFrame;\n\n    vec4 filterVertexPosition( void )\n    {\n        vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;\n\n        return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);\n    }\n\n    vec2 filterTextureCoord( void )\n    {\n        return aVertexPosition * (outputFrame.zw * inputSize.zw);\n    }\n\n    void main(void)\n    {\n        gl_Position = filterVertexPosition();\n\n        vec2 textureCoord = filterTextureCoord();\n        %blur%\n    }";
  function generateBlurVertSource(kernelSize, x) {
    var halfLength = Math.ceil(kernelSize / 2);
    var vertSource = vertTemplate;
    var blurLoop = "";
    var template;
    if (x) {
      template = "vBlurTexCoords[%index%] =  textureCoord + vec2(%sampleIndex% * strength, 0.0);";
    } else {
      template = "vBlurTexCoords[%index%] =  textureCoord + vec2(0.0, %sampleIndex% * strength);";
    }
    for (var i = 0; i < kernelSize; i++) {
      var blur = template.replace("%index%", i.toString());
      blur = blur.replace("%sampleIndex%", i - (halfLength - 1) + ".0");
      blurLoop += blur;
      blurLoop += "\n";
    }
    vertSource = vertSource.replace("%blur%", blurLoop);
    vertSource = vertSource.replace("%size%", kernelSize.toString());
    return vertSource;
  }
  var GAUSSIAN_VALUES = {
    5: [0.153388, 0.221461, 0.250301],
    7: [0.071303, 0.131514, 0.189879, 0.214607],
    9: [0.028532, 0.067234, 0.124009, 0.179044, 0.20236],
    11: [93e-4, 0.028002, 0.065984, 0.121703, 0.175713, 0.198596],
    13: [2406e-6, 9255e-6, 0.027867, 0.065666, 0.121117, 0.174868, 0.197641],
    15: [489e-6, 2403e-6, 9246e-6, 0.02784, 0.065602, 0.120999, 0.174697, 0.197448]
  };
  var fragTemplate = [
    "varying vec2 vBlurTexCoords[%size%];",
    "uniform sampler2D uSampler;",
    "void main(void)",
    "{",
    "    gl_FragColor = vec4(0.0);",
    "    %blur%",
    "}"
  ].join("\n");
  function generateBlurFragSource(kernelSize) {
    var kernel = GAUSSIAN_VALUES[kernelSize];
    var halfLength = kernel.length;
    var fragSource = fragTemplate;
    var blurLoop = "";
    var template = "gl_FragColor += texture2D(uSampler, vBlurTexCoords[%index%]) * %value%;";
    var value;
    for (var i = 0; i < kernelSize; i++) {
      var blur = template.replace("%index%", i.toString());
      value = i;
      if (i >= halfLength) {
        value = kernelSize - i - 1;
      }
      blur = blur.replace("%value%", kernel[value].toString());
      blurLoop += blur;
      blurLoop += "\n";
    }
    fragSource = fragSource.replace("%blur%", blurLoop);
    fragSource = fragSource.replace("%size%", kernelSize.toString());
    return fragSource;
  }
  var ENV;
  (function(ENV2) {
    ENV2[ENV2["WEBGL_LEGACY"] = 0] = "WEBGL_LEGACY";
    ENV2[ENV2["WEBGL"] = 1] = "WEBGL";
    ENV2[ENV2["WEBGL2"] = 2] = "WEBGL2";
  })(ENV || (ENV = {}));
  var RENDERER_TYPE;
  (function(RENDERER_TYPE2) {
    RENDERER_TYPE2[RENDERER_TYPE2["UNKNOWN"] = 0] = "UNKNOWN";
    RENDERER_TYPE2[RENDERER_TYPE2["WEBGL"] = 1] = "WEBGL";
    RENDERER_TYPE2[RENDERER_TYPE2["CANVAS"] = 2] = "CANVAS";
  })(RENDERER_TYPE || (RENDERER_TYPE = {}));
  var BUFFER_BITS;
  (function(BUFFER_BITS2) {
    BUFFER_BITS2[BUFFER_BITS2["COLOR"] = 16384] = "COLOR";
    BUFFER_BITS2[BUFFER_BITS2["DEPTH"] = 256] = "DEPTH";
    BUFFER_BITS2[BUFFER_BITS2["STENCIL"] = 1024] = "STENCIL";
  })(BUFFER_BITS || (BUFFER_BITS = {}));
  var BLEND_MODES;
  (function(BLEND_MODES2) {
    BLEND_MODES2[BLEND_MODES2["NORMAL"] = 0] = "NORMAL";
    BLEND_MODES2[BLEND_MODES2["ADD"] = 1] = "ADD";
    BLEND_MODES2[BLEND_MODES2["MULTIPLY"] = 2] = "MULTIPLY";
    BLEND_MODES2[BLEND_MODES2["SCREEN"] = 3] = "SCREEN";
    BLEND_MODES2[BLEND_MODES2["OVERLAY"] = 4] = "OVERLAY";
    BLEND_MODES2[BLEND_MODES2["DARKEN"] = 5] = "DARKEN";
    BLEND_MODES2[BLEND_MODES2["LIGHTEN"] = 6] = "LIGHTEN";
    BLEND_MODES2[BLEND_MODES2["COLOR_DODGE"] = 7] = "COLOR_DODGE";
    BLEND_MODES2[BLEND_MODES2["COLOR_BURN"] = 8] = "COLOR_BURN";
    BLEND_MODES2[BLEND_MODES2["HARD_LIGHT"] = 9] = "HARD_LIGHT";
    BLEND_MODES2[BLEND_MODES2["SOFT_LIGHT"] = 10] = "SOFT_LIGHT";
    BLEND_MODES2[BLEND_MODES2["DIFFERENCE"] = 11] = "DIFFERENCE";
    BLEND_MODES2[BLEND_MODES2["EXCLUSION"] = 12] = "EXCLUSION";
    BLEND_MODES2[BLEND_MODES2["HUE"] = 13] = "HUE";
    BLEND_MODES2[BLEND_MODES2["SATURATION"] = 14] = "SATURATION";
    BLEND_MODES2[BLEND_MODES2["COLOR"] = 15] = "COLOR";
    BLEND_MODES2[BLEND_MODES2["LUMINOSITY"] = 16] = "LUMINOSITY";
    BLEND_MODES2[BLEND_MODES2["NORMAL_NPM"] = 17] = "NORMAL_NPM";
    BLEND_MODES2[BLEND_MODES2["ADD_NPM"] = 18] = "ADD_NPM";
    BLEND_MODES2[BLEND_MODES2["SCREEN_NPM"] = 19] = "SCREEN_NPM";
    BLEND_MODES2[BLEND_MODES2["NONE"] = 20] = "NONE";
    BLEND_MODES2[BLEND_MODES2["SRC_OVER"] = 0] = "SRC_OVER";
    BLEND_MODES2[BLEND_MODES2["SRC_IN"] = 21] = "SRC_IN";
    BLEND_MODES2[BLEND_MODES2["SRC_OUT"] = 22] = "SRC_OUT";
    BLEND_MODES2[BLEND_MODES2["SRC_ATOP"] = 23] = "SRC_ATOP";
    BLEND_MODES2[BLEND_MODES2["DST_OVER"] = 24] = "DST_OVER";
    BLEND_MODES2[BLEND_MODES2["DST_IN"] = 25] = "DST_IN";
    BLEND_MODES2[BLEND_MODES2["DST_OUT"] = 26] = "DST_OUT";
    BLEND_MODES2[BLEND_MODES2["DST_ATOP"] = 27] = "DST_ATOP";
    BLEND_MODES2[BLEND_MODES2["ERASE"] = 26] = "ERASE";
    BLEND_MODES2[BLEND_MODES2["SUBTRACT"] = 28] = "SUBTRACT";
    BLEND_MODES2[BLEND_MODES2["XOR"] = 29] = "XOR";
  })(BLEND_MODES || (BLEND_MODES = {}));
  var DRAW_MODES;
  (function(DRAW_MODES2) {
    DRAW_MODES2[DRAW_MODES2["POINTS"] = 0] = "POINTS";
    DRAW_MODES2[DRAW_MODES2["LINES"] = 1] = "LINES";
    DRAW_MODES2[DRAW_MODES2["LINE_LOOP"] = 2] = "LINE_LOOP";
    DRAW_MODES2[DRAW_MODES2["LINE_STRIP"] = 3] = "LINE_STRIP";
    DRAW_MODES2[DRAW_MODES2["TRIANGLES"] = 4] = "TRIANGLES";
    DRAW_MODES2[DRAW_MODES2["TRIANGLE_STRIP"] = 5] = "TRIANGLE_STRIP";
    DRAW_MODES2[DRAW_MODES2["TRIANGLE_FAN"] = 6] = "TRIANGLE_FAN";
  })(DRAW_MODES || (DRAW_MODES = {}));
  var FORMATS;
  (function(FORMATS2) {
    FORMATS2[FORMATS2["RGBA"] = 6408] = "RGBA";
    FORMATS2[FORMATS2["RGB"] = 6407] = "RGB";
    FORMATS2[FORMATS2["ALPHA"] = 6406] = "ALPHA";
    FORMATS2[FORMATS2["LUMINANCE"] = 6409] = "LUMINANCE";
    FORMATS2[FORMATS2["LUMINANCE_ALPHA"] = 6410] = "LUMINANCE_ALPHA";
    FORMATS2[FORMATS2["DEPTH_COMPONENT"] = 6402] = "DEPTH_COMPONENT";
    FORMATS2[FORMATS2["DEPTH_STENCIL"] = 34041] = "DEPTH_STENCIL";
  })(FORMATS || (FORMATS = {}));
  var TARGETS;
  (function(TARGETS2) {
    TARGETS2[TARGETS2["TEXTURE_2D"] = 3553] = "TEXTURE_2D";
    TARGETS2[TARGETS2["TEXTURE_CUBE_MAP"] = 34067] = "TEXTURE_CUBE_MAP";
    TARGETS2[TARGETS2["TEXTURE_2D_ARRAY"] = 35866] = "TEXTURE_2D_ARRAY";
    TARGETS2[TARGETS2["TEXTURE_CUBE_MAP_POSITIVE_X"] = 34069] = "TEXTURE_CUBE_MAP_POSITIVE_X";
    TARGETS2[TARGETS2["TEXTURE_CUBE_MAP_NEGATIVE_X"] = 34070] = "TEXTURE_CUBE_MAP_NEGATIVE_X";
    TARGETS2[TARGETS2["TEXTURE_CUBE_MAP_POSITIVE_Y"] = 34071] = "TEXTURE_CUBE_MAP_POSITIVE_Y";
    TARGETS2[TARGETS2["TEXTURE_CUBE_MAP_NEGATIVE_Y"] = 34072] = "TEXTURE_CUBE_MAP_NEGATIVE_Y";
    TARGETS2[TARGETS2["TEXTURE_CUBE_MAP_POSITIVE_Z"] = 34073] = "TEXTURE_CUBE_MAP_POSITIVE_Z";
    TARGETS2[TARGETS2["TEXTURE_CUBE_MAP_NEGATIVE_Z"] = 34074] = "TEXTURE_CUBE_MAP_NEGATIVE_Z";
  })(TARGETS || (TARGETS = {}));
  var TYPES;
  (function(TYPES2) {
    TYPES2[TYPES2["UNSIGNED_BYTE"] = 5121] = "UNSIGNED_BYTE";
    TYPES2[TYPES2["UNSIGNED_SHORT"] = 5123] = "UNSIGNED_SHORT";
    TYPES2[TYPES2["UNSIGNED_SHORT_5_6_5"] = 33635] = "UNSIGNED_SHORT_5_6_5";
    TYPES2[TYPES2["UNSIGNED_SHORT_4_4_4_4"] = 32819] = "UNSIGNED_SHORT_4_4_4_4";
    TYPES2[TYPES2["UNSIGNED_SHORT_5_5_5_1"] = 32820] = "UNSIGNED_SHORT_5_5_5_1";
    TYPES2[TYPES2["FLOAT"] = 5126] = "FLOAT";
    TYPES2[TYPES2["HALF_FLOAT"] = 36193] = "HALF_FLOAT";
  })(TYPES || (TYPES = {}));
  var SCALE_MODES;
  (function(SCALE_MODES2) {
    SCALE_MODES2[SCALE_MODES2["NEAREST"] = 0] = "NEAREST";
    SCALE_MODES2[SCALE_MODES2["LINEAR"] = 1] = "LINEAR";
  })(SCALE_MODES || (SCALE_MODES = {}));
  var WRAP_MODES;
  (function(WRAP_MODES2) {
    WRAP_MODES2[WRAP_MODES2["CLAMP"] = 33071] = "CLAMP";
    WRAP_MODES2[WRAP_MODES2["REPEAT"] = 10497] = "REPEAT";
    WRAP_MODES2[WRAP_MODES2["MIRRORED_REPEAT"] = 33648] = "MIRRORED_REPEAT";
  })(WRAP_MODES || (WRAP_MODES = {}));
  var MIPMAP_MODES;
  (function(MIPMAP_MODES2) {
    MIPMAP_MODES2[MIPMAP_MODES2["OFF"] = 0] = "OFF";
    MIPMAP_MODES2[MIPMAP_MODES2["POW2"] = 1] = "POW2";
    MIPMAP_MODES2[MIPMAP_MODES2["ON"] = 2] = "ON";
  })(MIPMAP_MODES || (MIPMAP_MODES = {}));
  var ALPHA_MODES;
  (function(ALPHA_MODES2) {
    ALPHA_MODES2[ALPHA_MODES2["NPM"] = 0] = "NPM";
    ALPHA_MODES2[ALPHA_MODES2["UNPACK"] = 1] = "UNPACK";
    ALPHA_MODES2[ALPHA_MODES2["PMA"] = 2] = "PMA";
    ALPHA_MODES2[ALPHA_MODES2["NO_PREMULTIPLIED_ALPHA"] = 0] = "NO_PREMULTIPLIED_ALPHA";
    ALPHA_MODES2[ALPHA_MODES2["PREMULTIPLY_ON_UPLOAD"] = 1] = "PREMULTIPLY_ON_UPLOAD";
    ALPHA_MODES2[ALPHA_MODES2["PREMULTIPLY_ALPHA"] = 2] = "PREMULTIPLY_ALPHA";
  })(ALPHA_MODES || (ALPHA_MODES = {}));
  var CLEAR_MODES;
  (function(CLEAR_MODES2) {
    CLEAR_MODES2[CLEAR_MODES2["NO"] = 0] = "NO";
    CLEAR_MODES2[CLEAR_MODES2["YES"] = 1] = "YES";
    CLEAR_MODES2[CLEAR_MODES2["AUTO"] = 2] = "AUTO";
    CLEAR_MODES2[CLEAR_MODES2["BLEND"] = 0] = "BLEND";
    CLEAR_MODES2[CLEAR_MODES2["CLEAR"] = 1] = "CLEAR";
    CLEAR_MODES2[CLEAR_MODES2["BLIT"] = 2] = "BLIT";
  })(CLEAR_MODES || (CLEAR_MODES = {}));
  var GC_MODES;
  (function(GC_MODES2) {
    GC_MODES2[GC_MODES2["AUTO"] = 0] = "AUTO";
    GC_MODES2[GC_MODES2["MANUAL"] = 1] = "MANUAL";
  })(GC_MODES || (GC_MODES = {}));
  var PRECISION;
  (function(PRECISION2) {
    PRECISION2["LOW"] = "lowp";
    PRECISION2["MEDIUM"] = "mediump";
    PRECISION2["HIGH"] = "highp";
  })(PRECISION || (PRECISION = {}));
  var MASK_TYPES;
  (function(MASK_TYPES2) {
    MASK_TYPES2[MASK_TYPES2["NONE"] = 0] = "NONE";
    MASK_TYPES2[MASK_TYPES2["SCISSOR"] = 1] = "SCISSOR";
    MASK_TYPES2[MASK_TYPES2["STENCIL"] = 2] = "STENCIL";
    MASK_TYPES2[MASK_TYPES2["SPRITE"] = 3] = "SPRITE";
  })(MASK_TYPES || (MASK_TYPES = {}));
  var MSAA_QUALITY;
  (function(MSAA_QUALITY2) {
    MSAA_QUALITY2[MSAA_QUALITY2["NONE"] = 0] = "NONE";
    MSAA_QUALITY2[MSAA_QUALITY2["LOW"] = 2] = "LOW";
    MSAA_QUALITY2[MSAA_QUALITY2["MEDIUM"] = 4] = "MEDIUM";
    MSAA_QUALITY2[MSAA_QUALITY2["HIGH"] = 8] = "HIGH";
  })(MSAA_QUALITY || (MSAA_QUALITY = {}));
  var BlurFilterPass = function(_super) {
    __extends(BlurFilterPass2, _super);
    function BlurFilterPass2(horizontal, strength, quality, resolution, kernelSize) {
      if (strength === void 0) {
        strength = 8;
      }
      if (quality === void 0) {
        quality = 4;
      }
      if (resolution === void 0) {
        resolution = settings.settings.FILTER_RESOLUTION;
      }
      if (kernelSize === void 0) {
        kernelSize = 5;
      }
      var _this = this;
      var vertSrc = generateBlurVertSource(kernelSize, horizontal);
      var fragSrc = generateBlurFragSource(kernelSize);
      _this = _super.call(this, vertSrc, fragSrc) || this;
      _this.horizontal = horizontal;
      _this.resolution = resolution;
      _this._quality = 0;
      _this.quality = quality;
      _this.blur = strength;
      return _this;
    }
    BlurFilterPass2.prototype.apply = function(filterManager, input, output, clearMode) {
      if (output) {
        if (this.horizontal) {
          this.uniforms.strength = 1 / output.width * (output.width / input.width);
        } else {
          this.uniforms.strength = 1 / output.height * (output.height / input.height);
        }
      } else {
        if (this.horizontal) {
          this.uniforms.strength = 1 / filterManager.renderer.width * (filterManager.renderer.width / input.width);
        } else {
          this.uniforms.strength = 1 / filterManager.renderer.height * (filterManager.renderer.height / input.height);
        }
      }
      this.uniforms.strength *= this.strength;
      this.uniforms.strength /= this.passes;
      if (this.passes === 1) {
        filterManager.applyFilter(this, input, output, clearMode);
      } else {
        var renderTarget = filterManager.getFilterTexture();
        var renderer = filterManager.renderer;
        var flip = input;
        var flop = renderTarget;
        this.state.blend = false;
        filterManager.applyFilter(this, flip, flop, CLEAR_MODES.CLEAR);
        for (var i = 1; i < this.passes - 1; i++) {
          filterManager.bindAndClear(flip, CLEAR_MODES.BLIT);
          this.uniforms.uSampler = flop;
          var temp = flop;
          flop = flip;
          flip = temp;
          renderer.shader.bind(this);
          renderer.geometry.draw(5);
        }
        this.state.blend = true;
        filterManager.applyFilter(this, flop, output, clearMode);
        filterManager.returnFilterTexture(renderTarget);
      }
    };
    Object.defineProperty(BlurFilterPass2.prototype, "blur", {
      get: function() {
        return this.strength;
      },
      set: function(value) {
        this.padding = 1 + Math.abs(value) * 2;
        this.strength = value;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(BlurFilterPass2.prototype, "quality", {
      get: function() {
        return this._quality;
      },
      set: function(value) {
        this._quality = value;
        this.passes = value;
      },
      enumerable: false,
      configurable: true
    });
    return BlurFilterPass2;
  }(core.Filter);
  var BlurFilter = function(_super) {
    __extends(BlurFilter2, _super);
    function BlurFilter2(strength, quality, resolution, kernelSize) {
      if (strength === void 0) {
        strength = 8;
      }
      if (quality === void 0) {
        quality = 4;
      }
      if (resolution === void 0) {
        resolution = settings.settings.FILTER_RESOLUTION;
      }
      if (kernelSize === void 0) {
        kernelSize = 5;
      }
      var _this = _super.call(this) || this;
      _this.blurXFilter = new BlurFilterPass(true, strength, quality, resolution, kernelSize);
      _this.blurYFilter = new BlurFilterPass(false, strength, quality, resolution, kernelSize);
      _this.resolution = resolution;
      _this.quality = quality;
      _this.blur = strength;
      _this.repeatEdgePixels = false;
      return _this;
    }
    BlurFilter2.prototype.apply = function(filterManager, input, output, clearMode) {
      var xStrength = Math.abs(this.blurXFilter.strength);
      var yStrength = Math.abs(this.blurYFilter.strength);
      if (xStrength && yStrength) {
        var renderTarget = filterManager.getFilterTexture();
        this.blurXFilter.apply(filterManager, input, renderTarget, CLEAR_MODES.CLEAR);
        this.blurYFilter.apply(filterManager, renderTarget, output, clearMode);
        filterManager.returnFilterTexture(renderTarget);
      } else if (yStrength) {
        this.blurYFilter.apply(filterManager, input, output, clearMode);
      } else {
        this.blurXFilter.apply(filterManager, input, output, clearMode);
      }
    };
    BlurFilter2.prototype.updatePadding = function() {
      if (this._repeatEdgePixels) {
        this.padding = 0;
      } else {
        this.padding = Math.max(Math.abs(this.blurXFilter.strength), Math.abs(this.blurYFilter.strength)) * 2;
      }
    };
    Object.defineProperty(BlurFilter2.prototype, "blur", {
      get: function() {
        return this.blurXFilter.blur;
      },
      set: function(value) {
        this.blurXFilter.blur = this.blurYFilter.blur = value;
        this.updatePadding();
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(BlurFilter2.prototype, "quality", {
      get: function() {
        return this.blurXFilter.quality;
      },
      set: function(value) {
        this.blurXFilter.quality = this.blurYFilter.quality = value;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(BlurFilter2.prototype, "blurX", {
      get: function() {
        return this.blurXFilter.blur;
      },
      set: function(value) {
        this.blurXFilter.blur = value;
        this.updatePadding();
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(BlurFilter2.prototype, "blurY", {
      get: function() {
        return this.blurYFilter.blur;
      },
      set: function(value) {
        this.blurYFilter.blur = value;
        this.updatePadding();
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(BlurFilter2.prototype, "blendMode", {
      get: function() {
        return this.blurYFilter.blendMode;
      },
      set: function(value) {
        this.blurYFilter.blendMode = value;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(BlurFilter2.prototype, "repeatEdgePixels", {
      get: function() {
        return this._repeatEdgePixels;
      },
      set: function(value) {
        this._repeatEdgePixels = value;
        this.updatePadding();
      },
      enumerable: false,
      configurable: true
    });
    return BlurFilter2;
  }(core.Filter);
  exports2.BlurFilter = BlurFilter;
  exports2.BlurFilterPass = BlurFilterPass;
});

// node_modules/@pixi/filter-color-matrix/lib/filter-color-matrix.js
var require_filter_color_matrix = __commonJS((exports2) => {
  /*!
   * @pixi/filter-color-matrix - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/filter-color-matrix is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var core = require_core();
  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0
  
  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.
  
  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || {__proto__: []} instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) {
        if (b2.hasOwnProperty(p)) {
          d2[p] = b2[p];
        }
      }
    };
    return extendStatics(d, b);
  };
  function __extends(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  var fragment = "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform float m[20];\nuniform float uAlpha;\n\nvoid main(void)\n{\n    vec4 c = texture2D(uSampler, vTextureCoord);\n\n    if (uAlpha == 0.0) {\n        gl_FragColor = c;\n        return;\n    }\n\n    // Un-premultiply alpha before applying the color matrix. See issue #3539.\n    if (c.a > 0.0) {\n      c.rgb /= c.a;\n    }\n\n    vec4 result;\n\n    result.r = (m[0] * c.r);\n        result.r += (m[1] * c.g);\n        result.r += (m[2] * c.b);\n        result.r += (m[3] * c.a);\n        result.r += m[4];\n\n    result.g = (m[5] * c.r);\n        result.g += (m[6] * c.g);\n        result.g += (m[7] * c.b);\n        result.g += (m[8] * c.a);\n        result.g += m[9];\n\n    result.b = (m[10] * c.r);\n       result.b += (m[11] * c.g);\n       result.b += (m[12] * c.b);\n       result.b += (m[13] * c.a);\n       result.b += m[14];\n\n    result.a = (m[15] * c.r);\n       result.a += (m[16] * c.g);\n       result.a += (m[17] * c.b);\n       result.a += (m[18] * c.a);\n       result.a += m[19];\n\n    vec3 rgb = mix(c.rgb, result.rgb, uAlpha);\n\n    // Premultiply alpha again.\n    rgb *= result.a;\n\n    gl_FragColor = vec4(rgb, result.a);\n}\n";
  var ColorMatrixFilter = function(_super) {
    __extends(ColorMatrixFilter2, _super);
    function ColorMatrixFilter2() {
      var _this = this;
      var uniforms = {
        m: new Float32Array([
          1,
          0,
          0,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          0,
          1,
          0
        ]),
        uAlpha: 1
      };
      _this = _super.call(this, core.defaultFilterVertex, fragment, uniforms) || this;
      _this.alpha = 1;
      return _this;
    }
    ColorMatrixFilter2.prototype._loadMatrix = function(matrix, multiply) {
      if (multiply === void 0) {
        multiply = false;
      }
      var newMatrix = matrix;
      if (multiply) {
        this._multiply(newMatrix, this.uniforms.m, matrix);
        newMatrix = this._colorMatrix(newMatrix);
      }
      this.uniforms.m = newMatrix;
    };
    ColorMatrixFilter2.prototype._multiply = function(out, a, b) {
      out[0] = a[0] * b[0] + a[1] * b[5] + a[2] * b[10] + a[3] * b[15];
      out[1] = a[0] * b[1] + a[1] * b[6] + a[2] * b[11] + a[3] * b[16];
      out[2] = a[0] * b[2] + a[1] * b[7] + a[2] * b[12] + a[3] * b[17];
      out[3] = a[0] * b[3] + a[1] * b[8] + a[2] * b[13] + a[3] * b[18];
      out[4] = a[0] * b[4] + a[1] * b[9] + a[2] * b[14] + a[3] * b[19] + a[4];
      out[5] = a[5] * b[0] + a[6] * b[5] + a[7] * b[10] + a[8] * b[15];
      out[6] = a[5] * b[1] + a[6] * b[6] + a[7] * b[11] + a[8] * b[16];
      out[7] = a[5] * b[2] + a[6] * b[7] + a[7] * b[12] + a[8] * b[17];
      out[8] = a[5] * b[3] + a[6] * b[8] + a[7] * b[13] + a[8] * b[18];
      out[9] = a[5] * b[4] + a[6] * b[9] + a[7] * b[14] + a[8] * b[19] + a[9];
      out[10] = a[10] * b[0] + a[11] * b[5] + a[12] * b[10] + a[13] * b[15];
      out[11] = a[10] * b[1] + a[11] * b[6] + a[12] * b[11] + a[13] * b[16];
      out[12] = a[10] * b[2] + a[11] * b[7] + a[12] * b[12] + a[13] * b[17];
      out[13] = a[10] * b[3] + a[11] * b[8] + a[12] * b[13] + a[13] * b[18];
      out[14] = a[10] * b[4] + a[11] * b[9] + a[12] * b[14] + a[13] * b[19] + a[14];
      out[15] = a[15] * b[0] + a[16] * b[5] + a[17] * b[10] + a[18] * b[15];
      out[16] = a[15] * b[1] + a[16] * b[6] + a[17] * b[11] + a[18] * b[16];
      out[17] = a[15] * b[2] + a[16] * b[7] + a[17] * b[12] + a[18] * b[17];
      out[18] = a[15] * b[3] + a[16] * b[8] + a[17] * b[13] + a[18] * b[18];
      out[19] = a[15] * b[4] + a[16] * b[9] + a[17] * b[14] + a[18] * b[19] + a[19];
      return out;
    };
    ColorMatrixFilter2.prototype._colorMatrix = function(matrix) {
      var m = new Float32Array(matrix);
      m[4] /= 255;
      m[9] /= 255;
      m[14] /= 255;
      m[19] /= 255;
      return m;
    };
    ColorMatrixFilter2.prototype.brightness = function(b, multiply) {
      var matrix = [
        b,
        0,
        0,
        0,
        0,
        0,
        b,
        0,
        0,
        0,
        0,
        0,
        b,
        0,
        0,
        0,
        0,
        0,
        1,
        0
      ];
      this._loadMatrix(matrix, multiply);
    };
    ColorMatrixFilter2.prototype.greyscale = function(scale, multiply) {
      var matrix = [
        scale,
        scale,
        scale,
        0,
        0,
        scale,
        scale,
        scale,
        0,
        0,
        scale,
        scale,
        scale,
        0,
        0,
        0,
        0,
        0,
        1,
        0
      ];
      this._loadMatrix(matrix, multiply);
    };
    ColorMatrixFilter2.prototype.blackAndWhite = function(multiply) {
      var matrix = [
        0.3,
        0.6,
        0.1,
        0,
        0,
        0.3,
        0.6,
        0.1,
        0,
        0,
        0.3,
        0.6,
        0.1,
        0,
        0,
        0,
        0,
        0,
        1,
        0
      ];
      this._loadMatrix(matrix, multiply);
    };
    ColorMatrixFilter2.prototype.hue = function(rotation, multiply) {
      rotation = (rotation || 0) / 180 * Math.PI;
      var cosR = Math.cos(rotation);
      var sinR = Math.sin(rotation);
      var sqrt = Math.sqrt;
      var w = 1 / 3;
      var sqrW = sqrt(w);
      var a00 = cosR + (1 - cosR) * w;
      var a01 = w * (1 - cosR) - sqrW * sinR;
      var a02 = w * (1 - cosR) + sqrW * sinR;
      var a10 = w * (1 - cosR) + sqrW * sinR;
      var a11 = cosR + w * (1 - cosR);
      var a12 = w * (1 - cosR) - sqrW * sinR;
      var a20 = w * (1 - cosR) - sqrW * sinR;
      var a21 = w * (1 - cosR) + sqrW * sinR;
      var a22 = cosR + w * (1 - cosR);
      var matrix = [
        a00,
        a01,
        a02,
        0,
        0,
        a10,
        a11,
        a12,
        0,
        0,
        a20,
        a21,
        a22,
        0,
        0,
        0,
        0,
        0,
        1,
        0
      ];
      this._loadMatrix(matrix, multiply);
    };
    ColorMatrixFilter2.prototype.contrast = function(amount, multiply) {
      var v = (amount || 0) + 1;
      var o = -0.5 * (v - 1);
      var matrix = [
        v,
        0,
        0,
        0,
        o,
        0,
        v,
        0,
        0,
        o,
        0,
        0,
        v,
        0,
        o,
        0,
        0,
        0,
        1,
        0
      ];
      this._loadMatrix(matrix, multiply);
    };
    ColorMatrixFilter2.prototype.saturate = function(amount, multiply) {
      if (amount === void 0) {
        amount = 0;
      }
      var x = amount * 2 / 3 + 1;
      var y = (x - 1) * -0.5;
      var matrix = [
        x,
        y,
        y,
        0,
        0,
        y,
        x,
        y,
        0,
        0,
        y,
        y,
        x,
        0,
        0,
        0,
        0,
        0,
        1,
        0
      ];
      this._loadMatrix(matrix, multiply);
    };
    ColorMatrixFilter2.prototype.desaturate = function() {
      this.saturate(-1);
    };
    ColorMatrixFilter2.prototype.negative = function(multiply) {
      var matrix = [
        -1,
        0,
        0,
        1,
        0,
        0,
        -1,
        0,
        1,
        0,
        0,
        0,
        -1,
        1,
        0,
        0,
        0,
        0,
        1,
        0
      ];
      this._loadMatrix(matrix, multiply);
    };
    ColorMatrixFilter2.prototype.sepia = function(multiply) {
      var matrix = [
        0.393,
        0.7689999,
        0.18899999,
        0,
        0,
        0.349,
        0.6859999,
        0.16799999,
        0,
        0,
        0.272,
        0.5339999,
        0.13099999,
        0,
        0,
        0,
        0,
        0,
        1,
        0
      ];
      this._loadMatrix(matrix, multiply);
    };
    ColorMatrixFilter2.prototype.technicolor = function(multiply) {
      var matrix = [
        1.9125277891456083,
        -0.8545344976951645,
        -0.09155508482755585,
        0,
        11.793603434377337,
        -0.3087833385928097,
        1.7658908555458428,
        -0.10601743074722245,
        0,
        -70.35205161461398,
        -0.231103377548616,
        -0.7501899197440212,
        1.847597816108189,
        0,
        30.950940869491138,
        0,
        0,
        0,
        1,
        0
      ];
      this._loadMatrix(matrix, multiply);
    };
    ColorMatrixFilter2.prototype.polaroid = function(multiply) {
      var matrix = [
        1.438,
        -0.062,
        -0.062,
        0,
        0,
        -0.122,
        1.378,
        -0.122,
        0,
        0,
        -0.016,
        -0.016,
        1.483,
        0,
        0,
        0,
        0,
        0,
        1,
        0
      ];
      this._loadMatrix(matrix, multiply);
    };
    ColorMatrixFilter2.prototype.toBGR = function(multiply) {
      var matrix = [
        0,
        0,
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        0
      ];
      this._loadMatrix(matrix, multiply);
    };
    ColorMatrixFilter2.prototype.kodachrome = function(multiply) {
      var matrix = [
        1.1285582396593525,
        -0.3967382283601348,
        -0.03992559172921793,
        0,
        63.72958762196502,
        -0.16404339962244616,
        1.0835251566291304,
        -0.05498805115633132,
        0,
        24.732407896706203,
        -0.16786010706155763,
        -0.5603416277695248,
        1.6014850761964943,
        0,
        35.62982807460946,
        0,
        0,
        0,
        1,
        0
      ];
      this._loadMatrix(matrix, multiply);
    };
    ColorMatrixFilter2.prototype.browni = function(multiply) {
      var matrix = [
        0.5997023498159715,
        0.34553243048391263,
        -0.2708298674538042,
        0,
        47.43192855600873,
        -0.037703249837783157,
        0.8609577587992641,
        0.15059552388459913,
        0,
        -36.96841498319127,
        0.24113635128153335,
        -0.07441037908422492,
        0.44972182064877153,
        0,
        -7.562075277591283,
        0,
        0,
        0,
        1,
        0
      ];
      this._loadMatrix(matrix, multiply);
    };
    ColorMatrixFilter2.prototype.vintage = function(multiply) {
      var matrix = [
        0.6279345635605994,
        0.3202183420819367,
        -0.03965408211312453,
        0,
        9.651285835294123,
        0.02578397704808868,
        0.6441188644374771,
        0.03259127616149294,
        0,
        7.462829176470591,
        0.0466055556782719,
        -0.0851232987247891,
        0.5241648018700465,
        0,
        5.159190588235296,
        0,
        0,
        0,
        1,
        0
      ];
      this._loadMatrix(matrix, multiply);
    };
    ColorMatrixFilter2.prototype.colorTone = function(desaturation, toned, lightColor, darkColor, multiply) {
      desaturation = desaturation || 0.2;
      toned = toned || 0.15;
      lightColor = lightColor || 16770432;
      darkColor = darkColor || 3375104;
      var lR = (lightColor >> 16 & 255) / 255;
      var lG = (lightColor >> 8 & 255) / 255;
      var lB = (lightColor & 255) / 255;
      var dR = (darkColor >> 16 & 255) / 255;
      var dG = (darkColor >> 8 & 255) / 255;
      var dB = (darkColor & 255) / 255;
      var matrix = [
        0.3,
        0.59,
        0.11,
        0,
        0,
        lR,
        lG,
        lB,
        desaturation,
        0,
        dR,
        dG,
        dB,
        toned,
        0,
        lR - dR,
        lG - dG,
        lB - dB,
        0,
        0
      ];
      this._loadMatrix(matrix, multiply);
    };
    ColorMatrixFilter2.prototype.night = function(intensity, multiply) {
      intensity = intensity || 0.1;
      var matrix = [
        intensity * -2,
        -intensity,
        0,
        0,
        0,
        -intensity,
        0,
        intensity,
        0,
        0,
        0,
        intensity,
        intensity * 2,
        0,
        0,
        0,
        0,
        0,
        1,
        0
      ];
      this._loadMatrix(matrix, multiply);
    };
    ColorMatrixFilter2.prototype.predator = function(amount, multiply) {
      var matrix = [
        11.224130630493164 * amount,
        -4.794486999511719 * amount,
        -2.8746118545532227 * amount,
        0 * amount,
        0.40342438220977783 * amount,
        -3.6330697536468506 * amount,
        9.193157196044922 * amount,
        -2.951810836791992 * amount,
        0 * amount,
        -1.316135048866272 * amount,
        -3.2184197902679443 * amount,
        -4.2375030517578125 * amount,
        7.476448059082031 * amount,
        0 * amount,
        0.8044459223747253 * amount,
        0,
        0,
        0,
        1,
        0
      ];
      this._loadMatrix(matrix, multiply);
    };
    ColorMatrixFilter2.prototype.lsd = function(multiply) {
      var matrix = [
        2,
        -0.4,
        0.5,
        0,
        0,
        -0.5,
        2,
        -0.4,
        0,
        0,
        -0.4,
        -0.5,
        3,
        0,
        0,
        0,
        0,
        0,
        1,
        0
      ];
      this._loadMatrix(matrix, multiply);
    };
    ColorMatrixFilter2.prototype.reset = function() {
      var matrix = [
        1,
        0,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        1,
        0
      ];
      this._loadMatrix(matrix, false);
    };
    Object.defineProperty(ColorMatrixFilter2.prototype, "matrix", {
      get: function() {
        return this.uniforms.m;
      },
      set: function(value) {
        this.uniforms.m = value;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(ColorMatrixFilter2.prototype, "alpha", {
      get: function() {
        return this.uniforms.uAlpha;
      },
      set: function(value) {
        this.uniforms.uAlpha = value;
      },
      enumerable: false,
      configurable: true
    });
    return ColorMatrixFilter2;
  }(core.Filter);
  ColorMatrixFilter.prototype.grayscale = ColorMatrixFilter.prototype.greyscale;
  exports2.ColorMatrixFilter = ColorMatrixFilter;
});

// node_modules/@pixi/filter-displacement/lib/filter-displacement.js
var require_filter_displacement = __commonJS((exports2) => {
  /*!
   * @pixi/filter-displacement - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/filter-displacement is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var core = require_core();
  var math = require_math();
  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0
  
  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.
  
  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || {__proto__: []} instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) {
        if (b2.hasOwnProperty(p)) {
          d2[p] = b2[p];
        }
      }
    };
    return extendStatics(d, b);
  };
  function __extends(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  var fragment = "varying vec2 vFilterCoord;\nvarying vec2 vTextureCoord;\n\nuniform vec2 scale;\nuniform mat2 rotation;\nuniform sampler2D uSampler;\nuniform sampler2D mapSampler;\n\nuniform highp vec4 inputSize;\nuniform vec4 inputClamp;\n\nvoid main(void)\n{\n  vec4 map =  texture2D(mapSampler, vFilterCoord);\n\n  map -= 0.5;\n  map.xy = scale * inputSize.zw * (rotation * map.xy);\n\n  gl_FragColor = texture2D(uSampler, clamp(vec2(vTextureCoord.x + map.x, vTextureCoord.y + map.y), inputClamp.xy, inputClamp.zw));\n}\n";
  var vertex = "attribute vec2 aVertexPosition;\n\nuniform mat3 projectionMatrix;\nuniform mat3 filterMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec2 vFilterCoord;\n\nuniform vec4 inputSize;\nuniform vec4 outputFrame;\n\nvec4 filterVertexPosition( void )\n{\n    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;\n\n    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);\n}\n\nvec2 filterTextureCoord( void )\n{\n    return aVertexPosition * (outputFrame.zw * inputSize.zw);\n}\n\nvoid main(void)\n{\n	gl_Position = filterVertexPosition();\n	vTextureCoord = filterTextureCoord();\n	vFilterCoord = ( filterMatrix * vec3( vTextureCoord, 1.0)  ).xy;\n}\n";
  var DisplacementFilter = function(_super) {
    __extends(DisplacementFilter2, _super);
    function DisplacementFilter2(sprite, scale) {
      var _this = this;
      var maskMatrix = new math.Matrix();
      sprite.renderable = false;
      _this = _super.call(this, vertex, fragment, {
        mapSampler: sprite._texture,
        filterMatrix: maskMatrix,
        scale: {x: 1, y: 1},
        rotation: new Float32Array([1, 0, 0, 1])
      }) || this;
      _this.maskSprite = sprite;
      _this.maskMatrix = maskMatrix;
      if (scale === null || scale === void 0) {
        scale = 20;
      }
      _this.scale = new math.Point(scale, scale);
      return _this;
    }
    DisplacementFilter2.prototype.apply = function(filterManager, input, output, clearMode) {
      this.uniforms.filterMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, this.maskSprite);
      this.uniforms.scale.x = this.scale.x;
      this.uniforms.scale.y = this.scale.y;
      var wt = this.maskSprite.worldTransform;
      var lenX = Math.sqrt(wt.a * wt.a + wt.b * wt.b);
      var lenY = Math.sqrt(wt.c * wt.c + wt.d * wt.d);
      if (lenX !== 0 && lenY !== 0) {
        this.uniforms.rotation[0] = wt.a / lenX;
        this.uniforms.rotation[1] = wt.b / lenX;
        this.uniforms.rotation[2] = wt.c / lenY;
        this.uniforms.rotation[3] = wt.d / lenY;
      }
      filterManager.applyFilter(this, input, output, clearMode);
    };
    Object.defineProperty(DisplacementFilter2.prototype, "map", {
      get: function() {
        return this.uniforms.mapSampler;
      },
      set: function(value) {
        this.uniforms.mapSampler = value;
      },
      enumerable: false,
      configurable: true
    });
    return DisplacementFilter2;
  }(core.Filter);
  exports2.DisplacementFilter = DisplacementFilter;
});

// node_modules/@pixi/filter-fxaa/lib/filter-fxaa.js
var require_filter_fxaa = __commonJS((exports2) => {
  /*!
   * @pixi/filter-fxaa - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/filter-fxaa is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var core = require_core();
  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0
  
  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.
  
  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || {__proto__: []} instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) {
        if (b2.hasOwnProperty(p)) {
          d2[p] = b2[p];
        }
      }
    };
    return extendStatics(d, b);
  };
  function __extends(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  var vertex = "\nattribute vec2 aVertexPosition;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 v_rgbNW;\nvarying vec2 v_rgbNE;\nvarying vec2 v_rgbSW;\nvarying vec2 v_rgbSE;\nvarying vec2 v_rgbM;\n\nvarying vec2 vFragCoord;\n\nuniform vec4 inputPixel;\nuniform vec4 outputFrame;\n\nvec4 filterVertexPosition( void )\n{\n    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;\n\n    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);\n}\n\nvoid texcoords(vec2 fragCoord, vec2 inverseVP,\n               out vec2 v_rgbNW, out vec2 v_rgbNE,\n               out vec2 v_rgbSW, out vec2 v_rgbSE,\n               out vec2 v_rgbM) {\n    v_rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseVP;\n    v_rgbNE = (fragCoord + vec2(1.0, -1.0)) * inverseVP;\n    v_rgbSW = (fragCoord + vec2(-1.0, 1.0)) * inverseVP;\n    v_rgbSE = (fragCoord + vec2(1.0, 1.0)) * inverseVP;\n    v_rgbM = vec2(fragCoord * inverseVP);\n}\n\nvoid main(void) {\n\n   gl_Position = filterVertexPosition();\n\n   vFragCoord = aVertexPosition * outputFrame.zw;\n\n   texcoords(vFragCoord, inputPixel.zw, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);\n}\n";
  var fragment = `varying vec2 v_rgbNW;
varying vec2 v_rgbNE;
varying vec2 v_rgbSW;
varying vec2 v_rgbSE;
varying vec2 v_rgbM;

varying vec2 vFragCoord;
uniform sampler2D uSampler;
uniform highp vec4 inputPixel;


/**
 Basic FXAA implementation based on the code on geeks3d.com with the
 modification that the texture2DLod stuff was removed since it's
 unsupported by WebGL.

 --

 From:
 https://github.com/mitsuhiko/webgl-meincraft

 Copyright (c) 2011 by Armin Ronacher.

 Some rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are
 met:

 * Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.

 * Redistributions in binary form must reproduce the above
 copyright notice, this list of conditions and the following
 disclaimer in the documentation and/or other materials provided
 with the distribution.

 * The names of the contributors may not be used to endorse or
 promote products derived from this software without specific
 prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

#ifndef FXAA_REDUCE_MIN
#define FXAA_REDUCE_MIN   (1.0/ 128.0)
#endif
#ifndef FXAA_REDUCE_MUL
#define FXAA_REDUCE_MUL   (1.0 / 8.0)
#endif
#ifndef FXAA_SPAN_MAX
#define FXAA_SPAN_MAX     8.0
#endif

//optimized version for mobile, where dependent
//texture reads can be a bottleneck
vec4 fxaa(sampler2D tex, vec2 fragCoord, vec2 inverseVP,
          vec2 v_rgbNW, vec2 v_rgbNE,
          vec2 v_rgbSW, vec2 v_rgbSE,
          vec2 v_rgbM) {
    vec4 color;
    vec3 rgbNW = texture2D(tex, v_rgbNW).xyz;
    vec3 rgbNE = texture2D(tex, v_rgbNE).xyz;
    vec3 rgbSW = texture2D(tex, v_rgbSW).xyz;
    vec3 rgbSE = texture2D(tex, v_rgbSE).xyz;
    vec4 texColor = texture2D(tex, v_rgbM);
    vec3 rgbM  = texColor.xyz;
    vec3 luma = vec3(0.299, 0.587, 0.114);
    float lumaNW = dot(rgbNW, luma);
    float lumaNE = dot(rgbNE, luma);
    float lumaSW = dot(rgbSW, luma);
    float lumaSE = dot(rgbSE, luma);
    float lumaM  = dot(rgbM,  luma);
    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));

    mediump vec2 dir;
    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));

    float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *
                          (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);

    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
    dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),
              max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
                  dir * rcpDirMin)) * inverseVP;

    vec3 rgbA = 0.5 * (
                       texture2D(tex, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)).xyz +
                       texture2D(tex, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)).xyz);
    vec3 rgbB = rgbA * 0.5 + 0.25 * (
                                     texture2D(tex, fragCoord * inverseVP + dir * -0.5).xyz +
                                     texture2D(tex, fragCoord * inverseVP + dir * 0.5).xyz);

    float lumaB = dot(rgbB, luma);
    if ((lumaB < lumaMin) || (lumaB > lumaMax))
        color = vec4(rgbA, texColor.a);
    else
        color = vec4(rgbB, texColor.a);
    return color;
}

void main() {

      vec4 color;

      color = fxaa(uSampler, vFragCoord, inputPixel.zw, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);

      gl_FragColor = color;
}
`;
  var FXAAFilter = function(_super) {
    __extends(FXAAFilter2, _super);
    function FXAAFilter2() {
      return _super.call(this, vertex, fragment) || this;
    }
    return FXAAFilter2;
  }(core.Filter);
  exports2.FXAAFilter = FXAAFilter;
});

// node_modules/@pixi/filter-noise/lib/filter-noise.js
var require_filter_noise = __commonJS((exports2) => {
  /*!
   * @pixi/filter-noise - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/filter-noise is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var core = require_core();
  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0
  
  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.
  
  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || {__proto__: []} instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) {
        if (b2.hasOwnProperty(p)) {
          d2[p] = b2[p];
        }
      }
    };
    return extendStatics(d, b);
  };
  function __extends(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  var fragment = "precision highp float;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform float uNoise;\nuniform float uSeed;\nuniform sampler2D uSampler;\n\nfloat rand(vec2 co)\n{\n    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n}\n\nvoid main()\n{\n    vec4 color = texture2D(uSampler, vTextureCoord);\n    float randomValue = rand(gl_FragCoord.xy * uSeed);\n    float diff = (randomValue - 0.5) * uNoise;\n\n    // Un-premultiply alpha before applying the color matrix. See issue #3539.\n    if (color.a > 0.0) {\n        color.rgb /= color.a;\n    }\n\n    color.r += diff;\n    color.g += diff;\n    color.b += diff;\n\n    // Premultiply alpha again.\n    color.rgb *= color.a;\n\n    gl_FragColor = color;\n}\n";
  var NoiseFilter = function(_super) {
    __extends(NoiseFilter2, _super);
    function NoiseFilter2(noise, seed) {
      if (noise === void 0) {
        noise = 0.5;
      }
      if (seed === void 0) {
        seed = Math.random();
      }
      var _this = _super.call(this, core.defaultFilterVertex, fragment, {
        uNoise: 0,
        uSeed: 0
      }) || this;
      _this.noise = noise;
      _this.seed = seed;
      return _this;
    }
    Object.defineProperty(NoiseFilter2.prototype, "noise", {
      get: function() {
        return this.uniforms.uNoise;
      },
      set: function(value) {
        this.uniforms.uNoise = value;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(NoiseFilter2.prototype, "seed", {
      get: function() {
        return this.uniforms.uSeed;
      },
      set: function(value) {
        this.uniforms.uSeed = value;
      },
      enumerable: false,
      configurable: true
    });
    return NoiseFilter2;
  }(core.Filter);
  exports2.NoiseFilter = NoiseFilter;
});

// node_modules/@pixi/mixin-cache-as-bitmap/lib/mixin-cache-as-bitmap.js
var require_mixin_cache_as_bitmap = __commonJS((exports2) => {
  /*!
   * @pixi/mixin-cache-as-bitmap - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/mixin-cache-as-bitmap is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var core = require_core();
  var sprite = require_sprite();
  var display = require_display();
  var math = require_math();
  var utils = require_utils();
  var settings = require_settings();
  var _tempMatrix = new math.Matrix();
  display.DisplayObject.prototype._cacheAsBitmap = false;
  display.DisplayObject.prototype._cacheData = null;
  var CacheData = function() {
    function CacheData2() {
      this.textureCacheId = null;
      this.originalRender = null;
      this.originalRenderCanvas = null;
      this.originalCalculateBounds = null;
      this.originalGetLocalBounds = null;
      this.originalUpdateTransform = null;
      this.originalDestroy = null;
      this.originalMask = null;
      this.originalFilterArea = null;
      this.originalContainsPoint = null;
      this.sprite = null;
    }
    return CacheData2;
  }();
  Object.defineProperties(display.DisplayObject.prototype, {
    cacheAsBitmap: {
      get: function() {
        return this._cacheAsBitmap;
      },
      set: function(value) {
        if (this._cacheAsBitmap === value) {
          return;
        }
        this._cacheAsBitmap = value;
        var data;
        if (value) {
          if (!this._cacheData) {
            this._cacheData = new CacheData();
          }
          data = this._cacheData;
          data.originalRender = this.render;
          data.originalRenderCanvas = this.renderCanvas;
          data.originalUpdateTransform = this.updateTransform;
          data.originalCalculateBounds = this.calculateBounds;
          data.originalGetLocalBounds = this.getLocalBounds;
          data.originalDestroy = this.destroy;
          data.originalContainsPoint = this.containsPoint;
          data.originalMask = this._mask;
          data.originalFilterArea = this.filterArea;
          this.render = this._renderCached;
          this.renderCanvas = this._renderCachedCanvas;
          this.destroy = this._cacheAsBitmapDestroy;
        } else {
          data = this._cacheData;
          if (data.sprite) {
            this._destroyCachedDisplayObject();
          }
          this.render = data.originalRender;
          this.renderCanvas = data.originalRenderCanvas;
          this.calculateBounds = data.originalCalculateBounds;
          this.getLocalBounds = data.originalGetLocalBounds;
          this.destroy = data.originalDestroy;
          this.updateTransform = data.originalUpdateTransform;
          this.containsPoint = data.originalContainsPoint;
          this._mask = data.originalMask;
          this.filterArea = data.originalFilterArea;
        }
      }
    }
  });
  display.DisplayObject.prototype._renderCached = function _renderCached(renderer) {
    if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
      return;
    }
    this._initCachedDisplayObject(renderer);
    this._cacheData.sprite.transform._worldID = this.transform._worldID;
    this._cacheData.sprite.worldAlpha = this.worldAlpha;
    this._cacheData.sprite._render(renderer);
  };
  display.DisplayObject.prototype._initCachedDisplayObject = function _initCachedDisplayObject(renderer) {
    if (this._cacheData && this._cacheData.sprite) {
      return;
    }
    var cacheAlpha = this.alpha;
    this.alpha = 1;
    renderer.batch.flush();
    var bounds = this.getLocalBounds(null, true).clone();
    if (this.filters) {
      var padding = this.filters[0].padding;
      bounds.pad(padding);
    }
    bounds.ceil(settings.settings.RESOLUTION);
    var cachedRenderTexture = renderer.renderTexture.current;
    var cachedSourceFrame = renderer.renderTexture.sourceFrame.clone();
    var cachedProjectionTransform = renderer.projection.transform;
    var renderTexture = core.RenderTexture.create({width: bounds.width, height: bounds.height});
    var textureCacheId = "cacheAsBitmap_" + utils.uid();
    this._cacheData.textureCacheId = textureCacheId;
    core.BaseTexture.addToCache(renderTexture.baseTexture, textureCacheId);
    core.Texture.addToCache(renderTexture, textureCacheId);
    var m = this.transform.localTransform.copyTo(_tempMatrix).invert().translate(-bounds.x, -bounds.y);
    this.render = this._cacheData.originalRender;
    renderer.render(this, renderTexture, true, m, false);
    renderer.projection.transform = cachedProjectionTransform;
    renderer.renderTexture.bind(cachedRenderTexture, cachedSourceFrame);
    this.render = this._renderCached;
    this.updateTransform = this.displayObjectUpdateTransform;
    this.calculateBounds = this._calculateCachedBounds;
    this.getLocalBounds = this._getCachedLocalBounds;
    this._mask = null;
    this.filterArea = null;
    var cachedSprite = new sprite.Sprite(renderTexture);
    cachedSprite.transform.worldTransform = this.transform.worldTransform;
    cachedSprite.anchor.x = -(bounds.x / bounds.width);
    cachedSprite.anchor.y = -(bounds.y / bounds.height);
    cachedSprite.alpha = cacheAlpha;
    cachedSprite._bounds = this._bounds;
    this._cacheData.sprite = cachedSprite;
    this.transform._parentID = -1;
    if (!this.parent) {
      this.enableTempParent();
      this.updateTransform();
      this.disableTempParent(null);
    } else {
      this.updateTransform();
    }
    this.containsPoint = cachedSprite.containsPoint.bind(cachedSprite);
  };
  display.DisplayObject.prototype._renderCachedCanvas = function _renderCachedCanvas(renderer) {
    if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
      return;
    }
    this._initCachedDisplayObjectCanvas(renderer);
    this._cacheData.sprite.worldAlpha = this.worldAlpha;
    this._cacheData.sprite._renderCanvas(renderer);
  };
  display.DisplayObject.prototype._initCachedDisplayObjectCanvas = function _initCachedDisplayObjectCanvas(renderer) {
    if (this._cacheData && this._cacheData.sprite) {
      return;
    }
    var bounds = this.getLocalBounds(null, true);
    var cacheAlpha = this.alpha;
    this.alpha = 1;
    var cachedRenderTarget = renderer.context;
    var cachedProjectionTransform = renderer._projTransform;
    bounds.ceil(settings.settings.RESOLUTION);
    var renderTexture = core.RenderTexture.create({width: bounds.width, height: bounds.height});
    var textureCacheId = "cacheAsBitmap_" + utils.uid();
    this._cacheData.textureCacheId = textureCacheId;
    core.BaseTexture.addToCache(renderTexture.baseTexture, textureCacheId);
    core.Texture.addToCache(renderTexture, textureCacheId);
    var m = _tempMatrix;
    this.transform.localTransform.copyTo(m);
    m.invert();
    m.tx -= bounds.x;
    m.ty -= bounds.y;
    this.renderCanvas = this._cacheData.originalRenderCanvas;
    renderer.render(this, renderTexture, true, m, false);
    renderer.context = cachedRenderTarget;
    renderer._projTransform = cachedProjectionTransform;
    this.renderCanvas = this._renderCachedCanvas;
    this.updateTransform = this.displayObjectUpdateTransform;
    this.calculateBounds = this._calculateCachedBounds;
    this.getLocalBounds = this._getCachedLocalBounds;
    this._mask = null;
    this.filterArea = null;
    var cachedSprite = new sprite.Sprite(renderTexture);
    cachedSprite.transform.worldTransform = this.transform.worldTransform;
    cachedSprite.anchor.x = -(bounds.x / bounds.width);
    cachedSprite.anchor.y = -(bounds.y / bounds.height);
    cachedSprite.alpha = cacheAlpha;
    cachedSprite._bounds = this._bounds;
    this._cacheData.sprite = cachedSprite;
    this.transform._parentID = -1;
    if (!this.parent) {
      this.parent = renderer._tempDisplayObjectParent;
      this.updateTransform();
      this.parent = null;
    } else {
      this.updateTransform();
    }
    this.containsPoint = cachedSprite.containsPoint.bind(cachedSprite);
  };
  display.DisplayObject.prototype._calculateCachedBounds = function _calculateCachedBounds() {
    this._bounds.clear();
    this._cacheData.sprite.transform._worldID = this.transform._worldID;
    this._cacheData.sprite._calculateBounds();
    this._bounds.updateID = this._boundsID;
  };
  display.DisplayObject.prototype._getCachedLocalBounds = function _getCachedLocalBounds() {
    return this._cacheData.sprite.getLocalBounds(null);
  };
  display.DisplayObject.prototype._destroyCachedDisplayObject = function _destroyCachedDisplayObject() {
    this._cacheData.sprite._texture.destroy(true);
    this._cacheData.sprite = null;
    core.BaseTexture.removeFromCache(this._cacheData.textureCacheId);
    core.Texture.removeFromCache(this._cacheData.textureCacheId);
    this._cacheData.textureCacheId = null;
  };
  display.DisplayObject.prototype._cacheAsBitmapDestroy = function _cacheAsBitmapDestroy(options) {
    this.cacheAsBitmap = false;
    this.destroy(options);
  };
  exports2.CacheData = CacheData;
});

// node_modules/@pixi/mixin-get-child-by-name/lib/mixin-get-child-by-name.js
var require_mixin_get_child_by_name = __commonJS(() => {
  /*!
   * @pixi/mixin-get-child-by-name - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/mixin-get-child-by-name is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  var display = require_display();
  display.DisplayObject.prototype.name = null;
  display.Container.prototype.getChildByName = function getChildByName(name, deep) {
    for (var i = 0, j = this.children.length; i < j; i++) {
      if (this.children[i].name === name) {
        return this.children[i];
      }
    }
    if (deep) {
      for (var i = 0, j = this.children.length; i < j; i++) {
        var child = this.children[i];
        if (!child.getChildByName) {
          continue;
        }
        var target = this.children[i].getChildByName(name, true);
        if (target) {
          return target;
        }
      }
    }
    return null;
  };
});

// node_modules/@pixi/mixin-get-global-position/lib/mixin-get-global-position.js
var require_mixin_get_global_position = __commonJS(() => {
  /*!
   * @pixi/mixin-get-global-position - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/mixin-get-global-position is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  var display = require_display();
  var math = require_math();
  display.DisplayObject.prototype.getGlobalPosition = function getGlobalPosition(point, skipUpdate) {
    if (point === void 0) {
      point = new math.Point();
    }
    if (skipUpdate === void 0) {
      skipUpdate = false;
    }
    if (this.parent) {
      this.parent.toGlobal(this.position, point, skipUpdate);
    } else {
      point.x = this.position.x;
      point.y = this.position.y;
    }
    return point;
  };
});

// node_modules/@pixi/mesh-extras/lib/mesh-extras.js
var require_mesh_extras = __commonJS((exports2) => {
  /*!
   * @pixi/mesh-extras - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/mesh-extras is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var mesh = require_mesh();
  var constants = require_constants();
  var core = require_core();
  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0
  
  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.
  
  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || {__proto__: []} instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) {
        if (b2.hasOwnProperty(p)) {
          d2[p] = b2[p];
        }
      }
    };
    return extendStatics(d, b);
  };
  function __extends(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  var PlaneGeometry = function(_super) {
    __extends(PlaneGeometry2, _super);
    function PlaneGeometry2(width, height, segWidth, segHeight) {
      if (width === void 0) {
        width = 100;
      }
      if (height === void 0) {
        height = 100;
      }
      if (segWidth === void 0) {
        segWidth = 10;
      }
      if (segHeight === void 0) {
        segHeight = 10;
      }
      var _this = _super.call(this) || this;
      _this.segWidth = segWidth;
      _this.segHeight = segHeight;
      _this.width = width;
      _this.height = height;
      _this.build();
      return _this;
    }
    PlaneGeometry2.prototype.build = function() {
      var total = this.segWidth * this.segHeight;
      var verts = [];
      var uvs = [];
      var indices = [];
      var segmentsX = this.segWidth - 1;
      var segmentsY = this.segHeight - 1;
      var sizeX = this.width / segmentsX;
      var sizeY = this.height / segmentsY;
      for (var i = 0; i < total; i++) {
        var x = i % this.segWidth;
        var y = i / this.segWidth | 0;
        verts.push(x * sizeX, y * sizeY);
        uvs.push(x / segmentsX, y / segmentsY);
      }
      var totalSub = segmentsX * segmentsY;
      for (var i = 0; i < totalSub; i++) {
        var xpos = i % segmentsX;
        var ypos = i / segmentsX | 0;
        var value = ypos * this.segWidth + xpos;
        var value2 = ypos * this.segWidth + xpos + 1;
        var value3 = (ypos + 1) * this.segWidth + xpos;
        var value4 = (ypos + 1) * this.segWidth + xpos + 1;
        indices.push(value, value2, value3, value2, value4, value3);
      }
      this.buffers[0].data = new Float32Array(verts);
      this.buffers[1].data = new Float32Array(uvs);
      this.indexBuffer.data = new Uint16Array(indices);
      this.buffers[0].update();
      this.buffers[1].update();
      this.indexBuffer.update();
    };
    return PlaneGeometry2;
  }(mesh.MeshGeometry);
  var RopeGeometry = function(_super) {
    __extends(RopeGeometry2, _super);
    function RopeGeometry2(width, points, textureScale) {
      if (width === void 0) {
        width = 200;
      }
      if (textureScale === void 0) {
        textureScale = 0;
      }
      var _this = _super.call(this, new Float32Array(points.length * 4), new Float32Array(points.length * 4), new Uint16Array((points.length - 1) * 6)) || this;
      _this.points = points;
      _this._width = width;
      _this.textureScale = textureScale;
      _this.build();
      return _this;
    }
    Object.defineProperty(RopeGeometry2.prototype, "width", {
      get: function() {
        return this._width;
      },
      enumerable: false,
      configurable: true
    });
    RopeGeometry2.prototype.build = function() {
      var points = this.points;
      if (!points) {
        return;
      }
      var vertexBuffer = this.getBuffer("aVertexPosition");
      var uvBuffer = this.getBuffer("aTextureCoord");
      var indexBuffer = this.getIndex();
      if (points.length < 1) {
        return;
      }
      if (vertexBuffer.data.length / 4 !== points.length) {
        vertexBuffer.data = new Float32Array(points.length * 4);
        uvBuffer.data = new Float32Array(points.length * 4);
        indexBuffer.data = new Uint16Array((points.length - 1) * 6);
      }
      var uvs = uvBuffer.data;
      var indices = indexBuffer.data;
      uvs[0] = 0;
      uvs[1] = 0;
      uvs[2] = 0;
      uvs[3] = 1;
      var amount = 0;
      var prev = points[0];
      var textureWidth = this._width * this.textureScale;
      var total = points.length;
      for (var i = 0; i < total; i++) {
        var index = i * 4;
        if (this.textureScale > 0) {
          var dx = prev.x - points[i].x;
          var dy = prev.y - points[i].y;
          var distance = Math.sqrt(dx * dx + dy * dy);
          prev = points[i];
          amount += distance / textureWidth;
        } else {
          amount = i / (total - 1);
        }
        uvs[index] = amount;
        uvs[index + 1] = 0;
        uvs[index + 2] = amount;
        uvs[index + 3] = 1;
      }
      var indexCount = 0;
      for (var i = 0; i < total - 1; i++) {
        var index = i * 2;
        indices[indexCount++] = index;
        indices[indexCount++] = index + 1;
        indices[indexCount++] = index + 2;
        indices[indexCount++] = index + 2;
        indices[indexCount++] = index + 1;
        indices[indexCount++] = index + 3;
      }
      uvBuffer.update();
      indexBuffer.update();
      this.updateVertices();
    };
    RopeGeometry2.prototype.updateVertices = function() {
      var points = this.points;
      if (points.length < 1) {
        return;
      }
      var lastPoint = points[0];
      var nextPoint;
      var perpX = 0;
      var perpY = 0;
      var vertices = this.buffers[0].data;
      var total = points.length;
      for (var i = 0; i < total; i++) {
        var point = points[i];
        var index = i * 4;
        if (i < points.length - 1) {
          nextPoint = points[i + 1];
        } else {
          nextPoint = point;
        }
        perpY = -(nextPoint.x - lastPoint.x);
        perpX = nextPoint.y - lastPoint.y;
        var perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
        var num = this.textureScale > 0 ? this.textureScale * this._width / 2 : this._width / 2;
        perpX /= perpLength;
        perpY /= perpLength;
        perpX *= num;
        perpY *= num;
        vertices[index] = point.x + perpX;
        vertices[index + 1] = point.y + perpY;
        vertices[index + 2] = point.x - perpX;
        vertices[index + 3] = point.y - perpY;
        lastPoint = point;
      }
      this.buffers[0].update();
    };
    RopeGeometry2.prototype.update = function() {
      if (this.textureScale > 0) {
        this.build();
      } else {
        this.updateVertices();
      }
    };
    return RopeGeometry2;
  }(mesh.MeshGeometry);
  var SimpleRope = function(_super) {
    __extends(SimpleRope2, _super);
    function SimpleRope2(texture, points, textureScale) {
      if (textureScale === void 0) {
        textureScale = 0;
      }
      var _this = this;
      var ropeGeometry = new RopeGeometry(texture.height, points, textureScale);
      var meshMaterial = new mesh.MeshMaterial(texture);
      if (textureScale > 0) {
        texture.baseTexture.wrapMode = constants.WRAP_MODES.REPEAT;
      }
      _this = _super.call(this, ropeGeometry, meshMaterial) || this;
      _this.autoUpdate = true;
      return _this;
    }
    SimpleRope2.prototype._render = function(renderer) {
      var geometry = this.geometry;
      if (this.autoUpdate || geometry._width !== this.shader.texture.height) {
        geometry._width = this.shader.texture.height;
        geometry.update();
      }
      _super.prototype._render.call(this, renderer);
    };
    return SimpleRope2;
  }(mesh.Mesh);
  var SimplePlane = function(_super) {
    __extends(SimplePlane2, _super);
    function SimplePlane2(texture, verticesX, verticesY) {
      var _this = this;
      var planeGeometry = new PlaneGeometry(texture.width, texture.height, verticesX, verticesY);
      var meshMaterial = new mesh.MeshMaterial(core.Texture.WHITE);
      _this = _super.call(this, planeGeometry, meshMaterial) || this;
      _this.texture = texture;
      return _this;
    }
    SimplePlane2.prototype.textureUpdated = function() {
      this._textureID = this.shader.texture._updateID;
      var geometry = this.geometry;
      geometry.width = this.shader.texture.width;
      geometry.height = this.shader.texture.height;
      geometry.build();
    };
    Object.defineProperty(SimplePlane2.prototype, "texture", {
      get: function() {
        return this.shader.texture;
      },
      set: function(value) {
        if (this.shader.texture === value) {
          return;
        }
        this.shader.texture = value;
        this._textureID = -1;
        if (value.baseTexture.valid) {
          this.textureUpdated();
        } else {
          value.once("update", this.textureUpdated, this);
        }
      },
      enumerable: false,
      configurable: true
    });
    SimplePlane2.prototype._render = function(renderer) {
      if (this._textureID !== this.shader.texture._updateID) {
        this.textureUpdated();
      }
      _super.prototype._render.call(this, renderer);
    };
    SimplePlane2.prototype.destroy = function(options) {
      this.shader.texture.off("update", this.textureUpdated, this);
      _super.prototype.destroy.call(this, options);
    };
    return SimplePlane2;
  }(mesh.Mesh);
  var SimpleMesh = function(_super) {
    __extends(SimpleMesh2, _super);
    function SimpleMesh2(texture, vertices, uvs, indices, drawMode) {
      if (texture === void 0) {
        texture = core.Texture.EMPTY;
      }
      var _this = this;
      var geometry = new mesh.MeshGeometry(vertices, uvs, indices);
      geometry.getBuffer("aVertexPosition").static = false;
      var meshMaterial = new mesh.MeshMaterial(texture);
      _this = _super.call(this, geometry, meshMaterial, null, drawMode) || this;
      _this.autoUpdate = true;
      return _this;
    }
    Object.defineProperty(SimpleMesh2.prototype, "vertices", {
      get: function() {
        return this.geometry.getBuffer("aVertexPosition").data;
      },
      set: function(value) {
        this.geometry.getBuffer("aVertexPosition").data = value;
      },
      enumerable: false,
      configurable: true
    });
    SimpleMesh2.prototype._render = function(renderer) {
      if (this.autoUpdate) {
        this.geometry.getBuffer("aVertexPosition").update();
      }
      _super.prototype._render.call(this, renderer);
    };
    return SimpleMesh2;
  }(mesh.Mesh);
  var DEFAULT_BORDER_SIZE = 10;
  var NineSlicePlane = function(_super) {
    __extends(NineSlicePlane2, _super);
    function NineSlicePlane2(texture, leftWidth, topHeight, rightWidth, bottomHeight) {
      if (leftWidth === void 0) {
        leftWidth = DEFAULT_BORDER_SIZE;
      }
      if (topHeight === void 0) {
        topHeight = DEFAULT_BORDER_SIZE;
      }
      if (rightWidth === void 0) {
        rightWidth = DEFAULT_BORDER_SIZE;
      }
      if (bottomHeight === void 0) {
        bottomHeight = DEFAULT_BORDER_SIZE;
      }
      var _this = _super.call(this, core.Texture.WHITE, 4, 4) || this;
      _this._origWidth = texture.orig.width;
      _this._origHeight = texture.orig.height;
      _this._width = _this._origWidth;
      _this._height = _this._origHeight;
      _this._leftWidth = leftWidth;
      _this._rightWidth = rightWidth;
      _this._topHeight = topHeight;
      _this._bottomHeight = bottomHeight;
      _this.texture = texture;
      return _this;
    }
    NineSlicePlane2.prototype.textureUpdated = function() {
      this._textureID = this.shader.texture._updateID;
      this._refresh();
    };
    Object.defineProperty(NineSlicePlane2.prototype, "vertices", {
      get: function() {
        return this.geometry.getBuffer("aVertexPosition").data;
      },
      set: function(value) {
        this.geometry.getBuffer("aVertexPosition").data = value;
      },
      enumerable: false,
      configurable: true
    });
    NineSlicePlane2.prototype.updateHorizontalVertices = function() {
      var vertices = this.vertices;
      var scale = this._getMinScale();
      vertices[9] = vertices[11] = vertices[13] = vertices[15] = this._topHeight * scale;
      vertices[17] = vertices[19] = vertices[21] = vertices[23] = this._height - this._bottomHeight * scale;
      vertices[25] = vertices[27] = vertices[29] = vertices[31] = this._height;
    };
    NineSlicePlane2.prototype.updateVerticalVertices = function() {
      var vertices = this.vertices;
      var scale = this._getMinScale();
      vertices[2] = vertices[10] = vertices[18] = vertices[26] = this._leftWidth * scale;
      vertices[4] = vertices[12] = vertices[20] = vertices[28] = this._width - this._rightWidth * scale;
      vertices[6] = vertices[14] = vertices[22] = vertices[30] = this._width;
    };
    NineSlicePlane2.prototype._getMinScale = function() {
      var w = this._leftWidth + this._rightWidth;
      var scaleW = this._width > w ? 1 : this._width / w;
      var h = this._topHeight + this._bottomHeight;
      var scaleH = this._height > h ? 1 : this._height / h;
      var scale = Math.min(scaleW, scaleH);
      return scale;
    };
    Object.defineProperty(NineSlicePlane2.prototype, "width", {
      get: function() {
        return this._width;
      },
      set: function(value) {
        this._width = value;
        this._refresh();
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(NineSlicePlane2.prototype, "height", {
      get: function() {
        return this._height;
      },
      set: function(value) {
        this._height = value;
        this._refresh();
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(NineSlicePlane2.prototype, "leftWidth", {
      get: function() {
        return this._leftWidth;
      },
      set: function(value) {
        this._leftWidth = value;
        this._refresh();
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(NineSlicePlane2.prototype, "rightWidth", {
      get: function() {
        return this._rightWidth;
      },
      set: function(value) {
        this._rightWidth = value;
        this._refresh();
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(NineSlicePlane2.prototype, "topHeight", {
      get: function() {
        return this._topHeight;
      },
      set: function(value) {
        this._topHeight = value;
        this._refresh();
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(NineSlicePlane2.prototype, "bottomHeight", {
      get: function() {
        return this._bottomHeight;
      },
      set: function(value) {
        this._bottomHeight = value;
        this._refresh();
      },
      enumerable: false,
      configurable: true
    });
    NineSlicePlane2.prototype._refresh = function() {
      var texture = this.texture;
      var uvs = this.geometry.buffers[1].data;
      this._origWidth = texture.orig.width;
      this._origHeight = texture.orig.height;
      var _uvw = 1 / this._origWidth;
      var _uvh = 1 / this._origHeight;
      uvs[0] = uvs[8] = uvs[16] = uvs[24] = 0;
      uvs[1] = uvs[3] = uvs[5] = uvs[7] = 0;
      uvs[6] = uvs[14] = uvs[22] = uvs[30] = 1;
      uvs[25] = uvs[27] = uvs[29] = uvs[31] = 1;
      uvs[2] = uvs[10] = uvs[18] = uvs[26] = _uvw * this._leftWidth;
      uvs[4] = uvs[12] = uvs[20] = uvs[28] = 1 - _uvw * this._rightWidth;
      uvs[9] = uvs[11] = uvs[13] = uvs[15] = _uvh * this._topHeight;
      uvs[17] = uvs[19] = uvs[21] = uvs[23] = 1 - _uvh * this._bottomHeight;
      this.updateHorizontalVertices();
      this.updateVerticalVertices();
      this.geometry.buffers[0].update();
      this.geometry.buffers[1].update();
    };
    return NineSlicePlane2;
  }(SimplePlane);
  exports2.NineSlicePlane = NineSlicePlane;
  exports2.PlaneGeometry = PlaneGeometry;
  exports2.RopeGeometry = RopeGeometry;
  exports2.SimpleMesh = SimpleMesh;
  exports2.SimplePlane = SimplePlane;
  exports2.SimpleRope = SimpleRope;
});

// node_modules/@pixi/sprite-animated/lib/sprite-animated.js
var require_sprite_animated = __commonJS((exports2) => {
  /*!
   * @pixi/sprite-animated - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * @pixi/sprite-animated is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  var core = require_core();
  var sprite = require_sprite();
  var ticker = require_ticker();
  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0
  
  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.
  
  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || {__proto__: []} instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) {
        if (b2.hasOwnProperty(p)) {
          d2[p] = b2[p];
        }
      }
    };
    return extendStatics(d, b);
  };
  function __extends(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  var AnimatedSprite = function(_super) {
    __extends(AnimatedSprite2, _super);
    function AnimatedSprite2(textures, autoUpdate) {
      if (autoUpdate === void 0) {
        autoUpdate = true;
      }
      var _this = _super.call(this, textures[0] instanceof core.Texture ? textures[0] : textures[0].texture) || this;
      _this._textures = null;
      _this._durations = null;
      _this._autoUpdate = autoUpdate;
      _this._isConnectedToTicker = false;
      _this.animationSpeed = 1;
      _this.loop = true;
      _this.updateAnchor = false;
      _this.onComplete = null;
      _this.onFrameChange = null;
      _this.onLoop = null;
      _this._currentTime = 0;
      _this._playing = false;
      _this._previousFrame = null;
      _this.textures = textures;
      return _this;
    }
    AnimatedSprite2.prototype.stop = function() {
      if (!this._playing) {
        return;
      }
      this._playing = false;
      if (this._autoUpdate && this._isConnectedToTicker) {
        ticker.Ticker.shared.remove(this.update, this);
        this._isConnectedToTicker = false;
      }
    };
    AnimatedSprite2.prototype.play = function() {
      if (this._playing) {
        return;
      }
      this._playing = true;
      if (this._autoUpdate && !this._isConnectedToTicker) {
        ticker.Ticker.shared.add(this.update, this, ticker.UPDATE_PRIORITY.HIGH);
        this._isConnectedToTicker = true;
      }
    };
    AnimatedSprite2.prototype.gotoAndStop = function(frameNumber) {
      this.stop();
      var previousFrame = this.currentFrame;
      this._currentTime = frameNumber;
      if (previousFrame !== this.currentFrame) {
        this.updateTexture();
      }
    };
    AnimatedSprite2.prototype.gotoAndPlay = function(frameNumber) {
      var previousFrame = this.currentFrame;
      this._currentTime = frameNumber;
      if (previousFrame !== this.currentFrame) {
        this.updateTexture();
      }
      this.play();
    };
    AnimatedSprite2.prototype.update = function(deltaTime) {
      var elapsed = this.animationSpeed * deltaTime;
      var previousFrame = this.currentFrame;
      if (this._durations !== null) {
        var lag = this._currentTime % 1 * this._durations[this.currentFrame];
        lag += elapsed / 60 * 1e3;
        while (lag < 0) {
          this._currentTime--;
          lag += this._durations[this.currentFrame];
        }
        var sign = Math.sign(this.animationSpeed * deltaTime);
        this._currentTime = Math.floor(this._currentTime);
        while (lag >= this._durations[this.currentFrame]) {
          lag -= this._durations[this.currentFrame] * sign;
          this._currentTime += sign;
        }
        this._currentTime += lag / this._durations[this.currentFrame];
      } else {
        this._currentTime += elapsed;
      }
      if (this._currentTime < 0 && !this.loop) {
        this.gotoAndStop(0);
        if (this.onComplete) {
          this.onComplete();
        }
      } else if (this._currentTime >= this._textures.length && !this.loop) {
        this.gotoAndStop(this._textures.length - 1);
        if (this.onComplete) {
          this.onComplete();
        }
      } else if (previousFrame !== this.currentFrame) {
        if (this.loop && this.onLoop) {
          if (this.animationSpeed > 0 && this.currentFrame < previousFrame) {
            this.onLoop();
          } else if (this.animationSpeed < 0 && this.currentFrame > previousFrame) {
            this.onLoop();
          }
        }
        this.updateTexture();
      }
    };
    AnimatedSprite2.prototype.updateTexture = function() {
      var currentFrame = this.currentFrame;
      if (this._previousFrame === currentFrame) {
        return;
      }
      this._previousFrame = currentFrame;
      this._texture = this._textures[currentFrame];
      this._textureID = -1;
      this._textureTrimmedID = -1;
      this._cachedTint = 16777215;
      this.uvs = this._texture._uvs.uvsFloat32;
      if (this.updateAnchor) {
        this._anchor.copyFrom(this._texture.defaultAnchor);
      }
      if (this.onFrameChange) {
        this.onFrameChange(this.currentFrame);
      }
    };
    AnimatedSprite2.prototype.destroy = function(options) {
      this.stop();
      _super.prototype.destroy.call(this, options);
      this.onComplete = null;
      this.onFrameChange = null;
      this.onLoop = null;
    };
    AnimatedSprite2.fromFrames = function(frames) {
      var textures = [];
      for (var i = 0; i < frames.length; ++i) {
        textures.push(core.Texture.from(frames[i]));
      }
      return new AnimatedSprite2(textures);
    };
    AnimatedSprite2.fromImages = function(images) {
      var textures = [];
      for (var i = 0; i < images.length; ++i) {
        textures.push(core.Texture.from(images[i]));
      }
      return new AnimatedSprite2(textures);
    };
    Object.defineProperty(AnimatedSprite2.prototype, "totalFrames", {
      get: function() {
        return this._textures.length;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(AnimatedSprite2.prototype, "textures", {
      get: function() {
        return this._textures;
      },
      set: function(value) {
        if (value[0] instanceof core.Texture) {
          this._textures = value;
          this._durations = null;
        } else {
          this._textures = [];
          this._durations = [];
          for (var i = 0; i < value.length; i++) {
            this._textures.push(value[i].texture);
            this._durations.push(value[i].time);
          }
        }
        this._previousFrame = null;
        this.gotoAndStop(0);
        this.updateTexture();
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(AnimatedSprite2.prototype, "currentFrame", {
      get: function() {
        var currentFrame = Math.floor(this._currentTime) % this._textures.length;
        if (currentFrame < 0) {
          currentFrame += this._textures.length;
        }
        return currentFrame;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(AnimatedSprite2.prototype, "playing", {
      get: function() {
        return this._playing;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(AnimatedSprite2.prototype, "autoUpdate", {
      get: function() {
        return this._autoUpdate;
      },
      set: function(value) {
        if (value !== this._autoUpdate) {
          this._autoUpdate = value;
          if (!this._autoUpdate && this._isConnectedToTicker) {
            ticker.Ticker.shared.remove(this.update, this);
            this._isConnectedToTicker = false;
          } else if (this._autoUpdate && !this._isConnectedToTicker && this._playing) {
            ticker.Ticker.shared.add(this.update, this);
            this._isConnectedToTicker = true;
          }
        }
      },
      enumerable: false,
      configurable: true
    });
    return AnimatedSprite2;
  }(sprite.Sprite);
  exports2.AnimatedSprite = AnimatedSprite;
});

// node_modules/pixi.js/lib/pixi.js
var require_pixi = __commonJS((exports2) => {
  /*!
   * pixi.js - v5.3.7
   * Compiled Tue, 29 Dec 2020 19:30:11 UTC
   *
   * pixi.js is licensed under the MIT License.
   * http://www.opensource.org/licenses/mit-license
   */
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  require_polyfill();
  var utils = require_utils();
  var accessibility = require_accessibility();
  var interaction = require_interaction();
  var app = require_app();
  var core = require_core();
  var extract = require_extract();
  var loaders = require_loaders();
  var particles = require_particles();
  var prepare = require_prepare();
  var spritesheet = require_spritesheet();
  var spriteTiling = require_sprite_tiling();
  var textBitmap = require_text_bitmap();
  var ticker = require_ticker();
  var filterAlpha = require_filter_alpha();
  var filterBlur = require_filter_blur();
  var filterColorMatrix = require_filter_color_matrix();
  var filterDisplacement = require_filter_displacement();
  var filterFxaa = require_filter_fxaa();
  var filterNoise = require_filter_noise();
  require_mixin_cache_as_bitmap();
  require_mixin_get_child_by_name();
  require_mixin_get_global_position();
  var constants = require_constants();
  var display = require_display();
  var graphics = require_graphics();
  var math = require_math();
  var mesh = require_mesh();
  var meshExtras = require_mesh_extras();
  var runner = require_runner();
  var sprite = require_sprite();
  var spriteAnimated = require_sprite_animated();
  var text = require_text();
  var settings = require_settings();
  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0
  
  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.
  
  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || {__proto__: []} instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) {
        if (b2.hasOwnProperty(p)) {
          d2[p] = b2[p];
        }
      }
    };
    return extendStatics(d, b);
  };
  function __extends(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  var v5 = "5.0.0";
  function useDeprecated() {
    var PIXI = this;
    Object.defineProperties(PIXI, {
      SVG_SIZE: {
        get: function() {
          utils.deprecation(v5, "PIXI.utils.SVG_SIZE property has moved to PIXI.resources.SVGResource.SVG_SIZE");
          return PIXI.SVGResource.SVG_SIZE;
        }
      },
      TransformStatic: {
        get: function() {
          utils.deprecation(v5, "PIXI.TransformStatic class has been removed, use PIXI.Transform");
          return PIXI.Transform;
        }
      },
      TransformBase: {
        get: function() {
          utils.deprecation(v5, "PIXI.TransformBase class has been removed, use PIXI.Transform");
          return PIXI.Transform;
        }
      },
      TRANSFORM_MODE: {
        get: function() {
          utils.deprecation(v5, "PIXI.TRANSFORM_MODE property has been removed");
          return {STATIC: 0, DYNAMIC: 1};
        }
      },
      WebGLRenderer: {
        get: function() {
          utils.deprecation(v5, "PIXI.WebGLRenderer class has moved to PIXI.Renderer");
          return PIXI.Renderer;
        }
      },
      CanvasRenderTarget: {
        get: function() {
          utils.deprecation(v5, "PIXI.CanvasRenderTarget class has moved to PIXI.utils.CanvasRenderTarget");
          return PIXI.utils.CanvasRenderTarget;
        }
      },
      loader: {
        get: function() {
          utils.deprecation(v5, "PIXI.loader instance has moved to PIXI.Loader.shared");
          return PIXI.Loader.shared;
        }
      },
      FilterManager: {
        get: function() {
          utils.deprecation(v5, "PIXI.FilterManager class has moved to PIXI.systems.FilterSystem");
          return PIXI.systems.FilterSystem;
        }
      },
      CanvasTinter: {
        get: function() {
          utils.deprecation("5.2.0", "PIXI.CanvasTinter namespace has moved to PIXI.canvasUtils");
          return PIXI.canvasUtils;
        }
      },
      GroupD8: {
        get: function() {
          utils.deprecation("5.2.0", "PIXI.GroupD8 namespace has moved to PIXI.groupD8");
          return PIXI.groupD8;
        }
      }
    });
    PIXI.accessibility = {};
    Object.defineProperties(PIXI.accessibility, {
      AccessibilityManager: {
        get: function() {
          utils.deprecation("5.3.0", "PIXI.accessibility.AccessibilityManager moved to PIXI.AccessibilityManager");
          return PIXI.AccessibilityManager;
        }
      }
    });
    PIXI.interaction = {};
    Object.defineProperties(PIXI.interaction, {
      InteractionManager: {
        get: function() {
          utils.deprecation("5.3.0", "PIXI.interaction.InteractionManager moved to PIXI.InteractionManager");
          return PIXI.InteractionManager;
        }
      },
      InteractionData: {
        get: function() {
          utils.deprecation("5.3.0", "PIXI.interaction.InteractionData moved to PIXI.InteractionData");
          return PIXI.InteractionData;
        }
      },
      InteractionEvent: {
        get: function() {
          utils.deprecation("5.3.0", "PIXI.interaction.InteractionEvent moved to PIXI.InteractionEvent");
          return PIXI.InteractionEvent;
        }
      }
    });
    PIXI.prepare = {};
    Object.defineProperties(PIXI.prepare, {
      BasePrepare: {
        get: function() {
          utils.deprecation("5.2.1", "PIXI.prepare.BasePrepare moved to PIXI.BasePrepare");
          return PIXI.BasePrepare;
        }
      },
      Prepare: {
        get: function() {
          utils.deprecation("5.2.1", "PIXI.prepare.Prepare moved to PIXI.Prepare");
          return PIXI.Prepare;
        }
      },
      CanvasPrepare: {
        get: function() {
          utils.deprecation("5.2.1", "PIXI.prepare.CanvasPrepare moved to PIXI.CanvasPrepare");
          return PIXI.CanvasPrepare;
        }
      }
    });
    PIXI.extract = {};
    Object.defineProperties(PIXI.extract, {
      Extract: {
        get: function() {
          utils.deprecation("5.2.1", "PIXI.extract.Extract moved to PIXI.Extract");
          return PIXI.Extract;
        }
      },
      CanvasExtract: {
        get: function() {
          utils.deprecation("5.2.1", "PIXI.extract.CanvasExtract moved to PIXI.CanvasExtract");
          return PIXI.CanvasExtract;
        }
      }
    });
    PIXI.extras = {};
    Object.defineProperties(PIXI.extras, {
      TilingSprite: {
        get: function() {
          utils.deprecation(v5, "PIXI.extras.TilingSprite class has moved to PIXI.TilingSprite");
          return PIXI.TilingSprite;
        }
      },
      TilingSpriteRenderer: {
        get: function() {
          utils.deprecation(v5, "PIXI.extras.TilingSpriteRenderer class has moved to PIXI.TilingSpriteRenderer");
          return PIXI.TilingSpriteRenderer;
        }
      },
      AnimatedSprite: {
        get: function() {
          utils.deprecation(v5, "PIXI.extras.AnimatedSprite class has moved to PIXI.AnimatedSprite");
          return PIXI.AnimatedSprite;
        }
      },
      BitmapText: {
        get: function() {
          utils.deprecation(v5, "PIXI.extras.BitmapText class has moved to PIXI.BitmapText");
          return PIXI.BitmapText;
        }
      }
    });
    PIXI.TilingSprite.fromFrame = function fromFrame(frameId, width, height) {
      utils.deprecation("5.3.0", "TilingSprite.fromFrame is deprecated, use TilingSprite.from");
      return PIXI.TilingSprite.from(frameId, {width, height});
    };
    PIXI.TilingSprite.fromImage = function fromImage(imageId, width, height, options) {
      if (options === void 0) {
        options = {};
      }
      utils.deprecation("5.3.0", "TilingSprite.fromImage is deprecated, use TilingSprite.from");
      if (options && typeof options !== "object") {
        options = {
          scaleMode: arguments[4],
          resourceOptions: {
            crossorigin: arguments[3]
          }
        };
      }
      options.width = width;
      options.height = height;
      return PIXI.TilingSprite.from(imageId, options);
    };
    Object.defineProperties(PIXI.utils, {
      getSvgSize: {
        get: function() {
          utils.deprecation(v5, "PIXI.utils.getSvgSize function has moved to PIXI.resources.SVGResource.getSize");
          return PIXI.resources.SVGResource.getSize;
        }
      }
    });
    PIXI.mesh = {};
    Object.defineProperties(PIXI.mesh, {
      Mesh: {
        get: function() {
          utils.deprecation(v5, "PIXI.mesh.Mesh class has moved to PIXI.SimpleMesh");
          return PIXI.SimpleMesh;
        }
      },
      NineSlicePlane: {
        get: function() {
          utils.deprecation(v5, "PIXI.mesh.NineSlicePlane class has moved to PIXI.NineSlicePlane");
          return PIXI.NineSlicePlane;
        }
      },
      Plane: {
        get: function() {
          utils.deprecation(v5, "PIXI.mesh.Plane class has moved to PIXI.SimplePlane");
          return PIXI.SimplePlane;
        }
      },
      Rope: {
        get: function() {
          utils.deprecation(v5, "PIXI.mesh.Rope class has moved to PIXI.SimpleRope");
          return PIXI.SimpleRope;
        }
      },
      RawMesh: {
        get: function() {
          utils.deprecation(v5, "PIXI.mesh.RawMesh class has moved to PIXI.Mesh");
          return PIXI.Mesh;
        }
      },
      CanvasMeshRenderer: {
        get: function() {
          utils.deprecation(v5, "PIXI.mesh.CanvasMeshRenderer class has moved to PIXI.CanvasMeshRenderer");
          return PIXI.CanvasMeshRenderer;
        }
      },
      MeshRenderer: {
        get: function() {
          utils.deprecation(v5, "PIXI.mesh.MeshRenderer class has moved to PIXI.MeshRenderer");
          return PIXI.MeshRenderer;
        }
      }
    });
    PIXI.particles = {};
    Object.defineProperties(PIXI.particles, {
      ParticleContainer: {
        get: function() {
          utils.deprecation(v5, "PIXI.particles.ParticleContainer class has moved to PIXI.ParticleContainer");
          return PIXI.ParticleContainer;
        }
      },
      ParticleRenderer: {
        get: function() {
          utils.deprecation(v5, "PIXI.particles.ParticleRenderer class has moved to PIXI.ParticleRenderer");
          return PIXI.ParticleRenderer;
        }
      }
    });
    PIXI.ticker = {};
    Object.defineProperties(PIXI.ticker, {
      Ticker: {
        get: function() {
          utils.deprecation(v5, "PIXI.ticker.Ticker class has moved to PIXI.Ticker");
          return PIXI.Ticker;
        }
      },
      shared: {
        get: function() {
          utils.deprecation(v5, "PIXI.ticker.shared instance has moved to PIXI.Ticker.shared");
          return PIXI.Ticker.shared;
        }
      }
    });
    PIXI.loaders = {};
    Object.defineProperties(PIXI.loaders, {
      Loader: {
        get: function() {
          utils.deprecation(v5, "PIXI.loaders.Loader class has moved to PIXI.Loader");
          return PIXI.Loader;
        }
      },
      Resource: {
        get: function() {
          utils.deprecation(v5, "PIXI.loaders.Resource class has moved to PIXI.LoaderResource");
          return PIXI.LoaderResource;
        }
      },
      bitmapFontParser: {
        get: function() {
          utils.deprecation(v5, "PIXI.loaders.bitmapFontParser function has moved to PIXI.BitmapFontLoader.use");
          return PIXI.BitmapFontLoader.use;
        }
      },
      parseBitmapFontData: {
        get: function() {
          utils.deprecation(v5, "PIXI.loaders.parseBitmapFontData function has removed");
        }
      },
      spritesheetParser: {
        get: function() {
          utils.deprecation(v5, "PIXI.loaders.spritesheetParser function has moved to PIXI.SpritesheetLoader.use");
          return PIXI.SpritesheetLoader.use;
        }
      },
      getResourcePath: {
        get: function() {
          utils.deprecation(v5, "PIXI.loaders.getResourcePath property has moved to PIXI.SpritesheetLoader.getResourcePath");
          return PIXI.SpritesheetLoader.getResourcePath;
        }
      }
    });
    PIXI.Loader.addPixiMiddleware = function addPixiMiddleware(middleware) {
      utils.deprecation(v5, "PIXI.loaders.Loader.addPixiMiddleware function is deprecated, use PIXI.loaders.Loader.registerPlugin");
      return PIXI.loaders.Loader.registerPlugin({use: middleware()});
    };
    var eventToSignal = function(event) {
      return "on" + event.charAt(0).toUpperCase() + event.slice(1);
    };
    Object.assign(PIXI.Loader.prototype, {
      on: function(event) {
        var signal = eventToSignal(event);
        utils.deprecation(v5, "PIXI.Loader#on is completely deprecated, use PIXI.Loader#" + signal + ".add");
      },
      once: function(event) {
        var signal = eventToSignal(event);
        utils.deprecation(v5, "PIXI.Loader#once is completely deprecated, use PIXI.Loader#" + signal + ".once");
      },
      off: function(event) {
        var signal = eventToSignal(event);
        utils.deprecation(v5, "PIXI.Loader#off is completely deprecated, use PIXI.Loader#" + signal + ".detach");
      }
    });
    Object.defineProperty(PIXI.extract, "WebGLExtract", {
      get: function() {
        utils.deprecation(v5, "PIXI.extract.WebGLExtract method has moved to PIXI.Extract");
        return PIXI.Extract;
      }
    });
    Object.defineProperty(PIXI.prepare, "WebGLPrepare", {
      get: function() {
        utils.deprecation(v5, "PIXI.prepare.WebGLPrepare class has moved to PIXI.Prepare");
        return PIXI.Prepare;
      }
    });
    PIXI.Container.prototype._renderWebGL = function _renderWebGL(renderer) {
      utils.deprecation(v5, "PIXI.Container._renderWebGL method has moved to PIXI.Container._render");
      this._render(renderer);
    };
    PIXI.Container.prototype.renderWebGL = function renderWebGL(renderer) {
      utils.deprecation(v5, "PIXI.Container.renderWebGL method has moved to PIXI.Container.render");
      this.render(renderer);
    };
    PIXI.DisplayObject.prototype.renderWebGL = function renderWebGL(renderer) {
      utils.deprecation(v5, "PIXI.DisplayObject.renderWebGL method has moved to PIXI.DisplayObject.render");
      this.render(renderer);
    };
    PIXI.Container.prototype.renderAdvancedWebGL = function renderAdvancedWebGL(renderer) {
      utils.deprecation(v5, "PIXI.Container.renderAdvancedWebGL method has moved to PIXI.Container.renderAdvanced");
      this.renderAdvanced(renderer);
    };
    Object.defineProperties(PIXI.settings, {
      TRANSFORM_MODE: {
        get: function() {
          utils.deprecation(v5, "PIXI.settings.TRANSFORM_MODE property has been removed");
          return 0;
        },
        set: function() {
          utils.deprecation(v5, "PIXI.settings.TRANSFORM_MODE property has been removed");
        }
      }
    });
    var BaseTextureAny = PIXI.BaseTexture;
    BaseTextureAny.prototype.loadSource = function loadSource(image) {
      utils.deprecation(v5, "PIXI.BaseTexture.loadSource method has been deprecated");
      var resource = PIXI.resources.autoDetectResource(image);
      resource.internal = true;
      this.setResource(resource);
      this.update();
    };
    var baseTextureIdDeprecation = false;
    Object.defineProperties(BaseTextureAny.prototype, {
      hasLoaded: {
        get: function() {
          utils.deprecation(v5, "PIXI.BaseTexture.hasLoaded property has been removed, use PIXI.BaseTexture.valid");
          return this.valid;
        }
      },
      imageUrl: {
        get: function() {
          var _a;
          utils.deprecation(v5, "PIXI.BaseTexture.imageUrl property has been removed, use PIXI.BaseTexture.resource.url");
          return (_a = this.resource) === null || _a === void 0 ? void 0 : _a.url;
        },
        set: function(imageUrl) {
          utils.deprecation(v5, "PIXI.BaseTexture.imageUrl property has been removed, use PIXI.BaseTexture.resource.url");
          if (this.resource) {
            this.resource.url = imageUrl;
          }
        }
      },
      source: {
        get: function() {
          utils.deprecation(v5, "PIXI.BaseTexture.source property has been moved, use `PIXI.BaseTexture.resource.source`");
          return this.resource.source;
        },
        set: function(source) {
          utils.deprecation(v5, "PIXI.BaseTexture.source property has been moved, use `PIXI.BaseTexture.resource.source` if you want to set HTMLCanvasElement. Otherwise, create new BaseTexture.");
          if (this.resource) {
            this.resource.source = source;
          }
        }
      },
      premultiplyAlpha: {
        get: function() {
          utils.deprecation("5.2.0", "PIXI.BaseTexture.premultiplyAlpha property has been changed to `alphaMode`, see `PIXI.ALPHA_MODES`");
          return this.alphaMode !== 0;
        },
        set: function(value) {
          utils.deprecation("5.2.0", "PIXI.BaseTexture.premultiplyAlpha property has been changed to `alphaMode`, see `PIXI.ALPHA_MODES`");
          this.alphaMode = Number(value);
        }
      },
      _id: {
        get: function() {
          if (!baseTextureIdDeprecation) {
            utils.deprecation("5.2.0", "PIXI.BaseTexture._id batch local field has been changed to `_batchLocation`");
            baseTextureIdDeprecation = true;
          }
          return this._batchLocation;
        },
        set: function(value) {
          this._batchLocation = value;
        }
      }
    });
    BaseTextureAny.fromImage = function fromImage(canvas, crossorigin, scaleMode, scale) {
      utils.deprecation(v5, "PIXI.BaseTexture.fromImage method has been replaced with PIXI.BaseTexture.from");
      var resourceOptions = {scale, crossorigin};
      return BaseTextureAny.from(canvas, {scaleMode, resourceOptions});
    };
    BaseTextureAny.fromCanvas = function fromCanvas(canvas, scaleMode) {
      utils.deprecation(v5, "PIXI.BaseTexture.fromCanvas method has been replaced with PIXI.BaseTexture.from");
      return BaseTextureAny.from(canvas, {scaleMode});
    };
    BaseTextureAny.fromSVG = function fromSVG(canvas, crossorigin, scaleMode, scale) {
      utils.deprecation(v5, "PIXI.BaseTexture.fromSVG method has been replaced with PIXI.BaseTexture.from");
      var resourceOptions = {scale, crossorigin};
      return BaseTextureAny.from(canvas, {scaleMode, resourceOptions});
    };
    Object.defineProperties(PIXI.resources.ImageResource.prototype, {
      premultiplyAlpha: {
        get: function() {
          utils.deprecation("5.2.0", "PIXI.resources.ImageResource.premultiplyAlpha property has been changed to `alphaMode`, see `PIXI.ALPHA_MODES`");
          return this.alphaMode !== 0;
        },
        set: function(value) {
          utils.deprecation("5.2.0", "PIXI.resources.ImageResource.premultiplyAlpha property has been changed to `alphaMode`, see `PIXI.ALPHA_MODES`");
          this.alphaMode = Number(value);
        }
      }
    });
    PIXI.Point.prototype.copy = function copy(p) {
      utils.deprecation(v5, "PIXI.Point.copy method has been replaced with PIXI.Point.copyFrom");
      return this.copyFrom(p);
    };
    PIXI.ObservablePoint.prototype.copy = function copy(p) {
      utils.deprecation(v5, "PIXI.ObservablePoint.copy method has been replaced with PIXI.ObservablePoint.copyFrom");
      return this.copyFrom(p);
    };
    PIXI.Rectangle.prototype.copy = function copy(p) {
      utils.deprecation(v5, "PIXI.Rectangle.copy method has been replaced with PIXI.Rectangle.copyFrom");
      return this.copyFrom(p);
    };
    PIXI.Matrix.prototype.copy = function copy(p) {
      utils.deprecation(v5, "PIXI.Matrix.copy method has been replaced with PIXI.Matrix.copyTo");
      return this.copyTo(p);
    };
    PIXI.systems.StateSystem.prototype.setState = function setState(s) {
      utils.deprecation("v5.1.0", "StateSystem.setState has been renamed to StateSystem.set");
      return this.set(s);
    };
    Object.assign(PIXI.systems.FilterSystem.prototype, {
      getRenderTarget: function(_clear, resolution) {
        utils.deprecation(v5, "PIXI.FilterManager.getRenderTarget method has been replaced with PIXI.systems.FilterSystem#getFilterTexture");
        return this.getFilterTexture(null, resolution);
      },
      returnRenderTarget: function(renderTexture) {
        utils.deprecation(v5, "PIXI.FilterManager.returnRenderTarget method has been replaced with PIXI.systems.FilterSystem.returnFilterTexture");
        this.returnFilterTexture(renderTexture);
      },
      calculateScreenSpaceMatrix: function(outputMatrix) {
        utils.deprecation(v5, "PIXI.systems.FilterSystem.calculateScreenSpaceMatrix method is removed, use `(vTextureCoord * inputSize.xy) + outputFrame.xy` instead");
        var mappedMatrix = outputMatrix.identity();
        var _a = this.activeState, sourceFrame = _a.sourceFrame, destinationFrame = _a.destinationFrame;
        mappedMatrix.translate(sourceFrame.x / destinationFrame.width, sourceFrame.y / destinationFrame.height);
        mappedMatrix.scale(destinationFrame.width, destinationFrame.height);
        return mappedMatrix;
      },
      calculateNormalizedScreenSpaceMatrix: function(outputMatrix) {
        utils.deprecation(v5, "PIXI.systems.FilterManager.calculateNormalizedScreenSpaceMatrix method is removed, use `((vTextureCoord * inputSize.xy) + outputFrame.xy) / outputFrame.zw` instead.");
        var _a = this.activeState, sourceFrame = _a.sourceFrame, destinationFrame = _a.destinationFrame;
        var mappedMatrix = outputMatrix.identity();
        mappedMatrix.translate(sourceFrame.x / destinationFrame.width, sourceFrame.y / destinationFrame.height);
        var translateScaleX = destinationFrame.width / sourceFrame.width;
        var translateScaleY = destinationFrame.height / sourceFrame.height;
        mappedMatrix.scale(translateScaleX, translateScaleY);
        return mappedMatrix;
      }
    });
    Object.defineProperties(PIXI.RenderTexture.prototype, {
      sourceFrame: {
        get: function() {
          utils.deprecation(v5, "PIXI.RenderTexture.sourceFrame property has been removed");
          return this.filterFrame;
        }
      },
      size: {
        get: function() {
          utils.deprecation(v5, "PIXI.RenderTexture.size property has been removed");
          return this._frame;
        }
      }
    });
    var BlurXFilter = function(_super) {
      __extends(BlurXFilter2, _super);
      function BlurXFilter2(strength, quality, resolution, kernelSize) {
        var _this = this;
        utils.deprecation(v5, "PIXI.filters.BlurXFilter class is deprecated, use PIXI.filters.BlurFilterPass");
        _this = _super.call(this, true, strength, quality, resolution, kernelSize) || this;
        return _this;
      }
      return BlurXFilter2;
    }(PIXI.filters.BlurFilterPass);
    var BlurYFilter = function(_super) {
      __extends(BlurYFilter2, _super);
      function BlurYFilter2(strength, quality, resolution, kernelSize) {
        var _this = this;
        utils.deprecation(v5, "PIXI.filters.BlurYFilter class is deprecated, use PIXI.filters.BlurFilterPass");
        _this = _super.call(this, false, strength, quality, resolution, kernelSize) || this;
        return _this;
      }
      return BlurYFilter2;
    }(PIXI.filters.BlurFilterPass);
    Object.assign(PIXI.filters, {
      BlurXFilter,
      BlurYFilter
    });
    var SpriteAny = PIXI.Sprite, TextureAny = PIXI.Texture, GraphicsAny = PIXI.Graphics;
    if (!GraphicsAny.prototype.generateCanvasTexture) {
      GraphicsAny.prototype.generateCanvasTexture = function generateCanvasTexture() {
        utils.deprecation(v5, 'PIXI.Graphics.generateCanvasTexture method is only available in "pixi.js-legacy"');
      };
    }
    Object.defineProperty(GraphicsAny.prototype, "graphicsData", {
      get: function() {
        utils.deprecation(v5, "PIXI.Graphics.graphicsData property is deprecated, use PIXI.Graphics.geometry.graphicsData");
        return this.geometry.graphicsData;
      }
    });
    function spriteFrom(name, source, crossorigin, scaleMode) {
      utils.deprecation(v5, "PIXI.Sprite." + name + " method is deprecated, use PIXI.Sprite.from");
      return SpriteAny.from(source, {
        resourceOptions: {
          scale: scaleMode,
          crossorigin
        }
      });
    }
    SpriteAny.fromImage = spriteFrom.bind(null, "fromImage");
    SpriteAny.fromSVG = spriteFrom.bind(null, "fromSVG");
    SpriteAny.fromCanvas = spriteFrom.bind(null, "fromCanvas");
    SpriteAny.fromVideo = spriteFrom.bind(null, "fromVideo");
    SpriteAny.fromFrame = spriteFrom.bind(null, "fromFrame");
    function textureFrom(name, source, crossorigin, scaleMode) {
      utils.deprecation(v5, "PIXI.Texture." + name + " method is deprecated, use PIXI.Texture.from");
      return TextureAny.from(source, {
        resourceOptions: {
          scale: scaleMode,
          crossorigin
        }
      });
    }
    TextureAny.fromImage = textureFrom.bind(null, "fromImage");
    TextureAny.fromSVG = textureFrom.bind(null, "fromSVG");
    TextureAny.fromCanvas = textureFrom.bind(null, "fromCanvas");
    TextureAny.fromVideo = textureFrom.bind(null, "fromVideo");
    TextureAny.fromFrame = textureFrom.bind(null, "fromFrame");
    Object.defineProperty(PIXI.AbstractRenderer.prototype, "autoResize", {
      get: function() {
        utils.deprecation(v5, "PIXI.AbstractRenderer.autoResize property is deprecated, use PIXI.AbstractRenderer.autoDensity");
        return this.autoDensity;
      },
      set: function(value) {
        utils.deprecation(v5, "PIXI.AbstractRenderer.autoResize property is deprecated, use PIXI.AbstractRenderer.autoDensity");
        this.autoDensity = value;
      }
    });
    Object.defineProperty(PIXI.Renderer.prototype, "textureManager", {
      get: function() {
        utils.deprecation(v5, "PIXI.Renderer.textureManager property is deprecated, use PIXI.Renderer.texture");
        return this.texture;
      }
    });
    PIXI.utils.mixins = {
      mixin: function() {
        utils.deprecation(v5, "PIXI.utils.mixins.mixin function is no longer available");
      },
      delayMixin: function() {
        utils.deprecation(v5, "PIXI.utils.mixins.delayMixin function is no longer available");
      },
      performMixins: function() {
        utils.deprecation(v5, "PIXI.utils.mixins.performMixins function is no longer available");
      }
    };
    Object.defineProperty(PIXI.BitmapText.prototype, "font", {
      get: function() {
        utils.deprecation("5.3.0", "PIXI.BitmapText.font property is deprecated, use fontName, fontSize, tint or align properties");
        return {
          name: this._fontName,
          size: this._fontSize,
          tint: this._tint,
          align: this._align
        };
      },
      set: function(value) {
        utils.deprecation("5.3.0", "PIXI.BitmapText.font property is deprecated, use fontName, fontSize, tint or align properties");
        if (!value) {
          return;
        }
        var style = {font: value};
        this._upgradeStyle(style);
        style.fontSize = style.fontSize || PIXI.BitmapFont.available[style.fontName].size;
        this._fontName = style.fontName;
        this._fontSize = style.fontSize;
        this.dirty = true;
      }
    });
  }
  core.Renderer.registerPlugin("accessibility", accessibility.AccessibilityManager);
  core.Renderer.registerPlugin("extract", extract.Extract);
  core.Renderer.registerPlugin("interaction", interaction.InteractionManager);
  core.Renderer.registerPlugin("particle", particles.ParticleRenderer);
  core.Renderer.registerPlugin("prepare", prepare.Prepare);
  core.Renderer.registerPlugin("batch", core.BatchRenderer);
  core.Renderer.registerPlugin("tilingSprite", spriteTiling.TilingSpriteRenderer);
  loaders.Loader.registerPlugin(textBitmap.BitmapFontLoader);
  loaders.Loader.registerPlugin(spritesheet.SpritesheetLoader);
  app.Application.registerPlugin(ticker.TickerPlugin);
  app.Application.registerPlugin(loaders.AppLoaderPlugin);
  var VERSION = "5.3.7";
  var filters = {
    AlphaFilter: filterAlpha.AlphaFilter,
    BlurFilter: filterBlur.BlurFilter,
    BlurFilterPass: filterBlur.BlurFilterPass,
    ColorMatrixFilter: filterColorMatrix.ColorMatrixFilter,
    DisplacementFilter: filterDisplacement.DisplacementFilter,
    FXAAFilter: filterFxaa.FXAAFilter,
    NoiseFilter: filterNoise.NoiseFilter
  };
  Object.keys(accessibility).forEach(function(key) {
    Object.defineProperty(exports2, key, {
      enumerable: true,
      get: function() {
        return accessibility[key];
      }
    });
  });
  Object.keys(interaction).forEach(function(key) {
    Object.defineProperty(exports2, key, {
      enumerable: true,
      get: function() {
        return interaction[key];
      }
    });
  });
  Object.keys(app).forEach(function(key) {
    Object.defineProperty(exports2, key, {
      enumerable: true,
      get: function() {
        return app[key];
      }
    });
  });
  Object.keys(core).forEach(function(key) {
    Object.defineProperty(exports2, key, {
      enumerable: true,
      get: function() {
        return core[key];
      }
    });
  });
  Object.keys(extract).forEach(function(key) {
    Object.defineProperty(exports2, key, {
      enumerable: true,
      get: function() {
        return extract[key];
      }
    });
  });
  Object.keys(loaders).forEach(function(key) {
    Object.defineProperty(exports2, key, {
      enumerable: true,
      get: function() {
        return loaders[key];
      }
    });
  });
  Object.keys(particles).forEach(function(key) {
    Object.defineProperty(exports2, key, {
      enumerable: true,
      get: function() {
        return particles[key];
      }
    });
  });
  Object.keys(prepare).forEach(function(key) {
    Object.defineProperty(exports2, key, {
      enumerable: true,
      get: function() {
        return prepare[key];
      }
    });
  });
  Object.keys(spritesheet).forEach(function(key) {
    Object.defineProperty(exports2, key, {
      enumerable: true,
      get: function() {
        return spritesheet[key];
      }
    });
  });
  Object.keys(spriteTiling).forEach(function(key) {
    Object.defineProperty(exports2, key, {
      enumerable: true,
      get: function() {
        return spriteTiling[key];
      }
    });
  });
  Object.keys(textBitmap).forEach(function(key) {
    Object.defineProperty(exports2, key, {
      enumerable: true,
      get: function() {
        return textBitmap[key];
      }
    });
  });
  Object.keys(ticker).forEach(function(key) {
    Object.defineProperty(exports2, key, {
      enumerable: true,
      get: function() {
        return ticker[key];
      }
    });
  });
  Object.keys(constants).forEach(function(key) {
    Object.defineProperty(exports2, key, {
      enumerable: true,
      get: function() {
        return constants[key];
      }
    });
  });
  Object.keys(display).forEach(function(key) {
    Object.defineProperty(exports2, key, {
      enumerable: true,
      get: function() {
        return display[key];
      }
    });
  });
  Object.keys(graphics).forEach(function(key) {
    Object.defineProperty(exports2, key, {
      enumerable: true,
      get: function() {
        return graphics[key];
      }
    });
  });
  Object.keys(math).forEach(function(key) {
    Object.defineProperty(exports2, key, {
      enumerable: true,
      get: function() {
        return math[key];
      }
    });
  });
  Object.keys(mesh).forEach(function(key) {
    Object.defineProperty(exports2, key, {
      enumerable: true,
      get: function() {
        return mesh[key];
      }
    });
  });
  Object.keys(meshExtras).forEach(function(key) {
    Object.defineProperty(exports2, key, {
      enumerable: true,
      get: function() {
        return meshExtras[key];
      }
    });
  });
  Object.keys(runner).forEach(function(key) {
    Object.defineProperty(exports2, key, {
      enumerable: true,
      get: function() {
        return runner[key];
      }
    });
  });
  Object.keys(sprite).forEach(function(key) {
    Object.defineProperty(exports2, key, {
      enumerable: true,
      get: function() {
        return sprite[key];
      }
    });
  });
  Object.keys(spriteAnimated).forEach(function(key) {
    Object.defineProperty(exports2, key, {
      enumerable: true,
      get: function() {
        return spriteAnimated[key];
      }
    });
  });
  Object.keys(text).forEach(function(key) {
    Object.defineProperty(exports2, key, {
      enumerable: true,
      get: function() {
        return text[key];
      }
    });
  });
  Object.keys(settings).forEach(function(key) {
    Object.defineProperty(exports2, key, {
      enumerable: true,
      get: function() {
        return settings[key];
      }
    });
  });
  exports2.utils = utils;
  exports2.VERSION = VERSION;
  exports2.filters = filters;
  exports2.useDeprecated = useDeprecated;
});

// cache/app.js
var require_app2 = __commonJS((exports2) => {
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.getAnimatedSprite = exports2.loaded = void 0;
  var PIXI = require_pixi();
  var app = new PIXI.Application({
    resizeTo: window
  });
  document.body.appendChild(app.view);
  exports2.loaded = new Promise((resolve) => {
    PIXI.Loader.shared.add("assets/akuma-ball.json").load(resolve);
  });
  function getAnimatedSprite(name) {
    const sheet = PIXI.Loader.shared.resources[`assets/${name}.json`].spritesheet;
    const sprite = new PIXI.AnimatedSprite(sheet.animations.image_sequence);
    sprite.animationSpeed = 60 / 15;
    return sprite;
  }
  exports2.getAnimatedSprite = getAnimatedSprite;
  exports2.default = app;
});

// cache/index.js
"use strict";
require_app2();
