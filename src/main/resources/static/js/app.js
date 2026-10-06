/**
 * NanaLola Cozy Tracker - Main Application Logic
 * Multi-user, Navigation (Home, Library, Profile), Chapter Goals & Statistics
 */

let state = {
  token: localStorage.getItem('nanalola_token') || null,
  currentUser: null,
  currentProfile: null,
  currentView: 'HOME',
  activeProjects: [],
  libraryData: [],
  currentGoalStats: null,
  deferredPrompt: null
};

// Curated Vintage Avatar Presets (Palette: #7A3F33, #B07A63, #E8D6C8, #2E2A28, #FAF6F0)
const AVATAR_PRESETS = [
  {
    id: 'quill',
    name: 'Quill & Ink',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#F4ECE1" stroke="#B07A63" stroke-width="3"/><path d="M30 72 L36 58 L64 58 L70 72 Z" fill="#2E2A28"/><rect x="42" y="52" width="16" height="6" rx="2" fill="#7A3F33"/><ellipse cx="50" cy="52" rx="7" ry="2" fill="#FAF6F0" opacity="0.3"/><path d="M47 54 Q42 36 68 18 Q60 30 52 46 Z" fill="#7A3F33"/><path d="M48 54 Q56 36 68 18" stroke="#C28B38" stroke-width="1.5" fill="none"/><polygon points="46,55 52,55 49,63" fill="#C28B38"/><circle cx="49" cy="67" r="1.5" fill="#2E2A28"/></svg>`
  },
  {
    id: 'coffee',
    name: 'Porcelain Cup',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#FAF6F0" stroke="#B07A63" stroke-width="3"/><ellipse cx="50" cy="74" rx="30" ry="6" fill="#7A3F33"/><ellipse cx="50" cy="73" rx="26" ry="4" fill="#B07A63"/><path d="M64 48 C76 48 76 64 64 64" fill="none" stroke="#B07A63" stroke-width="4" stroke-linecap="round"/><path d="M30 42 L34 68 Q50 72 66 68 L70 42 Z" fill="#E8D6C8" stroke="#7A3F33" stroke-width="2"/><ellipse cx="50" cy="42" rx="20" ry="5" fill="#2E2A28"/><path d="M50 43 C48 40 44 41 44 43 C44 45 50 46.5 50 46.5 C50 46.5 56 45 56 43 C56 41 52 40 50 43 Z" fill="#FAF6F0"/><path d="M42 34 Q39 26 43 20" fill="none" stroke="#B07A63" stroke-width="2" stroke-linecap="round" opacity="0.6"/><path d="M50 32 Q54 24 50 16" fill="none" stroke="#7A3F33" stroke-width="2" stroke-linecap="round" opacity="0.8"/><path d="M58 34 Q55 26 59 20" fill="none" stroke="#B07A63" stroke-width="2" stroke-linecap="round" opacity="0.6"/></svg>`
  },
  {
    id: 'typewriter',
    name: 'Typewriter',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#F4ECE1" stroke="#B07A63" stroke-width="3"/><rect x="36" y="20" width="28" height="26" rx="1" fill="#FAF6F0" stroke="#AFA6A0" stroke-width="1"/><line x1="40" y1="26" x2="60" y2="26" stroke="#B07A63" stroke-width="1"/><line x1="40" y1="31" x2="56" y2="31" stroke="#B07A63" stroke-width="1"/><line x1="40" y1="36" x2="60" y2="36" stroke="#B07A63" stroke-width="1"/><rect x="26" y="42" width="48" height="8" rx="3" fill="#7A3F33"/><circle cx="25" cy="46" r="3" fill="#C28B38"/><circle cx="75" cy="46" r="3" fill="#C28B38"/><path d="M22 52 L26 76 L74 76 L78 52 Z" fill="#2E2A28"/><rect x="30" y="58" width="40" height="14" rx="2" fill="#3D3734"/><circle cx="36" cy="62" r="2" fill="#E8D6C8"/><circle cx="43" cy="62" r="2" fill="#E8D6C8"/><circle cx="50" cy="62" r="2" fill="#E8D6C8"/><circle cx="57" cy="62" r="2" fill="#E8D6C8"/><circle cx="64" cy="62" r="2" fill="#E8D6C8"/><circle cx="39" cy="68" r="2" fill="#C28B38"/><circle cx="46" cy="68" r="2" fill="#C28B38"/><circle cx="53" cy="68" r="2" fill="#C28B38"/><circle cx="60" cy="68" r="2" fill="#C28B38"/></svg>`
  },
  {
    id: 'book',
    name: 'Gilded Tome',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#FAF6F0" stroke="#B07A63" stroke-width="3"/><rect x="28" y="24" width="44" height="54" rx="3" fill="#7A3F33" stroke="#5C2C24" stroke-width="1.5"/><rect x="28" y="24" width="7" height="54" rx="1" fill="#5C2C24"/><rect x="39" y="28" width="30" height="46" rx="2" fill="none" stroke="#C28B38" stroke-width="1.5" stroke-dasharray="2 1"/><polygon points="54,46 58,52 54,58 50,52" fill="#C28B38"/><path d="M51 24 L51 40 L54 36 L57 40 L57 24" fill="#C28B38"/><rect x="69" y="27" width="4" height="48" fill="#E8D6C8"/></svg>`
  },
  {
    id: 'cat',
    name: 'Literary Cat',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#F4ECE1" stroke="#B07A63" stroke-width="3"/><rect x="22" y="68" width="56" height="10" rx="2" fill="#7A3F33"/><rect x="74" y="70" width="3" height="6" fill="#E8D6C8"/><rect x="26" y="58" width="48" height="10" rx="2" fill="#B07A63"/><rect x="70" y="60" width="3" height="6" fill="#E8D6C8"/><ellipse cx="48" cy="48" rx="18" ry="12" fill="#E8D6C8" stroke="#7A3F33" stroke-width="1.5"/><circle cx="34" cy="44" r="9" fill="#E8D6C8" stroke="#7A3F33" stroke-width="1.5"/><polygon points="27,38 31,31 35,37" fill="#7A3F33"/><polygon points="34,36 39,30 41,37" fill="#7A3F33"/><path d="M30 45 Q33 48 36 45" fill="none" stroke="#2E2A28" stroke-width="1.2" stroke-linecap="round"/><path d="M64 52 Q68 46 64 42" fill="none" stroke="#7A3F33" stroke-width="3" stroke-linecap="round"/></svg>`
  },
  {
    id: 'spectacles',
    name: 'Spectacles',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#FAF6F0" stroke="#B07A63" stroke-width="3"/><g transform="rotate(-6 50 50)"><rect x="24" y="24" width="52" height="52" rx="2" fill="#F4ECE1" stroke="#D9C5B4" stroke-width="1.5"/><line x1="30" y1="34" x2="70" y2="34" stroke="#AFA6A0" stroke-width="1.2"/><line x1="30" y1="42" x2="66" y2="42" stroke="#AFA6A0" stroke-width="1.2"/><line x1="30" y1="50" x2="70" y2="50" stroke="#AFA6A0" stroke-width="1.2"/><line x1="30" y1="58" x2="58" y2="58" stroke="#AFA6A0" stroke-width="1.2"/></g><g transform="rotate(8 50 50)"><circle cx="40" cy="50" r="10" fill="none" stroke="#C28B38" stroke-width="2.5"/><circle cx="60" cy="50" r="10" fill="none" stroke="#C28B38" stroke-width="2.5"/><path d="M49 48 Q50 46 51 48" fill="none" stroke="#C28B38" stroke-width="2.5"/><path d="M30 50 L20 46" fill="none" stroke="#C28B38" stroke-width="2" stroke-linecap="round"/><path d="M70 50 L80 46" fill="none" stroke="#C28B38" stroke-width="2" stroke-linecap="round"/></g></svg>`
  },
  {
    id: 'seal',
    name: 'Wax Seal',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#F4ECE1" stroke="#B07A63" stroke-width="3"/><circle cx="50" cy="50" r="32" fill="#7A3F33"/><circle cx="50" cy="50" r="27" fill="#663228"/><circle cx="50" cy="50" r="25" fill="none" stroke="#C28B38" stroke-width="1.5" stroke-dasharray="3 1.5"/><path d="M48 35 Q44 48 55 58 Q50 51 51 35 Z" fill="#C28B38"/><circle cx="50" cy="62" r="2" fill="#C28B38"/><path d="M39 50 Q43 56 46 50" fill="none" stroke="#C28B38" stroke-width="1.5" stroke-linecap="round"/><path d="M54 50 Q57 56 61 50" fill="none" stroke="#C28B38" stroke-width="1.5" stroke-linecap="round"/></svg>`
  },
  {
    id: 'candle',
    name: 'Night Candle',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#2E2A28" stroke="#7A3F33" stroke-width="3"/><ellipse cx="50" cy="74" rx="22" ry="6" fill="#C28B38"/><path d="M44 74 L46 62 L54 62 L56 74 Z" fill="#B07A63"/><path d="M66 70 C74 70 74 76 66 76" fill="none" stroke="#C28B38" stroke-width="3" stroke-linecap="round"/><rect x="46" y="38" width="8" height="24" rx="2" fill="#FAF6F0"/><path d="M46 42 Q45 46 46 48" fill="none" stroke="#E8D6C8" stroke-width="1.5"/><line x1="50" y1="38" x2="50" y2="33" stroke="#2E2A28" stroke-width="1.5"/><circle cx="50" cy="27" r="14" fill="#C28B38" opacity="0.25"/><path d="M50 18 Q55 26 50 32 Q45 26 50 18 Z" fill="#C28B38"/><path d="M50 23 Q52 27 50 30 Q48 27 50 23 Z" fill="#FAF6F0"/></svg>`
  }
];

