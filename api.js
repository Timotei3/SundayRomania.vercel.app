// Sunday Romania - Website API
const API_URL = "https://sundayapi-onrender.onrender.com";

let cachedPlayers = [];
let cachedStaff = [];
let cachedBans = [];

async function getJson(path) {
  const response = await fetch(API_URL + path, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("API error: " + path + " -> " + response.status);
  }

  return response.json();
}

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[char]));
}

/* DASHBOARD */
async function loadDashboardStats() {
  try {
    const data = await getJson("/api/status");

    setText("playersOnlineCount", data.playersOnline ?? 0);
    setText("bannedPlayersCount", data.bannedPlayers ?? 0);
    setText("totalStaffCount", data.totalStaff ?? 0);
    setText("casesCount", data.cases ?? 0);
  } catch (error) {
    console.error("Dashboard error:", error);
  }
}

/* PLAYERS */
async function loadPlayersPage() {
  const container = document.getElementById("playersContainer");
  if (!container) return;

  try {
    cachedPlayers = await getJson("/api/players");
    renderPlayers(cachedPlayers);
  } catch (error) {
    console.error("Players error:", error);

    container.innerHTML = `
      <div class="empty-state">
        <h3>Nu s-au putut încărca jucătorii.</h3>
      </div>
    `;
  }
}

function renderPlayers(players) {
  const container = document.getElementById("playersContainer");
  if (!container) return;

  if (!players.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Nu sunt jucători online.</h3>
      </div>
    `;
    return;
  }

  container.innerHTML = players.map(player => `
    <div class="player-row">
      <div>${escapeHtml(player.id ?? player.user_id ?? "-")}</div>
      <div>${escapeHtml(player.name ?? player.fivemName ?? "Player")}</div>
      <div>${escapeHtml(player.faction ?? player.factiune ?? "Civil")}</div>
      <div>${escapeHtml(player.hours ?? player.ore ?? 0)}</div>
      <div>${escapeHtml(player.ping ?? "-")}</div>
    </div>
  `).join("");
}

/* STAFF */
async function loadStaffPage() {
  const container = document.getElementById("staffContainer");
  if (!container) return;

  try {
    cachedStaff = await getJson("/api/staff");
    renderStaff(cachedStaff);
  } catch (error) {
    console.error("Staff error:", error);

    container.innerHTML = `
      <div class="empty-state">
        <h3>Nu s-a putut încărca staff-ul.</h3>
      </div>
    `;
  }
}

function renderStaff(staff) {
  const container = document.getElementById("staffContainer");
  if (!container) return;

  if (!staff.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Nu există staff afișat.</h3>
      </div>
    `;
    return;
  }

  container.innerHTML = staff.map(member => `
    <div class="staff-row">
      <div>${escapeHtml(member.id ?? member.user_id ?? "-")}</div>
      <div>${escapeHtml(member.name ?? "Staff")}</div>
      <div>${escapeHtml(member.grade ?? member.grad ?? member.level ?? "Staff")}</div>
      <div>${escapeHtml(member.hours ?? member.ore ?? 0)}</div>
      <div>${escapeHtml(member.tickets ?? 0)}</div>
    </div>
  `).join("");
}

/* BANS */
async function loadBansPage() {
  const container = document.getElementById("banContainer");
  if (!container) return;

  try {
    cachedBans = await getJson("/api/bans");
    renderBans(cachedBans);
  } catch (error) {
    console.error("Bans error:", error);

    container.innerHTML = `
      <div class="empty-state">
        <h3>Nu s-au putut încărca banurile.</h3>
      </div>
    `;
  }
}

function renderBans(bans) {
  const container = document.getElementById("banContainer");
  if (!container) return;

  if (!bans.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Nu există banuri afișate.</h3>
      </div>
    `;
    return;
  }

  container.innerHTML = bans.map(ban => {
    const expires = ban.expires ?? ban.expire ?? ban.expiresAt ?? ban.expireAt ?? "Permanent";

    return `
      <div class="ban-row">
        <div>${escapeHtml(ban.id ?? ban.banId ?? "-")}</div>
        <div>${escapeHtml(ban.player ?? ban.name ?? ban.playerName ?? "Jucător")}</div>
        <div>${escapeHtml(ban.admin ?? ban.bannedBy ?? ban.adminName ?? "-")}</div>
        <div>${escapeHtml(ban.reason ?? ban.motiv ?? "-")}</div>
        <div>${escapeHtml(ban.date ?? ban.banDate ?? ban.createdAt ?? "-")}</div>
        <div>${escapeHtml(expires)}</div>
      </div>
    `;
  }).join("");
}

/* SEARCH */
function setupSearchInputs() {
  const playerSearch = document.getElementById("playerSearch");

  if (playerSearch) {
    playerSearch.addEventListener("input", () => {
      const value = playerSearch.value.toLowerCase().trim();

      const filtered = cachedPlayers.filter(player =>
        String(player.id ?? player.user_id ?? "").toLowerCase().includes(value) ||
        String(player.name ?? player.fivemName ?? "").toLowerCase().includes(value) ||
        String(player.faction ?? player.factiune ?? "").toLowerCase().includes(value)
      );

      renderPlayers(value ? filtered : cachedPlayers);
    });
  }

  const staffSearch = document.getElementById("staffSearch");

  if (staffSearch) {
    staffSearch.addEventListener("input", () => {
      const value = staffSearch.value.toLowerCase().trim();

      const filtered = cachedStaff.filter(member =>
        String(member.id ?? member.user_id ?? "").toLowerCase().includes(value) ||
        String(member.name ?? "").toLowerCase().includes(value) ||
        String(member.grade ?? member.grad ?? member.level ?? "").toLowerCase().includes(value)
      );

      renderStaff(value ? filtered : cachedStaff);
    });
  }

  const banSearch = document.getElementById("banSearch");

  if (banSearch) {
    banSearch.addEventListener("input", () => {
      const value = banSearch.value.toLowerCase().trim();

      const filtered = cachedBans.filter(ban =>
        String(ban.id ?? ban.banId ?? "").toLowerCase().includes(value) ||
        String(ban.player ?? ban.name ?? ban.playerName ?? "").toLowerCase().includes(value) ||
        String(ban.admin ?? ban.bannedBy ?? ban.adminName ?? "").toLowerCase().includes(value) ||
        String(ban.reason ?? ban.motiv ?? "").toLowerCase().includes(value)
      );

      renderBans(value ? filtered : cachedBans);
    });
  }
}

/* AUTO REFRESH */
async function refreshAllApiData() {
  await Promise.allSettled([
    loadDashboardStats(),
    loadPlayersPage(),
    loadStaffPage(),
    loadBansPage()
  ]);
}

document.addEventListener("DOMContentLoaded", () => {
  setupSearchInputs();
  refreshAllApiData();

  setInterval(refreshAllApiData, 30000);
});
