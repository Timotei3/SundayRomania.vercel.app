// Pune fisierul acesta in website ca api.js si schimba linkul cu linkul tau de Render.
const API_URL = 'https://LINKUL-TAU-RENDER.onrender.com';

async function getJson(path) {
  const res = await fetch(API_URL + path, { cache: 'no-store' });
  if (!res.ok) throw new Error('API error ' + path);
  return res.json();
}

async function loadDashboardStats() {
  const data = await getJson('/api/status');
  setText('playersOnlineCount', data.playersOnline ?? 0);
  setText('bannedPlayersCount', data.bannedPlayers ?? 0);
  setText('totalStaffCount', data.totalStaff ?? 0);
  setText('casesCount', data.cases ?? 0);
}

async function loadPlayersPage() {
  const players = await getJson('/api/players');
  const box = document.getElementById('playersList');
  if (!box) return;
  box.innerHTML = players.map(p => `
    <tr>
      <td>${escapeHtml(p.id ?? '-')}</td>
      <td>${escapeHtml(p.name ?? '-')}</td>
      <td>${escapeHtml(p.ping ?? '-')}</td>
      <td><span class="online">Online</span></td>
    </tr>
  `).join('');
}

async function loadStaffPage() {
  const staff = await getJson('/api/staff');
  const box = document.getElementById('staffList');
  if (!box) return;
  box.innerHTML = staff.map(s => `
    <tr>
      <td>${escapeHtml(s.name ?? '-')}</td>
      <td>${escapeHtml(s.level ?? '-')}</td>
      <td>${s.online ? '<span class="online">Online</span>' : '<span class="offline">Offline</span>'}</td>
    </tr>
  `).join('');
}

async function loadBansPage() {
  const bans = await getJson('/api/bans');
  const box = document.getElementById('bansList');
  if (!box) return;
  box.innerHTML = bans.map(b => `
    <tr>
      <td>${escapeHtml(b.name ?? '-')}</td>
      <td>${escapeHtml(b.reason ?? '-')}</td>
      <td>${escapeHtml(b.bannedBy ?? '-')}</td>
      <td>${escapeHtml(b.date ?? '-')}</td>
    </tr>
  `).join('');
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[c]));
}

document.addEventListener('DOMContentLoaded', () => {
  loadDashboardStats().catch(() => {});
  loadPlayersPage().catch(() => {});
  loadStaffPage().catch(() => {});
  loadBansPage().catch(() => {});
});
