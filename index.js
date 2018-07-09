"use babel";
import { CompositeDisposable } from "atom";
import { prepareTransformsFile, transformsPath } from "./lib/scaffold";
import loadTransforms from "./lib/loadTransforms";
import TransformsList from "./lib/TransformsList";
import VariablesForm from "./lib/VariablesForm";
import runTransformer from "./lib/runTransformer";
import showAndLogError from "./lib/showAndLogError";

export default {
  transformsList: null,
  variablesForm: null,
  subscriptions: null,

  activate() {
    prepareTransformsFile();

    this.transformsList = new TransformsList({
      transformSelected: async ({ name, variables, onSelected: transformer }) => {
        let variableValues;
        if (variables) {
          if (typeof variables === 'function') {
            const activeEditor = atom.workspace.getActiveTextEditor();
            if (!activeEditor) throw new Error("There's no active editor to perform a transform on");
            const activeBuffer = activeEditor.getBuffer();

            const text = activeBuffer.getText();
            const cursorPosition = activeEditor.getCursorBufferPosition();
            const selection = activeEditor.getLastSelection().getBufferRange();
            const selectedText = activeBuffer.getTextInRange(selection);
            const filePath = activeEditor.getPath();
            variables = await variables({text, cursorPosition, selection, filePath, selectedText});
          }
          if (!(variables instanceof Object)) {
            throw new Error('variables is invalid, must be an object or a function that returns an object');
          }
          if (!this.variablesForm) {
            this.variablesForm = new VariablesForm({});
          }
          this.variablesForm.update({variables});
          variableValues = await this.variablesForm.open();
          if (!variableValues) return;
        }
        this.transformsList.setItems([]);
        this.transformsList.setLoading(`Running '${name}'...`);
        try {
          await runTransformer(transformer, {variableValues});
          this.transformsList.cancel();
        } catch(error) {
          this.transformsList.cancel();
          showAndLogError(
            "An error occurred while running your transform",
            error
          );
        }
      }
    });

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.commands.add(".workspace", {
        "morpher:open-your-transforms-file": () => {
          atom.workspace.open(transformsPath());
        },
      })
    );
    this.subscriptions.add(
      atom.commands.add(".editor", {
        "morpher:open-transforms-list": async () => {
          this.transformsList.setLoading("Loading transforms...");
          this.transformsList.open();
          try {
            const transforms = await loadTransforms();
            this.transformsList.setTransforms(transforms);
          } catch (error) {
            this.transformsList.cancel();
            showAndLogError(
              "An error occurred while loading your transforms",
              error
            );
          }
        },
      })
    );
  },

  deactivate() {
    this.subscriptions.dispose();
    this.transformsList.destroy();
  }
};
