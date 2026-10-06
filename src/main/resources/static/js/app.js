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
    navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW error:', err));
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

  const name = state.currentUser?.displayName || state.currentUser?.username || 'Escritor(a)';
  document.getElementById('homeGreetingTitle').textContent = `Bem-vinda, ${name}! ☕`;
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
// NAVEGAÇÃO ENTRE ECRÃS
// ==========================================================================
function navigateTo(viewName) {
  state.currentView = viewName;

  // Atualizar botões da Navbar
  document.getElementById('navBtnHome').classList.toggle('active', viewName === 'HOME');
  document.getElementById('navBtnLibrary').classList.toggle('active', viewName === 'LIBRARY');
  document.getElementById('navBtnProfile').classList.toggle('active', viewName === 'PROFILE');

  // Esconder todas as vistas
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
// 1. PÁGINA INICIAL: PROJETOS ATIVOS
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
      countLabel.textContent = `${projects.length} ${projects.length === 1 ? 'livro em escrita' : 'livros em escrita'}`;
    }

    const container = document.getElementById('activeProjectsContainer');
    if (!container) return;

    if (projects.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; background: var(--color-card-bg); border: 2px dashed var(--color-border); border-radius: var(--radius-md); padding: 36px; text-align: center;">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">📖</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 6px;">Ainda não tens projetos ativos!</h3>
          <p style="color: var(--color-taupe); margin-bottom: 16px;">Começa agora o teu primeiro livro ou desafio NaNoWriMo.</p>
          <button class="btn-vintage btn-primary" onclick="openModal('modalProject')">+ Começar Novo Livro</button>
        </div>
      `;
      return;
    }

    container.innerHTML = projects.map(item => {
      const p = item.project;
      const g = item.activeGoal;
      const seriesGenre = [p.series, p.genre].filter(Boolean).join(' • ');

      let progressInfo = 'Sem meta ativa';
      let progressSub = 'Define uma meta no livro';
      if (g) {
        if (g.targetUnit === 'CHAPTERS') {
          progressInfo = `Capítulo ${g.currentUnitProgress || 0} de ${g.targetCount}`;
          progressSub = `${item.progressPercentage}% concluído (${item.totalWords.toLocaleString('pt-PT')} palavras escritas)`;
        } else {
          progressInfo = `${item.totalWords.toLocaleString('pt-PT')} / ${(g.targetWords || g.targetCount).toLocaleString('pt-PT')} palavras`;
          progressSub = `${item.progressPercentage}% concluído`;
        }
      }

      const coverHtml = p.coverUrl 
        ? `<img src="${escapeHtml(p.coverUrl)}" alt="Capa">`
        : `<span>${escapeHtml(p.title.substring(0, 16))}</span>`;

      return `
        <div class="active-project-card">
          <div>
            <div class="project-card-top">
              <div class="book-cover-thumbnail">${coverHtml}</div>
              <div class="project-card-info">
                <h3>${escapeHtml(p.title)}</h3>
                <div class="project-card-meta">${escapeHtml(seriesGenre || 'Ficção Literária')}</div>
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
                ✍️ Escrever
              </button>
              <button class="btn-vintage btn-secondary" style="flex: 1; justify-content: center;" onclick="openGoalStats(${g.id})">
                📊 Métricas
              </button>
            ` : `
              <button class="btn-vintage btn-primary" style="width: 100%; justify-content: center;" onclick="openCreateGoalForProject(${p.id})">
                + Definir Meta
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Erro ao carregar projetos ativos:', err);
  }
}

