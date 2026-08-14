/* ============================================================================
   Personal Dashboard - Application Logic
   ============================================================================ */

// ============================================================================
// 1. Local Storage & Persistence Utilities
// ============================================================================

/**
 * Check if Local Storage is available and working
 * @returns {boolean} True if Local Storage is available
 */
function isLocalStorageAvailable() {
  try {
    const test = '__pd_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    console.warn('Local Storage is not available:', e);
    return false;
  }
}

/**
 * Load data from Local Storage with error handling
 * @param {string} key - The Local Storage key
 * @returns {any} Parsed data or null if not found or invalid
 */
function loadFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.warn(`Failed to parse ${key} from Local Storage:`, e);
    return null;
  }
}

/**
 * Save data to Local Storage with error handling
 * @param {string} key - The Local Storage key
 * @param {any} data - Data to save (will be JSON stringified)
 * @returns {boolean} True if successful, false otherwise
 */
function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error(`Failed to save ${key} to Local Storage:`, e);
    return false;
  }
}

// ============================================================================
// 2. Validation Functions
// ============================================================================

/**
 * Validate user name (max 50 characters)
 * @param {string} name - The name to validate
 * @returns {object} { isValid: boolean, error: string|null }
 */
function validateUserName(name) {
  if (typeof name !== 'string') {
    return { isValid: false, error: 'Name must be a string' };
  }
  if (name.length > 50) {
    return { isValid: false, error: 'Name must not exceed 50 characters' };
  }
  return { isValid: true, error: null };
}

/**
 * Validate task text (max 200 characters, non-empty, not just whitespace)
 * @param {string} text - The task text to validate
 * @returns {object} { isValid: boolean, error: string|null }
 */
function validateTaskText(text) {
  if (typeof text !== 'string') {
    return { isValid: false, error: 'Task text must be a string' };
  }
  if (text.trim().length === 0) {
    return { isValid: false, error: 'Task cannot be empty or contain only whitespace' };
  }
  if (text.length > 200) {
    return { isValid: false, error: 'Task must not exceed 200 characters' };
  }
  return { isValid: true, error: null };
}

/**
 * Validate link label (max 30 characters, non-empty)
 * @param {string} label - The link label to validate
 * @returns {object} { isValid: boolean, error: string|null }
 */
function validateLinkLabel(label) {
  if (typeof label !== 'string') {
    return { isValid: false, error: 'Label must be a string' };
  }
  if (label.trim().length === 0) {
    return { isValid: false, error: 'Label cannot be empty' };
  }
  if (label.length > 30) {
    return { isValid: false, error: 'Label must not exceed 30 characters' };
  }
  return { isValid: true, error: null };
}

/**
 * Validate link URL (max 2048 characters, non-empty, must contain a dot after normalization)
 * @param {string} url - The URL to validate
 * @returns {object} { isValid: boolean, error: string|null }
 */
function validateLinkUrl(url) {
  if (typeof url !== 'string') {
    return { isValid: false, error: 'URL must be a string' };
  }
  if (url.trim().length === 0) {
    return { isValid: false, error: 'URL cannot be empty' };
  }
  if (url.length > 2048) {
    return { isValid: false, error: 'URL must not exceed 2048 characters' };
  }

  // Normalize URL: add https:// if no protocol
  const normalizedUrl = url.trim().startsWith('http') ? url : `https://${url}`;

  // Check if URL contains a dot (basic validation)
  if (!normalizedUrl.includes('.')) {
    return { isValid: false, error: 'URL must contain a valid domain' };
  }

  return { isValid: true, error: null };
}

/**
 * Validate timer duration (1-120 minutes, must be integer)
 * @param {any} minutes - The duration to validate
 * @returns {object} { isValid: boolean, error: string|null }
 */
function validateTimerDuration(minutes) {
  // Check if it's an integer
  if (!Number.isInteger(minutes)) {
    return { isValid: false, error: 'Duration must be a whole number' };
  }
  // Check range
  if (minutes < 1 || minutes > 120) {
    return { isValid: false, error: 'Duration must be between 1 and 120 minutes' };
  }
  return { isValid: true, error: null };
}

