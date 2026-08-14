# Implementation Plan: Personal Dashboard MVP

## Overview

This implementation plan breaks down the Personal Dashboard into 18 focused tasks optimized for a 4-hour development sprint (~15 minutes per task). Tasks are organized in three phases: Setup (foundation), Widgets (feature implementation), and Polish (refinement and deployment). Each task builds incrementally, with no orphaned code—everything integrates smoothly by the end.

---

## Phase 1: Setup (40 minutes)

### T1: Create HTML skeleton and base CSS structure

**Effort**: 15 min  
**Dependencies**: None

**Description**:
Create a minimal but complete HTML file with proper semantic structure, meta tags, and basic CSS placeholders. Set up the responsive grid layout and establish CSS variable infrastructure for theming.

**Acceptance Criteria**:
- [x] Create `index.html` with DOCTYPE, charset, viewport meta, and semantic `<main>` container
- [x] Create `css/styles.css` with CSS variables for light/dark themes (color palette)
- [~] Establish responsive grid layout structure (mobile-first: 1 column, tablet: 2 columns, desktop: 3 columns)
- [~] Verify HTML loads in browser without errors
- [~] Verify basic grid renders correctly on mobile (320px) and desktop (1024px+)

**Requirements Mapped**: 9.1, 10.2, 10.3

---

### T2: Implement Local Storage utility functions and validation helpers

**Effort**: 12 min  
**Dependencies**: T1

**Description**:
Create a utility module in `js/app.js` with helper functions for Local Storage operations (load, save, check availability) and validation functions for all user inputs (name, task text, link label/URL, timer duration).

**Acceptance Criteria**:
- [~] Create `isLocalStorageAvailable()` function with try/catch check
- [~] Create `loadFromStorage(key)` function with JSON parse error handling
- [~] Create `saveToStorage(key, data)` function with error logging
- [~] Create validation functions:
  - `validateUserName(name)` — max 50 chars, trim whitespace
  - `validateTaskText(text)` — max 200 chars, non-empty
  - `validateLinkLabel(label)` — max 30 chars, non-empty
  - `validateLinkUrl(url)` — max 2048 chars, non-empty, contains dot after normalization
  - `validateTimerDuration(minutes)` — integer, 1–120 range
- [~] Test each validation function with valid and invalid inputs

**Requirements Mapped**: 8.4, 1.6, 2.6, 4.6, 5.5, 5.13, 6.5

---

### T3: Initialize global AppState object and load persisted data

**Effort**: 13 min  
**Dependencies**: T1, T2

**Description**:
Create the global `window.AppState` object that holds all application state. Populate it with initial values from Local Storage on page load, with proper defaults. Set up event listener for page load and initialize the dashboard.

**Acceptance Criteria**:
- [~] Define `window.AppState` with all required sections: theme, greeting, timer, tasks, quickLinks, ui
- [~] Load theme from Local Storage (default: 'dark')
- [~] Load userName from Local Storage (default: null)
- [~] Load pomodoroMinutes from Local Storage (default: 25)
- [~] Load tasks array from Local Storage (default: [])
- [~] Load quickLinks array from Local Storage (default: [])
- [~] Apply theme CSS class to document element on load
- [~] Log AppState to console to verify structure
- [~] Test that default values are used when Local Storage is empty

**Requirements Mapped**: 8.1, 8.2, 1.5, 2.4, 4.8, 6.10, 7.6, 7.7

---

## Phase 2: Widgets (140 minutes)

### T4: Implement greeting widget — time and date display

**Effort**: 15 min  
**Dependencies**: T3

**Description**:
Render the Greeting widget with time (HH:MM:SS) and date (Day, DD Month YYYY) displays. Implement automatic updates every 1 second for time and at midnight for date.

**Acceptance Criteria**:
- [~] Create greeting widget HTML section with `#current-time` and `#current-date` elements
- [~] Implement `formatTime(date)` function returning HH:MM:SS format
- [~] Implement `formatDate(date)` function returning "Day, DD Month YYYY" format (locale-aware or hardcoded)
- [~] Implement `updateTime()` function updating both time and date displays
- [~] Set up `setInterval` to call `updateTime()` every 1 second
- [~] Test time updates every second in browser
- [~] Test date updates correctly at midnight (or simulate by manually changing system clock)

