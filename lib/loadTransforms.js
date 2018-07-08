"use babel";
import { transformsPath } from "./scaffold";

module.exports = function loadTransforms() {
  const transformsFilePath = transformsPath();
  delete require.cache[require.resolve(transformsFilePath)];
  const factory = Module._load(transformsFilePath, module, false);
  return factory();
};
