console.log("app.js loaded");

const APP_VERSION = "v225";
const ALLOWED_EMAIL = "dllaurence90@gmail.com";
const ALLOWED_UID = "nIku6M7ufURgtymfFCcBq0HjCbf1";
const localCachePrefix = "pill-calendar-cache";

const firebaseConfig = {
  apiKey: "AIzaSyDYAeH3upeJDJITdTTnECSphPr5IIW-R_4",
  authDomain: "calendar-pill.firebaseapp.com",
  projectId: "calendar-pill",
  storageBucket: "calendar-pill.firebasestorage.app",
  messagingSenderId: "437019253479",
  appId: "1:437019253479:web:29f8a93e5e0922abe46042"
};

let firebaseApp = null;
let auth = null;
let db = null;
let storage = null;
let googleProvider = null;
let GoogleAuthProvider = null;
let collection = null;
let deleteDoc = null;
let deleteObject = null;
let doc = null;
let getDownloadURL = null;
let getDoc = null;
let getDocs = null;
let onAuthStateChanged = null;
let storageRef = null;
let setDoc = null;
let signInWithPopup = null;
let uploadBytes = null;
let writeBatch = null;
const defaultSchedule = {
  hours: 7,
  minutes: 0,
};
const hivTestLocations = [
  "LoveYourself Mandaluyong",
  "LoveYourself Pasay",
  "SAIL Calamba",
];
const scheduleWindowMs = 10 * 60 * 1000;
const feedUploadTimeoutMs = 30000;
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
let feedPosts = [];
let settings = getDefaultSettings();
let isDataReady = false;
let countdownTimer = 0;
let accessWasDenied = false;

const appShell = document.querySelector(".app-shell");
const authGate = document.querySelector("#authGate");
const authTitle = document.querySelector("#authTitle");
const authStatus = document.querySelector("#authStatus");
const signInButton = document.querySelector("#signInButton");
const authError = document.querySelector("#authError");
const appError = document.querySelector("#appError");
console.log("auth gate element:", authGate);
const calendarGrid = document.querySelector("#calendarGrid");
const monthTitle = document.querySelector("#monthTitle");
const todayJumpButton = document.querySelector("#todayJumpButton");
const statusStrip = document.querySelector(".status-strip");
const countdownStatus = document.querySelector("#countdownStatus");
const scheduleStatus = document.querySelector("#scheduleStatus");
const pillsRemainingCount = document.querySelector("#pillsRemainingCount");
const appVersion = document.querySelector("#appVersion");
const selectedTitle = document.querySelector("#selectedTitle");
const selectedMeta = document.querySelector("#selectedMeta");
const encounterDetailPanel = document.querySelector("#encounterDetailPanel");
const encounterDetailList = document.querySelector("#encounterDetailList");
const editEncounterIconButton = document.querySelector("#editEncounterIconButton");
const markActionMessage = document.querySelector("#markActionMessage");
const markTakenButton = document.querySelector("#markTakenButton");
const editDoseIconButton = document.querySelector("#editDoseIconButton");
const editDialog = document.querySelector("#editDialog");
const editConfirmPanel = document.querySelector("#editConfirmPanel");
const editForm = document.querySelector("#editForm");
const editFormTitle = document.querySelector("#editFormTitle");
const backEditDoseButton = document.querySelector("#backEditDoseButton");
const editNoButton = document.querySelector("#editNoButton");
const editYesButton = document.querySelector("#editYesButton");
const editCancelButton = document.querySelector("#editCancelButton");
const clearDoseDialog = document.querySelector("#clearDoseDialog");
const cancelClearDoseButton = document.querySelector("#cancelClearDoseButton");
const confirmClearDoseButton = document.querySelector("#confirmClearDoseButton");
const sexDialog = document.querySelector("#sexDialog");
const didNotHaveSexButton = document.querySelector("#didNotHaveSexButton");
const hadSexButton = document.querySelector("#hadSexButton");
const encounterDialog = document.querySelector("#encounterDialog");
const encounterForm = document.querySelector("#encounterForm");
const encounterDialogTitle = document.querySelector("#encounterDialogTitle");
const encounterDraftList = document.querySelector("#encounterDraftList");
const backEncounterButton = document.querySelector("#backEncounterButton");
const encounterCancelButton = document.querySelector("#encounterCancelButton");
const addEncounterButton = document.querySelector("#addEncounterButton");
const encounterBodyCountInput = document.querySelector("#encounterBodyCountInput");
const encounterLocationInput = document.querySelector("#encounterLocationInput");
const encounterKissSelect = document.querySelector("#encounterKissSelect");
const encounterISuckedHimSelect = document.querySelector("#encounterISuckedHimSelect");
const encounterHeSuckedMeSelect = document.querySelector("#encounterHeSuckedMeSelect");
const encounterIFuckedHimSelect = document.querySelector("#encounterIFuckedHimSelect");
const encounterHeFuckedMeSelect = document.querySelector("#encounterHeFuckedMeSelect");
const encounterISwallowedSelect = document.querySelector("#encounterISwallowedSelect");
const encounterHeSwallowedSelect = document.querySelector("#encounterHeSwallowedSelect");
const encounterICameSelect = document.querySelector("#encounterICameSelect");
const encounterHeCameSelect = document.querySelector("#encounterHeCameSelect");
const encounterNotesInput = document.querySelector("#encounterNotesInput");
const encounterLineNoteInputs = Array.from(document.querySelectorAll("[data-encounter-note]"));
const editTimeToggleButton = document.querySelector("#editTimeToggleButton");
const editTimeField = document.querySelector("#editTimeField");
const editHourWheel = document.querySelector("#editHourWheel");
const editMinuteWheel = document.querySelector("#editMinuteWheel");
const saveTimeButton = document.querySelector("#saveTimeButton");
const editNotesToggleButton = document.querySelector("#editNotesToggleButton");
const editNotesField = document.querySelector("#editNotesField");
const editNotesInput = document.querySelector("#editNotesInput");
const saveNotesButton = document.querySelector("#saveNotesButton");
const editPillsToggleButton = document.querySelector("#editPillsToggleButton");
const editPillsField = document.querySelector("#editPillsField");
const pillsTakenButton = document.querySelector("#pillsTakenButton");
const pillsTakenWheelWrap = document.querySelector("#pillsTakenWheelWrap");
const pillsTakenWheel = document.querySelector("#pillsTakenWheel");
const savePillsButton = document.querySelector("#savePillsButton");
const editHadSexButton = document.querySelector("#editHadSexButton");
const editHivTestButton = document.querySelector("#editHivTestButton");
const editHivTestField = document.querySelector("#editHivTestField");
const editHivLocationSelect = document.querySelector("#editHivLocationSelect");
const saveHivButton = document.querySelector("#saveHivButton");
const refillToggleButton = document.querySelector("#refillToggleButton");
const refillPillsField = document.querySelector("#refillPillsField");
const refillPillsButton = document.querySelector("#refillPillsButton");
const refillPillsWheelWrap = document.querySelector("#refillPillsWheelWrap");
const refillPillsWheel = document.querySelector("#refillPillsWheel");
const saveRefillButton = document.querySelector("#saveRefillButton");
const openSettingsButton = document.querySelector("#openSettingsButton");
const feedDialog = document.querySelector("#feedDialog");
const feedForm = document.querySelector("#feedForm");
const backFeedButton = document.querySelector("#backFeedButton");
const feedImageInput = document.querySelector("#feedImageInput");
const feedCaptionInput = document.querySelector("#feedCaptionInput");
const feedStatus = document.querySelector("#feedStatus");
const feedUploadButton = document.querySelector("#feedUploadButton");
const feedList = document.querySelector("#feedList");
const postActionsDialog = document.querySelector("#postActionsDialog");
const postActionsDate = document.querySelector("#postActionsDate");
const editPostButton = document.querySelector("#editPostButton");
const deletePostButton = document.querySelector("#deletePostButton");
const closePostActionsButton = document.querySelector("#closePostActionsButton");
const scheduleDialog = document.querySelector("#scheduleDialog");
const scheduleChoicePanel = document.querySelector("#scheduleChoicePanel");
const openSettingsNotesButton = document.querySelector("#openSettingsNotesButton");
const settingsNotesForm = document.querySelector("#settingsNotesForm");
const settingsNotesPreview = document.querySelector("#settingsNotesPreview");
const settingsNotesEditField = document.querySelector("#settingsNotesEditField");
const settingsNotesInput = document.querySelector("#settingsNotesInput");
const settingsNotesActions = document.querySelector("#settingsNotesActions");
const backSettingsNotesButton = document.querySelector("#backSettingsNotesButton");
const editSettingsNotesButton = document.querySelector("#editSettingsNotesButton");
const cancelSettingsNotesButton = document.querySelector("#cancelSettingsNotesButton");
const scheduleForm = document.querySelector("#scheduleForm");
const scheduleDialogTitle = document.querySelector("#scheduleDialogTitle");
const scheduleDateLabel = document.querySelector("#scheduleDateLabel");
const scheduleStartInput = document.querySelector("#scheduleStartInput");
const scheduleDatePicker = document.querySelector("#scheduleDatePicker");
const scheduleDatePickerGrid = document.querySelector("#scheduleDatePickerGrid");
const datePickerTitle = document.querySelector("#datePickerTitle");
const datePickerPrev = document.querySelector("#datePickerPrev");
const datePickerNext = document.querySelector("#datePickerNext");
const scheduleTimeField = document.querySelector("#scheduleTimeField");
const scheduleHourWheel = document.querySelector("#scheduleHourWheel");
const scheduleMinuteWheel = document.querySelector("#scheduleMinuteWheel");
const cancelScheduleButton = document.querySelector("#cancelScheduleButton");
const scheduleSaveButton = document.querySelector("#scheduleSaveButton");
const startScheduleButton = document.querySelector("#startScheduleButton");
const stopPrepButton = document.querySelector("#stopPrepButton");
let editDialogResolver = null;
let editingKey = "";
let editingBaseDate = today;
let editHour = 7;
let editMinute = 0;
let editPillsTaken = 1;
let isEditTimeOpen = false;
let isEditPillsOpen = false;
let isEditNotesOpen = false;
let isPillsTakenWheelOpen = false;
let editSexStatus = "";
let editEncounterDetails = [];
let activeEditSection = "";
let encounterDialogDraftDetails = [];
let encounterDialogSourceDetails = [];
let encounterDialogEditIndex = 0;
let encounterDialogMode = "edit";
let editHivTest = false;
let editHivLocation = hivTestLocations[0];
let editRefillStart = false;
let editStartingPills = 30;
let isRefillPillsWheelOpen = false;
let scheduleHour = 7;
let scheduleMinute = 0;
let scheduleMode = "start";
let activeScheduleDateInput = scheduleStartInput;
let datePickerMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let lockedScrollY = 0;
let calendarTouchStartY = 0;
let calendarTouchStartX = 0;
let isCalendarSliding = false;
let calendarSlideTimeout = 0;
let lastTodayJumpAt = 0;
let isSettingsNotesEditing = false;
let activeFeedPostId = "";
let editingFeedPostId = "";

