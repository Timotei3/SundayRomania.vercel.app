// Sunday Romania API connector
// 1) Dupa ce faci deploy pe Render, schimba linkul de mai jos cu linkul tau real.
const API_URL = "https://LINKUL-TAU-RENDER.onrender.com";

async function getJson(path) {
  const res = await fetch(API_URL + path, { cache: "no-store" });
  if (!res.ok) throw new Error("API error " + path + " -> " + res.status);
  return res.json();
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[c]));
}

async function loadDashboardStats() {
  const data = await getJson("/api/status");
  setText("playersOnlineCount", data.playersOnline ?? 0);
  setText("bannedPlayersCount", data.bannedPlayers ?? 0);
  setText("totalStaffCount", data.totalStaff ?? 0);
  setText("casesCount", data.cases ?? 0);
}

async function loadPlayersPage() {
  const players = await getJson("/api/players");
  const container = document.getElementById("playersContainer") || document.getElementById("playersList");
  if (!container) return;

  if (!players.length) {
    container.innerHTML = `<div class="empty-state"><div class="icon">👥</div><h3>Nu sunt jucători online</h3><p>Lista se actualizează automat din server.</p></div>`;
    return;
  }

  container.innerHTML = players.map(p => `
    <div class="player-card">
      <h3>${escapeHtml(p.name || "Player")}</h3>
      <p>ID: ${escapeHtml(p.id ?? "-")}</p>
      <p>Ping: ${escapeHtml(p.ping ?? "-")}</p>
      <p>Status: <span class="online">Online</span></p>
    </div>
  `).join("");
}

async function loadStaffPage() {
  const staff = await getJson("/api/staff");
  const container = document.getElementById("staffContainer") || document.getElementById("staffList");
  if (!container) return;

  if (!staff.length) {
    container.innerHTML = `<section class="staff-rank"><h2>Staff</h2><p>Nu există staff configurat.</p></section>`;
    return;
  }

  const groups = {};
  staff.forEach(s => {
    const level = s.level || "Staff";
    if (!groups[level]) groups[level] = [];
    groups[level].push(s);
  });

  container.innerHTML = Object.entries(groups).map(([level, members]) => `
    <section class="staff-rank">
      <h2>${escapeHtml(level)}</h2>
      <div class="staff-list">
        ${members.map(s => `
          <div class="staff-member">
            <h3>${escapeHtml(s.name || "Staff")}</h3>
            <p>Grad: ${escapeHtml(s.level || level)}</p>
            <p>Status: ${s.online ? '<span class="online">Online</span>' : '<span class="offline">Offline</span>'}</p>
          </div>
        `).join("")}
      </div>
    </section>
  `).join("");
}

async function loadBansPage() {
  const bans = await getJson("/api/bans");
  const container = document.getElementById("banContainer") || document.getElementById("bansList");
  if (!container) return;

  if (!bans.length) {
    container.innerHTML = `<div class="empty-state"><div class="icon">✅</div><h3>Nu există jucători banați</h3><p>Lista se actualizează automat din API.</p></div>`;
    return;
  }

  container.innerHTML = bans.map(b => `
    <div class="ban-card">
      <h3>${escapeHtml(b.name || "Jucător")}</h3>
      <p>Motiv: ${escapeHtml(b.reason || "-")}</p>
      <p>Banat de: ${escapeHtml(b.bannedBy || "-")}</p>
      <p>Data: ${escapeHtml(b.date || "-")}</p>
      <p>Status: <span class="ban-status">Banat</span></p>
    </div>
  `).join("");
}

async function refreshAllApiData() {
  await Promise.allSettled([
    loadDashboardStats(),
    loadPlayersPage(),
    loadStaffPage(),
    loadBansPage()
  ]);
}

document.addEventListener("DOMContentLoaded", () => {
  refreshAllApiData();
  setInterval(refreshAllApiData, 30000);
});
