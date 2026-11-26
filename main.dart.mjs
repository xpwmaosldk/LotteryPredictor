// Compiles a dart2wasm-generated main module from `source` which can then
// be instantiated via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string'], importedStringConstants: ''};
  return new CompiledApp(
      await _compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm module from `bytes` which is then
// instantiable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string'], importedStringConstants: ''};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

let _isCompileStreamingSupported;
async function _compileStreaming(source, builtins) {
  _isCompileStreamingSupported ??= WebAssembly.compileStreaming(
    new Response(
      new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,2,23,1,14,119,97,115,109,58,106,115,45,115,116,114,105,110,103,4,99,97,115,116,0,0]),
      {headers: {'Content-Type': 'application/wasm'}},
    ),
    builtins,
  ).then(() => false, (e) => e instanceof WebAssembly.CompileError);
  if (await _isCompileStreamingSupported) {
    return WebAssembly.compileStreaming(source, builtins);
  }
  return WebAssembly.compile(await (await source).arrayBuffer(), builtins);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredModules` is a JS function that takes an array of module names
  //   matching wasm files produced by the dart2wasm compiler. It also takes a
  //   callback that should be invoked for each loaded module with 2 arguments:
  //   (1) the module name, (2) the loaded module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The callback
  //   returns a Promise that resolves when the module is instantiated.
  //   loadDeferredModules should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  // `loadDeferredId` is a JS function that takes load ID produced by the
  //   compiler when the `use-load-ids` option is passed. Each load ID maps to
  //   one or more wasm files as specified in the emitted JSON file. It also
  //   takes a callback that should be invoked for each loaded module with 2
  //   arguments: (1) the module name, (2) the loaded module in a format
  //   supported by `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  //   The callback returns a Promise that resolves when the module is
  //   instantiated.
  //   loadDeferredId should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  async instantiate(additionalImports, {loadDeferredModules, loadDeferredId} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + value;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {
            AB: b => !!b,
      AC: Function.prototype.call.bind(DataView.prototype.setInt16),
      AD: x0 => x0.height,
      AE: x0 => x0.computedStyleMap(),
      AF: x0 => x0.clientX,
      AG: x0 => x0.state,
      AH: x0 => x0.readText(),
      AI: x0 => x0.deref(),
      AJ: x0 => x0.result,
      AK: (x0,x1) => { x0.spellcheck = x1 },
      AL: x0 => x0.deviceId,
      AM: (x0,x1) => { x0.async = x1 },
      AN: () => globalThis._flutter,
      B: s => printToConsole(s),
      BB: () => globalThis.document,
      BC: Function.prototype.call.bind(DataView.prototype.setUint16),
      BD: x0 => x0.width,
      BE: (x0,x1) => x0.get(x1),
      BF: x0 => x0.changedTouches,
      BG: (x0,x1) => x0.go(x1),
      BH: x0 => x0.clipboard,
      BI: () => globalThis.WeakRef,
      BJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      BK: (x0,x1) => { x0.disabled = x1 },
      BL: x0 => x0.getCapabilities(),
      BM: (x0,x1) => { x0.id = x1 },
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CC: Function.prototype.call.bind(DataView.prototype.setUint8),
      CD: x0 => x0.screen,
      CE: (o, p) => p in o,
      CF: x0 => x0.key,
      CG: (x0,x1) => x0.querySelectorAll(x1),
      CH: (x0,x1) => x0.writeText(x1),
      CI: (a, i) => a.splice(i, 1),
      CJ: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      CK: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9) => x0.drawImage(x1,x2,x3,x4,x5,x6,x7,x8,x9),
      CL: () => ({}),
      CM: x0 => x0.videoHeight,
      D: Function.prototype.call.bind(BigInt.prototype.toString),
      DB: (x0,x1) => x0.focus(x1),
      DC: Function.prototype.call.bind(DataView.prototype.setInt8),
      DD: o => {
        if (o === null || o === undefined) return 0;
        if (typeof(o) === 'string') return 1;
        return 2;
      },
      DE: (x0,x1) => { x0.textContent = x1 },
      DF: x0 => x0.identifier,
      DG: (x0,x1) => x0.requestAnimationFrame(x1),
      DH: x0 => x0.unlock(),
      DI: a => a.pop(),
      DJ: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      DK: (x0,x1) => x0.getContext(x1),
      DL: (x0,x1) => x0.applyConstraints(x1),
      DM: x0 => x0.videoWidth,
      E: (exn) => {
        let stackString = exn.toString();
        let frames = stackString.split('\n');
        let drop = 4;
        if (frames[0].startsWith('Error')) {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      EB: () => ({}),
      EC: Function.prototype.call.bind(DataView.prototype.getInt8),
      ED: x0 => x0.tabIndex,
      EE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      EF: x0 => x0.touches,
      EG: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      EH: (x0,x1) => x0.lock(x1),
      EI: x0 => x0.abort(),
      EJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      EK: (x0,x1) => { x0.height = x1 },
      EL: (x0,x1) => { x0.whiteBalanceMode = x1 },
      EM: x0 => x0.stream,
      F: () => new Error().stack,
      FB: (o, p, v) => o[p] = v,
      FC: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int8Array) return 1;
        return 2;
      },
      FD: (x0,x1) => x0.contains(x1),
      FE: x0 => x0.matches,
      FF: x0 => x0.pressure,
      FG: x0 => x0.now(),
      FH: x0 => x0.orientation,
      FI: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      FJ: () => new XMLHttpRequest(),
      FK: (x0,x1) => { x0.width = x1 },
      FL: x0 => x0.whiteBalanceMode,
      FM: x0 => x0.play(),
      G: s => JSON.stringify(s),
      GB: () => [],
      GC: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      GD: x0 => x0.activeElement,
      GE: (x0,x1) => x0.matchMedia(x1),
      GF: x0 => x0.tiltY,
      GG: x0 => x0.performance,
      GH: (x0,x1) => x0.querySelector(x1),
      GI: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      GJ: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      GK: x0 => x0.canvasKitMaximumSurfaces,
      GL: (x0,x1) => { x0.exposureMode = x1 },
      GM: x0 => x0.paused,
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (a, i) => a.push(i),
      HC: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      HD: x0 => x0.parentNode,
      HE: x0 => x0.matches,
      HF: x0 => x0.tiltX,
      HG: (d, digits) => d.toFixed(digits),
      HH: (x0,x1) => { x0.title = x1 },
      HI: () => new AbortController(),
      HJ: x0 => x0.send(),
      HK: x0 => x0.hostElement,
      HL: x0 => x0.exposureMode,
      HM: (x0,x1,x2,x3) => x0.drawImage(x1,x2,x3),
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: x0 => new Int8Array(x0),
      IC: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      ID: x0 => x0.tagName,
      IE: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      IF: x0 => x0.pointerType,
      IG: x0 => x0.maxHeight,
      IH: (x0,x1) => x0.vibrate(x1),
      II: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      IJ: x0 => x0.type,
      IK: x0 => x0.location,
      IL: (x0,x1) => { x0.focusMode = x1 },
      IM: (x0,x1,x2,x3,x4) => x0.getImageData(x1,x2,x3,x4),
      J: (s, p, i) => s.lastIndexOf(p, i),
      JB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      JC: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      JD: x0 => x0.target,
      JE: f => f.dartFunction,
      JF: x0 => x0.pointerId,
      JG: x0 => x0.maxWidth,
      JH: x0 => x0.arrayBuffer(),
      JI: (x0,x1) => globalThis.fetch(x0,x1),
      JJ: x0 => x0.response,
      JK: (x0,x1) => x0.getModifierState(x1),
      JL: x0 => x0.focusMode,
      JM: (x0,x1,x2) => x0.readBarcodes(x1,x2),
      K: o => o,
      KB: x0 => new Uint8Array(x0),
      KC: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      KD: x0 => x0.clientY,
      KE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      KF: x0 => x0.getCoalescedEvents(),
      KG: x0 => x0.minHeight,
      KH: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      KI: (x0,x1) => x0.get(x1),
      KJ: (x0,x1) => { x0.responseType = x1 },
      KK: x0 => x0.metaKey,
      KL: x0 => x0.enumerateDevices(),
      KM: x0 => x0.text,
      L: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'number') return 1;
        return 2;
      },
      LB: x0 => new Uint8ClampedArray(x0),
      LC: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      LD: x0 => x0.clientX,
      LE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      LF: s => s.trimLeft(),
      LG: x0 => x0.minWidth,
      LH: x0 => x0.status,
      LI: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      LJ: x0 => x0.vendor,
      LK: x0 => x0.altKey,
      LL: x0 => x0.deviceId,
      LM: x0 => x0.format,
      M: x0 => x0.index,
      MB: x0 => new Int16Array(x0),
      MC: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      MD: (x0,x1,x2) => x0.addEventListener(x1,x2),
      ME: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      MF: s => s.toUpperCase(),
      MG: (x0,x1) => x0.removeProperty(x1),
      MH: (x0,x1) => x0.fetch(x1),
      MI: (x0,x1) => x0.forEach(x1),
      MJ: x0 => x0.navigator,
      MK: x0 => x0.ctrlKey,
      ML: x0 => x0.kind,
      MM: x0 => x0.bytes,
      N: o => String(o),
      NB: x0 => new Uint16Array(x0),
      NC: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      ND: (x0,x1,x2) => x0.setAttribute(x1,x2),
      NE: (o, i) => o[i],
      NF: x0 => x0.pop(),
      NG: (x0,x1) => x0.add(x1),
      NH: x0 => x0.content,
      NI: x0 => x0.name,
      NJ: l => new DataView(new ArrayBuffer(l)),
      NK: x0 => x0.isComposing,
      NL: x0 => x0.mediaDevices,
      NM: x0 => x0.y,
      O: o => o === undefined,
      OB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI16ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      OC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      OD: (x0,x1) => x0.closest(x1),
      OE: o => o.length,
      OF: x0 => x0.flags,
      OG: x0 => x0.data,
      OH: x0 => x0.document,
      OI: x0 => x0.statusText,
      OJ: x0 => globalThis.URL.createObjectURL(x0),
      OK: x0 => x0.code,
      OL: x0 => x0.facingMode,
      OM: x0 => x0.x,
      P: (x0,x1) => x0.exec(x1),
      PB: x0 => new Int32Array(x0),
      PC: (x0,x1) => x0.querySelector(x1),
      PD: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      PE: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        // Feature check for `SharedArrayBuffer` before doing a type-check.
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
            return 17;
        }
        if (o instanceof Promise) return 18;
        return 19;
      },
      PF: (a, s) => a.join(s),
      PG: (x0,x1) => x0.removeAttribute(x1),
      PH: () => typeof dartUseDateNowForTicks !== "undefined",
      PI: x0 => x0.url,
      PJ: x0 => ({type: x0}),
      PK: x0 => x0.repeat,
      PL: x0 => x0.mediaDevices,
      PM: x0 => x0.bottomLeft,
      Q: (x0,x1) => { x0.lastIndex = x1 },
      QB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      QC: (x0,x1) => x0.item(x1),
      QD: (handle) => clearTimeout(handle),
      QE: x0 => x0.language,
      QF: (x0,x1) => x0.error(x1),
      QG: (x0,x1) => { x0.value = x1 },
      QH: () => Date.now(),
      QI: x0 => x0.status,
      QJ: (x0,x1) => new Blob(x0,x1),
      QK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      QL: () => globalThis.BarcodeDetector.getSupportedFormats(),
      QM: x0 => x0.bottomRight,
      R: o => o,
      RB: x0 => new Uint32Array(x0),
      RC: x0 => x0.length,
      RD: x0 => x0.maxTouchPoints,
      RE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      RF: () => globalThis.console,
      RG: (x0,x1) => { x0.value = x1 },
      RH: () => 1000 * performance.now(),
      RI: x0 => x0.getReader(),
      RJ: () => ({}),
      RK: x0 => x0.message,
      RL: (x0,x1) => x0.call(x1),
      RM: x0 => x0.topRight,
      S: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      SB: x0 => new Float32Array(x0),
      SC: (x0,x1) => x0.querySelectorAll(x1),
      SD: x0 => x0.platform,
      SE: () => globalThis.window.FinalizationRegistry,
      SF: s => s.trimRight(),
      SG: x0 => x0.value,
      SH: x0 => new Uint8Array(x0),
      SI: x0 => x0.read(),
      SJ: (x0,x1,x2) => new File(x0,x1,x2),
      SK: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      SL: x0 => x0.reset,
      SM: x0 => x0.topLeft,
      T: o => o instanceof RegExp,
      TB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      TC: (x0,x1) => x0.getAttribute(x1),
      TD: s => new Date(s * 1000).getTimezoneOffset() * 60,
      TE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      TF: x0 => x0.blur(),
      TG: x0 => x0.selectionDirection,
      TH: (x0,x1,x2) => x0.slice(x1,x2),
      TI: x0 => x0.value,
      TJ: (x0,x1) => ({files: x0,title: x1}),
      TK: (o, a) => o + a,
      TL: x0 => x0.stopContinuousDecode,
      TM: x0 => x0.position,
      U: (string, times) => string.repeat(times),
      UB: x0 => new Float64Array(x0),
      UC: x0 => x0.remove(),
      UD: Date.now,
      UE: x0 => new window.FinalizationRegistry(x0),
      UF: x0 => x0.button,
      UG: x0 => x0.selectionStart,
      UH: (x0,x1) => x0.decode(x1),
      UI: x0 => x0.done,
      UJ: (x0,x1) => x0.canShare(x1),
      UK: x0 => x0.children,
      UL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      UM: x0 => x0.isValid,
      V: o => o,
      VB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      VC: (x0,x1) => x0.appendChild(x1),
      VD: (x0,x1) => x0.contains(x1),
      VE: (x0,x1) => x0.unregister(x1),
      VF: (x0,x1) => x0.prepend(x1),
      VG: x0 => x0.selectionEnd,
      VH: (x0,x1) => x0.adoptText(x1),
      VI: x0 => x0.cancel(),
      VJ: (x0,x1) => x0.share(x1),
      VK: (x0,x1,x2) => ({files: x0,title: x1,text: x2}),
      VL: (x0,x1,x2,x3) => x0.call(x1,x2,x3),
      VM: (x0,x1,x2,x3) => ({formats: x0,tryHarder: x1,tryRotate: x2,tryInvert: x3}),
      W: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'boolean') return 1;
        return 2;
      },
      WB: x0 => new ArrayBuffer(x0),
      WC: (x0,x1) => x0.append(x1),
      WD: (decoder, codeUnits) => decoder.decode(codeUnits),
      WE: x0 => x0.preventDefault(),
      WF: x0 => x0.parentElement,
      WG: x0 => x0.value,
      WH: x0 => x0.first(),
      WI: x0 => x0.body,
      WJ: () => ({}),
      WK: (x0,x1) => ({files: x0,text: x1}),
      WL: x0 => x0.text,
      WM: (x0,x1,x2) => ({tryHarder: x0,tryRotate: x1,tryInvert: x2}),
      X: x0 => x0.dotAll,
      XB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      XC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      XD: () => new TextDecoder("utf-8", {fatal: true}),
      XE: x0 => x0.parent,
      XF: x0 => x0.innerHeight,
      XG: x0 => x0.selectionDirection,
      XH: x0 => x0.next(),
      XI: x0 => x0.headers,
      XJ: (x0,x1) => x0.createElement(x1),
      XK: x0 => ({files: x0}),
      XL: x0 => x0.barcodeFormat,
      XM: () => globalThis.ZXingWASM,
      Y: x0 => x0.unicode,
      YB: (x0,x1,x2) => new DataView(x0,x1,x2),
      YC: x0 => x0.style,
      YD: () => new TextDecoder("utf-8", {fatal: false}),
      YE: x0 => x0.timeStamp,
      YF: x0 => x0.innerWidth,
      YG: x0 => x0.selectionStart,
      YH: x0 => x0.current(),
      YI: x0 => x0.signal,
      YJ: (x0,x1) => x0.appendChild(x1),
      YK: (x0,x1) => ({title: x0,text: x1}),
      YL: x0 => x0.rawBytes,
      YM: (x0,x1) => { x0.height = x1 },
      Z: x0 => x0.ignoreCase,
      ZB: (o, p) => o[p],
      ZC: x0 => x0.debugShowSemanticsNodes,
      ZD: (a, i, v) => a[i] = v,
      ZE: (x0,x1) => x0.hasAttribute(x1),
      ZF: x0 => x0.height,
      ZG: x0 => x0.selectionEnd,
      ZH: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      ZI: (x0,x1,x2,x3) => x0.putImageData(x1,x2,x3),
      ZJ: x0 => x0.click(),
      ZK: x0 => ({text: x0}),
      ZL: x0 => x0.y,
      ZM: (x0,x1) => { x0.width = x1 },
      a: x0 => x0.multiline,
      aB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      aC: (x0,x1) => x0.warn(x1),
      aD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      aE: x0 => x0.type,
      aF: x0 => x0.width,
      aG: (x0,x1) => { x0.name = x1 },
      aH: x0 => x0.v8BreakIterator,
      aI: x0 => x0.arrayBuffer(),
      aJ: x0 => x0.remove(),
      aK: x0 => x0.nextSibling,
      aL: x0 => x0.x,
      aM: x0 => x0.height,
      b: (exn) => {
        if (exn instanceof Error) {
          return exn.stack;
        } else {
          return null;
        }
      },
      bB: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      bC: x0 => x0.console,
      bD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI16ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      bE: (x0,x1) => x0.getModifierState(x1),
      bF: x0 => x0.clientHeight,
      bG: (x0,x1) => { x0.placeholder = x1 },
      bH: () => globalThis.Intl,
      bI: (x0,x1) => x0.transferFromImageBitmap(x1),
      bJ: x0 => globalThis.URL.revokeObjectURL(x0),
      bK: (x0,x1) => x0.debug(x1),
      bL: x0 => x0.resultPoints,
      bM: x0 => x0.width,
      c: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      cB: o => o.byteOffset,
      cC: () => globalThis.window,
      cD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      cE: x0 => x0.buttons,
      cF: x0 => x0.clientWidth,
      cG: (x0,x1) => { x0.autocomplete = x1 },
      cH: (x0,x1) => x0.segment(x1),
      cI: x0 => x0.height,
      cJ: x0 => x0.body,
      cK: x0 => x0.getTracks(),
      cL: x0 => x0.message,
      cM: (x0,x1) => { x0.srcObject = x1 },
      d: (x0,x1) => x0.didCreateEngineInitializer(x1),
      dB: o => o.buffer,
      dC: (o, c) => o instanceof c,
      dD: (s) => +s,
      dE: x0 => x0.ctrlKey,
      dF: x0 => x0.isConnected,
      dG: (x0,x1) => { x0.type = x1 },
      dH: x0 => x0.index,
      dI: x0 => x0.width,
      dJ: (x0,x1) => { x0.display = x1 },
      dK: x0 => x0.stop(),
      dL: x0 => x0.videoElement,
      dM: x0 => ({willReadFrequently: x0}),
      e: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      eB: Function.prototype.call.bind(DataView.prototype.getUint8),
      eC: (x0,x1) => x0[x1],
      eD: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      eE: x0 => x0.getBoundingClientRect(),
      eF: x0 => x0.head,
      eG: (x0,x1) => { x0.name = x1 },
      eH: x0 => x0.next(),
      eI: x0 => x0.rasterEndMilliseconds,
      eJ: x0 => x0.style,
      eK: (x0,x1) => { x0.transform = x1 },
      eL: x0 => x0.decodeContinuously,
      eM: (x0,x1,x2) => x0.getContext(x1,x2),
      f: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      fB: (b, o) => new DataView(b, o),
      fC: x0 => x0.length,
      fD: s => s.trim(),
      fE: x0 => x0.y,
      fF: (x0,x1) => { x0.content = x1 },
      fG: (x0,x1) => { x0.placeholder = x1 },
      fH: x0 => x0.value,
      fI: x0 => x0.rasterStartMilliseconds,
      fJ: (x0,x1) => { x0.download = x1 },
      fK: x0 => x0.getVideoTracks(),
      fL: (x0,x1) => new ZXing.BrowserMultiFormatReader(x0,x1),
      fM: () => new BarcodeDetector(),
      g: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      gB: (b, o, l) => new DataView(b, o, l),
      gC: (string, token) => string.split(token),
      gD: x0 => x0.classList,
      gE: x0 => x0.x,
      gF: (x0,x1) => { x0.name = x1 },
      gG: (x0,x1) => { x0.scrollTop = x1 },
      gH: x0 => x0.done,
      gI: x0 => x0.imageBitmaps,
      gJ: (x0,x1) => { x0.href = x1 },
      gK: x0 => x0.getSettings(),
      gL: (x0,x1) => ({width: x0,height: x1}),
      gM: x0 => ({formats: x0}),
      h: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      hB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      hC: o => o instanceof Array,
      hD: x0 => x0.relatedTarget,
      hE: x0 => x0.top,
      hF: (x0,x1) => x0.removeChild(x1),
      hG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      hH: (o, m, a) => o[m].apply(o, a),
      hI: (x0,x1) => { x0.height = x1 },
      hJ: () => globalThis.document,
      hK: x0 => x0.facingMode,
      hL: (x0,x1,x2) => ({width: x0,height: x1,facingMode: x2}),
      hM: x0 => new BarcodeDetector(x0),
      i: x0 => new Promise(x0),
      iB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float64Array) return 1;
        return 2;
      },
      iC: (a, i) => a[i],
      iD: x0 => x0.hasFocus(),
      iE: x0 => x0.left,
      iF: x0 => x0.firstChild,
      iG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      iH: x0 => x0.iterator,
      iI: (x0,x1) => { x0.width = x1 },
      iJ: (x0,x1) => { x0.type = x1 },
      iK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      iL: x0 => x0.facingMode,
      iM: (x0,x1) => x0.detect(x1),
      j: (x0,x1,x2) => x0.call(x1,x2),
      jB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      jC: a => a.length,
      jD: x0 => x0.shiftKey,
      jE: x0 => x0.scrollTop,
      jF: x0 => x0.viewConstraints,
      jG: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      jH: () => globalThis.Symbol,
      jI: x0 => x0.convertToBlob(),
      jJ: x0 => x0.userAgent,
      jK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      jL: x0 => x0.height,
      jM: x0 => x0.rawValue,
      k: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      kB: (t, s) => t.set(s),
      kC: (x0,x1) => x0.test(x1),
      kD: x0 => x0.body,
      kE: x0 => x0.offsetTop,
      kF: x0 => x0.hostElement,
      kG: x0 => x0.keyCode,
      kH: (x0,x1) => new Intl.Segmenter(x0,x1),
      kI: (x0,x1,x2) => new ImageData(x0,x1,x2),
      kJ: (x0,x1) => x0.removeItem(x1),
      kK: (x0,x1) => x0.append(x1),
      kL: x0 => x0.width,
      kM: x0 => x0.format,
      l: x0 => new Array(x0),
      lB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      lC: x0 => x0.userAgent,
      lD: x0 => x0.visibilityState,
      lE: x0 => x0.scrollLeft,
      lF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      lG: (x0,x1) => x0.scrollIntoView(x1),
      lH: x0 => x0.Segmenter,
      lI: (x0,x1) => x0.getContext(x1),
      lJ: (x0,x1) => x0.key(x1),
      lK: (x0,x1) => { x0.onpause = x1 },
      lL: x0 => x0.attachStreamToVideo,
      lM: x0 => x0.y,
      m: o => [o],
      mB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      mC: x0 => x0.navigator,
      mD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      mE: x0 => x0.offsetLeft,
      mF: x0 => ({runApp: x0}),
      mG: x0 => x0.multiViewEnabled,
      mH: x0 => x0.buffer,
      mI: (x0,x1) => new OffscreenCanvas(x0,x1),
      mJ: x0 => x0.length,
      mK: (x0,x1) => { x0.onplay = x1 },
      mL: () => new Map(),
      mM: x0 => x0.x,
      n: (o0, o1) => [o0, o1],
      nB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float32Array) return 1;
        return 2;
      },
      nC: Function.prototype.call.bind(String.prototype.toLowerCase),
      nD: x0 => x0.disconnect(),
      nE: x0 => x0.offsetParent,
      nF: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      nG: (x0,x1) => x0.replaceWith(x1),
      nH: x0 => x0.wasmMemory,
      nI: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      nJ: (x0,x1) => x0.getItem(x1),
      nK: (x0,x1) => { x0.controls = x1 },
      nL: (x0,x1,x2) => x0.set(x1,x2),
      nM: x0 => x0.cornerPoints,
      o: (o0, o1, o2) => [o0, o1, o2],
      oB: Function.prototype.call.bind(DataView.prototype.getUint32),
      oC: Object.is,
      oD: x0 => new Intl.Locale(x0),
      oE: x0 => x0.offsetY,
      oF: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      oG: (x0,x1) => { x0.className = x1 },
      oH: () => globalThis.window._flutter_skwasmInstance,
      oI: (a, s, e) => a.slice(s, e),
      oJ: (o, p) => p in o,
      oK: (x0,x1) => { x0.pointerEvents = x1 },
      oL: (x0,x1) => x0.querySelector(x1),
      oM: x0 => x0.extraAssets,
      p: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      pB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint32Array) return 1;
        return 2;
      },
      pC: x0 => x0.vendor,
      pD: x0 => x0.region,
      pE: x0 => x0.offsetX,
      pF: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      pG: (x0,x1) => { x0.tabIndex = x1 },
      pH: () => new TextDecoder(),
      pI: (x0,x1,x2) => x0.setItem(x1,x2),
      pJ: x0 => x0.groups,
      pK: (x0,x1) => { x0.transformOrigin = x1 },
      pL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      pM: x0 => x0.fontManifest,
      q: (x0,x1,x2) => { x0[x1] = x2 },
      qB: Function.prototype.call.bind(DataView.prototype.getInt32),
      qC: (x0,x1) => x0.createTextNode(x1),
      qD: x0 => x0.script,
      qE: (o, p, r) => o.replace(p, () => r),
      qF: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      qG: (x0,x1) => { x0.action = x1 },
      qH: (map, o, v) => map.set(o, v),
      qI: x0 => x0.localStorage,
      qJ: (x0,x1,x2) => x0.insertBefore(x1,x2),
      qK: (x0,x1) => { x0.objectFit = x1 },
      qL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      qM: x0 => x0.assetManifest,
      r: (o, p) => o[p],
      rB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int32Array) return 1;
        return 2;
      },
      rC: (x0,x1) => { x0.id = x1 },
      rD: x0 => x0.language,
      rE: (o, p, r) => o.replaceAll(p, () => r),
      rF: x0 => x0.history,
      rG: (x0,x1) => { x0.method = x1 },
      rH: (map, o) => map.get(o),
      rI: () => globalThis.window,
      rJ: x0 => x0.id,
      rK: (x0,x1) => { x0.width = x1 },
      rL: x0 => x0.head,
      rM: x0 => x0.buildConfig,
      s: () => globalThis,
      sB: o => o instanceof Uint16Array,
      sC: (x0,x1) => { x0.nonce = x1 },
      sD: x0 => x0.languages,
      sE: x0 => x0.deltaMode,
      sF: x0 => x0.search,
      sG: (x0,x1) => { x0.noValidate = x1 },
      sH: () => new WeakMap(),
      sI: (x0,x1) => x0.getRandomValues(x1),
      sJ: x0 => x0.offsetHeight,
      sK: (x0,x1) => { x0.height = x1 },
      sL: (x0,x1) => { x0.onerror = x1 },
      sM: x0 => x0.length,
      t: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tB: Function.prototype.call.bind(DataView.prototype.getUint16),
      tC: x0 => x0.nonce,
      tD: (x0,x1) => x0.observe(x1),
      tE: x0 => x0.deltaY,
      tF: x0 => x0.location,
      tG: x0 => x0.click(),
      tH: x0 => x0.debugSkipFontRetryDelay,
      tI: () => globalThis.crypto,
      tJ: x0 => x0.offsetWidth,
      tK: x0 => x0.getSupportedConstraints(),
      tL: (x0,x1) => x0.removeChild(x1),
      tM: x0 => x0.getReader(),
      u: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uB: o => o instanceof Int16Array,
      uC: () => globalThis.window.flutterConfiguration,
      uD: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      uE: x0 => x0.deltaX,
      uF: x0 => x0.pathname,
      uG: (x0,x1) => x0.getElementsByClassName(x1),
      uH: (x0,x1,x2) => x0.set(x1,x2),
      uI: () => globalThis.cldKeepAwakeDisable(),
      uJ: x0 => x0.stopPropagation(),
      uK: x0 => ({ideal: x0}),
      uL: (x0,x1) => { x0.onload = x1 },
      uM: x0 => x0.value,
      v: (x0,x1) => ({addView: x0,removeView: x1}),
      vB: Function.prototype.call.bind(DataView.prototype.getInt16),
      vC: (x0,x1) => x0.attachShadow(x1),
      vD: x0 => new ResizeObserver(x0),
      vE: x0 => x0.wheelDeltaY,
      vF: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      vG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      vH: x0 => x0.fontFallbackBaseUrl,
      vI: () => globalThis.cldKeepAwakeEnable(),
      vJ: x0 => x0.disabled,
      vK: (x0,x1,x2) => ({width: x0,height: x1,deviceId: x2}),
      vL: (x0,x1) => { x0.src = x1 },
      vM: x0 => x0.done,
      w: (l, r) => l === r,
      wB: o => o instanceof Uint8ClampedArray,
      wC: (x0,x1) => x0.createElement(x1),
      wD: (x0,x1) => x0.getPropertyValue(x1),
      wE: x0 => x0.wheelDeltaX,
      wF: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      wG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      wH: (handle) => clearInterval(handle),
      wI: x0 => globalThis.cldOpenPaypalDonation(x0),
      wJ: (x0,x1) => { x0.min = x1 },
      wK: x0 => ({video: x0}),
      wL: (x0,x1) => { x0.crossOrigin = x1 },
      wM: x0 => x0.read(),
      x: x0 => x0.random(),
      xB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint8Array) return 1;
        return 2;
      },
      xC: x0 => x0.scale,
      xD: x0 => globalThis.parseFloat(x0),
      xE: x0 => x0.bottom,
      xF: o => Object.keys(o),
      xG: (x0,x1) => x0.dispatchEvent(x1),
      xH: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      xI: o => o.byteLength,
      xJ: (x0,x1) => { x0.max = x1 },
      xK: (x0,x1) => ({width: x0,height: x1}),
      xL: (x0,x1) => { x0.lang = x1 },
      xM: x0 => x0.body,
      y: () => globalThis.Math,
      yB: Function.prototype.call.bind(DataView.prototype.setInt32),
      yC: x0 => x0.visualViewport,
      yD: (x0,x1) => x0.getComputedStyle(x1),
      yE: x0 => x0.right,
      yF: x0 => x0.state,
      yG: (x0,x1) => x0.createEvent(x1),
      yH: () => Date.now(),
      yI: () => new FileReader(),
      yJ: (x0,x1) => { x0.disabled = x1 },
      yK: (x0,x1,x2) => ({width: x0,height: x1,facingMode: x2}),
      yL: (x0,x1) => { x0.type = x1 },
      yM: x0 => x0.assetBase,
      z: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      zB: Function.prototype.call.bind(DataView.prototype.setUint32),
      zC: x0 => x0.devicePixelRatio,
      zD: x0 => x0.documentElement,
      zE: x0 => x0.clientY,
      zF: x0 => x0.hash,
      zG: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      zH: x0 => new WeakRef(x0),
      zI: (x0,x1) => x0.readAsArrayBuffer(x1),
      zJ: (x0,x1) => { x0.scrollLeft = x1 },
      zK: (x0,x1) => x0.getUserMedia(x1),
      zL: (x0,x1) => { x0.defer = x1 },
      zM: x0 => x0.loader,

    };

    const baseImports = {
      _: dart2wasm,
      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
      WebAssembly: {
        JSTag: WebAssembly.JSTag,
      },
      "": new Proxy({}, { get(_, prop) { return prop; } }),

    };

    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}
