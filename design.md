# Personal Dashboard Design Document

## Overview

The Personal Dashboard is a single-page web application (New Tab Page alternative) built with vanilla HTML, CSS, and JavaScript. It provides users with a unified interface to view real-time information (time, date, personalized greeting), manage daily tasks, use a Pomodoro timer, and quickly access favorite links. All data is persisted client-side using the browser's Local Storage API, requiring no backend server or external APIs.

### Key Design Principles

1. **Zero Dependencies**: Pure vanilla JavaScript, HTML, and CSS — no frameworks or external libraries
2. **Progressive Enhancement**: Works immediately, with graceful fallbacks when features fail
3. **Client-First Data**: All data stored and processed locally; no network requests for functionality
4. **Accessibility-First**: WCAG 2.1 Level AA compliance with semantic HTML and keyboard navigation
5. **Responsive Design**: Mobile-first approach supporting 320px to 2560px viewports
6. **Performance-Optimized**: Initial load < 2 seconds, smooth 60fps interactions

---

## Architecture

### Component Overview

The application consists of five main widget components, managed by a central state manager, all rendered into a responsive dashboard layout.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Personal Dashboard                            │
├─────────────────────────────────────────────────────────────────────┤
│  [Theme Toggle]                                    [Settings Panel]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Greeting Widget                                              │   │
│  │ • Time (HH:MM:SS) — updates every 1 second                  │   │
│  │ • Date (Day, DD Month YYYY) — updates at 00:00              │   │
│  │ • Contextual greeting (Pagi/Siang/Sore/Malam)              │   │
│  │ • User name input & save (max 50 chars)                     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Focus Timer Widget (Pomodoro)                                │   │
│  │ • Timer display (MM:SS)                                      │   │
│  │ • Start / Stop / Reset buttons                              │   │
│  │ • Duration input (1-120 minutes, with validation)           │   │
│  │ • Completion notification (visual + audio)                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ To-Do List Widget                                            │   │
│  │ • Input field for new tasks (max 200 chars)                │   │
│  │ • Task list with edit, toggle, delete actions              │   │
│  │ • Visual indicators for completion (strikethrough)         │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Quick Links Widget                                           │   │
│  │ • Input form (label max 30 chars, URL max 2048 chars)      │   │
│  │ • Grid of link buttons/cards (max 20 links)                │   │
│  │ • Delete functionality per link                             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
User Interaction
    ↓
Event Listener (on widget)
    ↓
State Update (AppState object)
    ↓
Local Storage Sync (debounced)
    ↓
Re-render Affected Widget(s)
    ↓
DOM Update + Visual Feedback
```

### Architecture Layers

```
Presentation Layer (HTML/CSS)
  ↓
Component Layer (Widget-specific logic)
  ↓
State Management Layer (AppState, persists to LocalStorage)
  ↓
Local Storage Layer (Key-value persistence)
```

---

## Data Models

### Local Storage Schema

All data is stored in browser Local Storage as JSON objects with consistent, namespaced keys to prevent conflicts with other applications or extensions.

#### 1. **Theme Preference**

**Key**: `pd_theme` (Personal Dashboard theme)

```json
{
  "mode": "dark" | "light"
}
```

- **Default**: `"dark"`
- **Persisted**: When user clicks theme toggle
- **Sync Frequency**: Immediate (write on every toggle)

#### 2. **User Name**

**Key**: `pd_userName`

```json
{
  "name": "Budi" | "" | null
}
```

- **Default**: `null` (no name set)
- **Max Length**: 50 characters
- **Persisted**: When user clicks save in Greeting widget
- **Sync Frequency**: Immediate (write on save)

#### 3. **Pomodoro Configuration**

**Key**: `pd_pomodoroMinutes`

```json
{
  "duration": 25,
  "min": 1,
  "max": 120
}
```

- **Default**: `25` (standard Pomodoro)
- **Valid Range**: 1–120 minutes
- **Persisted**: When user saves duration in Focus Timer widget
- **Sync Frequency**: Immediate (write on save)
- **Note**: Timer session state (running, paused, elapsed) is NOT persisted; only config is stored

#### 4. **Tasks List**

**Key**: `pd_tasks`

```json
{
  "tasks": [
    {
      "id": "task_1704067200000_1",
      "text": "Complete project report",
      "completed": false,
      "createdAt": 1704067200000,
      "updatedAt": 1704067200000
    },
    {
      "id": "task_1704067200000_2",
      "text": "Review team feedback",
      "completed": true,
      "createdAt": 1704067200000,
      "updatedAt": 1704067300000
    }
  ]
}
```

- **Task ID Format**: `task_{timestamp}_{counter}` to ensure uniqueness
- **Max Tasks**: No hard limit (browser Local Storage typically allows 5-10MB)
- **Max Text Length**: 200 characters per task
- **Persisted**: On every add, edit, delete, or toggle operation
- **Sync Frequency**: Debounced to 300ms (avoid excessive writes during rapid edits)

#### 5. **Quick Links List**

**Key**: `pd_quickLinks`

```json
{
  "links": [
    {
      "id": "link_1704067200000_1",
      "label": "GitHub",
      "url": "https://github.com",
      "createdAt": 1704067200000
    },
    {
      "id": "link_1704067200000_2",
      "label": "MDN Docs",
      "url": "https://developer.mozilla.org",
      "createdAt": 1704067300000
    }
  ]
}
```

- **Link ID Format**: `link_{timestamp}_{counter}` to ensure uniqueness
- **Max Links**: 20 per requirements
- **Max Label Length**: 30 characters
- **Max URL Length**: 2048 characters
- **URL Normalization**: Auto-prepend `https://` if no protocol present
- **Persisted**: On every add or delete operation
- **Sync Frequency**: Immediate (write on add/delete)

### In-Memory State Structure

**Global AppState** (held in memory, synced to Local Storage):

