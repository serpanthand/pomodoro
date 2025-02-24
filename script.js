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

function loadPomodoroSettings() {
  const savedWorkTime = localStorage.getItem('workTime');
  const savedShortBreak = localStorage.getItem('shortBreak');
  const savedLongBreak = localStorage.getItem('longBreak');
  const savedSessions = localStorage.getItem('sessionsBeforeLongBreak');

  workTime = savedWorkTime ? parseInt(savedWorkTime) : workTime;
  shortBreak = savedShortBreak ? parseInt(savedShortBreak) : shortBreak;
  longBreak = savedLongBreak ? parseInt(savedLongBreak) : longBreak;
  sessionsBeforeLongBreak = savedSessions ? parseInt(savedSessions) : sessionsBeforeLongBreak;

  document.getElementById('work').value = workTime / 60;
  document.getElementById('shortBreak').value = shortBreak / 60;
  document.getElementById('longBreak').value = longBreak / 60;
  document.getElementById('sessions').value = sessionsBeforeLongBreak;
  updateDisplay(workTime);
}

function savePomodoroSettings() {
  localStorage.setItem('workTime', workTime);
  localStorage.setItem('shortBreak', shortBreak);
  localStorage.setItem('longBreak', longBreak);
  localStorage.setItem('sessionsBeforeLongBreak', sessionsBeforeLongBreak);
}

function updateDisplay(time) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  if (time === 0) {
    timeDisplay.style.animation = 'pulse 0.5s ease 2';
    setTimeout(() => timeDisplay.style.animation = '', 1000);
  }
}

function startTimer() {
  if (!isRunning) {
    isRunning = true;
    startButton.style.background = '#00c4cc';
    pauseButton.style.background = '';
    interval = setInterval(() => {
      if (isWorkTime && workTime > 0) {
        workTime--;
        updateDisplay(workTime);
        if (workTime === 0) {
          sessionCount++;
          sessionCountDisplay.textContent = sessionCount;
          isWorkTime = false;
          workTime = parseInt(document.getElementById('work').value) * 60;
          longBreak = sessionCount % sessionsBeforeLongBreak === 0 ? parseInt(document.getElementById('longBreak').value) * 60 : shortBreak;
        }
      } else if (!isWorkTime && (shortBreak > 0 || longBreak > 0)) {
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
    }, 1000);
  }
}

function pauseTimer() {
  if (isRunning) {
    isRunning = false;
    clearInterval(interval);
    startButton.style.background = '';
    pauseButton.style.background = '#00c4cc';
  }
}

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
  startButton.style.background = '';
  pauseButton.style.background = '';
  timeDisplay.style.animation = '';
}

function validateInput(inputId) {
  const input = document.getElementById(inputId);
  const value = parseInt(input.value);
  if (isNaN(value) || value < 1) {
    input.value = 1; // Default to 1 if invalid
    return 60; // Return 1 minute in seconds
  }
  return value * 60;
}

startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);

document.getElementById('work').addEventListener('change', () => {
  workTime = validateInput('work');
  savePomodoroSettings();
  if (!isRunning) updateDisplay(workTime);
});
document.getElementById('shortBreak').addEventListener('change', () => {
  shortBreak = validateInput('shortBreak');
  savePomodoroSettings();
});
document.getElementById('longBreak').addEventListener('change', () => {
  longBreak = validateInput('longBreak');
  savePomodoroSettings();
});
document.getElementById('sessions').addEventListener('change', () => {
  const sessionsInput = document.getElementById('sessions');
  sessionsBeforeLongBreak = parseInt(sessionsInput.value) < 1 ? 1 : parseInt(sessionsInput.value);
  sessionsInput.value = sessionsBeforeLongBreak;
  savePomodoroSettings();
});

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
  for (let i = 0; i < 6 && date <= daysInMonth; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < 7; j++) {
      const cell = document.createElement('td');
      if (i === 0 && j < startingDay) {
        cell.textContent = '';
      } else if (date <= daysInMonth) {
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

// Weekly Planner and Task Bar Logic
const weekRange = document.getElementById('week-range');
const daysRemaining = document.getElementById('days-remaining');
const taskInputWeek = document.getElementById('task-week');
const addTaskWeekButton = document.getElementById('addTaskWeek');
const taskListWeek = document.getElementById('task-list-week');
const taskInput = document.getElementById('task');
const addTaskButton = document.getElementById('addTask');
const taskList = document.getElementById('task-list');

function getWeekRange() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  return `${startOfWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
}

function getDaysRemaining() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysRemainingInWeek = 6 - dayOfWeek + (dayOfWeek === 0 ? 0 : 1);
  return `${daysRemainingInWeek} day${daysRemainingInWeek !== 1 ? 's' : ''} remaining`;
}

function renderWeeklyPlanner() {
  weekRange.textContent = getWeekRange();
  daysRemaining.textContent = getDaysRemaining();
}

function loadTasks(listId, storageKey) {
  const savedTasks = JSON.parse(localStorage.getItem(storageKey)) || [];
  const list = document.getElementById(listId);
  savedTasks.forEach(taskText => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${taskText}</span><button onclick="completeTask(this, '${listId}', '${storageKey}')"></button>`;
    list.appendChild(li);
  });
}

function saveTasks(listId, storageKey) {
  const list = document.getElementById(listId);
  const tasks = Array.from(list.children).map(li => li.querySelector('span').textContent);
  localStorage.setItem(storageKey, JSON.stringify(tasks));
}

function addTask(input, list, storageKey) {
  const taskText = input.value.trim();
  if (taskText) {
    const li = document.createElement('li');
    li.innerHTML = `<span>${taskText}</span><button onclick="completeTask(this, '${list.id}', '${storageKey}')"></button>`;
    list.appendChild(li);
    input.value = '';
    saveTasks(list.id, storageKey);
  }
}

function completeTask(button, listId, storageKey) {
  const li = button.parentElement;
  button.classList.add('clicked'); // Trigger checkbox animation
  setTimeout(() => {
    li.classList.add('fade-out');
    setTimeout(() => {
      li.remove();
      saveTasks(listId, storageKey);
    }, 500); // Match fade-out duration
  }, 200); // Delay to show checkbox fill
}

renderWeeklyPlanner();
loadTasks('task-list-week', 'weeklyTasks');
loadTasks('task-list', 'taskBarTasks');

addTaskWeekButton.addEventListener('click', () => addTask(taskInputWeek, taskListWeek, 'weeklyTasks'));
taskInputWeek.addEventListener('keypress', (e) => e.key === 'Enter' && addTask(taskInputWeek, taskListWeek, 'weeklyTasks'));
addTaskButton.addEventListener('click', () => addTask(taskInput, taskList, 'taskBarTasks'));
taskInput.addEventListener('keypress', (e) => e.key === 'Enter' && addTask(taskInput, taskList, 'taskBarTasks'));
