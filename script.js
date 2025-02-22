// Pomodoro Timer Logic
let workTime = 25 * 60;
let shortBreak = 5 * 60;
let longBreak = 15 * 60;
let sessionsBeforeLongBreak = 4;
let sessionCount = 0;
let isWorkTime = true;
let isRunning = false;
let interval;

const timeDisplay = document.getElementById('time');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
const sessionCountDisplay = document.getElementById('sessionCount');

// Load Pomodoro settings from local storage
function loadPomodoroSettings() {
  const savedWorkTime = localStorage.getItem('workTime');
  const savedShortBreak = localStorage.getItem('shortBreak');
  const savedLongBreak = localStorage.getItem('longBreak');
  const savedSessions = localStorage.getItem('sessionsBeforeLongBreak');

  if (savedWorkTime) workTime = parseInt(savedWorkTime);
  if (savedShortBreak) shortBreak = parseInt(savedShortBreak);
  if (savedLongBreak) longBreak = parseInt(savedLongBreak);
  if (savedSessions) sessionsBeforeLongBreak = parseInt(savedSessions);

  document.getElementById('work').value = workTime / 60;
  document.getElementById('shortBreak').value = shortBreak / 60;
  document.getElementById('longBreak').value = longBreak / 60;
  document.getElementById('sessions').value = sessionsBeforeLongBreak;
  updateDisplay(workTime);
}

// Save Pomodoro settings to local storage
function savePomodoroSettings() {
  localStorage.setItem('workTime', workTime);
  localStorage.setItem('shortBreak', shortBreak);
  localStorage.setItem('longBreak', longBreak);
  localStorage.setItem('sessionsBeforeLongBreak', sessionsBeforeLongBreak);
}

// Update timer display
function updateDisplay(time) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Start the timer
function startTimer() {
  if (!isRunning) {
    isRunning = true;
    interval = setInterval(() => {
      if (workTime > 0 || shortBreak > 0 || longBreak > 0) {
        if (isWorkTime) {
          workTime--;
          updateDisplay(workTime);
          if (workTime === 0) {
            sessionCount++;
            sessionCountDisplay.textContent = sessionCount;
            if (sessionCount % sessionsBeforeLongBreak === 0) {
              isWorkTime = false;
              workTime = parseInt(document.getElementById('work').value) * 60;
            } else {
              isWorkTime = false;
              workTime = parseInt(document.getElementById('work').value) * 60;
            }
          }
        } else {
          if (sessionCount % sessionsBeforeLongBreak === 0) {
            longBreak--;
            updateDisplay(longBreak);
            if (longBreak === 0) {
              isWorkTime = true;
              longBreak = parseInt(document.getElementById('longBreak').value) * 60;
            }
          } else {
            shortBreak--;
            updateDisplay(shortBreak);
            if (shortBreak === 0) {
              isWorkTime = true;
              shortBreak = parseInt(document.getElementById('shortBreak').value) * 60;
            }
          }
        }
      } else {
        clearInterval(interval);
      }
    }, 1000);
  }
}

// Pause the timer
function pauseTimer() {
  if (isRunning) {
    isRunning = false;
    clearInterval(interval);
  }
}

// Reset the timer
function resetTimer() {
  isRunning = false;
  clearInterval(interval);
  workTime = parseInt(document.getElementById('work').value) * 60;
  shortBreak = parseInt(document.getElementById('shortBreak').value) * 60;
  longBreak = parseInt(document.getElementById('longBreak').value) * 60;
  sessionCount = 0;
  sessionCountDisplay.textContent = sessionCount;
  updateDisplay(workTime);
  savePomodoroSettings();
}

// Event Listeners for Pomodoro Timer
startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);

// Save settings when inputs change
document.getElementById('work').addEventListener('change', () => {
  workTime = parseInt(document.getElementById('work').value) * 60;
  savePomodoroSettings();
});
document.getElementById('shortBreak').addEventListener('change', () => {
  shortBreak = parseInt(document.getElementById('shortBreak').value) * 60;
  savePomodoroSettings();
});
document.getElementById('longBreak').addEventListener('change', () => {
  longBreak = parseInt(document.getElementById('longBreak').value) * 60;
  savePomodoroSettings();
});
document.getElementById('sessions').addEventListener('change', () => {
  sessionsBeforeLongBreak = parseInt(document.getElementById('sessions').value);
  savePomodoroSettings();
});

// Load Pomodoro settings on page load
loadPomodoroSettings();

