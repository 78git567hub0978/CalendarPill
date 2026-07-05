import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDYAeH3upeJDJITdTTnECSphPr5IIW-R_4",
  authDomain: "calendar-pill.firebaseapp.com",
  projectId: "calendar-pill",
  storageBucket: "calendar-pill.firebasestorage.app",
  messagingSenderId: "437019253479",
  appId: "1:437019253479:web:29f8a93e5e0922abe46042"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const googleProvider = new GoogleAuthProvider();
const defaultSchedule = {
  hours: 7,
  minutes: 0,
};
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
let currentUser = null;
let logs = {};
let settings = getDefaultSettings();
let isDataReady = false;
let countdownTimer = 0;

const appShell = document.querySelector(".app-shell");
const authGate = document.querySelector("#authGate");
const authTitle = document.querySelector("#authTitle");
const authStatus = document.querySelector("#authStatus");
const signInButton = document.querySelector("#signInButton");
const authError = document.querySelector("#authError");
const appError = document.querySelector("#appError");
const calendarGrid = document.querySelector("#calendarGrid");
const monthTitle = document.querySelector("#monthTitle");
const statusStrip = document.querySelector(".status-strip");
const headerScheduleLabel = document.querySelector("#headerScheduleLabel");
const countdownStatus = document.querySelector("#countdownStatus");
const scheduleStatus = document.querySelector("#scheduleStatus");
const selectedTitle = document.querySelector("#selectedTitle");
const selectedMeta = document.querySelector("#selectedMeta");
const markTakenButton = document.querySelector("#markTakenButton");
const editDialog = document.querySelector("#editDialog");
const editConfirmPanel = document.querySelector("#editConfirmPanel");
const editForm = document.querySelector("#editForm");
const editNoButton = document.querySelector("#editNoButton");
const editYesButton = document.querySelector("#editYesButton");
const editCancelButton = document.querySelector("#editCancelButton");
const editClearButton = document.querySelector("#editClearButton");
const editHourWheel = document.querySelector("#editHourWheel");
const editMinuteWheel = document.querySelector("#editMinuteWheel");
const editNotesInput = document.querySelector("#editNotesInput");
const openSettingsButton = document.querySelector("#openSettingsButton");
const scheduleDialog = document.querySelector("#scheduleDialog");
const scheduleForm = document.querySelector("#scheduleForm");
const scheduleStartInput = document.querySelector("#scheduleStartInput");
const scheduleEndInput = document.querySelector("#scheduleEndInput");
const scheduleDatePicker = document.querySelector("#scheduleDatePicker");
const scheduleDatePickerGrid = document.querySelector("#scheduleDatePickerGrid");
const datePickerTitle = document.querySelector("#datePickerTitle");
const datePickerPrev = document.querySelector("#datePickerPrev");
const datePickerNext = document.querySelector("#datePickerNext");
const scheduleHourWheel = document.querySelector("#scheduleHourWheel");
const scheduleMinuteWheel = document.querySelector("#scheduleMinuteWheel");
const cancelScheduleButton = document.querySelector("#cancelScheduleButton");
let editDialogResolver = null;
let editingKey = "";
let editingBaseDate = today;
let editHour = 7;
let editMinute = 0;
let scheduleHour = 7;
let scheduleMinute = 0;
let activeScheduleDateInput = scheduleStartInput;
let datePickerMonth = new Date(today.getFullYear(), today.getMonth(), 1);

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
editYesButton.addEventListener("click", showEditForm);
editCancelButton.addEventListener("click", closeEditDialog);
editClearButton.addEventListener("click", clearEditedLogEntry);
editForm.addEventListener("submit", saveEditedLogEntry);
openSettingsButton.addEventListener("click", openScheduleDialog);
cancelScheduleButton.addEventListener("click", closeScheduleDialog);
scheduleForm.addEventListener("submit", saveSchedule);
scheduleStartInput.addEventListener("click", () => openScheduleDatePicker(scheduleStartInput));
scheduleEndInput.addEventListener("click", () => openScheduleDatePicker(scheduleEndInput));
datePickerPrev.addEventListener("click", () => {
  datePickerMonth = new Date(datePickerMonth.getFullYear(), datePickerMonth.getMonth() - 1, 1);
  renderScheduleDatePicker();
});
datePickerNext.addEventListener("click", () => {
  datePickerMonth = new Date(datePickerMonth.getFullYear(), datePickerMonth.getMonth() + 1, 1);
  renderScheduleDatePicker();
});
signInButton.addEventListener("click", signInWithGoogle);

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  isDataReady = false;
  appShell.hidden = true;
  hideAppError();

  if (!user) {
    showAuthGate("Sign in", "Sign in with Google to load your medicine log.", true);
    return;
  }

  showAuthGate("Loading", "Loading your medicine log...", false);

  try {
    await loadUserData(user.uid);
    isDataReady = true;
    authGate.hidden = true;
    appShell.hidden = false;
    render();
    startCountdownTimer();
  } catch (error) {
    showAuthGate("Could not load", "There was a problem loading your medicine log.", true);
    showAuthError("Check your connection and Firebase setup, then try again.");
    console.error(error);
  }
});

