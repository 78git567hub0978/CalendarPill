const storageKey = "pill-calendar-logs";
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

const calendarGrid = document.querySelector("#calendarGrid");
const monthTitle = document.querySelector("#monthTitle");
const statusStrip = document.querySelector(".status-strip");
const countdownStatus = document.querySelector("#countdownStatus");
const scheduleStatus = document.querySelector("#scheduleStatus");
const selectedTitle = document.querySelector("#selectedTitle");
const selectedMeta = document.querySelector("#selectedMeta");
const markTakenButton = document.querySelector("#markTakenButton");
const editDialog = document.querySelector("#editDialog");
const editNoButton = document.querySelector("#editNoButton");
const editYesButton = document.querySelector("#editYesButton");
let editDialogResolver = null;

document.querySelector("#prevMonth").addEventListener("click", () => {
  viewedMonth = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() - 1, 1);
  render();
});

document.querySelector("#nextMonth").addEventListener("click", () => {
  viewedMonth = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() + 1, 1);
  render();
});

markTakenButton.addEventListener("click", handleMarkButtonClick);
editNoButton.addEventListener("click", () => closeEditDialog(false));
editYesButton.addEventListener("click", () => closeEditDialog(true));

function render() {
  monthTitle.textContent = monthFormatter.format(viewedMonth);
  renderCalendar();
  renderDetails();
  renderCountdown();
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
  markTakenButton.disabled = false;
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
  const notesLine = document.createElement("span");
  const timing = getTimingDetail(loggedAt, date);
  const notes = getLogNotes(loggedAt);
  selectedMeta.className = "";
  takenLine.textContent = `Taken at ${formatTime(new Date(getLogTakenAt(loggedAt)))}.`;
  timingLine.className = `timing-detail ${getTakenStatusClass(timing)}`.trim();
  timingLine.textContent = timing;
  notesLine.className = "notes-detail";
  notesLine.textContent = notes ? `Notes: ${notes}` : "No notes";
  selectedMeta.append(takenLine, timingLine, notesLine);
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
  setLogEntry(date, new Date(), "");
  writeLogs();
  render();
}

async function handleMarkButtonClick() {
  const key = toKey(selectedDate);

  if (!logs[key]) {
    markTaken(selectedDate);
    return;
  }

  if (await confirmEdit()) {
    editLogEntry(key);
  }
}

function confirmEdit() {
  editDialog.hidden = false;
  editYesButton.focus();

  return new Promise((resolve) => {
    editDialogResolver = resolve;
  });
}

function closeEditDialog(confirmed) {
  editDialog.hidden = true;

  if (editDialogResolver) {
    editDialogResolver(confirmed);
    editDialogResolver = null;
  }
}

function editLogEntry(key) {
  const entry = logs[key];
  const takenAt = new Date(getLogTakenAt(entry));
  const editedDate = prompt("Edit date", key);

  if (!editedDate) return;

  const parsedDate = parseInputDate(editedDate);
  if (!parsedDate) {
    alert("Use a date like 2026-07-04.");
    return;
  }

  const editedTime = prompt("Edit time", formatInputTime(takenAt));
  if (!editedTime) return;

  const parsedTime = parseInputTime(editedTime);
  if (!parsedTime) {
    alert("Use a time like 7:05 AM or 19:05.");
    return;
  }

  const editedNotes = prompt("Add notes", getLogNotes(entry));
  if (editedNotes === null) return;

  const updatedDate = new Date(parsedDate);
  updatedDate.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);

  if (key !== toKey(updatedDate)) {
    delete logs[key];
  }

  setLogEntry(updatedDate, updatedDate, editedNotes.trim());
  selectedDate = stripTime(updatedDate);
  viewedMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  writeLogs();
  render();
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

function setLogEntry(date, takenAt, notes) {
  logs[toKey(date)] = {
    takenAt: takenAt.toISOString(),
    notes,
  };
}

function getLogTakenAt(entry) {
  return typeof entry === "string" ? entry : entry?.takenAt;
}

function getLogNotes(entry) {
  return typeof entry === "string" ? "" : entry?.notes || "";
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

function parseInputDate(value) {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);

  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }

  return date;
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
  const takenAt = new Date(getLogTakenAt(loggedAt));
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
  const takenAt = new Date(getLogTakenAt(loggedAt));
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

render();
setInterval(renderCountdown, 1000);
