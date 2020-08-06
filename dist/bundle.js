/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/browserCapabilities.js":
/*!************************************!*\
  !*** ./src/browserCapabilities.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }\n\nfunction _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, \"next\", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, \"throw\", err); } _next(undefined); }); }; }\n\nmodule.exports = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {\n  var capabilities, ctx, b, blob, u, resp, body, reader, d;\n  return regeneratorRuntime.wrap(function _callee$(_context) {\n    while (1) {\n      switch (_context.prev = _context.next) {\n        case 0:\n          capabilities = {\n            sampleRate: false,\n            streaming: false\n          }; // Evaluate webaudio\n\n          try {\n            ctx = new AudioContext({\n              sampleRate: 8000\n            });\n            capabilities.sampleRate = ctx.sampleRate === 8000;\n            ctx.close().then(function () {\n              return console.log(\"Closed capability detection audio context.\");\n            });\n          } catch (e) {\n            console.log(\"WebAudio sample rate capability detection failed. Assuming fallback.\");\n          } // Evaluate streaming\n\n\n          _context.prev = 2;\n          b = new Uint8Array(Math.pow(2, 16));\n          blob = new Blob([b], {\n            type: \"application/octet-stream\"\n          });\n          u = URL.createObjectURL(blob);\n          _context.next = 8;\n          return fetch(u);\n\n        case 8:\n          resp = _context.sent;\n          _context.next = 11;\n          return resp.body;\n\n        case 11:\n          body = _context.sent;\n          reader = body.getReader();\n\n        case 13:\n          if (false) {}\n\n          _context.next = 16;\n          return reader.read();\n\n        case 16:\n          d = _context.sent;\n\n          if (!d.done) {\n            _context.next = 19;\n            break;\n          }\n\n          return _context.abrupt(\"break\", 21);\n\n        case 19:\n          _context.next = 13;\n          break;\n\n        case 21:\n          capabilities.streaming = true;\n          _context.next = 27;\n          break;\n\n        case 24:\n          _context.prev = 24;\n          _context.t0 = _context[\"catch\"](2);\n          console.log(\"Streaming capability detection failed. Assuming fallback.\");\n\n        case 27:\n          return _context.abrupt(\"return\", capabilities);\n\n        case 28:\n        case \"end\":\n          return _context.stop();\n      }\n    }\n  }, _callee, null, [[2, 24]]);\n}));\n\n//# sourceURL=webpack:///./src/browserCapabilities.js?");

/***/ }),

/***/ "./src/main.js":
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }\n\nfunction _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, \"next\", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, \"throw\", err); } _next(undefined); }); }; }\n\n// This script shouldn't do anything without explicit user interaction (Triggering playback)\nvar browserCapabilities = __webpack_require__(/*! ./browserCapabilities */ \"./src/browserCapabilities.js\");\n\nwindow[\"initializePlayer\"] = /*#__PURE__*/function () {\n  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url) {\n    var z, zz;\n    return regeneratorRuntime.wrap(function _callee$(_context) {\n      while (1) {\n        switch (_context.prev = _context.next) {\n          case 0:\n            // Check browser capabilities\n            console.time(\"capability\");\n            _context.t0 = console;\n            _context.next = 4;\n            return browserCapabilities();\n\n          case 4:\n            _context.t1 = _context.sent;\n\n            _context.t0.log.call(_context.t0, _context.t1);\n\n            console.timeEnd(\"capability\");\n            z = new Uint8Array(Math.pow(2, 28));\n            z.fill(255);\n            zz = new Uint8Array(Math.pow(2, 28));\n            console.time(\"Copy\");\n            zz.set(z, 0);\n            console.timeEnd(\"Copy\");\n\n          case 13:\n          case \"end\":\n            return _context.stop();\n        }\n      }\n    }, _callee);\n  }));\n\n  return function (_x) {\n    return _ref.apply(this, arguments);\n  };\n}();\n\n//# sourceURL=webpack:///./src/main.js?");

/***/ })

/******/ });