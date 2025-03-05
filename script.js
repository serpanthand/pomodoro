document.addEventListener('DOMContentLoaded', () => {
    // Pomodoro Timer Logic
    let workTime = 60 * 60;
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

    let streak = 0;
    let lastSessionDate = null;

    // Stats Tracking
    let totalWorkHours = 0;
    let tasksPerDay = [0, 0, 0, 0, 0, 0, 0];
    let timeElapsedPercentage = 0;

    // Elements
    const statsButton = document.getElementById('statsButton');
    const statsDashboard = document.getElementById('statsDashboard');
    const closeStats = document.getElementById('closeStats');
    const schedulerToggle = document.getElementById('schedulerToggle');
    const taskScheduler = document.getElementById('taskScheduler');
    const schedulerTaskInput = document.getElementById('schedulerTask');
    const schedulerStartTimeInput = document.getElementById('schedulerStartTime');
    const schedulerEndTimeInput = document.getElementById('schedulerEndTime');
    const addSchedulerTaskButton = document.getElementById('addSchedulerTask');
    const schedulerList = document.getElementById('schedulerList');
    const weekRange = document.getElementById('week-range');
    const daysRemaining = document.getElementById('days-remaining');
    const taskInputWeek = document.getElementById('task-week');
    const addTaskWeekButton = document.getElementById('addTaskWeek');
    const taskListWeek = document.getElementById('task-list-week');
    const taskInput = document.getElementById('task');
    const addTaskButton = document.getElementById('addTask');
    const taskList = document.getElementById('task-list');

    // Chart Initialization
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const barCtx = document.getElementById('barChart').getContext('2d');
    const barChart = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: [daysOfWeek[new Date().getDay()]],
        datasets: [{
          label: 'Hours',
          data: [0],
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Hours' } },
          x: { title: { display: true, text: 'Day' } }
        },
        plugins: { title: { display: true, text: 'Hours Spent Today' } }
      }
    });

    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const lineChart = new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: daysOfWeek,
        datasets: [{
          label: 'Number of Tasks',
          data: tasksPerDay,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Number of Tasks' } },
          x: { title: { display: true, text: 'Days' } }
        },
        plugins: { title: { display: true, text: 'Tasks per Day' } }
      }
    });

    const pieCtx = document.getElementById('pieChart').getContext('2d');
    const pieChart = new Chart(pieCtx, {
      type: 'pie',
      data: {
        labels: ['Time Elapsed', 'Timer Not Started'],
        datasets: [{
          data: [0, 100],
          backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)'],
          hoverOffset: 4
        }]
      },
      options: {
        plugins: { title: { display: true, text: 'Time Distribution' } }
      }
    });

    // Utility Functions
    function updateCharts(hours, tasks, timeElapsed) {
      barChart.data.datasets[0].data = [hours];
      barChart.update();
      lineChart.data.datasets[0].data = tasks;
      lineChart.update();
      pieChart.data.datasets[0].data = [timeElapsed, 100 - timeElapsed];
      pieChart.update();
    }

    function loadPomodoroSettings() {
      try {
        const savedWorkTime = localStorage.getItem('workTime');
        const savedShortBreak = localStorage.getItem('shortBreak');
        const savedLongBreak = localStorage.getItem('longBreak');
        const savedSessions = localStorage.getItem('sessionsBeforeLongBreak');
        const savedStreak = localStorage.getItem('streak');
        lastSessionDate = localStorage.getItem('lastSessionDate');

        workTime = savedWorkTime ? parseInt(savedWorkTime) * 60 : 60 * 60;
        shortBreak = savedShortBreak ? parseInt(savedShortBreak) * 60 : 5 * 60;
        longBreak = savedLongBreak ? parseInt(savedLongBreak) * 60 : 15 * 60;
        sessionsBeforeLongBreak = savedSessions ? parseInt(savedSessions) : 4;
        streak = savedStreak ? parseInt(savedStreak) : 0;

        document.getElementById('work').value = workTime / 60;
        document.getElementById('shortBreak').value = shortBreak / 60;
        document.getElementById('longBreak').value = longBreak / 60;
        document.getElementById('sessions').value = sessionsBeforeLongBreak;
        updateDisplay(workTime);
        updateStreak();
      } catch (e) {
        console.error('Error loading Pomodoro settings:', e);
        workTime = 60 * 60;
        shortBreak = 5 * 60;
        longBreak = 15 * 60;
        sessionsBeforeLongBreak = 4;
        streak = 0;
        lastSessionDate = null;
        document.getElementById('work').value = 60;
        document.getElementById('shortBreak').value = 5;
        document.getElementById('longBreak').value = 15;
        document.getElementById('sessions').value = 4;
        updateDisplay(workTime);
      }
    }

    function savePomodoroSettings() {
      localStorage.setItem('workTime', workTime / 60);
      localStorage.setItem('shortBreak', shortBreak / 60);
      localStorage.setItem('longBreak', longBreak / 60);
      localStorage.setItem('sessionsBeforeLongBreak', sessionsBeforeLongBreak);
      localStorage.setItem('streak', streak);
      localStorage.setItem('lastSessionDate', lastSessionDate);
    }

    function updateDisplay(time) {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      const totalTime = isWorkTime ? parseInt(document.getElementById('work').value) * 60 :
        (sessionCount % sessionsBeforeLongBreak === 0 ? parseInt(document.getElementById('longBreak').value) * 60 : parseInt(document.getElementById('shortBreak').value) * 60);
      const progress = totalTime ? ((totalTime - time) / totalTime) * 100 : 0;
      document.getElementById('progress').style.width = `${progress}%`;
      if (time <= 0 && isRunning) {
        timeDisplay.style.animation = 'pulse 0.5s ease 2';
        setTimeout(() => timeDisplay.style.animation = '', 1000);
      }
    }

    function updateStreak() {
      const today = new Date().toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastSessionDate !== today) {
        if (lastSessionDate === yesterday.toDateString()) {
          streak++;
        } else if (!lastSessionDate || new Date(lastSessionDate) < yesterday) {
          streak = 1;
        }
        lastSessionDate = today;
        savePomodoroSettings();
      }
      streakCountDisplay.textContent = streak;
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

    // Pomodoro Timer Functions
    function startTimer() {
      if (!isRunning) {
        isRunning = true;
        startButton.style.background = '#00c4cc';
        pauseButton.style.background = '';
        let startTime = Date.now(); // Record the start time in milliseconds
        let initialWorkTime = workTime; // Store initial work time
        let initialBreakTime = isWorkTime ? 0 : (sessionCount % sessionsBeforeLongBreak === 0 ? longBreak : shortBreak);

        interval = setInterval(() => {
          const now = Date.now();
          const elapsed = Math.floor((now - startTime) / 1000); // Elapsed seconds

          if (isWorkTime) {
            workTime = initialWorkTime - elapsed;
            if (workTime <= 0) {
              workTime = 0;
              sessionCount++;
              sessionCountDisplay.textContent = sessionCount;
              updateStreak();
              isWorkTime = false;
              startTime = Date.now(); // Reset start time for break
              shortBreak = parseInt(document.getElementById('shortBreak').value) * 60;
              longBreak = parseInt(document.getElementById('longBreak').value) * 60;
              initialBreakTime = sessionCount % sessionsBeforeLongBreak === 0 ? longBreak : shortBreak;
              updateDisplay(initialBreakTime);
            } else {
              totalWorkHours += 1 / 3600;
              timeElapsedPercentage = ((initialWorkTime - workTime) / initialWorkTime) * 100;
              updateDisplay(workTime);
              updateCharts(totalWorkHours, tasksPerDay, timeElapsedPercentage);
            }
          } else {
            let remainingBreak = initialBreakTime - elapsed;
            if (remainingBreak <= 0) {
              remainingBreak = 0;
              isWorkTime = true;
              workTime = parseInt(document.getElementById('work').value) * 60;
              startTime = Date.now(); // Reset start time for work
              initialWorkTime = workTime;
              updateDisplay(workTime);
            } else {
              updateDisplay(remainingBreak);
            }
          }
        }, 1000); // Update every second for smooth display
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
      isWorkTime = true;
      updateDisplay(workTime);
      savePomodoroSettings();
      startButton.style.background = '';
      pauseButton.style.background = '';
      timeDisplay.style.animation = '';
      document.getElementById('progress').style.width = '0%';
      updateCharts(totalWorkHours, tasksPerDay, timeElapsedPercentage);
    }

    // Clock and Calendar Logic
    function updateClock() {
      const now = new Date();
      const time = now.toLocaleTimeString();
      const date = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      document.getElementById('current-time').textContent = time;
      document.getElementById('current-date').textContent = date;
      renderCalendar();
      renderWeeklyPlanner();
    }

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
          if (cell.textContent === '') cell.style.visibility = 'hidden';
          cell.addEventListener('mouseover', () => {
            if (cell.textContent !== '') cell.style.background = 'rgba(255, 255, 255, 0.1)';
          });
          cell.addEventListener('mouseout', () => {
            if (cell.textContent !== '' && !cell.classList.contains('today')) cell.style.background = 'transparent';
          });
          row.appendChild(cell);
        }
        calendarBody.appendChild(row);
      }
    }

    // Weekly Planner and Task Logic
    function getWeekRange() {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
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
      try {
        const savedTasks = JSON.parse(localStorage.getItem(storageKey)) || [];
        const list = document.getElementById(listId);
        savedTasks.forEach(taskText => {
          if (taskText) {
            const li = document.createElement('li');
            li.innerHTML = `<span>${taskText}</span><button class="task-button" onclick="completeTask(this, '${listId}', '${storageKey}')"></button>`;
            list.appendChild(li);
            if (listId === 'task-list') tasksPerDay[new Date().getDay()]++;
          }
        });
        updateCharts(totalWorkHours, tasksPerDay, timeElapsedPercentage);
      } catch (e) {
        console.error(`Error loading tasks for ${listId}:`, e);
        localStorage.setItem(storageKey, JSON.stringify([]));
      }
    }

    function saveTasks(listId, storageKey) {
      const list = document.getElementById(listId);
      const tasks = Array.from(list.children).map(li => li.querySelector('span').textContent);
      localStorage.setItem(storageKey, JSON.stringify(tasks));
    }

    function addTask(input, list, storageKey) {
      const taskText = input.value.trim();
      if (!taskText) {
        alert('Task cannot be empty!');
        return;
      }
      const li = document.createElement('li');
      li.innerHTML = `<span>${taskText}</span><button class="task-button" onclick="completeTask(this, '${list.id}', '${storageKey}')"></button>`;
      list.appendChild(li);
      input.value = '';
      saveTasks(list.id, storageKey);
      if (list.id === 'task-list') {
        tasksPerDay[new Date().getDay()]++;
        updateCharts(totalWorkHours, tasksPerDay, timeElapsedPercentage);
      }
    }

    window.completeTask = function(button, listId, storageKey) {
      const li = button.parentElement;
      button.classList.add('clicked');
      li.classList.add('fade-out');
      setTimeout(() => {
        li.remove();
        saveTasks(listId, storageKey);
        if (listId === 'task-list') {
          tasksPerDay[new Date().getDay()]--;
          updateCharts(totalWorkHours, tasksPerDay, timeElapsedPercentage);
        }
      }, 500);
    };

    // Task Scheduler Logic
    function loadSchedulerTasks() {
      try {
        const savedTasks = JSON.parse(localStorage.getItem('schedulerTasks')) || [];
        schedulerList.innerHTML = '';
        savedTasks.forEach(task => {
          if (task.text && task.startTime && task.endTime) {
            const li = document.createElement('li');
            li.innerHTML = `<span>${task.text} @ ${task.startTime} - ${task.endTime}</span><button onclick="removeSchedulerTask(this)">×</button>`;
            schedulerList.appendChild(li);
            checkTaskTime(li, task.startTime, task.endTime);
          }
        });
      } catch (e) {
        console.error('Error loading scheduler tasks:', e);
        localStorage.setItem('schedulerTasks', JSON.stringify([]));
      }
    }

    function saveSchedulerTasks() {
      const tasks = Array.from(schedulerList.children).map(li => ({
        text: li.querySelector('span').textContent.split(' @ ')[0],
        startTime: li.querySelector('span').textContent.split(' @ ')[1].split(' - ')[0],
        endTime: li.querySelector('span').textContent.split(' - ')[1]
      }));
      localStorage.setItem('schedulerTasks', JSON.stringify(tasks));
    }

    function addSchedulerTask() {
      const taskText = schedulerTaskInput.value.trim();
      const startTime = schedulerStartTimeInput.value;
      const endTime = schedulerEndTimeInput.value;
      if (!taskText || !startTime || !endTime) {
        alert('Please fill in all fields!');
        return;
      }
      const li = document.createElement('li');
      li.innerHTML = `<span>${taskText} @ ${startTime} - ${endTime}</span><button onclick="removeSchedulerTask(this)">×</button>`;
      schedulerList.appendChild(li);
      schedulerTaskInput.value = '';
      schedulerStartTimeInput.value = '';
      schedulerEndTimeInput.value = '';
      saveSchedulerTasks();
      checkTaskTime(li, startTime, endTime);
    }

    window.removeSchedulerTask = function(button) {
      const li = button.parentElement;
      li.style.opacity = '0';
      setTimeout(() => {
        li.remove();
        saveSchedulerTasks();
      }, 500);
    };

    function checkTaskTime(li, startTime, endTime) {
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
        }, 500);
      } else {
        setTimeout(() => checkTaskTime(li, startTime, endTime), 60000);
      }
    }

    // Event Listeners
    startButton.addEventListener('click', startTimer);
    pauseButton.addEventListener('click', pauseTimer);
    resetButton.addEventListener('click', resetTimer);
    document.getElementById('work').addEventListener('change', () => {
      workTime = validateInput('work');
      savePomodoroSettings();
      if (!isRunning && isWorkTime) updateDisplay(workTime);
    });
    document.getElementById('shortBreak').addEventListener('change', () => {
      shortBreak = validateInput('shortBreak');
      savePomodoroSettings();
      if (!isRunning && !isWorkTime && sessionCount % sessionsBeforeLongBreak !== 0) updateDisplay(shortBreak);
    });
    document.getElementById('longBreak').addEventListener('change', () => {
      longBreak = validateInput('longBreak');
      savePomodoroSettings();
      if (!isRunning && !isWorkTime && sessionCount % sessionsBeforeLongBreak === 0) updateDisplay(longBreak);
    });
    document.getElementById('sessions').addEventListener('change', () => {
      const sessionsInput = document.getElementById('sessions');
      sessionsBeforeLongBreak = parseInt(sessionsInput.value) < 1 ? 1 : parseInt(sessionsInput.value);
      sessionsInput.value = sessionsBeforeLongBreak;
      savePomodoroSettings();
    });

    addTaskWeekButton.addEventListener('click', () => addTask(taskInputWeek, taskListWeek, 'weeklyTasks'));
    taskInputWeek.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addTask(taskInputWeek, taskListWeek, 'weeklyTasks');
    });
    addTaskButton.addEventListener('click', () => addTask(taskInput, taskList, 'taskBarTasks'));
    taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addTask(taskInput, taskList, 'taskBarTasks');
    });

    schedulerToggle.addEventListener('click', () => {
      taskScheduler.classList.toggle('hidden');
      console.log('Scheduler toggled:', taskScheduler.classList.contains('hidden') ? 'Hidden' : 'Visible');
    });
    addSchedulerTaskButton.addEventListener('click', addSchedulerTask);
    schedulerTaskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addSchedulerTask();
    });
    schedulerStartTimeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addSchedulerTask();
    });
    schedulerEndTimeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addSchedulerTask();
    });

    statsButton.addEventListener('click', () => {
      statsDashboard.classList.remove('hidden');
      updateCharts(totalWorkHours, tasksPerDay, timeElapsedPercentage);
    });
    closeStats.addEventListener('click', () => {
      statsDashboard.classList.add('hidden');
    });

    // Initialize
    loadPomodoroSettings();
    setInterval(updateClock, 1000);
    updateClock();
    loadTasks('task-list-week', 'weeklyTasks');
    loadTasks('task-list', 'taskBarTasks');
    loadSchedulerTasks();
});
