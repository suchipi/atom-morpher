"use babel";
import { transformsPath } from "./scaffold";

module.exports = function loadTransforms() {
  const transformsFilePath = transformsPath();
  return new Promise((resolve, reject) => {
    let transforms = [];
    try {
      delete require.cache[require.resolve(transformsFilePath)];
      const factory = require(transformsFilePath);

      Promise.resolve(factory()).then(resolve).catch(reject);
    } catch (error) {
      reject(error);
    }
  });
};
