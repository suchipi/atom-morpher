"use babel";
import { CompositeDisposable } from "atom";
import { prepareTransformsFile, transformsPath } from "./lib/scaffold";
import loadTransforms from "./lib/loadTransforms";
import TransformsList from "./lib/TransformsList";
import runTransformer from "./lib/runTransformer";
import showAndLogError from "./lib/showAndLogError";

export default {
  transformsList: null,
  subscriptions: null,

  activate() {
    prepareTransformsFile();
    this.transformsList = new TransformsList({
      transformSelected: ({ name, onSelected: transformer }) => {
        this.transformsList.setItems([]);
        this.transformsList.setLoading(`Running '${name}'...`);
        const onDone = () => this.transformsList.cancel();
        runTransformer(transformer).then(onDone).catch(error => {
          onDone();
          showAndLogError(
            "An error occurred while running your transform",
            error
          );
        });
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
        "morpher:open-transforms-list": () => {
          this.transformsList.setLoading("Loading transforms...");
          this.transformsList.open();
          loadTransforms()
            .then(transforms => this.transformsList.setTransforms(transforms))
            .catch(error => {
              this.transformsList.cancel();
              showAndLogError(
                "An error occurred while loading your transforms",
                error
              );
            });
        },
      })
    );
  },

  deactivate() {
    this.subscriptions.dispose();
    this.transformsList.destroy();
  }
};
