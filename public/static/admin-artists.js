// Admin Artists Page — /admin/artists

// ── Axios setup ───────────────────────────────────────────────
axios.defaults.withCredentials = true;
axios.interceptors.request.use(function (config) {
  const sid =
    localStorage.getItem('admin_session_id') ||
    localStorage.getItem('session_id') ||
    sessionStorage.getItem('session_id');
  if (sid) config.headers['X-Session-ID'] = sid;
  return config;
});

// ── State ─────────────────────────────────────────────────────
let allArtists  = [];   // raw data from API
let filtered    = [];   // after search/filter
let sortField   = 'created_at';
let sortDir     = 'desc';
const PAGE_SIZE = 20;
let currentPage = 1;

// ── Init ──────────────────────────────────────────────────────
async function init() {
  try {
    // Guard: only admins can access this page
    await axios.get('/api/admin/stats');
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      window.location.href = '/admin/login';
      return;
    }
  }

  await loadArtists();
}

async function loadArtists() {
  try {
    const res = await axios.get('/api/admin/artists');
    allArtists = res.data || [];
    applyFilterAndSort();
    renderStats();
    renderTable();
    document.getElementById('auth-status').textContent =
      'Admin autenticado ✓';
  } catch (err) {
    document.getElementById('artistsTableBody').innerHTML = `
      <tr><td colspan="8" style="padding:40px;text-align:center;color:#f87171;">
        <i class="fas fa-exclamation-triangle mr-2"></i>
        Erro ao carregar artistas. Verifique sua sessão.
      </td></tr>`;
    if (err.response?.status === 401 || err.response?.status === 403) {
      window.location.href = '/admin/login';
    }
  }
}

// ── Filtering & Sorting ───────────────────────────────────────
function applyFilterAndSort() {
  const search = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  const status = document.getElementById('statusFilter')?.value || '';

  filtered = allArtists.filter(a => {
    const name = (a.name || a.full_name || '').toLowerCase();
    const slug = (a.slug || '').toLowerCase();
    const matchSearch = !search || name.includes(search) || slug.includes(search);
    const matchStatus = !status || a.license_status === status;
    return matchSearch && matchStatus;
  });

  filtered.sort((a, b) => {
    let va = a[sortField];
    let vb = b[sortField];

    // Numeric fields
    if (sortField === 'song_count' || sortField === 'request_count') {
      va = Number(va) || 0;
      vb = Number(vb) || 0;
      return sortDir === 'asc' ? va - vb : vb - va;
    }

    // Date fields
    if (sortField === 'created_at' || sortField === 'license_paid_date') {
      va = va ? new Date(va).getTime() : 0;
      vb = vb ? new Date(vb).getTime() : 0;
      return sortDir === 'asc' ? va - vb : vb - va;
    }

    // String fields
    va = (va || '').toString().toLowerCase();
    vb = (vb || '').toString().toLowerCase();
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ?  1 : -1;
    return 0;
  });

  currentPage = 1;
  updateSortIcons();
}

function sortBy(field) {
  if (sortField === field) {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    sortField = field;
    sortDir = field === 'created_at' ? 'desc' : 'asc';
  }
  applyFilterAndSort();
  renderTable();
}

function filterArtists() {
  applyFilterAndSort();
  renderTable();
}

function updateSortIcons() {
  const fields = ['name','slug','license_status','license_paid_date','song_count','request_count','created_at'];
  fields.forEach(f => {
    const el = document.getElementById('sort-' + f);
    if (!el) return;
    if (f === sortField) {
      el.className = sortDir === 'asc'
        ? 'fas fa-sort-up ml-1 text-purple-400'
        : 'fas fa-sort-down ml-1 text-purple-400';
    } else {
      el.className = 'fas fa-sort ml-1 text-gray-500';
    }
  });
}

// ── Rendering ─────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return '-';
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '-';
    return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (e) { return '-'; }
}

function statusBadge(status) {
  const map = {
    approved: ['badge-approved', '✅ Aprovado'],
    paid:     ['badge-paid',     '⏳ Pago'],
    pending:  ['badge-pending',  '🕐 Pendente'],
    rejected: ['badge-rejected', '🔴 Rejeitado'],
  };
  const [cls, label] = map[status] || ['badge-pending', status || 'N/A'];
  return `<span class="${cls}" style="padding:3px 10px;border-radius:9999px;font-size:0.75rem;font-weight:600;">${label}</span>`;
}

function renderStats() {
  const total    = allArtists.length;
  const approved = allArtists.filter(a => a.license_status === 'approved').length;
  const pending  = allArtists.filter(a => a.license_status === 'pending').length;
  const paid     = allArtists.filter(a => a.license_status === 'paid').length;
  const totalSongs = allArtists.reduce((s, a) => s + (Number(a.song_count) || 0), 0);
  const totalReqs  = allArtists.reduce((s, a) => s + (Number(a.request_count) || 0), 0);

  const cards = [
    { label: 'Total', value: total,    color: '#7c3aed', icon: 'fa-guitar' },
    { label: 'Aprovados', value: approved, color: '#16a34a', icon: 'fa-check-circle' },
    { label: 'Pagos',  value: paid,    color: '#ca8a04', icon: 'fa-clock' },
    { label: 'Pendentes', value: pending, color: '#6b7280', icon: 'fa-hourglass-half' },
    { label: 'Músicas',   value: totalSongs, color: '#2563eb', icon: 'fa-music' },
    { label: 'Pedidos',   value: totalReqs,  color: '#9333ea', icon: 'fa-list' },
  ];

  document.getElementById('statsCards').innerHTML = cards.map(c => `
    <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:16px;display:flex;align-items:center;gap:12px;">
      <div style="background:${c.color}33;border-radius:8px;padding:10px;flex-shrink:0;">
        <i class="fas ${c.icon}" style="font-size:1.2rem;color:${c.color};"></i>
      </div>
      <div>
        <p style="font-size:1.5rem;font-weight:700;margin:0;">${c.value}</p>
        <p style="font-size:0.8rem;color:#9ca3af;margin:0;">${c.label}</p>
      </div>
    </div>
  `).join('');

  document.getElementById('subtitle').textContent =
    `${total} artista${total !== 1 ? 's' : ''} cadastrado${total !== 1 ? 's' : ''}, ordenados por data de cadastro (mais recentes primeiro)`;
}

