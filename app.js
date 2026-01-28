const state = {
  locale: "tr-TR",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  format: "24",
  showSeconds: true,
  showMilliseconds: false,
  showDate: true,
  showWeekInfo: true,
  accent: "#6cffe0",
  motionIntensity: 70,
  worldClocks: ["Europe/Istanbul", "Europe/London", "America/New_York"],
};

const elements = {
  digitalTime: document.getElementById("digitalTime"),
  digitalDate: document.getElementById("digitalDate"),
  dayProgress: document.querySelector("#dayProgress span"),
  timezoneSelect: document.getElementById("timezoneSelect"),
  localeSelect: document.getElementById("localeSelect"),
  formatSelect: document.getElementById("formatSelect"),
  accentColor: document.getElementById("accentColor"),
  showSeconds: document.getElementById("showSeconds"),
  showMilliseconds: document.getElementById("showMilliseconds"),
  showDate: document.getElementById("showDate"),
  showWeekInfo: document.getElementById("showWeekInfo"),
  motionIntensity: document.getElementById("motionIntensity"),
  worldSelect: document.getElementById("worldSelect"),
  addWorld: document.getElementById("addWorld"),
  worldList: document.getElementById("worldList"),
  alarmTime: document.getElementById("alarmTime"),
  setAlarm: document.getElementById("setAlarm"),
  alarmStatus: document.getElementById("alarmStatus"),
  startStopwatch: document.getElementById("startStopwatch"),
  lapStopwatch: document.getElementById("lapStopwatch"),
  resetStopwatch: document.getElementById("resetStopwatch"),
  stopwatchDisplay: document.getElementById("stopwatchDisplay"),
  lapList: document.getElementById("lapList"),
  timerMinutes: document.getElementById("timerMinutes"),
  timerSeconds: document.getElementById("timerSeconds"),
  startTimer: document.getElementById("startTimer"),
  resetTimer: document.getElementById("resetTimer"),
  timerDisplay: document.getElementById("timerDisplay"),
  hourHand: document.querySelector(".hand.hour"),
  minuteHand: document.querySelector(".hand.minute"),
  secondHand: document.querySelector(".hand.second"),
  compassRing: document.querySelector(".compass-ring"),
};

const timezones = [
  "Europe/Istanbul",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Dubai",
  "America/New_York",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Australia/Sydney",
];

const locales = ["tr-TR", "en-GB", "en-US", "de-DE", "fr-FR", "ja-JP"];

const stopwatch = {
  running: false,
  startTime: 0,
  elapsed: 0,
  laps: [],
};

const timer = {
  running: false,
  totalMs: 0,
  remainingMs: 0,
  endTime: 0,
};

let alarmTime = null;
let lastTickMinute = null;

function setupSelectOptions() {
  timezones.forEach((zone) => {
    const option = document.createElement("option");
    option.value = zone;
    option.textContent = zone.replace("_", " ");
    elements.timezoneSelect.appendChild(option);
  });
  elements.timezoneSelect.value = state.timezone;

  locales.forEach((locale) => {
    const option = document.createElement("option");
    option.value = locale;
    option.textContent = locale;
    elements.localeSelect.appendChild(option);
  });
  elements.localeSelect.value = state.locale;

  timezones.forEach((zone) => {
    const option = document.createElement("option");
    option.value = zone;
    option.textContent = zone.replace("_", " ");
    elements.worldSelect.appendChild(option);
  });
}

function updateAccent(color) {
  document.documentElement.style.setProperty("--accent", color);
  document.documentElement.style.setProperty(
    "--accent-soft",
    `${color}33`
  );
}

function getDateForZone(timezone) {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(now);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return new Date(
    `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}:${map.second}`
  );
}

function formatTime(date) {
  const options = {
    timeZone: state.timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: state.showSeconds ? "2-digit" : undefined,
    hour12: state.format === "12",
  };
  if (state.showMilliseconds) {
    const ms = String(date.getMilliseconds()).padStart(3, "0");
    return `${new Intl.DateTimeFormat(state.locale, options).format(date)}.${ms}`;
  }
  return new Intl.DateTimeFormat(state.locale, options).format(date);
}

