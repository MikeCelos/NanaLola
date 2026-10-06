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
  document.getElementById('homeGreetingTitle').textContent = `Welcome, ${name}! ☕`;
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
          <div style="font-size: 2.5rem; margin-bottom: 8px;">📖</div>
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
              <div class="book-cover-thumbnail">${coverHtml}</div>
              <div class="project-card-info">
                <h3>${escapeHtml(p.title)}</h3>
                <div class="project-card-meta">${escapeHtml(seriesGenre || 'Literary Fiction')}</div>
                ${g ? `<span class="goal-tag">🎯 ${escapeHtml(g.title)}</span>` : ''}
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
                ✍️ Write
              </button>
              <button class="btn-vintage btn-secondary" style="flex: 1; justify-content: center;" onclick="openGoalStats(${g.id})">
                📊 Metrics
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
            <h3>📚 Series: <em>${escapeHtml(seriesName)}</em></h3>
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
            <h3>📖 Stand-Alone Books & Single Stories</h3>
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
              <strong>🎯 ${escapeHtml(activeG.title)}</strong>
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
                  <span>📦 ${escapeHtml(ag.title)}</span>
                  <div style="font-size: 0.75rem; color: var(--color-taupe);">Archived / Completed Goal</div>
                </div>
                <span style="font-size: 0.82rem; color: var(--color-taupe);">Stats ➔</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// ==========================================================================
// 3. AUTHOR PROFILE
// ==========================================================================
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
    document.getElementById('profileBio').textContent = profile.bio || "Crafting great stories with coffee and inspiration.";

    if (profile.avatarUrl) {
      document.getElementById('profileAvatarImg').src = profile.avatarUrl;
    }

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
          🔒 Cloud Storage: Persistent & Safe
        </span>
      `;
    } else {
      container.innerHTML = `
        <span style="display:inline-flex; align-items:center; gap:6px; padding:3px 10px; border-radius:12px; background:rgba(230,81,0,0.12); color:#e65100; font-weight:600; font-size:0.8rem; border:1px solid rgba(230,81,0,0.25); cursor:pointer;" onclick="openDbHelpModal()" title="Click to see how to save data permanently">
          ⚠️ Temporary Storage (Data resets on restart - Click to fix)
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
  document.getElementById('profileEditAvatar').value = p.avatarUrl || '';
  document.getElementById('profileEditBio').value = p.bio || '';
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
      document.getElementById('metricEstDate').textContent = "Completed! 🏆";
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
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--color-taupe);">No writing sessions yet. Start writing today! ☕</td></tr>`;
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

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify({ title, series, genre, synopsis, coverUrl })
      });
      if (res.ok) {
        closeModal('modalProject');
        document.getElementById('formProject').reset();
        navigateTo(state.currentView === 'LIBRARY' ? 'LIBRARY' : 'HOME');
      }
    } catch (err) {
      console.error('Error creating project:', err);
    }
  });

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
    const avatarUrl = document.getElementById('profileEditAvatar').value.trim();
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
        loadUserProfile();
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