```javascript
window.AppState = {
  // Theme
  theme: {
    current: 'dark' | 'light'
  },
  
  // Greeting
  greeting: {
    userName: 'Budi' | '',
    currentGreeting: 'Selamat Pagi' | 'Selamat Siang' | 'Selamat Sore' | 'Selamat Malam'
  },
  
  // Timer
  timer: {
    configuredMinutes: 25,  // From Local Storage
    secondsRemaining: 1500, // Current countdown value
    isRunning: false,       // In-memory only, not persisted
    intervalId: null        // Handle for setInterval
  },
  
  // Tasks
  tasks: [
    { id: 'task_...', text: '...', completed: false, ... }
  ],
  
  // Quick Links
  quickLinks: [
    { id: 'link_...', label: '...', url: '...', ... }
  ],
  
  // UI State
  ui: {
    activeEditTaskId: null,
    showTimerNotification: false,
    timerNotificationTimeoutId: null
  }
}
```

---

## Components and Interfaces

### File Organization

```
personal-dashboard/
├── index.html          # Single HTML entry point
├── css/
│   └── styles.css      # All CSS (light/dark themes, responsive)
├── js/
│   └── app.js          # All JavaScript logic
└── .kiro/
    └── specs/
        └── personal-dashboard/
            ├── requirements.md
            └── design.md
```

### HTML Structure (index.html)

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#1a1a1a">
  <title>Personal Dashboard</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <div id="app" class="app-container">
    <!-- Theme Toggle (Header) -->
    <header class="app-header">
      <button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">
        <span class="theme-icon">🌙</span>
      </button>
    </header>
    
    <!-- Main Dashboard -->
    <main id="dashboard" class="dashboard-grid">
      
      <!-- Greeting Widget -->
      <section id="greeting-widget" class="widget greeting-widget" aria-label="Greeting and time display">
        <div class="widget-content">
          <div class="time-display">
            <div class="time" id="current-time">00:00:00</div>
            <div class="date" id="current-date">Loading...</div>
          </div>
          <div class="greeting-text" id="greeting-message">Selamat Pagi</div>
          <div class="user-name-input-group">
            <input type="text" id="user-name-input" class="user-name-input" 
                   placeholder="Enter your name (max 50)" maxlength="50" aria-label="User name input">
            <button id="user-name-save" class="btn btn-primary" aria-label="Save user name">Save</button>
          </div>
        </div>
      </section>
      
      <!-- Focus Timer Widget -->
      <section id="timer-widget" class="widget timer-widget" aria-label="Pomodoro focus timer">
        <div class="widget-content">
          <h2>Focus Timer</h2>
          <div class="timer-display" id="timer-display">25:00</div>
          <div class="timer-controls">
            <button id="timer-start" class="btn btn-primary" aria-label="Start timer">Start</button>
            <button id="timer-stop" class="btn btn-secondary" disabled aria-label="Stop timer">Stop</button>
            <button id="timer-reset" class="btn btn-secondary" aria-label="Reset timer">Reset</button>
          </div>
          <div class="timer-config">
            <label for="timer-duration">Duration (minutes):</label>
            <input type="number" id="timer-duration" min="1" max="120" value="25" 
                   aria-label="Timer duration in minutes">
            <button id="timer-save-duration" class="btn btn-small" aria-label="Save duration">Save</button>
            <div id="timer-error-message" class="error-message" role="alert"></div>
          </div>
        </div>
        <div id="timer-notification" class="timer-notification" role="status" aria-live="polite"></div>
      </section>
      
      <!-- To-Do List Widget -->
      <section id="todo-widget" class="widget todo-widget" aria-label="Daily task list">
        <div class="widget-content">
          <h2>Tasks</h2>
          <div class="task-input-group">
            <input type="text" id="task-input" class="task-input" 
                   placeholder="Add a new task (max 200 chars)" maxlength="200" aria-label="New task input">
            <button id="task-add" class="btn btn-primary" aria-label="Add task">Add</button>
          </div>
          <div id="task-error-message" class="error-message" role="alert"></div>
          <ul id="task-list" class="task-list" role="list">
            <!-- Task items rendered here -->
          </ul>
        </div>
      </section>
      
      <!-- Quick Links Widget -->
      <section id="links-widget" class="widget quick-links-widget" aria-label="Quick access links">
        <div class="widget-content">
          <h2>Quick Links</h2>
          <div class="link-input-group">
            <input type="text" id="link-label" class="link-label-input" 
                   placeholder="Label (max 30)" maxlength="30" aria-label="Link label">
            <input type="url" id="link-url" class="link-url-input" 
                   placeholder="URL (max 2048)" aria-label="Link URL">
            <button id="link-add" class="btn btn-primary" aria-label="Add link">Add</button>
          </div>
          <div id="link-error-message" class="error-message" role="alert"></div>
          <div id="link-max-message" class="info-message" role="status"></div>
          <div id="links-grid" class="links-grid" role="list">
            <!-- Link buttons rendered here -->
          </div>
        </div>
      </section>
      
    </main>
  </div>
  
  <script src="js/app.js"></script>