async function signInWithGoogle() {
  signInButton.disabled = true;
  showAuthError("");
  authStatus.textContent = "Opening Google sign-in...";

  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    showAuthGate("Sign in", "Sign in with Google to load your medicine log.", true);
    showAuthError("Google sign-in did not finish. Please try again.");
    console.error(error);
  } finally {
    signInButton.disabled = false;
  }
}

function showAuthGate(title, status, canSignIn) {
  authGate.hidden = false;
  authTitle.textContent = title;
  authStatus.textContent = status;
  signInButton.hidden = !canSignIn;
}

function showAuthError(message) {
  authError.hidden = !message;
  authError.textContent = message;
}

function showAppError(message) {
  appError.hidden = false;
  appError.textContent = message;
}

function hideAppError() {
  appError.hidden = true;
  appError.textContent = "";
}

function startCountdownTimer() {
  if (countdownTimer) return;
  countdownTimer = setInterval(renderCountdown, 1000);
}

function render() {
  if (!isDataReady) return;

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
    if (logs[key] && !isFutureDate(date)) {
      button.classList.add("is-taken");
      const timingClass = getCalendarTimingClass(logs[key], date);
      if (timingClass) button.classList.add(timingClass);
    }
    if (isEndedDate(date)) button.classList.add("is-ended");
    if (isFutureDate(date) && !isEndedDate(date)) button.classList.add("is-future");
    if (!logs[key] && isMissedDate(date, logs[key])) button.classList.add("is-missed");
    if (!isFutureDate(date) && hasScheduleChangeOn(key)) button.classList.add("is-schedule-change");

    time.dateTime = key;
    const dateNumber = document.createElement("span");
    dateNumber.className = "day-number";
    dateNumber.textContent = date.getDate();
    time.append(dateNumber);
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
  const loggedAt = isFutureDate(selectedDate) ? null : logs[key];
  selectedTitle.textContent = dateFormatter.format(selectedDate);
  renderSelectedMeta(loggedAt, selectedDate);
  renderMarkButton(loggedAt, selectedDate);
  markTakenButton.disabled = isFutureDate(selectedDate) || isEndedDate(selectedDate);
}

function renderMarkButton(loggedAt, date) {
  const missed = isMissedDate(date, loggedAt);
  const future = isFutureDate(date);
  const ended = isEndedDate(date);
  let label = "Mark taken";
  let statusClass = "";

  if (ended) {
    label = "Ended";
    statusClass = "is-ended";
  } else if (future) {
    label = "Upcoming";
  } else if (loggedAt) {
    const timing = getTimingDetail(loggedAt, date);
    label = getTakenStatusLabel(timing);
    statusClass = getTakenStatusClass(timing);
  } else if (missed) {
    label = "Missed";
    statusClass = "is-missed";
  }

  markTakenButton.classList.remove("is-on-time", "is-late", "is-early", "is-missed", "is-ended");
  if (statusClass) markTakenButton.classList.add(statusClass);
  markTakenButton.textContent = label;
}

