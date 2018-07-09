"use babel";
/** @jsx etch.dom */

const {TextEditor, CompositeDisposable} = require('atom');
const etch = require('etch');

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
        <h1>Variables</h1>
        <h3>Press {process.platform === 'darwin' ? 'Cmd' : 'Ctrl'} + Enter to morph</h3>
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
    setTimeout(() => {
      this.setDefaultValues();
      this.focusFirstVariableEditor();
    }, 0);
    return new Promise(resolve => this.hideCallbacks.push(resolve));
  }

  setDefaultValues() {
    const variables = this.props.variables || {};
    for (let variable in variables) {
      const {defaultValue} = variables[variable] || {};
      if (!defaultValue) continue;
      const editor = this.refs[`${variable}__editor`];
      if (editor) editor.setText(defaultValue);
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

  confirm() {
    const variables = this.props.variables || {};
    const values = {};
    for (let variable in variables) {
      values[variable] = this.refs[`${variable}__editor`].getText();
    }
    this.hide(values);
  }

  hide(values) {
    if (this.panel) {
      this.panel.hide();
    }
    this.hideCallbacks.forEach(callback => callback(values));
    this.hideCallbacks = [];
  }

  destroy() {
    if (this.subscriptions) this.subscriptions.dispose();
  }

  shiftFocus(amount) {
    const refs = [
      ...Object.keys(this.props.variables || {}).map(variable => this.refs[`${variable}__editor`]),
      this.refs.confirm,
      this.refs.cancel,
    ];
    let index = refs.findIndex(ref => {
      if (!ref) return false;
      if (ref === document.activeElement) {
        return true;
      }
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
    if (next.getElement) next.getElement().focus();
    else next.focus();
  }

  focusNext() {
    this.shiftFocus(1);
  }

  focusPrevious() {
    this.shiftFocus(-1);
  }
}
