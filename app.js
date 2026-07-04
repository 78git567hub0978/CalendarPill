const storageKey = "pill-calendar-logs";
const reminderKey = "pill-calendar-reminders-enabled";
const dateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
});
const monthFormatter = new Intl.DateTimeFormat(undefined, {
  month: "long",
  year: "numeric",
});

const today = stripTime(new Date());
let viewedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let selectedDate = today;
let logs = readLogs();
let reminderTimers = [];

const calendarGrid = document.querySelector("#calendarGrid");
const monthTitle = document.querySelector("#monthTitle");
const statusStrip = document.querySelector(".status-strip");
const countdownStatus = document.querySelector("#countdownStatus");
const scheduleStatus = document.querySelector("#scheduleStatus");
const selectedTitle = document.querySelector("#selectedTitle");
const selectedMeta = document.querySelector("#selectedMeta");
const markTakenButton = document.querySelector("#markTakenButton");
const editButton = document.querySelector("#editButton");
const reminderStatus = document.querySelector("#reminderStatus");
const reminderButton = document.querySelector("#reminderButton");

document.querySelector("#prevMonth").addEventListener("click", () => {
  viewedMonth = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() - 1, 1);
  render();
});

document.querySelector("#nextMonth").addEventListener("click", () => {
  viewedMonth = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() + 1, 1);
  render();
});

markTakenButton.addEventListener("click", () => markTaken(selectedDate));

editButton.addEventListener("click", editTakenTime);

reminderButton.addEventListener("click", toggleReminders);

function render() {
  monthTitle.textContent = monthFormatter.format(viewedMonth);
  renderCalendar();
  renderDetails();
  renderCountdown();
  renderReminderState();
}

function renderCalendar() {
  calendarGrid.replaceChildren();

  const firstDayOffset = viewedMonth.getDay();
  const gridStart = new Date(viewedMonth);
  gridStart.setDate(viewedMonth.getDate() - firstDayOffset);

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const key = toKey(date);
    const button = document.createElement("button");
    const time = document.createElement("time");

    button.type = "button";
    button.className = "day";
    button.setAttribute("aria-label", getDayLabel(date));
    button.dataset.date = key;

    if (date.getMonth() !== viewedMonth.getMonth()) button.classList.add("is-outside");
    if (key === toKey(today)) button.classList.add("is-today");
    if (key === toKey(selectedDate)) button.classList.add("is-selected");
    if (logs[key]) {
      button.classList.add("is-taken");
      const timingClass = getCalendarTimingClass(logs[key], date);
      if (timingClass) button.classList.add(timingClass);
    }
    if (!logs[key] && date > today) button.classList.add("is-future");
    if (!logs[key] && date < today) button.classList.add("is-missed");

    time.dateTime = key;
    time.textContent = date.getDate();
    button.append(time);
    if (key === toKey(today)) {
      const todayCaption = document.createElement("span");
      todayCaption.className = "today-caption";
      todayCaption.textContent = "Today";
      button.append(todayCaption);
    }
    button.addEventListener("click", () => {
      selectedDate = date;
      if (date.getMonth() !== viewedMonth.getMonth()) {
        viewedMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      }
      render();
    });

    calendarGrid.append(button);
  }
}

function renderDetails() {
  const key = toKey(selectedDate);
  const loggedAt = logs[key];
  selectedTitle.textContent = dateFormatter.format(selectedDate);
  renderSelectedMeta(loggedAt, selectedDate);
  renderMarkButton(loggedAt, selectedDate);
  markTakenButton.disabled = Boolean(loggedAt);
  editButton.disabled = !loggedAt;
}

function renderMarkButton(loggedAt, date) {
  const missed = isMissedDate(date, loggedAt);
  let label = "Mark taken";
  let statusClass = "";

  if (loggedAt) {
    const timing = getTimingDetail(loggedAt, date);
    label = getTakenStatusLabel(timing);
    statusClass = getTakenStatusClass(timing);
  } else if (missed) {
    label = "Missed";
    statusClass = "is-missed";
  }

  markTakenButton.classList.remove("is-on-time", "is-late", "is-early", "is-missed");
  if (statusClass) markTakenButton.classList.add(statusClass);
  markTakenButton.textContent = label;
  markTakenButton.disabled = Boolean(loggedAt);
}