function renderSelectedMeta(loggedAt, date) {
  selectedMeta.replaceChildren();
  const scheduleChangeLine = getScheduleChangeLine(date);

  if (!loggedAt) {
    const missed = isMissedDate(date, loggedAt);
    const ended = isEndedDate(date);
    const statusLine = document.createElement("span");
    statusLine.textContent = ended ? "Schedule ended" : missed ? "Missed" : "No pill logged for this day.";
    selectedMeta.className = missed || ended ? "missed-detail" : "";
    selectedMeta.append(statusLine);
    if (scheduleChangeLine) selectedMeta.append(scheduleChangeLine);
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
  if (scheduleChangeLine) selectedMeta.append(scheduleChangeLine);
}

function openScheduleDialog() {
  const currentSchedule = getEffectiveSchedule(selectedDate);
  const selectedKey = toKey(selectedDate);
  const existingChange = settings.scheduleChanges.find((change) => change.date === selectedKey);
  scheduleStartInput.value = toKey(selectedDate);
  scheduleEndInput.value = existingChange?.endDate || "";
  scheduleDatePicker.hidden = true;
  setScheduleWheelTime(currentSchedule || defaultSchedule);
  renderPickerWheel(scheduleHourWheel, getHourWheelOptions(), scheduleHour, (value) => {
    scheduleHour = value;
  });
  renderPickerWheel(scheduleMinuteWheel, getMinuteWheelOptions(), scheduleMinute, (value) => {
    scheduleMinute = value;
  });
  scheduleDialog.hidden = false;
}

function openScheduleDatePicker(input) {
  const inputDate = parseInputDate(input.value) || selectedDate;
  activeScheduleDateInput = input;
  datePickerMonth = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1);
  scheduleDatePicker.hidden = false;
  renderScheduleDatePicker();
}

function renderScheduleDatePicker() {
  scheduleDatePickerGrid.replaceChildren();
  datePickerTitle.textContent = monthFormatter.format(datePickerMonth);

  const selectedKey = activeScheduleDateInput.value;
  const firstDayOffset = datePickerMonth.getDay();
  const gridStart = new Date(datePickerMonth);
  gridStart.setDate(datePickerMonth.getDate() - firstDayOffset);

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const key = toKey(date);
    const button = document.createElement("button");

    button.type = "button";
    button.className = "date-picker__day";
    button.textContent = date.getDate();
    button.setAttribute("aria-label", dateFormatter.format(date));
    if (date.getMonth() !== datePickerMonth.getMonth()) button.classList.add("is-outside");
    if (key === selectedKey) button.classList.add("is-selected");
    button.addEventListener("click", () => {
      activeScheduleDateInput.value = key;
      scheduleDatePicker.hidden = true;
    });
    scheduleDatePickerGrid.append(button);
  }
}

function closeScheduleDialog() {
  scheduleDialog.hidden = true;
}

async function saveSchedule(event) {
  event.preventDefault();
  hideAppError();

  const startDate = parseInputDate(scheduleStartInput.value);
  if (!startDate) return;
  const endDate = scheduleEndInput.value ? parseInputDate(scheduleEndInput.value) : null;
  if (scheduleEndInput.value && !endDate) return;

  const previousSettings = {
    scheduleChanges: [...settings.scheduleChanges],
  };
  const change = {
    date: toKey(startDate),
    schedule: getScheduleWheelTime(),
  };
  if (endDate && endDate >= startDate) {
    change.endDate = toKey(endDate);
  }
  settings.scheduleChanges = [
    ...settings.scheduleChanges.filter((item) => item.date !== change.date),
    change,
  ];
  settings.scheduleChanges = compactScheduleChanges(settings.scheduleChanges);

  try {
    await saveSettingsToFirestore();
    selectedDate = stripTime(startDate);
    viewedMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    closeScheduleDialog();
    render();
  } catch (error) {
    settings = previousSettings;
    showAppError("Could not save the schedule change. Please try again.");
    console.error(error);
    render();
  }
}

