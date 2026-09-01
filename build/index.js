"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _path = require("path");
var _glob = require("glob");
var _getRootPath = require("get-root-path");
var _ConfigCompiler = _interopRequireDefault(require("@main/components/ConfigCompiler"));
var _tsConfigGlob = _interopRequireDefault(require("@main/hooks/tsConfigGlob"));
var _loadJson = _interopRequireDefault(require("@main/hooks/loadJson"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const root = (0, _getRootPath.getRootPathSync)();
function _default() {
  return {
    visitor: {
      ImportDeclaration(path, state) {
        if (state.filename && path.get("source").isStringLiteral()) {
          const {
            source
          } = path.node;
          let workSpace = state.filename;
          while ((0, _path.relative)(root, workSpace)) {
            workSpace = (0, _path.dirname)(workSpace);
            const tsConfigPaths = (0, _glob.globSync)((0, _tsConfigGlob.default)(workSpace));
            const tsConfigs = tsConfigPaths.map(_loadJson.default);
            if (tsConfigs.length) {
              const compiler = new _ConfigCompiler.default(state.filename, workSpace);
              tsConfigs.forEach(config => compiler.compile(source, config));
            }
          }
          path.set("source", source);
        }
      }
    }
  };
}