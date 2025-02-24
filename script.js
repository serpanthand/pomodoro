// Ensure DOM is fully loaded before running script
document.addEventListener('DOMContentLoaded', () => {
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
  const streakCountDisplay = document.getElementById('streakCount');
  const soundToggle = document.getElementById('soundToggle');
  const historyToggle = document.getElementById('historyToggle');
  const historyList = document.getElementById('historyList');
  const endSound = new Audio('https://www.soundjay.com/buttons/beep-01a.mp3');

  // Initialize session history and streak from localStorage with error handling
  let sessionHistory = [];
  try {
    sessionHistory = JSON.parse(localStorage.getItem('sessionHistory')) || [];
  } catch (e) {
    console.error('Error parsing sessionHistory from localStorage:', e);
    sessionHistory = [];
  }

  let streak = 0;
  let lastSessionDate = null;
  try {
    streak = parseInt(localStorage.getItem('streak')) || 0;
    lastSessionDate = localStorage.getItem('lastSessionDate');
  } catch (e) {
    console.error('Error parsing streak or lastSessionDate from localStorage:', e);
    streak = 0;
    lastSessionDate = null;
  }

  function loadPomodoroSettings() {
    try {
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

      soundToggle.checked = localStorage.getItem('soundEnabled') === 'true';
      console.log('Pomodoro settings loaded:', { workTime, shortBreak, longBreak, sessionsBeforeLongBreak });
    } catch (e) {
      console.error('Error loading Pomodoro settings:', e);
    }
  }

  function savePomodoroSettings() {
    try {
      localStorage.setItem('workTime', workTime);
      localStorage.setItem('shortBreak', shortBreak);
      localStorage.setItem('longBreak', longBreak);
      localStorage.setItem('sessionsBeforeLongBreak', sessionsBeforeLongBreak);
      console.log('Pomodoro settings saved:', { workTime, shortBreak, longBreak, sessionsBeforeLongBreak });
    } catch (e) {
      console.error('Error saving Pomodoro settings:', e);
    }
  }

  function updateDisplay(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const totalTime = isWorkTime ? parseInt(document.getElementById('work').value) * 60 : 
                   (sessionCount % sessionsBeforeLongBreak === 0 ? parseInt(document.getElementById('longBreak').value) * 60 : parseInt(document.getElementById('shortBreak').value) * 60);
    const progress = totalTime ? ((totalTime - time) / totalTime) * 100 : 0;
    document.getElementById('progress').style.width = `${progress}%`;
    if (time === 0 && isRunning) {
      timeDisplay.style.animation = 'pulse 0.5s ease 2';
      setTimeout(() => timeDisplay.style.animation = '', 1000);
      if (soundToggle.checked) endSound.play();
      console.log('Timer completed:', isWorkTime ? 'Work' : 'Break');
    }
  }

  function updateStreak() {
    try {
      const today = new Date().toDateString();
      if (lastSessionDate !== today) {
        if (lastSessionDate === new Date(Date.now() - 86400000).toDateString()) {
          streak++;
        } else if (!lastSessionDate || new Date(lastSessionDate) < new Date(Date.now() - 86400000)) {
          streak = 1;
        }
        localStorage.setItem('lastSessionDate', today);
        localStorage.setItem('streak', streak);
      }
      streakCountDisplay.textContent = streak;
      console.log('Streak updated:', streak);
    } catch (e) {
      console.error('Error updating streak:', e);
    }
  }

  function updateHistory() {
    try {
      historyList.innerHTML = sessionHistory.map(item => `<li>${item}</li>`).join('');
      console.log('Session history updated:', sessionHistory);
    } catch (e) {
      console.error('Error updating session history:', e);
    }
  }

  function startTimer() {
    if (!isRunning) {
      isRunning = true;
      startButton.style.background = '#00c4cc';
      pauseButton.style.background = '';
      interval = setInterval(() => {
        if (isWorkTime) {
          if (workTime > 0) {
            workTime--;
            updateDisplay(workTime);
          } else {
            sessionCount++;
            sessionCountDisplay.textContent = sessionCount;
            updateStreak();
            sessionHistory.push(`${new Date().toLocaleString()} - ${document.getElementById('work').value} min`);
            localStorage.setItem('sessionHistory', JSON.stringify(sessionHistory.slice(-5)));
            updateHistory();
            isWorkTime = false;
            shortBreak = parseInt(document.getElementById('shortBreak').value) * 60;
            longBreak = parseInt(document.getElementById('longBreak').value) * 60;
            updateDisplay(sessionCount % sessionsBeforeLongBreak === 0 ? longBreak : shortBreak);
          }
        } else {
          if (sessionCount % sessionsBeforeLongBreak === 0) {
            if (longBreak > 0) {
              longBreak--;
              updateDisplay(longBreak);
            } else {
              isWorkTime = true;
              workTime = parseInt(document.getElementById('work').value) * 60;
              updateDisplay(workTime);
            }
          } else {
            if (shortBreak > 0) {
              shortBreak--;
              updateDisplay(shortBreak);
            } else {
              isWorkTime = true;
              workTime = parseInt(document.getElementById('work').value) * 60;
              updateDisplay(workTime);
            }
          }
        }
      }, 1000);
      console.log('Timer started');
    }
  }

  function pauseTimer() {
    if (isRunning) {
      isRunning = false;
      clearInterval(interval);
      startButton.style.background = '';
      pauseButton.style.background = '#00c4cc';
      console.log('Timer paused');
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
    isWorkTime = true;
    updateDisplay(workTime);
    savePomodoroSettings();
    startButton.style.background = '';
    pauseButton.style.background = '';
    timeDisplay.style.animation = '';
    document.getElementById('progress').style.width = '0%';
    console.log('Timer reset');
  }

  function validateInput(inputId) {
    const input = document.getElementById(inputId);
    const value = parseInt(input.value);
    if (isNaN(value) || value < 1) {
      input.value = 1;
      return 60;
    }
    return value * 60;
  }

  startButton.addEventListener('click', startTimer);
  pauseButton.addEventListener('click', pauseTimer);
  resetButton.addEventListener('click', resetTimer);

  document.getElementById('work').addEventListener('change', () => {
    workTime = validateInput('work');
    savePomodoroSettings();
    if (!isRunning && isWorkTime) updateDisplay(workTime);
    console.log('Work time updated:', workTime / 60);
  });
  document.getElementById('shortBreak').addEventListener('change', () => {
    shortBreak = validateInput('shortBreak');
    savePomodoroSettings();
    if (!isRunning && !isWorkTime && sessionCount % sessionsBeforeLongBreak !== 0) updateDisplay(shortBreak);
    console.log('Short break updated:', shortBreak / 60);
  });
  document.getElementById('longBreak').addEventListener('change', () => {
    longBreak = validateInput('longBreak');
    savePomodoroSettings();
    if (!isRunning && !isWorkTime && sessionCount % sessionsBeforeLongBreak === 0) updateDisplay(longBreak);
    console.log('Long break updated:', longBreak / 60);
  });
  document.getElementById('sessions').addEventListener('change', () => {
    const sessionsInput = document.getElementById('sessions');
    sessionsBeforeLongBreak = parseInt(sessionsInput.value) < 1 ? 1 : parseInt(sessionsInput.value);
    sessionsInput.value = sessionsBeforeLongBreak;
    savePomodoroSettings();
    console.log('Sessions before long break updated:', sessionsBeforeLongBreak);
  });

  soundToggle.addEventListener('change', () => {
    localStorage.setItem('soundEnabled', soundToggle.checked);
    console.log('Sound notifications toggled:', soundToggle.checked);
  });

  historyToggle.addEventListener('click', () => {
    historyList.classList.toggle('active');
    console.log('History toggle clicked, active:', historyList.classList.contains('active'));
  });

  loadPomodoroSettings();
  updateStreak();
  updateHistory();

  // Clock and Calendar Logic
  function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString();
    const date = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    try {
      document.getElementById('current-time').textContent = time;
      document.getElementById('current-date').textContent = date;
      renderCalendar();
      renderWeeklyPlanner();
      console.log('Clock updated, rendering calendar and weekly planner:', time, date);
    } catch (e) {
      console.error('Error updating clock:', e);
    }
  }

  setInterval(updateClock, 1000);
  updateClock();

  function renderCalendar() {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDay = firstDay.getDay();

      const calendarBody = document.getElementById('calendar-body');
      if (!calendarBody) throw new Error('Calendar body not found');
      calendarBody.innerHTML = '';

      let date = 1;
      for (let i = 0; i < 6; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < 7; j++) {
          const cell = document.createElement('td');
          if (i === 0 && j < startingDay) {
            cell.textContent = '';
          } else if (date <= daysInMonth) {
            cell.textContent = date;
            if (date === now.getDate() && month === now.getMonth() && year === now.getFullYear()) {
              cell.classList.add('today');
            }
            date++;
          } else {
            cell.textContent = '';
          }
          cell.style.padding = '0.75rem';
          cell.style.textAlign = 'center';
          cell.style.color = '#e0e0e0';
          cell.style.transition = 'background 0.2s ease';
          cell.style.cursor = 'pointer';
          cell.style.width = '14.28%';
          if (cell.textContent === '') {
            cell.style.visibility = 'hidden';
          } else {
            cell.style.visibility = 'visible';
          }
          cell.addEventListener('mouseover', () => {
            if (cell.textContent !== '') {
              cell.style.background = 'rgba(255, 255, 255, 0.1)';
              cell.style.borderRadius = '6px';
            }
          });
          cell.addEventListener('mouseout', () => {
            if (cell.textContent !== '' && !cell.classList.contains('today')) {
              cell.style.background = 'transparent';
            }
          });
          row.appendChild(cell);
        }
        calendarBody.appendChild(row);
      }
      console.log('Calendar rendered with', daysInMonth, 'days');
    } catch (e) {
      console.error('Error rendering calendar:', e);
    }
  }

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
    try {
      weekRange.textContent = getWeekRange();
      daysRemaining.textContent = getDaysRemaining();
      console.log('Weekly planner updated:', weekRange.textContent, daysRemaining.textContent);
    } catch (e) {
      console.error('Error rendering weekly planner:', e);
    }
  }

  function loadTasks(listId, storageKey) {
    try {
      const savedTasks = JSON.parse(localStorage.getItem(storageKey)) || [];
      const list = document.getElementById(listId);
      if (!list) throw new Error(`Task list ${listId} not found`);
      savedTasks.forEach(taskText => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${taskText}</span><button class="task-button" onclick="completeTask(this, '${listId}', '${storageKey}')"></button>`;
        list.appendChild(li);
      });
      console.log(`Tasks loaded for ${listId}:`, savedTasks.length, 'tasks');
    } catch (e) {
      console.error(`Error loading tasks for ${listId}:`, e);
    }
  }

  function saveTasks(listId, storageKey) {
    try {
      const list = document.getElementById(listId);
      if (!list) throw new Error(`Task list ${listId} not found`);
      const tasks = Array.from(list.children).map(li => li.querySelector('span').textContent);
      localStorage.setItem(storageKey, JSON.stringify(tasks));
      console.log(`Tasks saved for ${listId}:`, tasks.length, 'tasks');
    } catch (e) {
      console.error(`Error saving tasks for ${listId}:`, e);
    }
  }

  function addTask(input, list, storageKey) {
    try {
      const taskText = input.value.trim();
      if (taskText) {
        const li = document.createElement('li');
        li.innerHTML = `<span>${taskText}</span><button class="task-button" onclick="completeTask(this, '${list.id}', '${storageKey}')"></button>`;
        list.appendChild(li);
        input.value = '';
        saveTasks(list.id, storageKey);
        console.log(`New task added to ${list.id}:`, taskText);
      }
    } catch (e) {
      console.error(`Error adding task to ${list.id}:`, e);
    }
  }

  window.completeTask = function(button, listId, storageKey) {
    try {
      const li = button.parentElement;
      if (!li) throw new Error('Task list item not found');
      console.log(`Completing task in ${listId}, task:`, li.querySelector('span').textContent);
      
      // Add clicked state to button
      button.classList.add('clicked');
      
      // Trigger fade-out animation immediately
      li.classList.add('fade-out');
      
      // Wait for the animation to complete (500ms) before removing
      setTimeout(() => {
        try {
          if (li.parentElement) {
            li.remove();
            saveTasks(listId, storageKey);
            console.log(`Task faded out and removed from ${listId}`);
          } else {
            throw new Error('Parent element not found for task removal');
          }
        } catch (e) {
          console.error(`Error removing task from ${listId}:`, e);
        }
      }, 500); // Match the CSS transition duration
    } catch (e) {
      console.error(`Error completing task in ${listId}:`, e);
    }
  };

  renderWeeklyPlanner();
  loadTasks('task-list-week', 'weeklyTasks');
  loadTasks('task-list', 'taskBarTasks');

  addTaskWeekButton.addEventListener('click', () => addTask(taskInputWeek, taskListWeek, 'weeklyTasks'));
  taskInputWeek.addEventListener('keypress', (e) => e.key === 'Enter' && addTask(taskInputWeek, taskListWeek, 'weeklyTasks'));
  addTaskButton.addEventListener('click', () => addTask(taskInput, taskList, 'taskBarTasks'));
  taskInput.addEventListener('keypress', (e) => e.key === 'Enter' && addTask(taskInput, taskList, 'taskBarTasks'));

  // Task Scheduler Logic
  const schedulerToggle = document.getElementById('schedulerToggle');
  const taskScheduler = document.getElementById('taskScheduler');
  const schedulerTaskInput = document.getElementById('schedulerTask');
  const schedulerStartTimeInput = document.getElementById('schedulerStartTime');
  const schedulerEndTimeInput = document.getElementById('schedulerEndTime');
  const addSchedulerTaskButton = document.getElementById('addSchedulerTask');
  const schedulerList = document.getElementById('schedulerList');

  function loadSchedulerTasks() {
    try {
      const savedTasks = JSON.parse(localStorage.getItem('schedulerTasks')) || [];
      schedulerList.innerHTML = '';
      savedTasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${task.text} @ ${task.startTime} - ${task.endTime}</span><button onclick="removeSchedulerTask(this)">×</button>`;
        schedulerList.appendChild(li);
        checkTaskTime(li, task.startTime, task.endTime);
      });
      checkAllTasks();
      console.log('Scheduler tasks loaded:', savedTasks.length, 'tasks');
    } catch (e) {
      console.error('Error loading scheduler tasks:', e);
    }
  }

  function saveSchedulerTasks() {
    try {
      const tasks = Array.from(schedulerList.children).map(li => ({
        text: li.querySelector('span').textContent.split(' @ ')[0],
        startTime: li.querySelector('span').textContent.split(' @ ')[1].split(' - ')[0],
        endTime: li.querySelector('span').textContent.split(' - ')[1]
      }));
      localStorage.setItem('schedulerTasks', JSON.stringify(tasks));
      console.log('Scheduler tasks saved:', tasks.length, 'tasks');
    } catch (e) {
      console.error('Error saving scheduler tasks:', e);
    }
  }

  function addSchedulerTask() {
    try {
      const taskText = schedulerTaskInput.value.trim();
      const startTime = schedulerStartTimeInput.value;
      const endTime = schedulerEndTimeInput.value;
      if (taskText && startTime && endTime) {
        const li = document.createElement('li');
        li.innerHTML = `<span>${taskText} @ ${startTime} - ${endTime}</span><button onclick="removeSchedulerTask(this)">×</button>`;
        schedulerList.appendChild(li);
        schedulerTaskInput.value = '';
        schedulerStartTimeInput.value = '';
        schedulerEndTimeInput.value = '';
        saveSchedulerTasks();
        checkTaskTime(li, startTime, endTime);
        console.log('New task added to scheduler:', taskText, startTime, endTime);
      }
    } catch (e) {
      console.error('Error adding scheduler task:', e);
    }
  }

  function removeSchedulerTask(button) {
    try {
      const li = button.parentElement;
      li.style.opacity = '0';
      setTimeout(() => {
        li.remove();
        saveSchedulerTasks();
        console.log('Task removed from scheduler');
      }, 500);
    } catch (e) {
      console.error('Error removing scheduler task:', e);
    }
  }

  function checkTaskTime(li, startTime, endTime) {
    try {
      const now = new Date();
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      const startDate = new Date(now);
      startDate.setHours(startHour, startMinute, 0, 0);
      const endDate = new Date(now);
      endDate.setHours(endHour, endMinute, 0, 0);

      if (now > endDate) {
        li.classList.add('fade-out');
        setTimeout(() => {
          li.remove();
          saveSchedulerTasks();
          console.log('Task faded out due to time expiration:', li.querySelector('span').textContent);
        }, 500);
      } else {
        setTimeout(() => checkTaskTime(li, startTime, endTime), 60000); // Check every minute
      }
    } catch (e) {
      console.error('Error checking task time:', e);
    }
  }

  function checkAllTasks() {
    try {
      Array.from(schedulerList.children).forEach(li => {
        const timeRange = li.querySelector('span').textContent.split(' @ ')[1];
        const [startTime, endTime] = timeRange.split(' - ');
        checkTaskTime(li, startTime, endTime);
      });
      console.log('Checked all scheduler tasks');
    } catch (e) {
      console.error('Error checking all scheduler tasks:', e);
    }
  }

  // Ensure scheduler toggle works with error handling
  if (schedulerToggle && taskScheduler) {
    schedulerToggle.addEventListener('click', () => {
      try {
        taskScheduler.classList.toggle('active');
        console.log('Scheduler toggle clicked, active:', taskScheduler.classList.contains('active'));
      } catch (e) {
        console.error('Error toggling scheduler:', e);
      }
    });
  } else {
    console.error('Scheduler toggle or task scheduler elements not found');
  }

  addSchedulerTaskButton.addEventListener('click', addSchedulerTask);
  schedulerTaskInput.addEventListener('keypress', (e) => e.key === 'Enter' && addSchedulerTask());
  schedulerStartTimeInput.addEventListener('keypress', (e) => e.key === 'Enter' && addSchedulerTask());
  schedulerEndTimeInput.addEventListener('keypress', (e) => e.key === 'Enter' && addSchedulerTask());

  loadSchedulerTasks();
});
