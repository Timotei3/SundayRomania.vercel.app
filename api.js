// Sunday Romania API connector
// 1) Dupa ce faci deploy pe Render, schimba linkul de mai jos cu linkul tau real.
const API_URL = "https://sundayapi-onrender.onrender.com";

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
  const container = document.getElementById("playersContainer");
  if (!container) return;

  if (!players.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Nu sunt jucători online</h3>
        <p>Lista se actualizează automat din server.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = players.map(p => `
    <div class="player-row">
      <div class="player-id">#${escapeHtml(p.id ?? p.user_id ?? "-")}</div>
      <div class="player-name">${escapeHtml(p.name || p.fivemName || "Player")}</div>
      <div class="player-faction">${escapeHtml(p.faction || p.factiune || "Civil")}</div>
      <div class="player-hours">${escapeHtml(p.hours ?? p.ore ?? 0)} ore</div>
    </div>
  `).join("");
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
    container.innerHTML = `<section class="staff-rank"><h2>Staff Online</h2><p>Nu există staff online.</p></section>`;
    return;
  }

  const groups = {};
  staff.forEach(s => {
    const grad = s.grad || s.level || "Staff";
    if (!groups[grad]) groups[grad] = [];
    groups[grad].push(s);
  });

  container.innerHTML = Object.entries(groups).map(([grad, members]) => `
    <section class="staff-rank">
      <h2>${escapeHtml(grad)} <span>${members.length}</span></h2>

      <div class="staff-table">
        ${members.map(s => `
          <div class="staff-row">
            <div class="staff-id">#${escapeHtml(s.id ?? s.user_id ?? "-")}</div>
            <div class="staff-name">${escapeHtml(s.name || "Staff")}</div>
            <div class="staff-grad">${escapeHtml(s.grad || s.level || grad)}</div>
            <div class="staff-hours">${escapeHtml(s.hours ?? s.ore ?? 0)} ore</div>
            <div class="staff-tickets">${escapeHtml(s.tickets ?? 0)} tickete</div>
          </div>
        `).join("")}
      </div>
    </section>
  `).join("");
async function loadBansPage() {
  const bans = await getJson("/api/bans");
  const container = document.getElementById("banContainer") || document.getElementById("bansList");
  if (!container) return;

  if (!bans.length) {
    container.innerHTML = `
      <section class="bans-box">
        <p>Nu există jucători banați.</p>
      </section>
    `;
    return;
  }

  container.innerHTML = `
    <section class="bans-box">
      <div class="bans-table">
        <div class="bans-head">
          <div>ID</div>
          <div>JUCĂTOR</div>
          <div>ADMIN</div>
          <div>MOTIV</div>
          <div>DATA BAN</div>
          <div>EXPIRĂ LA</div>
        </div>

        ${bans.map(b => {
          const expire = b.expires || b.expire || b.expireAt || b.expiresAt || "-";
          const isPermanent = b.permanent === true || String(expire).toUpperCase() === "PERMANENT";

          return `
            <div class="bans-row">
              <div class="ban-id">#${escapeHtml(b.id ?? b.banId ?? "-")}</div>
              <div class="ban-player">${escapeHtml(b.name || b.player || b.playerName || "Jucător")}</div>
              <div class="ban-admin">${escapeHtml(b.admin || b.bannedBy || b.adminName || "-")}</div>
              <div class="ban-reason">${escapeHtml(b.reason || b.motiv || "-")}</div>
              <div class="ban-date">${escapeHtml(b.date || b.banDate || b.createdAt || "-")}</div>
              <div class="ban-expire">
                ${isPermanent ? `<span class="permanent">PERMANENT</span>` : escapeHtml(expire)}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </section>
  `;
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