**Requirements Mapped**: 1.1, 1.2, 1.6

---

### T5: Implement greeting widget — contextual greeting message based on time

**Effort**: 13 min  
**Dependencies**: T4

**Description**:
Add contextual greeting text that changes based on time of day: "Selamat Pagi" (05:00–11:59), "Selamat Siang" (12:00–14:59), "Selamat Sore" (15:00–17:59), "Selamat Malam" (18:00–04:59).

**Acceptance Criteria**:
- [~] Implement `getGreetingByHour(hour)` function with time periods
- [~] Create greeting message display element (`#greeting-message`)
- [~] Update greeting automatically when time period changes
- [~] Test all four greeting periods display correctly
- [~] Test greeting updates in real-time as hour changes
- [~] Handle greeting message concatenation with user name (see T6)

**Requirements Mapped**: 1.3, 1.4

---

### T6: Implement greeting widget — user name input and save

**Effort**: 12 min  
**Dependencies**: T3, T5, T2

**Description**:
Add user name input field and save button to Greeting widget. Display personalized greeting when name is saved.

**Acceptance Criteria**:
- [~] Create input field (`#user-name-input`) and save button (`#user-name-save`)
- [~] Implement `saveUserName(name)` function:
  - Validate name (max 50 chars, no empty/whitespace-only)
  - Save to AppState and Local Storage
  - Update greeting display to "[Greeting], [Name]!"
- [~] Load and display saved user name on page load
- [~] Allow clearing name (save empty string)
- [~] Test name persists after page reload
- [~] Test greeting updates with and without name

**Requirements Mapped**: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 1.5

---

### T7: Implement Focus Timer widget — start/stop/reset controls

**Effort**: 14 min  
**Dependencies**: T3, T2

**Description**:
Build the Focus Timer display and three control buttons. Implement start, stop, and reset functionality with proper state management and button enable/disable logic.

**Acceptance Criteria**:
- [~] Create timer display element (`#timer-display`) showing MM:SS format
- [~] Create Start, Stop, Reset buttons with proper aria-labels
- [~] Implement `startTimer()` function:
  - Start countdown from `AppState.timer.secondsRemaining`
  - Disable Start button, enable Stop button
  - Update display every 1 second
- [~] Implement `stopTimer()` function:
  - Pause countdown, preserve remaining seconds
  - Enable Start button, disable Stop button
- [~] Implement `resetTimer()` function:
  - Stop countdown and reset to configured duration
  - Enable Start button, disable Stop button
- [~] Test all three buttons work correctly
- [~] Test display updates in MM:SS format correctly

**Requirements Mapped**: 3.1, 3.2, 3.3, 3.4, 3.5, 3.9, 3.10

---

### T8: Implement Focus Timer widget — timer completion and notification

**Effort**: 13 min  
**Dependencies**: T7

**Description**:
Handle timer countdown completion: display visual notification (5 seconds), play audio notification, auto-reset, and ensure timer stops (no auto-restart).

**Acceptance Criteria**:
- [~] Implement countdown tick logic that decrements every 1 second
- [~] Implement `handleTimerComplete()` function:
  - Show visual notification element for 5 seconds
  - Play audio beep (Web Audio API or fallback)
  - Auto-reset display to configured duration
  - Stop countdown (set isRunning to false, clear interval)
  - Disable Start button, enable Stop button (correct state)
- [~] Test notification displays for 5 seconds then hides
- [~] Test audio plays on completion
- [~] Test timer does NOT auto-restart
- [~] Test timer reset to correct duration after completion

**Requirements Mapped**: 3.6, 3.7, 3.8

---

### T9: Implement Focus Timer widget — duration configuration and validation

**Effort**: 14 min  
**Dependencies**: T7, T2

**Description**:
Add duration input field and save button. Validate input (1–120 minutes, integers only) and persist to Local Storage. Disable input while timer running.

**Acceptance Criteria**:
- [~] Create duration input field (`#timer-duration`) and save button (`#timer-save-duration`)
- [~] Implement `saveDuration(minutes)` function:
  - Validate input (integer, 1–120 range)
  - Show error message if invalid
  - Update AppState and Local Storage if valid
  - Update display to new duration
  - Reset timer to new duration
