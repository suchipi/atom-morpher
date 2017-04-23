"use babel";
import path from "path";
import os from "os";
import shell from "shelljs";

function transformsPath() {
  return path.join(os.homedir(), ".atom", "morpher-transforms.js");
}

function transformsScaffoldPath(...args) {
  return path.resolve(
    path.join(__dirname, "..", "scaffold", "morpher-transforms.js")
  );
}

function prepareTransformsFile() {
  if (!shell.test("-e", transformsPath())) {
    shell.cp(transformsScaffoldPath(), transformsPath());
  }
}

module.exports = {
  transformsPath,
  transformsScaffoldPath,
  prepareTransformsFile
};