/**
 * Normalize URL by adding https:// if no protocol present
 * @param {string} url - The URL to normalize
 * @returns {string} Normalized URL
 */
function normalizeUrl(url) {
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

// ============================================================================
// 3. Local Storage Keys & Constants
// ============================================================================

const STORAGE_KEYS = {
  THEME: 'pd_theme',
  USER_NAME: 'pd_userName',
  POMODORO_MINUTES: 'pd_pomodoroMinutes',
  TASKS: 'pd_tasks',
  QUICK_LINKS: 'pd_quickLinks'
};

const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

const DEFAULTS = {
  THEME: THEMES.DARK,
  POMODORO_MINUTES: 25,
  USER_NAME: null
};

// ============================================================================
// 4. Global Application State
// ============================================================================

window.AppState = {
  // Theme
  theme: {
    current: DEFAULTS.THEME
  },

  // Greeting
  greeting: {
    userName: DEFAULTS.USER_NAME,
    currentGreeting: 'Selamat Pagi',
    currentTime: '00:00:00',
    currentDate: 'Loading...'
  },

  // Timer
  timer: {
    configuredMinutes: DEFAULTS.POMODORO_MINUTES,
    secondsRemaining: DEFAULTS.POMODORO_MINUTES * 60,
    isRunning: false,
    intervalId: null
  },

  // Tasks
  tasks: [],

  // Quick Links
  quickLinks: [],

  // UI State
  ui: {
    activeEditTaskId: null,
    showTimerNotification: false,
    timerNotificationTimeoutId: null,
    localStorageAvailable: false
  }
};

// ============================================================================
// 5. Initialization
// ============================================================================

/**
 * Initialize application state from Local Storage and setup DOM
 */
function initializeApp() {
  console.log('Initializing Personal Dashboard...');

  // Check Local Storage availability
  AppState.ui.localStorageAvailable = isLocalStorageAvailable();
  if (!AppState.ui.localStorageAvailable) {
    console.warn('Local Storage is not available. Data will not persist across sessions.');
    showNotification(
      'Local Storage is unavailable. Changes will not be saved after refresh.',
      'warning'
    );
  }

  // Load theme from Local Storage
  const savedTheme = loadFromStorage(STORAGE_KEYS.THEME);
  if (savedTheme && (savedTheme === THEMES.LIGHT || savedTheme === THEMES.DARK)) {
    AppState.theme.current = savedTheme;
  }

  // Load user name from Local Storage
  const savedUserName = loadFromStorage(STORAGE_KEYS.USER_NAME);
  if (savedUserName && typeof savedUserName === 'string') {
    AppState.greeting.userName = savedUserName;
  }

  // Load Pomodoro duration from Local Storage
  const savedMinutes = loadFromStorage(STORAGE_KEYS.POMODORO_MINUTES);
  if (savedMinutes && Number.isInteger(savedMinutes) && savedMinutes >= 1 && savedMinutes <= 120) {
    AppState.timer.configuredMinutes = savedMinutes;
    AppState.timer.secondsRemaining = savedMinutes * 60;
  }

  // Load tasks from Local Storage
  const savedTasks = loadFromStorage(STORAGE_KEYS.TASKS);
  if (Array.isArray(savedTasks)) {
    AppState.tasks = savedTasks;
  }

  // Load quick links from Local Storage
  const savedLinks = loadFromStorage(STORAGE_KEYS.QUICK_LINKS);
  if (Array.isArray(savedLinks)) {
    AppState.quickLinks = savedLinks;
  }

  // Apply theme to DOM
  applyTheme(AppState.theme.current);

  // Update greeting text based on current time
  updateGreetingText();

  // Update time and date display
  updateTimeDisplay();

  // Setup event listeners
  setupEventListeners();

  // Log state for debugging
  console.log('AppState initialized:', AppState);
}

/**
 * Apply theme CSS class to body element
 * @param {string} theme - The theme to apply ('light' or 'dark')
 */
function applyTheme(theme) {
  const body = document.body;
  body.classList.remove('theme-light', 'theme-dark');
  body.classList.add(`theme-${theme}`);
  console.log(`Theme applied: ${theme}`);
}

/**
 * Update greeting text based on current hour
 */
function updateGreetingText() {
  const hour = new Date().getHours();
  let greeting = 'Selamat Pagi';

  if (hour >= 5 && hour < 12) {
    greeting = 'Selamat Pagi';
  } else if (hour >= 12 && hour < 15) {
    greeting = 'Selamat Siang';
  } else if (hour >= 15 && hour < 18) {
    greeting = 'Selamat Sore';
  } else {
    greeting = 'Selamat Malam';
  }

  AppState.greeting.currentGreeting = greeting;

  // Update DOM
  const greetingEl = document.getElementById('greeting-message');
  if (greetingEl) {
    if (AppState.greeting.userName) {
      greetingEl.textContent = `${greeting}, ${AppState.greeting.userName}!`;
    } else {
      greetingEl.textContent = greeting;
    }
  }
}

/**
 * Update time and date display
 */
function updateTimeDisplay() {
  const now = new Date();

  // Format time as HH:MM:SS
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const timeString = `${hours}:${minutes}:${seconds}`;

  // Format date as Day, DD Month YYYY (Indonesian)
  const monthsInd = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const daysInd = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dayName = daysInd[now.getDay()];
  const dateNum = String(now.getDate()).padStart(2, '0');
  const monthName = monthsInd[now.getMonth()];
  const year = now.getFullYear();
  const dateString = `${dayName}, ${dateNum} ${monthName} ${year}`;

  // Update AppState
  AppState.greeting.currentTime = timeString;
  AppState.greeting.currentDate = dateString;

  // Update DOM
  const timeEl = document.getElementById('current-time');
  const dateEl = document.getElementById('current-date');
  if (timeEl) timeEl.textContent = timeString;
  if (dateEl) dateEl.textContent = dateString;
}

/**
 * Setup event listeners for all interactive elements
 */
function setupEventListeners() {
  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', handleThemeToggle);
  }

  // User name save
  const userNameInput = document.getElementById('user-name-input');
  const userNameSave = document.getElementById('user-name-save');
  if (userNameInput && userNameSave) {
    userNameSave.addEventListener('click', handleUserNameSave);
    userNameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleUserNameSave();
    });
  }

  // Timer controls
  const timerStart = document.getElementById('timer-start');
  const timerStop = document.getElementById('timer-stop');
  const timerReset = document.getElementById('timer-reset');
  const timerDuration = document.getElementById('timer-duration');
  const timerSaveDuration = document.getElementById('timer-save-duration');

  if (timerStart) timerStart.addEventListener('click', handleTimerStart);
  if (timerStop) timerStop.addEventListener('click', handleTimerStop);
  if (timerReset) timerReset.addEventListener('click', handleTimerReset);
  if (timerSaveDuration) timerSaveDuration.addEventListener('click', handleTimerSaveDuration);
  if (timerDuration) {
    timerDuration.addEventListener('change', () => {
      // Clear error when user changes duration
      const errorEl = document.getElementById('timer-error-message');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('show');
      }
    });
  }

  // Task input
  const taskInput = document.getElementById('task-input');
  const taskAdd = document.getElementById('task-add');
  if (taskAdd) {
    taskAdd.addEventListener('click', handleTaskAdd);
  }
  if (taskInput) {
    taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleTaskAdd();
    });
  }

  // Link input
  const linkAdd = document.getElementById('link-add');
  if (linkAdd) {
    linkAdd.addEventListener('click', handleLinkAdd);
  }

  // Update time every second
  setInterval(() => {
    updateTimeDisplay();
    updateGreetingText(); // Also check if greeting should change
  }, 1000);

  console.log('Event listeners attached');
}