document.querySelector("#prevMonth").addEventListener("click", () => {
  changeViewedMonth(-1);
});

document.querySelector("#nextMonth").addEventListener("click", () => {
  changeViewedMonth(1);
});

todayJumpButton.addEventListener("pointerup", handleTodayJump);
todayJumpButton.addEventListener("touchend", handleTodayJump);
todayJumpButton.addEventListener("click", handleTodayJump);
calendarGrid.addEventListener("touchstart", handleCalendarTouchStart, { passive: true });
calendarGrid.addEventListener("touchend", handleCalendarTouchEnd);
calendarGrid.addEventListener("wheel", handleCalendarWheel, { passive: false });

markTakenButton.addEventListener("click", handleMarkButtonClick);
editDoseIconButton.addEventListener("click", openSelectedDoseEditor);
editEncounterIconButton.addEventListener("click", openEncounterDetailsEditor);
editDialog.addEventListener("click", closeEditDialogOnBackdrop);
backEditDoseButton.addEventListener("click", handleEditDoseBack);
editNoButton.addEventListener("click", () => closeEditDialog(false));
editYesButton.addEventListener("click", showEditForm);
editCancelButton.addEventListener("click", closeEditDialog);
clearDoseDialog.addEventListener("click", closeClearDoseDialogOnBackdrop);
cancelClearDoseButton.addEventListener("click", closeClearDoseDialog);
confirmClearDoseButton.addEventListener("click", clearSelectedLogEntry);
didNotHaveSexButton.addEventListener("click", () => saveSexStatusForActiveDate("did-not"));
hadSexButton.addEventListener("click", openActiveDateEncounterDetails);
encounterDialog.addEventListener("click", closeEncounterDialogOnBackdrop);
encounterForm.addEventListener("submit", saveEncounterDetails);
backEncounterButton.addEventListener("click", closeEncounterDialog);
encounterCancelButton.addEventListener("click", closeEncounterDialog);
addEncounterButton.addEventListener("click", addEncounterDraft);
editForm.addEventListener("submit", saveEditedLogEntry);
editTimeToggleButton.addEventListener("click", openEditTimeSection);
saveTimeButton.addEventListener("click", saveEditedLogEntry);
editPillsToggleButton.addEventListener("click", openEditPillsSection);
editNotesToggleButton.addEventListener("click", openEditNotesSection);
saveNotesButton.addEventListener("click", saveEditedLogEntry);
pillsTakenButton.addEventListener("click", togglePillsTakenWheel);
savePillsButton.addEventListener("click", saveEditedLogEntry);
editHadSexButton.addEventListener("click", () => setEditSexStatus("had"));
editHivTestButton.addEventListener("click", openEditHivSection);
editHivLocationSelect.addEventListener("change", updateEditHivLocation);
saveHivButton.addEventListener("click", saveEditedLogEntry);
refillToggleButton.addEventListener("click", openEditRefillSection);
refillPillsButton.addEventListener("click", toggleRefillPillsWheel);
saveRefillButton.addEventListener("click", saveEditedLogEntry);
openSettingsButton.addEventListener("click", openScheduleDialog);
feedDialog.addEventListener("click", closeFeedDialogOnBackdrop);
backFeedButton.addEventListener("click", closeFeedDialog);
feedForm.addEventListener("submit", uploadFeedPost);
postActionsDialog.addEventListener("click", closePostActionsOnBackdrop);
closePostActionsButton.addEventListener("click", closePostActionsDialog);
editPostButton.addEventListener("click", editActiveFeedPost);
deletePostButton.addEventListener("click", deleteActiveFeedPost);
scheduleDialog.addEventListener("click", closeScheduleDialogOnBackdrop);
openSettingsNotesButton.addEventListener("click", openSettingsNotesForm);
settingsNotesForm.addEventListener("submit", saveSettingsNotes);
backSettingsNotesButton.addEventListener("click", closeSettingsNotesForm);
editSettingsNotesButton.addEventListener("click", enableSettingsNotesEditing);
cancelSettingsNotesButton.addEventListener("click", closeSettingsNotesForm);
cancelScheduleButton.addEventListener("click", closeScheduleDialog);
scheduleForm.addEventListener("submit", saveSchedule);
scheduleStartInput.addEventListener("click", () => openScheduleDatePicker(scheduleStartInput));
startScheduleButton.addEventListener("click", () => openScheduleForm("start"));
stopPrepButton.addEventListener("click", () => openScheduleForm("stop"));
datePickerPrev.addEventListener("click", () => {
  datePickerMonth = new Date(datePickerMonth.getFullYear(), datePickerMonth.getMonth() - 1, 1);
  renderScheduleDatePicker();
});
datePickerNext.addEventListener("click", () => {
  datePickerMonth = new Date(datePickerMonth.getFullYear(), datePickerMonth.getMonth() + 1, 1);
  renderScheduleDatePicker();
});
signInButton.addEventListener("click", signInWithGoogle);
appVersion.textContent = APP_VERSION;

startFirebase();

async function startFirebase() {
  showAuthGate("Loading", "Checking your sign-in...", false);

  try {
    const [firebaseAppModule, firebaseAuthModule, firebaseFirestoreModule, firebaseStorageModule] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js"),
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js"),
    ]);

    firebaseApp = firebaseAppModule.initializeApp(firebaseConfig);
    auth = firebaseAuthModule.getAuth(firebaseApp);
    db = firebaseFirestoreModule.getFirestore(firebaseApp);
    storage = firebaseStorageModule.getStorage(firebaseApp);
    GoogleAuthProvider = firebaseAuthModule.GoogleAuthProvider;
    googleProvider = new GoogleAuthProvider();
    onAuthStateChanged = firebaseAuthModule.onAuthStateChanged;
    signInWithPopup = firebaseAuthModule.signInWithPopup;
    collection = firebaseFirestoreModule.collection;
    deleteDoc = firebaseFirestoreModule.deleteDoc;
    doc = firebaseFirestoreModule.doc;
    getDoc = firebaseFirestoreModule.getDoc;
    getDocs = firebaseFirestoreModule.getDocs;
    setDoc = firebaseFirestoreModule.setDoc;
    writeBatch = firebaseFirestoreModule.writeBatch;
    deleteObject = firebaseStorageModule.deleteObject;
    getDownloadURL = firebaseStorageModule.getDownloadURL;
    storageRef = firebaseStorageModule.ref;
    uploadBytes = firebaseStorageModule.uploadBytes;

    console.log("registering auth listener");
    onAuthStateChanged(auth, handleAuthStateChanged, handleAuthError);
  } catch (error) {
    showAuthGate("Could not load", "Firebase could not start.", false);
    showAuthError("Refresh the page. If this keeps happening, check that Firebase scripts are not blocked.");
    console.error("Firebase startup failed", error);
  }
}

