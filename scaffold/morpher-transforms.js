// You can define transforms for the `morpher` package here. You can run them
// via the "Morpher: Open Transforms List" command in the command palette.
// See http://github.com/suchipi/morpher for more info about writing transforms.

module.exports = function() {
  return [
    /* Example transform: uppercases text in the current selection
    {
      id: "uppercase-selection",
      name: "Uppercase selected text",
      description: "Converts all characters in the selection to uppercase",
      onSelected: function({ text, selection }) {
        const { TextBuffer } = require("atom");

        const buffer = new TextBuffer({ text });
        const selectionContent = buffer.getTextInRange(selection);
        buffer.setTextInRange(selection, selectionContent.toUpperCase());
        return {
          text: buffer.getText(),
        };
      }
    }
    */
  ];
};
