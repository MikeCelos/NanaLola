/**
 * NanaLola Cozy Tracker - Vintage Certificate Generator
 */

function generateDiploma(stats, authorName = "Dedicated Author") {
  const canvas = document.getElementById('diplomaCanvas');
  if (!canvas || !stats) return;

  const ctx = canvas.getContext('2d');
  const width = 1200;
  const height = 850;
  canvas.width = width;
  canvas.height = height;

  // Fundo pergaminho quente
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#FAF4E8');
  grad.addColorStop(0.5, '#F5EBDB');
  grad.addColorStop(1, '#EFE0CD');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Moldura vintage exterior
  ctx.strokeStyle = '#7A3F33';
  ctx.lineWidth = 14;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  // Moldura interior com cantos decorativos
  ctx.strokeStyle = '#B07A63';
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, width - 96, height - 96);

  ctx.strokeStyle = '#2E2A28';
  ctx.lineWidth = 1;
  ctx.strokeRect(54, 54, width - 108, height - 108);

  // Ornamentos de cantos
  drawCornerFlourish(ctx, 60, 60);
  drawCornerFlourish(ctx, width - 60, 60);
  drawCornerFlourish(ctx, 60, height - 60);
  drawCornerFlourish(ctx, width - 60, height - 60);

  // Cabeçalho
  ctx.fillStyle = '#7A3F33';
  ctx.font = 'bold 26px "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.fillText('❧  NATIONAL NOVEL WRITING MONTH  ☙', width / 2, 120);

  // Título Principal do Diploma
  ctx.fillStyle = '#2E2A28';
  ctx.font = 'bold 50px "SimSun", "Songti SC", serif';
  ctx.fillText('CERTIFICATE OF LITERARY ACHIEVEMENT', width / 2, 190);

  // Subtítulo
  ctx.fillStyle = '#B07A63';
  ctx.font = 'italic 24px "Times New Roman", serif';
  ctx.fillText('This is to certify with honor and distinction that', width / 2, 250);

  // Nome do Autor
  ctx.fillStyle = '#7A3F33';
  ctx.font = 'bold 44px "SimSun", "Songti SC", serif';
  ctx.fillText(authorName, width / 2, 320);

  // Linha dourada sob o nome
  ctx.strokeStyle = '#C28B38';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 250, 340);
  ctx.lineTo(width / 2 + 250, 340);
  ctx.stroke();

  // Texto do mérito
  ctx.fillStyle = '#2E2A28';
  ctx.font = '22px "Times New Roman", serif';
  ctx.fillText('has conquered with perseverance, warm coffee, and passion the writing goal for the project', width / 2, 400);

  // Título da Obra
  ctx.fillStyle = '#7A3F33';
  ctx.font = 'bold italic 36px "Times New Roman", serif';
  const bookTitle = stats.projectTitle ? `« ${stats.projectTitle} »` : '« Your Masterpiece »';
  ctx.fillText(bookTitle, width / 2, 460);

  // Word count details
  ctx.fillStyle = '#2E2A28';
  ctx.font = '24px "Times New Roman", serif';
  const totalW = stats.currentWords ? stats.currentWords.toLocaleString('en-US') : '50,000';
  ctx.fillText(`reaching a grand total of ${totalW} words written!`, width / 2, 520);

  // Selo de Cera Vintage (Wax Seal)
  drawWaxSeal(ctx, width / 2, 650, totalW);

  // Data e Assinatura Simbólica
  ctx.fillStyle = '#4A3E3B';
  ctx.font = 'italic 18px "Times New Roman", serif';
  ctx.textAlign = 'left';
  const todayStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  ctx.fillText(`Official Date: ${todayStr}`, 100, 750);

  ctx.textAlign = 'right';
  ctx.fillText('NanaLola Official Committee & Cozy Society', width - 100, 750);
}

function drawCornerFlourish(ctx, x, y) {
  ctx.save();
  ctx.strokeStyle = '#7A3F33';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawWaxSeal(ctx, x, y, words) {
  ctx.save();
  // Sombra do selo
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;

  // Círculo exterior do selo
  ctx.fillStyle = '#7A3F33';
  ctx.beginPath();
  ctx.arc(x, y, 65, 0, Math.PI * 2);
  ctx.fill();

  // Borda interior
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#C28B38';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, 54, 0, Math.PI * 2);
  ctx.stroke();

  // Texto interior
  ctx.fillStyle = '#FFF8EE';
  ctx.textAlign = 'center';
  ctx.font = 'bold 13px "Times New Roman", serif';
  ctx.fillText('★ WINNER ★', x, y - 18);
  ctx.font = 'bold 18px "SimSun", serif';
  ctx.fillText('NanaLola', x, y + 6);
  ctx.font = '12px "Times New Roman", serif';
  ctx.fillText(`${words} WORDS`, x, y + 26);

  ctx.restore();
}

function downloadDiploma() {
  const canvas = document.getElementById('diplomaCanvas');
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = 'NanaLola_Official_Certificate.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}