async function handleAuthStateChanged(user) {
  console.log("onAuthStateChanged fired", user);
  currentUser = user;
  isDataReady = false;
  appShell.hidden = true;
  hideAppError();

  if (!user) {
    if (accessWasDenied) {
      showAuthGate(
        "Access denied",
        "This application is private. Only the owner is allowed to use it.",
        false
      );
      return;
    }

    showAuthGate("Sign in", "Sign in with Google to load your medicine log.", true);
    return;
  }

  const shouldCheckEmail = ALLOWED_EMAIL !== "YOUR_GMAIL_HERE";
  const emailMatches = shouldCheckEmail && user.email === ALLOWED_EMAIL;
  const uidMatches = user.uid === ALLOWED_UID;
  console.log("access check", {
    signedInEmail: user.email,
    signedInUid: user.uid,
    emailMatches,
    uidMatches,
  });

  if (!emailMatches && !uidMatches) {
    accessWasDenied = true;
    await auth.signOut();
    appShell.hidden = true;
    showAuthGate(
      "Access denied",
      "This application is private. Only the owner is allowed to use it.",
      false
    );
    return;
  }

  accessWasDenied = false;
  const showedCachedData = loadCachedUserData(user.uid);
  if (showedCachedData) {
    isDataReady = true;
    authGate.hidden = true;
    appShell.hidden = false;
    render();
    startCountdownTimer();
  } else {
    showAuthGate("Loading", "Loading your medicine log...", false);
  }

  try {
    await loadUserData(user.uid);
    writeCachedUserData(user.uid);
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
}

function handleAuthError(error) {
  showAuthGate("Sign in", "Could not check your sign-in.", true);
  showAuthError("Refresh the page or try signing in again.");
  console.error("Auth listener failed", error);
}

async function signInWithGoogle() {
  signInButton.disabled = true;
  authGate.classList.remove("is-sign-in");
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
  authGate.classList.remove("is-sign-in", "is-denied", "is-loading");
  authTitle.textContent = title;
  authStatus.textContent = status;
  signInButton.hidden = !canSignIn;

  if (title === "Sign in" && canSignIn && !authError.textContent) {
    authGate.classList.add("is-sign-in");
  } else if (title === "Access denied") {
    authGate.classList.add("is-denied");
  } else {
    authGate.classList.add("is-loading");
  }
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

function showMarkActionMessage(message) {
  markActionMessage.hidden = false;
  markActionMessage.textContent = message;
}

function hideMarkActionMessage() {
  markActionMessage.hidden = true;
  markActionMessage.textContent = "";
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
  renderPillsRemaining();
  renderFeed();
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
    const inViewedMonth = date.getMonth() === viewedMonth.getMonth();
    const ended = isEndedDate(date);
    const button = document.createElement("button");
    const time = document.createElement("time");

    button.type = "button";
    button.className = "day";
    button.setAttribute("aria-label", getDayLabel(date));
    button.dataset.date = key;

    if (!inViewedMonth) button.classList.add("is-outside");
    if (key === toKey(today)) button.classList.add("is-today");
    if (key === toKey(selectedDate)) button.classList.add("is-selected");
    if (logs[key] && !isFutureDate(date) && !ended) {
      button.classList.add("is-taken");
      const timingClass = getCalendarTimingClass(logs[key], date);
      if (timingClass) button.classList.add(timingClass);
    }
    if (ended) button.classList.add("is-ended");
    if (!logs[key] && isUpcomingDate(date) && !ended) button.classList.add("is-future");
    if (!logs[key] && isMissedDate(date, logs[key])) button.classList.add("is-missed");
    if (!ended && hasScheduleChangeOn(key)) button.classList.add("is-schedule-change");
    if (isRefillStart(logs[key])) button.classList.add("is-refill-start");
    if (hasSexLogged(logs[key])) button.classList.add("has-sex");
    if (hasHivTestLogged(logs[key])) button.classList.add("has-hiv-test");
    if (logs[key] && getLogNotes(logs[key]).trim()) button.classList.add("has-notes");

    time.dateTime = key;
    if (logs[key] && getLogNotes(logs[key]).trim()) {
      const noteMarker = document.createElement("span");
      noteMarker.className = "note-marker";
      noteMarker.setAttribute("aria-hidden", "true");
      noteMarker.textContent = "*";
      time.append(noteMarker);
    }
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

function changeViewedMonth(direction) {
  if (isCalendarSliding) return;

  isCalendarSliding = true;
  viewedMonth = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() + direction, 1);
  render();
  animateCalendarPage(direction);
}

function handleTodayJump(event) {
  const now = Date.now();
  const isDuplicateMobileEvent = now - lastTodayJumpAt < 350;

  event.preventDefault();
  event.stopPropagation();

  if (isDuplicateMobileEvent) return;

  lastTodayJumpAt = now;
  goToToday();
}

function goToToday() {
  stopCalendarSlide();
  selectedDate = today;
  viewedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  render();
}

function stopCalendarSlide() {
  window.clearTimeout(calendarSlideTimeout);
  isCalendarSliding = false;
  calendarGrid.classList.remove("is-sliding-next", "is-sliding-prev");
  monthTitle.classList.remove("is-sliding-next", "is-sliding-prev");
}

function animateCalendarPage(direction) {
  const animationClass = direction > 0 ? "is-sliding-next" : "is-sliding-prev";
  calendarGrid.classList.remove("is-sliding-next", "is-sliding-prev");
  monthTitle.classList.remove("is-sliding-next", "is-sliding-prev");

  requestAnimationFrame(() => {
    calendarGrid.classList.add(animationClass);
    monthTitle.classList.add(animationClass);
  });

  calendarSlideTimeout = window.setTimeout(() => {
    calendarGrid.classList.remove(animationClass);
    monthTitle.classList.remove(animationClass);
    isCalendarSliding = false;
    calendarSlideTimeout = 0;
  }, 440);
}

function handleCalendarTouchStart(event) {
  const touch = event.changedTouches[0];
  calendarTouchStartY = touch.clientY;
  calendarTouchStartX = touch.clientX;
}

function handleCalendarTouchEnd(event) {
  const touch = event.changedTouches[0];
  const deltaY = touch.clientY - calendarTouchStartY;
  const deltaX = touch.clientX - calendarTouchStartX;

  if (Math.abs(deltaX) < 42 || Math.abs(deltaX) < Math.abs(deltaY)) return;

  changeViewedMonth(deltaX < 0 ? 1 : -1);
}

function handleCalendarWheel(event) {
  if (Math.abs(event.deltaX) < 18 || Math.abs(event.deltaX) < Math.abs(event.deltaY)) return;

  event.preventDefault();
  changeViewedMonth(event.deltaX > 0 ? 1 : -1);
}

function renderDetails() {
  const key = toKey(selectedDate);
  const loggedAt = isFutureDate(selectedDate) ? null : logs[key];
  renderSelectedTitle(loggedAt);
  renderSelectedMeta(loggedAt, selectedDate);
  renderEncounterDetails(loggedAt);
  renderMarkButton(loggedAt, selectedDate);
  hideMarkActionMessage();
  markTakenButton.disabled = false;
}

function renderSelectedTitle(loggedAt) {
  selectedTitle.replaceChildren();
  selectedTitle.append(document.createTextNode(dateFormatter.format(selectedDate)));

  if (!isRefillStart(loggedAt)) return;

  const bottleDetail = document.createElement("span");
  bottleDetail.className = "new-bottle-title-detail";
  bottleDetail.textContent = `This is a new bottle with ${getLogStartingPills(loggedAt)} pills.`;
  selectedTitle.append(bottleDetail);
}

function renderPillsRemaining() {
  const remaining = getPillsRemaining();
  const pillBubble = pillsRemainingCount.closest(".pills-remaining");
  pillsRemainingCount.textContent = remaining === null ? "00" : String(remaining).padStart(2, "0");
  pillBubble.classList.toggle("is-low", remaining !== null && remaining <= 15);
  pillBubble.classList.toggle("is-enough", remaining !== null && remaining > 15);
}

function renderMarkButton(loggedAt, date) {
  const missed = isMissedDate(date, loggedAt);
  const future = isFutureDate(date);
  const upcoming = isUpcomingDate(date);
  const ended = isEndedDate(date);
  let label = "Mark as taken";
  let statusClass = "";

  if (ended) {
    label = "Stopped";
    statusClass = "is-ended";
  } else if (future || (!loggedAt && upcoming)) {
    label = "Mark as taken";
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
  const scheduledLine = getScheduledDoseLine(date);

  if (!loggedAt) {
    const missed = isMissedDate(date, loggedAt);
    const ended = isEndedDate(date);
    const statusLine = document.createElement("span");
    statusLine.textContent = ended ? "PreP Stopped" : missed ? "Missed" : "No pill logged for this day.";
    selectedMeta.className = missed || ended ? "missed-detail" : "";
    if (scheduledLine) selectedMeta.append(scheduledLine);
    selectedMeta.append(statusLine);
    if (scheduleChangeLine) selectedMeta.append(scheduleChangeLine);
    return;
  }

  const takenLine = document.createElement("span");
  const timingLine = document.createElement("span");
  const notesLine = document.createElement("span");
  const timing = getTimingDetail(loggedAt, date);
  const timingClass = getTakenStatusClass(timing);
  const notes = getLogNotes(loggedAt);
  const pillsTaken = getLogPillsTaken(loggedAt);
  const pillText = pillsTaken === 1 ? "pill" : "pills";
  selectedMeta.className = "";
  takenLine.className = `taken-detail ${timingClass}`.trim();
  takenLine.textContent = `Took ${pillsTaken} ${pillText} at ${formatTime(new Date(getLogTakenAt(loggedAt)))}.`;
  timingLine.className = `timing-detail ${timingClass}`.trim();
  timingLine.textContent = timing;
  notesLine.className = "notes-detail";
  notesLine.textContent = notes ? `Notes: ${notes}` : "No notes";
  if (scheduledLine) selectedMeta.append(scheduledLine);
  selectedMeta.append(takenLine);
  if (timing !== "Taken on time") selectedMeta.append(timingLine);
  selectedMeta.append(notesLine);
  if (scheduleChangeLine) selectedMeta.append(scheduleChangeLine);
}

function renderEncounterDetails(loggedAt) {
  encounterDetailList.replaceChildren();
  const showDetails = loggedAt && getLogSexStatus(loggedAt) === "had";
  encounterDetailPanel.hidden = !showDetails;
  if (!showDetails) return;

  getLogEncounterDetailsList(loggedAt).forEach((details, index) => {
    const group = document.createElement("section");
    const heading = document.createElement("h4");
    const detailList = document.createElement("dl");

    group.className = "encounter-detail-group";
    heading.textContent = `Encounter ${index + 1}`;

    getEncounterDetailRows(details).forEach(([label, value, note]) => {
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      const valueText = value || "Not entered";

      term.textContent = `${label}:`;
      description.textContent = note ? `${valueText} - ${note}` : valueText;
      if (
        valueText === "Yes" ||
        (["Body count", "Location"].includes(label) && valueText !== "Not entered") ||
        (["I came", "He came"].includes(label) && valueText !== "No" && valueText !== "Not entered")
      ) {
        term.classList.add("is-yes");
        description.classList.add("is-yes");
      }
      detailList.append(term, description);
    });

    group.append(heading, detailList);
    encounterDetailList.append(group);
  });
}

function getEncounterDetailRows(details) {
  return [
    ["Body count", details.bodyCount, getEncounterLineNote(details, "bodyCount")],
    ["Location", details.location, getEncounterLineNote(details, "location")],
    ["Kiss", details.kiss, getEncounterLineNote(details, "kiss")],
    ["I sucked him", details.iSuckedHim, getEncounterLineNote(details, "iSuckedHim")],
    ["He sucked me", details.heSuckedMe, getEncounterLineNote(details, "heSuckedMe")],
    ["I fucked him", details.iFuckedHim, getEncounterLineNote(details, "iFuckedHim")],
    ["He fucked me", details.heFuckedMe, getEncounterLineNote(details, "heFuckedMe")],
    ["I swallowed his cum", details.iSwallowedHisCum, getEncounterLineNote(details, "iSwallowedHisCum")],
    ["He swallowed my cum", details.heSwallowedMyCum, getEncounterLineNote(details, "heSwallowedMyCum")],
    ["I came", details.iCame, getEncounterLineNote(details, "iCame")],
    ["He came", details.heCame, getEncounterLineNote(details, "heCame")],
    ["Notes", details.notes],
  ];
}

function getScheduledDoseLine(date) {
  const scheduledAt = getScheduledDoseTime(date);
  if (!scheduledAt) return null;

  const line = document.createElement("span");
  const change = getNewScheduleChangeOn(date);
  line.className = "scheduled-detail";
  line.textContent = change && toKey(date) === toKey(today)
    ? `New schedule started today at ${formatTime(scheduledAt)}.`
    : `Scheduled at ${formatTime(scheduledAt)}.`;
  return line;
}

function openScheduleDialog() {
  lockPageScroll();
  scheduleChoicePanel.hidden = false;
  settingsNotesForm.hidden = true;
  scheduleForm.hidden = true;
  scheduleDatePicker.hidden = true;
  scheduleDialog.hidden = false;
}

function openSettingsNotesForm() {
  scheduleChoicePanel.hidden = true;
  scheduleForm.hidden = true;
  scheduleDatePicker.hidden = true;
  settingsNotesForm.hidden = false;
  isSettingsNotesEditing = false;
  renderSettingsNotesForm();
}

function closeSettingsNotesForm() {
  settingsNotesForm.hidden = true;
  scheduleChoicePanel.hidden = false;
}

function enableSettingsNotesEditing() {
  isSettingsNotesEditing = true;
  renderSettingsNotesForm();
  settingsNotesInput.focus();
}

function renderSettingsNotesForm() {
  const notes = settings.notes || "";
  settingsNotesPreview.textContent = notes || "No notes";
  settingsNotesInput.value = notes;
  settingsNotesPreview.hidden = isSettingsNotesEditing;
  settingsNotesEditField.hidden = !isSettingsNotesEditing;
  settingsNotesActions.hidden = !isSettingsNotesEditing;
  editSettingsNotesButton.hidden = isSettingsNotesEditing;
}

async function saveSettingsNotes(event) {
  event.preventDefault();
  hideAppError();

  const previousNotes = settings.notes || "";
  settings.notes = settingsNotesInput.value.trim();

  try {
    await saveSettingsToFirestore();
    isSettingsNotesEditing = false;
    renderSettingsNotesForm();
  } catch (error) {
    settings.notes = previousNotes;
    showAppError("Could not save settings notes. Please try again.");
    console.error(error);
  }
}

function openScheduleForm(mode) {
  scheduleMode = mode;
  const currentSchedule = getEffectiveSchedule(selectedDate);
  const isStopMode = mode === "stop";

  scheduleChoicePanel.hidden = true;
  scheduleForm.hidden = false;
  scheduleDialogTitle.textContent = isStopMode ? "Stop PreP" : "Start new schedule";
  scheduleDateLabel.textContent = isStopMode ? "Stop date" : "Date start";
  scheduleStartInput.value = formatCompactInputDate(selectedDate);
  scheduleDatePicker.hidden = true;
  scheduleTimeField.hidden = isStopMode;
  scheduleSaveButton.textContent = isStopMode ? "Mark stopped" : "Save";
  scheduleSaveButton.classList.toggle("is-stop-save", isStopMode);

  setScheduleWheelTime(currentSchedule || defaultSchedule);
  renderPickerWheel(scheduleHourWheel, getHourWheelOptions(), scheduleHour, (value) => {
    scheduleHour = value;
  });
  renderPickerWheel(scheduleMinuteWheel, getMinuteWheelOptions(), scheduleMinute, (value) => {
    scheduleMinute = value;
  });
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

  const selectedDate = parseInputDate(activeScheduleDateInput.value);
  const selectedKey = selectedDate ? toKey(selectedDate) : "";
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
      activeScheduleDateInput.value = formatCompactInputDate(date);
      scheduleDatePicker.hidden = true;
    });
    scheduleDatePickerGrid.append(button);
  }
}

