/*This class was created using Generative AI*/

// ─── Path Helper ───────────────────────────────────────────────────────────
// Figures out whether we're at root (index.html) or inside /src/
// so all redirects work no matter which page calls them.
function toRoot(path) {
  const inSrc = window.location.pathname.includes("/src/");
  return inSrc ? "../" + path : path;
}

function toSrc(path) {
  const inSrc = window.location.pathname.includes("/src/");
  return inSrc ? path : "src/" + path;
}


// ─── Hardcoded User Database ───────────────────────────────────────────────
const USERS = [
  {
    id: "u1",
    username: "Alexa",
    password: "gogreen",
    city: "Las Pinas",
    displayName: "Mahal Alexa",
    joinDate: "2024-01-15",
    history: [
      { id: "s1", item: "Plastic Bottle",    emoji: "🍶", date: "2025-03-25", time: "09:12 AM" },
      { id: "s2", item: "Paper Cup",         emoji: "☕", date: "2025-03-26", time: "02:30 PM" },
      { id: "s3", item: "Snack Wrapper",     emoji: "🍟", date: "2025-03-27", time: "11:00 AM" },
      { id: "s4", item: "Paper Container",   emoji: "🗂️", date: "2025-03-27", time: "03:45 PM" },
      { id: "s5", item: "Plastic Bottle",    emoji: "🍶", date: "2025-03-28", time: "08:00 AM" },
    ],
  },
  {
    id: "u2",
    username: "Julie",
    password: "gogreen",
    city: "Laguna",
    displayName: "Jhoong Gi",
    joinDate: "2024-02-10",
    history: [
      { id: "s1", item: "Paper Cup",       emoji: "☕", date: "2025-03-22", time: "01:30 PM" },
      { id: "s2", item: "Plastic Bottle",  emoji: "🍶", date: "2025-03-24", time: "09:00 AM" },
      { id: "s3", item: "Napkin",         emoji: "🧻", date: "2025-03-24", time: "01:15 PM" },
    ],
  },
  {
    id: "u3",
    username: "Magi",
    password: "gogreen",
    city: "Muntinlupa",
    displayName: "Magi Sarap",
    joinDate: "2024-03-05",
    history: [
      { id: "s1", item: "Snack Wrapper",    emoji: "🍟", date: "2025-03-21", time: "12:00 PM" },
      { id: "s2", item: "Paper Container",  emoji: "🗂️", date: "2025-03-23", time: "02:00 PM" },
      { id: "s3", item: "Paper Cup",        emoji: "☕", date: "2025-03-25", time: "04:00 PM" },
      { id: "s4", item: "Plastic Bottle",   emoji: "🍶", date: "2025-03-26", time: "08:30 AM" },
    ],
  },
];

// ─── Auth Helpers ──────────────────────────────────────────────────────────

function attemptLogin(username, city, password) {
  const u = USERS.find(
    u =>
      u.username.toLowerCase() === username.trim().toLowerCase() &&
      u.city.toLowerCase()     === city.trim().toLowerCase()     &&
      u.password               === password
  );
  if (!u) return { success: false, error: "Invalid username, city, or password." };
  sessionStorage.setItem("currentUserId",   u.id);
  sessionStorage.setItem("currentUserName", u.displayName);
  return { success: true, user: u };
}

function getCurrentUser() {
  const id = sessionStorage.getItem("currentUserId");
  if (!id) return null;
  return USERS.find(u => u.id === id) || null;
}

function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = toSrc("login.html");  // always points to src/login.html
    return null;
  }
  return user;
}

function logout() {
  sessionStorage.clear();
  window.location.href = toSrc("login.html");    // always points to src/login.html
}

// ─── Persistence Layer ─────────────────────────────────────────────────────
// Loads any session-saved history overrides on top of the hardcoded USERS
function loadSessionHistory() {
  USERS.forEach(u => {
    const saved = sessionStorage.getItem("history_" + u.id);
    if (saved) u.history = JSON.parse(saved);
  });
}

function saveUserHistory(user) {
  sessionStorage.setItem("history_" + user.id, JSON.stringify(user.history));
}

// Call immediately so all pages see the latest history
loadSessionHistory();

// ─── Updated addScannedItem ────────────────────────────────────────────────
function addScannedItem(user, itemName, emoji) {
  const now  = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const newEntry = { id: "s" + Date.now(), item: itemName, emoji, date, time };
  user.history.push(newEntry);
  saveUserHistory(user);   // ← persist to sessionStorage
  return newEntry;
}

function getItemCounts(user) {
  const counts = {};
  user.history.forEach(h => { counts[h.item] = (counts[h.item] || 0) + 1; });
  return counts;
}

function getAllUsers() { return USERS; }

// ─── Login Page Handler ────────────────────────────────────────────────────
function handleLogin() {
  const username = document.getElementById("username")?.value || "";
  const city     = document.getElementById("city")?.value     || "";
  const password = document.getElementById("password")?.value || "";
  const errorEl  = document.getElementById("login-error");

  const result = attemptLogin(username, city, password);
  if (!result.success) {
    if (errorEl) { errorEl.textContent = result.error; errorEl.classList.add("visible"); }
    return;
  }

  window.location.href = toSrc("history.html");  // always points to src/history.html
}