// ============================================================================
// 6. Event Handlers
// ============================================================================

function handleThemeToggle() {
  const newTheme = AppState.theme.current === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
  AppState.theme.current = newTheme;
  applyTheme(newTheme);
  if (AppState.ui.localStorageAvailable) {
    saveToStorage(STORAGE_KEYS.THEME, newTheme);
  }
  console.log(`Theme toggled to: ${newTheme}`);
}

// ============================================================================
// 7. Greeting Widget Handlers
// ============================================================================

function handleUserNameSave() {
  const input = document.getElementById('user-name-input');
  if (!input) return;

  const name = input.value.trim();
  const validation = validateUserName(name);

  if (!validation.isValid) {
    console.error('Invalid name:', validation.error);
    return;
  }

  AppState.greeting.userName = name;
  updateGreetingText();

  if (AppState.ui.localStorageAvailable) {
    if (name) {
      saveToStorage(STORAGE_KEYS.USER_NAME, name);
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER_NAME);
    }
  }

  console.log(`User name saved: ${name || '(empty)'}`);
}

// ============================================================================
// 8. Focus Timer Widget Handlers
// ============================================================================

function handleTimerStart() {
  if (AppState.timer.isRunning) return;

  AppState.timer.isRunning = true;
  updateTimerButtonStates();

  // Disable duration input
  const durationInput = document.getElementById('timer-duration');
  if (durationInput) durationInput.disabled = true;

  // Start the countdown
  AppState.timer.intervalId = setInterval(() => {
    AppState.timer.secondsRemaining--;

    if (AppState.timer.secondsRemaining <= 0) {
      handleTimerComplete();
    } else {
      updateTimerDisplay();
    }
  }, 1000);

  updateTimerDisplay();
  console.log('Timer started');
}