function closeScheduleDialog() {
  scheduleDialog.hidden = true;
  unlockPageScrollIfNoDialog();
}

function closeScheduleDialogOnBackdrop(event) {
  if (event.target === scheduleDialog) {
    closeScheduleDialog();
  }
}

function openFeedDialog() {
  lockPageScroll();
  hideFeedStatus();
  resetFeedComposer();
  renderFeed();
  feedDialog.hidden = false;
}

function closeFeedDialog() {
  feedDialog.hidden = true;
  closePostActionsDialog();
  resetFeedComposer();
  unlockPageScrollIfNoDialog();
}

function closeFeedDialogOnBackdrop(event) {
  if (event.target === feedDialog) {
    closeFeedDialog();
  }
}

async function uploadFeedPost(event) {
  event.preventDefault();
  hideFeedStatus();

  const imageFile = feedImageInput.files?.[0];
  const caption = feedCaptionInput.value.trim();
  const isEditingPost = Boolean(editingFeedPostId);
  const existingPost = editingFeedPostId
    ? feedPosts.find((post) => post.id === editingFeedPostId)
    : null;
  if (!imageFile && !caption && !existingPost?.imageUrl) {
    showFeedStatus("Write a caption or choose a picture first.", true);
    return;
  }

  feedUploadButton.disabled = true;
  showFeedStatus(isEditingPost ? "Saving..." : "Posting...", false);

  try {
    const id = editingFeedPostId || `${Date.now()}`;
    let imagePath = existingPost?.imagePath || "";
    let imageUrl = existingPost?.imageUrl || "";

    if (imageFile) {
      imagePath = `users/${currentUser.uid}/feed/${id}-${sanitizeFileName(imageFile.name)}`;
      const imageRef = storageRef(storage, imagePath);
      await withTimeout(
        uploadBytes(imageRef, imageFile, {
          contentType: imageFile.type || "image/jpeg",
        }),
        feedUploadTimeoutMs,
        "Picture upload is taking too long. Check Firebase Storage or try a smaller picture."
      );
      imageUrl = await withTimeout(
        getDownloadURL(imageRef),
        feedUploadTimeoutMs,
        "Could not get the picture link. Check Firebase Storage rules."
      );
    }

    const post = {
      id,
      caption,
      imagePath,
      imageUrl,
      createdAt: existingPost?.createdAt || new Date().toISOString(),
      updatedAt: editingFeedPostId ? new Date().toISOString() : "",
    };
    feedPosts = editingFeedPostId
      ? feedPosts.map((item) => item.id === post.id ? post : item)
      : [post, ...feedPosts];
    await saveFeedPostToFirestore(post);
    resetFeedComposer();
    showFeedStatus(isEditingPost ? "Saved." : "Posted.", false);
    renderFeed();
  } catch (error) {
    showFeedStatus(getFeedPostErrorMessage(error), true);
    console.error(error);
  } finally {
    feedUploadButton.disabled = false;
  }
}

function resetFeedComposer() {
  editingFeedPostId = "";
  feedForm.reset();
  feedUploadButton.textContent = "Post";
}

function getFeedPostErrorMessage(error) {
  if (error?.message) return error.message;
  return "Could not post. Check Firebase setup and try again.";
}

function renderFeed() {
  if (!feedList) return;

  feedList.replaceChildren();
  if (!feedPosts.length) {
    const empty = document.createElement("p");
    empty.className = "feed-empty";
    empty.textContent = "No posts yet";
    feedList.append(empty);
    return;
  }

  feedPosts.forEach((post) => {
    const article = document.createElement("article");
    const caption = document.createElement("p");
    const info = document.createElement("button");

    article.className = "feed-post";
    caption.textContent = post.caption || "No caption";
    info.className = "feed-info";
    info.type = "button";
    info.title = `Posted ${formatFeedDate(post.createdAt)}`;
    info.setAttribute("aria-label", `Posted ${formatFeedDate(post.createdAt)}`);
    info.textContent = "i";
    info.addEventListener("click", () => openPostActionsDialog(post.id));
    if (post.imageUrl) {
      const image = document.createElement("img");
      image.src = post.imageUrl;
      image.alt = post.caption || "Uploaded picture";
      article.append(image);
    }
    article.append(caption, info);
    feedList.append(article);
  });
}

function openPostActionsDialog(postId) {
  const post = feedPosts.find((item) => item.id === postId);
  if (!post) return;

  activeFeedPostId = postId;
  postActionsDate.textContent = `Posted ${formatFeedDate(post.createdAt)}`;
  postActionsDialog.hidden = false;
}

function closePostActionsDialog() {
  postActionsDialog.hidden = true;
  activeFeedPostId = "";
}

function closePostActionsOnBackdrop(event) {
  if (event.target === postActionsDialog) {
    closePostActionsDialog();
  }
}

function editActiveFeedPost() {
  const post = feedPosts.find((item) => item.id === activeFeedPostId);
  if (!post) return;

  editingFeedPostId = post.id;
  feedCaptionInput.value = post.caption;
  feedImageInput.value = "";
  feedUploadButton.textContent = "Save";
  closePostActionsDialog();
  feedCaptionInput.focus();
}

async function deleteActiveFeedPost() {
  const post = feedPosts.find((item) => item.id === activeFeedPostId);
  if (!post) return;

  deletePostButton.disabled = true;
  try {
    await deleteDoc(doc(db, "users", currentUser.uid, "feed", post.id));
    if (post.imagePath) {
      await withTimeout(
        deleteObject(storageRef(storage, post.imagePath)),
        feedUploadTimeoutMs,
        "Post was deleted, but the picture cleanup took too long."
      ).catch((error) => console.warn("Feed picture cleanup failed", error));
    }
    feedPosts = feedPosts.filter((item) => item.id !== post.id);
    writeCachedUserData(currentUser.uid);
    closePostActionsDialog();
    renderFeed();
  } catch (error) {
    showFeedStatus("Could not delete post. Please try again.", true);
    console.error(error);
  } finally {
    deletePostButton.disabled = false;
  }
}

function showFeedStatus(message, isError) {
  feedStatus.hidden = false;
  feedStatus.textContent = message;
  feedStatus.classList.toggle("is-error", isError);
}

function hideFeedStatus() {
  feedStatus.hidden = true;
  feedStatus.textContent = "";
  feedStatus.classList.remove("is-error");
}

async function saveSchedule(event) {
  event.preventDefault();
  hideAppError();

  const startDate = parseInputDate(scheduleStartInput.value);
  if (!startDate) return;

  const previousSettings = {
    scheduleChanges: [...settings.scheduleChanges],
  };
  const startKey = toKey(startDate);
  const change = scheduleMode === "stop"
    ? {
        date: startKey,
        endDate: startKey,
        schedule: getEffectiveSchedule(startDate) || defaultSchedule,
      }
    : {
        date: startKey,
        schedule: getScheduleWheelTime(),
      };
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
  const missedToday = todayDose && now > getScheduleWindowEnd(todayDose) && !todayLog;
  const offScheduleToday = todayLog && isOutsideScheduleWindow(todayLog, today);
  const nextDose = getNextDoseTime(now);
  const remainingMs = nextDose ? nextDose - now : 0;

  statusStrip.classList.toggle("is-missed-dose", missedToday);
  statusStrip.classList.toggle("is-off-schedule-dose", Boolean(offScheduleToday));
  statusStrip.classList.toggle("is-upcoming-dose", !missedToday && !offScheduleToday);
  document.querySelector(".status-label").textContent = nextDose ? formatNextDoseSentence(nextDose) : "PreP Stopped";
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
    openSexDialog();
  } catch (error) {
    delete logs[key];
    showAppError("Could not save this dose. Please try again.");
    console.error(error);
    render();
  }
}

function openSexDialog() {
  lockPageScroll();
  sexDialog.hidden = false;
}

function closeSexDialog() {
  sexDialog.hidden = true;
  unlockPageScrollIfNoDialog();
}

function openActiveDateEncounterDetails() {
  const key = toKey(selectedDate);
  const entry = logs[key];
  encounterDialogMode = "active-date";
  encounterDialogDraftDetails = getLogEncounterDetailsList(entry);
  encounterDialogSourceDetails = [];
  encounterDialogEditIndex = encounterDialogDraftDetails.length;
  fillEncounterForm(getDefaultEncounterDetails());
  sexDialog.hidden = true;
  lockPageScroll();
  encounterDialog.hidden = false;
}

function openEncounterDetailsEditor() {
  const key = toKey(selectedDate);
  const entry = logs[key];
  const details = getLogEncounterDetailsList(entry);

  if (!details.length) return;

  encounterDialogMode = "existing-day";
  encounterDialogDraftDetails = [];
  encounterDialogSourceDetails = details;
  encounterDialogEditIndex = 0;
  fillEncounterForm(details[0]);
  lockPageScroll();
  encounterDialog.hidden = false;
}

function closeEncounterDialog() {
  encounterDialog.hidden = true;
  unlockPageScrollIfNoDialog();
}

function closeEncounterDialogOnBackdrop(event) {
  if (event.target === encounterDialog) {
    closeEncounterDialog();
  }
}