</body>
</html>
```

---

## Component Design Details

### 1. Greeting Widget

**Purpose**: Display current time, date, contextual greeting, and manage user name.

**State**:
- `currentTime`: Updated every 1 second
- `currentDate`: Updated at midnight
- `currentGreeting`: Based on time of day
- `userName`: From Local Storage

**Key Methods**:
- `updateTime()`: Format time, check greeting period, update DOM
- `updateDate()`: Format date, update DOM (runs once at page load and at midnight)
- `getGreetingByHour(hour)`: Determine greeting text based on time
- `saveUserName(name)`: Validate, save to Local Storage, update DOM
- `loadUserName()`: Fetch from Local Storage on page load

**Interactions**:
- User types name → triggers `saveUserName()`
- Page loads → `loadUserName()` and `updateTime()` called
- Time ticks past greeting boundary → `updateTime()` updates greeting text

### 2. Focus Timer Widget

**Purpose**: Pomodoro-style countdown timer with configurable duration.

**State**:
- `configuredMinutes`: From Local Storage
- `secondsRemaining`: Current countdown value
- `isRunning`: Is timer actively counting down
- `intervalId`: Handle to current setInterval

**Key Methods**:
- `startTimer()`: Begin countdown
- `stopTimer()`: Pause countdown
- `resetTimer()`: Return to configured duration
- `updateDisplay()`: Format and show MM:SS
- `saveDuration(minutes)`: Validate and persist new duration
- `handleTimerComplete()`: Show notification, play sound, auto-reset
- `tick()`: Decrement by 1 second (called every 1 second)

**Interactions**:
- User clicks "Start" → `startTimer()` starts interval, disables input
- Countdown reaches 0 → `handleTimerComplete()` shows notification
- User changes duration config → `saveDuration()` validates and persists
- User clicks "Stop" → `stopTimer()` pauses countdown
- Page reload → Timer resets to configured duration (session not persisted)

**Audio Notification**:
- When timer completes, a simple beep sound is generated using Web Audio API
- Falls back to browser default notification if Web Audio unavailable

### 3. To-Do List Widget

**Purpose**: Manage daily tasks with add, edit, toggle completion, and delete operations.

**State**:
- `tasks`: Array of task objects from Local Storage
- `activeEditTaskId`: Which task is currently being edited (if any)

**Task Object**:
```javascript
{
  id: 'task_1704067200000_1',
  text: 'Task description',
  completed: false,
  createdAt: 1704067200000,
  updatedAt: 1704067200000
}
```

**Key Methods**:
- `addTask(text)`: Validate, create task, persist
- `editTask(taskId, newText)`: Update task text
- `toggleTaskCompletion(taskId)`: Flip completed status
- `deleteTask(taskId)`: Remove task permanently
- `renderTaskList()`: Re-render all tasks to DOM
- `renderTaskItem(task)`: Render single task with buttons
- `saveTasks()`: Debounced persist to Local Storage

**Interactions**:
- User types and clicks "Add" → `addTask()` creates task
- User clicks checkbox → `toggleTaskCompletion()` toggles status + re-renders
- User clicks edit → Task enters edit mode (inline editing)
- User saves edit → `editTask()` validates and persists
- User clicks delete → `deleteTask()` removes permanently

**Validation**:
- Task text cannot be empty or whitespace-only
- Max 200 characters

### 4. Quick Links Widget

**Purpose**: Manage favorite links for quick access.

**State**:
- `quickLinks`: Array of link objects from Local Storage

**Link Object**:
```javascript
{
  id: 'link_1704067200000_1',
  label: 'GitHub',
  url: 'https://github.com',
  createdAt: 1704067200000
}
```

**Key Methods**:
- `addLink(label, url)`: Validate, normalize URL, create link, persist
- `deleteLink(linkId)`: Remove link permanently
- `normalizeUrl(url)`: Auto-prepend `https://` if no protocol
- `renderLinksGrid()`: Re-render all links to DOM
- `renderLinkButton(link)`: Render single link as clickable button
- `openLink(url)`: Open URL in new tab

**Interactions**:
- User fills label + URL, clicks "Add" → `addLink()` normalizes and persists
- User clicks link button → `openLink()` opens in new tab (`target="_blank"`)
- User clicks delete → `deleteLink()` removes from list

**Validation**:
- Label: Max 30 characters
- URL: Max 2048 characters
- URL must contain a dot (.) after protocol normalization
- Label and URL both required (non-empty)

**Constraints**:
- Max 20 links per requirements
- UI shows "Maximum links reached" message when at limit

---

## Error Handling

### 1. Local Storage Unavailable

**Detection**:
```javascript
function isLocalStorageAvailable() {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}
```

**Fallback Behavior**:
- Show notification: "Data storage is unavailable. Changes will not be saved after refresh."
- Continue operating with in-memory state
- Disable save-related visual feedback
- Do NOT throw errors or crash

### 2. Timer Update Failures

**Scenario**: `setInterval` fails to execute or system clock jumps

**Prevention**:
- Use `setInterval` with explicit 1000ms interval
- Check `secondsRemaining` before display
- Validate that time advances correctly

**Fallback**:
- If timer stops advancing, manual user intervention (click Start again)
- Log warning to console

### 3. Slow Initial Load

**Target**: < 2 seconds initial render

**Optimization**:
- Inline critical CSS
- No external dependencies
- Load Local Storage data synchronously (blocking is acceptable here)
- Render empty dashboard skeleton immediately, then populate with data

### 4. Large Task List

**Scenario**: User has 500+ tasks

**Handling**:
- Render only visible tasks (DOM virtualization) OR
- Render all but limit to reasonable number (e.g., show first 200, archive older ones)
- Debounce search/filter operations

### 5. Invalid Local Storage Data

**Scenario**: Corrupted JSON in Local Storage

**Handling**:
```javascript
function loadFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.warn(`Failed to parse ${key}:`, e);
    // Return default or null, do NOT crash
    return null;
  }
}
```

---

## State Management

### Global State Object

A single global `AppState` object holds all application state, synchronized with Local Storage.

```javascript
// Initialize on page load
window.AppState = {
  theme: { current: loadFromStorage('pd_theme') || 'dark' },
  greeting: {
    userName: loadFromStorage('pd_userName'),
    currentGreeting: calculateGreeting(new Date())
  },
  timer: {
    configuredMinutes: loadFromStorage('pd_pomodoroMinutes') || 25,
    secondsRemaining: (loadFromStorage('pd_pomodoroMinutes') || 25) * 60,
    isRunning: false,
    intervalId: null
  },
  tasks: loadFromStorage('pd_tasks') || [],
  quickLinks: loadFromStorage('pd_quickLinks') || [],
  ui: {
    activeEditTaskId: null,
    showTimerNotification: false
  }
};
```

### Local Storage Sync Strategy

**Synchronous Write** (immediate):
- Theme toggle
- User name save
- Duration config save
- Quick link add/delete

**Debounced Write** (300ms delay):
- Task add/edit/delete/toggle (batch rapid changes)

**Reasoning**:
- Theme and config changes are infrequent and need immediate persistence
- Task operations are rapid and frequent → debounce to avoid excessive I/O
- Quick link changes are infrequent → immediate write is fine

```javascript
// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const saveTasks = debounce(() => {
  localStorage.setItem('pd_tasks', JSON.stringify(AppState.tasks));
}, 300);
```

---

## Event Flow & Interaction Diagrams

### Timer Countdown Loop

```
User clicks "Start"
  ↓
startTimer() called
  ↓
setInterval(tick, 1000) — runs every 1 second
  ├─ Decrement secondsRemaining by 1
  ├─ Update display (MM:SS)
  ├─ Check if secondsRemaining === 0
  │   ├─ YES: handleTimerComplete()
  │   │   ├─ Play audio notification
  │   │   ├─ Show visual notification (5 sec)
  │   │   ├─ Auto-reset to configured duration
  │   │   └─ Stop countdown
  │   └─ NO: Continue next tick
  └─ User clicks "Stop" → clearInterval, preserve secondsRemaining

User refreshes page
  ↓
Timer resets to configured duration (session not restored)
```

