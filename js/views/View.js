/**
 * View.js
 * Base View class. All view classes extend this class and inherit
 * common rendering helpers. Views NEVER import the model.
 */

export default class View {
  _data;
  _parentElement;

  /**
   * Render markup into the parent element.
   * @param {any} data - data to render
   * @param {boolean} render - when false, returns markup string only
   * @returns {string|void}
   */
  render(data, render = true) {
    this._data = data;
    const markup = this._generateMarkup();
    if (!render) return markup;
    this.clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  /**
   * Remove all child nodes from the parent element.
   */
  clear() {
    if (this._parentElement) {
      this._parentElement.innerHTML = '';
    }
  }

  /**
   * Re-render with new data (defaults to full render).
   */
  update(data) {
    this.render(data);
  }

  /**
   * Subclasses must implement this to produce markup for `this._data`.
   * @returns {string}
   */
  _generateMarkup() {
    throw new Error('_generateMarkup must be implemented by subclass');
  }
}
