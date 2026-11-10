import View from './View.js';

/**
 * AssignmentFormView
 * Handles the assignment form: collecting input, filling for edit,
 * resetting, and wiring submit/cancel events.
 */
class AssignmentFormView extends View {
  constructor() {
    super();
    this._parentElement = document.querySelector('#assignment-form');
    this._errorContainer = document.querySelector('#error-container');
    this._submitBtn = document.querySelector('#submit-btn');
    this._cancelBtn = document.querySelector('#cancel-btn');
    this._idInput = document.querySelector('#assignment-id');
    this._titleEl = document.querySelector('#form-title');

    // Wire cancel button behaviour
    this._cancelBtn.addEventListener('click', () => this.resetForm());
  }

  /* ---------- Data Access ---------- */

  getFormData() {
    return {
      id: this._idInput.value || null,
      subject: document.querySelector('#subject').value.trim(),
      title: document.querySelector('#title').value.trim(),
      dueDate: document.querySelector('#dueDate').value,
    };
  }

  /* ---------- Form State ---------- */

  fillForm(assignment) {
    this._idInput.value = assignment.id;
    document.querySelector('#subject').value = assignment.subject;
    document.querySelector('#title').value = assignment.title;
    document.querySelector('#dueDate').value = assignment.dueDate;

    this._submitBtn.textContent = 'Update Assignment';
    this._cancelBtn.hidden = false;
    this._titleEl.textContent = 'Edit Assignment';
  }

  resetForm() {
    this._parentElement.reset();
    this._idInput.value = '';
    this._submitBtn.textContent = 'Add Assignment';
    this._cancelBtn.hidden = true;
    this._titleEl.textContent = 'Add Assignment';
  }

  /* ---------- Event Wiring ---------- */

  addHandlerSubmit(handler) {
    this._parentElement.addEventListener('submit', (event) => {
      event.preventDefault();
      handler();
    });
  }
}

export default new AssignmentFormView();
