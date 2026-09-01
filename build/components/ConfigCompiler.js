"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _path = require("path");
var _glob = require("glob");
var _rootPath = _interopRequireDefault(require("@main/hooks/rootPath"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
let ConfigCompiler = exports.default = /*#__PURE__*/function () {
  function ConfigCompiler(target, workSpace) {
    this.target = void 0;
    this.workSpace = void 0;
    this.target = target;
    this.workSpace = workSpace;
  }
  var _proto = ConfigCompiler.prototype;
  _proto.compile = function compile(source, tsConfig) {
    if (!this.isInScope(tsConfig)) {
      return;
    }
    const {
      baseUrl,
      paths
    } = this.getAliasesData(tsConfig);
    if (!baseUrl || !paths) {
      return;
    }
    for (const alias in paths) {
      const patterns = paths[alias];
      patterns.forEach(pattern => {
        const root = (0, _path.resolve)(this.workSpace, baseUrl, (0, _rootPath.default)(pattern));
        const reference = source.value.replace(new RegExp(`^${(0, _rootPath.default)(alias)}`), root);
        if ((0, _path.isAbsolute)(reference)) {
          source.value = this.createRelativeSourcePath(this.target, reference);
        }
      });
    }
  };
  _proto.isInScope = function isInScope(tsConfig) {
    const includes = this.getIncludes(tsConfig);
    if (!includes) {
      return false;
    }
    for (const include of includes) {
      const scope = (0, _path.resolve)(this.workSpace, include);
      if (this.matchPatterns(scope)) {
        return this.checkRoots(tsConfig);
      }
    }
    return false;
  };
  _proto.checkRoots = function checkRoots(tsConfig) {
    if (!tsConfig.compilerOptions) {
      return true;
    }
    const {
      rootDir,
      rootDirs
    } = tsConfig.compilerOptions;
    if (rootDir) {
      const scope = (0, _path.resolve)(this.workSpace, rootDir);
      return this.matchPatterns(scope);
    }
    if (!rootDirs) {
      return true;
    }
    for (const dir of rootDirs) {
      const scope = (0, _path.resolve)(this.workSpace, dir);
      if (this.matchPatterns(scope)) {
        return true;
      }
    }
    return false;
  };
  _proto.createRelativeSourcePath = function createRelativeSourcePath(target, reference) {
    const result = (0, _path.parse)((0, _path.relative)((0, _path.dirname)(target), reference));
    if (result.dir === "") {
      result.root = "./";
    } else if (!/^\.\.?\//.test(result.dir)) {
      result.dir = `./${result.dir}`;
    }
    return (0, _path.format)(result);
  };
  _proto.getIncludes = function getIncludes(tsConfig) {
    if (tsConfig.include) {
      return tsConfig.include;
    }
    return null;
  };
  _proto.getBaseURL = function getBaseURL(tsConfig) {
    if (tsConfig.compilerOptions?.baseUrl) {
      return tsConfig.compilerOptions.baseUrl;
    }
    return null;
  };
  _proto.getPaths = function getPaths(tsConfig) {
    if (tsConfig.compilerOptions?.paths) {
      return tsConfig.compilerOptions.paths;
    }
    return null;
  };
  _proto.getAliasesData = function getAliasesData(tsConfig) {
    return {
      baseUrl: this.getBaseURL(tsConfig),
      paths: this.getPaths(tsConfig)
    };
  };
  _proto.matchPatterns = function matchPatterns(path) {
    for (const pattern of (0, _glob.globSync)(path)) {
      if (new RegExp(`^${pattern}`).test(path)) {
        return true;
      }
    }
    return false;
  };
  return _createClass(ConfigCompiler, [{
    key: "rel",
    get: function () {
      return (0, _path.relative)(this.workSpace, this.target);
    }
  }]);
}();