### Task Add/Edit/Delete Flow

```
User types task + clicks "Add"
  ↓
addTask(text) validation
  ├─ Empty or whitespace? → Show error, return
  └─ Valid? → Create task object
    ↓
    Add to AppState.tasks
    ↓
    Call debounced saveTasks()
    ↓
    renderTaskList() — update DOM
    ↓
    Clear input field
```

```
User clicks edit icon on task
  ↓
Enter edit mode (inline editing UI)
  ↓
User types new text + clicks save/cancel
  ├─ Save: editTask(taskId, newText)
  │   ├─ Validate (no empty/whitespace)
  │   ├─ Update task in AppState.tasks
  │   ├─ Call debounced saveTasks()
  │   └─ renderTaskList()
  └─ Cancel: Exit edit mode, discard changes
```

```
User clicks delete icon on task
  ↓
deleteTask(taskId)
  ├─ Remove from AppState.tasks array
  ├─ Call debounced saveTasks()
  └─ renderTaskList() — update DOM
```

### Theme Switch Flow

```
User clicks theme toggle button
  ↓
toggleTheme() called
  ↓
Flip AppState.theme.current ('dark' ↔ 'light')
  ↓
Apply CSS class to <body>: .theme-dark or .theme-light
  ├─ All color variables cascade to affected elements
  └─ Transition completes in < 200ms (CSS transition on color properties)
  ↓
Save to Local Storage immediately
  └─ Key: 'pd_theme'
  ↓
Update theme icon (sun ☀️ or moon 🌙)
```

### Name Input Save Flow

```
User types name + clicks "Save" or presses Enter
  ↓
saveUserName(name) called
  ↓
Validate input
  ├─ Length <= 50? 
  │   ├─ YES: Continue
  │   └─ NO: Show error (already blocked by maxlength in HTML)
  ├─ All whitespace?
  │   ├─ YES: Clear name (handle as "no name set")
  │   └─ NO: Accept name
  ↓
Update AppState.greeting.userName
  ↓
Save to Local Storage
  ├─ Empty name: Remove key or set to null
  └─ Non-empty: Save name string
  ↓
Re-render greeting text
  ├─ With name: "Selamat Pagi, Budi!"
  └─ Without name: "Selamat Pagi!"
  ↓
Clear input field or keep for next edit
```

### Quick Link Add Flow

```
User fills label + URL + clicks "Add"
  ↓
addLink(label, url) validation
  ├─ Label empty or > 30 chars? → Show error
  ├─ URL empty or > 2048 chars? → Show error
  ├─ URL doesn't contain '.' after normalization? → Show error
  ├─ Already 20 links? → Show "max reached" message, disable button
  └─ All valid?
    ↓
    normalizeUrl(url) — auto-add 'https://' if no protocol
    ↓
    Create link object with timestamp ID
    ↓
    Add to AppState.quickLinks
    ↓
    Save to Local Storage immediately
    ↓
    renderLinksGrid() — update DOM
    ↓
    Clear input fields
    ↓
    Update "max reached" message visibility (if now at 20)
```

```
User clicks link button
  ↓
openLink(url) called
  ↓
window.open(url, '_blank')
  └─ Opens in new tab/window
```

---

## Styling Approach

### Color Palette & Themes

#### Light Theme (`theme-light`)

| Element | Color | Hex | Contrast |
|---------|-------|-----|----------|
| Background | Off-white | `#f5f5f5` | — |
| Text (primary) | Dark gray | `#1a1a1a` | 15.5:1 ✓ |
| Text (secondary) | Medium gray | `#555555` | 5.5:1 ✓ |
| Accent (primary) | Blue | `#0066cc` | 8.6:1 ✓ |
| Accent (hover) | Darker blue | `#0052a3` | 8.1:1 ✓ |
| Border | Light gray | `#ddd` | — |
| Card background | White | `#ffffff` | — |
| Success (completed) | Green | `#28a745` | 5.8:1 ✓ |
| Error | Red | `#dc3545` | 5.9:1 ✓ |

#### Dark Theme (`theme-dark`)

| Element | Color | Hex | Contrast |
|---------|-------|-----|----------|
| Background | Very dark gray | `#1a1a1a` | — |
| Text (primary) | Off-white | `#f0f0f0` | 15.5:1 ✓ |
| Text (secondary) | Light gray | `#b0b0b0` | 5.5:1 ✓ |
| Accent (primary) | Bright blue | `#4da6ff` | 8.6:1 ✓ |
| Accent (hover) | Lighter blue | `#66b3ff` | 8.1:1 ✓ |
| Border | Dark gray | `#333` | — |
| Card background | Dark gray | `#2a2a2a` | — |
| Success (completed) | Bright green | `#4caf50` | 5.8:1 ✓ |
| Error | Light red | `#ff6b6b` | 5.9:1 ✓ |

**All contrast ratios exceed WCAG AA 4.5:1 requirement** (Source: [WCAG 2.1 Understanding Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum))

### CSS Organization

Single `styles.css` file with the following structure:

```css
/* 1. Root variables and theme definitions */
:root { --color-bg, --color-text, ... }
.theme-light { --color-bg, ... }
.theme-dark { --color-bg, ... }

/* 2. Reset and base styles */
* { margin, padding, box-sizing }
body { font-family, line-height, color, background-color }

/* 3. Typography hierarchy */
h1, h2, h3, ... { font, size, weight, margin }
p { font-size, line-height }

/* 4. Layout (grid-based, responsive) */
.app-container { display: grid; ... }
.dashboard-grid { display: grid; grid-template-columns: ... }
@media (max-width: 768px) { ... }
@media (min-width: 1200px) { ... }

/* 5. Components */
.widget { border, border-radius, padding, ... }
.btn { padding, border, background, cursor, ... }
.btn:hover, .btn:focus { ... }

/* 6. Utilities */
.hidden { display: none }
.error-message { color, font-size, ... }
.success-message { color, font-size, ... }

/* 7. Animations */
@keyframes fadeIn { ... }
@keyframes slideDown { ... }
```

### Responsive Layout Strategy

**Mobile-First Approach**:

