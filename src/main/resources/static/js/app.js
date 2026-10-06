/**
 * NaNoWriMo Cozy Tracker - Main Application Logic
 */

let appState = {
  projects: [],
  selectedProjectId: null,
  goals: [],
  selectedGoalId: null,
  currentStats: null,
  sessions: [],
  deferredPrompt: null
};

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  initPwa();
  initEventListeners();
  loadGlobalWordCount();
  loadProjects();
});

// PWA Service Worker & Instalação
function initPwa() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('Service Worker registado com sucesso'))
      .catch(err => console.log('Falha ao registar Service Worker:', err));
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    appState.deferredPrompt = e;
    const btnInstall = document.getElementById('btnInstallApp');
    if (btnInstall) {
      btnInstall.style.display = 'inline-flex';
    }
  });
}

function installPwa() {
  if (appState.deferredPrompt) {
    appState.deferredPrompt.prompt();
    appState.deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Utilizador aceitou instalar a PWA');
      }
      appState.deferredPrompt = null;
      document.getElementById('btnInstallApp').style.display = 'none';
    });
  }
}

// Event Listeners
function initEventListeners() {
  // PWA Install Button
  document.getElementById('btnInstallApp')?.addEventListener('click', installPwa);

  // Seletor de Projeto
  document.getElementById('projectSelect')?.addEventListener('change', (e) => {
    appState.selectedProjectId = Number(e.target.value);
    loadGoalsForProject(appState.selectedProjectId);
  });

  // Seletor de Meta
  document.getElementById('goalSelect')?.addEventListener('change', (e) => {
    appState.selectedGoalId = Number(e.target.value);
    loadGoalData(appState.selectedGoalId);
  });

  // Botões de Abertura de Modais
  document.getElementById('btnNewProject')?.addEventListener('click', () => openModal('modalProject'));
  document.getElementById('btnNewGoal')?.addEventListener('click', () => {
    openModal('modalGoal');
    setDefaultGoalDates();
  });
  document.getElementById('btnNewSession')?.addEventListener('click', () => {
    openModal('modalSession');
    initSessionFormDefaults();
  });
  document.getElementById('btnOpenDiploma')?.addEventListener('click', () => {
    openModal('modalDiploma');
    const author = prompt("Nome do escritor(a) para o diploma:", "Escritor(a) Dedicado(a)");
    generateDiploma(appState.currentStats, author || "Escritor(a) Dedicado(a)");
  });
  document.getElementById('btnDownloadDiploma')?.addEventListener('click', downloadDiploma);

  // Fechar modais ao clicar no X ou fora
  document.querySelectorAll('.btn-close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-overlay');
      if (modal) modal.classList.remove('active');
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  // Preset NaNoWriMo
  document.getElementById('btnPresetNanowrimo')?.addEventListener('click', applyNanowrimoPreset);

  // Toggle do Tipo de Inserção de Sessão (Delta vs Total)
  const radioDelta = document.getElementById('radioTypeDelta');
  const radioTotal = document.getElementById('radioTypeTotal');
  radioDelta?.addEventListener('change', updateSessionFormMode);
  radioTotal?.addEventListener('change', updateSessionFormMode);

  // Submissão dos Formulários
  document.getElementById('formProject')?.addEventListener('submit', handleCreateProject);
  document.getElementById('formGoal')?.addEventListener('submit', handleCreateGoal);
  document.getElementById('formSession')?.addEventListener('submit', handleCreateSession);
}

// Abrir e Fechar Modais
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

// Carregar Total de Palavras Global
async function loadGlobalWordCount() {
  try {
    const res = await fetch('/api/stats/global');
    if (res.ok) {
      const data = await res.json();
      const el = document.getElementById('globalWordCounter');
      if (el) {
        el.textContent = Number(data.totalWordsApp || 0).toLocaleString('pt-PT');
      }
    }
  } catch (err) {
    console.error('Erro ao carregar contagem global:', err);
  }
}

