"use babel";
import Module from "module";
import { transformsPath } from "./scaffold";

module.exports = async function loadTransforms() {
  const transformsFilePath = transformsPath();
  delete require.cache[require.resolve(transformsFilePath)];
  const factory = Module._load(transformsFilePath, module, false);
  return await factory();
};
