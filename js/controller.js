import model from './model.js';
import AssignmentFormView from './views/AssignmentFormView.js';
import AssignmentListView from './views/AssignmentListView.js';
import StatsView from './views/StatsView.js';
import ErrorView from './views/ErrorView.js';

/* ============================================================
   CONTROLLER RESPONSIBILITIES (glue between model and views)
   ------------------------------------------------------------
   • controlValidate        - validation rules (subject/title/due date)
   • controlAddOrUpdate     - form submit: add or update assignment
   • controlEdit            - load assignment into form for editing
   • controlDelete          - delete assignment (modal confirmed in view)
   • controlToggle          - flip completed status
   • controlSearch          - filter by title search term
   • updateUI               - re-render list, stats, badges, empty state
   • init                   - bootstrap and wire all event handlers
   ============================================================ */

// Current filter and search state
let currentFilter = 'all';
let currentSearch = '';

/* ---------- Statistics rendering ---------- */
/**
 * Re-render the assignment list and statistics dashboard.
 */
const updateUI = function () {
  const assignments = model.getAssignments(currentFilter, currentSearch);
  AssignmentListView.render(assignments);
  StatsView.render(model.getStats());
  AssignmentListView.updateFilterCounts(model.getStats());

  // Empty state messaging
  if (assignments.length === 0) {
    let message = 'No assignments found.';
    if (currentSearch.trim()) {
      message = `No assignments match "${currentSearch.trim()}".`;
    } else if (currentFilter === 'completed') {
      message = 'No completed assignments yet.';
    } else if (currentFilter === 'pending') {
      message = 'No pending assignments. Great job!';
    } else {
      message = 'No assignments yet. Add one above!';
    }
    AssignmentListView.setEmptyMessage(message);
  }
};

/* ---------- Form handling ---------- */
/**
 * Validate input and add or update an assignment.
 * (form submit: add or update)
 */
/* ---------- Validation Logic ---------- */
/**
 * Validate assignment form data.
 * Returns an array of error messages (empty if valid).
 * @param {{subject:string,title:string,dueDate:string}} data
 * @returns {string[]}
 */
const controlValidate = function ({ subject, title, dueDate }) {
  const errors = [];
  if (!subject) errors.push('Subject cannot be empty.');
  if (!title) errors.push('Title cannot be empty.');
  if (!dueDate) errors.push('Due date cannot be empty.');
  return errors;
};

/* ---------- Form handling ---------- */
const controlAddOrUpdate = function () {
  const { id, subject, title, dueDate } = AssignmentFormView.getFormData();

  const errors = controlValidate({ subject, title, dueDate });
  if (errors.length > 0) {
    ErrorView.renderError(errors); // show validation errors
    return;
  }

  ErrorView.clear();

  if (id) {
    model.updateAssignment(id, { subject, title, dueDate });
  } else {
    model.addAssignment({ subject, title, dueDate });
  }

  AssignmentFormView.resetForm();
  updateUI();
};

/* ---------- List handling ---------- */
const controlEdit = function (id) {
  const assignment = model.getAssignment(id);
  if (assignment) AssignmentFormView.fillForm(assignment);
};

/* ---------- Deletion (with confirmation modal) ---------- */
const controlDelete = function (id) {
  model.deleteAssignment(id);
  updateUI();
};

/* ---------- Toggle completion ---------- */
const controlToggle = function (id) {
  model.toggleComplete(id);
  updateUI();
};

/* ---------- Search & filter ---------- */
const controlSearch = function (query) {
  currentSearch = query;
  updateUI();
};

const init = function () {
  AssignmentListView.render(model.getAssignments(currentFilter, currentSearch));
  StatsView.render(model.getStats());
  AssignmentListView.updateFilterCounts(model.getStats());

  AssignmentFormView.addHandlerSubmit(controlAddOrUpdate);
  AssignmentListView.addHandlerToggleComplete(controlToggle);
  AssignmentListView.addHandlerDelete(controlDelete);
  AssignmentListView.addHandlerEdit(controlEdit);
  AssignmentListView.addHandlerSearch(controlSearch);

  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      updateUI();
    });
  });

  // Initial empty message
  updateUI();
};

init();