async function saveEncounterDetails(event) {
  event.preventDefault();
  if (!validateEncounterForm()) return;

  const details = getEncounterDialogDetailsForSave();

  if (encounterDialogMode === "active-date") {
    await saveSexStatusForActiveDate("had", details);
    return;
  }

  if (encounterDialogMode === "existing-day") {
    await saveEncounterDetailsForSelectedDate(details);
    return;
  }

  editEncounterDetails = normalizeEncounterDetailsList(details);
  editSexStatus = "had";
  editNotesInput.value = appendHadSexNote(editNotesInput.value);
  closeEncounterDialog();
  await saveEditedLogEntry();
}

function addEncounterDraft() {
  if (!validateEncounterForm()) return;

  encounterDialogDraftDetails = [
    ...encounterDialogDraftDetails,
    getEncounterDetailsFromForm(),
  ];
  encounterDialogEditIndex += 1;
  fillEncounterForm(encounterDialogSourceDetails[encounterDialogEditIndex] || getDefaultEncounterDetails());
}

function validateEncounterForm() {
  if (encounterLocationInput.value.trim()) return true;

  encounterLocationInput.focus();
  encounterLocationInput.reportValidity();
  return false;
}

function renderEncounterDialogTitle() {
  encounterDialogTitle.textContent = `Encounter ${encounterDialogEditIndex + 1}`;
  renderEncounterDraftList();
}

function renderEncounterDraftList() {
  const visibleDetails = getEncounterDialogDetailsForSave();

  encounterDraftList.replaceChildren();
  encounterDraftList.hidden = visibleDetails.length === 0;

  visibleDetails.forEach((details, index) => {
    const normalizedDetails = normalizeEncounterDetails(details);
    const item = document.createElement("div");
    item.className = "encounter-draft-item";

    const header = document.createElement("div");
    header.className = "encounter-draft-item__header";

    const title = document.createElement("strong");
    title.textContent = `Encounter ${index + 1}`;

    const deleteButton = document.createElement("button");
    deleteButton.className = "encounter-delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteEncounterDraft(index));

    const summary = document.createElement("span");
    const summaryParts = [
      normalizedDetails.bodyCount ? `Body count: ${normalizedDetails.bodyCount}` : "",
      normalizedDetails.location ? `Location: ${normalizedDetails.location}` : "",
    ].filter(Boolean);
    summary.textContent = summaryParts.length ? summaryParts.join(" - ") : "Details added";

    header.append(title, deleteButton);
    item.append(header, summary);
    encounterDraftList.append(item);
  });
}

async function deleteEncounterDraft(indexToDelete) {
  const details = getEncounterDialogDetailsForSave();
  const remainingDetails = details.filter((_, index) => index !== indexToDelete);

  if (!remainingDetails.length) {
    await saveEmptyEncounterDetails();
    return;
  }

  const nextEditIndex = Math.min(indexToDelete, remainingDetails.length - 1);
  encounterDialogDraftDetails = remainingDetails.slice(0, nextEditIndex);
  encounterDialogSourceDetails = remainingDetails.slice(nextEditIndex);
  encounterDialogEditIndex = nextEditIndex;
  fillEncounterForm(encounterDialogSourceDetails[0]);
}

async function saveEmptyEncounterDetails() {
  if (encounterDialogMode === "active-date" || encounterDialogMode === "existing-day") {
    await saveEncounterDetailsForSelectedDate([]);
    return;
  }

  editEncounterDetails = [];
  editSexStatus = "";
  closeEncounterDialog();
  await saveEditedLogEntry();
}

function getEncounterDialogDetailsForSave() {
  return normalizeEncounterDetailsList([
    ...encounterDialogDraftDetails,
    getEncounterDetailsFromForm(),
    ...encounterDialogSourceDetails.slice(encounterDialogEditIndex + 1),
  ]);
}

async function saveEncounterDetailsForSelectedDate(encounterDetails) {
  const key = toKey(selectedDate);
  const previousEntry = logs[key];

  if (!previousEntry) {
    closeEncounterDialog();
    return;
  }

  const normalizedEncounterDetails = normalizeEncounterDetailsList(encounterDetails);
  const nextEntry = {
    ...previousEntry,
    sexStatus: normalizedEncounterDetails.length ? "had" : "",
    notes: normalizedEncounterDetails.length ? appendHadSexNote(getLogNotes(previousEntry)) : getLogNotes(previousEntry),
    encounterDetails: normalizedEncounterDetails,
  };

  logs[key] = nextEntry;

  try {
    await saveLogToFirestore(key, nextEntry);
    closeEncounterDialog();
    render();
  } catch (error) {
    logs[key] = previousEntry;
    showAppError("Could not save encounter details. Please try again.");
    console.error(error);
    closeEncounterDialog();
    render();
  }
}

async function saveSexStatusForActiveDate(sexStatus, encounterDetails = []) {
  const key = toKey(selectedDate);
  const previousEntry = logs[key];

  if (!previousEntry) {
    closeSexDialog();
    closeEncounterDialog();
    return;
  }

  const nextEntry = {
    ...previousEntry,
    sexStatus,
    notes: sexStatus === "had" ? appendHadSexNote(getLogNotes(previousEntry)) : getLogNotes(previousEntry),
    encounterDetails: sexStatus === "had" ? normalizeEncounterDetailsList(encounterDetails) : [],
  };

  logs[key] = nextEntry;

  try {
    await saveLogToFirestore(key, nextEntry);
    closeSexDialog();
    closeEncounterDialog();
    render();
  } catch (error) {
    logs[key] = previousEntry;
    closeSexDialog();
    closeEncounterDialog();
    showAppError("Could not save this answer. Please try again.");
    console.error(error);
    render();
  }
}

async function handleMarkButtonClick() {
  const key = toKey(selectedDate);

  if (isFutureDate(selectedDate)) {
    showMarkActionMessage("Cannot mark a future date.");
    return;
  }

  if (isEndedDate(selectedDate)) {
    showAppError("Cannot mark this date because PreP is stopped.");
    return;
  }

  if (!logs[key] && !isMissedDate(selectedDate, logs[key])) {
    await markTaken(selectedDate);
    return;
  }

  if (logs[key]) {
    openClearDoseDialog();
    return;
  }

  openEditForm(key);
}

function openClearDoseDialog() {
  lockPageScroll();
  clearDoseDialog.hidden = false;
}

function closeClearDoseDialog() {
  clearDoseDialog.hidden = true;
  unlockPageScrollIfNoDialog();
}

function closeClearDoseDialogOnBackdrop(event) {
  if (event.target === clearDoseDialog) {
    closeClearDoseDialog();
  }
}

function openSelectedDoseEditor() {
  const key = toKey(selectedDate);

  if (isFutureDate(selectedDate)) {
    showMarkActionMessage("Cannot edit a future date.");
    return;
  }

  if (isEndedDate(selectedDate)) {
    showAppError("Cannot edit this date because PreP is stopped.");
    return;
  }

  openEditForm(key);
}

function openEditForm(key) {
  lockPageScroll();
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
  activeEditSection = "";
  unlockPageScrollIfNoDialog();

  if (editDialogResolver) {
    editDialogResolver(confirmed);
    editDialogResolver = null;
  }
}

function closeEditDialogOnBackdrop(event) {
  if (event.target === editDialog) {
    closeEditDialog(false);
  }
}

function handleEditDoseBack() {
  if (activeEditSection) {
    closeEditSection();
    return;
  }

  closeEditDialog(false);
}