function renderSelectedMeta(loggedAt, date) {
  selectedMeta.replaceChildren();

  if (!loggedAt) {
    const missed = isMissedDate(date, loggedAt);
    selectedMeta.textContent = missed ? "Missed" : "No pill logged for this day.";
    selectedMeta.className = missed ? "missed-detail" : "";
    return;
  }

  const takenLine = document.createElement("span");
  const timingLine = document.createElement("span");
  const timing = getTimingDetail(loggedAt, date);
  selectedMeta.className = "";
  takenLine.textContent = `Taken at ${formatTime(new Date(loggedAt))}.`;
  timingLine.className = `timing-detail ${getTakenStatusClass(timing)}`.trim();
  timingLine.textContent = timing;
  selectedMeta.append(takenLine, timingLine);
}

function renderCountdown() {
  const now = new Date();
  const todayDose = getTodayDoseTime(now);
  const todayLog = logs[toKey(today)];
  const missedToday = now > todayDose && !todayLog;
  const offScheduleToday = todayLog && isOutsideScheduleWindow(todayLog, today);
  const nextDose = getNextDoseTime(now);
  const remainingMs = nextDose - now;

  statusStrip.classList.toggle("is-missed-dose", missedToday);
  statusStrip.classList.toggle("is-off-schedule-dose", Boolean(offScheduleToday));
  statusStrip.classList.toggle("is-upcoming-dose", !missedToday && !offScheduleToday);
  document.querySelector(".status-label").textContent = formatNextDoseSentence(nextDose);
  countdownStatus.textContent = formatCountdown(remainingMs);
  scheduleStatus.textContent = "remaining until next dose";
}

function markTaken(date) {
  logs[toKey(date)] = new Date().toISOString();
  writeLogs();
  render();
  scheduleReminders();
}

function editTakenTime() {
  const key = toKey(selectedDate);
  const loggedAt = logs[key];

  if (!loggedAt) return;

  const currentTime = formatInputTime(new Date(loggedAt));
  const updatedTime = prompt("Edit taken time", currentTime);

  if (!updatedTime) return;

  const parsedTime = parseInputTime(updatedTime);
  if (!parsedTime) {
    alert("Use a time like 7:05 AM or 19:05.");
    return;
  }

  const updatedDate = new Date(selectedDate);
  updatedDate.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
  logs[key] = updatedDate.toISOString();
  writeLogs();
  render();
  scheduleReminders();
}

function getDayLabel(date) {
  const status = logs[toKey(date)] ? "pill taken" : "not logged";
  return `${dateFormatter.format(date)}, ${status}`;
}

function readLogs() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch {
    return {};
  }
}

function writeLogs() {
  localStorage.setItem(storageKey, JSON.stringify(logs));
}