- [~] Disable duration input while timer is running
- [~] Enable duration input when timer is stopped
- [~] Test all validation edge cases (0, 121, -1, 3.5, "abc", empty)
- [~] Test valid durations save and apply correctly
- [~] Test persisted duration loads on page reload

**Requirements Mapped**: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8

---

### T10: Implement To-Do List widget — add task with validation and error handling

**Effort**: 14 min  
**Dependencies**: T3, T2

**Description**:
Create task input field and add button. Implement task creation with validation (non-empty, max 200 chars), persistence to Local Storage, and render new task to list.

**Acceptance Criteria**:
- [~] Create task input field (`#task-input`) and add button (`#task-add`)
- [~] Implement `addTask(text)` function:
  - Validate text (non-empty, max 200 chars, not whitespace-only)
  - Show error message if invalid
  - Generate unique task ID (task_{timestamp}_{counter})
  - Create task object with text, completed=false, timestamps
  - Add to AppState.tasks
  - Call debounced saveTasks()
  - Render task to list
  - Clear input field
- [~] Implement debounced `saveTasks()` function (300ms delay)
- [~] Test validation error messages display
- [~] Test tasks persist after page reload
- [~] Test multiple rapid task additions batch-save correctly

**Requirements Mapped**: 5.1, 5.2, 5.3, 5.4, 5.5

---

### T11: Implement To-Do List widget — display tasks, toggle completion, and visual feedback

**Effort**: 15 min  
**Dependencies**: T10, T2

**Description**:
Render task list dynamically. Implement toggle completion functionality with checkbox and strikethrough styling.

**Acceptance Criteria**:
- [~] Implement `renderTaskList()` function rendering all tasks
- [~] Implement `renderTaskItem(task)` function creating task DOM:
  - Checkbox for completion toggle
  - Task text (displayed or input field if in edit mode)
  - Edit and delete buttons
  - Strikethrough text if completed
- [~] Implement `toggleTaskCompletion(taskId)` function:
  - Toggle task.completed boolean
  - Update visual styling (add/remove strikethrough)
  - Call debounced saveTasks()
- [~] Create CSS for strikethrough styling (text-decoration: line-through)
- [~] Test toggling completes/uncompletes task
- [~] Test completed task shows strikethrough visually
- [~] Test checkbox state matches task.completed in AppState

**Requirements Mapped**: 5.6, 5.7, 5.8, 5.9, 5.10

---

### T12: Implement To-Do List widget — edit and delete tasks

**Effort**: 14 min  
**Dependencies**: T11

**Description**:
Add inline edit mode for task text and delete functionality. Implement validation for edited text.

**Acceptance Criteria**:
- [~] Implement `editTask(taskId, newText)` function:
  - Validate newText (non-empty, max 200 chars, not whitespace-only)
  - Show error message if invalid
  - Update task.text and timestamps if valid
  - Exit edit mode, re-render task
  - Call debounced saveTasks()
- [~] Implement `deleteTask(taskId)` function:
  - Remove task from AppState.tasks
  - Call debounced saveTasks()
  - Re-render task list
- [~] Create inline edit UI:
  - Click edit button → Replace task text with input field
  - Save button saves edits (validate on save)
  - Cancel button discards edits
- [~] Test edit validation prevents invalid text
- [~] Test delete removes task permanently
- [~] Test cancel edit discards changes
- [~] Test edited/deleted tasks persist after reload

**Requirements Mapped**: 5.11, 5.12, 5.13, 5.14, 5.15, 5.16, 5.17

---

### T13: Implement Quick Links widget — add links with validation and URL normalization

**Effort**: 15 min  
**Dependencies**: T3, T2

**Description**:
Create dual input fields (label, URL) and add button. Implement validation, auto-prepend https://, and persist to Local Storage.

**Acceptance Criteria**:
- [~] Create label input (`#link-label`) and URL input (`#link-url`) and add button (`#link-add`)
- [~] Implement `addLink(label, url)` function:
  - Validate label (non-empty, max 30 chars)
  - Validate url (non-empty, max 2048 chars, contains dot after normalization)
  - Show error message if invalid, specify which field
  - Normalize URL: auto-prepend https:// if no protocol
  - Generate unique link ID (link_{timestamp}_{counter})
  - Create link object
  - Check max 20 links limit
  - Add to AppState.quickLinks
  - Save to Local Storage immediately
  - Render link to grid
  - Clear input fields
