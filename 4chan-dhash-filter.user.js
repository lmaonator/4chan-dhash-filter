// ==UserScript==
// @name        4chan dHash image filter
// @namespace   https://github.com/lmaonator/4chan-dhash-filter
// @match       https://*.4chan.org/*
// @grant       GM_xmlhttpRequest
// @grant       GM_setValue
// @grant       GM_getValue
// @version     0.1.0
// @author      lmaonator
// @description A 4chan userscript to filter images based on dHash
// @downloadURL https://github.com/lmaonator/4chan-dhash-filter/raw/main/4chan-dhash-filter.user.js
// @homepageURL https://github.com/lmaonator/4chan-dhash-filter
// @supportURL  https://github.com/lmaonator/4chan-dhash-filter/issues
// ==/UserScript==

(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/@rgba-image/copy/dist/index.js
  var require_dist = __commonJS({
    "node_modules/@rgba-image/copy/dist/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.copy = void 0;
      var copy = (source, dest, sx = 0, sy = 0, sw = source.width - sx, sh = source.height - sy, dx = 0, dy = 0) => {
        sx = sx | 0;
        sy = sy | 0;
        sw = sw | 0;
        sh = sh | 0;
        dx = dx | 0;
        dy = dy | 0;
        if (sw <= 0 || sh <= 0)
          return;
        const sourceData = new Uint32Array(source.data.buffer);
        const destData = new Uint32Array(dest.data.buffer);
        for (let y = 0; y < sh; y++) {
          const sourceY = sy + y;
          if (sourceY < 0 || sourceY >= source.height)
            continue;
          const destY = dy + y;
          if (destY < 0 || destY >= dest.height)
            continue;
          for (let x = 0; x < sw; x++) {
            const sourceX = sx + x;
            if (sourceX < 0 || sourceX >= source.width)
              continue;
            const destX = dx + x;
            if (destX < 0 || destX >= dest.width)
              continue;
            const sourceIndex = sourceY * source.width + sourceX;
            const destIndex = destY * dest.width + destX;
            destData[destIndex] = sourceData[sourceIndex];
          }
        }
      };
      exports.copy = copy;
    }
  });

  // node_modules/@rgba-image/create-image/dist/index.js
  var require_dist2 = __commonJS({
    "node_modules/@rgba-image/create-image/dist/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.CreateImageFactory = (fill = [0, 0, 0, 0], channels = 4) => {
        channels = Math.floor(channels);
        if (isNaN(channels) || channels < 1) {
          throw TypeError("channels should be a positive non-zero number");
        }
        if (!("length" in fill) || fill.length < channels) {
          throw TypeError(`fill should be iterable with at least ${channels} members`);
        }
        fill = new Uint8ClampedArray(fill).slice(0, channels);
        const allZero = fill.every((v) => v === 0);
        const createImage = (width, height, data) => {
          if (width === void 0 || height === void 0) {
            throw TypeError("Not enough arguments");
          }
          width = Math.floor(width);
          height = Math.floor(height);
          if (isNaN(width) || width < 1 || isNaN(height) || height < 1) {
            throw TypeError("Index or size is negative or greater than the allowed amount");
          }
          const length = width * height * channels;
          if (data === void 0) {
            data = new Uint8ClampedArray(length);
          }
          if (data instanceof Uint8ClampedArray) {
            if (data.length !== length) {
              throw TypeError("Index or size is negative or greater than the allowed amount");
            }
            if (!allZero) {
              for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                  const index = (y * width + x) * channels;
                  for (let c = 0; c < channels; c++) {
                    data[index + c] = fill[c];
                  }
                }
              }
            }
            return {
              get width() {
                return width;
              },
              get height() {
                return height;
              },
              get data() {
                return data;
              }
            };
          }
          throw TypeError("Expected data to be Uint8ClampedArray or undefined");
        };
        return createImage;
      };
      exports.createImage = exports.CreateImageFactory();
    }
  });

  // node_modules/@rgba-image/lanczos/dist/filters.js
  var require_filters = __commonJS({
    "node_modules/@rgba-image/lanczos/dist/filters.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.filters = void 0;
      var fixedFracBits = 14;
      var filterValue = (x, a) => {
        if (x <= -a || x >= a)
          return 0;
        if (x == 0)
          return 0;
        const xPi = x * Math.PI;
        return Math.sin(xPi) / xPi * Math.sin(xPi / a) / (xPi / a);
      };
      var toFixedPoint = (value) => Math.round(value * ((1 << fixedFracBits) - 1));
      var filters = (srcSize, destSize, scale, offset, use2) => {
        const a = use2 ? 2 : 3;
        const scaleInverted = 1 / scale;
        const scaleClamped = Math.min(1, scale);
        const srcWindow = a / scaleClamped;
        const maxFilterElementSize = Math.floor((srcWindow + 1) * 2);
        const packedFilter = new Int16Array((maxFilterElementSize + 2) * destSize);
        let packedFilterPtr = 0;
        for (let destPixel = 0; destPixel < destSize; destPixel++) {
          const sourcePixel = (destPixel + 0.5) * scaleInverted + offset;
          const sourceFirst = Math.max(0, Math.floor(sourcePixel - srcWindow));
          const sourceLast = Math.min(srcSize - 1, Math.ceil(sourcePixel + srcWindow));
          const filterElementSize = sourceLast - sourceFirst + 1;
          const floatFilter = new Float32Array(filterElementSize);
          const fxpFilter = new Int16Array(filterElementSize);
          let total = 0;
          let index = 0;
          for (let pixel = sourceFirst; pixel <= sourceLast; pixel++) {
            const floatValue = filterValue((pixel + 0.5 - sourcePixel) * scaleClamped, a);
            total += floatValue;
            floatFilter[index] = floatValue;
            index++;
          }
          let filterTotal = 0;
          for (let index2 = 0; index2 < floatFilter.length; index2++) {
            const filterValue2 = floatFilter[index2] / total;
            filterTotal += filterValue2;
            fxpFilter[index2] = toFixedPoint(filterValue2);
          }
          fxpFilter[destSize >> 1] += toFixedPoint(1 - filterTotal);
          let leftNotEmpty = 0;
          while (leftNotEmpty < fxpFilter.length && fxpFilter[leftNotEmpty] === 0) {
            leftNotEmpty++;
          }
          let rightNotEmpty = fxpFilter.length - 1;
          while (rightNotEmpty > 0 && fxpFilter[rightNotEmpty] === 0) {
            rightNotEmpty--;
          }
          const filterShift = sourceFirst + leftNotEmpty;
          const filterSize = rightNotEmpty - leftNotEmpty + 1;
          packedFilter[packedFilterPtr++] = filterShift;
          packedFilter[packedFilterPtr++] = filterSize;
          packedFilter.set(fxpFilter.subarray(leftNotEmpty, rightNotEmpty + 1), packedFilterPtr);
          packedFilterPtr += filterSize;
        }
        return packedFilter;
      };
      exports.filters = filters;
    }
  });

  // node_modules/@rgba-image/lanczos/dist/convolve.js
  var require_convolve = __commonJS({
    "node_modules/@rgba-image/lanczos/dist/convolve.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.convolve = void 0;
      var fixedFracBits = 14;
      var convolve = (source, dest, sw, sh, dw, filters) => {
        let srcOffset = 0;
        let destOffset = 0;
        for (let sourceY = 0; sourceY < sh; sourceY++) {
          let filterPtr = 0;
          for (let destX = 0; destX < dw; destX++) {
            const filterShift = filters[filterPtr++];
            let srcPtr = srcOffset + filterShift * 4 | 0;
            let r = 0;
            let g = 0;
            let b = 0;
            let a = 0;
            for (let filterSize = filters[filterPtr++]; filterSize > 0; filterSize--) {
              const filterValue = filters[filterPtr++];
              r = r + filterValue * source[srcPtr] | 0;
              g = g + filterValue * source[srcPtr + 1] | 0;
              b = b + filterValue * source[srcPtr + 2] | 0;
              a = a + filterValue * source[srcPtr + 3] | 0;
              srcPtr = srcPtr + 4 | 0;
            }
            dest[destOffset] = r + (1 << 13) >> fixedFracBits;
            dest[destOffset + 1] = g + (1 << 13) >> fixedFracBits;
            dest[destOffset + 2] = b + (1 << 13) >> fixedFracBits;
            dest[destOffset + 3] = a + (1 << 13) >> fixedFracBits;
            destOffset = destOffset + sh * 4 | 0;
          }
          destOffset = (sourceY + 1) * 4 | 0;
          srcOffset = (sourceY + 1) * sw * 4 | 0;
        }
      };
      exports.convolve = convolve;
    }
  });

  // node_modules/@rgba-image/lanczos/dist/index.js
  var require_dist3 = __commonJS({
    "node_modules/@rgba-image/lanczos/dist/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.lanczos2 = exports.lanczos = void 0;
      var copy_1 = require_dist();
      var create_image_1 = require_dist2();
      var filters_1 = require_filters();
      var convolve_1 = require_convolve();
      var resize = (source, dest, use2 = false) => {
        const xRatio = dest.width / source.width;
        const yRatio = dest.height / source.height;
        const filtersX = filters_1.filters(source.width, dest.width, xRatio, 0, use2);
        const filtersY = filters_1.filters(source.height, dest.height, yRatio, 0, use2);
        const tmp = new Uint8ClampedArray(dest.width * source.height * 4);
        convolve_1.convolve(source.data, tmp, source.width, source.height, dest.width, filtersX);
        convolve_1.convolve(tmp, dest.data, source.height, dest.width, dest.height, filtersY);
      };
      var lanczos2 = (source, dest, sx = 0, sy = 0, sw = source.width - sx, sh = source.height - sy, dx = 0, dy = 0, dw = dest.width - dx, dh = dest.height - dy) => {
        sx = sx | 0;
        sy = sy | 0;
        sw = sw | 0;
        sh = sh | 0;
        dx = dx | 0;
        dy = dy | 0;
        dw = dw | 0;
        dh = dh | 0;
        if (sw <= 0 || sh <= 0 || dw <= 0 || dh <= 0)
          return;
        if (sx === 0 && sy === 0 && sw === source.width && sh === source.height && dx === 0 && dy === 0 && dw === dest.width && dh === dest.height) {
          resize(source, dest);
          return;
        }
        const croppedSource = create_image_1.createImage(sw, sh);
        const croppedDest = create_image_1.createImage(dw, dh);
        copy_1.copy(source, croppedSource, sx, sy);
        resize(croppedSource, croppedDest);
        copy_1.copy(croppedDest, dest, 0, 0, croppedDest.width, croppedDest.height, dx, dy);
      };
      exports.lanczos = lanczos2;
      var lanczos22 = (source, dest, sx = 0, sy = 0, sw = source.width - sx, sh = source.height - sy, dx = 0, dy = 0, dw = dest.width - dx, dh = dest.height - dy) => {
        sx = sx | 0;
        sy = sy | 0;
        sw = sw | 0;
        sh = sh | 0;
        dx = dx | 0;
        dy = dy | 0;
        dw = dw | 0;
        dh = dh | 0;
        if (sw <= 0 || sh <= 0 || dw <= 0 || dh <= 0)
          return;
        if (sx === 0 && sy === 0 && sw === source.width && sh === source.height && dx === 0 && dy === 0 && dw === dest.width && dh === dest.height) {
          resize(source, dest, true);
          return;
        }
        const croppedSource = create_image_1.createImage(sw, sh);
        const croppedDest = create_image_1.createImage(dw, dh);
        copy_1.copy(source, croppedSource, sx, sy);
        resize(croppedSource, croppedDest, true);
        copy_1.copy(croppedDest, dest, 0, 0, croppedDest.width, croppedDest.height, dx, dy);
      };
      exports.lanczos2 = lanczos22;
    }
  });

  // node_modules/browser-image-hash/dist/HashableImageSourceConverter/DifferenceHash/VanilaConverter.js
  var __read = function(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
  var __spreadArray = function(to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
      to[j] = from[i];
    return to;
  };
  var VanilaConverter = (
    /** @class */
    function() {
      function VanilaConverter2(document2, glayScaleCalculator, resizer) {
        this.document = document2;
        this.glayScaleCalculator = glayScaleCalculator;
        this.resizer = resizer;
      }
      VanilaConverter2.prototype.createCanvasRenderingContext2D = function(width, height) {
        var canvas = this.document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.setAttribute("style", "image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;");
        var ctx = canvas.getContext("2d");
        if (ctx === null) {
          throw new ReferenceError("undefined CanvasRenderingContext2D");
        }
        ctx.mozImageSmoothingEnabled = true;
        ctx.webkitImageSmoothingEnabled = true;
        ctx.msImageSmoothingEnabled = true;
        ctx.imageSmoothingEnabled = true;
        return ctx;
      };
      VanilaConverter2.prototype.convert = function(source) {
        var _this = this;
        var img = new Image();
        var result = new Promise(function(resolve) {
          img.onload = function() {
            var ctx = _this.createCanvasRenderingContext2D(img.width, img.height);
            ctx.drawImage(img, 0, 0, img.width, img.height);
            var colorMap = ctx.getImageData(0, 0, img.width, img.height).data;
            resolve(colorMap);
          };
        }).then(function(colorMap) {
          return _this.resizer.resize(colorMap, img.width, img.height, source.width, source.height);
        }).then(function(resizedColorMap) {
          var glayArraySouce = __spreadArray([], __read(Array(resizedColorMap.length / 4).keys())).map(function(i) {
            var index = i * 4;
            var _a = __read([
              resizedColorMap[index],
              resizedColorMap[index + 1],
              resizedColorMap[index + 2]
            ], 3), r = _a[0], g = _a[1], b = _a[2];
            return _this.glayScaleCalculator(r, g, b);
          });
          return new Uint8ClampedArray(glayArraySouce);
        });
        img.src = source.url.toString();
        return result;
      };
      return VanilaConverter2;
    }()
  );
  var VanilaConverter_default = VanilaConverter;

  // node_modules/browser-image-hash/dist/HashSource.js
  var HashSource = (
    /** @class */
    function() {
      function HashSource2(url, hashSize) {
        if (hashSize === void 0) {
          hashSize = 8;
        }
        this.url = url;
        this.hashSize = hashSize;
        this.width = hashSize + 1;
        this.height = hashSize;
      }
      HashSource2.prototype.calculateArea = function() {
        return this.width * this.height;
      };
      return HashSource2;
    }()
  );
  var HashSource_default = HashSource;

  // node_modules/browser-image-hash/dist/HashableImageSourceConverter/Resizer/LanczosResizer.js
  var import_lanczos = __toESM(require_dist3());
  var LanczosResizer = (
    /** @class */
    function() {
      function LanczosResizer2() {
      }
      LanczosResizer2.prototype.resize = function(source, nativeWidth, nativeHeight, expectedWidth, expectedHeight) {
        var sourceImageData = new ImageDataSouce(nativeWidth, nativeHeight, source);
        var destImageData = new ImageDataSouce(expectedWidth, expectedHeight, new Uint8ClampedArray(expectedWidth * expectedHeight * 4));
        (0, import_lanczos.lanczos)(sourceImageData, destImageData);
        return destImageData.data;
      };
      return LanczosResizer2;
    }()
  );
  var LanczosResizer_default = LanczosResizer;
  var ImageDataSouce = (
    /** @class */
    /* @__PURE__ */ function() {
      function ImageDataSouce2(width, height, source) {
        this.width = width;
        this.height = height;
        this.data = source;
      }
      return ImageDataSouce2;
    }()
  );

  // node_modules/browser-image-hash/dist/Hash.js
  var __read2 = function(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
  var __spreadArray2 = function(to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
      to[j] = from[i];
    return to;
  };
  var Hash = (
    /** @class */
    function() {
      function Hash2(rawHash) {
        if (rawHash.split("").find(function(row) {
          return row !== "1" && row !== "0";
        })) {
          throw new TypeError("Not bits.");
        }
        this.rawHash = rawHash;
      }
      Hash2.prototype.getHammingDistance = function(hash) {
        if (this.rawHash.length !== hash.rawHash.length) {
          throw new TypeError("Not equal to hash length.");
        }
        var target = hash.rawHash.split("");
        var diff = this.rawHash.split("").filter(function(row, index) {
          return row !== (target[index] || "0");
        });
        return diff.length;
      };
      Hash2.prototype.toString = function() {
        return this.calcuateHexadecimal(this.rawHash.split("").map(function(row) {
          return row === "1" ? 1 : 0;
        }));
      };
      Hash2.prototype.arrayChunk = function(array, chunk) {
        return __spreadArray2([], __read2(Array(Math.ceil(array.length / chunk)).keys())).map(function(index) {
          return array.slice(index * chunk, index * chunk + chunk);
        });
      };
      Hash2.prototype.calcuateHexadecimal = function(binalyNumbers) {
        return this.arrayChunk(binalyNumbers, 4).map(function(row) {
          return parseInt(row.join(""), 2).toString(16);
        }).join("");
      };
      return Hash2;
    }()
  );
  var Hash_default = Hash;

  // node_modules/browser-image-hash/dist/HashGenerator.js
  var __read3 = function(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
  var __spreadArray3 = function(to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
      to[j] = from[i];
    return to;
  };
  var HashGenerator = (
    /** @class */
    function() {
      function HashGenerator2(document2) {
        this.document = document2;
      }
      HashGenerator2.prototype.generateByImage = function(source, glayImage) {
        glayImage.width = source.width;
        glayImage.height = source.height;
        var canvas = this.document.createElement("canvas");
        var context = canvas.getContext("2d");
        if (context === null) {
          throw new ReferenceError("undefined CanvasRenderingContext2D");
        }
        context.drawImage(glayImage, 0, 0, source.width, source.height);
        return this.generate(source, context);
      };
      HashGenerator2.prototype.generateByCanvasRenderingContext2D = function(source, glayImageDrawingCanvasContext) {
        var imageData = glayImageDrawingCanvasContext.getImageData(0, 0, source.width, source.height).data;
        var glayArray = new Uint8ClampedArray(__spreadArray3([], __read3(Array(imageData.length / 4).keys())).map(function(i) {
          var index = i * 4;
          return imageData[index];
        }));
        return this.generate(source, glayArray);
      };
      HashGenerator2.prototype.generateByUint8ClampedArray = function(source, glayArray) {
        if (glayArray.length !== source.calculateArea()) {
          throw new Error("Not convertable grayArray, convertable grayArray length is " + source.calculateArea());
        }
        var binaryNumbers = Array.from(glayArray).map(function(row, index, colors) {
          return row <= colors[index + 1] ? 1 : 0;
        }).filter(function(_, index) {
          return (index + 1) % source.width !== 0;
        }).join("");
        return new Hash_default(binaryNumbers);
      };
      HashGenerator2.prototype.generate = function(source, glayImageSource) {
        if (glayImageSource instanceof HTMLImageElement) {
          return this.generateByImage(source, glayImageSource);
        } else if (glayImageSource instanceof CanvasRenderingContext2D) {
          return this.generateByCanvasRenderingContext2D(source, glayImageSource);
        } else if (glayImageSource instanceof Uint8ClampedArray) {
          return this.generateByUint8ClampedArray(source, glayImageSource);
        }
        throw new TypeError("Not generatable glay image source.");
      };
      return HashGenerator2;
    }()
  );
  var HashGenerator_default = HashGenerator;

  // node_modules/browser-image-hash/dist/HashableImageSourceConverter/GlayScaleCalculator/ITU_R601_2Method.js
  function ITU_R601_2Method(r, g, b) {
    return Math.round(r * 299 / 1e3 + g * 587 / 1e3 + b * 114 / 1e3);
  }

  // node_modules/browser-image-hash/dist/DifferenceHashBuilder.js
  var __awaiter = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var __generator = function(thisArg, body) {
    var _ = { label: 0, sent: function() {
      if (t[0] & 1) throw t[1];
      return t[1];
    }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
      return this;
    }), g;
    function verb(n) {
      return function(v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_) try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2]) _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
  var DifferenceHashBuilder = (
    /** @class */
    function() {
      function DifferenceHashBuilder2(dHashConverter, document2) {
        if (dHashConverter === void 0) {
          dHashConverter = null;
        }
        if (document2 === void 0) {
          document2 = window.document;
        }
        if (dHashConverter === null) {
          dHashConverter = new VanilaConverter_default(document2, ITU_R601_2Method, new LanczosResizer_default());
        }
        this.dHashConverter = dHashConverter;
        this.generator = new HashGenerator_default(document2);
      }
      DifferenceHashBuilder2.prototype.build = function(url, hashSize) {
        if (hashSize === void 0) {
          hashSize = 8;
        }
        return __awaiter(this, void 0, void 0, function() {
          var source, hashableImageSouce;
          return __generator(this, function(_a) {
            switch (_a.label) {
              case 0:
                source = new HashSource_default(url, hashSize);
                return [4, this.dHashConverter.convert(source)];
              case 1:
                hashableImageSouce = _a.sent();
                return [2, this.generator.generate(source, hashableImageSouce)];
            }
          });
        });
      };
      return DifferenceHashBuilder2;
    }()
  );
  var DifferenceHashBuilder_default = DifferenceHashBuilder;

  // src/bktree.js
  var Node = class {
    /** Creates a new node
     *  @param {Hash} hash
     *  @param {number} distance
     */
    constructor(hash, distance) {
      this.hash = hash;
      this.distance = distance;
      this.children = [];
    }
  };
  var BKTree = class {
    /** @type {Node | null} */
    #root = null;
    /** Insert hash into the tree
     *  @param {Hash} hash
     */
    insert(hash) {
      if (this.#root === null) {
        this.#root = new Node(hash, 0);
        return;
      }
      let node = this.#root;
      outer: while (true) {
        const distance = node.hash.getHammingDistance(hash);
        if (distance === 0) {
          return;
        }
        for (const child of node.children) {
          if (child.distance === distance) {
            node = child;
            continue outer;
          }
        }
        node.children.push(new Node(hash, distance));
        return;
      }
    }
    /** Search the tree for a hash within maxDistance
     *  @param {Hash} hash
     *  @param {number} maxDistance
     *  @returns {?{hash:Hash,distance:number}} The found Hash or null
     */
    lookup(hash, maxDistance) {
      if (this.#root === null) {
        return null;
      }
      const queue = [this.#root];
      while (queue.length > 0) {
        const node = queue.pop();
        const distance = node.hash.getHammingDistance(hash);
        if (distance <= maxDistance) {
          return { hash: node.hash, distance };
        }
        const low = distance - maxDistance;
        const high = distance + maxDistance;
        for (const child of node.children) {
          if (low <= child.distance && child.distance <= high) {
            queue.push(child);
          }
        }
      }
      return null;
    }
  };

  // src/index.js
  (async () => {
    const hammingDistance = 5;
    const styleFilter = "blur(5px) grayscale(0.6)";
    async function getHashList() {
      return JSON.parse(await GM_getValue("hash_list", "[]"));
    }
    function saveHashList(hashList) {
      GM_setValue("hash_list", JSON.stringify(hashList));
    }
    async function buildTree(hashList) {
      const tree2 = new BKTree();
      for (const rawHash of hashList) {
        const hash = new Hash_default(rawHash);
        tree2.insert(hash);
      }
      return tree2;
    }
    let tree = await buildTree(await getHashList());
    async function updateHashList(hash) {
      let hashList = await getHashList();
      let added;
      const oldLength = hashList.length;
      hashList = hashList.filter((item) => item !== hash.rawHash);
      if (hashList.length < oldLength) {
        added = false;
      } else {
        hashList.push(hash.rawHash);
        added = true;
      }
      saveHashList(hashList);
      tree = await buildTree(hashList);
      return added;
    }
    async function blobRequest(url) {
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: "GET",
          url,
          responseType: "blob",
          onload: (resp) => {
            resolve(resp.response);
          },
          onerror: (error) => {
            reject(error);
          }
        });
      });
    }
    const builder = new DifferenceHashBuilder_default();
    async function filter(post) {
      try {
        const imgLink = post.querySelector("a.fileThumb");
        if (imgLink === null) return;
        const src = imgLink.href.replace(".jpg", "s.jpg");
        let hash;
        const cachedHash = sessionStorage.getItem(src);
        if (cachedHash !== null) {
          hash = new Hash_default(cachedHash);
        } else {
          const blob = await blobRequest(src);
          const url = window.URL.createObjectURL(blob);
          hash = await builder.build(url);
          console.log("Hashed thumbnail", src, hash.toString());
          sessionStorage.setItem(src, hash.rawHash);
        }
        const found = tree.lookup(hash, hammingDistance);
        if (found !== null) {
          console.log(
            `filtering image based on dHash, hamming distance ${found.distance}, url ${src}, dhash ${hash.toString()}, filter entry dhash ${found.hash.toString()}`
          );
          imgLink.style.filter = styleFilter;
        }
        post.addEventListener("click", async (e) => {
          if (e.ctrlKey && e.altKey) {
            e.preventDefault();
            if (await updateHashList(hash)) {
              alert(`Added image to filter list
dHash: ${hash.toString()}`);
              imgLink.style.filter = styleFilter;
            } else {
              alert(`Removed image from filter list
dHash: ${hash.toString()}`);
              imgLink.style.filter = "";
            }
          }
        });
      } catch (e) {
        console.error(e);
      }
    }
    const thread = document.querySelector(".thread");
    const obs = new MutationObserver((mutationList) => {
      for (const mutation of mutationList) {
        for (const node of mutation.addedNodes) {
          if (node.tagName === "DIV" && node.classList.contains("postContainer")) {
            filter(node);
          }
        }
      }
    });
    obs.observe(thread, { childList: true });
    for (const post of thread.querySelectorAll("div.postContainer")) {
      filter(post);
    }
  })();
})();
