function getBasePath() {
  return window.location.pathname.includes("/admin/") ? "../" : "";
}

const DAYS = [
  { id: "monday", label: "Mon", full: "Monday" },
  { id: "tuesday", label: "Tue", full: "Tuesday" },
  { id: "wednesday", label: "Wed", full: "Wednesday" },
  { id: "thursday", label: "Thu", full: "Thursday" },
  { id: "friday", label: "Fri", full: "Friday" },
  { id: "saturday", label: "Sat", full: "Saturday" },
];

const DAY_IDS = DAYS.map((d) => d.id);

const WORKOUT_FOCUSES = [
  { id: "chest", label: "Chest" },
  { id: "back", label: "Back" },
  { id: "legs", label: "Legs" },
  { id: "shoulders", label: "Shoulders" },
  { id: "arms", label: "Arms" },
  { id: "full_body", label: "Full Body" },
  { id: "core", label: "Core" },
];

const WORKOUT_TYPES = [
  { id: "weight", label: "Weight Training" },
  { id: "cardio", label: "Cardio" },
];

function getFocusLabel(focusId) {
  return WORKOUT_FOCUSES.find((f) => f.id === focusId)?.label || focusId;
}

function getWorkoutTypeLabel(typeId) {
  return WORKOUT_TYPES.find((t) => t.id === typeId)?.label || typeId;
}

function phoneToEmail(phone) {
  const digits = normalizePhone(phone);
  return `${digits}@fitnesspark.app`;
}

function normalizePhone(phone) {
  return String(phone).replace(/\D/g, "");
}

function validatePhone(phone) {
  const digits = normalizePhone(phone);
  return digits.length >= 10 && digits.length <= 15;
}

function validatePassword(password) {
  return String(password).length >= 6;
}

function getTodayDayId() {
  const dayIndex = new Date().getDay();
  // 0 = Sunday (rest), 1 = Monday, ... 6 = Saturday
  if (dayIndex === 0) return null;
  return DAY_IDS[dayIndex - 1];
}

function getDayInfo(dayId) {
  return DAYS.find((d) => d.id === dayId) || null;
}

function formatAuthError(error) {
  const code = error?.code || "";
  const messages = {
    "auth/invalid-email": "Invalid phone number format.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account found with this phone number.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Invalid phone number or password.",
    "auth/email-already-in-use": "An account with this phone number already exists.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Check your connection.",
  };
  return messages[code] || error?.message || "Something went wrong. Please try again.";
}

function showAlert(container, message, type = "error") {
  if (!container) return;
  container.innerHTML = `<div class="alert alert--${type}">${message}</div>`;
}

function clearAlert(container) {
  if (container) container.innerHTML = "";
}

function setLoading(button, loading) {
  if (!button) return;
  button.disabled = loading;
  if (loading) {
    button.dataset.originalText = button.textContent;
    button.innerHTML = '<span class="spinner"></span>';
  } else if (button.dataset.originalText) {
    button.textContent = button.dataset.originalText;
    delete button.dataset.originalText;
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function initPasswordToggle(inputId, toggleId) {
  const input = document.getElementById(inputId);
  const toggle = document.getElementById(toggleId);
  if (!input || !toggle) return;

  toggle.addEventListener("click", () => {
    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    toggle.textContent = isHidden ? "Hide" : "Show";
    toggle.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
  });
}

function parseYoutubeId(url) {
  if (!url || !String(url).trim()) return null;
  const value = String(url).trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function getYoutubeEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
}

function getExerciseInitials(name) {
  return String(name || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
