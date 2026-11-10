import View from './View.js';

/**
 * StatsView
 * Renders the statistics dashboard (total, completed, pending, percentage).
 */
class StatsView extends View {
  constructor() {
    super();
    this._parentElement = document.querySelector('#stats-container');
  }

  _generateMarkup() {
    const { total, completed, pending, percentage } = this._data || {
      total: 0,
      completed: 0,
      pending: 0,
      percentage: 0,
    };
    return `
      <div class="stat-card">
        <span class="stat-value">${total}</span>
        <span class="stat-label">Total Assignments</span>
      </div>
      <div class="stat-card completed">
        <span class="stat-value">${completed}</span>
        <span class="stat-label">Completed</span>
      </div>
      <div class="stat-card pending"> 
        <span class="stat-value">${pending}</span>
        <span class="stat-label">Pending</span>
      </div>
      <div class="stat-card percentage">
        <span class="stat-value">${percentage}%</span>
        <span class="stat-label">Completion</span>
      </div>
    `;
  }
}

export default new StatsView();
