import View from './View.js';

/**
 * AssignmentListView
 * Renders the list of assignments and wires toggle/edit/delete/search/filter events.
 * Includes a confirmation modal before deletion and due-date highlighting.
 */
class AssignmentListView extends View {
  constructor() {
    super();
    this._parentElement = document.querySelector('#assignment-list');
    this._emptyState = document.querySelector('#empty-state');
    this._searchInput = document.querySelector('#search-input');
    this._modalOverlay = document.querySelector('#modal-overlay');
    this._modalConfirm = document.querySelector('#modal-confirm');
    this._modalCancel = document.querySelector('#modal-cancel');

    this._pendingDeleteId = null;
    this._deleteHandler = null;

    // Modal button wiring
    this._modalCancel.addEventListener('click', () => this._closeModal());
    this._modalConfirm.addEventListener('click', () => {
      if (this._pendingDeleteId && this._deleteHandler) {
        this._deleteHandler(this._pendingDeleteId);
      }
      this._closeModal();
    });
    this._modalOverlay.addEventListener('click', (event) => {
      if (event.target === this._modalOverlay) this._closeModal();
    });
  }

  _escape(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  _formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Determine due-date urgency class.
   * - overdue: past due date
   * - due-soon: within next 3 days
   * - due-future: later
   */
  _dueDateClass(dateStr) {
    if (!dateStr) return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateStr);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 3) return 'due-soon';
    return 'due-future';
  }

  _generateMarkup() {
    if (!this._data || this._data.length === 0) {
      this._emptyState.hidden = false;
      // Customise empty message based on filters/search
      return '';
    }
    this._emptyState.hidden = true;
    return this._data.map((a) => this._generateItemMarkup(a)).join('');
  }

  _generateItemMarkup(assignment) {
    const statusClass = assignment.completed ? 'completed' : 'pending';
    const statusText = assignment.completed ? 'Completed' : 'Pending';
    const dueClass = this._dueDateClass(assignment.dueDate);
    return `
      <li class="assignment-item ${statusClass}" data-id="${assignment.id}">
        <div class="assignment-main">
          <input
            type="checkbox"
            class="toggle-complete"
            ${assignment.completed ? 'checked' : ''}
            aria-label="Mark as completed"
          />
          <div class="assignment-info">
            <span class="subject">${this._escape(assignment.subject)}</span>
            <h3 class="title ${assignment.completed ? 'done' : ''}">${this._escape(assignment.title)}</h3>
            <span class="due-date ${dueClass}">Due: ${this._formatDate(assignment.dueDate)}</span>
          </div>
        </div>
        <div class="assignment-actions">
          <span class="status-badge ${statusClass}">${statusText}</span>
          <button class="btn btn-edit" data-action="edit">Edit</button>
          <button class="btn btn-delete" data-action="delete">Delete</button>
        </div>
      </li>
    `;
  }

  /* ---------- Empty State Message ---------- */

  setEmptyMessage(message) {
    if (this._emptyState) this._emptyState.textContent = message;
  }

  /* ---------- Filter Counter Badges ---------- */

  updateFilterCounts(stats) {
    const allBadge = document.querySelector('[data-badge="all"]');
    const pendingBadge = document.querySelector('[data-badge="pending"]');
    const completedBadge = document.querySelector('[data-badge="completed"]');
    if (allBadge) allBadge.textContent = stats.total;
    if (pendingBadge) pendingBadge.textContent = stats.pending;
    if (completedBadge) completedBadge.textContent = stats.completed;
  }

  /* ---------- Modal ---------- */

  _openModal(id) {
    this._pendingDeleteId = id;
    this._modalOverlay.hidden = false;
  }

  _closeModal() {
    this._pendingDeleteId = null;
    this._modalOverlay.hidden = true;
  }

  /* ---------- Event Wiring (delegation) ---------- */

  addHandlerToggleComplete(handler) {
    this._parentElement.addEventListener('change', (event) => {
      if (event.target.classList.contains('toggle-complete')) {
        const id = event.target.closest('.assignment-item')?.dataset.id;
        if (id) handler(id);
      }
    });
  }

  addHandlerDelete(handler) {
    this._deleteHandler = handler;
    this._parentElement.addEventListener('click', (event) => {
      if (event.target.dataset.action === 'delete') {
        const id = event.target.closest('.assignment-item')?.dataset.id;
        if (id) this._openModal(id);
      }
    });
  }

  addHandlerEdit(handler) {
    this._parentElement.addEventListener('click', (event) => {
      if (event.target.dataset.action === 'edit') {
        const id = event.target.closest('.assignment-item')?.dataset.id;
        if (id) handler(id);
      }
    });
  }

  addHandlerSearch(handler) {
    if (!this._searchInput) return;
    this._searchInput.addEventListener('input', (event) => {
      handler(event.target.value);
    });
  }
}

export default new AssignmentListView();