function getPresetDataUrl(svg) {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function updateNavProfile(user) {
  const avatarImg = document.getElementById('navAvatarImg');
  const nameSpan = document.getElementById('navProfileName');
  const defaultUrl = getPresetDataUrl(AVATAR_PRESETS[0].svg);
  if (avatarImg) {
    avatarImg.src = (user && user.avatarUrl) ? user.avatarUrl : defaultUrl;
  }
  if (nameSpan) {
    nameSpan.textContent = (user && (user.displayName || user.username)) ? (user.displayName || user.username) : 'Profile';
  }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  initPwa();
  initFormListeners();
  checkAuth();
});

// PWA
function initPwa() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      reg.update();
    }).catch(err => console.log('SW error:', err));
  }
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    state.deferredPrompt = e;
    const btn = document.getElementById('btnInstallApp');
    if (btn) btn.style.display = 'inline-flex';
  });
  document.getElementById('btnInstallApp')?.addEventListener('click', () => {
    if (state.deferredPrompt) {
      state.deferredPrompt.prompt();
      state.deferredPrompt = null;
      document.getElementById('btnInstallApp').style.display = 'none';
    }
  });
}

// ==========================================================================
// AUTENTICAÇÃO
// ==========================================================================
async function checkAuth() {
  if (!state.token) {
    showAuthView();
    return;
  }

  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });

    if (res.ok) {
      state.currentUser = await res.json();
      showMainApp();
      loadUserProfile();
      navigateTo('HOME');
    } else {
      handleLogout();
    }
  } catch (err) {
    console.error('Erro de autenticação:', err);
    showAuthView();
  }
}

function showAuthView() {
  document.getElementById('viewAuth').style.display = 'block';
  document.getElementById('mainAppWrapper').style.display = 'none';
}

function showMainApp() {
  document.getElementById('viewAuth').style.display = 'none';
  document.getElementById('mainAppWrapper').style.display = 'block';

  const name = state.currentUser?.displayName || state.currentUser?.username || 'Writer';
  document.getElementById('homeGreetingTitle').textContent = `Welcome, ${name}!`;
  updateNavProfile(state.currentUser);
}

function switchAuthTab(tab) {
  const isLogin = tab === 'LOGIN';
  document.getElementById('tabBtnLogin').classList.toggle('active', isLogin);
  document.getElementById('tabBtnRegister').classList.toggle('active', !isLogin);
  document.getElementById('formLogin').style.display = isLogin ? 'block' : 'none';
  document.getElementById('formRegister').style.display = isLogin ? 'none' : 'block';
}