- [~] Implement `normalizeUrl(url)` function adding https:// if needed
- [~] Test all validation cases (empty, too long, invalid URLs)
- [~] Test URL normalization works correctly
- [~] Test 20-link limit prevents adding more
- [~] Test links persist after reload

**Requirements Mapped**: 6.1, 6.5, 6.6, 6.7

---

### T14: Implement Quick Links widget — display and delete links, open in new tab

**Effort**: 14 min  
**Dependencies**: T13

**Description**:
Render quick links as clickable buttons/cards in a grid. Implement click-to-open and delete functionality.

**Acceptance Criteria**:
- [~] Implement `renderLinksGrid()` function rendering all links
- [~] Implement `renderLinkButton(link)` function creating link DOM:
  - Label text as main content
  - Delete button overlay or adjacent
  - Click handler opens link in new tab
- [~] Implement `openLink(url)` function:
  - Call window.open(url, '_blank')
- [~] Implement `deleteLink(linkId)` function:
  - Remove from AppState.quickLinks
  - Save to Local Storage immediately
  - Re-render links grid
- [~] Implement max links message:
  - Show "Maximum links reached" when count === 20
  - Hide add button or show disabled state
- [~] Create responsive grid layout for links (wraps on mobile)
- [~] Test clicking link opens in new tab
- [~] Test delete removes link permanently
- [~] Test max message displays at 20 links

**Requirements Mapped**: 6.2, 6.3, 6.4, 6.8, 6.9, 6.11, 6.12

---

### T15: Implement theme toggle — light/dark mode switching and persistence

**Effort**: 13 min  
**Dependencies**: T1, T3

**Description**:
Create theme toggle button in header. Implement theme switching with CSS class application and Local Storage persistence. Ensure no flash of wrong theme on reload.

**Acceptance Criteria**:
- [~] Create theme toggle button in header (`#theme-toggle`)
- [~] Implement `toggleTheme()` function:
  - Flip AppState.theme.current between 'light' and 'dark'
  - Apply CSS class to document element (theme-light or theme-dark)
  - Update button icon (sun/moon)
  - Save to Local Storage immediately
- [~] Implement theme application on page load:
  - Load theme from Local Storage before render
  - Apply CSS class immediately (no flash)
- [~] Create CSS variables for light and dark themes:
  - Background colors, text colors, accent colors, borders
  - All components cascade variables
- [~] Add CSS transitions for smooth theme change (< 200ms)
- [~] Test theme toggles correctly
- [~] Test theme persists after reload
- [~] Test no flash of wrong theme on page load
- [~] Verify contrast ratios meet WCAG AA (4.5:1 minimum)

**Requirements Mapped**: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7

---

### T16: Style all components with CSS and ensure responsive layout

**Effort**: 16 min  
**Dependencies**: T1, T4–T15

**Description**:
Complete CSS styling for all widgets. Ensure responsive layout (mobile 320px, tablet 768px, desktop 1024px+) and accessibility (semantic HTML, color contrast, keyboard navigation).

**Acceptance Criteria**:
- [~] Style all widgets with consistent padding, borders, border-radius
- [~] Create responsive grid layout:
  - Mobile (< 768px): 1 column
  - Tablet (768px–1023px): 2 columns
  - Desktop (1024px+): 2 or 3 columns based on space
- [~] Style form inputs and buttons:
  - Focus outlines visible for keyboard navigation
  - Hover/active states for all interactive elements
  - Disabled state styling for inputs when inactive
- [~] Style task list:
  - Strikethrough on completed tasks
  - Edit mode inline editing UI
  - Delete button styling
- [~] Style links grid:
  - Responsive grid (2–4 columns based on viewport)
  - Link buttons or cards with hover effect
- [~] Create theme-aware colors using CSS variables
- [~] Test responsive layout at 320px, 768px, 1024px, 2560px viewports
- [~] Test all interactive elements have visible focus indicators
- [~] Verify color contrast in both light and dark themes (WCAG AA)

**Requirements Mapped**: 9.2, 9.4, 9.5, 9.6

---

### T17: Implement error handling and fallback messages

**Effort**: 13 min  
**Dependencies**: T2, T10–T16

**Description**:
Add error message elements throughout UI. Handle Local Storage unavailability gracefully. Display validation error messages for user inputs.

