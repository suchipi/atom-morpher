// You can define transforms for the `morpher` package here. You can run them
// via the "Morpher: Open Transforms List" command in the command palette.
// See https://github.com/suchipi/atom-morpher/blob/master/README.md for more
// info about writing transforms.

module.exports = function() {
  return [
    /* Example transform: uppercases selected text
    {
      name: "Uppercase selected text",
      description: "Converts all characters in the selection to uppercase",
      onSelected({ text, selection }) {
        // This transformer will use atom's TextBuffer to transform the text,
        // but you can use any method you want; you just need to make a
        // string containing all the new text you want to be in the buffer.
        const { TextBuffer } = require("atom");
        const buffer = new TextBuffer({ text });
        const selectionContent = buffer.getTextInRange(selection);
        buffer.setTextInRange(selection, selectionContent.toUpperCase());
        const newText = buffer.getText();

        return {
          text: newText,
        };
      },
    },
    */
  ];
};