function renderTable() {
  const tbody = document.getElementById('artistsTableBody');
  if (!filtered.length) {
    tbody.innerHTML = `
      <tr><td colspan="8" style="padding:48px;text-align:center;color:#9ca3af;">
        <i class="fas fa-search mr-2"></i>Nenhum artista encontrado com os filtros selecionados.
      </td></tr>`;
    updatePagination(0);
    return;
  }

  const start = (currentPage - 1) * PAGE_SIZE;
  const page  = filtered.slice(start, start + PAGE_SIZE);

  tbody.innerHTML = page.map(a => {
    const name    = a.name || a.full_name || '-';
    const slug    = a.slug || '-';
    const licDate = formatDate(a.license_paid_date || a.license_approved_date);
    const songs   = a.song_count  !== undefined ? a.song_count  : '-';
    const reqs    = a.request_count !== undefined ? a.request_count : '-';
    const created = formatDate(a.created_at);
    const dashLink = slug !== '-'
      ? `<a href="/dashboard/${slug}" target="_blank"
           style="color:#a78bfa;font-size:0.8rem;text-decoration:none;margin-right:6px;"
           title="Dashboard do artista">
           <i class="fas fa-tachometer-alt mr-1"></i>Dashboard
         </a>`
      : '';
    const profileLink = slug !== '-'
      ? `<a href="/${slug}" target="_blank"
           style="color:#60a5fa;font-size:0.8rem;text-decoration:none;"
           title="Página pública">
           <i class="fas fa-external-link-alt mr-1"></i>Perfil
         </a>`
      : '';

    return `
      <tr class="table-row" style="border-top:1px solid rgba(255,255,255,0.06);transition:background 0.15s;">
        <td style="padding:12px 16px;font-weight:600;">${name}</td>
        <td style="padding:12px 16px;font-family:monospace;font-size:0.85rem;color:#d1d5db;">${slug}</td>
        <td style="padding:12px 16px;">${statusBadge(a.license_status)}</td>
        <td style="padding:12px 16px;font-size:0.85rem;color:#d1d5db;">${licDate}</td>
        <td style="padding:12px 16px;text-align:center;">
          <span style="background:rgba(37,99,235,0.2);color:#93c5fd;padding:3px 10px;border-radius:9999px;font-size:0.8rem;font-weight:600;">${songs}</span>
        </td>
        <td style="padding:12px 16px;text-align:center;">
          <span style="background:rgba(147,51,234,0.2);color:#c084fc;padding:3px 10px;border-radius:9999px;font-size:0.8rem;font-weight:600;">${reqs}</span>
        </td>
        <td style="padding:12px 16px;font-size:0.82rem;color:#9ca3af;">${created}</td>
        <td style="padding:12px 16px;white-space:nowrap;">${dashLink}${profileLink}</td>
      </tr>
    `;
  }).join('');

  updatePagination(filtered.length);
}

function updatePagination(total) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = Math.min((currentPage - 1) * PAGE_SIZE + 1, total);
  const end   = Math.min(currentPage * PAGE_SIZE, total);

  document.getElementById('paginationInfo').textContent =
    total === 0 ? 'Nenhum resultado' : `Exibindo ${start}–${end} de ${total}`;

  const btns = document.getElementById('paginationButtons');
  if (totalPages <= 1) { btns.innerHTML = ''; return; }

  btns.innerHTML = [
    `<button onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}
       style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:6px;padding:6px 12px;color:white;cursor:pointer;${currentPage === 1 ? 'opacity:0.4;cursor:not-allowed;' : ''}">
       <i class="fas fa-chevron-left"></i>
     </button>`,
    ...Array.from({ length: totalPages }, (_, i) => i + 1)
       .filter(p => Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPages)
       .reduce((acc, p, idx, arr) => {
         if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
         acc.push(p);
         return acc;
       }, [])
       .map(p => p === '…'
         ? `<span style="padding:6px 8px;color:#9ca3af;">…</span>`
         : `<button onclick="goToPage(${p})"
              style="background:${p === currentPage ? '#7c3aed' : 'rgba(255,255,255,0.1)'};border:1px solid ${p === currentPage ? '#7c3aed' : 'rgba(255,255,255,0.2)'};border-radius:6px;padding:6px 12px;color:white;cursor:pointer;">
              ${p}
            </button>`
       ),
    `<button onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}
       style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:6px;padding:6px 12px;color:white;cursor:pointer;${currentPage === totalPages ? 'opacity:0.4;cursor:not-allowed;' : ''}">
       <i class="fas fa-chevron-right"></i>
     </button>`,
  ].join('');
}

function goToPage(p) {
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  if (p < 1 || p > totalPages) return;
  currentPage = p;
  renderTable();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Boot ──────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