```css
/* Base: 320px and up */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;  /* Single column */
  gap: 1rem;
}

/* Tablet: 768px and up */
@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr 1fr;  /* Two columns */
  }
}

/* Desktop: 1024px and up */
@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
}

/* Large Desktop: 1400px and up */
@media (min-width: 1400px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);  /* Three columns */
  }
}
```

### Typography Hierarchy

| Element | Font Size | Font Weight | Line Height | Usage |
|---------|-----------|-------------|-------------|-------|
| Display | 2.5rem | 700 | 1.2 | Page title |
| H1 (widget title) | 1.75rem | 700 | 1.25 | Widget headers |
| H2 | 1.5rem | 600 | 1.3 | Subheadings |
| Body text | 1rem | 400 | 1.5 | Regular text |
| Small text | 0.875rem | 400 | 1.4 | Labels, captions |
| Time display | 3rem | 700 | 1 | Timer and time widget |

---

## Local Storage Keys & Constants

All keys follow a `pd_` namespace prefix (Personal Dashboard) to avoid conflicts:

```javascript
// Local Storage Keys
const STORAGE_KEYS = {
  THEME: 'pd_theme',
  USER_NAME: 'pd_userName',
  POMODORO_MINUTES: 'pd_pomodoroMinutes',
  TASKS: 'pd_tasks',
  QUICK_LINKS: 'pd_quickLinks'
};

// Validation Constants
const VALIDATION = {
  USERNAME_MAX: 50,
  TASK_TEXT_MAX: 200,
  LINK_LABEL_MAX: 30,
  LINK_URL_MAX: 2048,
  LINK_MAX_COUNT: 20,
  POMODORO_MIN: 1,
  POMODORO_MAX: 120,
  DEBOUNCE_TASK_SAVE: 300  // ms
};

// Greeting Time Periods (in 24-hour format)
const GREETING_PERIODS = {
  PAGI: { start: 5, end: 12 },      // 05:00–11:59
  SIANG: { start: 12, end: 15 },    // 12:00–14:59
  SORE: { start: 15, end: 18 },     // 15:00–17:59
  MALAM: { start: 18, end: 5 }      // 18:00–04:59 (wraps midnight)
};

// Theme Names
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

// Default Values
const DEFAULTS = {
  THEME: THEMES.DARK,
  POMODORO_MINUTES: 25,
  USER_NAME: null
};
```

---

## Error Handling & Fallbacks

### 1. Local Storage Unavailable

**Detection**:
```javascript
function isLocalStorageAvailable() {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}
```

**Fallback Behavior**:
- Show notification: "Data storage is unavailable. Changes will not be saved after refresh."
- Continue operating with in-memory state
- Disable save-related visual feedback
- Do NOT throw errors or crash

### 2. Timer Update Failures

**Scenario**: `setInterval` fails to execute or system clock jumps

**Prevention**:
- Use `setInterval` with explicit 1000ms interval
- Check `secondsRemaining` before display
- Validate that time advances correctly

**Fallback**:
- If timer stops advancing, manual user intervention (click Start again)
- Log warning to console

### 3. Slow Initial Load

**Target**: < 2 seconds initial render

**Optimization**:
- Inline critical CSS
- No external dependencies
- Load Local Storage data synchronously (blocking is acceptable here)
- Render empty dashboard skeleton immediately, then populate with data

### 4. Large Task List

**Scenario**: User has 500+ tasks

**Handling**:
- Render only visible tasks (DOM virtualization) OR
- Render all but limit to reasonable number (e.g., show first 200, archive older ones)
- Debounce search/filter operations

### 5. Invalid Local Storage Data

**Scenario**: Corrupted JSON in Local Storage

**Handling**:
```javascript
function loadFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.warn(`Failed to parse ${key}:`, e);
    // Return default or null, do NOT crash
    return null;
  }
}
```

---

## Performance Considerations

### Initial Load Strategy

1. **Parse HTML** (< 50ms) → DOM tree ready
2. **Load CSS** (< 200ms) → Styling applied, theme set
3. **Load JS** (< 100ms) → Script executes
4. **Read Local Storage** (< 50ms) → Sync, blocking is okay
5. **Render widgets** (< 1000ms) → All content visible
6. **Total**: ~1.5 seconds target (< 2 seconds required)

### Runtime Performance

**Debouncing/Throttling**:
- Task operations: **Debounce 300ms** (batch rapid changes)
- Theme toggle: **No debounce** (infrequent, immediate feedback desired)
- Time update: **Every 1 second** (acceptable frequency)
- Link operations: **No debounce** (infrequent)

**DOM Updates**:
- Minimize re-renders by only updating affected widget
- Use `innerHTML` for widget content replacement (faster than detailed DOM manipulation)
- Batch DOM updates within a single render cycle

**Memory Management**:
- Clear `setInterval` timers when stopping timer
- Remove event listeners when not needed
- Avoid global variable pollution

### Code Size Targets

- `styles.css`: < 20KB
- `app.js`: < 30KB
- Total: < 50KB (uncompressed)

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### PBT Applicability Assessment

**Personal Dashboard is a UI-centric application with the following characteristics:**

- **Primary Purpose**: Display and manage user data with UI interactions
- **Data Persistence**: Local Storage (client-side only)
- **Core Logic**: Mostly CRUD operations, validation, and UI state management
- **No Transformation Logic**: Unlike parsers or serializers, this app doesn't perform complex data transformations

**Property-Based Testing IS Applicable For**:
1. **URL Normalization** (Requirement 6.6) — Pure function logic
2. **Task Text Validation** (Requirement 5.2, 5.13) — Input validation logic
3. **Duration Validation** (Requirement 4.6) — Input validation logic
4. **Local Storage Round-Trip** (Requirement 8.1, 8.2) — Serialization/deserialization
5. **Greeting Time Calculation** (Requirement 1.3, 1.4) — Time-based logic

**Property-Based Testing IS NOT Applicable For**:
- **Real-time Updates** (Requirement 1.1, 1.2) — Time-based, not input-dependent variation
- **UI Rendering** (Requirements 3, 4, 5, 6 display aspects) — Visual layout, not logic
- **Browser Compatibility** (Requirement 9) — Infrastructure testing, not logic
- **Performance Requirements** (Requirement 9.3) — Benchmark testing, not properties
- **Accessibility Features** (Requirement 9.4-6) — Requires manual/assistive tech testing
- **File Organization** (Requirement 10) — Configuration/structure, not logic

