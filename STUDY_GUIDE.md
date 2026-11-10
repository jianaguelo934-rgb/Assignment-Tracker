# Assignment Tracker — Code Walkthrough & Study Guide

This guide explains every file so you can present and defend the project.

---

## 🗂️ Folder Structure

```
AssignmentTracker/
├── index.html                  # Page skeleton + containers
├── css/style.css               # All styling (cards, modal, badges, due-date colors)
└── js/
    ├── model.js                # State + localStorage + stats
    ├── controller.js           # Glue between model and views
    └── views/
        ├── View.js             # Base class
        ├── AssignmentFormView.js
        ├── AssignmentListView.js
        ├── StatsView.js
        └── ErrorView.js
```

MVC rules respected:
- `model.js` never touches the DOM.
- Views never import the model.
- Only `controller.js` talks to both.

---

## 1. `index.html` — The Skeleton

The page is just **containers** (empty divs/uls) that views fill at runtime.

Key elements and who uses them:
- `#assignment-form` → AssignmentFormView
- `#error-container` → ErrorView
- `#stats-container` → StatsView
- `#assignment-list` → AssignmentListView
- `#empty-state` → empty message
- `#search-input` → search
- `.filter-btn` (All/Pending/Completed) → filter + badges
- `#modal-overlay` → delete confirmation

Script is loaded as `type="module"` so ES module imports work.

---

## 2. `css/style.css` — Styling Highlights

- CSS variables (`:root`) for colors: `--completed` (green), `--pending` (amber), `--danger` (red).
- `.card` = white rounded box with shadow (modern card layout).
- `.assignment-item.completed` / `.pending` = colored left border + tinted background.
- `.due-date.overdue` (red), `.due-soon` (orange), `.due-future` (green).
- `.badge` = counter pill on filter buttons.
- `.modal-overlay` = fixed full-screen dimmed backdrop; hidden via `[hidden]`.
- Media queries make it responsive (1 column on mobile).

---

## 3. `js/model.js` — The Brain (data layer)

### Class `Model`
Holds `this.assignments` array. Constructor loads from localStorage; if empty, loads sample data.

**Persistence**
- `_loadFromStorage()` → reads `localStorage.getItem('assignments')`, parses JSON.
- `_saveToStorage()` → writes JSON back after every change.

**Sample data**
- `_loadSampleData()` creates 3 starter assignments (Math, Science, English) with future due dates.

**Helpers**
- `_generateId()` → uses `crypto.randomUUID()` (unique id for each assignment).
- `_futureDate(days)` → today + N days, formatted `YYYY-MM-DD`.

**Read**
- `getAssignments(filter, searchTerm)`:
  - filter by status (all/completed/pending)
  - then filter by title substring (case-insensitive search)
- `getAssignment(id)` → find one.

**Create / Update / Delete**
- `addAssignment({subject,title,dueDate})` → unshift (newest first), save.
- `updateAssignment(id, data)` → mutate fields, save.
- `toggleComplete(id)` → flip `completed` boolean, save.
- `deleteAssignment(id)` → filter out, save.

**Statistics**
- `getStats()` → `{ total, completed, pending, percentage }`.
  - percentage = `completed/total * 100`, rounded.

**Export:** `export default new Model();` (singleton instance).

---

## 4. `js/views/View.js` — Base Class

```js
export default class View {
  _data;
  _parentElement;
  render(data, render = true) { ... }
  clear() { this._parentElement.innerHTML = ''; }
  update(data) { this.render(data); }
  _generateMarkup() { throw Error; }  // subclasses implement
}
```

- `render()` calls `_generateMarkup()` (subclass-specific), then inserts HTML.
- `clear()` wipes container first so old data doesn't linger.
- `_generateMarkup()` is abstract → forces subclasses to define their own layout.

---

## 5. `js/views/AssignmentFormView.js` - The Form

Extends `View`. Constructor grabs DOM elements (form, buttons, inputs).

Methods:
- `getFormData()` → reads inputs, returns `{ id, subject, title, dueDate }`.
- `fillForm(assignment)` → fills inputs + switches button to "Update Assignment" (edit mode).
- `resetForm()` → clears inputs + restores "Add Assignment" (add mode).
- `addHandlerSubmit(handler)` → listens to form submit, prevents default, calls controller.

**Does NOT** validate or save. Just collects and displays.

---

## 6. `js/views/AssignmentListView.js` - The List

Extends `View`. Biggest view.

### Due-date highlighting
`_dueDateClass(dateStr)`:
- today normalized to 00:00
- diffDays = (due - today) in days
- `< 0` → `'overdue'` (red)
- `<= 3` → `'due-soon'` (orange)
- else → `'due-future'` (green)

### Rendering
- `_generateMarkup()` → if empty, show empty-state; else map items.
- `_generateItemMarkup(a)` → builds `<li>` with checkbox, info, status badge, Edit/Delete buttons. Applies due-date class.

### Modal (delete confirmation)
- `_openModal(id)` / `_closeModal()` toggle `#modal-overlay` hidden.
- Confirm button calls the stored delete handler with the pending id.

### Counter badges
- `updateFilterCounts(stats)` sets text of `[data-badge="all/pending/completed"]`.

### Empty message
- `setEmptyMessage(msg)` changes empty-state text.