function handleLogout() {
  localStorage.removeItem('nanalola_token');
  state.token = null;
  state.currentUser = null;
  updateNavProfile(null);
  showAuthView();
}

// ==========================================================================
// VIEW NAVIGATION
// ==========================================================================
function navigateTo(viewName) {
  state.currentView = viewName;

  // Update navbar buttons
  document.getElementById('navBtnHome').classList.toggle('active', viewName === 'HOME');
  document.getElementById('navBtnLibrary').classList.toggle('active', viewName === 'LIBRARY');
  document.getElementById('navBtnProfile').classList.toggle('active', viewName === 'PROFILE');

  // Hide all sections
  document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));

  if (viewName === 'HOME') {
    document.getElementById('viewHome').classList.add('active');
    loadActiveProjects();
  } else if (viewName === 'LIBRARY') {
    document.getElementById('viewLibrary').classList.add('active');
    loadLibrary();
  } else if (viewName === 'PROFILE') {
    document.getElementById('viewProfile').classList.add('active');
    loadUserProfile();
  } else if (viewName === 'GOAL_DETAILS') {
    document.getElementById('viewGoalDetails').classList.add('active');
  }
}

// ==========================================================================
// 1. HOME: ACTIVE PROJECTS
// ==========================================================================
async function loadActiveProjects() {
  try {
    const res = await fetch('/api/projects/active', {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    if (!res.ok) return;

    const projects = await res.json();
    state.activeProjects = projects;

    const countLabel = document.getElementById('activeProjectsCountLabel');
    if (countLabel) {
      countLabel.textContent = `${projects.length} ${projects.length === 1 ? 'book in progress' : 'books in progress'}`;
    }

    const container = document.getElementById('activeProjectsContainer');
    if (!container) return;

    if (projects.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; background: var(--color-card-bg); border: 2px dashed var(--color-border); border-radius: var(--radius-md); padding: 36px; text-align: center;">
          <div style="font-size: 2rem; color: var(--color-cinnamon); margin-bottom: 8px;">❧</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 6px;">No active projects yet!</h3>
          <p style="color: var(--color-taupe); margin-bottom: 16px;">Begin your novel or launch a new NaNoWriMo challenge now.</p>
          <button class="btn-vintage btn-primary" onclick="openModal('modalProject')">+ Start New Book</button>
        </div>
      `;
      return;
    }

    container.innerHTML = projects.map(item => {
      const p = item.project;
      const g = item.activeGoal;
      const seriesGenre = [p.series, p.genre].filter(Boolean).join(' • ');

      let progressInfo = 'No active goal';
      let progressSub = 'Set a goal for this book';
      if (g) {
        if (g.targetUnit === 'CHAPTERS') {
          progressInfo = `Chapter ${g.currentUnitProgress || 0} of ${g.targetCount}`;
          progressSub = `${item.progressPercentage}% completed (${item.totalWords.toLocaleString('en-US')} words written)`;
        } else {
          progressInfo = `${item.totalWords.toLocaleString('en-US')} / ${(g.targetWords || g.targetCount).toLocaleString('en-US')} words`;
          progressSub = `${item.progressPercentage}% completed`;
        }
      }

      const coverHtml = p.coverUrl 
        ? `<img src="${escapeHtml(p.coverUrl)}" alt="Cover">`
        : `<span>${escapeHtml(p.title.substring(0, 16))}</span>`;

      return `
        <div class="active-project-card">
          <div>
            <div class="project-card-top">
              <button class="project-card-delete-btn" onclick="confirmDeleteProject(${p.id}, '${escapeHtml(p.title)}')" title="Delete this book">
                Delete
              </button>
              <div class="book-cover-thumbnail">${coverHtml}</div>
              <div class="project-card-info" style="padding-right: 50px;">
                <h3>${escapeHtml(p.title)}</h3>
                <div class="project-card-meta">${escapeHtml(seriesGenre || 'Literary Fiction')}</div>
                ${g ? `<span class="goal-tag">${escapeHtml(g.title)}</span>` : ''}
              </div>
            </div>

            <div class="project-card-progress">
              <div class="progress-labels">
                <strong>${progressInfo}</strong>
                <span style="color: var(--color-terracotta); font-weight: bold;">${item.progressPercentage}%</span>
              </div>
              <div class="progress-bar-vintage">
                <div class="progress-bar-fill" style="width: ${Math.min(100, item.progressPercentage)}%;"></div>
              </div>
              <div style="font-size: 0.82rem; color: var(--color-cinnamon); margin-top: 4px;">${progressSub}</div>
            </div>
          </div>

          <div class="project-card-actions">
            ${g ? `
              <button class="btn-vintage btn-primary" style="flex: 1; justify-content: center;" onclick="openSessionModalForGoal(${g.id})">
                Write
              </button>
              <button class="btn-vintage btn-secondary" style="flex: 1; justify-content: center;" onclick="openGoalStats(${g.id})">
                Metrics
              </button>
            ` : `
              <button class="btn-vintage btn-primary" style="width: 100%; justify-content: center;" onclick="openCreateGoalForProject(${p.id})">
                + Set Goal
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Error loading active projects:', err);
  }
}

// Project Deletion Logic
let projectToDeleteId = null;

function confirmDeleteProject(projectId, projectTitle) {
  projectToDeleteId = projectId;
  const titleEl = document.getElementById('deleteProjectTitle');
  if (titleEl) titleEl.textContent = `"${projectTitle}"`;
  openModal('modalDeleteProject');
}

async function executeDeleteProject() {
  if (!projectToDeleteId) return;
  try {
    const res = await fetch(`/api/projects/${projectToDeleteId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    if (res.ok || res.status === 204) {
      closeModal('modalDeleteProject');
      projectToDeleteId = null;
      if (state.currentView === 'GOAL_DETAILS') {
        navigateTo('HOME');
      } else if (state.currentView === 'LIBRARY') {
        loadLibrary();
      } else {
        loadActiveProjects();
      }
      loadUserProfile();
    } else {
      alert('Failed to delete book. Please try again.');
    }
  } catch (err) {
    console.error('Error deleting project:', err);
    alert('Connection error while deleting book.');
  }
}

// ==========================================================================
// 2. LIBRARY (Grouped by Series & Historical Goals)
// ==========================================================================
async function loadLibrary() {
  try {
    const res = await fetch('/api/projects/library', {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    if (!res.ok) return;

    const library = await res.json();
    state.libraryData = library;

    const container = document.getElementById('libraryContainer');
    if (!container) return;

    if (library.length === 0) {
      container.innerHTML = `
        <div style="background: var(--color-card-bg); border: 2px dashed var(--color-border); border-radius: var(--radius-md); padding: 40px; text-align: center;">
          <h3 style="font-size: 1.4rem; margin-bottom: 8px;">Your Library is ready for its first story!</h3>
          <p style="color: var(--color-taupe); margin-bottom: 16px;">Add your novel to organize by sagas and manage goals.</p>
          <button class="btn-vintage btn-primary" onclick="openModal('modalProject')">+ Create First Book</button>
        </div>
      `;
      return;
    }

    // Group by series
    const seriesMap = new Map();
    const standaloneBooks = [];

    library.forEach(item => {
      const series = item.project.series?.trim();
      if (series) {
        if (!seriesMap.has(series)) {
          seriesMap.set(series, []);
        }
        seriesMap.get(series).push(item);
      } else {
        standaloneBooks.push(item);
      }
    });

    let html = '';

    // 1. Series Groups
    for (const [seriesName, books] of seriesMap.entries()) {
      html += `
        <div class="series-section">
          <div class="series-header">
            <h3>Series: <em>${escapeHtml(seriesName)}</em></h3>
            <span class="chart-badge">${books.length} ${books.length === 1 ? 'Book' : 'Books'} in Saga</span>
          </div>
          <div class="library-books-grid">
            ${books.map(renderLibraryBookCard).join('')}
          </div>
        </div>
      `;
    }

    // 2. Stand-Alone Books
    if (standaloneBooks.length > 0) {
      html += `
        <div class="series-section">
          <div class="series-header">
            <h3>Stand-Alone Books & Single Stories</h3>
            <span class="chart-badge">${standaloneBooks.length} Books</span>
          </div>
          <div class="library-books-grid">
            ${standaloneBooks.map(renderLibraryBookCard).join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML = html;

  } catch (err) {
    console.error('Error loading library:', err);
  }
}

function renderLibraryBookCard(item) {
  const p = item.project;
  const activeG = item.activeGoal;
  const archivedGoals = item.archivedGoals || [];

  return `
    <div class="library-book-item">
      <div style="display: flex; gap: 12px; margin-bottom: 10px;">
        <div class="book-cover-thumbnail" style="width: 55px; height: 80px;">
          ${p.coverUrl ? `<img src="${escapeHtml(p.coverUrl)}" alt="Cover">` : `<span>${escapeHtml(p.title.substring(0, 12))}</span>`}
        </div>
        <div style="flex: 1;">
          <h4 style="font-size: 1.15rem; margin-bottom: 2px;">${escapeHtml(p.title)}</h4>
          <div style="font-size: 0.85rem; color: var(--color-cinnamon); font-style: italic;">${escapeHtml(p.genre || 'Fiction')}</div>
          <div style="font-size: 0.82rem; color: var(--color-taupe); margin-top: 4px;">Total: <strong>${item.totalWords.toLocaleString('en-US')}</strong> words</div>
        </div>
      </div>

      <div class="goals-accordion">
        <div class="goals-accordion-title">Goals for this Book</div>
        
        ${activeG ? `
          <div class="goal-item-row is-active" onclick="openGoalStats(${activeG.id})">
            <div>
              <strong>${escapeHtml(activeG.title)}</strong>
              <div style="font-size: 0.78rem; color: var(--color-terracotta);">Active Goal in Progress</div>
            </div>
            <span style="font-size: 0.85rem; font-weight: bold; color: var(--color-terracotta);">View ➔</span>
          </div>
        ` : `
          <button class="btn-vintage btn-secondary" style="width: 100%; font-size: 0.85rem; padding: 6px; margin-bottom: 6px;" onclick="openCreateGoalForProject(${p.id})">
            + Set Goal For This Book
          </button>
        `}

        ${archivedGoals.length > 0 ? `
          <div style="margin-top: 8px;">
            <div style="font-size: 0.78rem; color: var(--color-taupe); margin-bottom: 4px;">Historical Past Goals:</div>
            ${archivedGoals.map(ag => `
              <div class="goal-item-row is-archived" onclick="openGoalStats(${ag.id})">
                <div>
                  <span>${escapeHtml(ag.title)}</span>
                  <div style="font-size: 0.75rem; color: var(--color-taupe);">Archived / Completed Goal</div>
                </div>
                <span style="font-size: 0.82rem; color: var(--color-taupe);">Stats ➔</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <div style="display: flex; justify-content: flex-end; margin-top: 10px; padding-top: 8px; border-top: 1px dashed var(--color-border);">
        <button class="btn-ghost-delete" onclick="confirmDeleteProject(${p.id}, '${escapeHtml(p.title)}')" title="Delete this book">
          Delete Book
        </button>
      </div>
    </div>
  `;
}

// ==========================================================================
// 3. AUTHOR PROFILE & AVATARS
// ==========================================================================
let selectedAvatarUrl = '';

function renderAvatarPicker(currentAvatarUrl) {
  const grid = document.getElementById('avatarPickerGrid');
  if (!grid) return;

  const defaultUrl = getPresetDataUrl(AVATAR_PRESETS[0].svg);
  selectedAvatarUrl = currentAvatarUrl || defaultUrl;

  grid.innerHTML = AVATAR_PRESETS.map((preset) => {
    const dataUrl = getPresetDataUrl(preset.svg);
    const isSelected = selectedAvatarUrl === dataUrl;
    return `
      <div class="avatar-option-item ${isSelected ? 'selected' : ''}" onclick="selectAvatarPreset('${preset.id}')" data-avatar-id="${preset.id}">
        <div class="avatar-option-check">✓</div>
        <img src="${dataUrl}" class="avatar-option-img" alt="${preset.name}">
        <span class="avatar-option-name">${preset.name}</span>
      </div>
    `;
  }).join('');

  const hiddenInput = document.getElementById('profileEditAvatar');
  if (hiddenInput) hiddenInput.value = selectedAvatarUrl;

  const customInput = document.getElementById('profileEditCustomAvatar');
  if (customInput) {
    const isPreset = AVATAR_PRESETS.some(p => getPresetDataUrl(p.svg) === currentAvatarUrl);
    customInput.value = (!isPreset && currentAvatarUrl && !currentAvatarUrl.startsWith('data:image/svg')) ? currentAvatarUrl : '';
  }
}

function selectAvatarPreset(presetId) {
  const preset = AVATAR_PRESETS.find(p => p.id === presetId);
  if (!preset) return;
  const dataUrl = getPresetDataUrl(preset.svg);
  selectedAvatarUrl = dataUrl;

  document.querySelectorAll('.avatar-option-item').forEach(el => {
    el.classList.toggle('selected', el.getAttribute('data-avatar-id') === presetId);
  });

  const hiddenInput = document.getElementById('profileEditAvatar');
  if (hiddenInput) hiddenInput.value = dataUrl;

  const customInput = document.getElementById('profileEditCustomAvatar');
  if (customInput) customInput.value = '';
}

function handleCustomAvatarInput(val) {
  if (val && val.trim().length > 5) {
    selectedAvatarUrl = val.trim();
    document.querySelectorAll('.avatar-option-item').forEach(el => el.classList.remove('selected'));
    const hiddenInput = document.getElementById('profileEditAvatar');
    if (hiddenInput) hiddenInput.value = selectedAvatarUrl;
  }
}

async function loadUserProfile() {
  try {
    const res = await fetch('/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    if (!res.ok) return;

    const profile = await res.json();
    state.currentProfile = profile;

    // Populate Profile
    document.getElementById('profileDisplayName').textContent = profile.displayName || profile.username;
    document.getElementById('profileUsername').textContent = `@${profile.username}`;
    document.getElementById('profileBio').textContent = profile.bio || "Crafting captivating stories with coffee and imagination...";

    const avatarUrl = profile.avatarUrl || getPresetDataUrl(AVATAR_PRESETS[0].svg);
    const avatarEl = document.getElementById('profileAvatarImg');
    if (avatarEl) avatarEl.src = avatarUrl;
    updateNavProfile(profile);

    // 4 Key Indicators
    document.getElementById('profileTotalWords').textContent = Number(profile.totalWordsAllProjects || 0).toLocaleString('en-US');
    document.getElementById('profileBestRecord').textContent = Number(profile.bestDayWordsRecord || 0).toLocaleString('en-US');
    document.getElementById('profileTotalProjects').textContent = profile.totalProjectsCount || 0;
    document.getElementById('profileCompletedGoals').textContent = profile.completedGoalsCount || 0;

    checkDatabaseStatus();
  } catch (err) {
    console.error('Error loading profile:', err);
  }
}

async function checkDatabaseStatus() {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) return;
    const data = await res.json();
    const container = document.getElementById('profileDbStatus');
    if (!container) return;

    if (data.persistent) {
      container.innerHTML = `
        <span style="display:inline-flex; align-items:center; gap:6px; padding:3px 10px; border-radius:12px; background:rgba(46,125,50,0.12); color:#2e7d32; font-weight:600; font-size:0.8rem; border:1px solid rgba(46,125,50,0.25);">
          Cloud Storage: Persistent & Safe
        </span>
      `;
    } else {
      container.innerHTML = `
        <span style="display:inline-flex; align-items:center; gap:6px; padding:3px 10px; border-radius:12px; background:rgba(230,81,0,0.12); color:#e65100; font-weight:600; font-size:0.8rem; border:1px solid rgba(230,81,0,0.25); cursor:pointer;" onclick="openDbHelpModal()" title="Click to see how to save data permanently">
          Temporary Storage (Data resets on restart - Click to fix)
        </span>
      `;
    }
  } catch (e) {
    console.debug('Failed to check db status:', e);
  }
}

function openDbHelpModal() {
  openModal('modalDbHelp');
}

function openEditProfileModal() {
  const p = state.currentProfile;
  if (!p) return;
  document.getElementById('profileEditName').value = p.displayName || '';
  document.getElementById('profileEditBio').value = p.bio || '';
  renderAvatarPicker(p.avatarUrl);
  openModal('modalEditProfile');
}

// ==========================================================================
// 4. PAINEL DE ESTATÍSTICAS DA META ESPECÍFICA (Escrita & Métricas)
// ==========================================================================
async function openGoalStats(goalId) {
  try {
    const res = await fetch(`/api/stats/goal/${goalId}`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    if (!res.ok) return;

    const stats = await res.json();
    state.currentGoalStats = stats;

    navigateTo('GOAL_DETAILS');
    renderGoalStatsDetails(stats);
    renderCharts(stats);
    loadSessionsHistory(goalId);

  } catch (err) {
    console.error('Error loading goal details:', err);
  }
}

function renderGoalStatsDetails(s) {
  const isChapters = s.targetUnit === 'CHAPTERS';

  document.getElementById('goalDetailBookTitle').textContent = s.projectTitle;
  const unitLabel = isChapters ? 'By Chapters' : 'By Words';
  document.getElementById('goalDetailBadge').textContent = `${s.goalTitle} (${unitLabel}${s.archived ? ' • Past' : ''})`;
  document.getElementById('goalDetailMeta').textContent = [s.projectSeries, s.projectGenre].filter(Boolean).join(' • ') || 'Literary Fiction';

  // Archive button
  const btnArchive = document.getElementById('btnArchiveCurrentGoal');
  if (btnArchive) {
    btnArchive.style.display = s.archived ? 'none' : 'inline-flex';
    btnArchive.onclick = () => archiveGoal(s.goalId);
  }

  // Progress
  if (isChapters) {
    document.getElementById('progressSectionTitle').textContent = `Chapter Progress (${s.currentUnitProgress} of ${s.targetCount} completed)`;
    document.getElementById('metricMainLabel').textContent = "Chapters Completed";
    document.getElementById('metricCurrentWords').textContent = `${s.currentUnitProgress}`;
    document.getElementById('metricTargetWords').textContent = `/ ${s.targetCount} chapters`;

    // Hide rigid daily quotas for chapter goals
    document.getElementById('cardRemainingDaily').style.display = 'none';
    document.getElementById('cardEstDate').style.display = 'none';
  } else {
    document.getElementById('progressSectionTitle').textContent = "Manuscript Progress";
    document.getElementById('metricMainLabel').textContent = "Words Written";
    document.getElementById('metricCurrentWords').textContent = s.currentWords.toLocaleString('en-US');
    document.getElementById('metricTargetWords').textContent = `/ ${s.targetWords.toLocaleString('en-US')}`;

    document.getElementById('cardRemainingDaily').style.display = 'flex';
    document.getElementById('cardEstDate').style.display = 'flex';
    document.getElementById('metricRemainingDaily').textContent = s.remainingDailyGoal.toLocaleString('en-US');
    document.getElementById('metricOriginalDaily').textContent = `Original goal: ${s.originalDailyGoal.toLocaleString('en-US')} / day`;

    if (s.completed) {
      document.getElementById('metricEstDate').textContent = "Completed!";
      document.getElementById('metricEstSub').textContent = "Goal 100% reached";
    } else if (s.estimatedCompletionDate) {
      const parts = s.estimatedCompletionDate.split('-');
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      document.getElementById('metricEstDate').textContent = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      document.getElementById('metricEstSub').textContent = `At ${s.currentDailyAverage} words/day pace`;
    } else {
      document.getElementById('metricEstDate').textContent = "Calculating...";
      document.getElementById('metricEstSub').textContent = "Log more sessions";
    }
  }

  // Common metrics
  document.getElementById('metricActualDaily').textContent = `${s.currentDailyAverage.toLocaleString('en-US')} words/day`;
  document.getElementById('metricBestDay').textContent = s.bestDayWords.toLocaleString('en-US');
  document.getElementById('recordBadge').style.display = s.newRecord ? 'inline-block' : 'none';
  document.getElementById('metricStreak').textContent = `${s.streakDays} ${s.streakDays === 1 ? 'day' : 'days'}`;

  // Progress Bar
  document.getElementById('progressText').textContent = `${s.progressPercentage}% completed`;
  document.getElementById('progressBarFill').style.width = `${Math.min(100, s.progressPercentage)}%`;

  // Mood & Quote
  document.getElementById('moodEmoji').textContent = s.moodEmoji;
  document.getElementById('moodTitle').textContent = s.moodStatus === 'HAPPY' ? 'Incredible Flow!' : (s.moodStatus === 'NORMAL' ? 'Cozy Pace' : 'Every Line Counts');
  document.getElementById('moodText').textContent = s.moodMessage;
  document.getElementById('moodQuote').textContent = s.motivationalQuote;

  // Goal Celebration
  const celebBox = document.getElementById('celebrationBox');
  if (celebBox) {
    if (s.completed) {
      celebBox.classList.add('show');
      triggerConfetti();
      document.getElementById('btnOpenDiploma').onclick = () => {
        openModal('modalDiploma');
        const author = state.currentProfile?.displayName || state.currentUser?.displayName || "Dedicated Author";
        generateDiploma(s, author);
      };
    } else {
      celebBox.classList.remove('show');
    }
  }

  // Badges
  renderBadges(s.badges);
}

// Archive Goal
async function archiveGoal(goalId) {
  if (!confirm("Do you want to archive this goal and mark it as completed/past? It will remain saved in your Library!")) return;
  try {
    const res = await fetch(`/api/goals/${goalId}/archive`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    if (res.ok) {
      alert("Goal successfully archived! You can always find it in your Library.");
      navigateTo('LIBRARY');
    }
  } catch (err) {
    console.error('Error archiving goal:', err);
  }
}

// Sessions History
async function loadSessionsHistory(goalId) {
  try {
    const res = await fetch(`/api/sessions/goal/${goalId}`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    if (!res.ok) return;

    const sessions = await res.json();
    const tbody = document.getElementById('sessionsTableBody');
    if (!tbody) return;

    if (sessions.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--color-taupe);">No writing sessions yet. Start writing today!</td></tr>`;
      return;
    }

    tbody.innerHTML = sessions.map(s => {
      const dateParts = s.sessionDate.split('-');
      const d = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      const dateStr = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
      const timeStr = s.startTime ? s.startTime.substring(0, 5) : '--:--';
      const chStr = s.currentChapter ? `Ch. ${s.currentChapter}` : '—';

      return `
        <tr>
          <td><strong>${dateStr}</strong></td>
          <td>${timeStr}</td>
          <td><strong style="color:var(--color-terracotta);">+${s.wordsAdded.toLocaleString('en-US')}</strong></td>
          <td><span class="chart-badge" style="padding:2px 6px;">${chStr}</span></td>
          <td style="font-style:italic; max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(s.notes || '—')}</td>
          <td style="text-align:right;">
            <button class="btn-delete-session" onclick="deleteSession(${s.id})" title="Delete session log">✕</button>
          </td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    console.error('Error loading sessions:', err);
  }
}

async function deleteSession(sessionId) {
  if (!confirm("Delete this writing log?")) return;
  try {
    const res = await fetch(`/api/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    if (res.ok && state.currentGoalStats) {
      openGoalStats(state.currentGoalStats.goalId);
    }
  } catch (err) {
    console.error('Error deleting session:', err);
  }
}

// Badges Gallery
function renderBadges(unlockedBadges = []) {
  const container = document.getElementById('badgesGrid');
  if (!container) return;

  const allPossibleBadges = [
    { code: 'FIRST_SESSION', title: 'First Lines', desc: 'First session recorded', icon: '✍️' },
    { code: 'WORDS_5K', title: '5,000 Words', desc: 'First milestone reached', icon: '📜' },
    { code: 'WORDS_10K', title: '10,000 Words', desc: 'Solid manuscript chapter', icon: '📖' },
    { code: 'WORDS_25K', title: 'Halfway There', desc: '50% of the path conquered', icon: '🕯️' },
    { code: 'WORDS_50K', title: 'NaNoWriMo Legend', desc: '50,000 words achieved!', icon: '🏆' },
    { code: 'GOAL_COMPLETED', title: 'Goal Conquered', desc: '100% of target word count', icon: '🎉' },
    { code: 'DAY_5K', title: 'Inspired Marathon', desc: '5,000 words in a single day', icon: '⚡' },
    { code: 'STREAK_3', title: 'Unstoppable Flow', desc: '3 consecutive writing days', icon: '🔥' },
    { code: 'STREAK_7', title: 'Master Habit', desc: '7 days in a row without missing', icon: '👑' }
  ];

  const unlockedCodes = new Set(unlockedBadges.map(b => b.code));

  container.innerHTML = allPossibleBadges.map(b => {
    const isUnlocked = unlockedCodes.has(b.code);
    return `
      <div class="badge-item ${isUnlocked ? 'unlocked' : 'locked'}">
        <div class="badge-icon">${b.icon}</div>
        <div class="badge-title">${b.title}</div>
        <div class="badge-desc">${b.desc}</div>
        <div style="margin-top:6px; font-size:0.75rem; color:${isUnlocked ? '#C28B38' : '#AFA6A0'}; font-weight:bold;">
          ${isUnlocked ? '★ Conquered' : 'Locked'}
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================================================
// MODAIS E FORMULÁRIOS
// ==========================================================================
function openModal(id) {
  document.getElementById(id)?.classList.add('active');
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('active');
}

function openSessionModalForActiveGoal() {
  if (state.currentGoalStats) {
    openSessionModalForGoal(state.currentGoalStats.goalId);
  }
}

function openSessionModalForGoal(goalId) {
  document.getElementById('sessionGoalId').value = goalId;
  initSessionFormDefaults();
  openModal('modalSession');
}

function openCreateGoalForProject(projectId) {
  document.getElementById('goalProjectId').value = projectId;
  const now = new Date();
  const year = now.getFullYear();
  document.getElementById('goalStartDate').value = `${year}-11-01`;
  document.getElementById('goalEndDate').value = `${year}-11-30`;
  document.getElementById('goalTitle').value = `NaNoWriMo Challenge ${year}`;
  handleGoalUnitChange();
  openModal('modalGoal');
}

function handleGoalUnitChange() {
  const unit = document.getElementById('goalTargetUnit').value;
  const label = document.getElementById('labelGoalTargetCount');
  const help = document.getElementById('helpGoalTargetCount');
  const input = document.getElementById('goalTargetCount');

  if (unit === 'CHAPTERS') {
    label.textContent = "How many chapters in total? *";
    help.textContent = "e.g., The outline has 50 chapters. Progress will be measured by chapters!";
    input.value = "50";
  } else if (unit === 'PAGES') {
    label.textContent = "How many pages in total? *";
    help.textContent = "e.g., Target of 250 pages.";
    input.value = "250";
  } else {
    label.textContent = "Target Number of Words: *";
    help.textContent = "e.g., 50,000 words for NaNoWriMo.";
    input.value = "50000";
  }
}

function initSessionFormDefaults() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('sessionDate').value = today;

  const now = new Date();
  document.getElementById('sessionStartTime').value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  document.getElementById('radioTypeDelta').checked = true;
  updateSessionFormMode();

  document.getElementById('sessionWordsDelta').value = '';
  document.getElementById('sessionTotalCount').value = '';
  document.getElementById('sessionCurrentChapter').value = '';
  document.getElementById('sessionNotes').value = '';
}

function updateSessionFormMode() {
  const isDelta = document.getElementById('radioTypeDelta').checked;
  document.getElementById('cardTypeDelta').classList.toggle('active', isDelta);
  document.getElementById('cardTypeTotal').classList.toggle('active', !isDelta);
  document.getElementById('groupDeltaWords').style.display = isDelta ? 'block' : 'none';
  document.getElementById('groupTotalWords').style.display = isDelta ? 'none' : 'block';
}

function initFormListeners() {
  // Close modals
  document.querySelectorAll('.btn-close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('.modal-overlay')?.classList.remove('active');
    });
  });
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) m.classList.remove('active');
    });
  });

  // Session input toggles
  document.getElementById('radioTypeDelta')?.addEventListener('change', updateSessionFormMode);
  document.getElementById('radioTypeTotal')?.addEventListener('change', updateSessionFormMode);

  // Preset NaNoWriMo
  document.getElementById('btnPresetNanowrimo')?.addEventListener('click', () => {
    const year = new Date().getFullYear();
    document.getElementById('goalTitle').value = `NaNoWriMo ${year}`;
    document.getElementById('goalTargetUnit').value = 'WORDS';
    document.getElementById('goalTargetCount').value = '50000';
    document.getElementById('goalStartDate').value = `${year}-11-01`;
    document.getElementById('goalEndDate').value = `${year}-11-30`;
    handleGoalUnitChange();
  });

  // 1. Submit Login
  document.getElementById('formLogin')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usernameOrEmail = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPass').value;
    const errorEl = document.getElementById('loginErrorMsg');
    errorEl.style.display = 'none';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password })
      });
      const data = await res.json();
      if (res.ok) {
        state.token = data.token;
        state.currentUser = data.user;
        localStorage.setItem('nanalola_token', data.token);
        showMainApp();
        loadUserProfile();
        navigateTo('HOME');
      } else {
        errorEl.textContent = data.error || 'Invalid credentials.';
        errorEl.style.display = 'block';
      }
    } catch (err) {
      errorEl.textContent = 'Error connecting to server.';
      errorEl.style.display = 'block';
    }
  });

  // 2. Submit Register
  document.getElementById('formRegister')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const displayName = document.getElementById('regName').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPass').value;
    const errorEl = document.getElementById('registerErrorMsg');
    errorEl.style.display = 'none';

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, displayName })
      });
      const data = await res.json();
      if (res.ok) {
        state.token = data.token;
        state.currentUser = data.user;
        localStorage.setItem('nanalola_token', data.token);
        showMainApp();
        loadUserProfile();
        navigateTo('HOME');
      } else {
        errorEl.textContent = data.error || 'Error creating account.';
        errorEl.style.display = 'block';
      }
    } catch (err) {
      errorEl.textContent = 'Connection error.';
      errorEl.style.display = 'block';
    }
  });

  // 3. Submit Project
  document.getElementById('formProject')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('projectTitle').value.trim();
    const series = document.getElementById('projectSeriesInput').value.trim();
    const genre = document.getElementById('projectGenre').value.trim();
    const synopsis = document.getElementById('projectSynopsis').value.trim();
    const coverUrl = document.getElementById('projectCoverUrl').value.trim();

    const isChapters = document.getElementById('projectGoalTypeChapters')?.checked;
    const goalUnit = isChapters ? 'CHAPTERS' : 'WORDS';
    const targetCount = parseInt(document.getElementById('projectTargetCount')?.value, 10) || (isChapters ? 25 : 50000);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify({ title, series, genre, synopsis, coverUrl, goalUnit, targetCount })
      });
      if (res.ok) {
        closeModal('modalProject');
        document.getElementById('formProject').reset();
        toggleProjectGoalUnit();
        navigateTo('HOME');
      }
    } catch (err) {
      console.error('Error creating project:', err);
    }
  });

function toggleProjectGoalUnit() {
  const isChapters = document.getElementById('projectGoalTypeChapters')?.checked;
  const labelWords = document.getElementById('labelProjectGoalWords');
  const labelChapters = document.getElementById('labelProjectGoalChapters');
  const labelTarget = document.getElementById('labelProjectTargetCount');
  const inputTarget = document.getElementById('projectTargetCount');
  const helpTarget = document.getElementById('helpProjectTargetCount');

  if (isChapters) {
    if (labelWords) labelWords.style.borderColor = 'var(--color-border)';
    if (labelChapters) labelChapters.style.borderColor = 'var(--color-terracotta)';
    if (labelTarget) labelTarget.textContent = 'Chapter Limit Target (How many chapters?): *';
    if (inputTarget) {
      if (inputTarget.value === '50000') inputTarget.value = '25';
      inputTarget.placeholder = 'e.g., 25 chapters';
    }
    if (helpTarget) helpTarget.textContent = 'Track your book progress as you complete chapters, without word count pressure.';
  } else {
    if (labelWords) labelWords.style.borderColor = 'var(--color-terracotta)';
    if (labelChapters) labelChapters.style.borderColor = 'var(--color-border)';
    if (labelTarget) labelTarget.textContent = 'Word Limit Target (How many words?): *';
    if (inputTarget) {
      if (inputTarget.value === '25') inputTarget.value = '50000';
      inputTarget.placeholder = 'e.g., 50000 words';
    }
    if (helpTarget) helpTarget.textContent = 'Default is 50,000 words (classic NaNoWriMo target).';
  }
}

  // 4. Submit Goal
  document.getElementById('formGoal')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const projectId = document.getElementById('goalProjectId').value;
    const title = document.getElementById('goalTitle').value.trim();
    const targetUnit = document.getElementById('goalTargetUnit').value;
    const targetCount = parseInt(document.getElementById('goalTargetCount').value, 10);
    const startDate = document.getElementById('goalStartDate').value;
    const endDate = document.getElementById('goalEndDate').value;

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify({
          projectId,
          title,
          type: 'WRITING',
          targetUnit,
          targetCount,
          startDate,
          endDate
        })
      });
      if (res.ok) {
        closeModal('modalGoal');
        document.getElementById('formGoal').reset();
        navigateTo(state.currentView === 'LIBRARY' ? 'LIBRARY' : 'HOME');
      }
    } catch (err) {
      console.error('Error creating goal:', err);
    }
  });

  // 5. Submit Writing Session
  document.getElementById('formSession')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const goalId = document.getElementById('sessionGoalId').value;
    const isDelta = document.getElementById('radioTypeDelta').checked;
    const sessionDate = document.getElementById('sessionDate').value;
    const startTime = document.getElementById('sessionStartTime').value;
    const notes = document.getElementById('sessionNotes').value.trim();
    const currentChapterVal = document.getElementById('sessionCurrentChapter').value;
    const currentChapter = currentChapterVal ? parseInt(currentChapterVal, 10) : null;

    let payload = {
      goalId,
      sessionDate,
      startTime: startTime ? `${startTime}:00` : null,
      notes,
      currentChapter
    };

    if (isDelta) {
      const wordsAdded = parseInt(document.getElementById('sessionWordsDelta').value, 10);
      if (isNaN(wordsAdded) || wordsAdded <= 0) {
        alert("Please enter the number of words written.");
        return;
      }
      payload.wordsAdded = wordsAdded;
    } else {
      const totalCount = parseInt(document.getElementById('sessionTotalCount').value, 10);
      if (isNaN(totalCount) || totalCount < 0) {
        alert("Please enter the total word count.");
        return;
      }
      payload.newTotalCount = totalCount;
    }

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        closeModal('modalSession');
        if (state.currentView === 'GOAL_DETAILS' && state.currentGoalStats?.goalId == goalId) {
          openGoalStats(goalId);
        } else {
          loadActiveProjects();
        }
      }
    } catch (err) {
      console.error('Error saving session:', err);
    }
  });

  // 6. Submit Edit Profile
  document.getElementById('formEditProfile')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const displayName = document.getElementById('profileEditName').value.trim();
    const avatarUrl = document.getElementById('profileEditAvatar')?.value.trim() || selectedAvatarUrl;
    const bio = document.getElementById('profileEditBio').value.trim();

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify({ displayName, avatarUrl, bio })
      });
      if (res.ok) {
        closeModal('modalEditProfile');
        await loadUserProfile();
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  });
}

// Confetes na comemoração
function triggerConfetti() {
  const container = document.body;
  for (let i = 0; i < 40; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.zIndex = '9999';
    confetti.style.width = `${Math.random() * 8 + 6}px`;
    confetti.style.height = `${Math.random() * 12 + 6}px`;
    confetti.style.backgroundColor = ['#7A3F33', '#B07A63', '#C28B38', '#E8D6C8'][Math.floor(Math.random() * 4)];
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.top = '-20px';
    confetti.style.borderRadius = '2px';
    confetti.style.opacity = '0.9';
    confetti.style.pointerEvents = 'none';
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    confetti.style.transition = `top ${Math.random() * 2 + 2}s ease-out, transform 3s ease, opacity 3s`;

    container.appendChild(confetti);

    setTimeout(() => {
      confetti.style.top = '105vh';
      confetti.style.transform = `rotate(${Math.random() * 720}deg)`;
      confetti.style.opacity = '0';
    }, 50);

    setTimeout(() => confetti.remove(), 4000);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}
