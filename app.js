const digitalTime = document.getElementById("digitalTime");
const digitalDate = document.getElementById("digitalDate");
const weekInfo = document.getElementById("weekInfo");
const dayProgress = document.getElementById("dayProgress").querySelector("span");
const hourHand = document.querySelector(".hand.hour");
const minuteHand = document.querySelector(".hand.minute");
const secondHand = document.querySelector(".hand.second");

const timezoneSelect = document.getElementById("timezoneSelect");
const localeSelect = document.getElementById("localeSelect");
const formatSelect = document.getElementById("formatSelect");
const accentColor = document.getElementById("accentColor");
const showSeconds = document.getElementById("showSeconds");
const showMilliseconds = document.getElementById("showMilliseconds");
const showDate = document.getElementById("showDate");
const showWeekInfo = document.getElementById("showWeekInfo");
const motionIntensity = document.getElementById("motionIntensity");

const worldSelect = document.getElementById("worldSelect");
const addWorld = document.getElementById("addWorld");
const worldList = document.getElementById("worldList");

const alarmTime = document.getElementById("alarmTime");
const setAlarm = document.getElementById("setAlarm");
const alarmStatus = document.getElementById("alarmStatus");

const startStopwatch = document.getElementById("startStopwatch");
const lapStopwatch = document.getElementById("lapStopwatch");
const resetStopwatch = document.getElementById("resetStopwatch");
const stopwatchDisplay = document.getElementById("stopwatchDisplay");
const lapList = document.getElementById("lapList");

const timerMinutes = document.getElementById("timerMinutes");
const timerSeconds = document.getElementById("timerSeconds");
const startTimer = document.getElementById("startTimer");
const resetTimer = document.getElementById("resetTimer");
const timerDisplay = document.getElementById("timerDisplay");

const supportedTimezones =
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : ["UTC", Intl.DateTimeFormat().resolvedOptions().timeZone];
const supportedLocales = ["tr-TR", "en-US", "de-DE", "fr-FR", "ar-SA", "ja-JP"];

const state = {
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  locale: "tr-TR",
  format: 24,
  alarm: null,
  alarmTriggered: false,
  stopwatchRunning: false,
  stopwatchStart: 0,
  stopwatchElapsed: 0,
  timerRemaining: 0,
  timerRunning: false,
  worldClocks: [],
};

function formatTime(date, { locale, timeZone, showSeconds, showMilliseconds, format }) {
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: format === 12,
    timeZone,
  };

  if (showSeconds) {
    options.second = "2-digit";
  }

  const base = new Intl.DateTimeFormat(locale, options).format(date);

  if (showMilliseconds) {
    const ms = String(date.getMilliseconds()).padStart(3, "0");
    return `${base}.${ms}`;
  }

  return base;
}

function updateClock() {
  const now = new Date();
  const localized = new Date(now.toLocaleString("en-US", { timeZone: state.timezone }));
  const hours = localized.getHours();
  const minutes = localized.getMinutes();
  const seconds = localized.getSeconds();
  const milliseconds = localized.getMilliseconds();

  const hourRotation = (hours % 12) * 30 + minutes / 2;
  const minuteRotation = minutes * 6 + seconds / 10;
  const secondRotation = seconds * 6 + milliseconds / 166.67;

  hourHand.style.transform = `translateX(-50%) rotate(${hourRotation}deg)`;
  minuteHand.style.transform = `translateX(-50%) rotate(${minuteRotation}deg)`;
  secondHand.style.transform = `translateX(-50%) rotate(${secondRotation}deg)`;
  secondHand.style.opacity = showSeconds.checked ? "1" : "0";

  digitalTime.textContent = formatTime(localized, {
    locale: state.locale,
    timeZone: state.timezone,
    showSeconds: showSeconds.checked,
    showMilliseconds: showMilliseconds.checked,
    format: state.format,
  });

  if (showDate.checked) {
    digitalDate.textContent = new Intl.DateTimeFormat(state.locale, {
      dateStyle: "full",
      timeZone: state.timezone,
    }).format(localized);
  } else {
    digitalDate.textContent = "";
  }

  if (showWeekInfo.checked) {
    const weekNumber = getWeekNumber(localized);
    weekInfo.textContent = `Hafta ${weekNumber}`;
  } else {
    weekInfo.textContent = "";
  }

  const dayStart = new Date(localized);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(localized);
  dayEnd.setHours(23, 59, 59, 999);
  const progress =
    (localized.getTime() - dayStart.getTime()) / (dayEnd.getTime() - dayStart.getTime());
  dayProgress.style.width = `${Math.min(Math.max(progress, 0), 1) * 100}%`;

  updateWorldClocks(localized);
  updateAlarm(localized);
  updateStopwatch();
  updateTimer();
  requestAnimationFrame(updateClock);
}

function getWeekNumber(date) {
  const tempDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = tempDate.getUTCDay() || 7;
  tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
  return Math.ceil(((tempDate - yearStart) / 86400000 + 1) / 7);
}

function populateSelect(select, values, selected) {
  select.innerHTML = "";
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    option.selected = value === selected;
    select.appendChild(option);
  });
}

