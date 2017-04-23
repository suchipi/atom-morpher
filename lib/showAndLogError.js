"use babel";

module.exports = function showAndLogError(contextString, error) {
  atom.notifications.addError(contextString + ": " + error.message, {
    stack: error.stack
  });
  console.error(error);
};