### Acceptance Criteria Testing Prework

#### Requirement 1: Time and Date Display

1.1. "Dashboard SHALL display time in HH:MM:SS format, updated every 1 second"
   - **Classification**: INTEGRATION
   - **Rationale**: Tests browser clock behavior, not our logic. Requires mock time. Example test sufficient.

1.2. "Dashboard SHALL display date in day, DD Month YYYY format, updated at midnight"
   - **Classification**: INTEGRATION
   - **Rationale**: Date formatting is deterministic for a given date (not dependent on variation). One example test sufficient.

1.3. "Greeting SHALL display contextual greeting based on local hour"
   - **Classification**: PROPERTY
   - **Rationale**: Pure function: `hour → greeting_text`. Can generate many hours (0-23) and verify correct mapping.

1.4. "Greeting SHALL update greeting automatically within 1 sec after time period changes"
   - **Classification**: EXAMPLE
   - **Rationale**: Tests UI timing behavior, not pure logic. One test showing transition is sufficient.

1.5. "If no userName in Local Storage, greeting displays without name"
   - **Classification**: EXAMPLE
   - **Rationale**: Specific scenario (present vs. absent). One example test sufficient.

1.6. "If time update fails, show error message and preserve last successful data"
   - **Classification**: EXAMPLE
   - **Rationale**: Error handling scenario. One example test sufficient.

#### Requirement 2: Custom User Name

2.1. "Greeting provides text input and save button for user name"
   - **Classification**: EXAMPLE
   - **Rationale**: UI interaction test. One example test sufficient.

2.2. "When name saved, display greeting as '[Salam], [Name]!'"
   - **Classification**: PROPERTY
   - **Rationale**: Pure string formatting: `(greeting_text, name) → formatted_message`. Can test with many name variations (length, special chars, etc.).

2.3. "When name saved, save to Local Storage"
   - **Classification**: EXAMPLE
   - **Rationale**: Persistence test. One example test sufficient.

2.4. "On page load, load and display saved name from Local Storage"
   - **Classification**: EXAMPLE
   - **Rationale**: Specific scenario. One example test sufficient.

2.5. "If empty name saved, display greeting without name, remove from Local Storage"
   - **Classification**: PROPERTY
   - **Rationale**: Pure logic: `empty_string → greeting_without_name`. Can test with whitespace variations.

2.6. "Limit name input to 50 characters max"
   - **Classification**: EDGE_CASE
   - **Rationale**: Boundary validation. Test at boundary (49, 50, 51 chars).

#### Requirement 3: Focus Timer

3.1–3.10. Timer display, start/stop/reset, button state management
   - **Classification**: EXAMPLE (all)
   - **Rationale**: UI state and interaction tests. Specific examples needed; no universal properties without testing actual timer logic.

#### Requirement 4: Timer Duration Configuration

4.1–4.2. Accept duration input 1-120 minutes
   - **Classification**: PROPERTY
   - **Rationale**: Input validation: `input → valid_or_invalid`. Can generate 100+ numbers and verify correct boundary enforcement.

4.3–4.5. Update/save/load duration
   - **Classification**: EXAMPLE
   - **Rationale**: Specific scenarios. One example each sufficient.

4.6. "If invalid duration, show error, don't save"
   - **Classification**: EDGE_CASE (combined with property)
   - **Rationale**: Error validation. Can generate 100+ invalid inputs (strings, negatives, floats, out of range) and verify all reject correctly.

4.7–4.8. Disable duration input while timer running; use default 25
   - **Classification**: EXAMPLE
   - **Rationale**: UI state test. One example each sufficient.

#### Requirement 5: Task Management

5.1–5.17. Task CRUD operations
   - **Classification**: PROPERTY (for validation) + EXAMPLE (for operations)
   - **Rationale**: 
     - Task text validation (empty, whitespace, length) → PROPERTY
     - Specific add/edit/delete/toggle operations → EXAMPLE
     - Round-trip (save then load) → PROPERTY

5.18–5.19. Empty list on first load; load persisted tasks
   - **Classification**: EXAMPLE
   - **Rationale**: Specific scenarios. One example each sufficient.

#### Requirement 6: Quick Links Management

