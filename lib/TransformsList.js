"use babel";
import { SelectListView } from "atom-space-pen-views";

export default class TransformsList extends SelectListView {
  constructor({ transformSelected }) {
    super();
    this.transformSelected = transformSelected;
  }

  viewForItem({ name, description }) {
    if (description) {
      return `
        <li class="two-lines">
          <div class="primary-line">${name}</div>
          <div class="secondary-line">${description}</div>
        </li>
      `;
    } else {
      return `
        <li>
          ${name}
        </li>
      `;
    }
  }

  getEmptyMessage() {
    return "No transforms defined. Run 'morpher:open-your-transforms-file' to define some";
  }

  setTransforms(transforms) {
    this.setItems(
      transforms.map(transform =>
        Object.assign({}, transform, {
          filterKey: `${transform.name} ${transform.description}`
        })
      )
    );
  }

  getFilterKey() {
    return "filterKey";
  }

  confirmed(transform) {
    this.transformSelected(transform);
  }

  cancelled() {
    this.hide();
  }

  open() {
    if (!this.panel) {
      this.panel = atom.workspace.addModalPanel({ item: this });
    }

    this.storeFocusedElement();
    this.panel.show();
    this.focusFilterEditor();
  }

  hide() {
    if (this.panel) {
      this.panel.hide();
    }
  }
}