**Acceptance Criteria**:
- [~] Create error message elements in widgets:
  - `#timer-error-message` for timer duration errors
  - `#task-error-message` for task validation errors
  - `#link-error-message` for link validation errors
- [~] Implement `showError(elementId, message)` and `hideError(elementId)` functions
- [~] Check Local Storage availability on page load:
  - If unavailable, show notification: "Data storage unavailable. Changes will not persist."
  - Continue operation with in-memory state
  - Disable save-related feedback
- [~] Display validation errors:
  - Show error message when user tries invalid action
  - Preserve user input in field (allow retry)
  - Clear error when user starts editing/correcting
- [~] Test error messages display for:
  - Empty/invalid task text
  - Invalid timer duration (out of range, not integer)
  - Empty/invalid link label/URL
  - Invalid user name (if applicable)
- [~] Test Local Storage unavailability gracefully handled
- [~] Test errors clear when user corrects input

**Requirements Mapped**: 1.6, 2.6, 4.6, 5.5, 5.13, 6.5, 8.3, 8.4

---

## Phase 3: Polish (60 minutes)

### T18: Testing, verification, and GitHub Pages deployment

**Effort**: 15 min  
**Dependencies**: T1–T17

**Description**:
Conduct comprehensive testing across all widgets. Fix any remaining bugs. Deploy to GitHub Pages.

**Acceptance Criteria**:
- [~] Test all core functionality:
  - Time/date display updates correctly
  - Greeting changes with time period
  - User name saves and displays personalized greeting
  - Timer starts, stops, resets, completes with notification
  - Timer duration configurable and persists
  - Tasks add, edit, toggle, delete
  - Links add, display, delete, open in new tab
  - Theme toggle switches and persists
- [~] Test persistence:
  - Page reload preserves all data except timer session
  - Local Storage keys are consistent
  - Invalid Local Storage data doesn't crash app
- [~] Test on multiple browsers (Chrome, Firefox, Edge, Safari)
- [~] Test responsive layout at 320px, 768px, 1024px viewports
- [~] Test keyboard navigation (Tab, Enter, Space keys)
- [~] Verify no critical errors in browser console
- [~] Test initial load time < 2 seconds
- [~] Verify color contrast meets WCAG AA
- [~] Create GitHub repository (if not exists) or ensure code is committed
- [~] Enable GitHub Pages on main/gh-pages branch
- [~] Deploy by pushing to branch
- [~] Verify deployed site accessible via GitHub Pages URL
- [~] Verify all widgets functional on deployed version

**Requirements Mapped**: 3.1–3.10, 4.1–4.8, 5.1–5.19, 6.1–6.12, 7.1–7.7, 8.1–8.5, 9.1–9.6, 10.1–10.5

---

## Notes

- **Optional Testing**: Tasks T10–T18 can include property-based tests as sub-tasks, but are not required for MVP (manual verification sufficient for 4-hour sprint)
- **Debouncing**: Task save operations use 300ms debounce to batch rapid changes; all other saves are immediate
- **No Timer Session Persistence**: Timer countdown state is NOT persisted; only configuration (duration) is saved. Timer resets on page reload.
- **Local Storage Keys**: All keys use `pd_` prefix to avoid conflicts with other apps
- **Accessibility**: All widgets use semantic HTML, ARIA labels, and keyboard navigation by default
- **Performance**: No external dependencies; pure vanilla JavaScript ensures < 2 second initial load on broadband

---

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["T1", "T2"]
    },
    {
      "id": 1,
      "tasks": ["T3", "T4", "T7"]
    },
    {
      "id": 2,
      "tasks": ["T5", "T6", "T8", "T9", "T10", "T13"]
    },
    {
      "id": 3,
      "tasks": ["T11", "T12", "T14", "T15"]
    },
    {
      "id": 4,
      "tasks": ["T16", "T17"]
    },
    {
      "id": 5,
      "tasks": ["T18"]
    }
  ]
}
```

**Wave Explanation**:
- **Wave 0**: HTML/CSS foundation and utility functions
- **Wave 1**: AppState initialization, timer display base, greeting time/date
- **Wave 2**: Greeting personalization, timer completion, task and link creation with validation
- **Wave 3**: Task and link display/editing/deletion, theme toggle
- **Wave 4**: Complete styling and error handling across all widgets
- **Wave 5**: Final testing and deployment

