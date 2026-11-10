/**
 * Model.js
 * Contains ALL application state for the Assignment Tracker.
 * Responsible for CRUD operations, statistics, and localStorage persistence.
 * This module NEVER manipulates the DOM.
 */

class Model {
  constructor() {
    this.assignments = [];
    this._loadFromStorage();
    // Include sample starter data when storage is empty
    if (this.assignments.length === 0) {
      this._loadSampleData();
    }
  }

  /* ---------- Persistence ---------- */

  _loadFromStorage() {
    try {
      const data = localStorage.getItem('assignments');
      if (data) {
        this.assignments = JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load assignments from localStorage:', error);
      this.assignments = [];
    }
  }

  _saveToStorage() {
    try {
      localStorage.setItem('assignments', JSON.stringify(this.assignments));
    } catch (error) {
      console.error('Failed to save assignments to localStorage:', error);
    }
  }

  /* ---------- Sample Data ---------- */

  _loadSampleData() {
    this.assignments = [
      {
        id: this._generateId(),
        subject: 'Mathematics',
        title: 'Algebra Homework - Chapter 5',
        dueDate: this._futureDate(3),
        completed: false,
      },
      {
        id: this._generateId(),
        subject: 'Science',
        title: 'Lab Report: Photosynthesis',
        dueDate: this._futureDate(7),
        completed: true,
      },
      {
        id: this._generateId(),
        subject: 'English',
        title: 'Essay on Shakespeare',
        dueDate: this._futureDate(1),
        completed: false,
      },
      {
        id: this._generateId(),
        subject: 'History',
        title: 'World War II Research Paper',
        dueDate: this._futureDate(5),
        completed: false,
      },
    ];
    this._saveToStorage();
  }

  /* ---------- Helpers ---------- */

  _generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2);
  }

  _futureDate(daysAhead) {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return date.toISOString().slice(0, 10);
  }

  /* ---------- Read ---------- */

  /**
   * Return assignments optionally filtered by status and searched by title.
   * @param {string} filter - 'all' | 'completed' | 'pending'
   * @param {string} searchTerm - case-insensitive title search
   */
  getAssignments(filter = 'all', searchTerm = '') {
    let result = [...this.assignments];

    if (filter === 'completed') {
      result = result.filter((a) => a.completed);
    } else if (filter === 'pending') {
      result = result.filter((a) => !a.completed);
    }

    const query = (searchTerm || '').trim().toLowerCase();
    if (query) {
      result = result.filter((a) =>
        (a.title || '').toLowerCase().includes(query)
      );
    }

    return result;
  }

  getAssignment(id) {
    return this.assignments.find((a) => a.id === id) || null;
  }

  /* ---------- Create ---------- */

  addAssignment({ subject, title, dueDate }) {
    const assignment = {
      id: this._generateId(),
      subject,
      title,
      dueDate,
      completed: false,
    };
    // Newest assignments appear first
    this.assignments.unshift(assignment);
    this._saveToStorage();
    return assignment;
  }

  /* ---------- Update ---------- */

  updateAssignment(id, { subject, title, dueDate }) {
    const assignment = this.getAssignment(id);
    if (!assignment) return null;
    assignment.subject = subject;
    assignment.title = title;
    assignment.dueDate = dueDate;
    this._saveToStorage();
    return assignment;
  }

  toggleComplete(id) {
    const assignment = this.getAssignment(id);
    if (!assignment) return null;
    assignment.completed = !assignment.completed;
    this._saveToStorage();
    return assignment;
  }

  /* ---------- Delete ---------- */

  deleteAssignment(id) {
    this.assignments = this.assignments.filter((a) => a.id !== id);
    this._saveToStorage();
  }

  /* ---------- Statistics ---------- */

  getStats() {
    const total = this.assignments.length;
    const completed = this.assignments.filter((a) => a.completed).length;
    const pending = total - completed;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, pending, percentage };
  }
}

// Export a singleton instance used throughout the app
export default new Model();