function handleTimerStop() {
  if (!AppState.timer.isRunning) return;

  AppState.timer.isRunning = false;
  if (AppState.timer.intervalId) {
    clearInterval(AppState.timer.intervalId);
    AppState.timer.intervalId = null;
  }

  updateTimerButtonStates();
  console.log('Timer stopped');
}

function handleTimerReset() {
  if (AppState.timer.intervalId) {
    clearInterval(AppState.timer.intervalId);
    AppState.timer.intervalId = null;
  }

  AppState.timer.isRunning = false;
  AppState.timer.secondsRemaining = AppState.timer.configuredMinutes * 60;

  updateTimerDisplay();
  updateTimerButtonStates();

  // Re-enable duration input
  const durationInput = document.getElementById('timer-duration');
  if (durationInput) durationInput.disabled = false;

  console.log('Timer reset');
}

function handleTimerComplete() {
  // Stop the timer
  if (AppState.timer.intervalId) {
    clearInterval(AppState.timer.intervalId);
    AppState.timer.intervalId = null;
  }

  AppState.timer.isRunning = false;

  // Show notification
  showTimerNotification('Sesi selesai!');

  // Play audio
  playTimerAudio();

  // Auto-reset to configured duration
  AppState.timer.secondsRemaining = AppState.timer.configuredMinutes * 60;

  // Update display and buttons
  updateTimerDisplay();
  updateTimerButtonStates();

  // Re-enable duration input
  const durationInput = document.getElementById('timer-duration');
  if (durationInput) durationInput.disabled = false;

  console.log('Timer completed');
}

