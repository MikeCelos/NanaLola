/**
 * NaNoWriMo Cozy Tracker - Charts Engine (Chart.js)
 */

let cumulativeChartInstance = null;
let dailyChartInstance = null;

function renderCharts(stats) {
  if (!window.Chart || !stats || !stats.dailyStats) {
    return;
  }

  const dailyStats = stats.dailyStats;
  const labels = dailyStats.map(d => d.label);
  const cumulativeData = dailyStats.map(d => d.cumulativeLogged);
  const expectedData = dailyStats.map(d => d.expectedCumulative);
  const dailyWords = dailyStats.map(d => d.wordsLogged);

  // Cores da paleta
  const colorTerracotta = '#7A3F33';
  const colorCinnamon = '#B07A63';
  const colorGold = '#C28B38';
  const colorEspresso = '#2E2A28';
  const colorLatte = '#E8D6C8';

  // 1. Gráfico de Progresso Acumulado
  const ctxCumulative = document.getElementById('cumulativeChart')?.getContext('2d');
  if (ctxCumulative) {
    if (cumulativeChartInstance) {
      cumulativeChartInstance.destroy();
    }

    cumulativeChartInstance = new Chart(ctxCumulative, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Words Written',
            data: cumulativeData,
            borderColor: colorTerracotta,
            backgroundColor: 'rgba(122, 63, 51, 0.12)',
            fill: true,
            tension: 0.25,
            borderWidth: 3,
            pointBackgroundColor: colorTerracotta,
            pointBorderColor: '#FFF',
            pointRadius: 4,
            pointHoverRadius: 7
          },
          {
            label: 'Linear Target Pace',
            data: expectedData,
            borderColor: colorCinnamon,
            borderDash: [5, 5],
            fill: false,
            tension: 0.1,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: {
                family: '"Times New Roman", Times, serif',
                size: 13
              },
              color: colorEspresso
            }
          },
          tooltip: {
            backgroundColor: colorEspresso,
            titleFont: {
              family: '"SimSun", serif',
              size: 14
            },
            bodyFont: {
              family: '"Times New Roman", Times, serif',
              size: 13
            },
            padding: 12,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y.toLocaleString('en-US')} words`;
              },
              afterBody: function(contexts) {
                if (contexts.length >= 2) {
                  const atingido = contexts[0].parsed.y;
                  const esperado = contexts[1].parsed.y;
                  const dif = atingido - esperado;
                  const sinal = dif >= 0 ? '+' : '';
                  return `Difference: ${sinal}${dif.toLocaleString('en-US')} words`;
                }
                return '';
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(217, 197, 180, 0.4)'
            },
            ticks: {
              color: colorEspresso,
              font: {
                family: '"Times New Roman", Times, serif'
              }
            }
          },
          y: {
            beginAtZero: true,
            suggestedMax: stats.targetWords,
            grid: {
              color: 'rgba(217, 197, 180, 0.4)'
            },
            ticks: {
              color: colorEspresso,
              font: {
                family: '"Times New Roman", Times, serif'
              },
              callback: function(val) {
                return val.toLocaleString('en-US');
              }
            }
          }
        }
      }
    });
  }

  // 2. Gráfico Diário de Palavras
  const ctxDaily = document.getElementById('dailyChart')?.getContext('2d');
  if (ctxDaily) {
    if (dailyChartInstance) {
      dailyChartInstance.destroy();
    }

    // Cores de barras (dourado se for o melhor dia/recorde, terracota para os outros)
    const backgroundColors = dailyStats.map(d => (d.recordDay && d.wordsLogged > 0) ? colorGold : colorTerracotta);

    dailyChartInstance = new Chart(ctxDaily, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Words Written on Day',
            data: dailyWords,
            backgroundColor: backgroundColors,
            borderColor: colorEspresso,
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: colorEspresso,
            titleFont: {
              family: '"SimSun", serif',
              size: 14
            },
            bodyFont: {
              family: '"Times New Roman", Times, serif',
              size: 13
            },
            padding: 12,
            callbacks: {
              label: function(context) {
                const stat = dailyStats[context.dataIndex];
                let label = `Written: ${context.parsed.y.toLocaleString('en-US')} words`;
                if (stat && stat.recordDay && stat.wordsLogged > 0) {
                  label += ' ★ (Best Day / Record!)';
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: colorEspresso,
              font: {
                family: '"Times New Roman", Times, serif'
              }
            }
          },
          y: {
            beginAtZero: true,
            suggestedMax: Math.max(stats.originalDailyGoal * 1.5, ...dailyWords),
            grid: {
              color: 'rgba(217, 197, 180, 0.4)'
            },
            ticks: {
              color: colorEspresso,
              font: {
                family: '"Times New Roman", Times, serif'
              },
              callback: function(val) {
                return val.toLocaleString('en-US');
              }
            }
          }
        }
      }
    });
  }
}