function renderCountdown() {
  const now = new Date();
  const todayDose = getTodayDoseTime(now);
  const todayLog = logs[toKey(today)];
  const missedToday = todayDose && now > todayDose && !todayLog;
  const offScheduleToday = todayLog && isOutsideScheduleWindow(todayLog, today);
  const nextDose = getNextDoseTime(now);
  const remainingMs = nextDose ? nextDose - now : 0;

  statusStrip.classList.toggle("is-missed-dose", missedToday);
  statusStrip.classList.toggle("is-off-schedule-dose", Boolean(offScheduleToday));
  statusStrip.classList.toggle("is-upcoming-dose", !missedToday && !offScheduleToday);
  headerScheduleLabel.textContent = formatHeaderScheduleLabel(today);
  document.querySelector(".status-label").textContent = nextDose ? formatNextDoseSentence(nextDose) : "Schedule ended";
  countdownStatus.textContent = nextDose ? formatCountdown(remainingMs) : "Ended";
  scheduleStatus.textContent = nextDose ? "remaining until next dose" : "";
}

async function markTaken(date) {
  if (!canLogDate(date)) return;

  hideAppError();
  const key = toKey(date);
  const entry = createLogEntry(new Date(), "");
  logs[key] = entry;

  try {
    await saveLogToFirestore(key, entry);
    render();
  } catch (error) {
    delete logs[key];
    showAppError("Could not save this dose. Please try again.");
    console.error(error);
    render();
  }
}

async function handleMarkButtonClick() {
  const key = toKey(selectedDate);

  if (isFutureDate(selectedDate)) {
    return;
  }

  if (isEndedDate(selectedDate)) {
    return;
  }

  if (!logs[key] && !isMissedDate(selectedDate, logs[key])) {
    await markTaken(selectedDate);
    return;
  }

  openEditForm(key);
}

function openEditForm(key) {
  editingKey = key;
  editDialog.hidden = false;
  editConfirmPanel.hidden = true;
  editForm.hidden = false;
  fillEditForm(key);
}

function closeEditDialog(confirmed = false) {
  editDialog.hidden = true;
  editConfirmPanel.hidden = false;
  editForm.hidden = true;

  if (editDialogResolver) {
    editDialogResolver(confirmed);
    editDialogResolver = null;
  }
}

function showEditForm() {
  openEditForm(editingKey);
}

function fillEditForm(key) {
  const entry = logs[key];
  const selectedDay = parseInputDate(key) || selectedDate;
  const takenAt = entry ? new Date(getLogTakenAt(entry)) : getDefaultEditTime(selectedDay);
  editingBaseDate = selectedDay;
  setEditTimeFromDate(takenAt);
  renderPickerWheel(editHourWheel, getHourWheelOptions(), editHour, (value) => {
    editHour = value;
  });
  renderPickerWheel(editMinuteWheel, getMinuteWheelOptions(), editMinute, (value) => {
    editMinute = value;
  });
  editNotesInput.value = entry ? getLogNotes(entry) : "";
}

function getDefaultEditTime(date) {
  const now = new Date();
  const defaultTime = new Date(date);
  defaultTime.setHours(now.getHours(), now.getMinutes(), 0, 0);
  return defaultTime;
}

async function saveEditedLogEntry(event) {
  event.preventDefault();
  if (!canLogDate(editingBaseDate)) return;
  hideAppError();

  const parsedTime = getEditedTime();

  const updatedDate = new Date(editingBaseDate);
  updatedDate.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
  const updatedKey = toKey(updatedDate);
  const previousEntry = logs[editingKey];
  const entry = createLogEntry(updatedDate, editNotesInput.value.trim());

  if (editingKey !== toKey(updatedDate)) {
    delete logs[editingKey];
  }

  logs[updatedKey] = entry;

  try {
    await saveEditedLogToFirestore(editingKey, updatedKey, entry);
    selectedDate = stripTime(updatedDate);
    viewedMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    closeEditDialog(true);
    render();
  } catch (error) {
    if (editingKey !== updatedKey) {
      delete logs[updatedKey];
      if (previousEntry) logs[editingKey] = previousEntry;
    } else {
      if (previousEntry) {
        logs[updatedKey] = previousEntry;
      } else {
        delete logs[updatedKey];
      }
    }
    showAppError("Could not save the edit. Please try again.");
    console.error(error);
    render();
  }
}