function lockPageScroll() {
  if (document.body.classList.contains("is-dialog-open")) return;

  lockedScrollY = window.scrollY;
  document.body.classList.add("is-dialog-open");
  document.body.style.position = "fixed";
  document.body.style.top = `-${lockedScrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
}

function unlockPageScrollIfNoDialog() {
  if (!editDialog.hidden || !clearDoseDialog.hidden || !sexDialog.hidden || !encounterDialog.hidden || !scheduleDialog.hidden || !feedDialog.hidden || !postActionsDialog.hidden) return;

  document.body.classList.remove("is-dialog-open");
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  window.scrollTo(0, lockedScrollY);
}

function showEditForm() {
  openEditForm(editingKey);
}

function fillEditForm(key) {
  const entry = logs[key];
  const selectedDay = parseInputDate(key) || selectedDate;
  const takenAt = entry ? new Date(getLogTakenAt(entry)) : getDefaultEditTime(selectedDay);
  editingBaseDate = selectedDay;
  editPillsTaken = getLogPillsTaken(entry);
  isEditTimeOpen = false;
  isEditPillsOpen = false;
  isEditNotesOpen = false;
  isPillsTakenWheelOpen = false;
  editSexStatus = getLogSexStatus(entry);
  editEncounterDetails = getLogEncounterDetailsList(entry);
  editHivTest = hasHivTestLogged(entry);
  editHivLocation = getLogHivLocation(entry);
  editRefillStart = isRefillStart(entry);
  editStartingPills = getLogStartingPills(entry) || 30;
  isRefillPillsWheelOpen = false;
  activeEditSection = "";
  setEditTimeFromDate(takenAt);
  editNotesInput.value = entry ? getLogNotes(entry) : "";
  renderEditTimeControls();
  renderEditNotesControls();
  renderEditPillsControls();
  renderPillsTakenControls();
  renderEditSexControls();
  renderEditHivTestControls();
  renderRefillControls();
  renderEditSection();
}

function getDefaultEditTime(date) {
  const now = new Date();
  const defaultTime = new Date(date);
  defaultTime.setHours(now.getHours(), now.getMinutes(), 0, 0);
  return defaultTime;
}

async function saveEditedLogEntry(event) {
  event?.preventDefault();
  if (!canLogDate(editingBaseDate)) return;
  hideAppError();

  const parsedTime = getEditedTime();

  const updatedDate = new Date(editingBaseDate);
  updatedDate.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
  const updatedKey = toKey(updatedDate);
  const previousEntry = logs[editingKey];
  let editedNotes = editNotesInput.value.trim();
  if (editSexStatus === "had") editedNotes = appendHadSexNote(editedNotes);
  if (editHivTest) editedNotes = appendHivTestNote(editedNotes, editHivLocation);
  const entry = createLogEntry(
    updatedDate,
    editedNotes,
    editRefillStart,
    editStartingPills,
    editPillsTaken,
    editSexStatus,
    editSexStatus === "had" ? editEncounterDetails : [],
    editHivTest,
    editHivLocation
  );

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

async function clearSelectedLogEntry() {
  const key = toKey(selectedDate);
  if (!canLogDate(selectedDate)) return;
  hideAppError();

  const previousEntry = logs[key];
  delete logs[key];

  try {
    await deleteLogFromFirestore(key);
    closeClearDoseDialog();
    render();
  } catch (error) {
    if (previousEntry) logs[key] = previousEntry;
    closeClearDoseDialog();
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
  if (isEditTimeOpen) {
    editHour = getWheelValue(editHourWheel, editHour);
    editMinute = getWheelValue(editMinuteWheel, editMinute);
  }

  return {
    hours: editHour,
    minutes: editMinute,
  };
}

function closeEditSection() {
  activeEditSection = "";
  isEditTimeOpen = false;
  isEditPillsOpen = false;
  isEditNotesOpen = false;
  isPillsTakenWheelOpen = false;
  isRefillPillsWheelOpen = false;
  renderEditSection();
  renderEditTimeControls();
  renderEditPillsControls();
  renderEditNotesControls();
  renderEditHivTestControls();
  renderRefillControls();
  renderPillsTakenControls();
}

function renderEditSection() {
  const sectionTitles = {
    refill: "New Bottle",
    time: "Edit time taken",
    pills: "Edit pills taken",
    hiv: "HIV Test",
    notes: "Notes",
  };
  const isMenu = activeEditSection === "";

  editFormTitle.textContent = isMenu ? "Edit dose" : sectionTitles[activeEditSection];

  [
    refillToggleButton,
    editTimeToggleButton,
    editPillsToggleButton,
    editHadSexButton,
    editHivTestButton,
    editNotesToggleButton,
    editCancelButton,
  ].forEach((element) => {
    element.hidden = !isMenu;
  });

  refillPillsField.hidden = activeEditSection !== "refill";
  editTimeField.hidden = activeEditSection !== "time";
  editPillsField.hidden = activeEditSection !== "pills";
  editHivTestField.hidden = activeEditSection !== "hiv";
  editNotesField.hidden = activeEditSection !== "notes";
}

function openEditTimeSection() {
  activeEditSection = "time";
  isEditTimeOpen = true;
  renderEditSection();
  renderEditTimeControls();
}

function renderEditTimeControls() {
  editTimeField.hidden = activeEditSection !== "time" || !isEditTimeOpen;
  editTimeToggleButton.classList.toggle("is-active", activeEditSection === "time");

  if (!isEditTimeOpen) return;

  renderPickerWheel(editHourWheel, getHourWheelOptions(), editHour, (value) => {
    editHour = value;
  });
  renderPickerWheel(editMinuteWheel, getMinuteWheelOptions(), editMinute, (value) => {
    editMinute = value;
  });
}

function openEditPillsSection() {
  activeEditSection = "pills";
  isEditPillsOpen = true;
  renderEditSection();
  renderEditPillsControls();
  renderPillsTakenControls();
}

function renderEditPillsControls() {
  editPillsField.hidden = activeEditSection !== "pills" || !isEditPillsOpen;
  editPillsToggleButton.classList.toggle("is-active", activeEditSection === "pills");
}

function setEditSexStatus(sexStatus) {
  editSexStatus = sexStatus;
  if (sexStatus === "had") {
    editNotesInput.value = appendHadSexNote(editNotesInput.value);
    encounterDialogMode = "edit";
    encounterDialogDraftDetails = editEncounterDetails;
    encounterDialogSourceDetails = [];
    encounterDialogEditIndex = encounterDialogDraftDetails.length;
    fillEncounterForm(getDefaultEncounterDetails());
    lockPageScroll();
    encounterDialog.hidden = false;
  }
  renderEditSexControls();
}

function renderEditSexControls() {
  editHadSexButton.classList.remove("is-active");
}

function openEditHivSection() {
  activeEditSection = "hiv";
  if (!editHivTest) {
    editHivTest = true;
    editNotesInput.value = appendHivTestNote(editNotesInput.value, editHivLocation);
  }
  renderEditSection();
  renderEditHivTestControls();
}

function updateEditHivLocation() {
  editHivLocation = normalizeHivLocation(editHivLocationSelect.value);
  if (editHivTest) {
    editNotesInput.value = appendHivTestNote(removeHivTestNote(editNotesInput.value), editHivLocation);
  }
  renderEditHivTestControls();
}

function renderEditHivTestControls() {
  editHivTestButton.classList.toggle("is-active", editHivTest);
  editHivTestField.hidden = activeEditSection !== "hiv" || !editHivTest;
  editHivLocationSelect.value = editHivLocation;
}

function openEditNotesSection() {
  activeEditSection = "notes";
  isEditNotesOpen = true;
  renderEditSection();
  renderEditNotesControls();
}

function renderEditNotesControls() {
  editNotesField.hidden = activeEditSection !== "notes" || !isEditNotesOpen;
  editNotesToggleButton.classList.toggle("is-active", activeEditSection === "notes");
}

function togglePillsTakenWheel() {
  isPillsTakenWheelOpen = !isPillsTakenWheelOpen;
  renderPillsTakenControls();
}

function renderPillsTakenControls() {
  pillsTakenButton.textContent = String(editPillsTaken);
  pillsTakenWheelWrap.hidden = !isPillsTakenWheelOpen;

  if (!isPillsTakenWheelOpen) return;

  renderPickerWheel(
    pillsTakenWheel,
    getPillsTakenOptions(),
    editPillsTaken,
    (value) => {
      editPillsTaken = value;
      pillsTakenButton.textContent = String(value);
    },
    {
      loop: false,
    }
  );
}

function openEditRefillSection() {
  activeEditSection = "refill";
  if (!editRefillStart) editRefillStart = true;
  renderEditSection();
  renderRefillControls();
}

function renderRefillControls() {
  refillToggleButton.classList.toggle("is-active", editRefillStart);
  refillToggleButton.textContent = editRefillStart
    ? "This is A New Bottle"
    : "Mark this as New Bottle";
  refillPillsField.hidden = activeEditSection !== "refill" || !editRefillStart;
  refillPillsButton.textContent = `Number of pills: ${editStartingPills}`;
  refillPillsWheelWrap.hidden = !isRefillPillsWheelOpen;

  if (!editRefillStart || !isRefillPillsWheelOpen) return;

  renderPickerWheel(
    refillPillsWheel,
    getStartingPillOptions(editStartingPills),
    editStartingPills,
    (value) => {
      editStartingPills = value;
      refillPillsButton.textContent = `Number of pills: ${value}`;
    },
    {
      allowCustom: true,
      inputMaxLength: 3,
      min: 1,
      max: 999,
      formatInput: (value) => String(value),
      loop: false,
    }
  );
}

function toggleRefillPillsWheel() {
  isRefillPillsWheelOpen = !isRefillPillsWheelOpen;
  renderRefillControls();
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

function getStartingPillOptions(selectedValue = 30) {
  const values = [30, 60, 90];
  const normalizedValue = normalizeStartingPills(selectedValue);
  if (!values.includes(normalizedValue)) values.push(normalizedValue);

  return values
    .sort((first, second) => first - second)
    .map((value) => ({
      value,
      label: String(value),
    }));
}

function getPillsTakenOptions() {
  return [1, 2].map((value) => ({
    value,
    label: String(value),
  }));
}

function renderPickerWheel(wheel, options, selectedValue, onSelect, config = {}) {
  const optionHeight = 40;
  const shouldLoop = config.loop !== false;
  const loopedOptions = shouldLoop ? [...options, ...options, ...options] : options;
  const middleLoopStart = shouldLoop ? options.length : 0;
  const topSpacer = document.createElement("div");
  const bottomSpacer = document.createElement("div");
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === selectedValue));
  let scrollTimeout = 0;
  let scrollAnimationFrame = 0;

  wheel.replaceChildren();
  wheel._pickerOptions = options;
  wheel._pickerOnSelect = onSelect;
  wheel._pickerConfig = config;
  wheel._pickerValue = selectedValue;
  wheel._pickerOptionHeight = optionHeight;
  wheel._pickerLoopStart = middleLoopStart;
  wheel._pickerLoop = shouldLoop;
  wheel._isLoopingScroll = false;
  wheel._lastTapTime = 0;
  wheel.ontouchmove = (event) => {
    event.stopPropagation();
  };
  topSpacer.className = "wheel-picker__spacer";
  bottomSpacer.className = "wheel-picker__spacer";
  wheel.append(topSpacer);

  loopedOptions.forEach((option) => {
    const button = document.createElement("button");
    const label = document.createElement("span");
    button.type = "button";
    button.className = "wheel-picker__option";
    button.dataset.value = String(option.value);
    label.className = "wheel-picker__label";
    label.textContent = option.label;
    button.append(label);
    if (option.value === selectedValue) button.classList.add("is-selected");
    button.addEventListener("click", () => selectWheelValue(wheel, option.value));
    button.addEventListener("dblclick", () => openWheelNumberInput(wheel));
    button.addEventListener("touchend", (event) => {
      const now = Date.now();
      if (now - wheel._lastTapTime < 320) {
        event.preventDefault();
        openWheelNumberInput(wheel);
      }
      wheel._lastTapTime = now;
    });
    wheel.append(button);
  });

  wheel.append(bottomSpacer);
  wheel.onscroll = () => {
    if (wheel._pickerLoop) keepWheelScrollInMiddleLoop(wheel);
    if (wheel._isLoopingScroll) return;

    cancelAnimationFrame(scrollAnimationFrame);
    scrollAnimationFrame = requestAnimationFrame(() => {
      selectWheelValue(wheel, getCenteredWheelValue(wheel), false);
    });
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      selectWheelValue(wheel, getCenteredWheelValue(wheel), false);
    }, 90);
  };

  requestAnimationFrame(() => {
    wheel.scrollTop = (middleLoopStart + selectedIndex) * optionHeight;
  });
}

function openWheelNumberInput(wheel) {
  const options = wheel._pickerOptions || [];
  const config = wheel._pickerConfig || {};
  if (!options.length || wheel.querySelector(".wheel-picker__input")) return;

  const currentValue = getCenteredWheelValue(wheel);
  const input = document.createElement("input");
  input.className = "wheel-picker__input";
  input.type = "text";
  input.inputMode = "numeric";
  input.pattern = "[0-9]*";
  input.maxLength = config.inputMaxLength || 2;
  input.value = config.formatInput
    ? config.formatInput(currentValue ?? 0)
    : String(currentValue ?? 0).padStart(2, "0");
  let isClosed = false;

  const closeInput = (shouldApply) => {
    if (isClosed) return;
    isClosed = true;

    if (shouldApply) {
      const typedValue = Number(input.value);
      const matchingOption = options.find((option) => option.value === typedValue);
      if (matchingOption) {
        selectWheelValue(wheel, matchingOption.value);
      } else if (config.allowCustom && isValidCustomWheelValue(typedValue, config)) {
        addCustomWheelValue(wheel, typedValue);
      }
    }
    input.remove();
  };

  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0, config.inputMaxLength || 2);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      closeInput(true);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeInput(false);
    }
  });
  input.addEventListener("blur", () => closeInput(true));

  wheel.append(input);
  input.focus();
  input.select();
}

function isValidCustomWheelValue(value, config) {
  const min = Number.isInteger(config.min) ? config.min : 0;
  const max = Number.isInteger(config.max) ? config.max : 99;
  return Number.isInteger(value) && value >= min && value <= max;
}

function addCustomWheelValue(wheel, value) {
  const options = [...(wheel._pickerOptions || []), {
    value,
    label: String(value),
  }]
    .filter((option, index, allOptions) => (
      allOptions.findIndex((item) => item.value === option.value) === index
    ))
    .sort((first, second) => first.value - second.value);

  renderPickerWheel(
    wheel,
    options,
    value,
    wheel._pickerOnSelect,
    wheel._pickerConfig || {}
  );
  wheel._pickerOnSelect?.(value);
}

function getCenteredWheelValue(wheel) {
  const options = wheel._pickerOptions || [];
  if (!options.length) return undefined;

  const optionHeight = wheel._pickerOptionHeight || 40;
  const rawIndex = Math.round(wheel.scrollTop / optionHeight);
  const index = wheel._pickerLoop
    ? wrapIndex(rawIndex, options.length)
    : clamp(rawIndex, 0, options.length - 1);
  return options[index]?.value;
}

function selectWheelValue(wheel, value, shouldScroll = true) {
  const options = wheel._pickerOptions || [];
  const selectedIndex = options.findIndex((option) => option.value === value);
  if (selectedIndex < 0) return;

  wheel._pickerValue = value;
  wheel.querySelectorAll(".wheel-picker__option").forEach((option, index) => {
    const optionIndex = wheel._pickerLoop ? wrapIndex(index, options.length) : index;
    option.classList.toggle("is-selected", optionIndex === selectedIndex);
  });
  wheel._pickerOnSelect?.(value);

  if (shouldScroll) {
    const optionHeight = wheel._pickerOptionHeight || 40;
    const loopStart = wheel._pickerLoopStart || 0;
    wheel.scrollTo({ top: (loopStart + selectedIndex) * optionHeight, behavior: "smooth" });
  }
}

function keepWheelScrollInMiddleLoop(wheel) {
  const options = wheel._pickerOptions || [];
  if (!options.length || wheel._isLoopingScroll) return;

  const optionHeight = wheel._pickerOptionHeight || 40;
  const rawIndex = Math.round(wheel.scrollTop / optionHeight);
  const loopSize = options.length * optionHeight;

  if (rawIndex < options.length || rawIndex >= options.length * 2) {
    wheel._isLoopingScroll = true;
    wheel.scrollTop += rawIndex < options.length ? loopSize : -loopSize;
    requestAnimationFrame(() => {
      wheel._isLoopingScroll = false;
      selectWheelValue(wheel, getCenteredWheelValue(wheel), false);
    });
  }
}

function wrapIndex(index, length) {
  return ((index % length) + length) % length;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getWheelValue(wheel, fallbackValue) {
  const selectedValue = wheel._pickerValue ?? getCenteredWheelValue(wheel);
  if (selectedValue === undefined) return fallbackValue;

  selectWheelValue(wheel, selectedValue, false);
  return selectedValue;
}

function getDayLabel(date) {
  const status = logs[toKey(date)] ? "pill taken" : "not logged";
  return `${dateFormatter.format(date)}, ${status}`;
}

async function loadUserData(uid) {
  const [settingsSnapshot, logsSnapshot, feedSnapshot] = await Promise.all([
    getDoc(doc(db, "users", uid, "settings", "main")),
    getDocs(collection(db, "users", uid, "logs")),
    getDocs(collection(db, "users", uid, "feed")),
  ]);

  settings = parseSettings(settingsSnapshot.exists() ? settingsSnapshot.data() : {});
  logs = {};
  logsSnapshot.forEach((logSnapshot) => {
    const entry = parseLogEntry(logSnapshot.data());
    if (entry.takenAt) logs[logSnapshot.id] = entry;
  });
  feedPosts = [];
  feedSnapshot.forEach((postSnapshot) => {
    const post = parseFeedPost(postSnapshot.id, postSnapshot.data());
    if (post.imageUrl || post.caption) feedPosts.push(post);
  });
  feedPosts.sort((first, second) => second.createdAt.localeCompare(first.createdAt));
}

function getCacheKey(uid) {
  return `${localCachePrefix}-${uid}`;
}

function loadCachedUserData(uid) {
  try {
    const cachedData = JSON.parse(localStorage.getItem(getCacheKey(uid)) || "null");
    if (!cachedData) return false;

    settings = parseSettings(cachedData.settings || {});
    logs = {};
    feedPosts = [];
    Object.entries(cachedData.logs || {}).forEach(([key, entry]) => {
      const parsedEntry = parseLogEntry(entry);
      if (parsedEntry.takenAt) logs[key] = parsedEntry;
    });
    (cachedData.feedPosts || []).forEach((entry) => {
      const parsedPost = parseFeedPost(entry.id, entry);
      if (parsedPost.imageUrl || parsedPost.caption) feedPosts.push(parsedPost);
    });
    return true;
  } catch {
    return false;
  }
}

function writeCachedUserData(uid) {
  try {
    localStorage.setItem(getCacheKey(uid), JSON.stringify({
      settings,
      logs,
      feedPosts,
      cachedAt: new Date().toISOString(),
    }));
  } catch {
    // Cache is only for faster display; Firestore remains the source of truth.
  }
}

function getDefaultSettings() {
  return {
    scheduleChanges: [],
    notes: "",
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
    notes: typeof savedSettings.notes === "string" ? savedSettings.notes : "",
  };
}

function parseLogEntry(entry) {
  const takenAt = typeof entry?.takenAt === "string" ? entry.takenAt : "";
  const refillStart = entry?.refillStart === true;
  const sexStatus = entry?.sexStatus === "had" || entry?.sexStatus === "did-not" ? entry.sexStatus : "";
  const hivTest = entry?.hivTest === true;
  const hivLocation = normalizeHivLocation(entry?.hivLocation);
  const encounterDetails = normalizeEncounterDetailsList(entry?.encounterDetails);

  return {
    takenAt: Number.isNaN(new Date(takenAt).getTime()) ? "" : takenAt,
    notes: typeof entry?.notes === "string" ? entry.notes : "",
    pillsTaken: normalizePillsTaken(entry?.pillsTaken),
    refillStart,
    startingPills: refillStart ? normalizeStartingPills(entry?.startingPills) : 0,
    sexStatus,
    encounterDetails: sexStatus === "had" ? encounterDetails : [],
    hivTest,
    hivLocation: hivTest ? hivLocation : "",
  };
}

function parseFeedPost(id, entry) {
  const createdAt = typeof entry?.createdAt === "string" ? entry.createdAt : "";

  return {
    id: typeof entry?.id === "string" ? entry.id : id,
    caption: typeof entry?.caption === "string" ? entry.caption : "",
    imagePath: typeof entry?.imagePath === "string" ? entry.imagePath : "",
    imageUrl: typeof entry?.imageUrl === "string" ? entry.imageUrl : "",
    createdAt: Number.isNaN(new Date(createdAt).getTime()) ? new Date(0).toISOString() : createdAt,
    updatedAt: typeof entry?.updatedAt === "string" ? entry.updatedAt : "",
  };
}

async function saveSettingsToFirestore() {
  requireSignedInUser();
  await setDoc(doc(db, "users", currentUser.uid, "settings", "main"), settings);
  writeCachedUserData(currentUser.uid);
}

async function saveLogToFirestore(key, entry) {
  requireSignedInUser();
  await setDoc(doc(db, "users", currentUser.uid, "logs", key), entry);
  writeCachedUserData(currentUser.uid);
}

async function saveFeedPostToFirestore(post) {
  requireSignedInUser();
  await setDoc(doc(db, "users", currentUser.uid, "feed", post.id), post);
  writeCachedUserData(currentUser.uid);
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
  writeCachedUserData(currentUser.uid);
}

async function deleteLogFromFirestore(key) {
  requireSignedInUser();
  await deleteDoc(doc(db, "users", currentUser.uid, "logs", key));
  writeCachedUserData(currentUser.uid);
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

function createLogEntry(
  takenAt,
  notes,
  refillStart = false,
  startingPills = 0,
  pillsTaken = 1,
  sexStatus = "",
  encounterDetails = [],
  hivTest = false,
  hivLocation = ""
) {
  return {
    takenAt: takenAt.toISOString(),
    notes,
    pillsTaken: normalizePillsTaken(pillsTaken),
    refillStart,
    startingPills: refillStart ? normalizeStartingPills(startingPills) : 0,
    sexStatus: sexStatus === "had" || sexStatus === "did-not" ? sexStatus : "",
    encounterDetails: sexStatus === "had" ? normalizeEncounterDetailsList(encounterDetails) : [],
    hivTest: hivTest === true,
    hivLocation: hivTest === true ? normalizeHivLocation(hivLocation) : "",
  };
}

function getLogTakenAt(entry) {
  return typeof entry === "string" ? entry : entry?.takenAt;
}

function getLogNotes(entry) {
  return typeof entry === "string" ? "" : entry?.notes || "";
}

function getLogPillsTaken(entry) {
  return typeof entry === "string" ? 1 : normalizePillsTaken(entry?.pillsTaken);
}

function getLogSexStatus(entry) {
  return typeof entry !== "string" && (entry?.sexStatus === "had" || entry?.sexStatus === "did-not")
    ? entry.sexStatus
    : "";
}

function getLogEncounterDetailsList(entry) {
  return typeof entry !== "string" ? normalizeEncounterDetailsList(entry?.encounterDetails) : [];
}

function getDefaultEncounterDetails() {
  return {
    bodyCount: "",
    location: "",
    kiss: "No",
    iSuckedHim: "No",
    heSuckedMe: "No",
    iFuckedHim: "No",
    heFuckedMe: "No",
    iSwallowedHisCum: "No",
    heSwallowedMyCum: "No",
    iCame: "No",
    heCame: "No",
    notes: "",
    lineNotes: getDefaultEncounterLineNotes(),
  };
}

function getDefaultEncounterLineNotes() {
  return {
    bodyCount: "",
    location: "",
    kiss: "",
    iSuckedHim: "",
    heSuckedMe: "",
    iFuckedHim: "",
    heFuckedMe: "",
    iSwallowedHisCum: "",
    heSwallowedMyCum: "",
    iCame: "",
    heCame: "",
  };
}

function normalizeEncounterDetails(details) {
  const defaults = getDefaultEncounterDetails();
  const source = details && typeof details === "object" ? details : {};

  return {
    bodyCount: source.bodyCount === 0 || source.bodyCount ? String(source.bodyCount) : defaults.bodyCount,
    location: typeof source.location === "string" ? source.location : defaults.location,
    kiss: normalizeChoice(source.kiss, ["Yes", "No"], defaults.kiss),
    iSuckedHim: normalizeChoice(source.iSuckedHim, ["Yes", "No"], defaults.iSuckedHim),
    heSuckedMe: normalizeChoice(source.heSuckedMe, ["Yes", "No"], defaults.heSuckedMe),
    iFuckedHim: normalizeChoice(source.iFuckedHim, ["Yes with condom", "Yes bare", "No"], defaults.iFuckedHim),
    heFuckedMe: normalizeChoice(source.heFuckedMe, ["Yes with condom", "Yes bare", "No"], defaults.heFuckedMe),
    iSwallowedHisCum: normalizeChoice(source.iSwallowedHisCum, ["Yes", "No"], defaults.iSwallowedHisCum),
    heSwallowedMyCum: normalizeChoice(source.heSwallowedMyCum, ["Yes", "No"], defaults.heSwallowedMyCum),
    iCame: normalizeChoice(source.iCame === "Yes - other" ? "Yes" : source.iCame, [
      "Yes, inside his mouth",
      "Yes, inside his ass with condom",
      "Yes, inside his ass bare",
      "Yes",
      "No",
    ], defaults.iCame),
    heCame: normalizeChoice(source.heCame === "Yes - other" ? "Yes" : source.heCame, [
      "Yes, inside my mouth",
      "Yes, inside my ass with condom",
      "Yes, inside my ass bare",
      "Yes",
      "No",
    ], defaults.heCame),
    notes: typeof source.notes === "string" ? source.notes.trim() : defaults.notes,
    lineNotes: normalizeEncounterLineNotes(source.lineNotes),
  };
}

function normalizeEncounterLineNotes(lineNotes) {
  const defaults = getDefaultEncounterLineNotes();
  const source = lineNotes && typeof lineNotes === "object" ? lineNotes : {};

  return Object.fromEntries(
    Object.keys(defaults).map((key) => [
      key,
      typeof source[key] === "string" ? source[key].trim() : "",
    ])
  );
}

function getEncounterLineNote(details, key) {
  return normalizeEncounterLineNotes(details?.lineNotes)[key] || "";
}

function normalizeEncounterDetailsList(details) {
  if (Array.isArray(details)) {
    return details.map((detail, index) => ({
      ...normalizeEncounterDetails(detail),
      bodyCount: String(index + 1),
    }));
  }

  if (details && typeof details === "object") {
    return [{
      ...normalizeEncounterDetails(details),
      bodyCount: "1",
    }];
  }

  return [];
}

function normalizeChoice(value, choices, fallback) {
  return choices.includes(value) ? value : fallback;
}

function fillEncounterForm(details) {
  const normalizedDetails = normalizeEncounterDetails(details);
  encounterBodyCountInput.value = String(encounterDialogEditIndex + 1);
  encounterLocationInput.value = normalizedDetails.location;
  encounterKissSelect.value = normalizedDetails.kiss;
  encounterISuckedHimSelect.value = normalizedDetails.iSuckedHim;
  encounterHeSuckedMeSelect.value = normalizedDetails.heSuckedMe;
  encounterIFuckedHimSelect.value = normalizedDetails.iFuckedHim;
  encounterHeFuckedMeSelect.value = normalizedDetails.heFuckedMe;
  encounterISwallowedSelect.value = normalizedDetails.iSwallowedHisCum;
  encounterHeSwallowedSelect.value = normalizedDetails.heSwallowedMyCum;
  encounterICameSelect.value = normalizedDetails.iCame;
  encounterHeCameSelect.value = normalizedDetails.heCame;
  encounterNotesInput.value = normalizedDetails.notes;
  fillEncounterLineNotes(normalizedDetails.lineNotes);
  renderEncounterDialogTitle();
}

function getEncounterDetailsFromForm() {
  return normalizeEncounterDetails({
    bodyCount: String(encounterDialogEditIndex + 1),
    location: encounterLocationInput.value.trim(),
    kiss: encounterKissSelect.value,
    iSuckedHim: encounterISuckedHimSelect.value,
    heSuckedMe: encounterHeSuckedMeSelect.value,
    iFuckedHim: encounterIFuckedHimSelect.value,
    heFuckedMe: encounterHeFuckedMeSelect.value,
    iSwallowedHisCum: encounterISwallowedSelect.value,
    heSwallowedMyCum: encounterHeSwallowedSelect.value,
    iCame: encounterICameSelect.value,
    heCame: encounterHeCameSelect.value,
    notes: encounterNotesInput.value.trim(),
    lineNotes: getEncounterLineNotesFromForm(),
  });
}

function fillEncounterLineNotes(lineNotes) {
  const normalizedLineNotes = normalizeEncounterLineNotes(lineNotes);
  encounterLineNoteInputs.forEach((input) => {
    input.value = normalizedLineNotes[input.dataset.encounterNote] || "";
  });
}

function getEncounterLineNotesFromForm() {
  return normalizeEncounterLineNotes(Object.fromEntries(
    encounterLineNoteInputs.map((input) => [
      input.dataset.encounterNote,
      input.value.trim(),
    ])
  ));
}

function appendHadSexNote(notes) {
  const note = "Had encounter today.";
  const noteWithoutPeriod = "Had encounter today";
  const oldNote = "Had sex today.";
  const trimmedNotes = notes.trim();
  if (!trimmedNotes) return note;
  if (trimmedNotes.includes(note)) return trimmedNotes;
  if (trimmedNotes.includes(noteWithoutPeriod)) return trimmedNotes;
  if (trimmedNotes.includes(oldNote)) return trimmedNotes.replaceAll(oldNote, note);
  return `${trimmedNotes}\n${note}`;
}

function appendHivTestNote(notes, location) {
  const trimmedNotes = removeHivTestNote(notes);
  const hivNote = `HIV Negative at ${normalizeHivLocation(location)}.`;
  return trimmedNotes ? `${trimmedNotes}\n${hivNote}` : hivNote;
}

function removeHivTestNote(notes) {
  const lines = notes.split(/\r?\n/);
  const keptLines = [];

  for (let index = 0; index < lines.length; index += 1) {
    if (/^HIV Negative at .+\.?$/i.test(lines[index].trim())) {
      continue;
    }
    if (/^HIV Negative\.?$/i.test(lines[index].trim())) {
      if (/^Location:\s*/i.test(lines[index + 1]?.trim() || "")) index += 1;
      continue;
    }
    keptLines.push(lines[index]);
  }

  return keptLines.join("\n").trim();
}

function hasSexLogged(entry) {
  return getLogSexStatus(entry) === "had";
}

function hasHivTestLogged(entry) {
  return typeof entry !== "string" && entry?.hivTest === true;
}

function getLogHivLocation(entry) {
  return typeof entry !== "string" && entry?.hivTest === true
    ? normalizeHivLocation(entry?.hivLocation)
    : hivTestLocations[0];
}

function normalizeHivLocation(location) {
  return hivTestLocations.includes(location) ? location : hivTestLocations[0];
}

function isRefillStart(entry) {
  return typeof entry !== "string" && entry?.refillStart === true;
}

function getLogStartingPills(entry) {
  return isRefillStart(entry) ? normalizeStartingPills(entry.startingPills) : 0;
}

function normalizeStartingPills(value) {
  const pills = Number(value);
  return Number.isInteger(pills) && pills > 0 && pills <= 999 ? pills : 30;
}

function normalizePillsTaken(value) {
  const pills = Number(value);
  return pills === 2 ? 2 : 1;
}

function getPillsRemaining() {
  const todayKey = toKey(today);
  const refillKey = Object.entries(logs)
    .filter(([key, entry]) => key <= todayKey && isRefillStart(entry))
    .map(([key]) => key)
    .sort()
    .at(-1);

  if (!refillKey) return null;

  const startingPills = getLogStartingPills(logs[refillKey]);
  const takenSinceRefill = Object.entries(logs)
    .filter(([key, entry]) => (
      key >= refillKey
      && key <= todayKey
      && Boolean(getLogTakenAt(entry))
    ))
    .reduce((total, [, entry]) => total + getLogPillsTaken(entry), 0);

  return Math.max(0, startingPills - takenSinceRefill);
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

function formatCompactInputDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getMonth()];
  return `${day}${month}${date.getFullYear()}`;
}

function formatFeedDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sanitizeFileName(fileName) {
  return fileName.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "") || "upload.jpg";
}

function withTimeout(promise, milliseconds, message) {
  let timeoutId = 0;
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(message)), milliseconds);
  });

  return Promise.race([promise, timeout]).finally(() => {
    window.clearTimeout(timeoutId);
  });
}

function parseInputDate(value) {
  const normalizedValue = value.trim();
  const compactMatch = normalizedValue.match(/^(\d{2})([A-Za-z]{3})(\d{4})$/);
  if (compactMatch) {
    const day = Number(compactMatch[1]);
    const month = getShortMonthIndex(compactMatch[2]);
    const year = Number(compactMatch[3]);
    if (month < 0) return null;

    const date = new Date(year, month, day);
    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
      return null;
    }

    return date;
  }

  const match = normalizedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

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

function getShortMonthIndex(monthText) {
  return ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
    .indexOf(monthText.toLowerCase());
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
  if (!scheduledAt) return "PreP Stopped";
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
    schedule = change.endDate && key >= change.endDate ? null : change.schedule;
  }

  return schedule;
}

function isEndedDate(date) {
  return !getEffectiveSchedule(date);
}

function hasScheduleChangeOn(key) {
  return settings.scheduleChanges.some((change) => change.date === key);
}

function getNewScheduleChangeOn(date) {
  return settings.scheduleChanges.find((change) => change.date === toKey(date) && !change.endDate);
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
    schedule = change.endDate && changeDateKey >= change.endDate ? defaultSchedule : change.schedule;
  }

  return schedule;
}

function isOutsideScheduleWindow(loggedAt, date) {
  const takenAt = new Date(getLogTakenAt(loggedAt));
  const scheduledAt = getScheduledDoseTime(date);
  if (!scheduledAt) return false;

  return Math.abs(takenAt - scheduledAt) > scheduleWindowMs;
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

  const todayDose = getTodayDoseTime(new Date());
  return date < today
    || (toKey(date) === toKey(today) && todayDose && new Date() > getScheduleWindowEnd(todayDose));
}

function isUpcomingDate(date) {
  if (isFutureDate(date)) return true;

  const scheduledAt = getScheduledDoseTime(date);
  return toKey(date) === toKey(today) && scheduledAt && new Date() <= getScheduleWindowEnd(scheduledAt);
}

function getScheduleWindowEnd(scheduledAt) {
  return new Date(scheduledAt.getTime() + scheduleWindowMs);
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
  return schedule ? `Schedule is Every day at ${formatScheduleClock(schedule)}` : "PreP Stopped";
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