function formatDate(date) {
  const options = {
    timeZone: state.timezone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const dateText = new Intl.DateTimeFormat(state.locale, options).format(date);
  const weekInfo = state.showWeekInfo
    ? ` • Hafta ${getWeekNumber(date)} • ${getDayProgress(
        date
      )}%`
    : "";
  return `${dateText}${weekInfo}`;
}

function getWeekNumber(date) {
  const tempDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = tempDate.getUTCDay() || 7;
  tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
  return Math.ceil(((tempDate - yearStart) / 86400000 + 1) / 7);
}

function getDayProgress(date) {
  const seconds =
    date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
  return Math.round((seconds / 86400) * 100);
}

function updateClock() {
  const now = getDateForZone(state.timezone);
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();

  const hourDegrees = (hours % 12) * 30 + minutes * 0.5;
  const minuteDegrees = minutes * 6 + seconds * 0.1;
  const secondDegrees = seconds * 6 + milliseconds * 0.006;

  elements.hourHand.style.transform = `translateX(-50%) rotate(${hourDegrees}deg)`;
  elements.minuteHand.style.transform = `translateX(-50%) rotate(${minuteDegrees}deg)`;
  elements.secondHand.style.transform = `translateX(-50%) rotate(${secondDegrees}deg)`;

  elements.digitalTime.textContent = formatTime(now);
  elements.digitalDate.textContent = state.showDate ? formatDate(now) : "";
  elements.dayProgress.style.width = `${getDayProgress(now)}%`;

  const spin = (state.motionIntensity / 100) * secondDegrees;
  elements.compassRing.style.transform = `rotate(${spin}deg)`;

  checkAlarm(now);
  updateWorldClocks();
  updateStopwatch();
  updateTimer();

  requestAnimationFrame(updateClock);
}

function updateWorldClocks() {
  elements.worldList.innerHTML = "";
  state.worldClocks.forEach((zone) => {
    const now = getDateForZone(zone);
    const time = new Intl.DateTimeFormat(state.locale, {
      timeZone: zone,
      hour: "2-digit",
      minute: "2-digit",
      second: state.showSeconds ? "2-digit" : undefined,
      hour12: state.format === "12",
    }).format(now);
    const item = document.createElement("li");
    item.innerHTML = `<span>${zone.replace("_", " ")}</span><span>${time}</span>`;
    const remove = document.createElement("button");
    remove.textContent = "Kaldır";
    remove.addEventListener("click", () => {
      state.worldClocks = state.worldClocks.filter((entry) => entry !== zone);
    });
    item.appendChild(remove);
    elements.worldList.appendChild(item);
  });
}

function checkAlarm(now) {
  if (!alarmTime) {
    return;
  }
  const currentMinute = `${now.getHours()}:${now.getMinutes()}`;
  if (currentMinute === alarmTime && lastTickMinute !== currentMinute) {
    elements.alarmStatus.textContent = "Alarm! ⏰";
    elements.alarmStatus.style.color = "#ff7ad9";
    lastTickMinute = currentMinute;
  }
}

function updateStopwatch() {
  if (!stopwatch.running) {
    return;
  }
  stopwatch.elapsed = performance.now() - stopwatch.startTime;
  elements.stopwatchDisplay.textContent = formatDuration(stopwatch.elapsed);
}

function updateTimer() {
  if (!timer.running) {
    return;
  }
  timer.remainingMs = Math.max(timer.endTime - performance.now(), 0);
  elements.timerDisplay.textContent = formatCountdown(timer.remainingMs);
  if (timer.remainingMs === 0) {
    timer.running = false;
    elements.timerDisplay.textContent = "Süre doldu!";
  }
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  const millis = Math.floor(ms % 1000)
    .toString()
    .padStart(3, "0");
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  return `${hours}:${minutes}:${seconds}.${millis}`;
}

function formatCountdown(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function attachListeners() {
  elements.timezoneSelect.addEventListener("change", (event) => {
    state.timezone = event.target.value;
  });

  elements.localeSelect.addEventListener("change", (event) => {
    state.locale = event.target.value;
  });

  elements.formatSelect.addEventListener("change", (event) => {
    state.format = event.target.value;
  });

  elements.accentColor.addEventListener("input", (event) => {
    state.accent = event.target.value;
    updateAccent(state.accent);
  });

  elements.showSeconds.addEventListener("change", (event) => {
    state.showSeconds = event.target.checked;
  });

  elements.showMilliseconds.addEventListener("change", (event) => {
    state.showMilliseconds = event.target.checked;
  });

  elements.showDate.addEventListener("change", (event) => {
    state.showDate = event.target.checked;
  });

  elements.showWeekInfo.addEventListener("change", (event) => {
    state.showWeekInfo = event.target.checked;
  });

  elements.motionIntensity.addEventListener("input", (event) => {
    state.motionIntensity = Number(event.target.value);
  });

  elements.addWorld.addEventListener("click", () => {
    const zone = elements.worldSelect.value;
    if (!state.worldClocks.includes(zone)) {
      state.worldClocks.push(zone);
    }
  });

  elements.setAlarm.addEventListener("click", () => {
    alarmTime = elements.alarmTime.value;
    elements.alarmStatus.textContent = alarmTime
      ? `Alarm kuruldu: ${alarmTime}`
      : "Alarm ayarlanmadı.";
    elements.alarmStatus.style.color = "var(--accent)";
  });

  elements.startStopwatch.addEventListener("click", () => {
    if (!stopwatch.running) {
      stopwatch.running = true;
      stopwatch.startTime = performance.now() - stopwatch.elapsed;
      elements.startStopwatch.textContent = "Duraklat";
      return;
    }
    stopwatch.running = false;
    elements.startStopwatch.textContent = "Devam";
  });

  elements.lapStopwatch.addEventListener("click", () => {
    if (!stopwatch.running) {
      return;
    }
    stopwatch.laps.push(stopwatch.elapsed);
    const lapItem = document.createElement("li");
    lapItem.textContent = `Tur ${stopwatch.laps.length}: ${formatDuration(
      stopwatch.elapsed
    )}`;
    elements.lapList.prepend(lapItem);
  });

  elements.resetStopwatch.addEventListener("click", () => {
    stopwatch.running = false;
    stopwatch.elapsed = 0;
    stopwatch.laps = [];
    elements.stopwatchDisplay.textContent = "00:00:00.000";
    elements.lapList.innerHTML = "";
    elements.startStopwatch.textContent = "Başlat";
  });

  elements.startTimer.addEventListener("click", () => {
    const minutes = Number(elements.timerMinutes.value || 0);
    const seconds = Number(elements.timerSeconds.value || 0);
    timer.totalMs = (minutes * 60 + seconds) * 1000;
    if (timer.totalMs <= 0) {
      elements.timerDisplay.textContent = "00:00";
      return;
    }
    timer.running = true;
    timer.endTime = performance.now() + timer.totalMs;
  });

  elements.resetTimer.addEventListener("click", () => {
    timer.running = false;
    timer.totalMs = 0;
    timer.remainingMs = 0;
    elements.timerDisplay.textContent = "00:00";
  });
}

function init() {
  setupSelectOptions();
  updateAccent(state.accent);
  attachListeners();
  updateClock();
}

init();