### Event wiring (delegation)
- `addHandlerToggleComplete` → listens for `change` on checkboxes.
- `addHandlerDelete` → listens for clicks on `[data-action="delete"]`, opens modal.
- `addHandlerEdit` → listens for clicks on `[data-action="edit"]`.
- `addHandlerSearch` → listens to `#search-input` input event.

---

## 7. `js/views/StatsView.js` - Dashboard

Extends `View`. Renders 4 stat cards from `{ total, completed, pending, percentage }`.

No logic, pure display. Re-rendered by controller after any change.

---

## 8. `js/views/ErrorView.js` - Errors

Extends `View`. 
- `renderError(errors)` → builds a red `.error-box` with a `<ul>` of messages.
- `clear()` → removes the box.
- `_generateMarkup()` returns `''` (not used; uses `renderError` instead).

---

## 9. `js/controller.js` — The Glue

Imports model + all views. Holds `currentFilter` and `currentSearch`.

### Validation
```js
const controlValidate = ({ subject, title, dueDate }) => {
  const errors = [];
  if (!subject) errors.push('Subject cannot be empty.');
  if (!title) errors.push('Title cannot be empty.');
  if (!dueDate) errors.push('Due date cannot be empty.');
  return errors;
};
```

### Add/Update
```js
const controlAddOrUpdate = () => {
  const data = AssignmentFormView.getFormData();
  const errors = controlValidate(data);
  if (errors.length) { ErrorView.renderError(errors); return; }
  ErrorView.clear();
  if (data.id) model.updateAssignment(data.id, data);
  else model.addAssignment(data);
  AssignmentFormView.resetForm();
  updateUI();
};
```

### List actions
- `controlEdit(id)` → `AssignmentFormView.fillForm(model.getAssignment(id))`.
- `controlDelete(id)` → `model.deleteAssignment(id)` → `updateUI()`.
- `controlToggle(id)` → `model.toggleComplete(id)` → `updateUI()`.
- `controlSearch(query)` → set `currentSearch` → `updateUI()`.

### Stats refresh
```js
const updateUI = () => {
  const assignments = model.getAssignments(currentFilter, currentSearch);
  AssignmentListView.render(assignments);
  StatsView.render(model.getStats());
  AssignmentListView.updateFilterCounts(model.getStats());
  // set context-aware empty message
};
```

### `init()`
- First render of list + stats + badges.
- Wire form submit, toggle/delete/edit (delegation), search input.
- Wire filter buttons to change `currentFilter` and re-render.

---

## 🔁 Key Flows to Explain

### Adding an assignment
1. User types → clicks "Add Assignment".
2. FormView captures submit → calls `controlAddOrUpdate`.
3. Controller validates (ErrorView shows errors if any).
4. If valid → `model.addAssignment` saves to localStorage.
5. Form resets; `updateUI` re-renders list + stats + badges.

### Editing
1. User clicks "Edit" on a card.
2. ListView delegates → `controlEdit(id)`.
3. Controller loads assignment into FormView (edit mode).
4. User changes fields → submit → `controlAddOrUpdate` sees `id` → `model.updateAssignment`.

### Deleting (with confirmation)
1. User clicks "Delete".
2. ListView opens modal (does NOT delete yet).
3. User confirms → modal calls stored delete handler → `controlDelete` → model → `updateUI`.

### Searching
1. User types in search box.
2. ListView fires `addHandlerSearch` → `controlSearch` → `updateUI` → model filters by title.

### Due-date colors
- Computed in `_dueDateClass` based on days until due date; CSS classes apply colors.

### Persistence
- Every model mutation calls `_saveToStorage()`.
- On load, constructor reads localStorage; if empty, seeds sample data.

---

## 🎤 60-Second Pitch

> "This is an MVC Assignment Tracker in vanilla JS. The Model stores assignments and persists to localStorage. Four Views — Form, List, Stats, Error — only render UI and capture events. The Controller is the only bridge: it validates input, calls model methods, and re-renders views. Features include add/edit/delete, complete toggle, search, filters with counters, a delete confirmation modal, context-aware empty states, and due-date color highlighting. All data survives page refresh via localStorage."

---

## ❓ Likely Defense Questions

- **Why MVC?** Separation of concerns; views don't know about data, model doesn't touch DOM.
- **Why ES modules?** Native browser modules, no bundler, runs on Live Server.
- **Why event delegation?** List items are re-rendered often; one listener on `<ul>` is efficient and survives re-renders.
- **How is data persisted?** `localStorage` JSON; loaded in model constructor.
- **How are ids generated?** `crypto.randomUUID()`.
- **What prevents XSS?** `_escape()` uses a temp div's `textContent`/`innerHTML`.
- **How does edit mode work?** Hidden `#assignment-id` input; presence of id switches add→update.
- **How does the modal avoid accidental deletes?** Delete button only opens modal; actual delete happens on confirm.

---

## 📌 View Responsibilities Quick Map

- **FormView:** `AssignmentFormView.js` + `controlAddOrUpdate`, `controlEdit`.
- **ListView:** `AssignmentListView.js` + `controlDelete`, `controlToggle`, `controlSearch`, filter handling.
- **StatsView:** `StatsView.js` + stats refresh in `updateUI`.
- **ErrorView + Validation:** `ErrorView.js` + `controlValidate`.