function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatInputTime(date) {
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function parseInputTime(value) {
  const normalized = value.trim().toLowerCase();
  const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);

  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = match[2] ? Number(match[2]) : 0;
  const period = match[3];

  if (minutes > 59) return null;

  if (period) {
    if (hours < 1 || hours > 12) return null;
    if (period === "pm" && hours !== 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;
  } else if (hours > 23) {
    return null;
  }

  return { hours, minutes };
}

function getTimingDetail(loggedAt, date) {
  const takenAt = new Date(loggedAt);
  const scheduledAt = getScheduledDoseTime(date);
  const differenceMs = takenAt - scheduledAt;
  return formatTimingDifference(differenceMs);
}

function getNextDoseTime(now) {
  const nextDose = getTodayDoseTime(now);

  if (nextDose <= now) {
    nextDose.setDate(nextDose.getDate() + 1);
  }

  return nextDose;
}

function getTodayDoseTime(now) {
  return getScheduledDoseTime(now);
}

function getScheduledDoseTime(date) {
  const doseTime = new Date(date);
  doseTime.setHours(7, 0, 0, 0);
  return doseTime;
}

function isOutsideScheduleWindow(loggedAt, date) {
  const takenAt = new Date(loggedAt);
  const scheduledAt = new Date(date);
  scheduledAt.setHours(7, 0, 0, 0);

  return Math.abs(takenAt - scheduledAt) > 10 * 60 * 1000;
}

function getCalendarTimingClass(loggedAt, date) {
  const timing = getTimingDetail(loggedAt, date);

  if (timing === "Taken on time") return "";
  if (timing.endsWith("early.")) return "is-early";
  return "is-off-schedule";
}

function getTakenStatusLabel(timing) {
  if (timing === "Taken on time") return "Taken on time";
  if (timing.endsWith("early.")) return "Taken early";
  return "Taken late";
}

function getTakenStatusClass(timing) {
  if (timing === "Taken on time") return "is-on-time";
  if (timing.endsWith("early.")) return "is-early";
  return "is-late";
}

function isMissedDate(date, loggedAt) {
  if (loggedAt) return false;

  return date < today
    || (toKey(date) === toKey(today) && new Date() > getTodayDoseTime(new Date()));
}

function formatCountdown(milliseconds) {
  const isPast = milliseconds < 0;
  const totalSeconds = Math.floor(Math.abs(milliseconds) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const prefix = isPast ? "Overdue " : "";

  if (hours > 0) {
    return `${prefix}${hours}h ${minutes}m ${seconds}s`;
  }

  if (minutes > 0) {
    return `${prefix}${minutes}m ${seconds}s`;
  }

  return `${prefix}${seconds}s`;
}

function formatTimingDifference(milliseconds) {
  const absoluteMs = Math.abs(milliseconds);
  const totalMinutes = Math.round(absoluteMs / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const amount = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  if (totalMinutes <= 10) {
    return "Taken on time";
  }

  return milliseconds > 0
    ? `${amount} late.`
    : `${amount} early.`;
}

function formatScheduleTime(date) {
  return date.toLocaleString([], {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatNextDoseSentence(date) {
  return `Next dose is ${formatRelativeDoseDay(date)} at ${formatTime(date)}`;
}

function formatRelativeDoseDay(date) {
  const target = stripTime(date);
  const current = stripTime(new Date());
  const differenceDays = Math.round((target - current) / (24 * 60 * 60 * 1000));

  if (differenceDays === 0) return "today";
  if (differenceDays === 1) return "tomorrow";

  return date.toLocaleDateString([], { weekday: "long" });
}

function renderReminderState() {
  reminderButton.classList.remove("is-enabled");

  if (!supportsNotifications()) {
    reminderStatus.textContent = "Browser alerts unavailable";
    reminderButton.textContent = "Unavailable";
    reminderButton.disabled = true;
    return;
  }

  reminderButton.disabled = false;

  if (Notification.permission === "denied") {
    reminderStatus.textContent = "Notifications blocked";
    reminderButton.textContent = "Blocked";
    reminderButton.disabled = true;
    return;
  }

  if (remindersEnabled()) {
    reminderStatus.textContent = "6:50 AM and 7:00 AM";
    reminderButton.textContent = "Enabled";
    reminderButton.classList.add("is-enabled");
    return;
  }

  reminderStatus.textContent = "Alerts off";
  reminderButton.textContent = "Enable";
}

async function toggleReminders() {
  if (remindersEnabled()) {
    localStorage.removeItem(reminderKey);
    clearReminderTimers();
    renderReminderState();
    return;
  }

  if (!supportsNotifications()) {
    renderReminderState();
    return;
  }

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  if (permission === "granted") {
    localStorage.setItem(reminderKey, "true");
    scheduleReminders();
  }

  renderReminderState();
}

function remindersEnabled() {
  return supportsNotifications()
    && Notification.permission === "granted"
    && localStorage.getItem(reminderKey) === "true";
}

function supportsNotifications() {
  return "Notification" in window;
}

function scheduleReminders() {
  clearReminderTimers();

  if (!remindersEnabled()) return;

  const now = new Date();
  const reminderTimes = getUpcomingReminderTimes(now);

  reminderTimes.forEach((reminder) => {
    const delay = reminder.time - now;
    const timerId = setTimeout(() => {
      sendDoseNotification(reminder.kind);
      scheduleReminders();
    }, delay);
    reminderTimers.push(timerId);
  });
}

function clearReminderTimers() {
  reminderTimers.forEach((timerId) => clearTimeout(timerId));
  reminderTimers = [];
}

function getUpcomingReminderTimes(now) {
  const exactTime = getNextDoseTime(now);
  const warningTime = new Date(exactTime);
  warningTime.setMinutes(warningTime.getMinutes() - 10);

  const reminders = [];
  if (warningTime > now) {
    reminders.push({ kind: "warning", time: warningTime });
  }
  if (exactTime > now) {
    reminders.push({ kind: "exact", time: exactTime });
  }

  return reminders;
}

function sendDoseNotification(kind) {
  if (!remindersEnabled()) return;
  if (logs[toKey(new Date())]) return;

  const title = kind === "warning"
    ? "Pill due in 10 minutes"
    : "Time to take your pill";
  const body = kind === "warning"
    ? "Your daily 7:00 AM dose is coming up."
    : "It is 7:00 AM. Mark your pill as taken.";

  new Notification(title, {
    body,
    tag: `pill-calendar-${kind}-${toKey(new Date())}`,
  });
}

render();
setInterval(renderCountdown, 1000);
scheduleReminders();
