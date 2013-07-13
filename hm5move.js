// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
try {
  this['Module'] = Module;
  Module.test;
} catch(e) {
  this['Module'] = Module = {};
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (typeof module === "object") {
  module.exports = Module;
}
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function(filename) { return Module['read'](filename, true) };
  Module['load'] = function(f) {
    globalEval(read(f));
  };
  if (!Module['arguments']) {
    Module['arguments'] = process['argv'].slice(2);
  }
}
if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  Module['read'] = read;
  Module['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (!Module['arguments']) {
    if (typeof scriptArgs != 'undefined') {
      Module['arguments'] = scriptArgs;
    } else if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) {
  if (!Module['print']) {
    Module['print'] = function(x) {
      console.log(x);
    };
  }
  if (!Module['printErr']) {
    Module['printErr'] = function(x) {
      console.log(x);
    };
  }
}
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (!Module['arguments']) {
    if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WORKER) {
  // We can do very little here...
  var TRY_USE_DUMP = false;
  if (!Module['print']) {
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }
  Module['load'] = importScripts;
}
if (!ENVIRONMENT_IS_WORKER && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_SHELL) {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
if (!Module['preRun']) Module['preRun'] = [];
if (!Module['postRun']) Module['postRun'] = [];
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (type == 'i64' || type == 'double' || vararg) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    type.flatIndexes = type.fields.map(function(field) {
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        size = Types.types[field].flatSize;
        alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2 + 2*i;
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xff;
      if (needed) {
        buffer.push(code);
        needed--;
      }
      if (buffer.length == 0) {
        if (code < 128) return String.fromCharCode(code);
        buffer.push(code);
        if (code > 191 && code < 224) {
          needed = 1;
        } else {
          needed = 2;
        }
        return '';
      }
      if (needed > 0) return '';
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var ret;
      if (c1 > 191 && c1 < 224) {
        ret = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
      } else {
        ret = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+(((low)>>>(0))))+((+(((high)>>>(0))))*(+(4294967296)))) : ((+(((low)>>>(0))))+((+(((high)|(0))))*(+(4294967296))))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function abort(text) {
  Module.print(text + ':\n' + (new Error).stack);
  ABORT = true;
  throw "Assertion: " + text;
}
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = globalScope['Module']['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(unescape(encodeURIComponent(value)).length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,((Math.min((+(Math.floor((value)/(+(4294967296))))), (+(4294967295))))|0)>>>0],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, or (2) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATINIT__ = []; // functions called during startup
var __ATMAIN__ = []; // functions called when main() is to be run
var __ATEXIT__ = []; // functions called during shutdown
var runtimeInitialized = false;
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledInit = false, calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    } 
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
function addPreRun(func) {
  if (!Module['preRun']) Module['preRun'] = [];
  else if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
  Module['preRun'].push(func);
}
var awaitingMemoryInitializer = false;
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
    runPostSets();
  }
  // always do this asynchronously, to keep shell and web as similar as possible
  addPreRun(function() {
    if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
      applyData(Module['readBinary'](filename));
    } else {
      Browser.asyncLoad(filename, function(data) {
        applyData(data);
      }, function(data) {
        throw 'could not load memory initializer ' + filename;
      });
    }
  });
  awaitingMemoryInitializer = false;
}
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 30296;
__ATINIT__ = __ATINIT__.concat([
]);
var __ZTVN10__cxxabiv120__si_class_type_infoE;
var __ZTVN10__cxxabiv117__class_type_infoE;
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,48,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,64,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([0,0,0,0,0,0,0,0,68,0,52,0,67,0,84,0,69,0,85,8,84,8,68,8,52,8,67,8,53,9,52,9,68,9,84,9,67,9,53,10,69,10,68,10,67,10,84,10,85,11,69,11,68,11,67,11,52,11,51,12,52,12,68,12,84,12,69,12,83,13,84,13,68,13,52,13,69,13,83,14,67,14,68,14,69,14,52,14,51,15,67,15,68,15,69,15,84,15,68,16,52,16,51,16,84,16,85,16,68,17,84,17,83,17,52,17,53,17,68,18,67,18,83,18,69,18,53,18,68,19,67,19,51,19,69,19,85,19,68,24,52,24,51,24,69,24,85,24,68,25,84,25,83,25,69,25,53,25,68,26,67,26,83,26,52,26,53,26,68,27,67,27,51,27,84,27,85,27,68,32,52,32,36,32,69,32,70,32,68,33,84,33,100,33,69,33,70,33,68,34,67,34,66,34,52,34,36,34,68,35,67,35,66,35,84,35,100,35,68,40,69,40,67,40,83,40,51,40,68,42,52,42,84,42,85,42,83,42,68,43,84,43,52,43,53,43,51,43,68,44,67,44,69,44,53,44,85,44,69,48,68,48,52,48,67,48,66,48,69,49,68,49,84,49,67,49,66,49,52,50,68,50,67,50,84,50,100,50,84,51,68,51,67,51,52,51,36,51,67,52,68,52,84,52,69,52,70,52,67,53,68,53,52,53,69,53,70,53,84,54,68,54,69,54,52,54,36,54,52,55,68,55,69,55,84,55,100,55,68,56,67,56,83,56,69,56,85,56,68,57,67,57,51,57,69,57,53,57,68,58,84,58,85,58,52,58,53,58,68,62,52,62,51,62,84,62,83,62,69,64,84,64,68,64,83,64,67,64,69,65,52,65,68,65,51,65,67,65,52,66,69,66,68,66,85,66,84,66,84,67,69,67,68,67,53,67,52,67,67,68,52,68,68,68,53,68,69,68,67,69,84,69,68,69,85,69,69,69,84,70,67,70,68,70,51,70,52,70,52,71,67,71,68,71,83,71,84,71,70,72,69,72,68,72,84,72,83,72,70,73,69,73,68,73,52,73,51,73,36,74,52,74,68,74,69,74,85,74,100,75,84,75,68,75,69,75,53,75,66,76,67,76,68,76,52,76,53,76,66,77,67,77,68,77,84,77,85,77,100,78,84,78,68,78,67,78,51,78,36,79,52,79,68,79,67,79,83,79,68,80,67,80,70,80,69,80,83,80,68,81,67,81,70,81,69,81,51,81,68,82,84,82,36,82,52,82,85,82,68,83,52,83,100,83,84,83,53,83,68,84,69,84,66,84,67,84,53,84,68,85,69,85,66,85,67,85,85,85,68,86,52,86,100,86,84,86,51,86,68,87,84,87,36,87,52,87,83,87,68,88,67,88,66,88,69,88,70,88,68,90,84,90,100,90,52,90,36,90,84,96,68,96,67,96,51,96,52,97,68,97,67,97,83,97,69,98,68,98,84,98,83,98,69,99,68,99,52,99,51,99,68,104,52,104,67,104,51,104,68,112,52,112,67,112,69,112,68,113,84,113,67,113,69,113,68,114,67,114,84,114,52,114,68,118,69,118,52,118,84,118,68,120,69,120,67,120,83,120,68,121,69,121,67,121,51,121,68,122,52,122,84,122,85,122,68,123,84,123,52,123,53,123,68,124,67,124,69,124,53,124,68,125,67,125,69,125,85,125,68,126,84,126,52,126,51,126,68,127,52,127,84,127,83,127,68,128,67,128,66,128,69,128,68,130,84,130,100,130,52,130,68,136,52,136,69,136,68,137,84,137,69,137,68,138,67,138,52,138,68,139,67,139,84,139,68,144,67,144,69,144,68,146,84,146,52,146,68,152,67,152,68,154,84,154,68,160,0,0,0,0,0,0,0,0,0,0,0,0,153,0,137,0,152,0,169,0,154,0,170,8,169,8,153,8,137,8,152,8,138,9,137,9,153,9,169,9,152,9,138,10,154,10,153,10,152,10,169,10,170,11,154,11,153,11,152,11,137,11,136,12,137,12,153,12,169,12,154,12,168,13,169,13,153,13,137,13,154,13,168,14,152,14,153,14,154,14,137,14,136,15,152,15,153,15,154,15,169,15,153,16,137,16,136,16,169,16,170,16,153,17,169,17,168,17,137,17,138,17,153,18,152,18,168,18,154,18,138,18,153,19,152,19,136,19,154,19,170,19,153,24,137,24,136,24,154,24,170,24,153,25,169,25,168,25,154,25,138,25,153,26,152,26,168,26,137,26,138,26,153,27,152,27,136,27,169,27,170,27,153,32,137,32,121,32,154,32,155,32,153,33,169,33,185,33,154,33,155,33,153,34,152,34,151,34,137,34,121,34,153,35,152,35,151,35,169,35,185,35,153,40,154,40,152,40,168,40,136,40,153,42,137,42,169,42,170,42,168,42,153,43,169,43,137,43,138,43,136,43,153,44,152,44,154,44,138,44,170,44,154,48,153,48,137,48,152,48,151,48,154,49,153,49,169,49,152,49,151,49,137,50,153,50,152,50,169,50,185,50,169,51,153,51,152,51,137,51,121,51,152,52,153,52,169,52,154,52,155,52,152,53,153,53,137,53,154,53,155,53,169,54,153,54,154,54,137,54,121,54,137,55,153,55,154,55,169,55,185,55,153,56,152,56,168,56,154,56,170,56,153,57,152,57,136,57,154,57,138,57,153,58,169,58,170,58,137,58,138,58,153,62,137,62,136,62,169,62,168,62,154,64,169,64,153,64,168,64,152,64,154,65,137,65,153,65,136,65,152,65,137,66,154,66,153,66,170,66,169,66,169,67,154,67,153,67,138,67,137,67,152,68,137,68,153,68,138,68,154,68,152,69,169,69,153,69,170,69,154,69,169,70,152,70,153,70,136,70,137,70,137,71,152,71,153,71,168,71,169,71,155,72,154,72,153,72,169,72,168,72,155,73,154,73,153,73,137,73,136,73,121,74,137,74,153,74,154,74,170,74,185,75,169,75,153,75,154,75,138,75,151,76,152,76,153,76,137,76,138,76,151,77,152,77,153,77,169,77,170,77,185,78,169,78,153,78,152,78,136,78,121,79,137,79,153,79,152,79,168,79,153,80,152,80,155,80,154,80,168,80,153,81,152,81,155,81,154,81,136,81,153,82,169,82,121,82,137,82,170,82,153,83,137,83,185,83,169,83,138,83,153,84,154,84,151,84,152,84,138,84,153,85,154,85,151,85,152,85,170,85,153,86,137,86,185,86,169,86,136,86,153,87,169,87,121,87,137,87,168,87,153,88,152,88,151,88,154,88,155,88,153,90,169,90,185,90,137,90,121,90,169,96,153,96,152,96,136,96,137,97,153,97,152,97,168,97,154,98,153,98,169,98,168,98,154,99,153,99,137,99,136,99,153,104,137,104,152,104,136,104,153,112,137,112,152,112,154,112,153,113,169,113,152,113,154,113,153,114,152,114,169,114,137,114,153,118,154,118,137,118,169,118,153,120,154,120,152,120,168,120,153,121,154,121,152,121,136,121,153,122,137,122,169,122,170,122,153,123,169,123,137,123,138,123,153,124,152,124,154,124,138,124,153,125,152,125,154,125,170,125,153,126,169,126,137,126,136,126,153,127,137,127,169,127,168,127,153,128,152,128,151,128,154,128,153,130,169,130,185,130,137,130,153,136,137,136,154,136,153,137,169,137,154,137,153,138,152,138,137,138,153,139,152,139,169,139,153,144,152,144,154,144,153,146,169,146,137,146,153,152,152,152,153,154,169,154,153,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,75,0,0,192,75,0,0,80,76,0,0,224,76,0,0,112,77,0,0,0,78,0,0,144,78,0,0,32,79,0,0,176,79,0,0,64,80,0,0,208,80,0,0,96,81,0,0,240,81,0,0,128,82,0,0,16,83,0,0,160,83,0,0,48,84,0,0,192,84,0,0,80,85,0,0,224,85,0,0,112,86,0,0,0,0,0,0,115,101,97,114,99,104,46,99,112,112,0,0,0,0,0,0,37,50,88,37,99,37,100,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,37,100,62,32,37,46,51,102,32,37,115,32,40,37,100,41,10,0,0,0,0,0,0,0,45,45,45,45,0,0,0,0,37,50,88,0,0,0,0,0,97,108,112,104,97,32,60,61,32,98,101,116,97,0,0,0,118,101,99,116,111,114,0,0,88,88,88,88,32,105,110,118,97,108,105,100,32,109,111,118,101,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,105,110,116,32,110,101,103,97,115,99,111,117,116,40,66,111,97,114,100,32,42,44,32,105,110,116,44,32,105,110,116,44,32,105,110,116,44,32,77,111,118,101,32,42,44,32,72,97,115,104,32,42,44,32,72,97,115,104,32,42,44,32,105,110,116,41,0,0,0,0,0,0,0,0,0,0,0,0,0,0,71,116,0,0,0,0,0,0,1,16,0,0,0,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,10,0,0,0,10,0,0,0,10,0,0,0,10,0,0,0,10,0,0,0,6,0,0,0,6,0,0,0,4,0,0,0,2,0,0,0,0,0,0,0,69,10,84,0,85,44,69,52,69,14,84,54,85,8,83,26,68,10,100,50,0,0,0,0,0,0,0,0,0,12,0,0,16,0,0,0,4,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,12,0,0,14,0,0,0,10,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,12,0,0,14,0,0,0,22,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,12,0,0,6,0,0,0,2,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,12,0,0,18,0,0,0,24,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,101,120,99,101,112,116,105,111,110,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,83,116,49,50,108,101,110,103,116,104,95,101,114,114,111,114,0,0,0,0,0,0,0,0,83,116,49,49,108,111,103,105,99,95,101,114,114,111,114,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,55,84,105,109,101,111,117,116,0,0,0,0,0,0,0,0,49,54,65,108,112,104,97,66,101,116,97,86,105,115,105,116,111,114,0,0,0,0,0,0,49,52,77,111,118,97,98,108,101,86,105,115,105,116,111,114,0,0,0,0,0,0,0,0,49,51,77,111,118,101,67,111,108,108,101,99,116,111,114,0,0,0,0,0,208,10,0,0,0,0,0,0,224,10,0,0,0,0,0,0,240,10,0,0,248,11,0,0,0,0,0,0,0,0,0,0,0,11,0,0,32,12,0,0,0,0,0,0,0,0,0,0,24,11,0,0,248,11,0,0,0,0,0,0,0,0,0,0,40,11,0,0,64,12,0,0,0,0,0,0,0,0,0,0,80,11,0,0,80,12,0,0,0,0,0,0,0,0,0,0,120,11,0,0,240,11,0,0,0,0,0,0,0,0,0,0,160,11,0,0,0,0,0,0,176,11,0,0,120,12,0,0,0,0,0,0,0,0,0,0,200,11,0,0,0,0,0,0,224,11,0,0,120,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,15,0,0,0,5,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,14,0,0,0,5,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,13,0,0,0,5,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,2,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,12,0,0,0,5,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,2,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,11,0,0,0,5,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,10,0,0,0,5,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,9,0,0,0,5,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,8,0,0,0,5,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,19,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,18,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,17,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,16,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,27,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,3,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,26,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,3,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,25,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,2,0,0,0,1,0,0,0,1,0,0,0,3,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,24,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,1,0,0,0,2,0,0,0,3,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,35,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,2,0,0,0,34,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,33,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,254,255,255,255,0,0,0,0,0,0,0,0,32,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,2,0,0,0,0,0,0,0,44,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,43,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,42,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,40,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,55,0,0,0,5,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,254,255,255,255,0,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,54,0,0,0,5,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,2,0,0,0,0,0,0,0,53,0,0,0,5,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,1,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,1,0,0,0,1,0,0,0,52,0,0,0,5,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,2,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,254,255,255,255,0,0,0,0,1,0,0,0,51,0,0,0,5,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,1,0,0,0,50,0,0,0,5,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,49,0,0,0,5,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,2,0,0,0,48,0,0,0,5,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,2,0,0,0,62,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,58,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,2,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,57,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,1,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,56,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,2,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,71,0,0,0,5,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,70,0,0,0,5,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,69,0,0,0,5,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0].concat([0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,68,0,0,0,5,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,67,0,0,0,5,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,66,0,0,0,5,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,65,0,0,0,5,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,64,0,0,0,5,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,79,0,0,0,5,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,1,0,0,0,78,0,0,0,5,0,0,0,254,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,77,0,0,0,5,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,2,0,0,0,76,0,0,0,5,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,2,0,0,0,75,0,0,0,5,0,0,0,254,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,254,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,74,0,0,0,5,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,2,0,0,0,0,0,0,0,73,0,0,0,5,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,1,0,0,0,1,0,0,0,72,0,0,0,5,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,254,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,254,255,255,255,0,0,0,0,1,0,0,0,87,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,1,0,0,0,86,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,85,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,2,0,0,0,84,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,2,0,0,0,83,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,255,255,255,255,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,82,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,2,0,0,0,0,0,0,0,81,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,1,0,0,0,1,0,0,0,80,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,254,255,255,255,0,0,0,0,1,0,0,0,90,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,2,0,0,0,0,0,0,0,88,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,2,0,0,0,99,0,0,0,4,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,98,0,0,0,4,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,97,0,0,0,4,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,96,0,0,0,4,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,104,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,118,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,114,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,113,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,112,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,127,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,126,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,125,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,124,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,123,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,122,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,121,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,120,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,130,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,128,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,139,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,138,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,137,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,136,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,146,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,144,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,154,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,152,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,160,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,160,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,12,0,0,0,0,0,0,0,0,0,0,160,12,0,0,0,0,0,0,0,0,0,0,160,12,0,0,0,0,0,0,0,0,0,0,160,12,0,0,0,0,0,0,0,0,0,0,160,12,0,0,0,0,0,0,0,0,0,0,160,12,0,0,0,0,0,0,0,0,0,0,160,12,0,0,0,0,0,0,0,0,0,0,160,12,0,0,0,0,0,0,8,0,0,0,5,0,0,0,32,18,0,0,112,17,0,0,192,16,0,0,16,16,0,0,96,15,0,0,176,14,0,0,0,14,0,0,80,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,18,0,0,0,0,0,0,0,0,0,0,112,17,0,0,0,0,0,0,0,0,0,0,192,16,0,0,0,0,0,0,0,0,0,0,16,16,0,0,0,0,0,0,0,0,0,0,96,15,0,0,0,0,0,0,0,0,0,0,176,14,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,0,0,0,0,0,0,0,80,13,0,0,0,0,0,0,16,0,0,0,5,0,0,0,224,20,0,0,48,20,0,0,128,19,0,0,208,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,20,0,0,0,0,0,0,0,0,0,0,48,20,0,0,0,0,0,0,0,0,0,0,128,19,0,0,0,0,0,0,0,0,0,0,208,18,0,0,0,0,0,0,0,0,0,0,224,20,0,0,0,0,0,0,0,0,0,0,48,20,0,0,0,0,0,0,0,0,0,0,128,19,0,0,0,0,0,0,0,0,0,0,208,18,0,0,0,0,0,0,24,0,0,0,5,0,0,0,160,23,0,0,240,22,0,0,64,22,0,0,144,21,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,23,0,0,0,0,0,0,0,0,0,0,240,22,0,0,0,0,0,0,0,0,0,0,64,22,0,0,0,0,0,0,0,0,0,0,144,21,0,0,0,0,0,0,0,0,0,0,144,21,0,0,0,0,0,0,0,0,0,0,64,22,0,0,0,0,0,0,0,0,0,0,240,22,0,0,0,0,0,0,0,0,0,0,160,23,0,0,0,0,0,0,32,0,0,0,5,0,0,0,96,26,0,0,176,25,0,0,0,25,0,0,80,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,26,0,0,0,0,0,0,0,0,0,0,176,25,0,0,0,0,0,0,0,0,0,0,0,25,0,0,0,0,0,0,0,0,0,0,80,24,0,0,0,0,0,0,0,0,0,0,80,24,0,0,0,0,0,0,0,0,0,0,0,25,0,0,0,0,0,0,0,0,0,0,176,25,0,0,0,0,0,0,0,0,0,0,96,26,0,0,0,0,0,0,40,0,0,0,5,0,0,0,32,29,0,0,112,28,0,0,192,27,0,0,16,27,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,29,0,0,0,0,0,0,0,0,0,0,32,29,0,0,0,0,0,0,0,0,0,0,112,28,0,0,0,0,0,0,0,0,0,0,192,27,0,0,0,0,0,0,0,0,0,0,16,27,0,0,0,0,0,0,0,0,0,0,16,27,0,0,0,0,0,0,0,0,0,0,192,27,0,0,0,0,0,0,0,0,0,0,112,28,0,0,0,0,0,0,48,0,0,0,5,0,0,0,160,34,0,0,240,33,0,0,64,33,0,0,144,32,0,0,224,31,0,0,48,31,0,0,128,30,0,0,208,29,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,34,0,0,0,0,0,0,0,0,0,0,240,33,0,0,0,0,0,0,0,0,0,0,64,33,0,0,0,0,0,0,0,0,0,0,144,32,0,0,0,0,0,0,0,0,0,0,224,31,0,0,0,0,0,0,0,0,0,0,48,31,0,0,0,0,0,0,0,0,0,0,128,30,0,0,0,0,0,0,0,0,0,0,208,29,0,0,0,0,0,0,56,0,0,0,5,0,0,0,96,37,0,0,176,36,0,0,0,36,0,0,80,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,37,0,0,0,0,0,0,0,0,0,0,176,36,0,0,0,0,0,0,0,0,0,0,0,36,0,0,0,0,0,0,0,0,0,0,0,36,0,0,0,0,0,0,0,0,0,0,176,36,0,0,0,0,0,0,0,0,0,0,96,37,0,0,0,0,0,0,0,0,0,0,80,35,0,0,0,0,0,0,0,0,0,0,80,35,0,0,0,0,0,0,64,0,0,0,5,0,0,0,224,42,0,0,48,42,0,0,128,41,0,0,208,40,0,0,32,40,0,0,112,39,0,0,192,38,0,0,16,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,42,0,0,0,0,0,0,0,0,0,0,48,42,0,0,0,0,0,0,0,0,0,0,128,41,0,0,0,0,0,0,0,0,0,0])
.concat([208,40,0,0,0,0,0,0,0,0,0,0,32,40,0,0,0,0,0,0,0,0,0,0,112,39,0,0,0,0,0,0,0,0,0,0,192,38,0,0,0,0,0,0,0,0,0,0,16,38,0,0,0,0,0,0,72,0,0,0,5,0,0,0,96,48,0,0,176,47,0,0,0,47,0,0,80,46,0,0,160,45,0,0,240,44,0,0,64,44,0,0,144,43,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,48,0,0,0,0,0,0,0,0,0,0,176,47,0,0,0,0,0,0,0,0,0,0,0,47,0,0,0,0,0,0,0,0,0,0,80,46,0,0,0,0,0,0,0,0,0,0,160,45,0,0,0,0,0,0,0,0,0,0,240,44,0,0,0,0,0,0,0,0,0,0,64,44,0,0,0,0,0,0,0,0,0,0,144,43,0,0,0,0,0,0,80,0,0,0,5,0,0,0,224,53,0,0,48,53,0,0,128,52,0,0,208,51,0,0,32,51,0,0,112,50,0,0,192,49,0,0,16,49,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,53,0,0,0,0,0,0,0,0,0,0,48,53,0,0,0,0,0,0,0,0,0,0,128,52,0,0,0,0,0,0,0,0,0,0,208,51,0,0,0,0,0,0,0,0,0,0,32,51,0,0,0,0,0,0,0,0,0,0,112,50,0,0,0,0,0,0,0,0,0,0,192,49,0,0,0,0,0,0,0,0,0,0,16,49,0,0,0,0,0,0,88,0,0,0,5,0,0,0,64,55,0,0,144,54,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,55,0,0,0,0,0,0,0,0,0,0,64,55,0,0,0,0,0,0,0,0,0,0,144,54,0,0,0,0,0,0,0,0,0,0,144,54,0,0,0,0,0,0,0,0,0,0,64,55,0,0,0,0,0,0,0,0,0,0,64,55,0,0,0,0,0,0,0,0,0,0,144,54,0,0,0,0,0,0,0,0,0,0,144,54,0,0,0,0,0,0,96,0,0,0,4,0,0,0,0,58,0,0,80,57,0,0,160,56,0,0,240,55,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,58,0,0,0,0,0,0,0,0,0,0,80,57,0,0,0,0,0,0,0,0,0,0,160,56,0,0,0,0,0,0,0,0,0,0,240,55,0,0,0,0,0,0,255,255,255,255,0,58,0,0,0,0,0,0,255,255,255,255,80,57,0,0,1,0,0,0,0,0,0,0,160,56,0,0,255,255,255,255,0,0,0,0,240,55,0,0,0,0,0,0,104,0,0,0,4,0,0,0,176,58,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,58,0,0,255,255,255,255,0,0,0,0,176,58,0,0,255,255,255,255,0,0,0,0,176,58,0,0,0,0,0,0,0,0,0,0,176,58,0,0,255,255,255,255,255,255,255,255,176,58,0,0,0,0,0,0,255,255,255,255,176,58,0,0,0,0,0,0,255,255,255,255,176,58,0,0,255,255,255,255,255,255,255,255,176,58,0,0,0,0,0,0,112,0,0,0,4,0,0,0,112,61,0,0,192,60,0,0,16,60,0,0,96,59,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,61,0,0,0,0,0,0,0,0,0,0,192,60,0,0,0,0,0,0,0,0,0,0,16,60,0,0,0,0,0,0,0,0,0,0,16,60,0,0,0,0,0,0,0,0,0,0,192,60,0,0,0,0,0,0,0,0,0,0,112,61,0,0,0,0,0,0,0,0,0,0,96,59,0,0,0,0,0,0,0,0,0,0,96,59,0,0,0,0,0,0,120,0,0,0,4,0,0,0,240,66,0,0,64,66,0,0,144,65,0,0,224,64,0,0,48,64,0,0,128,63,0,0,208,62,0,0,32,62,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,66,0,0,0,0,0,0,0,0,0,0,64,66,0,0,0,0,0,0,0,0,0,0,144,65,0,0,0,0,0,0,0,0,0,0,224,64,0,0,0,0,0,0,0,0,0,0,48,64,0,0,0,0,0,0,0,0,0,0,128,63,0,0,0,0,0,0,0,0,0,0,208,62,0,0,0,0,0,0,0,0,0,0,32,62,0,0,0,0,0,0,128,0,0,0,4,0,0,0,80,68,0,0,160,67,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,68,0,0,0,0,0,0,0,0,0,0,80,68,0,0,0,0,0,0,0,0,0,0,160,67,0,0,1,0,0,0,0,0,0,0,160,67,0,0,0,0,0,0,255,255,255,255,80,68,0,0,0,0,0,0,255,255,255,255,80,68,0,0,1,0,0,0,0,0,0,0,160,67,0,0,0,0,0,0,0,0,0,0,160,67,0,0,0,0,0,0,136,0,0,0,3,0,0,0,16,71,0,0,96,70,0,0,176,69,0,0,0,69,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,71,0,0,0,0,0,0,0,0,0,0,96,70,0,0,0,0,0,0,0,0,0,0,176,69,0,0,0,0,0,0,0,0,0,0,0,69,0,0,0,0,0,0,0,0,0,0,0,69,0,0,0,0,0,0,0,0,0,0,176,69,0,0,0,0,0,0,0,0,0,0,96,70,0,0,0,0,0,0,0,0,0,0,16,71,0,0,0,0,0,0,144,0,0,0,3,0,0,0,112,72,0,0,192,71,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,72,0,0,0,0,0,0,0,0,0,0,112,72,0,0,0,0,0,0,0,0,0,0,192,71,0,0,0,0,0,0,0,0,0,0,192,71,0,0,0,0,0,0,0,0,0,0,112,72,0,0,0,0,0,0,0,0,0,0,112,72,0,0,0,0,0,0,0,0,0,0,192,71,0,0,0,0,0,0,0,0,0,0,192,71,0,0,0,0,0,0,152,0,0,0,2,0,0,0,208,73,0,0,32,73,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,73,0,0,0,0,0,0,0,0,0,0,208,73,0,0,0,0,0,0,0,0,0,0,32,73,0,0,1,0,0,0,0,0,0,0,32,73,0,0,0,0,0,0,255,255,255,255,208,73,0,0,0,0,0,0,255,255,255,255,208,73,0,0,1,0,0,0,0,0,0,0,32,73,0,0,0,0,0,0,0,0,0,0,32,73,0,0,0,0,0,0,160,0,0,0,1,0,0,0,128,74,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,74,0,0,0,0,0,0,0,0,0,0,128,74,0,0,0,0,0,0,0,0,0,0,128,74,0,0,0,0,0,0,0,0,0,0,128,74,0,0,0,0,0,0,0,0,0,0,128,74,0,0,0,0,0,0,0,0,0,0,128,74,0,0,0,0,0,0,0,0,0,0,128,74,0,0,0,0,0,0,0,0,0,0,128,74,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,114,251,229,147,21,67,237,63,203,101,163,115,126,10,20,64,84,57,237,41,57,71,4,64,2,0,0,0,0,0,0,0,15,67,171,147,51,20,239,63,237,100,112,148,188,58,252,191,232,250,62,28,36,132,245,63,1,0,0,0,0,0,0,0,26,163,117,84,53,193,232,63,117,61,209,117,225,39,0,64,191,41,172,84,80,17,252,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,72,106,161,100,114,234,228,63,168,55,163,230,171,236,40,64,206,141,233,9,75,28,14,64,2,0,0,0,0,0,0,0,101,253,102,98,186,16,230,63,71,229,38,106,105,110,2,192,115,157,70,90,42,143,1,64,1,0,0,0,0,0,0,0,104,207,101,106,18,60,227,63,24,63,141,123,243,107,37,64,73,187,209,199,124,192,5,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,247,231,162,33,227,209,225,63,107,14,16,204,209,3,0,64,64,80,110,219,247,200,11,64,2,0,0,0,0,0,0,0,148,133,175,175,117,41,229,63,120,211,45,59,196,159,38,192,150,123,129,89,161,72,4,64,1,0,0,0,0,0,0,0,106,50,227,109,165,215,217,63,56,130,84,138,29,141,244,63,114,225,64,72,22,208,13,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,123,76,164,52,155,199,222,63,249,244,216,150,1,215,49,64,112,66,33,2,14,193,15,64,2,0,0,0,0,0,0,0,34,252,139,160,49,19,227,63,54,117,30,21,255,119,12,192,170,154,32,234,62,0,9,64,1,0,0,0,0,0,0,0,117,0,196,93,189,138,216,63,129,62,145,39,73,103,48,64,76,194,133,60,130,123,15,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,180,176,167,29,254,154,218,63,158,209,86,37,145,221,17,64,96,117,228,72,103,160,15,64,2,0,0,0,0,0,0,0,203,44,66,177,21,52,223,63,18,217,7,89,22,124,46,192,98,45,62,5,192,88,13,64,1,0,0,0,0,0,0,0,82,212,153,123,72,248,211,63,103,39,131,163,228,181,0,64,255,117,110,218,140,163,18,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,112,152,104,144,130,167,221,63,49,154,149,237,67,126,47,64,172,198,18,214,198,200,16,64,2,0,0,0,0,0,0,0,176,118,20,231,168,35,228,63,65,156,135,19,152,14,242,191,8,228,18,71,30,104,12,64,1,0,0,0,0,0,0,0,229,126,135,162,64,159,213,63,101,84,25,198,221,112,46,64,211,218,52,182,215,130,19,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,171,234,229,119,154,204,225,63,87,181,164,163,28,204,234,63,113,113,84,110,162,6,16,64,2,0,0,0,0,0,0,0,31,189,225,62,114,235,227,63,148,78,36,152,106,22,34,192,148,194,188,199,153,230,12,64,1,0,0,0,0,0,0,0,55,255,175,58,114,164,218,63,4,175,150,59,51,65,226,63,31,76,138,143,79,120,19,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,189,56,241,213,142,98,224,63,22,221,122,77,15,58,39,64,139,250,36,119,216,228,18,64,2,0,0,0,0,0,0,0,147,82,208,237,37,13,228,63,216,74,232,46,137,179,3,192,182,244,104,170,39,19,14,64,1,0,0,0,0,0,0,0,120,153,97,163,172,223,211,63,137,209,115,11,93,9,44,64,116,65,125,203,156,254,20,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,62,66,205,144,42,138,225,63,91,91,120,94,42,54,250,63,52,17,54,60,189,114,17,64,2,0,0,0,0,0,0,0,130,254,66,143,24,61,229,63,90,128,182,213,172,19,25,192,238,120,147,223,162,115,14,64,1,0,0,0,0,0,0,0,99,181,249,127,213,145,220,63,154,65,124,96,199,127,227,63,111,159,85,102,74,43,21,64,2,0,0,0,0,0,0,0,51,49,93,136,213,159,228,63,232,18,14,189,197,35,3,192,120,125,230,172,79,137,17,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,249,192,142,255,2,193,227,63,194,223,47,102,75,102,24,64,107,72,220,99,233,3,17,64,2,0,0,0,0,0,0,0,155,146,172,195,209,213,229,63,60,19,154,36,150,20,252,191,40,71,1,162,96,134,17,64,1,0,0,0,0,0,0,0,0,55,139,23,11,195,224,63,61,243,114,216,125,7,12,64,250,38,77,131,162,121,18,64,2,0,0,0,0,0,0,0,219,251,84,21,26,8,227,63,36,127,48,240,220,251,238,191,106,106,217,90,95,20,20,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,103,101,251,144,183,220,226,63,105,228,243,138,167,30,215,63,175,119,127,188,87,173,17,64,2,0,0,0,0,0,0,0,205,147,107,10,100,246,229,63,131,51,248,251,197,204,11,192,18,78,11,94,244,213,11,64,1,0,0,0,0,0,0,0,254,157,237,209,27,238,221,63,247,205,253,213,227,126,240,191,112,181,78,92,142,119,20,64,2,0,0,0,0,0,0,0,43,250,67,51,79,174,228,63,31,185,53,233,182,4,253,191,65,126,54,114,221,196,17,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,155,88,224,43,186,117,228,63,234,233,35,240,135,95,12,64,48,215,162,5,104,123,16,64,2,0,0,0,0,0,0,0,53,237,98,154,233,94,233,63,169,189,136,182,99,234,166,191,167,59,79,60,103,43,13,64,1,0,0,0,0,0,0,0,81,187,95,5,248,238,225,63,46,59,196,63,108,169,251,63,249,133,87,146,60,55,21,64,2,0,0,0,0,0,0,0,233,67,23,212,183,204,231,63,253,218,250,233,63,107,225,63,214,30,246,66,1,235,18,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,139,250,36,119,216,68,231,63,178,128,9,220,186,27,234,191,16,92,229,9,132,125,17,64,2,0,0,0,0,0,0,0,138,114,105,252,194,171,234,63,47,223,250,176,222,168,220,191,11,182,17,79,118,147,13,64,1,0,0,0,0,0,0,0,221,236,15,148,219,246,226,63,125,179,205,141,233,169,1,192,16,119,245,42,50,74,21,64,2,0,0,0,0,0,0,0,147,55,192,204,119,240,232,63,74,9,193,170,122,249,195,191,53,98,102,159,199,136,18,64,3,0,0,0,0,0,0,0,76,55,137,65,96,229,236,63,240,135,159,255,30,252,3,192,244,82,177,49,175,3,11,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,7,179,9,48,44,127,229,63,90,17,53,209,231,99,4,64,190,160,133,4,140,174,17,64,2,0,0,0,0,0,0,0,80,81,245,43,157,143,235,63,132,241,211,184,55,191,232,63,19,153,185,192,229,49,11,64,1,0,0,0,0,0,0,0,5,225,10,40,212,83,226,63,68,192,33,84,169,57,4,64,207,247,83,227,165,171,20,64,2,0,0,0,0,0,0,0,195,240,17,49,37,18,234,63,37,205,31,211,218,244,244,63,208,71,25,113,1,104,15,64,3,0,0,0,0,0,0,0,149,187,207,241,209,226,236,63,222,3,116,95,206,172,250,191,107,127,103,123,244,102,10,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,28,122,139,135,247,28,233,63,22,79,61,210,224,246,245,191,21,112,207,243,167,253,16,64,2,0,0,0,0,0,0,0,192,233,93,188,31,55,236,63,42,202,165,241,11,175,227,191,59,114,164,51,48,210,7,64,1,0,0,0,0,0,0,0,199,15,149,70,204,236,230,63,54,147,111,182,185,209,2,192,37,93,51,249,102,155,18,64,2,0,0,0,0,0,0,0,16,65,213,232,213,0,235,63,132,18,102,218,254,149,215,191,161,106,244,106,128,18,12,64,3,0,0,0,0,0,0,0,133,210,23,66,206,251,236,63,113,175,204,91,117,221,253,191,196,120,205,171,58,235,13,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,236,250,5,187,97,219,231,63,171,118,77,72,107,12,254,63,85,48,42,169,19,240,14,64,2,0,0,0,0,0,0,0,110,138,199,69,181,8,237,63,238,122,105,138,0,167,211,63,73,75,229,237,8,135,5,64,1,0,0,0,0,0,0,0,21,54,3,92,144,173,229,63,42,139,194,46,138,94,247,63,82,127,189,194,130,203,17,64,2,0,0,0,0,0,0,0,214,199,67,223,221,202,236,63,106,104,3,176,1,17,227,63,111,244,49,31,16,232,13,64,3,0,0,0,0,0,0,0,74,64,76,194,133,188,237,63,105,196,204,62,143,17,0,192,225,149,36,207,245,29,17,64,4,0,0,0,0,0,0,0,9,221,37,113,86,132,240,63,42,170,126,165,243,33,248,63,30,79,203,15,92,69,17,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,207,192,200,203,154,88,236,63,222,146,28,176,171,73,238,191,247,229,204,118,133,94,7,64,2,0,0,0,0,0,0,0,49,91,178,42,194,205,237,63,233,183,175,3,231,140,206,63,75,174,98,241,155,194,4,64,1,0,0,0,0,0,0,0,121,149,181,77,241,56,236,63,155,88,224,43,186,245,254,191,89,25,141,124,94,1,16,64,2,0,0,0,0,0,0,0,84,29,114,51,220,128,237,63,152,162,92,26,191,48,241,63,167,60,186,17,22,101,18,64,3,0,0,0,0,0,0,0,172,197,167,0,24,207,239,63,141,125,201,198,131,205,3,192,138,59,222,228,183,200,18,64,4,0,0,0,0,0,0,0,98,216,97,76,250,187,240,63,66,238,34,76,81,110,7,64,210,56,212,239,194,182,19,64,3,0,0,0,0,0,0,0,242,124,6,212,155,145,240,63,118,253,130,221,176,141,8,192,187,39,15,11,181,22,26,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,49,97,52,43,219,7,235,63,57,156,249,213,28,160,227,63,225,183,33,198,107,94,10,64,2,0,0,0,0,0,0,0,187,184,141,6,240,150,237,63,124,238,4,251,175,115,213,63,225,12,254,126,49,219,8,64,1,0,0,0,0,0,0,0,245,216,150,1,103,169,234,63,35,47,107,98,129,47,237,191,236,80,77,73,214,49,19,64,2,0,0,0,0,0,0,0,182,45,202,108,144,201,237,63,153,155,111,68,247,172,244,63,135,52,42,112,178,125,19,64,3,0,0,0,0,0,0,0,41,233,97,104,117,242,239,63,80,200,206,219,216,76,12,192,188,175,202,133,202,111,19,64,4,0,0,0,0,0,0,0,135,78,207,187,177,160,241,63,81,249,215,242,202,181,243,63,15,153,242,33,168,26,19,64,3,0,0,0,0,0,0,0,2,69,44,98,216,161,240,63,191,101,78,151,197,84,20,192,70,149,97,220,13,146,26,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,30,137,151,167,115,69,237,63,39,23,99,96,29,199,237,191,205,228,155,109,110,140,11,64,2,0,0,0,0,0,0,0,39,188,4,167,62,144,237,63,11,11,238,7,60,48,192,191,209,233,121,55,22,180,14,64,1,0,0,0,0,0,0,0,143,29,84,226,58,70,234,63,123,215,160,47,189,221,0,192,96,177,134,139,220,163,21,64,2,0,0,0,0,0,0,0,109,173,47,18,218,114,236,63,189,252,78,147,25,111,234,63,104,3,176,1,17,82,21,64,3,0,0,0,0,0,0,0,4,115,244,248,189,77,240,63,235,197,80,78,180,107,2,192,231,110,215,75,83,132,20,64,4,0,0,0,0,0,0,0,199,187,35,99,181,57,241,63,124,66,118,222,198,166,7,64,69,240,191,149,236,88,20,64,3,0,0,0,0,0,0,0,120,94,42,54,230,245,241,63,195,159,225,205,26,252,11,192,142,7,91,236,246,233,28,64,4,0,0,0,0,0,0,0,166,70,232,103,234,181,243,63,176,85,130,197,225,28,25,64,93,52,100,60,74,229,28,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,164,54,113,114,191,67,234,63,77,243,142,83,116,36,235,63,184,33,198,107,94,5,18,64,2,0,0,0,0,0,0,0,68,191,182,126,250,207,238,63,142,59,165,131,245,255,231,63,178,156,132,210,23,66,13,64,1,0,0,0,0,0,0,0,148,105,52,185,24,131,232,63,137,155,83,201,0,80,209,191,42,115,243,141,232,30,24,64,2,0,0,0,0,0,0,0,83,118,250,65,93,100,240,63,178,160,48,40,211,104,244,63,216,72,18,132,43,0,22,64,3,0,0,0,0,0,0,0,138,144,186,157,125,101,240,63,110,162,150,230,86,8,13,192,143,196,203,211,185,66,21,64,4,0,0,0,0,0,0,0,64,109,84,167,3,89,243,63,219,251,84,21,26,8,236,63,190,164,49,90,71,213,19,64,3,0,0,0,0,0,0,0,215,220,209,255,114,109,242,63,106,18,188,33,141,202,27,192,23,97,138,114,105,60,30,64,4,0,0,0,0,0,0,0,120,241,126,220,126,249,245,63,213,178,181,190,72,40,243,63,125,8,170,70,175,166,28,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,22,164,25,139,166,179,238,63,168,27,40,240,78,254,250,191,23,185,167,171,59,22,15,64,2,0,0,0,0,0,0,0,34,108,120,122,165,172,238,63,237,17,106,134,84,17,241,63,61,39,189,111,124,205,12,64,1,0,0,0,0,0,0,0,82,185,137,90,154,219,238,63,251,178,180,83,115,185,6,192,76,113,85,217,119,37,22,64,2,0,0,0,0,0,0,0,88,168,53,205,59,206,239,63,70,39,75,173,247,59,3,64,90,183,65,237,183,246,22,64,3,0,0,0,0,0,0,0,61,187,124,235,195,58,242,63,199,218,223,217,30,189,1,192,103,215,189,21,137,105,21,64,4,0,0,0,0,0,0,0,102,134,141,178,126,243,243,63,128,184,171,87,145,129,17,64,139,135,247,28,88,190,21,64,3,0,0,0,0,0,0,0,225,13,105,84,224,164,244,63,225,125,85,46,84,94,11,192,231,167,56,14,188,106,30,64,4,0,0,0,0,0,0,0,153,213,59,220,14,13,247,63,50,115,129,203,99,93,30,64,140,215,188,170,179,138,29,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,227,81,42,225,9,61,237,63,190,246,204,146,0,181,244,191,1,165,161,70,33,57,16,64,2,0,0,0,0,0,0,0,227,84,107,97,22,154,240,63,191,152,45,89,21,97,226,63,218,57,205,2,237,142,10,64,1,0,0,0,0,0,0,0,97,165,130,138,170,95,238,63,187,42,80,139,193,227,8,192,119,21,82,126,82,61,24,64,2,0,0,0,0,0,0,0,183,211,214,136,96,28,242,63,5,136,130,25,83,112,245,63,168,227,49,3,149,97,22,64,3,0,0,0,0,0,0,0,118,110,218,140,211,208,243,63,58,234,232,184,26,121,21,192,169,193,52,12,31,81,21,64,4,0,0,0,0,0,0,0,179,8,197,86,208,116,244,63,255,150,0,252,83,234,241,63,238,93,131,190,244,22,23,64,3,0,0,0,0,0,0,0,214,59,220,14,13,203,246,63,121,118,249,214,135,253,33,192,72,106,161,100,114,42,30,64,4,0,0,0,0,0,0,0,5,52,17,54,60,125,247,63,160,198,189,249,13,83,246,63,189,83,1,247,60,95,30,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,88,197,27,153,71,190,240,63,9,254,183,146,29,91,242,191,202,249,98,239,197,55,11,64,2,0,0,0,0,0,0,0,225,66,30,193,141,20,241,63,172,88,252,166,176,18,248,63,205,233,178,152,216,156,10,64,1,0,0,0,0,0,0,0,113,147,81,101,24,119,241,63,150,235,109,51,21,2,6,192,40,185,195,38,50,83,23,64,2,0,0,0,0,0,0,0,245,247,82,120,208,236,242,63,123,75,57,95,236,253,11,64,225,41,228,74,61,139,23,64,3,0,0,0,0,0,0,0,104,234,117,139,192,88,243,63,235,172,22,216,99,34,3,192,204,11,176,143,78,13,25,64,4,0,0,0,0,0,0,0,244,79,112,177,162,70,245,63,97,23,69,15,124,28,21,64,87,147,167,172,166,251,21,64,3,0,0,0,0,0,0,0,9,53,67,170,40,30,246,63,153,42,24,149,212,233,7,192,178,128,9,220,186,83,32,64,4,0,0,0,0,0,0,0,95,153,183,234,58,212,247,63,30,194,248,105,220,75,32,64,84,116,36,151,255,80,28,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,99,43,104,90,98,37,240,63,243,141,232,158,117,205,252,191,129,208,122,248,50,241,12,64,2,0,0,0,0,0,0,0,181,55,248,194,100,106,241,63,40,68,192,33,84,41,226,63,177,22,159,2,96,12,17,64,1,0,0,0,0,0,0,0,253,189,20,30,52,187,241,63,75,89,134,56,214,53,18,192,65,73,129,5,48,213,25,64,2,0,0,0,0,0,0,0,45,92,86,97,51,64,243,63,54,177,192,87,116,43,242,63,237,17,106,134,84,225,27,64,3,0,0,0,0,0,0,0,65,242,206,161,12,21,245,63,31,159,144,157,183,65,26,192,50,56,74,94,157,99,24,64,4,0,0,0,0,0,0,0,235,225,203,68,17,82,245,63,216,126,50,198,135,217,210,63,69,101,195,154,202,194,20,64,3,0,0,0,0,0,0,0,157,74,6,128,42,110,247,63,15,214,255,57,204,95,35,192,133,150,117,255,88,184,31,64,4,0,0,0,0,0,0,0,192,7,175,93,218,240,246,63,240,221,230,141,147,194,140,191,12,118,195,182,69,73,24,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
, "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
function runPostSets() {
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(8))>>2)]=(12);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(12))>>2)]=(26);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(16))>>2)]=(20);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(20))>>2)]=(28);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(24))>>2)]=(2);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(28))>>2)]=(2);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(32))>>2)]=(2);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(36))>>2)]=(4);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(8))>>2)]=(12);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(12))>>2)]=(8);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(16))>>2)]=(20);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(20))>>2)]=(28);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(24))>>2)]=(2);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(28))>>2)]=(4);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(32))>>2)]=(4);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(36))>>2)]=(2);
HEAP32[((3056)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((3064)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((3072)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((3088)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((3104)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((3120)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((3136)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((3152)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((3168)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((3176)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((3192)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((3200)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
}
if (!awaitingMemoryInitializer) runPostSets();
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  function ___assert_func(filename, line, func, condition) {
      throw 'Assertion failed: ' + (condition ? Pointer_stringify(condition) : 'unknown condition') + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + new Error().stack;
    }
  function _clock() {
      if (_clock.start === undefined) _clock.start = Date.now();
      return Math.floor((Date.now() - _clock.start) * (1000/1000));
    }
  function ___gxx_personality_v0() {
    }
  function _llvm_umul_with_overflow_i32(x, y) {
      x = x>>>0;
      y = y>>>0;
      return ((asm["setTempRet0"](x*y > 4294967295),(x*y)>>>0)|0);
    }
  function _llvm_uadd_with_overflow_i32(x, y) {
      x = x>>>0;
      y = y>>>0;
      return ((asm["setTempRet0"](x+y > 4294967295),(x+y)>>>0)|0);
    }
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:35,EIDRM:36,ECHRNG:37,EL2NSYNC:38,EL3HLT:39,EL3RST:40,ELNRNG:41,EUNATCH:42,ENOCSI:43,EL2HLT:44,EDEADLK:45,ENOLCK:46,EBADE:50,EBADR:51,EXFULL:52,ENOANO:53,EBADRQC:54,EBADSLT:55,EDEADLOCK:56,EBFONT:57,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:74,ELBIN:75,EDOTDOT:76,EBADMSG:77,EFTYPE:79,ENOTUNIQ:80,EBADFD:81,EREMCHG:82,ELIBACC:83,ELIBBAD:84,ELIBSCN:85,ELIBMAX:86,ELIBEXEC:87,ENOSYS:88,ENMFILE:89,ENOTEMPTY:90,ENAMETOOLONG:91,ELOOP:92,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:106,EPROTOTYPE:107,ENOTSOCK:108,ENOPROTOOPT:109,ESHUTDOWN:110,ECONNREFUSED:111,EADDRINUSE:112,ECONNABORTED:113,ENETUNREACH:114,ENETDOWN:115,ETIMEDOUT:116,EHOSTDOWN:117,EHOSTUNREACH:118,EINPROGRESS:119,EALREADY:120,EDESTADDRREQ:121,EMSGSIZE:122,EPROTONOSUPPORT:123,ESOCKTNOSUPPORT:124,EADDRNOTAVAIL:125,ENETRESET:126,EISCONN:127,ENOTCONN:128,ETOOMANYREFS:129,EPROCLIM:130,EUSERS:131,EDQUOT:132,ESTALE:133,ENOTSUP:134,ENOMEDIUM:135,ENOSHARE:136,ECASECLASH:137,EILSEQ:138,EOVERFLOW:139,ECANCELED:140,ENOTRECOVERABLE:141,EOWNERDEAD:142,ESTRPIPE:143};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  var __impure_ptr=allocate(1, "i32*", ALLOC_STATIC);var FS={currentPath:"/",nextInode:2,streams:[null],ignorePermissions:true,createFileHandle:function (stream, fd) {
        if (typeof stream === 'undefined') {
          stream = null;
        }
        if (!fd) {
          if (stream && stream.socket) {
            for (var i = 1; i < 64; i++) {
              if (!FS.streams[i]) {
                fd = i;
                break;
              }
            }
            assert(fd, 'ran out of low fds for sockets');
          } else {
            fd = Math.max(FS.streams.length, 64);
            for (var i = FS.streams.length; i < fd; i++) {
              FS.streams[i] = null; // Keep dense
            }
          }
        }
        // Close WebSocket first if we are about to replace the fd (i.e. dup2)
        if (FS.streams[fd] && FS.streams[fd].socket && FS.streams[fd].socket.close) {
          FS.streams[fd].socket.close();
        }
        FS.streams[fd] = stream;
        return fd;
      },removeFileHandle:function (fd) {
        FS.streams[fd] = null;
      },joinPath:function (parts, forceRelative) {
        var ret = parts[0];
        for (var i = 1; i < parts.length; i++) {
          if (ret[ret.length-1] != '/') ret += '/';
          ret += parts[i];
        }
        if (forceRelative && ret[0] == '/') ret = ret.substr(1);
        return ret;
      },absolutePath:function (relative, base) {
        if (typeof relative !== 'string') return null;
        if (base === undefined) base = FS.currentPath;
        if (relative && relative[0] == '/') base = '';
        var full = base + '/' + relative;
        var parts = full.split('/').reverse();
        var absolute = [''];
        while (parts.length) {
          var part = parts.pop();
          if (part == '' || part == '.') {
            // Nothing.
          } else if (part == '..') {
            if (absolute.length > 1) absolute.pop();
          } else {
            absolute.push(part);
          }
        }
        return absolute.length == 1 ? '/' : absolute.join('/');
      },analyzePath:function (path, dontResolveLastLink, linksVisited) {
        var ret = {
          isRoot: false,
          exists: false,
          error: 0,
          name: null,
          path: null,
          object: null,
          parentExists: false,
          parentPath: null,
          parentObject: null
        };
        path = FS.absolutePath(path);
        if (path == '/') {
          ret.isRoot = true;
          ret.exists = ret.parentExists = true;
          ret.name = '/';
          ret.path = ret.parentPath = '/';
          ret.object = ret.parentObject = FS.root;
        } else if (path !== null) {
          linksVisited = linksVisited || 0;
          path = path.slice(1).split('/');
          var current = FS.root;
          var traversed = [''];
          while (path.length) {
            if (path.length == 1 && current.isFolder) {
              ret.parentExists = true;
              ret.parentPath = traversed.length == 1 ? '/' : traversed.join('/');
              ret.parentObject = current;
              ret.name = path[0];
            }
            var target = path.shift();
            if (!current.isFolder) {
              ret.error = ERRNO_CODES.ENOTDIR;
              break;
            } else if (!current.read) {
              ret.error = ERRNO_CODES.EACCES;
              break;
            } else if (!current.contents.hasOwnProperty(target)) {
              ret.error = ERRNO_CODES.ENOENT;
              break;
            }
            current = current.contents[target];
            if (current.link && !(dontResolveLastLink && path.length == 0)) {
              if (linksVisited > 40) { // Usual Linux SYMLOOP_MAX.
                ret.error = ERRNO_CODES.ELOOP;
                break;
              }
              var link = FS.absolutePath(current.link, traversed.join('/'));
              ret = FS.analyzePath([link].concat(path).join('/'),
                                   dontResolveLastLink, linksVisited + 1);
              return ret;
            }
            traversed.push(target);
            if (path.length == 0) {
              ret.exists = true;
              ret.path = traversed.join('/');
              ret.object = current;
            }
          }
        }
        return ret;
      },findObject:function (path, dontResolveLastLink) {
        FS.ensureRoot();
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },createObject:function (parent, name, properties, canRead, canWrite) {
        if (!parent) parent = '/';
        if (typeof parent === 'string') parent = FS.findObject(parent);
        if (!parent) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent path must exist.');
        }
        if (!parent.isFolder) {
          ___setErrNo(ERRNO_CODES.ENOTDIR);
          throw new Error('Parent must be a folder.');
        }
        if (!parent.write && !FS.ignorePermissions) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent folder must be writeable.');
        }
        if (!name || name == '.' || name == '..') {
          ___setErrNo(ERRNO_CODES.ENOENT);
          throw new Error('Name must not be empty.');
        }
        if (parent.contents.hasOwnProperty(name)) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          throw new Error("Can't overwrite object.");
        }
        parent.contents[name] = {
          read: canRead === undefined ? true : canRead,
          write: canWrite === undefined ? false : canWrite,
          timestamp: Date.now(),
          inodeNumber: FS.nextInode++
        };
        for (var key in properties) {
          if (properties.hasOwnProperty(key)) {
            parent.contents[name][key] = properties[key];
          }
        }
        return parent.contents[name];
      },createFolder:function (parent, name, canRead, canWrite) {
        var properties = {isFolder: true, isDevice: false, contents: {}};
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createPath:function (parent, path, canRead, canWrite) {
        var current = FS.findObject(parent);
        if (current === null) throw new Error('Invalid parent.');
        path = path.split('/').reverse();
        while (path.length) {
          var part = path.pop();
          if (!part) continue;
          if (!current.contents.hasOwnProperty(part)) {
            FS.createFolder(current, part, canRead, canWrite);
          }
          current = current.contents[part];
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        properties.isFolder = false;
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createDataFile:function (parent, name, data, canRead, canWrite) {
        if (typeof data === 'string') {
          var dataArray = new Array(data.length);
          for (var i = 0, len = data.length; i < len; ++i) dataArray[i] = data.charCodeAt(i);
          data = dataArray;
        }
        var properties = {
          isDevice: false,
          contents: data.subarray ? data.subarray(0) : data // as an optimization, create a new array wrapper (not buffer) here, to help JS engines understand this object
        };
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          var LazyUint8Array = function() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
              if (!hasByteServing) chunkSize = datalength;
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile) {
        Browser.init();
        var fullname = FS.joinPath([parent, name], true);
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },createLink:function (parent, name, target, canRead, canWrite) {
        var properties = {isDevice: false, link: target};
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createDevice:function (parent, name, input, output) {
        if (!(input || output)) {
          throw new Error('A device must have at least one callback defined.');
        }
        var ops = {isDevice: true, input: input, output: output};
        return FS.createFile(parent, name, ops, Boolean(input), Boolean(output));
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },ensureRoot:function () {
        if (FS.root) return;
        // The main file system tree. All the contents are inside this.
        FS.root = {
          read: true,
          write: true,
          isFolder: true,
          isDevice: false,
          timestamp: Date.now(),
          inodeNumber: 1,
          contents: {}
        };
      },init:function (input, output, error) {
        // Make sure we initialize only once.
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        FS.ensureRoot();
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        input = input || Module['stdin'];
        output = output || Module['stdout'];
        error = error || Module['stderr'];
        // Default handlers.
        var stdinOverridden = true, stdoutOverridden = true, stderrOverridden = true;
        if (!input) {
          stdinOverridden = false;
          input = function() {
            if (!input.cache || !input.cache.length) {
              var result;
              if (typeof window != 'undefined' &&
                  typeof window.prompt == 'function') {
                // Browser.
                result = window.prompt('Input: ');
                if (result === null) result = String.fromCharCode(0); // cancel ==> EOF
              } else if (typeof readline == 'function') {
                // Command line.
                result = readline();
              }
              if (!result) result = '';
              input.cache = intArrayFromString(result + '\n', true);
            }
            return input.cache.shift();
          };
        }
        var utf8 = new Runtime.UTF8Processor();
        function simpleOutput(val) {
          if (val === null || val === 10) {
            output.printer(output.buffer.join(''));
            output.buffer = [];
          } else {
            output.buffer.push(utf8.processCChar(val));
          }
        }
        if (!output) {
          stdoutOverridden = false;
          output = simpleOutput;
        }
        if (!output.printer) output.printer = Module['print'];
        if (!output.buffer) output.buffer = [];
        if (!error) {
          stderrOverridden = false;
          error = simpleOutput;
        }
        if (!error.printer) error.printer = Module['print'];
        if (!error.buffer) error.buffer = [];
        // Create the temporary folder, if not already created
        try {
          FS.createFolder('/', 'tmp', true, true);
        } catch(e) {}
        // Create the I/O devices.
        var devFolder = FS.createFolder('/', 'dev', true, true);
        var stdin = FS.createDevice(devFolder, 'stdin', input);
        var stdout = FS.createDevice(devFolder, 'stdout', null, output);
        var stderr = FS.createDevice(devFolder, 'stderr', null, error);
        FS.createDevice(devFolder, 'tty', input, output);
        FS.createDevice(devFolder, 'null', function(){}, function(){});
        // Create default streams.
        FS.streams[1] = {
          path: '/dev/stdin',
          object: stdin,
          position: 0,
          isRead: true,
          isWrite: false,
          isAppend: false,
          isTerminal: !stdinOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[2] = {
          path: '/dev/stdout',
          object: stdout,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stdoutOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[3] = {
          path: '/dev/stderr',
          object: stderr,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stderrOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        // TODO: put these low in memory like we used to assert on: assert(Math.max(_stdin, _stdout, _stderr) < 15000); // make sure these are low, we flatten arrays with these
        HEAP32[((_stdin)>>2)]=1;
        HEAP32[((_stdout)>>2)]=2;
        HEAP32[((_stderr)>>2)]=3;
        // Other system paths
        FS.createPath('/', 'dev/shm/tmp', true, true); // temp files
        // Newlib initialization
        for (var i = FS.streams.length; i < Math.max(_stdin, _stdout, _stderr) + 4; i++) {
          FS.streams[i] = null; // Make sure to keep FS.streams dense
        }
        FS.streams[_stdin] = FS.streams[1];
        FS.streams[_stdout] = FS.streams[2];
        FS.streams[_stderr] = FS.streams[3];
        allocate([ allocate(
          [0, 0, 0, 0, _stdin, 0, 0, 0, _stdout, 0, 0, 0, _stderr, 0, 0, 0],
          'void*', ALLOC_NORMAL) ], 'void*', ALLOC_NONE, __impure_ptr);
      },quit:function () {
        if (!FS.init.initialized) return;
        // Flush any partially-printed lines in stdout and stderr. Careful, they may have been closed
        if (FS.streams[2] && FS.streams[2].object.output.buffer.length > 0) FS.streams[2].object.output(10);
        if (FS.streams[3] && FS.streams[3].object.output.buffer.length > 0) FS.streams[3].object.output(10);
      },standardizePath:function (path) {
        if (path.substr(0, 2) == './') path = path.substr(2);
        return path;
      },deleteFile:function (path) {
        path = FS.analyzePath(path);
        if (!path.parentExists || !path.exists) {
          throw 'Invalid path ' + path;
        }
        delete path.parentObject.contents[path.name];
      }};
  function _send(fd, buf, len, flags) {
      var info = FS.streams[fd];
      if (!info) return -1;
      info.sender(HEAPU8.subarray(buf, buf+len));
      return len;
    }
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var contents = stream.object.contents;
        while (contents.length < offset) contents.push(0);
        for (var i = 0; i < nbyte; i++) {
          contents[offset + i] = HEAPU8[(((buf)+(i))|0)];
        }
        stream.object.timestamp = Date.now();
        return i;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (stream && ('socket' in stream)) {
          return _send(fildes, buf, nbyte, 0);
      } else if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        if (stream.object.isDevice) {
          if (stream.object.output) {
            for (var i = 0; i < nbyte; i++) {
              try {
                stream.object.output(HEAP8[(((buf)+(i))|0)]);
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
            }
            stream.object.timestamp = Date.now();
            return i;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var bytesWritten = _pwrite(fildes, buf, nbyte, stream.position);
          if (bytesWritten != -1) stream.position += bytesWritten;
          return bytesWritten;
        }
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  Module["_strlen"] = _strlen;
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (flagAlwaysSigned) {
                if (currArg < 0) {
                  prefix = '-' + prefix;
                } else {
                  prefix = '+' + prefix;
                }
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (flagAlwaysSigned && currArg >= 0) {
                  argText = '+' + argText;
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }
  function ___cxa_allocate_exception(size) {
      return _malloc(size);
    }
  function _llvm_eh_exception() {
      return HEAP32[((_llvm_eh_exception.buf)>>2)];
    }
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }
  function ___cxa_is_number_type(type) {
      var isNumber = false;
      try { if (type == __ZTIi) isNumber = true } catch(e){}
      try { if (type == __ZTIj) isNumber = true } catch(e){}
      try { if (type == __ZTIl) isNumber = true } catch(e){}
      try { if (type == __ZTIm) isNumber = true } catch(e){}
      try { if (type == __ZTIx) isNumber = true } catch(e){}
      try { if (type == __ZTIy) isNumber = true } catch(e){}
      try { if (type == __ZTIf) isNumber = true } catch(e){}
      try { if (type == __ZTId) isNumber = true } catch(e){}
      try { if (type == __ZTIe) isNumber = true } catch(e){}
      try { if (type == __ZTIc) isNumber = true } catch(e){}
      try { if (type == __ZTIa) isNumber = true } catch(e){}
      try { if (type == __ZTIh) isNumber = true } catch(e){}
      try { if (type == __ZTIs) isNumber = true } catch(e){}
      try { if (type == __ZTIt) isNumber = true } catch(e){}
      return isNumber;
    }function ___cxa_does_inherit(definiteType, possibilityType, possibility) {
      if (possibility == 0) return false;
      if (possibilityType == 0 || possibilityType == definiteType)
        return true;
      var possibility_type_info;
      if (___cxa_is_number_type(possibilityType)) {
        possibility_type_info = possibilityType;
      } else {
        var possibility_type_infoAddr = HEAP32[((possibilityType)>>2)] - 8;
        possibility_type_info = HEAP32[((possibility_type_infoAddr)>>2)];
      }
      switch (possibility_type_info) {
      case 0: // possibility is a pointer
        // See if definite type is a pointer
        var definite_type_infoAddr = HEAP32[((definiteType)>>2)] - 8;
        var definite_type_info = HEAP32[((definite_type_infoAddr)>>2)];
        if (definite_type_info == 0) {
          // Also a pointer; compare base types of pointers
          var defPointerBaseAddr = definiteType+8;
          var defPointerBaseType = HEAP32[((defPointerBaseAddr)>>2)];
          var possPointerBaseAddr = possibilityType+8;
          var possPointerBaseType = HEAP32[((possPointerBaseAddr)>>2)];
          return ___cxa_does_inherit(defPointerBaseType, possPointerBaseType, possibility);
        } else
          return false; // one pointer and one non-pointer
      case 1: // class with no base class
        return false;
      case 2: // class with base class
        var parentTypeAddr = possibilityType + 8;
        var parentType = HEAP32[((parentTypeAddr)>>2)];
        return ___cxa_does_inherit(definiteType, parentType, possibility);
      default:
        return false; // some unencountered type
      }
    }
  function ___resumeException(ptr) {
      if (HEAP32[((_llvm_eh_exception.buf)>>2)] == 0) HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr;
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }function ___cxa_find_matching_catch(thrown, throwntype) {
      if (thrown == -1) thrown = HEAP32[((_llvm_eh_exception.buf)>>2)];
      if (throwntype == -1) throwntype = HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)];
      var typeArray = Array.prototype.slice.call(arguments, 2);
      // If throwntype is a pointer, this means a pointer has been
      // thrown. When a pointer is thrown, actually what's thrown
      // is a pointer to the pointer. We'll dereference it.
      if (throwntype != 0 && !___cxa_is_number_type(throwntype)) {
        var throwntypeInfoAddr= HEAP32[((throwntype)>>2)] - 8;
        var throwntypeInfo= HEAP32[((throwntypeInfoAddr)>>2)];
        if (throwntypeInfo == 0)
          thrown = HEAP32[((thrown)>>2)];
      }
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (___cxa_does_inherit(typeArray[i], throwntype, thrown))
          return ((asm["setTempRet0"](typeArray[i]),thrown)|0);
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return ((asm["setTempRet0"](throwntype),thrown)|0);
    }function ___cxa_throw(ptr, type, destructor) {
      if (!___cxa_throw.initialized) {
        try {
          HEAP32[((__ZTVN10__cxxabiv119__pointer_type_infoE)>>2)]=0; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv117__class_type_infoE)>>2)]=1; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv120__si_class_type_infoE)>>2)]=2; // Workaround for libcxxabi integration bug
        } catch(e){}
        ___cxa_throw.initialized = true;
      }
      HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr
      HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)]=type
      HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)]=destructor
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }
  function ___cxa_call_unexpected(exception) {
      Module.printErr('Unexpected exception thrown, this is not properly supported - aborting');
      ABORT = true;
      throw exception;
    }
  Module["_memcmp"] = _memcmp;
  var _ceil=Math.ceil;
  var _floor=Math.floor;
  function __isFloat(text) {
      return !!(/^[+-]?[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?$/.exec(text));
    }function __scanString(format, get, unget, varargs) {
      if (!__scanString.whiteSpace) {
        __scanString.whiteSpace = {};
        __scanString.whiteSpace[32] = 1;
        __scanString.whiteSpace[9] = 1;
        __scanString.whiteSpace[10] = 1;
        __scanString.whiteSpace[11] = 1;
        __scanString.whiteSpace[12] = 1;
        __scanString.whiteSpace[13] = 1;
        __scanString.whiteSpace[' '] = 1;
        __scanString.whiteSpace['\t'] = 1;
        __scanString.whiteSpace['\n'] = 1;
        __scanString.whiteSpace['\v'] = 1;
        __scanString.whiteSpace['\f'] = 1;
        __scanString.whiteSpace['\r'] = 1;
      }
      // Supports %x, %4x, %d.%d, %lld, %s, %f, %lf.
      // TODO: Support all format specifiers.
      format = Pointer_stringify(format);
      var soFar = 0;
      if (format.indexOf('%n') >= 0) {
        // need to track soFar
        var _get = get;
        get = function() {
          soFar++;
          return _get();
        }
        var _unget = unget;
        unget = function() {
          soFar--;
          return _unget();
        }
      }
      var formatIndex = 0;
      var argsi = 0;
      var fields = 0;
      var argIndex = 0;
      var next;
      mainLoop:
      for (var formatIndex = 0; formatIndex < format.length;) {
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'n') {
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          HEAP32[((argPtr)>>2)]=soFar;
          formatIndex += 2;
          continue;
        }
        // TODO: Support strings like "%5c" etc.
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'c') {
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          fields++;
          next = get();
          HEAP8[(argPtr)]=next
          formatIndex += 2;
          continue;
        }
        // remove whitespace
        while (1) {
          next = get();
          if (next == 0) return fields;
          if (!(next in __scanString.whiteSpace)) break;
        }
        unget();
        if (format[formatIndex] === '%') {
          formatIndex++;
          var suppressAssignment = false;
          if (format[formatIndex] == '*') {
            suppressAssignment = true;
            formatIndex++;
          }
          var maxSpecifierStart = formatIndex;
          while (format[formatIndex].charCodeAt(0) >= 48 &&
                 format[formatIndex].charCodeAt(0) <= 57) {
            formatIndex++;
          }
          var max_;
          if (formatIndex != maxSpecifierStart) {
            max_ = parseInt(format.slice(maxSpecifierStart, formatIndex), 10);
          }
          var long_ = false;
          var half = false;
          var longLong = false;
          if (format[formatIndex] == 'l') {
            long_ = true;
            formatIndex++;
            if (format[formatIndex] == 'l') {
              longLong = true;
              formatIndex++;
            }
          } else if (format[formatIndex] == 'h') {
            half = true;
            formatIndex++;
          }
          var type = format[formatIndex];
          formatIndex++;
          var curr = 0;
          var buffer = [];
          // Read characters according to the format. floats are trickier, they may be in an unfloat state in the middle, then be a valid float later
          if (type == 'f' || type == 'e' || type == 'g' ||
              type == 'F' || type == 'E' || type == 'G') {
            var last = 0;
            next = get();
            while (next > 0) {
              buffer.push(String.fromCharCode(next));
              if (__isFloat(buffer.join(''))) {
                last = buffer.length;
              }
              next = get();
            }
            for (var i = 0; i < buffer.length - last + 1; i++) {
              unget();
            }
            buffer.length = last;
          } else {
            next = get();
            var first = true;
            while ((curr < max_ || isNaN(max_)) && next > 0) {
              if (!(next in __scanString.whiteSpace) && // stop on whitespace
                  (type == 's' ||
                   ((type === 'd' || type == 'u' || type == 'i') && ((next >= 48 && next <= 57) ||
                                                                     (first && next == 45))) ||
                   ((type === 'x' || type === 'X') && (next >= 48 && next <= 57 ||
                                     next >= 97 && next <= 102 ||
                                     next >= 65 && next <= 70))) &&
                  (formatIndex >= format.length || next !== format[formatIndex].charCodeAt(0))) { // Stop when we read something that is coming up
                buffer.push(String.fromCharCode(next));
                next = get();
                curr++;
                first = false;
              } else {
                break;
              }
            }
            unget();
          }
          if (buffer.length === 0) return 0;  // Failure.
          if (suppressAssignment) continue;
          var text = buffer.join('');
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          switch (type) {
            case 'd': case 'u': case 'i':
              if (half) {
                HEAP16[((argPtr)>>1)]=parseInt(text, 10);
              } else if (longLong) {
                (tempI64 = [parseInt(text, 10)>>>0,((Math.min((+(Math.floor((parseInt(text, 10))/(+(4294967296))))), (+(4294967295))))|0)>>>0],HEAP32[((argPtr)>>2)]=tempI64[0],HEAP32[(((argPtr)+(4))>>2)]=tempI64[1]);
              } else {
                HEAP32[((argPtr)>>2)]=parseInt(text, 10);
              }
              break;
            case 'X':
            case 'x':
              HEAP32[((argPtr)>>2)]=parseInt(text, 16)
              break;
            case 'F':
            case 'f':
            case 'E':
            case 'e':
            case 'G':
            case 'g':
            case 'E':
              // fallthrough intended
              if (long_) {
                HEAPF64[((argPtr)>>3)]=parseFloat(text)
              } else {
                HEAPF32[((argPtr)>>2)]=parseFloat(text)
              }
              break;
            case 's':
              var array = intArrayFromString(text);
              for (var j = 0; j < array.length; j++) {
                HEAP8[(((argPtr)+(j))|0)]=array[j]
              }
              break;
          }
          fields++;
        } else if (format[formatIndex] in __scanString.whiteSpace) {
          next = get();
          while (next in __scanString.whiteSpace) {
            if (next <= 0) break mainLoop;  // End of input.
            next = get();
          }
          unget(next);
          formatIndex++;
        } else {
          // Not a specifier.
          next = get();
          if (format[formatIndex].charCodeAt(0) !== next) {
            unget(next);
            break mainLoop;
          }
          formatIndex++;
        }
      }
      return fields;
    }function _sscanf(s, format, varargs) {
      // int sscanf(const char *restrict s, const char *restrict format, ... );
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/scanf.html
      var index = 0;
      var get = function() { return HEAP8[(((s)+(index++))|0)]; };
      var unget = function() { index--; };
      return __scanString(format, get, unget, varargs);
    }
  Module["_tolower"] = _tolower;
  function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;
  function _rand() {
      return Math.floor(Math.random()*0x80000000);
    }
  function ___cxa_free_exception(ptr) {
      try {
        return _free(ptr);
      } catch(e) { // XXX FIXME
      }
    }
  function ___errno_location() {
      return ___errno_state;
    }var ___errno=___errno_location;
  function _abort() {
      ABORT = true;
      throw 'abort() at ' + (new Error().stack);
    }
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
        case 10: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  var _llvm_memset_p0i8_i64=_memset;
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }
  function _llvm_lifetime_start() {}
  function _llvm_lifetime_end() {}
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : console.log("warning: cannot create object URLs");
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        function getMimetype(name) {
          return {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'bmp': 'image/bmp',
            'ogg': 'audio/ogg',
            'wav': 'audio/wav',
            'mp3': 'audio/mpeg'
          }[name.substr(name.lastIndexOf('.')+1)];
        }
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/.exec(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x = event.pageX - (window.scrollX + rect.left);
          var y = event.pageY - (window.scrollY + rect.top);
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        Browser.updateResizeListeners();
      }};
__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
_llvm_eh_exception.buf = allocate(12, "void*", ALLOC_STATIC);
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var Math_min = Math.min;
function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.__ZTVN10__cxxabiv120__si_class_type_infoE|0;var n=env.__ZTVN10__cxxabiv117__class_type_infoE|0;var o=+env.NaN;var p=+env.Infinity;var q=0;var r=0;var s=0;var t=0;var u=0,v=0,w=0,x=0,y=0.0,z=0,A=0,B=0,C=0.0;var D=0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=0;var N=global.Math.floor;var O=global.Math.abs;var P=global.Math.sqrt;var Q=global.Math.pow;var R=global.Math.cos;var S=global.Math.sin;var T=global.Math.tan;var U=global.Math.acos;var V=global.Math.asin;var W=global.Math.atan;var X=global.Math.atan2;var Y=global.Math.exp;var Z=global.Math.log;var _=global.Math.ceil;var $=global.Math.imul;var aa=env.abort;var ab=env.assert;var ac=env.asmPrintInt;var ad=env.asmPrintFloat;var ae=env.min;var af=env.invoke_viiiii;var ag=env.invoke_vi;var ah=env.invoke_ii;var ai=env.invoke_iiii;var aj=env.invoke_v;var ak=env.invoke_viiiiii;var al=env.invoke_iii;var am=env.invoke_viiii;var an=env._llvm_lifetime_end;var ao=env._rand;var ap=env._sscanf;var aq=env._snprintf;var ar=env.__scanString;var as=env.___cxa_free_exception;var at=env.___cxa_throw;var au=env.__isFloat;var av=env._abort;var aw=env._fprintf;var ax=env._llvm_eh_exception;var ay=env._printf;var az=env.__reallyNegative;var aA=env._sysconf;var aB=env._clock;var aC=env.___setErrNo;var aD=env._fwrite;var aE=env._send;var aF=env._write;var aG=env._llvm_umul_with_overflow_i32;var aH=env._sprintf;var aI=env.___cxa_find_matching_catch;var aJ=env.___cxa_allocate_exception;var aK=env.__formatString;var aL=env._time;var aM=env._llvm_uadd_with_overflow_i32;var aN=env.___cxa_does_inherit;var aO=env._ceil;var aP=env.___assert_func;var aQ=env.__ZSt18uncaught_exceptionv;var aR=env._pwrite;var aS=env._sbrk;var aT=env.___cxa_call_unexpected;var aU=env._floor;var aV=env.___errno_location;var aW=env.___gxx_personality_v0;var aX=env._llvm_lifetime_start;var aY=env.___cxa_is_number_type;var aZ=env.___resumeException;
// EMSCRIPTEN_START_FUNCS
function a6(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7>>3<<3;return b|0}function a7(){return i|0}function a8(a){a=a|0;i=a}function a9(a,b){a=a|0;b=b|0;if((q|0)==0){q=a;r=b}}function ba(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function bb(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function bc(a){a=a|0;D=a}function bd(a){a=a|0;E=a}function be(a){a=a|0;F=a}function bf(a){a=a|0;G=a}function bg(a){a=a|0;H=a}function bh(a){a=a|0;I=a}function bi(a){a=a|0;J=a}function bj(a){a=a|0;K=a}function bk(a){a=a|0;L=a}function bl(a){a=a|0;M=a}function bm(){return c[2]|0}function bn(d,e,f){d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;i=i+24|0;h=g|0;j=g+8|0;k=g+16|0;a[848]=1;l=e+196|0;if((c[l>>2]|0)==0){m=b[2584+(~~(+(ao()|0)*4.656612873077393e-10*10.0)<<1)>>1]|0}else{m=-2}n=d|0;b[n>>1]=m;if(m<<16>>16!=(b[15144]|0)){i=g;return}m=c[l>>2]|0;do{if((m|0)<25){bs(h,e,10,(f|0)/2&-1,f);o=b[h>>1]|0}else{if((m|0)<27){bv(j,e,1e3);o=b[j>>1]|0;break}else{bx(k,e);o=b[k>>1]|0;break}}}while(0);b[n>>1]=o;i=g;return}function bo(d,e){d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,v=0,w=0;f=i;i=i+296|0;g=f|0;h=f+8|0;j=f+272|0;k=f+280|0;l=f+288|0;cm(h|0,0,196);a[h+60|0]=1;a[h+135|0]=16;cm(h+196|0,0,67);m=a[d]|0;L17:do{if(m<<24>>24!=0){n=j|0;o=k|0;p=d;q=m;while(1){if(q<<24>>24==45){r=-1}else{ap(p|0,1872,(u=i,i=i+8|0,c[u>>2]=g,u)|0)|0;s=(c[g>>2]|0)+65519|0;t=117-(cl(a[p+2|0]|0)|0)<<11|s;r=(t|(a[p+3|0]<<8)+53248)&65535}t=p+4|0;p=(a[t]|0)==47?p+5|0:t;if(r<<16>>16==(b[15144]|0)){v=1904;w=25;break}b[n>>1]=r;if(!(bG(h,j)|0)){v=1904;w=26;break}b[o>>1]=r;bH(h,k);q=a[p]|0;if(q<<24>>24==0){break L17}}if((w|0)==25){i=f;return v|0}else if((w|0)==26){i=f;return v|0}}}while(0);c[2]=0;bn(l,h,e);e=b[l>>1]|0;if(e<<16>>16==-1){a[2472]=a[1864]|0;a[2473|0]=a[1865|0]|0;a[2474|0]=a[1866|0]|0;a[2475|0]=a[1867|0]|0;a[2476|0]=a[1868|0]|0;v=2472;i=f;return v|0}else{l=e&65535;e=(l&255)+17|0;h=117-(l>>>11)|0;w=l>>>8&7;aH(2472,1816,(u=i,i=i+24|0,c[u>>2]=e,c[u+8>>2]=h,c[u+16>>2]=w,u)|0)|0;v=2472;i=f;return v|0}return 0}function bp(d,e,f,g){d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;h=i;i=i+72|0;j=f;f=i;i=i+2|0;i=i+7>>3<<3;b[f>>1]=b[j>>1]|0;j=h|0;k=h+8|0;l=d|0;m=b[f>>1]|0;f=d|0;n=e|0;ci(f|0,n|0,264)|0;b[j>>1]=m;bH(l,j);b[d+268>>1]=m;m=k|0;k=d+200|0;ci(m|0,k|0,63)|0;k=g+4|0;g=k;j=c[k>>2]|0;do{if((j|0)!=0){k=j;n=g;L37:while(1){f=k;while(1){o=f;if((ck(f+16|0,m|0,63)|0)>=0){break}e=c[f+4>>2]|0;if((e|0)==0){p=n;break L37}else{f=e}}e=c[f>>2]|0;if((e|0)==0){p=o;break}else{k=e;n=o}}if((p|0)==(g|0)){break}if((ck(m|0,p+16|0,63)|0)<0){break}n=c[p+80>>2]|0;k=c[p+84>>2]|0;if(!((n|0)<-2147483646|(k|0)==2147483647)){c[d+264>>2]=((k+n|0)/2&-1)-1e3;i=h;return}n=c[d+196>>2]|0;k=0;e=0;while(1){if((a[e+(d+200)|0]|0)==0){q=k-(c[2496+(e<<2)>>2]|0)|0}else{q=k}if((a[e+21+(d+200)|0]|0)==0){r=(c[2496+(e<<2)>>2]|0)+q|0}else{r=q}s=e+1|0;if((s|0)<21){k=r;e=s}else{break}}e=(bU(l)|0)+r|0;c[d+264>>2]=(n&1|0)==0?e:-e|0;i=h;return}}while(0);r=c[d+196>>2]|0;q=0;p=0;while(1){if((a[p+(d+200)|0]|0)==0){t=q-(c[2496+(p<<2)>>2]|0)|0}else{t=q}if((a[p+21+(d+200)|0]|0)==0){u=(c[2496+(p<<2)>>2]|0)+t|0}else{u=t}m=p+1|0;if((m|0)<21){q=u;p=m}else{break}}p=(bU(l)|0)+u|0;c[d+264>>2]=(r&1|0)==0?p:-p|0;i=h;return}function bq(d,e){d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+272|0;g=e;e=i;i=i+2|0;i=i+7>>3<<3;b[e>>1]=b[g>>1]|0;g=f|0;h=f+8|0;c[2]=(c[2]|0)+1;j=b[e>>1]|0;e=h|0;k=c[d+4>>2]|0;ci(e|0,k|0,264)|0;b[g>>1]=j;bH(h,g);g=c[h+196>>2]|0;j=0;k=0;while(1){if((a[k+(h+200)|0]|0)==0){l=j-(c[2496+(k<<2)>>2]|0)|0}else{l=j}if((a[k+21+(h+200)|0]|0)==0){m=(c[2496+(k<<2)>>2]|0)+l|0}else{m=l}e=k+1|0;if((e|0)<21){j=m;k=e}else{break}}k=(bU(h)|0)+m|0;m=-((g&1|0)==0?k:-k|0)|0;k=d+8|0;do{if((c[k>>2]|0)<(m|0)){c[k>>2]=m;if((c[d+12>>2]|0)>(m|0)){break}else{n=0}i=f;return n|0}}while(0);n=1;i=f;return n|0}function br(a){a=a|0;return}function bs(d,e,f,g,j){d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0.0,F=0,G=0,H=0,I=0,J=0;k=i;i=i+8|0;l=k|0;m=aB()|0;c[7570]=m+j;c[7574]=(c[2]|0)+1e4;a[3216]=0;j=aG(f|0,12)|0;n=D;o=aM(j|0,4)|0;j=n|D?-1:o;o=ch(j)|0;c[o>>2]=f;n=o+4|0;o=(f|0)==0;if(!o){p=n+(f*12&-1)|0;q=n;do{r=q+4|0;c[r>>2]=0;c[q+8>>2]=0;c[q>>2]=r;q=q+12|0;}while((q|0)!=(p|0))}p=l|0;s=+(g|0);g=0;q=2;r=0;t=n;n=0;while(1){if((q|0)>(f|0)){v=g;w=r;x=t;y=n;break}z=ch(j)|0;c[z>>2]=f;A=z+4|0;if(!o){z=A+(f*12&-1)|0;B=A;do{C=B+4|0;c[C>>2]=0;c[B+8>>2]=0;c[B>>2]=C;B=B+12|0;}while((B|0)!=(z|0))}z=bt(e,q,-2147483647,2147483647,l,A,t,8)|0;B=z&65535;if(a[3216]|0){v=B;w=A;x=t;y=n;break}E=+(((aB()|0)-m|0)>>>0>>>0)/1.0e3;if((a[848]&1)==0){C=b[p>>1]|0;if(C<<16>>16==-1){a[2472]=a[1864]|0;a[2473|0]=a[1865|0]|0;a[2474|0]=a[1866|0]|0;a[2475|0]=a[1867|0]|0;a[2476|0]=a[1868|0]|0}else{F=C&65535;C=(F&255)+17|0;G=117-(F>>>11)|0;H=F>>>8&7;aH(2472,1816,(u=i,i=i+24|0,c[u>>2]=C,c[u+8>>2]=G,c[u+16>>2]=H,u)|0)|0}ay(1840,(u=i,i=i+32|0,c[u>>2]=q,h[u+8>>3]=E,c[u+16>>2]=2472,c[u+24>>2]=z,u)|0)|0}if((t|0)!=0){z=t-12+8|0;H=z;G=c[z>>2]|0;if((G|0)!=0){z=t+(G*12&-1)|0;while(1){G=z-12|0;bL(G|0,c[z-12+4>>2]|0);if((G|0)==(t|0)){break}else{z=G}}}cd(H)}z=b[p>>1]|0;if(E*1.0e3>s){v=B;w=A;x=A;y=z;break}else{g=B;q=q+1|0;r=A;t=A;n=z}}if((x|0)!=0){n=x-12+8|0;t=n;r=c[n>>2]|0;if((r|0)!=0){n=x+(r*12&-1)|0;while(1){r=n-12|0;bL(r|0,c[n-12+4>>2]|0);if((r|0)==(x|0)){break}else{n=r}}}cd(t)}if((w|0)==0|a[3216]^1){I=d|0;b[I>>1]=y;J=d+2|0;b[J>>1]=v;i=k;return}t=w-12+8|0;n=t;x=c[t>>2]|0;if((x|0)!=0){t=w+(x*12&-1)|0;while(1){x=t-12|0;bL(x|0,c[t-12+4>>2]|0);if((x|0)==(w|0)){break}else{t=x}}}cd(n);I=d|0;b[I>>1]=y;J=d+2|0;b[J>>1]=v;i=k;return}function bt(d,e,f,g,j,k,l,m){d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0.0,F=0.0,G=0.0,H=0.0,I=0,J=0,K=0,L=0,M=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0;n=i;i=i+3416|0;o=n|0;p=n+16|0;q=n+24|0;r=n+32|0;s=n+104|0;t=n+120|0;u=n+136|0;v=n+3136|0;w=n+3408|0;if((f|0)>(g|0)){aP(1800,90,2400,1880);return 0}x=(c[2]|0)+1|0;c[2]=x;do{if((x|0)>=(c[7574]|0)){y=c[7570]|0;if((y-(aB()|0)|0)>=0){c[7574]=(c[7574]|0)+1e4;break}a[3216]=1;z=0;i=n;return z|0}}while(0);if((e|0)<2){c[s>>2]=2712;c[s+4>>2]=d;x=s+8|0;c[x>>2]=f;y=s+12|0;c[y>>2]=g;if(bT(d,s|0)|0){z=c[x>>2]|0;i=n;return z|0}else{z=c[y>>2]|0;i=n;return z|0}}do{if((m|0)>0){y=d+200|0;x=r|0;ci(x|0,y|0,63)|0;c[r+64>>2]=-2147483647;c[r+68>>2]=2147483647;bJ(q,k|0,r);y=c[q>>2]|0;x=y+80|0;if((a[q+4|0]&1)!=0){A=x;B=f;C=g;break}s=c[x>>2]|0;D=c[y+84>>2]|0;if((D|0)<=(f|0)){z=D;i=n;return z|0}if((s|0)>=(g|0)|(s|0)==(D|0)){z=s;i=n;return z|0}else{A=x;B=(s|0)>(f|0)?s:f;C=(D|0)<(g|0)?D:g;break}}else{A=0;B=f;C=g}}while(0);g=c[d+196>>2]|0;f=e-3|0;do{if(!(f>>>0>7|(g|0)>24)){q=22272+(g*320&-1)+(f<<5)|0;r=(c[q>>2]|0)==0;D=r?0:q;if(r){break}E=(g|0)>14?2.0:1.6;do{if((C|0)!=2147483647){F=(+(C|0)+E*+h[D+24>>3]- +h[D+16>>3])/+h[D+8>>3];if(F<0.0){G=+_(+(F+-.5))}else{G=+N(+(F+.5))}r=~~G;q=bt(d,c[D>>2]|0,r-1|0,r,0,k,l,0)|0;if(a[3216]|0){z=0;i=n;return z|0}if((q|0)<(r|0)){break}if((A|0)==0){z=C;i=n;return z|0}r=A|0;q=c[r>>2]|0;c[r>>2]=(q|0)<(C|0)?C:q;z=C;i=n;return z|0}}while(0);if((B|0)<=-2147483647){break}F=(+(B|0)+ +h[D+24>>3]*(-0.0-E)- +h[D+16>>3])/+h[D+8>>3];if(F<0.0){H=+_(+(F+-.5))}else{H=+N(+(F+.5))}q=~~H;r=bt(d,c[D>>2]|0,q,q+1|0,0,k,l,0)|0;if(a[3216]|0){z=0;i=n;return z|0}if((r|0)>(q|0)){break}if((A|0)==0){z=B;i=n;return z|0}q=A+4|0;r=c[q>>2]|0;c[q>>2]=(B|0)<(r|0)?B:r;z=B;i=n;return z|0}}while(0);g=t|0;c[g>>2]=0;f=t+4|0;c[f>>2]=0;r=t+8|0;c[r>>2]=0;q=u|0;c[o>>2]=2744;c[o+4>>2]=q;s=o+8|0;c[s>>2]=0;bT(d,o|0)|0;o=c[s>>2]|0;s=u+(o<<1)|0;if((o|0)>0){o=w|0;u=l+12|0;x=v|0;y=q;q=0;I=0;while(1){b[o>>1]=b[y>>1]|0;bp(v,d,w,u);if((q|0)==(I|0)){bM(t,v)}else{if((q|0)!=0){J=q|0;ci(J|0,x|0,272)|0}c[f>>2]=q+272}J=y+2|0;if(J>>>0>=s>>>0){break}y=J;q=c[f>>2]|0;I=c[r>>2]|0}K=c[g>>2]|0;L=c[f>>2]|0}else{K=0;L=0}bB(K,L,p);p=c[g>>2]|0;L212:do{if((p|0)==(c[f>>2]|0)){M=-2147483647;O=185}else{L=e-1|0;K=k+12|0;r=l+12|0;I=m-1|0;q=-C|0;y=j|0;L214:do{if((j|0)==0){s=-2147483647;x=p;v=0;t=B;while(1){u=x|0;w=-t|0;do{if(v){d=bt(u,L,t^-1,w,0,K,r,I)|0;o=-d|0;if(a[3216]|0){P=0;break L212}if(!((t|0)<(o|0)&(C|0)>(o|0))){Q=o;break}o=-(bt(u,L,q,d,0,K,r,I)|0)|0;if(a[3216]|0){P=0;break L212}else{Q=o}}else{o=-(bt(u,L,q,w,0,K,r,I)|0)|0;if(a[3216]|0){P=0;break L212}else{Q=o}}}while(0);if((Q|0)>=(C|0)){R=Q;break L214}if((Q|0)>(s|0)){S=(Q|0)>(t|0)?Q:t;T=(Q|0)>(B|0)|v;U=Q}else{S=t;T=v;U=s}w=x+272|0;if((w|0)==(c[f>>2]|0)){M=U;O=185;break L212}else{s=U;x=w;v=T;t=S}}}else{t=-2147483647;v=p;x=0;s=B;while(1){w=v|0;u=-s|0;do{if(x){o=bt(w,L,s^-1,u,0,K,r,I)|0;d=-o|0;if(a[3216]|0){P=0;break L212}if(!((s|0)<(d|0)&(C|0)>(d|0))){V=d;break}d=-(bt(w,L,q,o,0,K,r,I)|0)|0;if(a[3216]|0){P=0;break L212}else{V=d}}else{d=-(bt(w,L,q,u,0,K,r,I)|0)|0;if(a[3216]|0){P=0;break L212}else{V=d}}}while(0);if((V|0)>=(C|0)){R=V;break L214}do{if((V|0)>(t|0)){u=(V|0)>(s|0)?V:s;if((V|0)<=(B|0)){W=u;X=x;Y=V;break}b[y>>1]=b[v+268>>1]|0;W=u;X=1;Y=V}else{W=s;X=x;Y=t}}while(0);u=v+272|0;if((u|0)==(c[f>>2]|0)){M=Y;O=185;break L212}else{t=Y;v=u;x=X;s=W}}}}while(0);if((A|0)==0){P=R;break}y=A|0;I=c[y>>2]|0;c[y>>2]=(I|0)<(R|0)?R:I;P=R}}while(0);do{if((O|0)==185){if((A|0)==0){P=M;break}R=A+4|0;if((M|0)>(B|0)){c[R>>2]=M;c[A>>2]=M;P=M;break}else{W=c[R>>2]|0;c[R>>2]=(M|0)<(W|0)?M:W;P=M;break}}}while(0);M=c[g>>2]|0;if((M|0)==0){z=P;i=n;return z|0}g=c[f>>2]|0;if((M|0)!=(g|0)){c[f>>2]=g+(((((-M|0)+(g-272)|0)>>>0)/272>>>0^-1)*272&-1)}cc(M|0);z=P;i=n;return z|0}function bu(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;d=i;i=i+8|0;e=d|0;f=a+4|0;g=f|0;h=c[g>>2]|0;do{if((h|0)==0){j=f;c[e>>2]=j;k=g;l=j}else{j=b|0;m=h;while(1){n=m+16|0;if((ck(j|0,n|0,63)|0)<0){o=m|0;p=c[o>>2]|0;if((p|0)==0){q=212;break}else{m=p;continue}}if((ck(n|0,j|0,63)|0)>=0){q=216;break}r=m+4|0;n=c[r>>2]|0;if((n|0)==0){q=215;break}else{m=n}}if((q|0)==215){c[e>>2]=m;k=r;l=m;break}else if((q|0)==216){c[e>>2]=m;k=e;l=m;break}else if((q|0)==212){c[e>>2]=m;k=o;l=m;break}}}while(0);o=c[k>>2]|0;if((o|0)!=0){s=o;t=s+80|0;i=d;return t|0}o=cg(84)|0;e=o+16|0;if((e|0)!=0){q=b|0;ci(e|0,q|0,63)|0}q=o+80|0;if((q|0)!=0){c[q>>2]=0}q=o;c[o>>2]=0;c[o+4>>2]=0;c[o+8>>2]=l;c[k>>2]=q;l=a|0;e=c[c[l>>2]>>2]|0;if((e|0)==0){u=q}else{c[l>>2]=e;u=c[k>>2]|0}bA(c[a+4>>2]|0,u);u=a+8|0;c[u>>2]=(c[u>>2]|0)+1;s=o;t=s+80|0;i=d;return t|0}function bv(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;f=i;i=i+2792|0;g=f|0;h=f+8|0;j=f+24|0;k=f+528|0;l=f+2528|0;c[7570]=(aB()|0)+(e*1e3&-1);c[7574]=(c[2]|0)+1e4;e=j|0;m=j+504|0;j=e;do{n=j+4|0;c[n>>2]=0;c[j+8>>2]=0;c[j>>2]=n;j=j+12|0;}while((j|0)!=(m|0));c[2]=(c[2]|0)+1;j=k|0;c[h>>2]=2744;c[h+4>>2]=j;n=h+8|0;c[n>>2]=0;bT(d,h|0)|0;h=c[n>>2]|0;n=k+(h<<1)|0;do{if((h|0)>0){k=l|0;o=d|0;p=g|0;q=0;r=-2147483647;s=j;while(1){t=s|0;u=b[t>>1]|0;ci(k|0,o|0,264)|0;b[p>>1]=u;bH(l,g);u=bz(l,-2147483647,-r|0,e)|0;v=-u|0;if((r|0)<(v|0)){w=b[t>>1]|0;if((u|0)<0|(v|0)==2147483647){x=241;break}else{y=v;z=w}}else{y=r;z=q}u=s+2|0;if(u>>>0<n>>>0){q=z;r=y;s=u}else{x=242;break}}if((x|0)==241){A=v&65535;B=w;break}else if((x|0)==242){A=y&65535;B=z;break}}else{A=1;B=0}}while(0);b[a>>1]=B;b[a+2>>1]=A;A=m;while(1){m=A-12|0;bK(m|0,c[A-12+4>>2]|0);if((m|0)==(e|0)){break}else{A=m}}i=f;return}function bw(d,e,f,g,h){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;j=i;i=i+2352|0;k=j|0;l=j+8|0;m=j+24|0;n=j+88|0;o=j+2088|0;p=m|0;q=d+200|0;ci(p|0,q|0,63)|0;q=h+4|0;r=q;s=c[q>>2]|0;do{if((s|0)!=0){q=s;t=r;L312:while(1){u=q;while(1){v=u;if((ck(u+16|0,p|0,63)|0)>=0){break}w=c[u+4>>2]|0;if((w|0)==0){x=t;break L312}else{u=w}}w=c[u>>2]|0;if((w|0)==0){x=v;break}else{q=w;t=v}}if((x|0)==(r|0)){break}if((ck(p|0,x+16|0,63)|0)<0){break}t=c[x+80>>2]|0;y=(c[d+196>>2]&1|0)==0?t:-t|0;i=j;return y|0}}while(0);c[2]=(c[2]|0)+1;x=n|0;c[l>>2]=2744;c[l+4>>2]=x;p=l+8|0;c[p>>2]=0;bT(d,l|0)|0;l=c[p>>2]|0;do{if((b[n>>1]|0)==-1){if((e|0)>0){z=0;A=0}else{B=e+1|0;break}while(1){if((a[A+(d+200)|0]|0)==0){C=z}else{C=(c[(c[1712+(A<<2)>>2]|0)+4>>2]|0)+z|0}p=A+1|0;if((p|0)<21){z=C;A=p}else{D=0;E=0;break}}while(1){if((a[E+21+(d+200)|0]|0)==0){F=D}else{F=(c[(c[1712+(E<<2)>>2]|0)+4>>2]|0)+D|0}p=E+1|0;if((p|0)<21){D=F;E=p}else{break}}y=(c[d+196>>2]&1|0)==0?C-F|0:F-C|0;i=j;return y|0}else{B=0}}while(0);C=n+(l<<1)|0;L338:do{if((l|0)>0){n=o|0;F=d|0;E=k|0;D=-g|0;A=h+12|0;z=f;e=x;while(1){p=b[e>>1]|0;ci(n|0,F|0,264)|0;b[E>>1]=p;bH(o,k);p=-(bw(o,B,D,-z|0,A)|0)|0;if((z|0)<(p|0)){if((p|0)<(g|0)){G=p}else{break}}else{G=z}p=e+2|0;if(p>>>0<C>>>0){z=G;e=p}else{H=G;break L338}}e=(c[d+196>>2]&1|0)==0?g:D;c[(bu(h,m)|0)>>2]=e;y=g;i=j;return y|0}else{H=f}}while(0);f=(c[d+196>>2]&1|0)==0?H:-H|0;c[(bu(h,m)|0)>>2]=f;y=H;i=j;return y|0}function bx(a,d){a=a|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;e=i;i=i+2288|0;f=e|0;g=e+8|0;h=e+24|0;j=e+2024|0;k=c[d+196>>2]|0;l=44-k|0;m=aG(l|0,12)|0;n=D;o=aM(m|0,4)|0;m=ch(n|D?-1:o)|0;o=m;c[o>>2]=l;n=m+4|0;p=n;if((k|0)!=44){k=p+(l*12&-1)|0;l=p;do{q=l+4|0;c[q>>2]=0;c[l+8>>2]=0;c[l>>2]=q;l=l+12|0;}while((l|0)!=(k|0))}c[2]=(c[2]|0)+1;k=h|0;c[g>>2]=2744;c[g+4>>2]=k;l=g+8|0;c[l>>2]=0;bT(d,g|0)|0;g=c[l>>2]|0;l=(b[h>>1]|0)==-1&1;q=h+(g<<1)|0;if((g|0)>0){g=j|0;h=d|0;d=f|0;r=0;s=-2147483647;t=k;while(1){k=t|0;u=b[k>>1]|0;ci(g|0,h|0,264)|0;b[d>>1]=u;bH(j,f);u=-(bw(j,l,-2147483647,-s|0,p)|0)|0;if((s|0)<(u|0)){v=u;w=b[k>>1]|0}else{v=s;w=r}k=t+2|0;if(k>>>0<q>>>0){r=w;s=v;t=k}else{break}}x=w;y=v&65535}else{x=0;y=1}if((n|0)==0){z=a|0;b[z>>1]=x;A=a+2|0;b[A>>1]=y;i=e;return}n=p+((c[o>>2]|0)*12&-1)|0;if((p|0)!=(n|0)){o=n;while(1){n=o-12|0;bK(n|0,c[o-12+4>>2]|0);if((n|0)==(p|0)){break}else{o=n}}}cd(m);z=a|0;b[z>>1]=x;A=a+2|0;b[A>>1]=y;i=e;return}function by(a){a=a|0;cc(a);return}function bz(d,e,f,g){d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;h=i;i=i+2640|0;j=h|0;k=h+8|0;l=h+24|0;m=h+32|0;n=h+48|0;o=h+112|0;p=h+2112|0;q=h+2376|0;r=n|0;s=d+200|0;ci(r|0,s|0,63)|0;s=g+4|0;t=s;u=c[s>>2]|0;do{if((u|0)!=0){s=u;v=t;L375:while(1){w=s;while(1){x=w;if((ck(w+16|0,r|0,63)|0)>=0){break}y=c[w+4>>2]|0;if((y|0)==0){z=v;break L375}else{w=y}}y=c[w>>2]|0;if((y|0)==0){z=x;break}else{s=y;v=x}}if((z|0)==(t|0)){break}if((ck(r|0,z+16|0,63)|0)<0){break}v=c[z+80>>2]|0;A=(c[d+196>>2]&1|0)==0?v:-v|0;i=h;return A|0}}while(0);z=(c[2]|0)+1|0;c[2]=z;do{if((z|0)>=(c[7574]|0)){r=c[7570]|0;if((r-(aB()|0)|0)<0){at(aJ(1)|0,3168,0);return 0}else{c[7574]=(c[7574]|0)+1e4;break}}}while(0);z=o|0;c[m>>2]=2744;c[m+4>>2]=z;r=m+8|0;c[r>>2]=0;bT(d,m|0)|0;m=c[r>>2]|0;r=o|0;do{if((b[r>>1]|0)==-1){t=0;x=0;while(1){if((a[x+(d+200)|0]|0)==0){B=t}else{B=(c[(c[1712+(x<<2)>>2]|0)+4>>2]|0)+t|0}u=x+1|0;if((u|0)<21){t=B;x=u}else{C=0;D=0;break}}while(1){if((a[D+21+(d+200)|0]|0)==0){E=C}else{E=(c[(c[1712+(D<<2)>>2]|0)+4>>2]|0)+C|0}x=D+1|0;if((x|0)<21){C=E;D=x}else{break}}x=(c[d+196>>2]&1|0)==0?B-E|0:E-B|0;if((x|0)<0){A=x;i=h;return A|0}if((x|0)!=0){break}x=p|0;t=d|0;ci(x|0,t|0,264)|0;b[j>>1]=-1;bH(p,j);c[k>>2]=2744;c[k+4>>2]=z;c[k+8>>2]=0;bT(p,k|0)|0;t=b[r>>1]|0;if(t<<16>>16==-1){A=0;i=h;return A|0}A=-(c[(c[1712+((t&65535)>>>11<<2)>>2]|0)+4>>2]|0)|0;i=h;return A|0}}while(0);r=o+(m<<1)|0;L413:do{if((m|0)>0){o=q|0;k=d|0;p=l|0;j=-f|0;B=g+12|0;E=e;D=z;while(1){C=b[D>>1]|0;ci(o|0,k|0,264)|0;b[p>>1]=C;bH(q,l);C=bz(q,j,-E|0,B)|0;t=-C|0;if((E|0)<(t|0)){if((C|0)>-1&(t|0)<(f|0)){F=t}else{G=t;break L413}}else{F=E}t=D+2|0;if(t>>>0<r>>>0){E=F;D=t}else{G=F;break}}}else{G=e}}while(0);e=(c[d+196>>2]&1|0)==0?G:-G|0;c[(bu(g,n)|0)>>2]=e;A=G;i=h;return A|0}function bA(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;e=(d|0)==(b|0);a[d+12|0]=e&1;if(e){return}else{f=d}while(1){g=f+8|0;h=c[g>>2]|0;d=h+12|0;if((a[d]&1)!=0){i=369;break}j=h+8|0;k=c[j>>2]|0;e=c[k>>2]|0;if((h|0)==(e|0)){l=c[k+4>>2]|0;if((l|0)==0){i=335;break}m=l+12|0;if((a[m]&1)!=0){i=335;break}a[d]=1;a[k+12|0]=(k|0)==(b|0)&1;a[m]=1}else{if((e|0)==0){i=352;break}m=e+12|0;if((a[m]&1)!=0){i=352;break}a[d]=1;a[k+12|0]=(k|0)==(b|0)&1;a[m]=1}if((k|0)==(b|0)){i=367;break}else{f=k}}if((i|0)==367){return}else if((i|0)==369){return}else if((i|0)==352){b=h|0;if((f|0)==(c[b>>2]|0)){m=f+4|0;d=c[m>>2]|0;c[b>>2]=d;if((d|0)==0){n=k}else{c[d+8>>2]=h;n=c[j>>2]|0}c[g>>2]=n;n=c[j>>2]|0;d=n|0;if((c[d>>2]|0)==(h|0)){c[d>>2]=f}else{c[n+4>>2]=f}c[m>>2]=h;c[j>>2]=f;o=f;p=c[g>>2]|0}else{o=h;p=k}a[o+12|0]=1;a[p+12|0]=0;o=p+4|0;g=c[o>>2]|0;m=g|0;n=c[m>>2]|0;c[o>>2]=n;if((n|0)!=0){c[n+8>>2]=p}n=p+8|0;c[g+8>>2]=c[n>>2];o=c[n>>2]|0;d=o|0;if((c[d>>2]|0)==(p|0)){c[d>>2]=g}else{c[o+4>>2]=g}c[m>>2]=p;c[n>>2]=g;return}else if((i|0)==335){if((f|0)==(c[h>>2]|0)){q=h;r=k}else{f=h+4|0;i=c[f>>2]|0;g=i|0;n=c[g>>2]|0;c[f>>2]=n;if((n|0)==0){s=k}else{c[n+8>>2]=h;s=c[j>>2]|0}n=i+8|0;c[n>>2]=s;s=c[j>>2]|0;k=s|0;if((c[k>>2]|0)==(h|0)){c[k>>2]=i}else{c[s+4>>2]=i}c[g>>2]=h;c[j>>2]=i;q=i;r=c[n>>2]|0}a[q+12|0]=1;a[r+12|0]=0;q=r|0;n=c[q>>2]|0;i=n+4|0;j=c[i>>2]|0;c[q>>2]=j;if((j|0)!=0){c[j+8>>2]=r}j=r+8|0;c[n+8>>2]=c[j>>2];q=c[j>>2]|0;h=q|0;if((c[h>>2]|0)==(r|0)){c[h>>2]=n}else{c[q+4>>2]=n}c[i>>2]=r;c[j>>2]=n;return}}function bB(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;e=i;i=i+1632|0;f=e+1360|0;g=e|0;h=e+272|0;j=e+816|0;k=e+1088|0;l=e+544|0;m=a;a=b;L478:while(1){b=a;n=a-272|0;o=a-272+264|0;p=n|0;q=m;L480:while(1){r=q;s=b-r|0;t=(s|0)/272&-1;if((t|0)==2){u=374;break L478}else if((t|0)==3){u=376;break L478}else if((t|0)==4){u=377;break L478}else if((t|0)==5){u=378;break L478}else if((t|0)==0|(t|0)==1){u=416;break L478}if((s|0)<8432){u=380;break L478}t=(s|0)/544&-1;v=q+(t*272&-1)|0;if((s|0)>271728){w=(s|0)/1088&-1;x=bE(q,q+(w*272&-1)|0,v,q+((w+t|0)*272&-1)|0,n,0)|0}else{x=bC(q,v,n,0)|0}w=q+264|0;s=c[w>>2]|0;y=c[q+(t*272&-1)+264>>2]|0;do{if((s|0)<(y|0)){z=n;A=x}else{t=n;while(1){B=t-272|0;if((q|0)==(B|0)){break}if((c[t-272+264>>2]|0)<(y|0)){u=397;break}else{t=B}}if((u|0)==397){u=0;t=q|0;ci(l|0,t|0,272)|0;C=B|0;ci(t|0,C|0,270)|0;ci(C|0,l|0,270)|0;z=B;A=x+1|0;break}C=q+272|0;if((s|0)<(c[o>>2]|0)){D=C}else{t=C;while(1){if((t|0)==(n|0)){u=423;break L478}E=t+272|0;if((s|0)<(c[t+264>>2]|0)){break}else{t=E}}C=t|0;ci(k|0,C|0,272)|0;ci(C|0,p|0,270)|0;ci(p|0,k|0,270)|0;D=E}if((D|0)==(n|0)){u=424;break L478}else{F=n;G=D}while(1){C=c[w>>2]|0;H=G;while(1){I=H+272|0;if((C|0)<(c[H+264>>2]|0)){J=F;break}else{H=I}}while(1){K=J-272|0;if((C|0)<(c[J-272+264>>2]|0)){J=K}else{break}}if(H>>>0>=K>>>0){q=H;continue L480}C=H|0;ci(j|0,C|0,272)|0;L=K|0;ci(C|0,L|0,270)|0;ci(L|0,j|0,270)|0;F=K;G=I}}}while(0);w=q+272|0;L510:do{if(w>>>0<z>>>0){s=z;y=w;t=A;L=v;while(1){C=c[L+264>>2]|0;M=y;while(1){N=M+272|0;if((c[M+264>>2]|0)<(C|0)){M=N}else{O=s;break}}while(1){P=O-272|0;if((c[O-272+264>>2]|0)<(C|0)){break}else{O=P}}if(M>>>0>P>>>0){Q=M;R=t;S=L;break L510}C=M|0;ci(h|0,C|0,272)|0;H=P|0;ci(C|0,H|0,270)|0;ci(H|0,h|0,270)|0;s=P;y=N;t=t+1|0;L=(L|0)==(M|0)?P:L}}else{Q=w;R=A;S=v}}while(0);do{if((Q|0)==(S|0)){T=R}else{if((c[S+264>>2]|0)>=(c[Q+264>>2]|0)){T=R;break}v=Q|0;ci(g|0,v|0,272)|0;w=S|0;ci(v|0,w|0,270)|0;ci(w|0,g|0,270)|0;T=R+1|0}}while(0);if((T|0)==0){U=bI(q,Q,0)|0;w=Q+272|0;if(bI(w,a,0)|0){u=409;break}if(U){q=w;continue}}w=Q;if((w-r|0)>=(b-w|0)){u=413;break}bB(q,Q,d);q=Q+272|0}if((u|0)==413){u=0;bB(Q+272|0,a,d);m=q;a=Q;continue}else if((u|0)==409){u=0;if(U){u=415;break}else{m=q;a=Q;continue}}}if((u|0)==374){if((c[o>>2]|0)>=(c[q+264>>2]|0)){i=e;return}o=f|0;f=q|0;ci(o|0,f|0,272)|0;Q=a-272|0;ci(f|0,Q|0,270)|0;ci(Q|0,o|0,270)|0;i=e;return}else if((u|0)==376){bC(q,q+272|0,n,0)|0;i=e;return}else if((u|0)==377){bD(q,q+272|0,q+544|0,n,0)|0;i=e;return}else if((u|0)==378){bE(q,q+272|0,q+544|0,q+816|0,n,0)|0;i=e;return}else if((u|0)==380){bF(q,a,0);i=e;return}else if((u|0)==415){i=e;return}else if((u|0)==416){i=e;return}else if((u|0)==423){i=e;return}else if((u|0)==424){i=e;return}}function bC(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;i=i+1360|0;f=e|0;g=e+272|0;h=e+544|0;j=e+816|0;k=e+1088|0;l=b+264|0;m=c[l>>2]|0;n=a+264|0;o=d+264|0;p=(c[o>>2]|0)<(m|0);if((m|0)>=(c[n>>2]|0)){if(!p){q=0;i=e;return q|0}m=k|0;k=b|0;ci(m|0,k|0,272)|0;r=d|0;ci(k|0,r|0,270)|0;ci(r|0,m|0,270)|0;if((c[l>>2]|0)>=(c[n>>2]|0)){q=1;i=e;return q|0}n=h|0;h=a|0;ci(n|0,h|0,272)|0;ci(h|0,k|0,270)|0;ci(k|0,n|0,270)|0;q=2;i=e;return q|0}if(p){p=f|0;f=a|0;ci(p|0,f|0,272)|0;n=d|0;ci(f|0,n|0,270)|0;ci(n|0,p|0,270)|0;q=1;i=e;return q|0}p=g|0;g=a|0;ci(p|0,g|0,272)|0;a=b|0;ci(g|0,a|0,270)|0;ci(a|0,p|0,270)|0;if((c[o>>2]|0)>=(c[l>>2]|0)){q=1;i=e;return q|0}l=j|0;ci(l|0,a|0,272)|0;j=d|0;ci(a|0,j|0,270)|0;ci(j|0,l|0,270)|0;q=2;i=e;return q|0}function bD(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;f=i;i=i+2176|0;g=f+1360|0;h=f+1632|0;j=f+1904|0;k=f|0;l=f+272|0;m=f+544|0;n=f+816|0;o=f+1088|0;p=b+264|0;q=c[p>>2]|0;r=a+264|0;s=d+264|0;t=(c[s>>2]|0)<(q|0);do{if((q|0)<(c[r>>2]|0)){u=a|0;if(t){ci(k|0,u|0,272)|0;v=d|0;ci(u|0,v|0,270)|0;ci(v|0,k|0,270)|0;w=1;break}ci(l|0,u|0,272)|0;v=b|0;ci(u|0,v|0,270)|0;ci(v|0,l|0,270)|0;if((c[s>>2]|0)>=(c[p>>2]|0)){w=1;break}ci(n|0,v|0,272)|0;u=d|0;ci(v|0,u|0,270)|0;ci(u|0,n|0,270)|0;w=2}else{if(!t){w=0;break}u=b|0;ci(o|0,u|0,272)|0;v=d|0;ci(u|0,v|0,270)|0;ci(v|0,o|0,270)|0;if((c[p>>2]|0)>=(c[r>>2]|0)){w=1;break}v=a|0;ci(m|0,v|0,272)|0;ci(v|0,u|0,270)|0;ci(u|0,m|0,270)|0;w=2}}while(0);if((c[e+264>>2]|0)>=(c[s>>2]|0)){x=w;i=f;return x|0}m=j|0;j=d|0;ci(m|0,j|0,272)|0;d=e|0;ci(j|0,d|0,270)|0;ci(d|0,m|0,270)|0;if((c[s>>2]|0)>=(c[p>>2]|0)){x=w+1|0;i=f;return x|0}s=g|0;g=b|0;ci(s|0,g|0,272)|0;ci(g|0,j|0,270)|0;ci(j|0,s|0,270)|0;if((c[p>>2]|0)>=(c[r>>2]|0)){x=w+2|0;i=f;return x|0}r=h|0;h=a|0;ci(r|0,h|0,272)|0;ci(h|0,g|0,270)|0;ci(g|0,r|0,270)|0;x=w+3|0;i=f;return x|0}function bE(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;i=i+1088|0;h=g|0;j=g+272|0;k=g+544|0;l=bD(a,b,d,e,0)|0;m=e+264|0;if((c[f+264>>2]|0)>=(c[m>>2]|0)){n=l;i=g;return n|0}o=g+816|0;p=e|0;ci(o|0,p|0,272)|0;e=f|0;ci(p|0,e|0,270)|0;ci(e|0,o|0,270)|0;o=d+264|0;if((c[m>>2]|0)>=(c[o>>2]|0)){n=l+1|0;i=g;return n|0}m=j|0;j=d|0;ci(m|0,j|0,272)|0;ci(j|0,p|0,270)|0;ci(p|0,m|0,270)|0;m=b+264|0;if((c[o>>2]|0)>=(c[m>>2]|0)){n=l+2|0;i=g;return n|0}o=h|0;h=b|0;ci(o|0,h|0,272)|0;ci(h|0,j|0,270)|0;ci(j|0,o|0,270)|0;if((c[m>>2]|0)>=(c[a+264>>2]|0)){n=l+3|0;i=g;return n|0}m=k|0;k=a|0;ci(m|0,k|0,272)|0;ci(k|0,h|0,270)|0;ci(h|0,m|0,270)|0;n=l+4|0;i=g;return n|0}function bF(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;e=i;i=i+1632|0;f=e+1360|0;g=e+1624|0;h=a+544|0;j=a+272|0;k=e|0;l=e+272|0;m=e+544|0;n=e+816|0;o=e+1088|0;p=a+536|0;q=c[p>>2]|0;r=c[a+264>>2]|0;s=c[a+808>>2]|0;t=(s|0)<(q|0);do{if((q|0)<(r|0)){u=a|0;if(t){ci(k|0,u|0,272)|0;v=h|0;ci(u|0,v|0,270)|0;ci(v|0,k|0,270)|0;break}ci(l|0,u|0,272)|0;v=j|0;ci(u|0,v|0,270)|0;ci(v|0,l|0,270)|0;if((s|0)>=(c[p>>2]|0)){break}ci(n|0,v|0,272)|0;u=h|0;ci(v|0,u|0,270)|0;ci(u|0,n|0,270)|0}else{if(!t){break}u=j|0;ci(o|0,u|0,272)|0;v=h|0;ci(u|0,v|0,270)|0;ci(v|0,o|0,270)|0;if((c[p>>2]|0)>=(r|0)){break}v=a|0;ci(m|0,v|0,272)|0;ci(v|0,u|0,270)|0;ci(u|0,m|0,270)|0}}while(0);m=a+816|0;if((m|0)==(d|0)){i=e;return}r=f|0;f=g;p=h;h=m;while(1){m=h+264|0;if((c[m>>2]|0)<(c[p+264>>2]|0)){o=h|0;ci(r|0,o|0,264)|0;o=c[m>>2]|0;c[g>>2]=c[h+268>>2];m=p;j=h;while(1){t=j|0;w=m|0;ci(t|0,w|0,270)|0;if((m|0)==(a|0)){x=a;break}if((o|0)<(c[m-272+264>>2]|0)){j=m;m=m-272|0}else{x=m;break}}ci(w|0,r|0,264)|0;c[x+264>>2]=o;b[x+268>>1]=b[f>>1]|0}m=h+272|0;if((m|0)==(d|0)){break}else{p=h;h=m}}i=e;return}function bG(e,f){e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;g=i;h=f;f=i;i=i+2|0;i=i+7>>3<<3;b[f>>1]=b[h>>1]|0;h=b[f>>1]|0;if(h<<16>>16==-1){j=1;i=g;return j|0}f=h&65535;h=f>>>11;k=(c[e+196>>2]&1|0)==0;if((a[(k?e+200|0:e+221|0)+h|0]|0)!=0){j=0;i=g;return j|0}l=f>>>8&7;m=c[1712+(h<<2)>>2]|0;h=(c[m+44+(l*12&-1)>>2]|0)+(f>>>4&15)|0;n=(c[m+44+(l*12&-1)+4>>2]|0)+(f&15)|0;f=c[m+44+(l*12&-1)+8>>2]|0;if(((c[f+160>>2]|0)+h|0)<0){j=0;i=g;return j|0}if(((c[f+168>>2]|0)+h|0)>13){j=0;i=g;return j|0}if(((c[f+164>>2]|0)+n|0)<0){j=0;i=g;return j|0}if(((c[f+172>>2]|0)+n|0)>13){j=0;i=g;return j|0}l=c[f+4>>2]|0;m=k?70:100;o=0;while(1){if((o|0)>=(l|0)){p=0;break}if((d[(c[f+8+(o<<3)>>2]|0)+h+(e+(((c[f+8+(o<<3)+4>>2]|0)+n|0)*14&-1))|0]&m|0)==0){o=o+1|0}else{j=0;q=502;break}}if((q|0)==502){i=g;return j|0}while(1){if((p|0)>=(l|0)){j=0;q=503;break}if(((k?1:16)&d[(c[f+8+(p<<3)>>2]|0)+h+(e+(((c[f+8+(p<<3)+4>>2]|0)+n|0)*14&-1))|0]|0)==0){p=p+1|0}else{j=1;q=500;break}}if((q|0)==503){i=g;return j|0}else if((q|0)==500){i=g;return j|0}return 0}function bH(e,f){e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;g=i;h=f;f=i;i=i+2|0;i=i+7>>3<<3;b[f>>1]=b[h>>1]|0;h=b[f>>1]|0;if(h<<16>>16==-1){f=e+196|0;c[f>>2]=(c[f>>2]|0)+1;i=g;return}f=h&65535;j=f>>>8&7;k=f>>>11;l=c[1712+(k<<2)>>2]|0;m=(c[l+44+(j*12&-1)>>2]|0)+(f>>>4&15)|0;n=(c[l+44+(j*12&-1)+4>>2]|0)+(f&15)|0;f=c[l+44+(j*12&-1)+8>>2]|0;l=e+196|0;o=c[l>>2]|0;p=(o&1|0)==0;q=p?2:32;r=p?1:16;s=f+4|0;if((c[s>>2]|0)>0){t=p?4:64;p=0;do{u=m+(c[f+8+(p<<3)>>2]|0)|0;v=n+(c[f+8+(p<<3)+4>>2]|0)|0;w=e+(v*14&-1)+u|0;a[w]=a[w]|t;w=u-1|0;x=(w|0)<14;y=(v|0)<14;if((v|w|0)>-1&x&y){z=e+(v*14&-1)+w|0;a[z]=a[z]|q}z=v-1|0;A=(u|0)<14;B=(z|0)<14;if((z|u|0)>-1&A&B){C=e+(z*14&-1)+u|0;a[C]=a[C]|q}C=u+1|0;D=(C|0)<14;if((v|C|0)>-1&D&y){y=e+(v*14&-1)+C|0;a[y]=a[y]|q}y=v+1|0;v=(y|0)<14;if((y|u|0)>-1&A&v){A=e+(y*14&-1)+u|0;a[A]=a[A]|q}if((z|w|0)>-1&x&B){A=e+(z*14&-1)+w|0;a[A]=a[A]|r}if((z|C|0)>-1&D&B){B=e+(z*14&-1)+C|0;a[B]=a[B]|r}if((y|w|0)>-1&x&v){x=e+(y*14&-1)+w|0;a[x]=a[x]|r}if((y|C|0)>-1&D&v){v=e+(y*14&-1)+C|0;a[v]=a[v]|r}p=p+1|0;}while((p|0)<(c[s>>2]|0));E=c[l>>2]|0}else{E=o}a[((E&1|0)==0?k:k+21|0)+(e+200)|0]=(h&255)+17&255;h=k+42+(e+200)|0;a[h]=(((c[l>>2]&1|0)==0?j:j<<4)|(d[h]|0))&255;c[l>>2]=(c[l>>2]|0)+1;i=g;return}function bI(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;e=i;i=i+4352|0;f=e|0;g=e+272|0;h=e+544|0;j=e+816|0;k=e+1088|0;l=e+1360|0;m=e+1632|0;n=e+1904|0;o=e+2176|0;p=e+2448|0;q=e+2720|0;r=e+2992|0;s=e+3264|0;t=e+3536|0;u=e+3808|0;v=e+4080|0;w=e+4344|0;x=(d-a|0)/272&-1;if((x|0)==4){y=a+272|0;z=a+544|0;A=d-272|0;bD(a,y,z,A,0)|0;B=1;i=e;return B|0}else if((x|0)==3){A=a+272|0;z=d-272|0;y=f|0;f=g|0;g=h|0;h=j|0;j=k|0;k=a+536|0;C=c[k>>2]|0;D=a+264|0;E=d-272+264|0;F=(c[E>>2]|0)<(C|0);if((C|0)>=(c[D>>2]|0)){if(!F){B=1;i=e;return B|0}C=A|0;ci(j|0,C|0,272)|0;G=z|0;ci(C|0,G|0,270)|0;ci(G|0,j|0,270)|0;if((c[k>>2]|0)>=(c[D>>2]|0)){B=1;i=e;return B|0}D=a|0;ci(g|0,D|0,272)|0;ci(D|0,C|0,270)|0;ci(C|0,g|0,270)|0;B=1;i=e;return B|0}g=a|0;if(F){ci(y|0,g|0,272)|0;F=z|0;ci(g|0,F|0,270)|0;ci(F|0,y|0,270)|0;B=1;i=e;return B|0}ci(f|0,g|0,272)|0;y=A|0;ci(g|0,y|0,270)|0;ci(y|0,f|0,270)|0;if((c[E>>2]|0)>=(c[k>>2]|0)){B=1;i=e;return B|0}ci(h|0,y|0,272)|0;k=z|0;ci(y|0,k|0,270)|0;ci(k|0,h|0,270)|0;B=1;i=e;return B|0}else if((x|0)==0|(x|0)==1){B=1;i=e;return B|0}else if((x|0)==2){if((c[d-272+264>>2]|0)>=(c[a+264>>2]|0)){B=1;i=e;return B|0}h=u|0;u=a|0;ci(h|0,u|0,272)|0;k=d-272|0;ci(u|0,k|0,270)|0;ci(k|0,h|0,270)|0;B=1;i=e;return B|0}else if((x|0)==5){x=a+272|0;h=a+544|0;k=a+816|0;u=l|0;l=m|0;m=n|0;n=o|0;bD(a,x,h,k,0)|0;o=a+1080|0;if((c[d-272+264>>2]|0)>=(c[o>>2]|0)){B=1;i=e;return B|0}y=k|0;ci(n|0,y|0,272)|0;k=d-272|0;ci(y|0,k|0,270)|0;ci(k|0,n|0,270)|0;n=a+808|0;if((c[o>>2]|0)>=(c[n>>2]|0)){B=1;i=e;return B|0}o=h|0;ci(l|0,o|0,272)|0;ci(o|0,y|0,270)|0;ci(y|0,l|0,270)|0;l=a+536|0;if((c[n>>2]|0)>=(c[l>>2]|0)){B=1;i=e;return B|0}n=x|0;ci(u|0,n|0,272)|0;ci(n|0,o|0,270)|0;ci(o|0,u|0,270)|0;if((c[l>>2]|0)>=(c[a+264>>2]|0)){B=1;i=e;return B|0}l=a|0;ci(m|0,l|0,272)|0;ci(l|0,n|0,270)|0;ci(n|0,m|0,270)|0;B=1;i=e;return B|0}else{m=a+544|0;n=a+272|0;l=p|0;p=q|0;q=r|0;r=s|0;s=t|0;t=a+536|0;u=c[t>>2]|0;o=c[a+264>>2]|0;x=c[a+808>>2]|0;y=(x|0)<(u|0);do{if((u|0)<(o|0)){h=a|0;if(y){ci(l|0,h|0,272)|0;k=m|0;ci(h|0,k|0,270)|0;ci(k|0,l|0,270)|0;break}ci(p|0,h|0,272)|0;k=n|0;ci(h|0,k|0,270)|0;ci(k|0,p|0,270)|0;if((x|0)>=(c[t>>2]|0)){break}ci(r|0,k|0,272)|0;h=m|0;ci(k|0,h|0,270)|0;ci(h|0,r|0,270)|0}else{if(!y){break}h=n|0;ci(s|0,h|0,272)|0;k=m|0;ci(h|0,k|0,270)|0;ci(k|0,s|0,270)|0;if((c[t>>2]|0)>=(o|0)){break}k=a|0;ci(q|0,k|0,272)|0;ci(k|0,h|0,270)|0;ci(h|0,q|0,270)|0}}while(0);q=a+816|0;if((q|0)==(d|0)){B=1;i=e;return B|0}o=v|0;v=w;t=m;m=0;s=q;while(1){q=s+264|0;if((c[q>>2]|0)<(c[t+264>>2]|0)){n=s|0;ci(o|0,n|0,264)|0;n=c[q>>2]|0;c[w>>2]=c[s+268>>2];q=t;y=s;while(1){r=y|0;H=q|0;ci(r|0,H|0,270)|0;if((q|0)==(a|0)){I=a;break}if((n|0)<(c[q-272+264>>2]|0)){y=q;q=q-272|0}else{I=q;break}}ci(H|0,o|0,264)|0;c[I+264>>2]=n;b[I+268>>1]=b[v>>1]|0;q=m+1|0;if((q|0)==8){break}else{J=q}}else{J=m}q=s+272|0;if((q|0)==(d|0)){B=1;K=571;break}else{t=s;m=J;s=q}}if((K|0)==571){i=e;return B|0}B=(s+272|0)==(d|0);i=e;return B|0}return 0}function bJ(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;f=i;i=i+8|0;g=f|0;h=d+4|0;j=h|0;k=c[j>>2]|0;do{if((k|0)==0){l=h;c[g>>2]=l;m=j;n=l}else{l=e|0;o=k;while(1){p=o+16|0;if((ck(l|0,p|0,63)|0)<0){q=o|0;r=c[q>>2]|0;if((r|0)==0){s=591;break}else{o=r;continue}}if((ck(p|0,l|0,63)|0)>=0){s=595;break}t=o+4|0;p=c[t>>2]|0;if((p|0)==0){s=594;break}else{o=p}}if((s|0)==594){c[g>>2]=o;m=t;n=o;break}else if((s|0)==595){c[g>>2]=o;m=g;n=o;break}else if((s|0)==591){c[g>>2]=o;m=q;n=o;break}}}while(0);q=c[m>>2]|0;if((q|0)!=0){u=q;v=0;w=b|0;c[w>>2]=u;x=b+4|0;a[x]=v;i=f;return}q=cg(88)|0;g=q+16|0;if((g|0)!=0){s=e|0;ci(g|0,s|0,63)|0;c[q+80>>2]=c[e+64>>2];c[q+84>>2]=c[e+68>>2]}e=q;c[q>>2]=0;c[q+4>>2]=0;c[q+8>>2]=n;c[m>>2]=e;n=d|0;s=c[c[n>>2]>>2]|0;if((s|0)==0){y=e}else{c[n>>2]=s;y=c[m>>2]|0}bA(c[d+4>>2]|0,y);y=d+8|0;c[y>>2]=(c[y>>2]|0)+1;u=q;v=1;w=b|0;c[w>>2]=u;x=b+4|0;a[x]=v;i=f;return}function bK(a,b){a=a|0;b=b|0;if((b|0)==0){return}else{bK(a,c[b>>2]|0);bK(a,c[b+4>>2]|0);cc(b);return}}function bL(a,b){a=a|0;b=b|0;if((b|0)==0){return}else{bL(a,c[b>>2]|0);bL(a,c[b+4>>2]|0);cc(b);return}}function bM(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;d=a+4|0;e=a|0;f=c[e>>2]|0;g=((c[d>>2]|0)-f|0)/272&-1;h=g+1|0;if(h>>>0>15790320){b0(0)}i=a+8|0;a=((c[i>>2]|0)-f|0)/272&-1;if(a>>>0>7895159){j=15790320;k=616}else{f=a<<1;a=f>>>0<h>>>0?h:f;if((a|0)==0){l=0;m=0}else{j=a;k=616}}if((k|0)==616){l=cg(j*272&-1)|0;m=j}j=l+(g*272&-1)|0;k=l+(m*272&-1)|0;if((j|0)!=0){m=j|0;j=b|0;ci(m|0,j|0,272)|0}j=l+(h*272&-1)|0;h=c[e>>2]|0;m=(c[d>>2]|0)-h|0;b=l+((((m|0)/-272&-1)+g|0)*272&-1)|0;g=b|0;l=h|0;ci(g|0,l|0,m)|0;c[e>>2]=b;c[d>>2]=j;c[i>>2]=k;if((h|0)==0){return}cc(l);return}function bN(a){a=a|0;return}function bO(a){a=a|0;return}function bP(a){a=a|0;return}function bQ(a){a=a|0;return}function bR(a,d){a=a|0;d=d|0;var e=0,f=0,g=0;e=i;f=d;d=i;i=i+2|0;i=i+7>>3<<3;b[d>>1]=b[f>>1]|0;f=a+8|0;g=c[f>>2]|0;c[f>>2]=g+1;b[(c[a+4>>2]|0)+(g<<1)>>1]=b[d>>1]|0;i=e;return 1}function bS(a){a=a|0;return c[a+4>>2]|0}function bT(e,f){e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;g=i;i=i+1248|0;h=g|0;j=g+8|0;k=g+1208|0;l=g+1240|0;m=e+196|0;n=c[m>>2]|0;if((n|0)<2){o=((n|0)==0?16:856)|0;p=b[o>>1]|0;if(p<<16>>16==0){q=1;i=g;return q|0}r=f;s=h|0;t=o;o=p;p=n;while(1){u=o&65535;if((p|0)<8){if((c[(c[(c[1712+(u>>>11<<2)>>2]|0)+44+((u>>>8&7)*12&-1)+8>>2]|0)+4>>2]|0)>=5){v=635}}else{v=635}if((v|0)==635){v=0;u=c[(c[r>>2]|0)+8>>2]|0;b[s>>1]=o;if(!(a4[u&7](f,h)|0)){q=0;v=686;break}}u=t+2|0;w=b[u>>1]|0;if(w<<16>>16==0){q=1;v=685;break}t=u;o=w;p=c[m>>2]|0}if((v|0)==685){i=g;return q|0}else if((v|0)==686){i=g;return q|0}}p=(n&1|0)==0;n=p?2:32;o=p?71:116;t=p?1:16;p=0;h=j|0;while(1){s=p-1|0;if((p|0)>0){r=0;w=h;while(1){if((d[e+(p*14&-1)+r|0]&o|0)==(t|0)){c[w>>2]=r;c[w+4>>2]=p;u=(r|0)>0;do{if((a[e+(s*14&-1)+r|0]&n)<<24>>24==0){if(!u){x=3;break}x=(a[r-1+(e+(p*14&-1))|0]&n)<<24>>24!=0?2:3}else{if(!u){x=1;break}x=(a[r-1+(e+(p*14&-1))|0]&n)<<24>>24==0&1}}while(0);c[w+8>>2]=x;y=w+12|0}else{y=w}u=r+1|0;if((u|0)<14){r=u;w=y}else{z=y;break}}}else{w=0;r=h;while(1){if((d[e+(p*14&-1)+w|0]&o|0)==(t|0)){c[r>>2]=w;c[r+4>>2]=p;if((w|0)>0){A=(a[w-1+(e+(p*14&-1))|0]&n)<<24>>24!=0?2:3}else{A=3}c[r+8>>2]=A;B=r+12|0}else{B=r}s=w+1|0;if((s|0)<14){w=s;r=B}else{z=B;break}}}r=p+1|0;if((r|0)<14){p=r;h=z}else{break}}c[z>>2]=-1;z=e+200|0;h=e+221|0;p=k;B=j|0;j=f;A=l|0;n=0;t=0;L861:while(1){o=c[m>>2]|0;L863:do{if((a[((o&1|0)==0?z:h)+t|0]|0)==0){y=(c[1712+(t<<2)>>2]|0)+8|0;x=c[y>>2]|0;if((x|0)==0){C=n;break}else{D=n;E=y;F=x;G=o}while(1){if((G|0)<8){if((c[F+4>>2]|0)<5){H=D}else{v=659}}else{v=659}do{if((v|0)==659){v=0;cm(p|0,0,28);x=c[B>>2]|0;if((x|0)<=-1){H=D;break}y=D;r=B;w=c[E>>2]|0;s=x;while(1){x=r+8|0;u=c[x>>2]|0;L874:do{if((c[w+48+(u<<2)>>2]|0)>0){I=r+4|0;J=y;K=0;L=u;M=w;N=s;while(1){O=N-(c[M+64+(L*24&-1)+(K<<3)>>2]|0)|0;P=(c[I>>2]|0)-(c[M+64+(L*24&-1)+(K<<3)+4>>2]|0)|0;L878:do{if((P+(c[M+164>>2]|0)|0)<0){Q=J;R=M}else{if(((c[M+172>>2]|0)+P|0)>13){Q=J;R=M;break}if(((c[M+160>>2]|0)+O|0)<0){Q=J;R=M;break}if(((c[M+168>>2]|0)+O|0)>13){Q=J;R=M;break}S=k+(P<<1)|0;T=b[S>>1]|0;U=1<<O;if((T&U|0)!=0){Q=J;R=M;break}b[S>>1]=(T|U)&65535;U=c[E>>2]|0;T=c[U+4>>2]|0;S=(c[m>>2]&1|0)==0?70:100;V=0;while(1){if((V|0)>=(T|0)){break}if((d[(c[U+8+(V<<3)>>2]|0)+O+(e+(((c[U+8+(V<<3)+4>>2]|0)+P|0)*14&-1))|0]&S|0)==0){V=V+1|0}else{Q=J;R=U;break L878}}V=c[(c[j>>2]|0)+8>>2]|0;b[A>>1]=(P|O<<4|c[U>>2]<<8)&65535;if(!(a4[V&7](f,l)|0)){q=0;v=687;break L861}Q=J+1|0;R=c[E>>2]|0}}while(0);O=K+1|0;P=c[x>>2]|0;if((O|0)>=(c[R+48+(P<<2)>>2]|0)){W=Q;X=R;break L874}J=Q;K=O;L=P;M=R;N=c[r>>2]|0}}else{W=y;X=w}}while(0);x=r+12|0;u=c[x>>2]|0;if((u|0)>-1){y=W;r=x;w=X;s=u}else{H=W;break}}}}while(0);s=E+4|0;w=c[s>>2]|0;if((w|0)==0){C=H;break L863}D=H;E=s;F=w;G=c[m>>2]|0}}else{C=n}}while(0);o=t+1|0;if((o|0)<21){n=C;t=o}else{break}}if((v|0)==687){i=g;return q|0}if((C|0)!=0){q=1;i=g;return q|0}q=a4[c[(c[j>>2]|0)+8>>2]&7](f,3224)|0;i=g;return q|0}function bU(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0;d=i;i=i+1808|0;e=d|0;f=d+240|0;a[e+29|0]=68;a[e+44|0]=68;a[e+59|0]=68;a[e+74|0]=68;a[e+89|0]=68;a[e+104|0]=68;a[e+119|0]=68;a[e+134|0]=68;a[e+149|0]=68;a[e+164|0]=68;a[e+179|0]=68;a[e+194|0]=68;a[e+209|0]=68;g=f|0;h=f+784|0;cm(e|0,68,15);cm(e+224|0,68,16);f=0;j=0;do{k=a[f+2480|0]|0;l=a[f+2488|0]|0;m=0;n=j;o=g;while(1){p=(m*15&-1)+15|0;q=0;r=n;s=o;while(1){t=k&a[b+(m*14&-1)+q|0];u=e+(p+q)|0;a[u]=t;if(t<<24>>24==l<<24>>24){c[s>>2]=u;v=s+4|0;w=r+1|0}else{v=s;w=r}u=q+1|0;if((u|0)<14){q=u;r=w;s=v}else{break}}s=m+1|0;if((s|0)<14){m=s;n=w;o=v}else{break}}c[v>>2]=0;o=c[g>>2]|0;if((o|0)==0){x=w;y=h}else{n=w;m=h;l=g;k=o;while(1){o=l+4|0;s=k-15|0;if((a[s]|0)==0){a[s]=1;c[m>>2]=s;z=m+4|0;A=n+1|0}else{z=m;A=n}s=k-1|0;if((a[s]|0)==0){a[s]=1;c[z>>2]=s;B=z+4|0;C=A+1|0}else{B=z;C=A}s=k+1|0;if((a[s]|0)==0){a[s]=1;c[B>>2]=s;D=B+4|0;E=C+1|0}else{D=B;E=C}s=k+15|0;if((a[s]|0)==0){a[s]=1;c[D>>2]=s;F=D+4|0;G=E+1|0}else{F=D;G=E}s=c[o>>2]|0;if((s|0)==0){x=G;y=F;break}else{n=G;m=F;l=o;k=s}}}c[y>>2]=0;k=c[h>>2]|0;if((k|0)==0){H=x;I=g}else{l=x;m=g;n=h;s=k;while(1){k=n+4|0;o=s-15|0;if((a[o]|0)==0){a[o]=1;c[m>>2]=o;J=m+4|0;K=l+1|0}else{J=m;K=l}o=s-1|0;if((a[o]|0)==0){a[o]=1;c[J>>2]=o;L=J+4|0;M=K+1|0}else{L=J;M=K}o=s+1|0;if((a[o]|0)==0){a[o]=1;c[L>>2]=o;N=L+4|0;O=M+1|0}else{N=L;O=M}o=s+15|0;if((a[o]|0)==0){a[o]=1;c[N>>2]=o;P=N+4|0;Q=O+1|0}else{P=N;Q=O}o=c[k>>2]|0;if((o|0)==0){H=Q;I=P;break}else{l=Q;m=P;n=k;s=o}}}c[I>>2]=0;s=c[g>>2]|0;if((s|0)==0){R=H}else{n=H;m=g;l=s;while(1){s=m+4|0;o=l-15|0;if((a[o]|0)==0){a[o]=1;S=n+1|0}else{S=n}o=l-1|0;if((a[o]|0)==0){a[o]=1;T=S+1|0}else{T=S}o=l+1|0;if((a[o]|0)==0){a[o]=1;U=T+1|0}else{U=T}o=l+15|0;if((a[o]|0)==0){a[o]=1;V=U+1|0}else{V=U}o=c[s>>2]|0;if((o|0)==0){R=V;break}else{n=V;m=s;l=o}}}j=-R|0;f=f+1|0;}while((f|0)<2);i=d;return j|0}function bV(a){a=a|0;cc(a);return}function bW(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=2680;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((B=c[d>>2]|0,c[d>>2]=B+ -1,B)-1|0)>=0){e=a;cc(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;cc(e);return}cd(d);e=a;cc(e);return}function bX(a){a=a|0;var b=0;c[a>>2]=2680;b=a+4|0;a=(c[b>>2]|0)-4|0;if(((B=c[a>>2]|0,c[a>>2]=B+ -1,B)-1|0)>=0){return}a=(c[b>>2]|0)-12|0;if((a|0)==0){return}cd(a);return}function bY(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=2680;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((B=c[d>>2]|0,c[d>>2]=B+ -1,B)-1|0)>=0){e=a;cc(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;cc(e);return}cd(d);e=a;cc(e);return}function bZ(a){a=a|0;cc(a);return}function b_(a){a=a|0;cc(a);return}function b$(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;i=i+56|0;f=e|0;if((a|0)==(b|0)){g=1;i=e;return g|0}if((b|0)==0){g=0;i=e;return g|0}h=b5(b,3152,3136,-1)|0;b=h;if((h|0)==0){g=0;i=e;return g|0}cm(f|0,0,56);c[f>>2]=b;c[f+8>>2]=a;c[f+12>>2]=-1;c[f+48>>2]=1;a5[c[(c[h>>2]|0)+28>>2]&7](b,f,c[d>>2]|0,1);if((c[f+24>>2]|0)!=1){g=0;i=e;return g|0}c[d>>2]=c[f+16>>2];g=1;i=e;return g|0}function b0(b){b=b|0;var d=0,e=0,f=0,g=0;b=aJ(8)|0;c[b>>2]=2680;d=b+4|0;if((d|0)==0){e=b;c[e>>2]=2648;at(b|0,3088,14)}f=ch(19)|0;c[f+4>>2]=6;c[f>>2]=6;g=f+12|0;c[d>>2]=g;c[f+8>>2]=0;a[g]=a[1896]|0;a[g+1|0]=a[1897|0]|0;a[g+2|0]=a[1898|0]|0;a[g+3|0]=a[1899|0]|0;a[g+4|0]=a[1900|0]|0;a[g+5|0]=a[1901|0]|0;a[g+6|0]=a[1902|0]|0;e=b;c[e>>2]=2648;at(b|0,3088,14)}function b1(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((c[d+8>>2]|0)!=(b|0)){return}b=d+16|0;g=c[b>>2]|0;if((g|0)==0){c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((g|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function b2(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;if((c[d+8>>2]|0)==(b|0)){if((c[d+4>>2]|0)!=(e|0)){return}g=d+28|0;if((c[g>>2]|0)==1){return}c[g>>2]=f;return}if((c[d>>2]|0)!=(b|0)){return}do{if((c[d+16>>2]|0)!=(e|0)){b=d+20|0;if((c[b>>2]|0)==(e|0)){break}c[d+32>>2]=f;c[b>>2]=e;b=d+40|0;c[b>>2]=(c[b>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){break}a[d+54|0]=1}}while(0);c[d+44>>2]=4;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function b3(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0;if((c[d+8>>2]|0)!=(b|0)){return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;b=c[f>>2]|0;if((b|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;b=c[e>>2]|0;if((b|0)==2){c[e>>2]=g;i=g}else{i=b}if(!((c[d+48>>2]|0)==1&(i|0)==1)){return}a[d+54|0]=1;return}function b4(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((b|0)!=(c[d+8>>2]|0)){g=c[b+8>>2]|0;a5[c[(c[g>>2]|0)+28>>2]&7](g,d,e,f);return}g=d+16|0;b=c[g>>2]|0;if((b|0)==0){c[g>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function b5(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;i=i+56|0;g=f|0;h=c[a>>2]|0;j=a+(c[h-8>>2]|0)|0;k=c[h-4>>2]|0;h=k;c[g>>2]=d;c[g+4>>2]=a;c[g+8>>2]=b;c[g+12>>2]=e;e=g+16|0;b=g+20|0;a=g+24|0;l=g+28|0;m=g+32|0;n=g+40|0;cm(e|0,0,39);if((k|0)==(d|0)){c[g+48>>2]=1;a3[c[(c[k>>2]|0)+20>>2]&7](h,g,j,j,1,0);i=f;return((c[a>>2]|0)==1?j:0)|0}a_[c[(c[k>>2]|0)+24>>2]&7](h,g,j,1,0);j=c[g+36>>2]|0;if((j|0)==1){do{if((c[a>>2]|0)!=1){if((c[n>>2]|0)!=0){o=0;i=f;return o|0}if((c[l>>2]|0)!=1){o=0;i=f;return o|0}if((c[m>>2]|0)==1){break}else{o=0}i=f;return o|0}}while(0);o=c[e>>2]|0;i=f;return o|0}else if((j|0)==0){if((c[n>>2]|0)!=1){o=0;i=f;return o|0}if((c[l>>2]|0)!=1){o=0;i=f;return o|0}o=(c[m>>2]|0)==1?c[b>>2]|0:0;i=f;return o|0}else{o=0;i=f;return o|0}return 0}function b6(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0;h=b|0;if((h|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){return}i=d+28|0;if((c[i>>2]|0)==1){return}c[i>>2]=f;return}if((h|0)!=(c[d>>2]|0)){h=c[b+8>>2]|0;a_[c[(c[h>>2]|0)+24>>2]&7](h,d,e,f,g);return}do{if((c[d+16>>2]|0)!=(e|0)){h=d+20|0;if((c[h>>2]|0)==(e|0)){break}c[d+32>>2]=f;i=d+44|0;if((c[i>>2]|0)==4){return}j=d+52|0;a[j]=0;k=d+53|0;a[k]=0;l=c[b+8>>2]|0;a3[c[(c[l>>2]|0)+20>>2]&7](l,d,e,e,1,g);if((a[k]&1)==0){m=0;n=868}else{if((a[j]&1)==0){m=1;n=868}}L1144:do{if((n|0)==868){c[h>>2]=e;j=d+40|0;c[j>>2]=(c[j>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){n=871;break}a[d+54|0]=1;if(m){break L1144}}else{n=871}}while(0);if((n|0)==871){if(m){break}}c[i>>2]=4;return}}while(0);c[i>>2]=3;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function b7(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0;if((b|0)!=(c[d+8>>2]|0)){i=c[b+8>>2]|0;a3[c[(c[i>>2]|0)+20>>2]&7](i,d,e,f,g,h);return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;h=c[f>>2]|0;if((h|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((h|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;h=c[e>>2]|0;if((h|0)==2){c[e>>2]=g;j=g}else{j=h}if(!((c[d+48>>2]|0)==1&(j|0)==1)){return}a[d+54|0]=1;return}function b8(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,aw=0,ax=0,ay=0,az=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0;do{if(a>>>0<245){if(a>>>0<11){b=16}else{b=a+11&-8}d=b>>>3;e=c[482]|0;f=e>>>(d>>>0);if((f&3|0)!=0){g=(f&1^1)+d|0;h=g<<1;i=1968+(h<<2)|0;j=1968+(h+2<<2)|0;h=c[j>>2]|0;k=h+8|0;l=c[k>>2]|0;do{if((i|0)==(l|0)){c[482]=e&(1<<g^-1)}else{if(l>>>0<(c[486]|0)>>>0){av();return 0;return 0}m=l+12|0;if((c[m>>2]|0)==(h|0)){c[m>>2]=i;c[j>>2]=l;break}else{av();return 0;return 0}}}while(0);l=g<<3;c[h+4>>2]=l|3;j=h+(l|4)|0;c[j>>2]=c[j>>2]|1;n=k;return n|0}if(b>>>0<=(c[484]|0)>>>0){o=b;break}if((f|0)!=0){j=2<<d;l=f<<d&(j|-j);j=(l&-l)-1|0;l=j>>>12&16;i=j>>>(l>>>0);j=i>>>5&8;m=i>>>(j>>>0);i=m>>>2&4;p=m>>>(i>>>0);m=p>>>1&2;q=p>>>(m>>>0);p=q>>>1&1;r=(j|l|i|m|p)+(q>>>(p>>>0))|0;p=r<<1;q=1968+(p<<2)|0;m=1968+(p+2<<2)|0;p=c[m>>2]|0;i=p+8|0;l=c[i>>2]|0;do{if((q|0)==(l|0)){c[482]=e&(1<<r^-1)}else{if(l>>>0<(c[486]|0)>>>0){av();return 0;return 0}j=l+12|0;if((c[j>>2]|0)==(p|0)){c[j>>2]=q;c[m>>2]=l;break}else{av();return 0;return 0}}}while(0);l=r<<3;m=l-b|0;c[p+4>>2]=b|3;q=p;e=q+b|0;c[q+(b|4)>>2]=m|1;c[q+l>>2]=m;l=c[484]|0;if((l|0)!=0){q=c[487]|0;d=l>>>3;l=d<<1;f=1968+(l<<2)|0;k=c[482]|0;h=1<<d;do{if((k&h|0)==0){c[482]=k|h;s=f;t=1968+(l+2<<2)|0}else{d=1968+(l+2<<2)|0;g=c[d>>2]|0;if(g>>>0>=(c[486]|0)>>>0){s=g;t=d;break}av();return 0;return 0}}while(0);c[t>>2]=q;c[s+12>>2]=q;c[q+8>>2]=s;c[q+12>>2]=f}c[484]=m;c[487]=e;n=i;return n|0}l=c[483]|0;if((l|0)==0){o=b;break}h=(l&-l)-1|0;l=h>>>12&16;k=h>>>(l>>>0);h=k>>>5&8;p=k>>>(h>>>0);k=p>>>2&4;r=p>>>(k>>>0);p=r>>>1&2;d=r>>>(p>>>0);r=d>>>1&1;g=c[2232+((h|l|k|p|r)+(d>>>(r>>>0))<<2)>>2]|0;r=g;d=g;p=(c[g+4>>2]&-8)-b|0;while(1){g=c[r+16>>2]|0;if((g|0)==0){k=c[r+20>>2]|0;if((k|0)==0){break}else{u=k}}else{u=g}g=(c[u+4>>2]&-8)-b|0;k=g>>>0<p>>>0;r=u;d=k?u:d;p=k?g:p}r=d;i=c[486]|0;if(r>>>0<i>>>0){av();return 0;return 0}e=r+b|0;m=e;if(r>>>0>=e>>>0){av();return 0;return 0}e=c[d+24>>2]|0;f=c[d+12>>2]|0;do{if((f|0)==(d|0)){q=d+20|0;g=c[q>>2]|0;if((g|0)==0){k=d+16|0;l=c[k>>2]|0;if((l|0)==0){v=0;break}else{w=l;x=k}}else{w=g;x=q}while(1){q=w+20|0;g=c[q>>2]|0;if((g|0)!=0){w=g;x=q;continue}q=w+16|0;g=c[q>>2]|0;if((g|0)==0){break}else{w=g;x=q}}if(x>>>0<i>>>0){av();return 0;return 0}else{c[x>>2]=0;v=w;break}}else{q=c[d+8>>2]|0;if(q>>>0<i>>>0){av();return 0;return 0}g=q+12|0;if((c[g>>2]|0)!=(d|0)){av();return 0;return 0}k=f+8|0;if((c[k>>2]|0)==(d|0)){c[g>>2]=f;c[k>>2]=q;v=f;break}else{av();return 0;return 0}}}while(0);L1264:do{if((e|0)!=0){f=d+28|0;i=2232+(c[f>>2]<<2)|0;do{if((d|0)==(c[i>>2]|0)){c[i>>2]=v;if((v|0)!=0){break}c[483]=c[483]&(1<<c[f>>2]^-1);break L1264}else{if(e>>>0<(c[486]|0)>>>0){av();return 0;return 0}q=e+16|0;if((c[q>>2]|0)==(d|0)){c[q>>2]=v}else{c[e+20>>2]=v}if((v|0)==0){break L1264}}}while(0);if(v>>>0<(c[486]|0)>>>0){av();return 0;return 0}c[v+24>>2]=e;f=c[d+16>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[486]|0)>>>0){av();return 0;return 0}else{c[v+16>>2]=f;c[f+24>>2]=v;break}}}while(0);f=c[d+20>>2]|0;if((f|0)==0){break}if(f>>>0<(c[486]|0)>>>0){av();return 0;return 0}else{c[v+20>>2]=f;c[f+24>>2]=v;break}}}while(0);if(p>>>0<16){e=p+b|0;c[d+4>>2]=e|3;f=r+(e+4)|0;c[f>>2]=c[f>>2]|1}else{c[d+4>>2]=b|3;c[r+(b|4)>>2]=p|1;c[r+(p+b)>>2]=p;f=c[484]|0;if((f|0)!=0){e=c[487]|0;i=f>>>3;f=i<<1;q=1968+(f<<2)|0;k=c[482]|0;g=1<<i;do{if((k&g|0)==0){c[482]=k|g;y=q;z=1968+(f+2<<2)|0}else{i=1968+(f+2<<2)|0;l=c[i>>2]|0;if(l>>>0>=(c[486]|0)>>>0){y=l;z=i;break}av();return 0;return 0}}while(0);c[z>>2]=e;c[y+12>>2]=e;c[e+8>>2]=y;c[e+12>>2]=q}c[484]=p;c[487]=m}f=d+8|0;if((f|0)==0){o=b;break}else{n=f}return n|0}else{if(a>>>0>4294967231){o=-1;break}f=a+11|0;g=f&-8;k=c[483]|0;if((k|0)==0){o=g;break}r=-g|0;i=f>>>8;do{if((i|0)==0){A=0}else{if(g>>>0>16777215){A=31;break}f=(i+1048320|0)>>>16&8;l=i<<f;h=(l+520192|0)>>>16&4;j=l<<h;l=(j+245760|0)>>>16&2;B=14-(h|f|l)+(j<<l>>>15)|0;A=g>>>((B+7|0)>>>0)&1|B<<1}}while(0);i=c[2232+(A<<2)>>2]|0;L1312:do{if((i|0)==0){C=0;D=r;E=0}else{if((A|0)==31){F=0}else{F=25-(A>>>1)|0}d=0;m=r;p=i;q=g<<F;e=0;while(1){B=c[p+4>>2]&-8;l=B-g|0;if(l>>>0<m>>>0){if((B|0)==(g|0)){C=p;D=l;E=p;break L1312}else{G=p;H=l}}else{G=d;H=m}l=c[p+20>>2]|0;B=c[p+16+(q>>>31<<2)>>2]|0;j=(l|0)==0|(l|0)==(B|0)?e:l;if((B|0)==0){C=G;D=H;E=j;break}else{d=G;m=H;p=B;q=q<<1;e=j}}}}while(0);if((E|0)==0&(C|0)==0){i=2<<A;r=k&(i|-i);if((r|0)==0){o=g;break}i=(r&-r)-1|0;r=i>>>12&16;e=i>>>(r>>>0);i=e>>>5&8;q=e>>>(i>>>0);e=q>>>2&4;p=q>>>(e>>>0);q=p>>>1&2;m=p>>>(q>>>0);p=m>>>1&1;I=c[2232+((i|r|e|q|p)+(m>>>(p>>>0))<<2)>>2]|0}else{I=E}if((I|0)==0){J=D;K=C}else{p=I;m=D;q=C;while(1){e=(c[p+4>>2]&-8)-g|0;r=e>>>0<m>>>0;i=r?e:m;e=r?p:q;r=c[p+16>>2]|0;if((r|0)!=0){p=r;m=i;q=e;continue}r=c[p+20>>2]|0;if((r|0)==0){J=i;K=e;break}else{p=r;m=i;q=e}}}if((K|0)==0){o=g;break}if(J>>>0>=((c[484]|0)-g|0)>>>0){o=g;break}q=K;m=c[486]|0;if(q>>>0<m>>>0){av();return 0;return 0}p=q+g|0;k=p;if(q>>>0>=p>>>0){av();return 0;return 0}e=c[K+24>>2]|0;i=c[K+12>>2]|0;do{if((i|0)==(K|0)){r=K+20|0;d=c[r>>2]|0;if((d|0)==0){j=K+16|0;B=c[j>>2]|0;if((B|0)==0){L=0;break}else{M=B;N=j}}else{M=d;N=r}while(1){r=M+20|0;d=c[r>>2]|0;if((d|0)!=0){M=d;N=r;continue}r=M+16|0;d=c[r>>2]|0;if((d|0)==0){break}else{M=d;N=r}}if(N>>>0<m>>>0){av();return 0;return 0}else{c[N>>2]=0;L=M;break}}else{r=c[K+8>>2]|0;if(r>>>0<m>>>0){av();return 0;return 0}d=r+12|0;if((c[d>>2]|0)!=(K|0)){av();return 0;return 0}j=i+8|0;if((c[j>>2]|0)==(K|0)){c[d>>2]=i;c[j>>2]=r;L=i;break}else{av();return 0;return 0}}}while(0);L1362:do{if((e|0)!=0){i=K+28|0;m=2232+(c[i>>2]<<2)|0;do{if((K|0)==(c[m>>2]|0)){c[m>>2]=L;if((L|0)!=0){break}c[483]=c[483]&(1<<c[i>>2]^-1);break L1362}else{if(e>>>0<(c[486]|0)>>>0){av();return 0;return 0}r=e+16|0;if((c[r>>2]|0)==(K|0)){c[r>>2]=L}else{c[e+20>>2]=L}if((L|0)==0){break L1362}}}while(0);if(L>>>0<(c[486]|0)>>>0){av();return 0;return 0}c[L+24>>2]=e;i=c[K+16>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[486]|0)>>>0){av();return 0;return 0}else{c[L+16>>2]=i;c[i+24>>2]=L;break}}}while(0);i=c[K+20>>2]|0;if((i|0)==0){break}if(i>>>0<(c[486]|0)>>>0){av();return 0;return 0}else{c[L+20>>2]=i;c[i+24>>2]=L;break}}}while(0);do{if(J>>>0<16){e=J+g|0;c[K+4>>2]=e|3;i=q+(e+4)|0;c[i>>2]=c[i>>2]|1}else{c[K+4>>2]=g|3;c[q+(g|4)>>2]=J|1;c[q+(J+g)>>2]=J;i=J>>>3;if(J>>>0<256){e=i<<1;m=1968+(e<<2)|0;r=c[482]|0;j=1<<i;do{if((r&j|0)==0){c[482]=r|j;O=m;P=1968+(e+2<<2)|0}else{i=1968+(e+2<<2)|0;d=c[i>>2]|0;if(d>>>0>=(c[486]|0)>>>0){O=d;P=i;break}av();return 0;return 0}}while(0);c[P>>2]=k;c[O+12>>2]=k;c[q+(g+8)>>2]=O;c[q+(g+12)>>2]=m;break}e=p;j=J>>>8;do{if((j|0)==0){Q=0}else{if(J>>>0>16777215){Q=31;break}r=(j+1048320|0)>>>16&8;i=j<<r;d=(i+520192|0)>>>16&4;B=i<<d;i=(B+245760|0)>>>16&2;l=14-(d|r|i)+(B<<i>>>15)|0;Q=J>>>((l+7|0)>>>0)&1|l<<1}}while(0);j=2232+(Q<<2)|0;c[q+(g+28)>>2]=Q;c[q+(g+20)>>2]=0;c[q+(g+16)>>2]=0;m=c[483]|0;l=1<<Q;if((m&l|0)==0){c[483]=m|l;c[j>>2]=e;c[q+(g+24)>>2]=j;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}if((Q|0)==31){R=0}else{R=25-(Q>>>1)|0}l=J<<R;m=c[j>>2]|0;while(1){if((c[m+4>>2]&-8|0)==(J|0)){break}S=m+16+(l>>>31<<2)|0;j=c[S>>2]|0;if((j|0)==0){T=1055;break}else{l=l<<1;m=j}}if((T|0)==1055){if(S>>>0<(c[486]|0)>>>0){av();return 0;return 0}else{c[S>>2]=e;c[q+(g+24)>>2]=m;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}}l=m+8|0;j=c[l>>2]|0;i=c[486]|0;if(m>>>0<i>>>0){av();return 0;return 0}if(j>>>0<i>>>0){av();return 0;return 0}else{c[j+12>>2]=e;c[l>>2]=e;c[q+(g+8)>>2]=j;c[q+(g+12)>>2]=m;c[q+(g+24)>>2]=0;break}}}while(0);q=K+8|0;if((q|0)==0){o=g;break}else{n=q}return n|0}}while(0);K=c[484]|0;if(o>>>0<=K>>>0){S=K-o|0;J=c[487]|0;if(S>>>0>15){R=J;c[487]=R+o;c[484]=S;c[R+(o+4)>>2]=S|1;c[R+K>>2]=S;c[J+4>>2]=o|3}else{c[484]=0;c[487]=0;c[J+4>>2]=K|3;S=J+(K+4)|0;c[S>>2]=c[S>>2]|1}n=J+8|0;return n|0}J=c[485]|0;if(o>>>0<J>>>0){S=J-o|0;c[485]=S;J=c[488]|0;K=J;c[488]=K+o;c[K+(o+4)>>2]=S|1;c[J+4>>2]=o|3;n=J+8|0;return n|0}do{if((c[422]|0)==0){J=aA(8)|0;if((J-1&J|0)==0){c[424]=J;c[423]=J;c[425]=-1;c[426]=2097152;c[427]=0;c[593]=0;c[422]=(aL(0)|0)&-16^1431655768;break}else{av();return 0;return 0}}}while(0);J=o+48|0;S=c[424]|0;K=o+47|0;R=S+K|0;Q=-S|0;S=R&Q;if(S>>>0<=o>>>0){n=0;return n|0}O=c[592]|0;do{if((O|0)!=0){P=c[590]|0;L=P+S|0;if(L>>>0<=P>>>0|L>>>0>O>>>0){n=0}else{break}return n|0}}while(0);L1454:do{if((c[593]&4|0)==0){O=c[488]|0;L1456:do{if((O|0)==0){T=1085}else{L=O;P=2376;while(1){U=P|0;M=c[U>>2]|0;if(M>>>0<=L>>>0){V=P+4|0;if((M+(c[V>>2]|0)|0)>>>0>L>>>0){break}}M=c[P+8>>2]|0;if((M|0)==0){T=1085;break L1456}else{P=M}}if((P|0)==0){T=1085;break}L=R-(c[485]|0)&Q;if(L>>>0>=2147483647){W=0;break}m=aS(L|0)|0;e=(m|0)==((c[U>>2]|0)+(c[V>>2]|0)|0);X=e?m:-1;Y=e?L:0;Z=m;_=L;T=1094}}while(0);do{if((T|0)==1085){O=aS(0)|0;if((O|0)==-1){W=0;break}g=O;L=c[423]|0;m=L-1|0;if((m&g|0)==0){$=S}else{$=S-g+(m+g&-L)|0}L=c[590]|0;g=L+$|0;if(!($>>>0>o>>>0&$>>>0<2147483647)){W=0;break}m=c[592]|0;if((m|0)!=0){if(g>>>0<=L>>>0|g>>>0>m>>>0){W=0;break}}m=aS($|0)|0;g=(m|0)==(O|0);X=g?O:-1;Y=g?$:0;Z=m;_=$;T=1094}}while(0);L1476:do{if((T|0)==1094){m=-_|0;if((X|0)!=-1){aa=Y;ab=X;T=1105;break L1454}do{if((Z|0)!=-1&_>>>0<2147483647&_>>>0<J>>>0){g=c[424]|0;O=K-_+g&-g;if(O>>>0>=2147483647){ac=_;break}if((aS(O|0)|0)==-1){aS(m|0)|0;W=Y;break L1476}else{ac=O+_|0;break}}else{ac=_}}while(0);if((Z|0)==-1){W=Y}else{aa=ac;ab=Z;T=1105;break L1454}}}while(0);c[593]=c[593]|4;ad=W;T=1102}else{ad=0;T=1102}}while(0);do{if((T|0)==1102){if(S>>>0>=2147483647){break}W=aS(S|0)|0;Z=aS(0)|0;if(!((Z|0)!=-1&(W|0)!=-1&W>>>0<Z>>>0)){break}ac=Z-W|0;Z=ac>>>0>(o+40|0)>>>0;Y=Z?W:-1;if((Y|0)!=-1){aa=Z?ac:ad;ab=Y;T=1105}}}while(0);do{if((T|0)==1105){ad=(c[590]|0)+aa|0;c[590]=ad;if(ad>>>0>(c[591]|0)>>>0){c[591]=ad}ad=c[488]|0;L1496:do{if((ad|0)==0){S=c[486]|0;if((S|0)==0|ab>>>0<S>>>0){c[486]=ab}c[594]=ab;c[595]=aa;c[597]=0;c[491]=c[422];c[490]=-1;S=0;do{Y=S<<1;ac=1968+(Y<<2)|0;c[1968+(Y+3<<2)>>2]=ac;c[1968+(Y+2<<2)>>2]=ac;S=S+1|0;}while(S>>>0<32);S=ab+8|0;if((S&7|0)==0){ae=0}else{ae=-S&7}S=aa-40-ae|0;c[488]=ab+ae;c[485]=S;c[ab+(ae+4)>>2]=S|1;c[ab+(aa-36)>>2]=40;c[489]=c[426]}else{S=2376;while(1){af=c[S>>2]|0;ag=S+4|0;ah=c[ag>>2]|0;if((ab|0)==(af+ah|0)){T=1117;break}ac=c[S+8>>2]|0;if((ac|0)==0){break}else{S=ac}}do{if((T|0)==1117){if((c[S+12>>2]&8|0)!=0){break}ac=ad;if(!(ac>>>0>=af>>>0&ac>>>0<ab>>>0)){break}c[ag>>2]=ah+aa;ac=c[488]|0;Y=(c[485]|0)+aa|0;Z=ac;W=ac+8|0;if((W&7|0)==0){ai=0}else{ai=-W&7}W=Y-ai|0;c[488]=Z+ai;c[485]=W;c[Z+(ai+4)>>2]=W|1;c[Z+(Y+4)>>2]=40;c[489]=c[426];break L1496}}while(0);if(ab>>>0<(c[486]|0)>>>0){c[486]=ab}S=ab+aa|0;Y=2376;while(1){aj=Y|0;if((c[aj>>2]|0)==(S|0)){T=1127;break}Z=c[Y+8>>2]|0;if((Z|0)==0){break}else{Y=Z}}do{if((T|0)==1127){if((c[Y+12>>2]&8|0)!=0){break}c[aj>>2]=ab;S=Y+4|0;c[S>>2]=(c[S>>2]|0)+aa;S=ab+8|0;if((S&7|0)==0){ak=0}else{ak=-S&7}S=ab+(aa+8)|0;if((S&7|0)==0){al=0}else{al=-S&7}S=ab+(al+aa)|0;Z=S;W=ak+o|0;ac=ab+W|0;_=ac;K=S-(ab+ak)-o|0;c[ab+(ak+4)>>2]=o|3;do{if((Z|0)==(c[488]|0)){J=(c[485]|0)+K|0;c[485]=J;c[488]=_;c[ab+(W+4)>>2]=J|1}else{if((Z|0)==(c[487]|0)){J=(c[484]|0)+K|0;c[484]=J;c[487]=_;c[ab+(W+4)>>2]=J|1;c[ab+(J+W)>>2]=J;break}J=aa+4|0;X=c[ab+(J+al)>>2]|0;if((X&3|0)==1){$=X&-8;V=X>>>3;L1541:do{if(X>>>0<256){U=c[ab+((al|8)+aa)>>2]|0;Q=c[ab+(aa+12+al)>>2]|0;R=1968+(V<<1<<2)|0;do{if((U|0)!=(R|0)){if(U>>>0<(c[486]|0)>>>0){av();return 0;return 0}if((c[U+12>>2]|0)==(Z|0)){break}av();return 0;return 0}}while(0);if((Q|0)==(U|0)){c[482]=c[482]&(1<<V^-1);break}do{if((Q|0)==(R|0)){am=Q+8|0}else{if(Q>>>0<(c[486]|0)>>>0){av();return 0;return 0}m=Q+8|0;if((c[m>>2]|0)==(Z|0)){am=m;break}av();return 0;return 0}}while(0);c[U+12>>2]=Q;c[am>>2]=U}else{R=S;m=c[ab+((al|24)+aa)>>2]|0;P=c[ab+(aa+12+al)>>2]|0;do{if((P|0)==(R|0)){O=al|16;g=ab+(J+O)|0;L=c[g>>2]|0;if((L|0)==0){e=ab+(O+aa)|0;O=c[e>>2]|0;if((O|0)==0){an=0;break}else{ao=O;ap=e}}else{ao=L;ap=g}while(1){g=ao+20|0;L=c[g>>2]|0;if((L|0)!=0){ao=L;ap=g;continue}g=ao+16|0;L=c[g>>2]|0;if((L|0)==0){break}else{ao=L;ap=g}}if(ap>>>0<(c[486]|0)>>>0){av();return 0;return 0}else{c[ap>>2]=0;an=ao;break}}else{g=c[ab+((al|8)+aa)>>2]|0;if(g>>>0<(c[486]|0)>>>0){av();return 0;return 0}L=g+12|0;if((c[L>>2]|0)!=(R|0)){av();return 0;return 0}e=P+8|0;if((c[e>>2]|0)==(R|0)){c[L>>2]=P;c[e>>2]=g;an=P;break}else{av();return 0;return 0}}}while(0);if((m|0)==0){break}P=ab+(aa+28+al)|0;U=2232+(c[P>>2]<<2)|0;do{if((R|0)==(c[U>>2]|0)){c[U>>2]=an;if((an|0)!=0){break}c[483]=c[483]&(1<<c[P>>2]^-1);break L1541}else{if(m>>>0<(c[486]|0)>>>0){av();return 0;return 0}Q=m+16|0;if((c[Q>>2]|0)==(R|0)){c[Q>>2]=an}else{c[m+20>>2]=an}if((an|0)==0){break L1541}}}while(0);if(an>>>0<(c[486]|0)>>>0){av();return 0;return 0}c[an+24>>2]=m;R=al|16;P=c[ab+(R+aa)>>2]|0;do{if((P|0)!=0){if(P>>>0<(c[486]|0)>>>0){av();return 0;return 0}else{c[an+16>>2]=P;c[P+24>>2]=an;break}}}while(0);P=c[ab+(J+R)>>2]|0;if((P|0)==0){break}if(P>>>0<(c[486]|0)>>>0){av();return 0;return 0}else{c[an+20>>2]=P;c[P+24>>2]=an;break}}}while(0);aq=ab+(($|al)+aa)|0;ar=$+K|0}else{aq=Z;ar=K}J=aq+4|0;c[J>>2]=c[J>>2]&-2;c[ab+(W+4)>>2]=ar|1;c[ab+(ar+W)>>2]=ar;J=ar>>>3;if(ar>>>0<256){V=J<<1;X=1968+(V<<2)|0;P=c[482]|0;m=1<<J;do{if((P&m|0)==0){c[482]=P|m;as=X;at=1968+(V+2<<2)|0}else{J=1968+(V+2<<2)|0;U=c[J>>2]|0;if(U>>>0>=(c[486]|0)>>>0){as=U;at=J;break}av();return 0;return 0}}while(0);c[at>>2]=_;c[as+12>>2]=_;c[ab+(W+8)>>2]=as;c[ab+(W+12)>>2]=X;break}V=ac;m=ar>>>8;do{if((m|0)==0){au=0}else{if(ar>>>0>16777215){au=31;break}P=(m+1048320|0)>>>16&8;$=m<<P;J=($+520192|0)>>>16&4;U=$<<J;$=(U+245760|0)>>>16&2;Q=14-(J|P|$)+(U<<$>>>15)|0;au=ar>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=2232+(au<<2)|0;c[ab+(W+28)>>2]=au;c[ab+(W+20)>>2]=0;c[ab+(W+16)>>2]=0;X=c[483]|0;Q=1<<au;if((X&Q|0)==0){c[483]=X|Q;c[m>>2]=V;c[ab+(W+24)>>2]=m;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}if((au|0)==31){aw=0}else{aw=25-(au>>>1)|0}Q=ar<<aw;X=c[m>>2]|0;while(1){if((c[X+4>>2]&-8|0)==(ar|0)){break}ax=X+16+(Q>>>31<<2)|0;m=c[ax>>2]|0;if((m|0)==0){T=1200;break}else{Q=Q<<1;X=m}}if((T|0)==1200){if(ax>>>0<(c[486]|0)>>>0){av();return 0;return 0}else{c[ax>>2]=V;c[ab+(W+24)>>2]=X;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}}Q=X+8|0;m=c[Q>>2]|0;$=c[486]|0;if(X>>>0<$>>>0){av();return 0;return 0}if(m>>>0<$>>>0){av();return 0;return 0}else{c[m+12>>2]=V;c[Q>>2]=V;c[ab+(W+8)>>2]=m;c[ab+(W+12)>>2]=X;c[ab+(W+24)>>2]=0;break}}}while(0);n=ab+(ak|8)|0;return n|0}}while(0);Y=ad;W=2376;while(1){ay=c[W>>2]|0;if(ay>>>0<=Y>>>0){az=c[W+4>>2]|0;aB=ay+az|0;if(aB>>>0>Y>>>0){break}}W=c[W+8>>2]|0}W=ay+(az-39)|0;if((W&7|0)==0){aC=0}else{aC=-W&7}W=ay+(az-47+aC)|0;ac=W>>>0<(ad+16|0)>>>0?Y:W;W=ac+8|0;_=ab+8|0;if((_&7|0)==0){aD=0}else{aD=-_&7}_=aa-40-aD|0;c[488]=ab+aD;c[485]=_;c[ab+(aD+4)>>2]=_|1;c[ab+(aa-36)>>2]=40;c[489]=c[426];c[ac+4>>2]=27;c[W>>2]=c[594];c[W+4>>2]=c[2380>>2];c[W+8>>2]=c[2384>>2];c[W+12>>2]=c[2388>>2];c[594]=ab;c[595]=aa;c[597]=0;c[596]=W;W=ac+28|0;c[W>>2]=7;if((ac+32|0)>>>0<aB>>>0){_=W;while(1){W=_+4|0;c[W>>2]=7;if((_+8|0)>>>0<aB>>>0){_=W}else{break}}}if((ac|0)==(Y|0)){break}_=ac-ad|0;W=Y+(_+4)|0;c[W>>2]=c[W>>2]&-2;c[ad+4>>2]=_|1;c[Y+_>>2]=_;W=_>>>3;if(_>>>0<256){K=W<<1;Z=1968+(K<<2)|0;S=c[482]|0;m=1<<W;do{if((S&m|0)==0){c[482]=S|m;aE=Z;aF=1968+(K+2<<2)|0}else{W=1968+(K+2<<2)|0;Q=c[W>>2]|0;if(Q>>>0>=(c[486]|0)>>>0){aE=Q;aF=W;break}av();return 0;return 0}}while(0);c[aF>>2]=ad;c[aE+12>>2]=ad;c[ad+8>>2]=aE;c[ad+12>>2]=Z;break}K=ad;m=_>>>8;do{if((m|0)==0){aG=0}else{if(_>>>0>16777215){aG=31;break}S=(m+1048320|0)>>>16&8;Y=m<<S;ac=(Y+520192|0)>>>16&4;W=Y<<ac;Y=(W+245760|0)>>>16&2;Q=14-(ac|S|Y)+(W<<Y>>>15)|0;aG=_>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=2232+(aG<<2)|0;c[ad+28>>2]=aG;c[ad+20>>2]=0;c[ad+16>>2]=0;Z=c[483]|0;Q=1<<aG;if((Z&Q|0)==0){c[483]=Z|Q;c[m>>2]=K;c[ad+24>>2]=m;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}if((aG|0)==31){aH=0}else{aH=25-(aG>>>1)|0}Q=_<<aH;Z=c[m>>2]|0;while(1){if((c[Z+4>>2]&-8|0)==(_|0)){break}aI=Z+16+(Q>>>31<<2)|0;m=c[aI>>2]|0;if((m|0)==0){T=1235;break}else{Q=Q<<1;Z=m}}if((T|0)==1235){if(aI>>>0<(c[486]|0)>>>0){av();return 0;return 0}else{c[aI>>2]=K;c[ad+24>>2]=Z;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}}Q=Z+8|0;_=c[Q>>2]|0;m=c[486]|0;if(Z>>>0<m>>>0){av();return 0;return 0}if(_>>>0<m>>>0){av();return 0;return 0}else{c[_+12>>2]=K;c[Q>>2]=K;c[ad+8>>2]=_;c[ad+12>>2]=Z;c[ad+24>>2]=0;break}}}while(0);ad=c[485]|0;if(ad>>>0<=o>>>0){break}_=ad-o|0;c[485]=_;ad=c[488]|0;Q=ad;c[488]=Q+o;c[Q+(o+4)>>2]=_|1;c[ad+4>>2]=o|3;n=ad+8|0;return n|0}}while(0);c[(aV()|0)>>2]=12;n=0;return n|0}function b9(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;if((a|0)==0){return}b=a-8|0;d=b;e=c[486]|0;if(b>>>0<e>>>0){av()}f=c[a-4>>2]|0;g=f&3;if((g|0)==1){av()}h=f&-8;i=a+(h-8)|0;j=i;L1713:do{if((f&1|0)==0){k=c[b>>2]|0;if((g|0)==0){return}l=-8-k|0;m=a+l|0;n=m;o=k+h|0;if(m>>>0<e>>>0){av()}if((n|0)==(c[487]|0)){p=a+(h-4)|0;if((c[p>>2]&3|0)!=3){q=n;r=o;break}c[484]=o;c[p>>2]=c[p>>2]&-2;c[a+(l+4)>>2]=o|1;c[i>>2]=o;return}p=k>>>3;if(k>>>0<256){k=c[a+(l+8)>>2]|0;s=c[a+(l+12)>>2]|0;t=1968+(p<<1<<2)|0;do{if((k|0)!=(t|0)){if(k>>>0<e>>>0){av()}if((c[k+12>>2]|0)==(n|0)){break}av()}}while(0);if((s|0)==(k|0)){c[482]=c[482]&(1<<p^-1);q=n;r=o;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<e>>>0){av()}v=s+8|0;if((c[v>>2]|0)==(n|0)){u=v;break}av()}}while(0);c[k+12>>2]=s;c[u>>2]=k;q=n;r=o;break}t=m;p=c[a+(l+24)>>2]|0;v=c[a+(l+12)>>2]|0;do{if((v|0)==(t|0)){w=a+(l+20)|0;x=c[w>>2]|0;if((x|0)==0){y=a+(l+16)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break}else{B=z;C=y}}else{B=x;C=w}while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){B=x;C=w;continue}w=B+16|0;x=c[w>>2]|0;if((x|0)==0){break}else{B=x;C=w}}if(C>>>0<e>>>0){av()}else{c[C>>2]=0;A=B;break}}else{w=c[a+(l+8)>>2]|0;if(w>>>0<e>>>0){av()}x=w+12|0;if((c[x>>2]|0)!=(t|0)){av()}y=v+8|0;if((c[y>>2]|0)==(t|0)){c[x>>2]=v;c[y>>2]=w;A=v;break}else{av()}}}while(0);if((p|0)==0){q=n;r=o;break}v=a+(l+28)|0;m=2232+(c[v>>2]<<2)|0;do{if((t|0)==(c[m>>2]|0)){c[m>>2]=A;if((A|0)!=0){break}c[483]=c[483]&(1<<c[v>>2]^-1);q=n;r=o;break L1713}else{if(p>>>0<(c[486]|0)>>>0){av()}k=p+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[p+20>>2]=A}if((A|0)==0){q=n;r=o;break L1713}}}while(0);if(A>>>0<(c[486]|0)>>>0){av()}c[A+24>>2]=p;t=c[a+(l+16)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[486]|0)>>>0){av()}else{c[A+16>>2]=t;c[t+24>>2]=A;break}}}while(0);t=c[a+(l+20)>>2]|0;if((t|0)==0){q=n;r=o;break}if(t>>>0<(c[486]|0)>>>0){av()}else{c[A+20>>2]=t;c[t+24>>2]=A;q=n;r=o;break}}else{q=d;r=h}}while(0);d=q;if(d>>>0>=i>>>0){av()}A=a+(h-4)|0;e=c[A>>2]|0;if((e&1|0)==0){av()}do{if((e&2|0)==0){if((j|0)==(c[488]|0)){B=(c[485]|0)+r|0;c[485]=B;c[488]=q;c[q+4>>2]=B|1;if((q|0)==(c[487]|0)){c[487]=0;c[484]=0}if(B>>>0<=(c[489]|0)>>>0){return}cf(0)|0;return}if((j|0)==(c[487]|0)){B=(c[484]|0)+r|0;c[484]=B;c[487]=q;c[q+4>>2]=B|1;c[d+B>>2]=B;return}B=(e&-8)+r|0;C=e>>>3;L1819:do{if(e>>>0<256){u=c[a+h>>2]|0;g=c[a+(h|4)>>2]|0;b=1968+(C<<1<<2)|0;do{if((u|0)!=(b|0)){if(u>>>0<(c[486]|0)>>>0){av()}if((c[u+12>>2]|0)==(j|0)){break}av()}}while(0);if((g|0)==(u|0)){c[482]=c[482]&(1<<C^-1);break}do{if((g|0)==(b|0)){D=g+8|0}else{if(g>>>0<(c[486]|0)>>>0){av()}f=g+8|0;if((c[f>>2]|0)==(j|0)){D=f;break}av()}}while(0);c[u+12>>2]=g;c[D>>2]=u}else{b=i;f=c[a+(h+16)>>2]|0;t=c[a+(h|4)>>2]|0;do{if((t|0)==(b|0)){p=a+(h+12)|0;v=c[p>>2]|0;if((v|0)==0){m=a+(h+8)|0;k=c[m>>2]|0;if((k|0)==0){E=0;break}else{F=k;G=m}}else{F=v;G=p}while(1){p=F+20|0;v=c[p>>2]|0;if((v|0)!=0){F=v;G=p;continue}p=F+16|0;v=c[p>>2]|0;if((v|0)==0){break}else{F=v;G=p}}if(G>>>0<(c[486]|0)>>>0){av()}else{c[G>>2]=0;E=F;break}}else{p=c[a+h>>2]|0;if(p>>>0<(c[486]|0)>>>0){av()}v=p+12|0;if((c[v>>2]|0)!=(b|0)){av()}m=t+8|0;if((c[m>>2]|0)==(b|0)){c[v>>2]=t;c[m>>2]=p;E=t;break}else{av()}}}while(0);if((f|0)==0){break}t=a+(h+20)|0;u=2232+(c[t>>2]<<2)|0;do{if((b|0)==(c[u>>2]|0)){c[u>>2]=E;if((E|0)!=0){break}c[483]=c[483]&(1<<c[t>>2]^-1);break L1819}else{if(f>>>0<(c[486]|0)>>>0){av()}g=f+16|0;if((c[g>>2]|0)==(b|0)){c[g>>2]=E}else{c[f+20>>2]=E}if((E|0)==0){break L1819}}}while(0);if(E>>>0<(c[486]|0)>>>0){av()}c[E+24>>2]=f;b=c[a+(h+8)>>2]|0;do{if((b|0)!=0){if(b>>>0<(c[486]|0)>>>0){av()}else{c[E+16>>2]=b;c[b+24>>2]=E;break}}}while(0);b=c[a+(h+12)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[486]|0)>>>0){av()}else{c[E+20>>2]=b;c[b+24>>2]=E;break}}}while(0);c[q+4>>2]=B|1;c[d+B>>2]=B;if((q|0)!=(c[487]|0)){H=B;break}c[484]=B;return}else{c[A>>2]=e&-2;c[q+4>>2]=r|1;c[d+r>>2]=r;H=r}}while(0);r=H>>>3;if(H>>>0<256){d=r<<1;e=1968+(d<<2)|0;A=c[482]|0;E=1<<r;do{if((A&E|0)==0){c[482]=A|E;I=e;J=1968+(d+2<<2)|0}else{r=1968+(d+2<<2)|0;h=c[r>>2]|0;if(h>>>0>=(c[486]|0)>>>0){I=h;J=r;break}av()}}while(0);c[J>>2]=q;c[I+12>>2]=q;c[q+8>>2]=I;c[q+12>>2]=e;return}e=q;I=H>>>8;do{if((I|0)==0){K=0}else{if(H>>>0>16777215){K=31;break}J=(I+1048320|0)>>>16&8;d=I<<J;E=(d+520192|0)>>>16&4;A=d<<E;d=(A+245760|0)>>>16&2;r=14-(E|J|d)+(A<<d>>>15)|0;K=H>>>((r+7|0)>>>0)&1|r<<1}}while(0);I=2232+(K<<2)|0;c[q+28>>2]=K;c[q+20>>2]=0;c[q+16>>2]=0;r=c[483]|0;d=1<<K;do{if((r&d|0)==0){c[483]=r|d;c[I>>2]=e;c[q+24>>2]=I;c[q+12>>2]=q;c[q+8>>2]=q}else{if((K|0)==31){L=0}else{L=25-(K>>>1)|0}A=H<<L;J=c[I>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(H|0)){break}M=J+16+(A>>>31<<2)|0;E=c[M>>2]|0;if((E|0)==0){N=1414;break}else{A=A<<1;J=E}}if((N|0)==1414){if(M>>>0<(c[486]|0)>>>0){av()}else{c[M>>2]=e;c[q+24>>2]=J;c[q+12>>2]=q;c[q+8>>2]=q;break}}A=J+8|0;B=c[A>>2]|0;E=c[486]|0;if(J>>>0<E>>>0){av()}if(B>>>0<E>>>0){av()}else{c[B+12>>2]=e;c[A>>2]=e;c[q+8>>2]=B;c[q+12>>2]=J;c[q+24>>2]=0;break}}}while(0);q=(c[490]|0)-1|0;c[490]=q;if((q|0)==0){O=2384}else{return}while(1){q=c[O>>2]|0;if((q|0)==0){break}else{O=q+8|0}}c[490]=-1;return}function ca(a){a=a|0;return}function cb(a){a=a|0;return 1824|0}function cc(a){a=a|0;if((a|0)==0){return}b9(a);return}function cd(a){a=a|0;cc(a);return}function ce(a){a=a|0;cc(a);return}function cf(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;do{if((c[422]|0)==0){b=aA(8)|0;if((b-1&b|0)==0){c[424]=b;c[423]=b;c[425]=-1;c[426]=2097152;c[427]=0;c[593]=0;c[422]=(aL(0)|0)&-16^1431655768;break}else{av();return 0;return 0}}}while(0);if(a>>>0>=4294967232){d=0;return d|0}b=c[488]|0;if((b|0)==0){d=0;return d|0}e=c[485]|0;do{if(e>>>0>(a+40|0)>>>0){f=c[424]|0;g=$((((-40-a-1+e+f|0)>>>0)/(f>>>0)>>>0)-1|0,f)|0;h=b;i=2376;while(1){j=c[i>>2]|0;if(j>>>0<=h>>>0){if((j+(c[i+4>>2]|0)|0)>>>0>h>>>0){k=i;break}}j=c[i+8>>2]|0;if((j|0)==0){k=0;break}else{i=j}}if((c[k+12>>2]&8|0)!=0){break}i=aS(0)|0;h=k+4|0;if((i|0)!=((c[k>>2]|0)+(c[h>>2]|0)|0)){break}j=aS(-(g>>>0>2147483646?-2147483648-f|0:g)|0)|0;l=aS(0)|0;if(!((j|0)!=-1&l>>>0<i>>>0)){break}j=i-l|0;if((i|0)==(l|0)){break}c[h>>2]=(c[h>>2]|0)-j;c[590]=(c[590]|0)-j;h=c[488]|0;m=(c[485]|0)-j|0;j=h;n=h+8|0;if((n&7|0)==0){o=0}else{o=-n&7}n=m-o|0;c[488]=j+o;c[485]=n;c[j+(o+4)>>2]=n|1;c[j+(m+4)>>2]=40;c[489]=c[426];d=(i|0)!=(l|0)&1;return d|0}}while(0);if((c[485]|0)>>>0<=(c[489]|0)>>>0){d=0;return d|0}c[489]=-1;d=0;return d|0}function cg(a){a=a|0;var b=0,d=0,e=0;b=(a|0)==0?1:a;while(1){d=b8(b)|0;if((d|0)!=0){e=1501;break}a=(B=c[7568]|0,c[7568]=B+0,B);if((a|0)==0){break}a2[a&1]()}if((e|0)==1501){return d|0}d=aJ(4)|0;c[d>>2]=2616;at(d|0,3072,16);return 0}function ch(a){a=a|0;return cg(a)|0}function ci(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function cj(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function ck(a,b,c){a=a|0;b=b|0;c=c|0;var e=0,f=0,g=0;while((e|0)<(c|0)){f=d[a+e|0]|0;g=d[b+e|0]|0;if((f|0)!=(g|0))return((f|0)>(g|0)?1:-1)|0;e=e+1|0}return 0}function cl(a){a=a|0;if((a|0)<65)return a|0;if((a|0)>90)return a|0;return a-65+97|0}function cm(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+e|0;if((e|0)>=20){d=d&255;e=b&3;g=d|d<<8|d<<16|d<<24;h=f&~3;if(e){e=b+4-e|0;while((b|0)<(e|0)){a[b]=d;b=b+1|0}}while((b|0)<(h|0)){c[b>>2]=g;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}}function cn(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;a_[a&7](b|0,c|0,d|0,e|0,f|0)}function co(a,b){a=a|0;b=b|0;a$[a&31](b|0)}function cp(a,b){a=a|0;b=b|0;return a0[a&7](b|0)|0}function cq(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return a1[a&3](b|0,c|0,d|0)|0}function cr(a){a=a|0;a2[a&1]()}function cs(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;a3[a&7](b|0,c|0,d|0,e|0,f|0,g|0)}function ct(a,b,c){a=a|0;b=b|0;c=c|0;return a4[a&7](b|0,c|0)|0}function cu(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;a5[a&7](b|0,c|0,d|0,e|0)}function cv(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;aa(0)}function cw(a){a=a|0;aa(1)}function cx(a){a=a|0;aa(2);return 0}function cy(a,b,c){a=a|0;b=b|0;c=c|0;aa(3);return 0}function cz(){aa(4)}function cA(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;aa(5)}function cB(a,b){a=a|0;b=b|0;aa(6);return 0}function cC(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;aa(7)}
// EMSCRIPTEN_END_FUNCS
var a_=[cv,cv,b6,cv,b2,cv,cv,cv];var a$=[cw,cw,by,cw,ce,cw,br,cw,bZ,cw,bY,cw,bO,cw,bX,cw,ca,cw,bN,cw,bP,cw,bW,cw,bV,cw,b_,cw,bQ,cw,cw,cw];var a0=[cx,cx,cb,cx,bS,cx,cx,cx];var a1=[cy,cy,b$,cy];var a2=[cz,cz];var a3=[cA,cA,b7,cA,b3,cA,cA,cA];var a4=[cB,cB,bR,cB,bq,cB,cB,cB];var a5=[cC,cC,b1,cC,b4,cC,cC,cC];return{_hm5move:bo,_strlen:cj,_free:b9,_memcmp:ck,_tolower:cl,_memset:cm,_getVisitedNodes:bm,_malloc:b8,_memcpy:ci,stackAlloc:a6,stackSave:a7,stackRestore:a8,setThrew:a9,setTempRet0:bc,setTempRet1:bd,setTempRet2:be,setTempRet3:bf,setTempRet4:bg,setTempRet5:bh,setTempRet6:bi,setTempRet7:bj,setTempRet8:bk,setTempRet9:bl,dynCall_viiiii:cn,dynCall_vi:co,dynCall_ii:cp,dynCall_iiii:cq,dynCall_v:cr,dynCall_viiiiii:cs,dynCall_iii:ct,dynCall_viiii:cu}})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_viiiii": invoke_viiiii, "invoke_vi": invoke_vi, "invoke_ii": invoke_ii, "invoke_iiii": invoke_iiii, "invoke_v": invoke_v, "invoke_viiiiii": invoke_viiiiii, "invoke_iii": invoke_iii, "invoke_viiii": invoke_viiii, "_llvm_lifetime_end": _llvm_lifetime_end, "_rand": _rand, "_sscanf": _sscanf, "_snprintf": _snprintf, "__scanString": __scanString, "___cxa_free_exception": ___cxa_free_exception, "___cxa_throw": ___cxa_throw, "__isFloat": __isFloat, "_abort": _abort, "_fprintf": _fprintf, "_llvm_eh_exception": _llvm_eh_exception, "_printf": _printf, "__reallyNegative": __reallyNegative, "_sysconf": _sysconf, "_clock": _clock, "___setErrNo": ___setErrNo, "_fwrite": _fwrite, "_send": _send, "_write": _write, "_llvm_umul_with_overflow_i32": _llvm_umul_with_overflow_i32, "_sprintf": _sprintf, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "___cxa_allocate_exception": ___cxa_allocate_exception, "__formatString": __formatString, "_time": _time, "_llvm_uadd_with_overflow_i32": _llvm_uadd_with_overflow_i32, "___cxa_does_inherit": ___cxa_does_inherit, "_ceil": _ceil, "___assert_func": ___assert_func, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "_pwrite": _pwrite, "_sbrk": _sbrk, "___cxa_call_unexpected": ___cxa_call_unexpected, "_floor": _floor, "___errno_location": ___errno_location, "___gxx_personality_v0": ___gxx_personality_v0, "_llvm_lifetime_start": _llvm_lifetime_start, "___cxa_is_number_type": ___cxa_is_number_type, "___resumeException": ___resumeException, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity, "__ZTVN10__cxxabiv120__si_class_type_infoE": __ZTVN10__cxxabiv120__si_class_type_infoE, "__ZTVN10__cxxabiv117__class_type_infoE": __ZTVN10__cxxabiv117__class_type_infoE }, buffer);
var _hm5move = Module["_hm5move"] = asm["_hm5move"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _memcmp = Module["_memcmp"] = asm["_memcmp"];
var _tolower = Module["_tolower"] = asm["_tolower"];
var _memset = Module["_memset"] = asm["_memset"];
var _getVisitedNodes = Module["_getVisitedNodes"] = asm["_getVisitedNodes"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];
Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
Module['callMain'] = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(!Module['preRun'] || Module['preRun'].length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  var ret;
  var initialStackTop = STACKTOP;
  try {
    ret = Module['_main'](argc, argv, 0);
  }
  catch(e) {
    if (e.name == 'ExitStatus') {
      return e.status;
    } else if (e == 'SimulateInfiniteLoop') {
      Module['noExitRuntime'] = true;
    } else {
      throw e;
    }
  } finally {
    STACKTOP = initialStackTop;
  }
  return ret;
}
function run(args) {
  args = args || Module['arguments'];
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return 0;
  }
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    var toRun = Module['preRun'];
    Module['preRun'] = [];
    for (var i = toRun.length-1; i >= 0; i--) {
      toRun[i]();
    }
    if (runDependencies > 0) {
      // a preRun added a dependency, run will be called later
      return 0;
    }
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    var ret = 0;
    calledRun = true;
    if (Module['_main'] && shouldRunNow) {
      ret = Module['callMain'](args);
      if (!Module['noExitRuntime']) {
        exitRuntime();
      }
    }
    if (Module['postRun']) {
      if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
      while (Module['postRun'].length > 0) {
        Module['postRun'].pop()();
      }
    }
    return ret;
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
    return 0;
  } else {
    return doRun();
  }
}
Module['run'] = Module.run = run;
// {{PRE_RUN_ADDITIONS}}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
  // {{MODULE_ADDITIONS}}
var hm5move = Module.cwrap('hm5move', 'string', ['string', 'number'])
var getVisitedNodes = Module.cwrap('getVisitedNodes', 'number')
function isValidPath(path) {
  return path.search(/^((----|[1-9a-e]{2}[a-u][0-7])\/?)*$/) >= 0;
}
function limit(level) {
  switch (level) {
  case 2:
    return 3000;
  case 3:
    return 10000;
  }
  return 1000;
}  
addEventListener('message', function(e) {
  var path = e.data.path;
  var level = e.data.level;
  if (isValidPath(path)) {
    var start = Date.now();
    var move = hm5move(path, limit(level));
    var elapsed = (Date.now() - start) / 1000;
    postMessage({'move': move, 'nps': getVisitedNodes() / elapsed});
  } else {
    postMessage({'move': "XXXX invalid path"});
  }
});