function handleTimerSaveDuration() {
  const input = document.getElementById('timer-duration');
  if (!input) return;

  const minutes = parseInt(input.value, 10);
  const validation = validateTimerDuration(minutes);
  const errorEl = document.getElementById('timer-error-message');

  if (!validation.isValid) {
    if (errorEl) {
      errorEl.textContent = validation.error;
      errorEl.classList.add('show');
    }
    console.error('Invalid duration:', validation.error);
    return;
  }

  // If timer is running, don't allow duration change (handled by disabled state)
  if (AppState.timer.isRunning) {
    if (errorEl) {
      errorEl.textContent = 'Cannot change duration while timer is running';
      errorEl.classList.add('show');
    }
    return;
  }

  AppState.timer.configuredMinutes = minutes;
  AppState.timer.secondsRemaining = minutes * 60;

  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('show');
  }

  if (AppState.ui.localStorageAvailable) {
    saveToStorage(STORAGE_KEYS.POMODORO_MINUTES, minutes);
  }

  updateTimerDisplay();
  console.log(`Timer duration saved: ${minutes} minutes`);
}

function updateTimerDisplay() {
  const minutes = Math.floor(AppState.timer.secondsRemaining / 60);
  const seconds = AppState.timer.secondsRemaining % 60;
  const displayStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const timerDisplay = document.getElementById('timer-display');
  if (timerDisplay) {
    timerDisplay.textContent = displayStr;
  }
}

function updateTimerButtonStates() {
  const startBtn = document.getElementById('timer-start');
  const stopBtn = document.getElementById('timer-stop');

  if (startBtn) {
    startBtn.disabled = AppState.timer.isRunning;
  }

  if (stopBtn) {
    stopBtn.disabled = !AppState.timer.isRunning;
  }
}

function showTimerNotification(message) {
  const notifEl = document.getElementById('timer-notification');
  if (!notifEl) return;

  notifEl.textContent = message;
  notifEl.classList.add('show');

  // Clear any existing timeout
  if (AppState.ui.timerNotificationTimeoutId) {
    clearTimeout(AppState.ui.timerNotificationTimeoutId);
  }

  // Hide after 5 seconds
  AppState.ui.timerNotificationTimeoutId = setTimeout(() => {
    notifEl.classList.remove('show');
    AppState.ui.timerNotificationTimeoutId = null;
  }, 5000);
}

function playTimerAudio() {
  // Create a simple beep using Web Audio API
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800; // Hz
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);

    console.log('Timer audio played');
  } catch (e) {
    console.warn('Could not play timer audio:', e);
  }
}

// ============================================================================
// 9. Task Widget Handlers
// ============================================================================

function handleTaskAdd() {
  const input = document.getElementById('task-input');
  if (!input) return;

  const text = input.value.trim();
  const validation = validateTaskText(text);
  const errorEl = document.getElementById('task-error-message');

  if (!validation.isValid) {
    if (errorEl) {
      errorEl.textContent = validation.error;
      errorEl.classList.add('show');
    }
    console.error('Invalid task:', validation.error);
    return;
  }

  // Clear error
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('show');
  }

  // Create task object
  const now = Date.now();
  const counter = AppState.tasks.length > 0 ? 
    Math.max(...AppState.tasks.map(t => parseInt(t.id.split('_')[2], 10) || 0)) + 1 : 
    1;
  const taskId = `task_${now}_${counter}`;

  const task = {
    id: taskId,
    text: text,
    completed: false,
    createdAt: now,
    updatedAt: now
  };

  AppState.tasks.push(task);
  saveTasks();
  renderTaskList();

  // Clear input
  input.value = '';
  input.focus();

  console.log(`Task added: ${text}`);
}

function handleTaskToggle(taskId) {
  const task = AppState.tasks.find(t => t.id === taskId);
  if (!task) return;

  task.completed = !task.completed;
  task.updatedAt = Date.now();
  saveTasks();
  renderTaskList();

  console.log(`Task toggled: ${taskId}`);
}

function handleTaskEdit(taskId) {
  const task = AppState.tasks.find(t => t.id === taskId);
  if (!task) return;

  AppState.ui.activeEditTaskId = taskId;
  renderTaskList();
}

