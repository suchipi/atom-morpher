"use babel";

module.exports = function runTransformer(transformer, {variableValues} = {}) {
  const activeEditor = atom.workspace.getActiveTextEditor();
  if (!activeEditor) { return Promise.reject(new Error("There's no active editor to perform a transform on")); }
  const activeBuffer = activeEditor.getBuffer();
  const selection = activeEditor.getLastSelection().getBufferRange();
  const selectedText = activeBuffer.getTextInRange(selection);

  function getTransformerResult() {
    const text = activeBuffer.getText();
    const cursorPosition = activeEditor.getCursorBufferPosition();
    const filePath = activeEditor.getPath();

    return transformer({
      text,
      selectedText,
      cursorPosition,
      selection,
      filePath,
      variableValues,
    });
  }

  function processResult(result) {
    let newText, newSelectedText, newCursorPosition, newSelection;
    if (result && typeof result === "object") {
      newText = result.text;
      newSelectedText = result.selectedText;
      newCursorPosition = result.cursorPosition;
      newSelection = result.selection;
    }
    if (newSelectedText) {
      activeBuffer.setTextInRange(selection, newSelectedText);
    }
    if (newText) {
      activeBuffer.setTextViaDiff(newText);
    }
    if (newCursorPosition) {
      activeEditor.setCursorBufferPosition(newCursorPosition);
    }
    if (newSelection) {
      activeEditor.setSelectedBufferRange(newSelection);
    }
  }

  return new Promise((resolve, reject) => {
    try {
      Promise.resolve(getTransformerResult())
        .then(processResult)
        .then(resolve)
        .catch(reject);
    } catch (error) {
      reject(error);
    }
  });
};
