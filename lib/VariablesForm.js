"use babel";
/** @jsx etch.dom */

const {TextEditor, CompositeDisposable} = require('atom');
const etch = require('etch');

const valuesCache = {};

export default class VariablesForm {
  constructor(props) {
    this.props = props;
    this.hideCallbacks = [];
    etch.initialize(this);
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add(this.element, {
      'morpher:confirm': () => this.confirm(),
      'morpher:cancel': () => this.cancel(),
      'morpher:focus-next': () => this.focusNext(),
      'morpher:focus-previous': () => this.focusPrevious(),
    }));
  }

  render () {
    const {name, description} = this.props;
    const variables = this.props.variables || {};
    const fields = [];

    for (let variable in variables) {
      const attributes = variables[variable] || {};
      fields.push(
        <div>
          <label>
            {attributes.label || variable}
          </label>
          <TextEditor
            mini={attributes.mini !== false}
            ref={`${variable}__editor`}
          />
        </div>
      );
    }

    return (
      <div tabIndex={-1} className="morpher-variables">
        <h1>{name} Variables</h1>
        <h3>{description}</h3>
        {fields}
        <button
          className="btn"
          ref="confirm"
          onClick={() => this.confirm()}
        >
          Morph
        </button>
        <button
          className="btn"
          ref="cancel"
          onClick={() => this.cancel()}
        >
          Cancel
        </button>
      </div>
    );
  }

  update(props) {
    this.props = props;
    return etch.update(this);
  }

  open() {
    if (!this.panel) {
      this.panel = atom.workspace.addModalPanel({ item: this });
    }
    this.panel.show();
    setTimeout(() => this.didOpen(), 0);
    return new Promise(resolve => this.hideCallbacks.push(resolve));
  }

  didOpen() {
    this.setInitialValues();
    this.focusFirstVariableEditor();
    if (!this.tooltipSubscriptions) {
      this.tooltipSubscriptions = new CompositeDisposable(
        atom.tooltips.add(this.refs.confirm, {
          title: 'Morph',
          keyBindingCommand: 'morpher:confirm',
          keyBindingTarget: this.element,
          class: 'morpher-above-panel',
        }),
        atom.tooltips.add(this.refs.cancel, {
          title: 'Cancel',
          keyBindingCommand: 'morpher:cancel',
          keyBindingTarget: this.element,
          class: 'morpher-above-panel',
        }),
      )
    }
  }

  setInitialValues() {
    const {name} = this.props;
    const previousValues = valuesCache[name] || {};
    const variables = this.props.variables || {};
    for (let variable in variables) {
      const {defaultValue} = variables[variable] || {};
      const editor = this.refs[`${variable}__editor`];
      if (editor) editor.setText(defaultValue != null
        ? defaultValue
        : previousValues[variable] || ''
      );
    }
  }

  focusFirstVariableEditor() {
    const variables = this.props.variables || {};
    for (let variable in variables) {
      const editor = this.refs[`${variable}__editor`];
      if (editor) {
        editor.getElement().focus();
        editor.selectAll();
      }
      break;
    }
  }

  cancel() {
    this.hide(null);
  }

  getValues() {
    const variables = this.props.variables || {};
    const values = {};
    for (let variable in variables) {
      values[variable] = this.refs[`${variable}__editor`].getText();
    }
    return values;
  }

  confirm() {
    this.hide(this.getValues());
  }

  saveValuesToCache() {
    const {name} = this.props;
    valuesCache[name] = this.getValues();
  }

  hide(values) {
    this.saveValuesToCache();
    if (this.panel) {
      this.panel.hide();
    }
    this.hideCallbacks.forEach(callback => callback(values));
    this.hideCallbacks = [];
    this.hideAllTooltips();
  }

  destroy() {
    if (this.subscriptions) this.subscriptions.dispose();
    this.hideAllTooltips();
  }

  hideAllTooltips() {
    if (this.tooltipSubscriptions) {
      this.tooltipSubscriptions.dispose();
      this.tooltipSubscriptions = null;
    }
  }

  shiftFocus(amount) {
    const refs = Object.keys(this.props.variables || {})
      .map(variable => this.refs[`${variable}__editor`]);
    let index = refs.findIndex(ref => {
      if (!ref) return false;
      if (ref.getElement && ref.getElement() === document.activeElement) {
        return true;
      }
      if (ref.component && ref.component.getHiddenInput &&
          ref.component.getHiddenInput() === document.activeElement) {
        return true;
      }
    });
    const next = refs[(index + refs.length + amount) % refs.length];
    if (!next) return;
    if (next.getElement) {
      next.getElement().focus();
      next.selectAll();
    } else {
      next.focus();
    }
  }

  focusNext() {
    this.shiftFocus(1);
  }

  focusPrevious() {
    this.shiftFocus(-1);
  }
}