// Carregar Projetos
async function loadProjects() {
  try {
    const res = await fetch('/api/projects');
    const projects = await res.json();
    appState.projects = projects;

    const select = document.getElementById('projectSelect');
    select.innerHTML = '';

    if (projects.length === 0) {
      // Cria um projeto inicial simpático automaticamente se a base de dados estiver vazia
      await createInitialSampleProject();
      return;
    }

    projects.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.title} ${p.series ? `(${p.series})` : ''}`;
      select.appendChild(opt);
    });

    if (!appState.selectedProjectId || !projects.some(p => p.id === appState.selectedProjectId)) {
      appState.selectedProjectId = projects[0].id;
    }
    select.value = appState.selectedProjectId;
    loadGoalsForProject(appState.selectedProjectId);

  } catch (err) {
    console.error('Erro ao carregar projetos:', err);
  }
}

// Criar Projeto Inicial Amigável
async function createInitialSampleProject() {
  const sampleProject = {
    title: "O Meu Romance de Outono",
    genre: "Ficção Literária",
    series: "Crónicas do Café",
    coverUrl: ""
  };
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sampleProject)
  });
  if (res.ok) {
    const proj = await res.json();
    // Criar meta NaNoWriMo associada
    const now = new Date();
    const currentYear = now.getFullYear();
    const sampleGoal = {
      projectId: proj.id,
      title: "Desafio NaNoWriMo 50k",
      type: "WRITING",
      targetWords: 50000,
      startDate: `${currentYear}-11-01`,
      endDate: `${currentYear}-11-30`
    };
    await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sampleGoal)
    });
    loadProjects();
  }
}

// Carregar Metas do Projeto
async function loadGoalsForProject(projectId) {
  try {
    const res = await fetch(`/api/goals/project/${projectId}`);
    const goals = await res.json();
    appState.goals = goals;

    const select = document.getElementById('goalSelect');
    select.innerHTML = '';

    if (goals.length === 0) {
      const opt = document.createElement('option');
      opt.textContent = '-- Sem metas criadas --';
      opt.value = '';
      select.appendChild(opt);
      resetDashboardToEmpty();
      return;
    }

    goals.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g.id;
      const typeLabel = g.type === 'WRITING' ? 'Escrita' : 'Edição';
      opt.textContent = `${g.title} (${typeLabel} - ${g.targetWords.toLocaleString('pt-PT')} pal.)`;
      select.appendChild(opt);
    });

    appState.selectedGoalId = goals[0].id;
    select.value = appState.selectedGoalId;
    loadGoalData(appState.selectedGoalId);

  } catch (err) {
    console.error('Erro ao carregar metas:', err);
  }
}

// Carregar Todos os Dados da Meta Ativa (Estatísticas + Gráficos + Sessões)
async function loadGoalData(goalId) {
  if (!goalId) return;

  try {
    // 1. Estatísticas e Métricas
    const resStats = await fetch(`/api/stats/goal/${goalId}`);
    if (resStats.ok) {
      const stats = await resStats.json();
      appState.currentStats = stats;
      renderDashboard(stats);
      renderCharts(stats);
      renderBadges(stats.badges);
    }

    // 2. Histórico de Sessões
    loadSessionsHistory(goalId);
    loadGlobalWordCount();

  } catch (err) {
    console.error('Erro ao carregar dados da meta:', err);
  }
}

// Renderizar o Painel Principal com os Cálculos
function renderDashboard(s) {
  // Informações do Livro / Meta
  document.getElementById('currentProjectTitle').textContent = s.projectTitle;
  document.getElementById('currentGoalBadge').textContent = `${s.goalTitle} (${s.goalType === 'WRITING' ? 'Escrita' : 'Edição'})`;
  
  const seriesGenre = [s.projectSeries, s.projectGenre].filter(Boolean).join(' • ');
  document.getElementById('currentProjectMeta').textContent = seriesGenre || 'Projeto Literário';

  // Métricas
  document.getElementById('metricCurrentWords').textContent = s.currentWords.toLocaleString('pt-PT');
  document.getElementById('metricTargetWords').textContent = `/ ${s.targetWords.toLocaleString('pt-PT')}`;

  document.getElementById('metricRemainingDaily').textContent = s.remainingDailyGoal.toLocaleString('pt-PT');
  document.getElementById('metricActualDaily').textContent = s.currentDailyAverage.toLocaleString('pt-PT');
  document.getElementById('metricOriginalDaily').textContent = `Meta original: ${s.originalDailyGoal.toLocaleString('pt-PT')} / dia`;

  // Melhor Dia (Recorde)
  document.getElementById('metricBestDay').textContent = s.bestDayWords.toLocaleString('pt-PT');
  const recordBadge = document.getElementById('recordBadge');
  if (recordBadge) {
    recordBadge.style.display = s.newRecord ? 'inline-block' : 'none';
  }

  // Estimativa de Fim
  if (s.completed) {
    document.getElementById('metricEstDate').textContent = "Concluído! 🏆";
    document.getElementById('metricEstSub').textContent = "Meta 100% atingida";
  } else if (s.estimatedCompletionDate) {
    const parts = s.estimatedCompletionDate.split('-');
    const estDate = new Date(parts[0], parts[1] - 1, parts[2]);
    document.getElementById('metricEstDate').textContent = estDate.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
    document.getElementById('metricEstSub').textContent = `Com média de ${s.currentDailyAverage} pal./dia`;
  } else {
    document.getElementById('metricEstDate').textContent = "A calcular...";
    document.getElementById('metricEstSub').textContent = "Regista mais sessões";
  }

  // Streak de Dias
  document.getElementById('metricStreak').textContent = `${s.streakDays} ${s.streakDays === 1 ? 'dia' : 'dias'}`;

  // Barra de Progresso
  document.getElementById('progressText').textContent = `${s.progressPercentage}% concluído (${s.remainingWords.toLocaleString('pt-PT')} restantes)`;
  const progressBar = document.getElementById('progressBarFill');
  if (progressBar) {
    progressBar.style.width = `${Math.min(100, s.progressPercentage)}%`;
  }

  // Painel de Humor e Frase Motivacional
  document.getElementById('moodEmoji').textContent = s.moodEmoji;
  document.getElementById('moodTitle').textContent = s.moodStatus === 'HAPPY' ? 'Progresso Impecável!' : (s.moodStatus === 'NORMAL' ? 'Ritmo Confortável' : 'Cada Linha Conta');
  document.getElementById('moodText').textContent = s.moodMessage;
  document.getElementById('moodQuote').textContent = s.motivationalQuote;

  // Caixa de Celebração de Meta Batida
  const celebBox = document.getElementById('celebrationBox');
  if (celebBox) {
    if (s.completed) {
      celebBox.classList.add('show');
      triggerConfetti();
    } else {
      celebBox.classList.remove('show');
    }
  }
}

// Vitrina de Medalhas (Desbloqueadas e Bloqueadas)
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

// Histórico de Sessões
async function loadSessionsHistory(goalId) {
  try {
    const res = await fetch(`/api/sessions/goal/${goalId}`);
    const sessions = await res.json();
    appState.sessions = sessions;

    const tbody = document.getElementById('sessionsTableBody');
    if (!tbody) return;

    if (sessions.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#AFA6A0; padding:20px;">Nenhuma sessão registada ainda. Pega num café e começa a escrever! ☕</td></tr>`;
      return;
    }

    tbody.innerHTML = sessions.map(s => {
      const dateParts = s.sessionDate.split('-');
      const d = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      const dateStr = d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeStr = s.startTime ? s.startTime.substring(0, 5) : '--:--';
      const endTimeStr = s.endTime ? ` - ${s.endTime.substring(0, 5)}` : '';
      const notesStr = s.notes || '—';

      return `
        <tr>
          <td><strong>${dateStr}</strong></td>
          <td>${timeStr}${endTimeStr}</td>
          <td><strong style="color:var(--color-terracotta);">+${s.wordsAdded.toLocaleString('pt-PT')}</strong></td>
          <td style="font-style:italic; max-width:260px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(notesStr)}</td>
          <td style="text-align:right;">
            <button class="btn-delete-session" onclick="deleteSession(${s.id})" title="Apagar sessão">✕</button>
          </td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    console.error('Erro ao carregar histórico de sessões:', err);
  }
}

// Apagar Sessão
async function deleteSession(sessionId) {
  if (!confirm("Tens a certeza de que queres eliminar este registo de escrita?")) return;

  try {
    const res = await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
    if (res.ok) {
      loadGoalData(appState.selectedGoalId);
    }
  } catch (err) {
    console.error('Erro ao eliminar sessão:', err);
  }
}

// Gestão do Formulário de Sessão (Delta vs Total + Horas Automáticas)
function initSessionFormDefaults() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('sessionDate').value = today;

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('sessionStartTime').value = `${hours}:${minutes}`;

  document.getElementById('radioTypeDelta').checked = true;
  updateSessionFormMode();

  document.getElementById('sessionWordsDelta').value = '';
  document.getElementById('sessionTotalCount').value = '';
  document.getElementById('sessionNotes').value = '';
}

function updateSessionFormMode() {
  const isDelta = document.getElementById('radioTypeDelta').checked;
  const cardDelta = document.getElementById('cardTypeDelta');
  const cardTotal = document.getElementById('cardTypeTotal');
  const groupDelta = document.getElementById('groupDeltaWords');
  const groupTotal = document.getElementById('groupTotalWords');

  if (isDelta) {
    cardDelta.classList.add('active');
    cardTotal.classList.remove('active');
    groupDelta.style.display = 'block';
    groupTotal.style.display = 'none';
  } else {
    cardDelta.classList.remove('active');
    cardTotal.classList.add('active');
    groupDelta.style.display = 'none';
    groupTotal.style.display = 'block';

    // Pré-preenche com a contagem atual do livro para facilitar o autor
    if (appState.currentStats) {
      document.getElementById('sessionTotalCount').placeholder = `Atual: ${appState.currentStats.currentWords} palavras`;
    }
  }
}

// Criação de Projeto
async function handleCreateProject(e) {
  e.preventDefault();
  const title = document.getElementById('projectTitle').value.trim();
  const genre = document.getElementById('projectGenre').value.trim();
  const series = document.getElementById('projectSeries').value.trim();
  const coverUrl = document.getElementById('projectCoverUrl').value.trim();

  if (!title) return;

  try {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, genre, series, coverUrl })
    });
    if (res.ok) {
      closeModal('modalProject');
      document.getElementById('formProject').reset();
      const newProj = await res.json();
      appState.selectedProjectId = newProj.id;
      loadProjects();
    }
  } catch (err) {
    console.error('Erro ao criar projeto:', err);
  }
}

// Criação de Meta
function setDefaultGoalDates() {
  const now = new Date();
  const currentYear = now.getFullYear();
  document.getElementById('goalStartDate').value = `${currentYear}-11-01`;
  document.getElementById('goalEndDate').value = `${currentYear}-11-30`;
}

function applyNanowrimoPreset() {
  const now = new Date();
  const currentYear = now.getFullYear();
  document.getElementById('goalTitle').value = `NaNoWriMo ${currentYear}`;
  document.getElementById('goalType').value = 'WRITING';
  document.getElementById('goalTargetWords').value = '50000';
  document.getElementById('goalStartDate').value = `${currentYear}-11-01`;
  document.getElementById('goalEndDate').value = `${currentYear}-11-30`;
}

async function handleCreateGoal(e) {
  e.preventDefault();
  const title = document.getElementById('goalTitle').value.trim();
  const type = document.getElementById('goalType').value;
  const targetWords = parseInt(document.getElementById('goalTargetWords').value, 10);
  const startDate = document.getElementById('goalStartDate').value;
  const endDate = document.getElementById('goalEndDate').value;

  if (!title || !startDate || !endDate || !targetWords) return;

  try {
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: appState.selectedProjectId,
        title,
        type,
        targetWords,
        startDate,
        endDate
      })
    });
    if (res.ok) {
      closeModal('modalGoal');
      document.getElementById('formGoal').reset();
      const newGoal = await res.json();
      appState.selectedGoalId = newGoal.id;
      loadGoalsForProject(appState.selectedProjectId);
    }
  } catch (err) {
    console.error('Erro ao criar meta:', err);
  }
}

// Criação de Sessão
async function handleCreateSession(e) {
  e.preventDefault();
  const isDelta = document.getElementById('radioTypeDelta').checked;
  const sessionDate = document.getElementById('sessionDate').value;
  const startTime = document.getElementById('sessionStartTime').value;
  const endTime = document.getElementById('sessionEndTime').value || null;
  const notes = document.getElementById('sessionNotes').value.trim();

  let payload = {
    goalId: appState.selectedGoalId,
    sessionDate,
    startTime: startTime ? `${startTime}:00` : null,
    endTime: endTime ? `${endTime}:00` : null,
    notes
  };

  if (isDelta) {
    const wordsAdded = parseInt(document.getElementById('sessionWordsDelta').value, 10);
    if (isNaN(wordsAdded) || wordsAdded <= 0) {
      alert("Por favor insere um número válido de palavras escritas.");
      return;
    }
    payload.wordsAdded = wordsAdded;
  } else {
    const totalCount = parseInt(document.getElementById('sessionTotalCount').value, 10);
    if (isNaN(totalCount) || totalCount < 0) {
      alert("Por favor insere a contagem total de palavras do livro.");
      return;
    }
    payload.newTotalCount = totalCount;
  }

  try {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      closeModal('modalSession');
      loadGoalData(appState.selectedGoalId);
    }
  } catch (err) {
    console.error('Erro ao registar sessão:', err);
  }
}

// Efeito Visual de Confetes Cozy na Conquista
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

function resetDashboardToEmpty() {
  document.getElementById('currentProjectTitle').textContent = 'Sem Metas';
  document.getElementById('currentGoalBadge').textContent = 'Cria uma meta para começar';
  document.getElementById('metricCurrentWords').textContent = '0';
  document.getElementById('metricTargetWords').textContent = '/ 0';
  document.getElementById('metricRemainingDaily').textContent = '0';
  document.getElementById('metricActualDaily').textContent = '0';
  document.getElementById('metricBestDay').textContent = '0';
  document.getElementById('metricStreak').textContent = '0 dias';
  document.getElementById('progressText').textContent = '0% concluído';
  document.getElementById('progressBarFill').style.width = '0%';
}