async function clearEditedLogEntry() {
  if (!canLogDate(editingBaseDate)) return;
  hideAppError();

  const previousEntry = logs[editingKey];
  delete logs[editingKey];

  try {
    await deleteLogFromFirestore(editingKey);
    closeEditDialog(true);
    render();
  } catch (error) {
    if (previousEntry) logs[editingKey] = previousEntry;
    showAppError("Could not clear this dose. Please try again.");
    console.error(error);
    render();
  }
}

function setEditTimeFromDate(date) {
  editHour = date.getHours();
  editMinute = date.getMinutes();
}

function getEditedTime() {
  editHour = getWheelValue(editHourWheel, editHour);
  editMinute = getWheelValue(editMinuteWheel, editMinute);
  return {
    hours: editHour,
    minutes: editMinute,
  };
}

function setScheduleWheelTime(schedule) {
  scheduleHour = schedule.hours;
  scheduleMinute = schedule.minutes;
}

function getScheduleWheelTime() {
  scheduleHour = getWheelValue(scheduleHourWheel, scheduleHour);
  scheduleMinute = getWheelValue(scheduleMinuteWheel, scheduleMinute);
  return normalizeSchedule({
    hours: scheduleHour,
    minutes: scheduleMinute,
  });
}

function normalizeSchedule(schedule) {
  const hours = Number(schedule.hours);
  const minutes = Number(schedule.minutes);

  return {
    hours: Number.isInteger(hours) && hours >= 0 && hours <= 23 ? hours : defaultSchedule.hours,
    minutes: Number.isInteger(minutes) && minutes >= 0 && minutes <= 59 ? minutes : defaultSchedule.minutes,
  };
}

function getHourWheelOptions() {
  return Array.from({ length: 24 }, (_, index) => ({
    value: index,
    label: String(index).padStart(2, "0"),
  }));
}

function getMinuteWheelOptions() {
  return Array.from({ length: 60 }, (_, index) => ({
    value: index,
    label: String(index).padStart(2, "0"),
  }));
}

function renderPickerWheel(wheel, options, selectedValue, onSelect) {
  const optionHeight = 40;
  const topSpacer = document.createElement("div");
  const bottomSpacer = document.createElement("div");
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === selectedValue));
  let scrollTimeout = 0;

  wheel.replaceChildren();
  wheel._pickerOptions = options;
  wheel._pickerOnSelect = onSelect;
  topSpacer.className = "wheel-picker__spacer";
  bottomSpacer.className = "wheel-picker__spacer";
  wheel.append(topSpacer);

  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "wheel-picker__option";
    button.textContent = option.label;
    button.dataset.value = String(option.value);
    if (option.value === selectedValue) button.classList.add("is-selected");
    button.addEventListener("click", () => selectWheelValue(wheel, option.value));
    wheel.append(button);
  });

  wheel.append(bottomSpacer);
  wheel.onscroll = () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const index = Math.min(options.length - 1, Math.max(0, Math.round(wheel.scrollTop / optionHeight)));
      selectWheelValue(wheel, options[index].value, false);
    }, 90);
  };

  requestAnimationFrame(() => {
    wheel.scrollTop = selectedIndex * optionHeight;
  });
}

function selectWheelValue(wheel, value, shouldScroll = true) {
  const options = wheel._pickerOptions || [];
  const selectedIndex = options.findIndex((option) => option.value === value);
  if (selectedIndex < 0) return;

  wheel.querySelectorAll(".wheel-picker__option").forEach((option, index) => {
    option.classList.toggle("is-selected", index === selectedIndex);
  });
  wheel._pickerOnSelect?.(value);

  if (shouldScroll) {
    wheel.scrollTo({ top: selectedIndex * 40, behavior: "smooth" });
  }
}

