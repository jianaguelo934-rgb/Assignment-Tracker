import View from './View.js';

/**
 * ErrorView
 * Displays validation errors in a styled error box.
 */
class ErrorView extends View {
  constructor() {
    super();
    this._parentElement = document.querySelector('#error-container');
  }

  /**
   * Render one or more error messages.
   * @param {string|string[]} errors
   */
  renderError(errors) {
    const list = Array.isArray(errors) ? errors : [errors];
    const markup = `
      <div class="error-box">
        <ul>
          ${list.map((e) => `<li>${this._escape(e)}</li>`).join('')}
        </ul>
      </div>
    `;
    this.clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  _escape(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  _generateMarkup() {
    return '';
  }
}

export default new ErrorView();