function handleTaskSaveEdit(taskId, newText) {
  const task = AppState.tasks.find(t => t.id === taskId);
  if (!task) return;

  const validation = validateTaskText(newText);
  if (!validation.isValid) {
    console.error('Invalid task text:', validation.error);
    showNotification(validation.error, 'error');
    return;
  }

  task.text = newText;
  task.updatedAt = Date.now();
  AppState.ui.activeEditTaskId = null;
  saveTasks();
  renderTaskList();

  console.log(`Task edited: ${taskId}`);
}

function handleTaskCancelEdit() {
  AppState.ui.activeEditTaskId = null;
  renderTaskList();
}

function handleTaskDelete(taskId) {
  const index = AppState.tasks.findIndex(t => t.id === taskId);
  if (index === -1) return;

  const removedTask = AppState.tasks.splice(index, 1)[0];
  saveTasks();
  renderTaskList();

  console.log(`Task deleted: ${removedTask.text}`);
}

function renderTaskList() {
  const taskList = document.getElementById('task-list');
  if (!taskList) return;

  if (AppState.tasks.length === 0) {
    taskList.innerHTML = '<li style="text-align: center; color: var(--text-secondary); padding: var(--spacing-md);">No tasks yet. Add one to get started!</li>';
    return;
  }

  taskList.innerHTML = AppState.tasks.map((task, index) => {
    if (AppState.ui.activeEditTaskId === task.id) {
      // Edit mode
      return `
        <li class="task-item" id="task-edit-${index}">
          <input type="text" class="task-edit-input" id="edit-input-${index}" value="${escapeHtml(task.text)}" maxlength="200" autofocus>
          <div class="task-actions">
            <button class="btn btn-small btn-primary" onclick="handleTaskSaveEditById('${task.id}', 'edit-input-${index}')">Save</button>
            <button class="btn btn-small btn-secondary" onclick="handleTaskCancelEdit()">Cancel</button>
          </div>
        </li>
      `;
    }

    // View mode
    return `
      <li class="task-item ${task.completed ? 'completed' : ''}">
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="handleTaskToggle('${task.id}')">
        <span class="task-text">${escapeHtml(task.text)}</span>
        <div class="task-actions">
          <button class="btn btn-small btn-secondary" onclick="handleTaskEdit('${task.id}')">Edit</button>
          <button class="btn btn-small btn-danger" onclick="handleTaskDelete('${task.id}')">Delete</button>
        </div>
      </li>
    `;
  }).join('');

  // Add event listeners to edit inputs for Enter/Escape keys
  AppState.tasks.forEach((task, index) => {
    if (AppState.ui.activeEditTaskId === task.id) {
      const editInput = document.getElementById(`edit-input-${index}`);
      if (editInput) {
        editInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            handleTaskSaveEdit(task.id, editInput.value);
          }
        });
        editInput.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            handleTaskCancelEdit();
          }
        });
      }
    }
  });
}

function handleTaskSaveEditById(taskId, inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  handleTaskSaveEdit(taskId, input.value);
}

// Debounced save for tasks
let taskSaveTimeout;
function saveTasks() {
  clearTimeout(taskSaveTimeout);
  taskSaveTimeout = setTimeout(() => {
    if (AppState.ui.localStorageAvailable) {
      saveToStorage(STORAGE_KEYS.TASKS, AppState.tasks);
    }
    console.log('Tasks saved to Local Storage');
  }, 300);
}

// ============================================================================
// 10. Quick Links Widget Handlers
// ============================================================================