// Clock and Calendar Logic
function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString();
  const date = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('current-time').textContent = time;
  document.getElementById('current-date').textContent = date;
}

setInterval(updateClock, 1000);
updateClock();

// Calendar Logic
function renderCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();

  const calendarBody = document.getElementById('calendar-body');
  calendarBody.innerHTML = '';

  let date = 1;
  for (let i = 0; i < 6; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < 7; j++) {
      const cell = document.createElement('td');
      if (i === 0 && j < startingDay) {
        cell.textContent = '';
      } else if (date > daysInMonth) {
        break;
      } else {
        cell.textContent = date;
        if (date === now.getDate()) {
          cell.classList.add('today');
        }
        date++;
      }
      row.appendChild(cell);
    }
    calendarBody.appendChild(row);
  }
}

renderCalendar();

// Weekly Planner Logic
const weekRange = document.getElementById('week-range');
const daysRemaining = document.getElementById('days-remaining');
const taskInputWeek = document.getElementById('task-week');
const addTaskWeekButton = document.getElementById('addTaskWeek');
const taskListWeek = document.getElementById('task-list-week');

// Get the current week range (Monday to Sunday)
function getWeekRange() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Start from Monday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Sunday

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
}

// Get the number of days remaining in the current week
function getDaysRemaining() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
  const daysRemainingInWeek = 6 - dayOfWeek; // Days from today to Sunday
  return `${daysRemainingInWeek} day${daysRemainingInWeek !== 1 ? 's' : ''} remaining`;
}

// Render the weekly planner
function renderWeeklyPlanner() {
  // Update week range and days remaining
  weekRange.textContent = getWeekRange();
  daysRemaining.textContent = getDaysRemaining();
}

// Load tasks from local storage
function loadTasks() {
  const savedTasks = JSON.parse(localStorage.getItem('weeklyTasks')) || [];
  savedTasks.forEach(taskText => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${taskText}</span>
      <button onclick="completeTaskForWeek(this)">✔️</button>
    `;
    taskListWeek.appendChild(li);
  });
}

// Save tasks to local storage
function saveTasks() {
  const tasks = Array.from(taskListWeek.children).map(li => li.querySelector('span').textContent);
  localStorage.setItem('weeklyTasks', JSON.stringify(tasks));
}

// Add a task for the week
function addTaskForWeek() {
  const taskText = taskInputWeek.value.trim();
  if (taskText !== "") {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${taskText}</span>
      <button onclick="completeTaskForWeek(this)">✔️</button>
    `;
    taskListWeek.appendChild(li);
    taskInputWeek.value = "";
    saveTasks();
  }
}

// Complete a task for the week
function completeTaskForWeek(button) {
  const li = button.parentElement;
  li.classList.add('fade-out');
  setTimeout(() => {
    li.remove();
    saveTasks();
  }, 500); // Remove after fade-out animation
}

// Initialize Weekly Planner
renderWeeklyPlanner();

// Load tasks on page load
loadTasks();

// Event Listeners for Weekly Planner
addTaskWeekButton.addEventListener('click', addTaskForWeek);
taskInputWeek.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addTaskForWeek();
  }
});

// Task Bar Logic
const taskInput = document.getElementById('task');
const addTaskButton = document.getElementById('addTask');
const taskList = document.getElementById('task-list');

// Load tasks from local storage
function loadTaskBarTasks() {
  const savedTasks = JSON.parse(localStorage.getItem('taskBarTasks')) || [];
  savedTasks.forEach(taskText => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${taskText}</span>
      <button onclick="completeTask(this)">✔️</button>
    `;
    taskList.appendChild(li);
  });
}

// Save tasks to local storage
function saveTaskBarTasks() {
  const tasks = Array.from(taskList.children).map(li => li.querySelector('span').textContent);
  localStorage.setItem('taskBarTasks', JSON.stringify(tasks));
}

// Add a task to the task bar
function addTask() {
  const taskText = taskInput.value.trim();
  if (taskText !== "") {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${taskText}</span>
      <button onclick="completeTask(this)">✔️</button>
    `;
    taskList.appendChild(li);
    taskInput.value = "";
    saveTaskBarTasks();
  }
}

// Complete a task in the task bar
function completeTask(button) {
  const li = button.parentElement;
  li.classList.add('fade-out');
  setTimeout(() => {
    li.remove();
    saveTaskBarTasks();
  }, 500); // Remove after fade-out animation
}

// Load task bar tasks on page load
loadTaskBarTasks();

// Event Listeners for Task Bar
addTaskButton.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addTask();
  }
});