function getWheelValue(wheel, fallbackValue) {
  const options = wheel._pickerOptions || [];
  if (!options.length) return fallbackValue;

  const index = Math.min(options.length - 1, Math.max(0, Math.round(wheel.scrollTop / 40)));
  const selectedValue = options[index].value;
  selectWheelValue(wheel, selectedValue, false);
  return selectedValue;
}

function getDayLabel(date) {
  const status = logs[toKey(date)] ? "pill taken" : "not logged";
  return `${dateFormatter.format(date)}, ${status}`;
}

async function loadUserData(uid) {
  const [settingsSnapshot, logsSnapshot] = await Promise.all([
    getDoc(doc(db, "users", uid, "settings", "main")),
    getDocs(collection(db, "users", uid, "logs")),
  ]);

  settings = parseSettings(settingsSnapshot.exists() ? settingsSnapshot.data() : {});
  logs = {};
  logsSnapshot.forEach((logSnapshot) => {
    const entry = parseLogEntry(logSnapshot.data());
    if (entry.takenAt) logs[logSnapshot.id] = entry;
  });
}

function getDefaultSettings() {
  return {
    scheduleChanges: [],
  };
}

function parseSettings(savedSettings) {
  const savedChanges = Array.isArray(savedSettings.scheduleChanges)
    ? savedSettings.scheduleChanges
    : [];
  const migratedChanges = savedChanges.length > 0
    ? savedChanges
    : savedSettings.schedule
      ? [{ date: toKey(today), schedule: savedSettings.schedule }]
      : [];

  return {
    scheduleChanges: normalizeScheduleChanges(migratedChanges),
  };
}

function parseLogEntry(entry) {
  const takenAt = typeof entry?.takenAt === "string" ? entry.takenAt : "";

  return {
    takenAt: Number.isNaN(new Date(takenAt).getTime()) ? "" : takenAt,
    notes: typeof entry?.notes === "string" ? entry.notes : "",
  };
}

async function saveSettingsToFirestore() {
  requireSignedInUser();
  await setDoc(doc(db, "users", currentUser.uid, "settings", "main"), settings);
}

async function saveLogToFirestore(key, entry) {
  requireSignedInUser();
  await setDoc(doc(db, "users", currentUser.uid, "logs", key), entry);
}

async function saveEditedLogToFirestore(previousKey, nextKey, entry) {
  requireSignedInUser();

  if (previousKey === nextKey) {
    await saveLogToFirestore(nextKey, entry);
    return;
  }

  const batch = writeBatch(db);
  batch.delete(doc(db, "users", currentUser.uid, "logs", previousKey));
  batch.set(doc(db, "users", currentUser.uid, "logs", nextKey), entry);
  await batch.commit();
}

async function deleteLogFromFirestore(key) {
  requireSignedInUser();
  await deleteDoc(doc(db, "users", currentUser.uid, "logs", key));
}

function requireSignedInUser() {
  if (!currentUser) {
    throw new Error("You must sign in before saving.");
  }
}

function normalizeScheduleChanges(changes) {
  const normalizedChanges = changes
    .map((change) => ({
      date: typeof change.date === "string" && parseInputDate(change.date) ? change.date : "",
      endDate: typeof change.endDate === "string" && parseInputDate(change.endDate) ? change.endDate : "",
      schedule: normalizeSchedule(change.schedule || defaultSchedule),
    }))
    .filter((change) => change.date)
    .map((change) => ({
      ...change,
      endDate: change.endDate && change.endDate >= change.date ? change.endDate : "",
    }))
    .sort((first, second) => first.date.localeCompare(second.date));

  return compactScheduleChanges(normalizedChanges);
}

function compactScheduleChanges(changes) {
  const compacted = [];
  let previousSchedule = defaultSchedule;

  changes
    .sort((first, second) => first.date.localeCompare(second.date))
    .forEach((change) => {
      if (change.endDate || !schedulesMatch(change.schedule, previousSchedule)) {
        compacted.push(change);
        previousSchedule = change.endDate ? null : change.schedule;
      }
    });

  return compacted;
}

function schedulesMatch(first, second) {
  if (!first || !second) return false;
  return first.hours === second.hours && first.minutes === second.minutes;
}