function handleLinkAdd() {
  const labelInput = document.getElementById('link-label');
  const urlInput = document.getElementById('link-url');
  if (!labelInput || !urlInput) return;

  const label = labelInput.value.trim();
  const url = urlInput.value.trim();

  const labelValidation = validateLinkLabel(label);
  const urlValidation = validateLinkUrl(url);
  const errorEl = document.getElementById('link-error-message');

  if (!labelValidation.isValid) {
    if (errorEl) {
      errorEl.textContent = `Label: ${labelValidation.error}`;
      errorEl.classList.add('show');
    }
    return;
  }

  if (!urlValidation.isValid) {
    if (errorEl) {
      errorEl.textContent = `URL: ${urlValidation.error}`;
      errorEl.classList.add('show');
    }
    return;
  }

  // Check max links limit
  if (AppState.quickLinks.length >= 20) {
    if (errorEl) {
      errorEl.textContent = 'Maximum 20 links reached';
      errorEl.classList.add('show');
    }
    return;
  }

  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('show');
  }

  // Create link object
  const now = Date.now();
  const counter = AppState.quickLinks.length > 0 ? 
    Math.max(...AppState.quickLinks.map(l => parseInt(l.id.split('_')[2], 10) || 0)) + 1 : 
    1;
  const linkId = `link_${now}_${counter}`;

  const link = {
    id: linkId,
    label: label,
    url: normalizeUrl(url),
    createdAt: now
  };

  AppState.quickLinks.push(link);
  if (AppState.ui.localStorageAvailable) {
    saveToStorage(STORAGE_KEYS.QUICK_LINKS, AppState.quickLinks);
  }
  renderLinksGrid();

  // Clear inputs
  labelInput.value = '';
  urlInput.value = '';
  labelInput.focus();

  console.log(`Link added: ${label} -> ${link.url}`);
}

function handleLinkDelete(linkId) {
  const index = AppState.quickLinks.findIndex(l => l.id === linkId);
  if (index === -1) return;

  const removedLink = AppState.quickLinks.splice(index, 1)[0];
  if (AppState.ui.localStorageAvailable) {
    saveToStorage(STORAGE_KEYS.QUICK_LINKS, AppState.quickLinks);
  }
  renderLinksGrid();

  console.log(`Link deleted: ${removedLink.label}`);
}

function handleLinkOpen(url) {
  window.open(url, '_blank');
  console.log(`Link opened: ${url}`);
}

function renderLinksGrid() {
  const linksGrid = document.getElementById('links-grid');
  const maxMessage = document.getElementById('link-max-message');

  if (!linksGrid) return;

  if (AppState.quickLinks.length === 0) {
    linksGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: var(--spacing-md);">No links yet. Add your favorites!</div>';
  } else {
    linksGrid.innerHTML = AppState.quickLinks.map(link => `
      <div class="link-item" style="position: relative; display: flex; flex-direction: column; gap: var(--spacing-sm);">
        <button class="link-button" onclick="handleLinkOpen('${escapeHtml(link.url)}')">
          ${escapeHtml(link.label)}
        </button>
        <button class="btn btn-small btn-danger" style="width: 100%;" onclick="handleLinkDelete('${link.id}')">Delete</button>
      </div>
    `).join('');
  }

  // Update max message
  if (maxMessage) {
    if (AppState.quickLinks.length >= 20) {
      maxMessage.textContent = 'Maximum 20 links reached';
      maxMessage.classList.add('show');
    } else {
      maxMessage.textContent = '';
      maxMessage.classList.remove('show');
    }
  }
}

// ============================================================================
// 11. Utility Functions
// ============================================================================

/**
 * Escape HTML special characters
 * @param {string} text - The text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Show a notification message
 * @param {string} message - The message to show
 * @param {string} type - The notification type (info, warning, error, success)
 */
function showNotification(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
  // Could be extended to show UI notifications
}

// ============================================================================
// 12. Initial Render
// ============================================================================

function initialRender() {
  renderTaskList();
  renderLinksGrid();
  updateTimerDisplay();
  updateTimerButtonStates();

  // Load and display user name if saved
  const userNameInput = document.getElementById('user-name-input');
  if (userNameInput && AppState.greeting.userName) {
    userNameInput.value = AppState.greeting.userName;
  }

  // Set timer duration input to current value
  const timerDuration = document.getElementById('timer-duration');
  if (timerDuration) {
    timerDuration.value = AppState.timer.configuredMinutes;
  }
}

// ============================================================================
// 13. Document Ready & App Start
// ============================================================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    initialRender();
  });
} else {
  initializeApp();
  initialRender();
}