// ==========================================================================
// 2. BIBLIOTECA (Agrupada por Séries e Metas Antigas)
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
          <h3 style="font-size: 1.4rem; margin-bottom: 8px;">A tua Biblioteca está pronta para a primeira história!</h3>
          <p style="color: var(--color-taupe); margin-bottom: 16px;">Adiciona o teu livro para organizar por sagas e metas.</p>
          <button class="btn-vintage btn-primary" onclick="openModal('modalProject')">+ Criar Primeiro Livro</button>
        </div>
      `;
      return;
    }

    // Agrupar por Séries
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

    // 1. Grupos de Séries
    for (const [seriesName, books] of seriesMap.entries()) {
      html += `
        <div class="series-section">
          <div class="series-header">
            <h3>📚 Série: <em>${escapeHtml(seriesName)}</em></h3>
            <span class="chart-badge">${books.length} ${books.length === 1 ? 'Livro' : 'Livros'} na Saga</span>
          </div>
          <div class="library-books-grid">
            ${books.map(renderLibraryBookCard).join('')}
          </div>
        </div>
      `;
    }

    // 2. Livros Autónomos
    if (standaloneBooks.length > 0) {
      html += `
        <div class="series-section">
          <div class="series-header">
            <h3>📖 Livros Autónomos & Histórias Únicas</h3>
            <span class="chart-badge">${standaloneBooks.length} Livros</span>
          </div>
          <div class="library-books-grid">
            ${standaloneBooks.map(renderLibraryBookCard).join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML = html;

  } catch (err) {
    console.error('Erro ao carregar biblioteca:', err);
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
          ${p.coverUrl ? `<img src="${escapeHtml(p.coverUrl)}" alt="Capa">` : `<span>${escapeHtml(p.title.substring(0, 12))}</span>`}
        </div>
        <div style="flex: 1;">
          <h4 style="font-size: 1.15rem; margin-bottom: 2px;">${escapeHtml(p.title)}</h4>
          <div style="font-size: 0.85rem; color: var(--color-cinnamon); font-style: italic;">${escapeHtml(p.genre || 'Ficção')}</div>
          <div style="font-size: 0.82rem; color: var(--color-taupe); margin-top: 4px;">Total: <strong>${item.totalWords.toLocaleString('pt-PT')}</strong> palavras</div>
        </div>
      </div>

      <div class="goals-accordion">
        <div class="goals-accordion-title">Metas Deste Livro</div>
        
        ${activeG ? `
          <div class="goal-item-row is-active" onclick="openGoalStats(${activeG.id})">
            <div>
              <strong>🎯 ${escapeHtml(activeG.title)}</strong>
              <div style="font-size: 0.78rem; color: var(--color-terracotta);">Meta Ativa em Progresso</div>
            </div>
            <span style="font-size: 0.85rem; font-weight: bold; color: var(--color-terracotta);">Ver ➔</span>
          </div>
        ` : `
          <button class="btn-vintage btn-secondary" style="width: 100%; font-size: 0.85rem; padding: 6px; margin-bottom: 6px;" onclick="openCreateGoalForProject(${p.id})">
            + Criar Meta Para Este Livro
          </button>
        `}

        ${archivedGoals.length > 0 ? `
          <div style="margin-top: 8px;">
            <div style="font-size: 0.78rem; color: var(--color-taupe); margin-bottom: 4px;">Histórico de Metas Antigas:</div>
            ${archivedGoals.map(ag => `
              <div class="goal-item-row is-archived" onclick="openGoalStats(${ag.id})">
                <div>
                  <span>📦 ${escapeHtml(ag.title)}</span>
                  <div style="font-size: 0.75rem; color: var(--color-taupe);">Meta Antiga / Concluída</div>
                </div>
                <span style="font-size: 0.82rem; color: var(--color-taupe);">Estatísticas ➔</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// ==========================================================================
// 3. PERFIL DO ESCRITOR
// ==========================================================================
async function loadUserProfile() {
  try {
    const res = await fetch('/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    if (!res.ok) return;

    const profile = await res.json();
    state.currentProfile = profile;

    // Preencher Perfil
    document.getElementById('profileDisplayName').textContent = profile.displayName || profile.username;
    document.getElementById('profileUsername').textContent = `@${profile.username}`;
    document.getElementById('profileBio').textContent = profile.bio || "A escrever grandes histórias com café e inspiração.";

    if (profile.avatarUrl) {
      document.getElementById('profileAvatarImg').src = profile.avatarUrl;
    }

    // 4 Grandes Indicadores
    document.getElementById('profileTotalWords').textContent = Number(profile.totalWordsAllProjects || 0).toLocaleString('pt-PT');
    document.getElementById('profileBestRecord').textContent = Number(profile.bestDayWordsRecord || 0).toLocaleString('pt-PT');
    document.getElementById('profileTotalProjects').textContent = profile.totalProjectsCount || 0;
    document.getElementById('profileCompletedGoals').textContent = profile.completedGoalsCount || 0;

  } catch (err) {
    console.error('Erro ao carregar perfil:', err);
  }
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
    console.error('Erro ao carregar detalhes da meta:', err);
  }
}

function renderGoalStatsDetails(s) {
  const isChapters = s.targetUnit === 'CHAPTERS';

  document.getElementById('goalDetailBookTitle').textContent = s.projectTitle;
  const unitLabel = isChapters ? 'Por Capítulos' : 'Por Palavras';
  document.getElementById('goalDetailBadge').textContent = `${s.goalTitle} (${unitLabel}${s.archived ? ' • Antiga' : ''})`;
  document.getElementById('goalDetailMeta').textContent = [s.projectSeries, s.projectGenre].filter(Boolean).join(' • ') || 'Ficção Literária';

  // Configuração do botão de arquivar
  const btnArchive = document.getElementById('btnArchiveCurrentGoal');
  if (btnArchive) {
    btnArchive.style.display = s.archived ? 'none' : 'inline-flex';
    btnArchive.onclick = () => archiveGoal(s.goalId);
  }

  // Progresso
  if (isChapters) {
    document.getElementById('progressSectionTitle').textContent = `Progresso por Capítulos (${s.currentUnitProgress} de ${s.targetCount} concluídos)`;
    document.getElementById('metricMainLabel').textContent = "Capítulos Concluídos";
    document.getElementById('metricCurrentWords').textContent = `${s.currentUnitProgress}`;
    document.getElementById('metricTargetWords').textContent = `/ ${s.targetCount} capítulos`;

    // Ocultar previsões diárias rígidas como a cliente pediu
    document.getElementById('cardRemainingDaily').style.display = 'none';
    document.getElementById('cardEstDate').style.display = 'none';
  } else {
    document.getElementById('progressSectionTitle').textContent = "Progresso do Manuscrito";
    document.getElementById('metricMainLabel').textContent = "Palavras Escritas";
    document.getElementById('metricCurrentWords').textContent = s.currentWords.toLocaleString('pt-PT');
    document.getElementById('metricTargetWords').textContent = `/ ${s.targetWords.toLocaleString('pt-PT')}`;

    document.getElementById('cardRemainingDaily').style.display = 'flex';
    document.getElementById('cardEstDate').style.display = 'flex';
    document.getElementById('metricRemainingDaily').textContent = s.remainingDailyGoal.toLocaleString('pt-PT');
    document.getElementById('metricOriginalDaily').textContent = `Meta original: ${s.originalDailyGoal.toLocaleString('pt-PT')} / dia`;

    if (s.completed) {
      document.getElementById('metricEstDate').textContent = "Concluído! 🏆";
      document.getElementById('metricEstSub').textContent = "Meta 100% atingida";
    } else if (s.estimatedCompletionDate) {
      const parts = s.estimatedCompletionDate.split('-');
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      document.getElementById('metricEstDate').textContent = d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
      document.getElementById('metricEstSub').textContent = `Com média de ${s.currentDailyAverage} pal./dia`;
    } else {
      document.getElementById('metricEstDate').textContent = "A calcular...";
      document.getElementById('metricEstSub').textContent = "Regista mais sessões";
    }
  }

  // Métricas comuns a ambos
  document.getElementById('metricActualDaily').textContent = `${s.currentDailyAverage.toLocaleString('pt-PT')} pal./dia`;
  document.getElementById('metricBestDay').textContent = s.bestDayWords.toLocaleString('pt-PT');
  document.getElementById('recordBadge').style.display = s.newRecord ? 'inline-block' : 'none';
  document.getElementById('metricStreak').textContent = `${s.streakDays} ${s.streakDays === 1 ? 'dia' : 'dias'}`;

  // Barra de Progresso
  document.getElementById('progressText').textContent = `${s.progressPercentage}% concluído`;
  document.getElementById('progressBarFill').style.width = `${Math.min(100, s.progressPercentage)}%`;

  // Humor & Frase
  document.getElementById('moodEmoji').textContent = s.moodEmoji;
  document.getElementById('moodTitle').textContent = s.moodStatus === 'HAPPY' ? 'Progresso Impecável!' : (s.moodStatus === 'NORMAL' ? 'Ritmo Confortável' : 'Cada Linha Conta');
  document.getElementById('moodText').textContent = s.moodMessage;
  document.getElementById('moodQuote').textContent = s.motivationalQuote;

  // Celebração de Meta
  const celebBox = document.getElementById('celebrationBox');
  if (celebBox) {
    if (s.completed) {
      celebBox.classList.add('show');
      triggerConfetti();
      document.getElementById('btnOpenDiploma').onclick = () => {
        openModal('modalDiploma');
        const author = state.currentProfile?.displayName || state.currentUser?.displayName || "Escritor(a) Dedicado(a)";
        generateDiploma(s, author);
      };
    } else {
      celebBox.classList.remove('show');
    }
  }

  // Medalhas
  renderBadges(s.badges);
}

// Arquivar Meta
async function archiveGoal(goalId) {
  if (!confirm("Queres arquivar esta meta e marcá-la como concluída/antiga? Ela ficará guardada na tua Biblioteca!")) return;
  try {
    const res = await fetch(`/api/goals/${goalId}/archive`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    if (res.ok) {
      alert("Meta arquivada com sucesso! Podes encontrá-la sempre na Biblioteca.");
      navigateTo('LIBRARY');
    }
  } catch (err) {
    console.error('Erro ao arquivar meta:', err);
  }
}

// Histórico de Sessões
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
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--color-taupe);">Nenhuma sessão de escrita ainda. Começa agora a escrever! ☕</td></tr>`;
      return;
    }

    tbody.innerHTML = sessions.map(s => {
      const dateParts = s.sessionDate.split('-');
      const d = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      const dateStr = d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
      const timeStr = s.startTime ? s.startTime.substring(0, 5) : '--:--';
      const chStr = s.currentChapter ? `Cap. ${s.currentChapter}` : '—';

      return `
        <tr>
          <td><strong>${dateStr}</strong></td>
          <td>${timeStr}</td>
          <td><strong style="color:var(--color-terracotta);">+${s.wordsAdded.toLocaleString('pt-PT')}</strong></td>
          <td><span class="chart-badge" style="padding:2px 6px;">${chStr}</span></td>
          <td style="font-style:italic; max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(s.notes || '—')}</td>
          <td style="text-align:right;">
            <button class="btn-delete-session" onclick="deleteSession(${s.id})" title="Apagar registo">✕</button>
          </td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    console.error('Erro ao carregar sessões:', err);
  }
}

async function deleteSession(sessionId) {
  if (!confirm("Eliminar este registo de escrita?")) return;
  try {
    const res = await fetch(`/api/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    if (res.ok && state.currentGoalStats) {
      openGoalStats(state.currentGoalStats.goalId);
    }
  } catch (err) {
    console.error('Erro ao eliminar sessão:', err);
  }
}

// Medalhas
function renderBadges(unlockedBadges = []) {
  const container = document.getElementById('badgesGrid');
  if (!container) return;

  const allPossibleBadges = [
    { code: 'FIRST_SESSION', title: 'Primeiras Linhas', desc: 'Primeira sessão registada', icon: '✍️' },
    { code: 'WORDS_5K', title: '5.000 Palavras', desc: 'Primeiro grande marco atingido', icon: '📜' },
    { code: 'WORDS_10K', title: '10.000 Palavras', desc: 'Capítulo sólido no manuscrito', icon: '📖' },
    { code: 'WORDS_25K', title: 'A Meio do Caminho', desc: '50% do caminho percorrido', icon: '🕯️' },
    { code: 'WORDS_50K', title: 'Lenda NaNoWriMo', desc: '50.000 palavras atingidas!', icon: '🏆' },
    { code: 'GOAL_COMPLETED', title: 'Meta Conquistada', desc: '100% da meta de palavras', icon: '🎉' },
    { code: 'DAY_5K', title: 'Maratona Inspirada', desc: '5.000 palavras num só dia', icon: '⚡' },
    { code: 'STREAK_3', title: 'Ritmo Imparável', desc: '3 dias seguidos a escrever', icon: '🔥' },
    { code: 'STREAK_7', title: 'Hábito de Mestre', desc: '7 dias consecutivos sem falhar', icon: '👑' }
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
          ${isUnlocked ? '★ Conquistada' : 'Bloqueada'}
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
  document.getElementById('goalTitle').value = `Desafio NaNoWriMo ${year}`;
  handleGoalUnitChange();
  openModal('modalGoal');
}

function handleGoalUnitChange() {
  const unit = document.getElementById('goalTargetUnit').value;
  const label = document.getElementById('labelGoalTargetCount');
  const help = document.getElementById('helpGoalTargetCount');
  const input = document.getElementById('goalTargetCount');

  if (unit === 'CHAPTERS') {
    label.textContent = "Quantos Capítulos no Total? *";
    help.textContent = "Ex: O esboço tem 50 capítulos. O progresso será medido por capítulos!";
    input.value = "50";
  } else if (unit === 'PAGES') {
    label.textContent = "Quantas Páginas no Total? *";
    help.textContent = "Ex: Meta de 250 páginas.";
    input.value = "250";
  } else {
    label.textContent = "Número de Palavras Alvo: *";
    help.textContent = "Ex: 50.000 palavras para o NaNoWriMo.";
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
  // Fechar modais
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

  // Toggles de inserção de sessão
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
        errorEl.textContent = data.error || 'Credenciais inválidas.';
        errorEl.style.display = 'block';
      }
    } catch (err) {
      errorEl.textContent = 'Erro ao conectar ao servidor.';
      errorEl.style.display = 'block';
    }
  });

  // 2. Submit Registo
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
        errorEl.textContent = data.error || 'Erro ao criar conta.';
        errorEl.style.display = 'block';
      }
    } catch (err) {
      errorEl.textContent = 'Erro de conexão.';
      errorEl.style.display = 'block';
    }
  });

  // 3. Submit Projeto
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
      console.error('Erro ao criar projeto:', err);
    }
  });

  // 4. Submit Meta
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
      console.error('Erro ao criar meta:', err);
    }
  });

  // 5. Submit Sessão de Escrita
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
        alert("Por favor insere o número de palavras escritas.");
        return;
      }
      payload.wordsAdded = wordsAdded;
    } else {
      const totalCount = parseInt(document.getElementById('sessionTotalCount').value, 10);
      if (isNaN(totalCount) || totalCount < 0) {
        alert("Por favor insere a contagem total de palavras.");
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
      console.error('Erro ao gravar sessão:', err);
    }
  });

  // 6. Submit Editar Perfil
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
      console.error('Erro ao atualizar perfil:', err);
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