function createLogEntry(takenAt, notes) {
  return {
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
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatInputTime(date) {
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatTimeInputValue(date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
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
  if (!scheduledAt) return "Schedule ended";
  const differenceMs = takenAt - scheduledAt;
  return formatTimingDifference(differenceMs);
}

function getNextDoseTime(now) {
  let nextDose = getTodayDoseTime(now);

  if (nextDose && nextDose > now) {
    return nextDose;
  }

  for (let offset = 1; offset <= 370; offset += 1) {
    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + offset);
    nextDose = getScheduledDoseTime(nextDate);
    if (nextDose) return nextDose;
  }

  return null;
}

function getTodayDoseTime(now) {
  return getScheduledDoseTime(now);
}

function getScheduledDoseTime(date) {
  const schedule = getEffectiveSchedule(date);
  if (!schedule) return null;

  const doseTime = new Date(date);
  doseTime.setHours(schedule.hours, schedule.minutes, 0, 0);
  return doseTime;
}

function getEffectiveSchedule(date) {
  const key = toKey(date);
  let schedule = defaultSchedule;

  for (const change of settings.scheduleChanges) {
    if (change.date > key) break;
    schedule = change.endDate && key > change.endDate ? null : change.schedule;
  }

  return schedule;
}

function isEndedDate(date) {
  return !getEffectiveSchedule(date);
}

function hasScheduleChangeOn(key) {
  return settings.scheduleChanges.some((change) => change.date === key);
}

function getScheduleChangeLine(date) {
  const change = settings.scheduleChanges.find((item) => item.date === toKey(date));
  if (!change) return null;

  const line = document.createElement("span");
  const startDate = parseInputDate(change.date);
  const endDate = change.endDate ? parseInputDate(change.endDate) : null;
  const previousSchedule = getPreviousSchedule(change.date);
  const startText = `This change starts ${formatRelativeStartDate(startDate)}.`;
  const endText = endDate ? ` This change ends ${formatShortDate(endDate)}.` : "";

  line.className = "schedule-change-detail";
  line.textContent = `Schedule was changed to ${formatScheduleClock(change.schedule)} from ${formatScheduleClock(previousSchedule)}. ${startText}${endText}`;
  return line;
}

function getPreviousSchedule(changeDateKey) {
  let schedule = defaultSchedule;

  for (const change of settings.scheduleChanges) {
    if (change.date >= changeDateKey) break;
    schedule = change.endDate && changeDateKey > change.endDate ? defaultSchedule : change.schedule;
  }

  return schedule;
}

function isOutsideScheduleWindow(loggedAt, date) {
  const takenAt = new Date(getLogTakenAt(loggedAt));
  const scheduledAt = getScheduledDoseTime(date);
  if (!scheduledAt) return false;

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
  if (isEndedDate(date)) return false;

  return date < today
    || (toKey(date) === toKey(today) && new Date() > getTodayDoseTime(new Date()));
}

function isFutureDate(date) {
  return stripTime(date) > today;
}

function canLogDate(date) {
  return !isFutureDate(date) && !isEndedDate(date);
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

function formatHeaderScheduleLabel(date) {
  const schedule = getEffectiveSchedule(date);
  return schedule ? `Schedule is Every day at ${formatScheduleClock(schedule)}` : "Schedule ended";
}

function formatRelativeStartDate(date) {
  return toKey(date) === toKey(today) ? "today" : formatShortDate(date);
}

function formatShortDate(date) {
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatScheduleClock(schedule) {
  const scheduleDate = new Date();
  scheduleDate.setHours(schedule.hours, schedule.minutes, 0, 0);
  return formatTime(scheduleDate);
}

function formatRelativeDoseDay(date) {
  const target = stripTime(date);
  const current = stripTime(new Date());
  const differenceDays = Math.round((target - current) / (24 * 60 * 60 * 1000));

  if (differenceDays === 0) return "today";
  if (differenceDays === 1) return "tomorrow";

  return date.toLocaleDateString([], { weekday: "long" });
}

showAuthGate("Loading", "Checking your sign-in...", false);