function updateWorldClocks(referenceDate) {
  worldList.innerHTML = "";
  state.worldClocks.forEach((timezone) => {
    const item = document.createElement("li");
    const time = new Intl.DateTimeFormat(state.locale, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: timezone,
    }).format(referenceDate);
    const label = document.createElement("span");
    label.textContent = `${timezone}`;
    const value = document.createElement("strong");
    value.textContent = time;

    const removeButton = document.createElement("button");
    removeButton.textContent = "Sil";
    removeButton.addEventListener("click", () => {
      state.worldClocks = state.worldClocks.filter((itemTimezone) => itemTimezone !== timezone);
      updateWorldClocks(referenceDate);
    });

    item.append(label, value, removeButton);
    worldList.appendChild(item);
  });
}

function updateAlarm(date) {
  if (!state.alarm) {
    return;
  }

  const [alarmHours, alarmMinutes] = state.alarm.split(":").map(Number);
  if (
    date.getHours() === alarmHours &&
    date.getMinutes() === alarmMinutes &&
    !state.alarmTriggered
  ) {
    state.alarmTriggered = true;
    alarmStatus.textContent = "Alarm! Zaman geldi.";
    alarmStatus.style.color = "#ff8a8a";
  }
}

function updateStopwatch() {
  if (state.stopwatchRunning) {
    state.stopwatchElapsed = Date.now() - state.stopwatchStart;
  }
  const totalMs = state.stopwatchElapsed;
  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const milliseconds = Math.floor(totalMs % 1000);
  stopwatchDisplay.textContent = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
}

function updateTimer() {
  if (!state.timerRunning) {
    return;
  }
  const now = Date.now();
  const remaining = Math.max(state.timerRemaining - now, 0);
  if (remaining === 0) {
    state.timerRunning = false;
  }
  timerDisplay.textContent = formatTimer(remaining);
}

function formatTimer(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function initControls() {
  populateSelect(timezoneSelect, supportedTimezones, state.timezone);
  populateSelect(localeSelect, supportedLocales, state.locale);
  populateSelect(worldSelect, supportedTimezones.slice(0, 40), supportedTimezones[0]);

  timezoneSelect.addEventListener("change", (event) => {
    state.timezone = event.target.value;
  });

  localeSelect.addEventListener("change", (event) => {
    state.locale = event.target.value;
  });

  formatSelect.addEventListener("change", (event) => {
    state.format = Number(event.target.value);
  });

  accentColor.addEventListener("input", (event) => {
    document.documentElement.style.setProperty("--accent", event.target.value);
  });

  motionIntensity.addEventListener("input", (event) => {
    const intensity = Number(event.target.value) / 100;
    document.documentElement.style.setProperty("--motion-intensity", intensity.toString());
    document.documentElement.style.setProperty(
      "--accent-strong",
      `color-mix(in srgb, var(--accent) ${60 + intensity * 40}%, #ffffff)`
    );
  });

  addWorld.addEventListener("click", () => {
    const timezone = worldSelect.value;
    if (!state.worldClocks.includes(timezone)) {
      state.worldClocks.push(timezone);
    }
  });

  setAlarm.addEventListener("click", () => {
    if (!alarmTime.value) {
      alarmStatus.textContent = "Lütfen alarm saati seçin.";
      return;
    }
    state.alarm = alarmTime.value;
    state.alarmTriggered = false;
    alarmStatus.textContent = `Alarm ${state.alarm} için kuruldu.`;
    alarmStatus.style.color = "var(--muted)";
  });

  startStopwatch.addEventListener("click", () => {
    if (state.stopwatchRunning) {
      state.stopwatchRunning = false;
      state.stopwatchElapsed = Date.now() - state.stopwatchStart;
      startStopwatch.textContent = "Başlat";
      return;
    }
    state.stopwatchRunning = true;
    state.stopwatchStart = Date.now() - state.stopwatchElapsed;
    startStopwatch.textContent = "Duraklat";
  });

  lapStopwatch.addEventListener("click", () => {
    if (!state.stopwatchRunning) {
      return;
    }
    const lapItem = document.createElement("li");
    lapItem.textContent = `Tur ${lapList.children.length + 1}: ${stopwatchDisplay.textContent}`;
    lapList.prepend(lapItem);
  });

  resetStopwatch.addEventListener("click", () => {
    state.stopwatchRunning = false;
    state.stopwatchElapsed = 0;
    startStopwatch.textContent = "Başlat";
    lapList.innerHTML = "";
  });

  startTimer.addEventListener("click", () => {
    const minutes = Number(timerMinutes.value) || 0;
    const seconds = Number(timerSeconds.value) || 0;
    const duration = (minutes * 60 + seconds) * 1000;
    if (!duration) {
      timerDisplay.textContent = "00:00";
      return;
    }
    state.timerRemaining = Date.now() + duration;
    state.timerRunning = true;
  });

  resetTimer.addEventListener("click", () => {
    state.timerRunning = false;
    state.timerRemaining = 0;
    timerDisplay.textContent = "00:00";
  });
}

initControls();
requestAnimationFrame(updateClock);