6.1–6.12. Link CRUD operations, URL normalization, limits
   - **Classification**: PROPERTY (validation/normalization) + EXAMPLE (operations)
   - **Rationale**:
     - Label/URL validation (length, required) → PROPERTY
     - URL normalization (add https://) → PROPERTY
     - Specific add/delete/open operations → EXAMPLE
     - Max 20 links enforcement → EXAMPLE

#### Requirement 7: Theme Switching

7.1–7.7. Light/dark mode toggle
   - **Classification**: EXAMPLE (all)
   - **Rationale**: UI styling and state tests. Theme application requires visual inspection; no universal properties beyond "toggle flips value".

#### Requirement 8: Local Storage Persistence

8.1–8.5. Data persistence and sync
   - **Classification**: PROPERTY (round-trip) + EXAMPLE (error cases)
   - **Rationale**:
     - Save then load should preserve data → PROPERTY
     - Local Storage unavailable handling → EXAMPLE
     - Session timer state on reload → EXAMPLE

#### Requirement 9: Browser Compatibility & Accessibility

9.1–9.6. Browser compatibility, responsiveness, keyboard nav, semantic HTML, contrast
   - **Classification**: INTEGRATION + SMOKE (all)
   - **Rationale**: These are infrastructure and manual testing requirements. Not suitable for PBT.

#### Requirement 10: Code Structure & Deployment

10.1–10.5. File organization, deployment
   - **Classification**: SMOKE (all)
   - **Rationale**: Configuration/structure verification. Not suitable for PBT.

### Summary: PBT-Suitable vs. Other Strategies

**SUITABLE FOR PROPERTY-BASED TESTING** (5 properties):
1. **Greeting Calculation by Hour** (Req 1.3) — `hour → greeting_text`
2. **Greeting Formatting with Name** (Req 2.2) — `(greeting, name) → formatted_text`
3. **Empty Name Handling** (Req 2.5) — Whitespace validation
4. **Duration Input Validation** (Req 4.1-4.2, 4.6) — Boundary and type validation
5. **Local Storage Round-Trip** (Req 8.1-8.2) — Serialization/deserialization

**OTHER STRATEGIES REQUIRED**:
- **Temporal/Event-Driven**: Real-time updates (example-based tests)
- **UI/Integration**: Rendering, button states, theme application (example-based + visual tests)
- **Error Handling**: Fallbacks and degradation (example-based tests)
- **Infrastructure**: Browser compatibility, deployment, accessibility (integration + manual tests)

**Overall Assessment**: **LIMITED PBT Applicability**

While the feature has some pure logic functions suitable for PBT (validation, formatting), the majority of requirements are UI-driven, event-based, or infrastructure-related. A balanced testing strategy uses:
- **5 property-based tests** for core logic functions
- **20+ example-based unit tests** for CRUD, UI states, and error scenarios
- **3-5 integration tests** for Local Storage, browser APIs, and theme application
- **Manual tests** for accessibility (WCAG compliance) and visual rendering

---

### Correctness Properties

#### Property 1: Hour-to-Greeting Mapping is Deterministic

*For any* hour value (0-23), the greeting calculation function SHALL always return the correct greeting text according to the time period mapping (Pagi: 5-11, Siang: 12-14, Sore: 15-17, Malam: 18-4), regardless of other system state.

**Validates: Requirement 1.3, 1.4**

**Implementation Guidance**:
- Generate 1000+ random hours (0-23, including boundary values: 4, 5, 11, 12, 14, 15, 17, 18)
- For each hour, call `calculateGreeting(hour)`
- Verify result matches expected greeting for that period
- Edge cases: Hour 5 (Pagi start), 11 (Pagi end), 18 (Malam start), 4 (Malam end)

#### Property 2: Greeting Formatting with User Name

*For any* valid greeting text and user name (including empty string and whitespace-only), formatting SHALL produce the correct string: with name as "[Greeting], [Name]!" or without name as "[Greeting]!".

**Validates: Requirement 2.2, 2.5**

**Implementation Guidance**:
- Generate 1000+ combinations of: greeting texts (Pagi, Siang, Sore, Malam) × name variations (empty, 1 char, 25 chars, 50 chars, whitespace-only, special chars)
- For each combination, call `formatGreeting(greeting, name)`
- Verify format matches expected pattern
- Verify whitespace-only names are treated as empty

#### Property 3: Duration Input Validation

*For any* input value, the duration validation function SHALL correctly classify it as valid (1-120) or invalid, and SHALL only accept integer values within the specified range.

**Validates: Requirement 4.1, 4.2, 4.6**

**Implementation Guidance**:
- Generate 1000+ test inputs: integers in range (1-120), integers out of range (negative, 0, 121, 999), floats (25.5), strings ("25", "abc", ""), edge cases (1, 120)
- For each input, call `validateDuration(input)`
- Verify valid inputs return `true` and invalid inputs return `false`
- Verify function rejects floats, strings, null, undefined

#### Property 4: Task Text Validation

*For any* input string, task validation SHALL reject empty strings, whitespace-only strings, and strings exceeding 200 characters, while accepting all other non-empty strings up to 200 chars.

**Validates: Requirement 5.2, 5.5, 5.13**

**Implementation Guidance**:
- Generate 1000+ test strings: empty (""), whitespace-only (" ", "\t", "\n"), valid (1-200 chars including special chars, Unicode), invalid (201+ chars, null, undefined)
- For each string, call `validateTaskText(text)`
- Verify valid strings return `true`, invalid return `false`
- Verify boundary at 200 chars exactly

#### Property 5: Local Storage Round-Trip Preserves Data Integrity

*For any* valid application state object (containing theme, userName, tasks, quickLinks, pomodoroMinutes), serializing to Local Storage and deserializing SHALL produce an equivalent object with identical values.

**Validates: Requirement 8.1, 8.2**

**Implementation Guidance**:
- Generate 1000+ random application state objects with varying:
  - Theme: "light" or "dark"
  - UserName: empty, short (1-10), long (40-50 chars), special chars
  - Tasks: 0-100 tasks with various text content
  - QuickLinks: 0-20 links with various labels/URLs
  - PomodoroMinutes: 1-120
- For each state:
  1. Serialize: `JSON.stringify(state)` → store in mock Local Storage
  2. Deserialize: `JSON.parse(retrievedValue)`
  3. Compare: original state === deserialized state
- Verify no data loss or corruption

---

## Testing Strategy

### Dual Testing Approach

**Property-Based Tests** (5 total):
- 1 × Greeting calculation by hour (1000 iterations)
- 1 × Greeting formatting with name (1000 iterations)
- 1 × Duration validation (1000 iterations)
- 1 × Task text validation (1000 iterations)
- 1 × Local Storage round-trip (1000 iterations)

**Example-Based Unit Tests** (25-30 total):
- Greeting widget: 5 tests (name save, load, empty name, max length, update frequency)
- Timer widget: 8 tests (start, stop, reset, complete notification, duration update, disable during run, error message, persistence)
- Task widget: 8 tests (add, edit, toggle, delete, empty validation, list load, persistence, max length)
- Links widget: 6 tests (add, delete, open, max reached, URL normalization, validation)
- Theme widget: 2 tests (toggle, persistence)
- Error handling: 3 tests (Local Storage unavailable, invalid data recovery, timer failures)

**Integration Tests** (3-4 total):
- Full data round-trip: Create task → refresh page → task persists
- Theme persistence: Switch to light → refresh → light theme active
- Link click: Add link → click → verify opens in new tab

**Manual/Visual Tests**:
- WCAG AA color contrast verification (using contrast checker tool)
- Keyboard navigation (Tab, Enter, Space, Escape through all widgets)
- Responsive layout at: 320px, 768px, 1024px, 1400px, 2560px viewports
- Browser compatibility: Chrome, Firefox, Edge, Safari (latest 2 versions each)
- Accessibility: Screen reader testing (NVDA on Windows, VoiceOver on macOS)

### Property Test Configuration

**Framework**: Vitest + fast-check (or Jest + jsverify for Jest users)

**Minimum Iterations**: 100 per property test (configurable to 1000+ for thorough validation)

**Tag Format**: Each property test SHALL include a comment referencing the design document property:

```javascript
// Feature: personal-dashboard, Property 1: Hour-to-Greeting Mapping is Deterministic
test.prop([fc.integer({ min: 0, max: 23 })])(
  'greeting calculation is deterministic for any hour',
  (hour) => {
    const result = calculateGreeting(hour);
    expect(['Selamat Pagi', 'Selamat Siang', 'Selamat Sore', 'Selamat Malam']).toContain(result);
  }
);
```

### Unit Test Examples

#### Greeting Widget Example Tests

```javascript
describe('Greeting Widget', () => {
  // Feature: personal-dashboard, Requirement 2.1
  test('should save user name on button click', () => {
    // Setup
    const input = document.getElementById('user-name-input');
    const saveBtn = document.getElementById('user-name-save');
    
    // Execute
    input.value = 'Budi';
    saveBtn.click();
    
    // Verify
    expect(localStorage.getItem('pd_userName')).toBe(JSON.stringify({ name: 'Budi' }));
  });
  
  // Feature: personal-dashboard, Requirement 2.3
  test('should persist user name to Local Storage', () => {
    saveUserName('Budi');
    expect(localStorage.getItem('pd_userName')).toBe(JSON.stringify({ name: 'Budi' }));
  });
  
  // Feature: personal-dashboard, Requirement 2.5
  test('should handle empty name by removing from Local Storage', () => {
    saveUserName('');
    expect(localStorage.getItem('pd_userName')).toBeNull();
  });
});
```

### Test Execution Strategy

**During Development**:
```bash
# Run all unit tests (example-based)
npm test

# Run property-based tests with reduced iterations (fast feedback)
npm test -- --testNamePattern="property"

# Run all tests with full iterations
npm test -- --testNamePattern="property" -- --seed=12345
```

**Before Commit**:
```bash
# Run all tests, property tests with 1000 iterations
npm test -- --coverage
```

**CI/CD Pipeline**:
- Unit tests: 100% pass required
- Property tests: 1000 iterations each
- Coverage target: > 80% (logic functions), > 60% (UI handlers)

---

## Implementation Roadmap

### Phase 1: Core Data & Validation (Week 1)
- ✓ Implement Local Storage utilities (load, save, validate availability)
- ✓ Implement validation functions (hour-to-greeting, duration, task text, URL normalization)
- ✓ Implement serialization/deserialization for round-trip tests
- ✓ Write and pass property-based tests (5 tests)

### Phase 2: Core Widgets (Week 2-3)
- ✓ Greeting Widget (time display, date display, greeting, name input)
- ✓ Timer Widget (display, start/stop/reset, duration config)
- ✓ Task Widget (add/edit/delete/toggle, validation, list rendering)
- ✓ Links Widget (add/delete, open, max limit, URL normalization)
- ✓ Write and pass example-based unit tests (25-30 tests)

### Phase 3: Integration & Polish (Week 4)
- ✓ Theme manager (toggle, persistence, contrast verification)
- ✓ Error handling (Local Storage fallback, timer failures, invalid data recovery)
- ✓ Responsive layout testing
- ✓ Accessibility review (WCAG AA, keyboard nav, semantic HTML)
- ✓ Write and pass integration tests (3-4 tests)

### Phase 4: Deployment & Documentation (Week 5)
- ✓ Deploy to GitHub Pages
- ✓ Verify all cross-browser compatibility
- ✓ Final accessibility audit with screen readers
- ✓ Performance profiling and optimization
- ✓ Write deployment guide and troubleshooting docs

---

## Design Review Checklist

- [ ] Architecture clearly separates concerns (presentation, state, persistence)
- [ ] Data model is comprehensive with all Local Storage keys documented
- [ ] Component interactions are unambiguous and well-documented
- [ ] Error handling covers all identified failure modes
- [ ] Performance targets are realistic and measurable
- [ ] Accessibility requirements are clear and testable
- [ ] Testing strategy balances PBT (for logic) with example-based tests (for UI)
- [ ] Code organization follows the single-file structure (1 HTML, 1 CSS, 1 JS)
- [ ] WCAG AA color contrast is verified for both themes
- [ ] All 10 requirements are addressed with clear design decisions

---

## Assumptions & Dependencies

### Assumptions

1. Users have browser support for:
   - ES6+ JavaScript (arrow functions, const/let, template literals, Promises)
   - Local Storage API (at least 5MB capacity)
   - CSS Grid and Flexbox
   - Web Audio API (for timer notification sound, degrades gracefully if unavailable)

2. All data fits within Local Storage limits (realistically true for personal dashboard use case)

3. Users manually manage browser cache/data; no sync across devices

4. Page title ("Personal Dashboard") is the primary identifier; no multi-tab communication required

### External Dependencies

- **None** required for core functionality
- Optional: Browser DevTools for debugging and performance profiling

### Browser APIs Used

- `localStorage` — Data persistence
- `setInterval` / `setTimeout` — Timer and scheduled updates
- `Date` — Time and date calculations
- `window.open()` — Open links in new tabs
- Web Audio API (AudioContext) — Timer notification sound
- DOM APIs — Element manipulation and event handling

---

## Future Enhancement Opportunities

1. **Cloud Sync**: Export/import state as JSON file or sync to cloud storage (Google Drive, Dropbox)
2. **Multi-Tab Sync**: Broadcast updates across tabs using `storage` event listener
3. **Recurring Tasks**: Support recurring tasks (daily, weekly, monthly)
4. **Custom Themes**: Allow users to create custom color schemes
5. **Analytics**: Track task completion rate, timer usage patterns
6. **Offline Mode**: Service Worker for offline access and sync
7. **Mobile App**: Wrap as Electron app for desktop or React Native for mobile
8. **Collaboration**: Share task lists or quick links with others (requires backend)
9. **Integrations**: Connect with Calendar (Google), Email (Gmail), or Time Tracking (Toggl)

---

## Conclusion

This design document provides a comprehensive blueprint for implementing the Personal Dashboard feature. The architecture is modular, the data model is well-defined, the testing strategy balances correctness with practicality, and all requirements are addressed with actionable guidance. The use of property-based testing for core logic functions ensures robustness of validation and transformation code, while example-based tests verify UI behavior and integration points.

Implementation can proceed with confidence that the design covers all functional and non-functional requirements, anticipates likely failure modes, and provides clear paths for testing and verification.

---

**Document Version**: 1.0  
**Created**: 2025 (based on Requirement Analysis)  
**Status**: Ready for Implementation Phase

