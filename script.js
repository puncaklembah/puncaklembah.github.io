/**
 * PUNCAK LEMBAH - GT METHOD (GRAFIK TABRANIJ) & KAIZEN PLATFORM
 * Core Engine & Interactive Trading Calculators
 * Author: MOCHAMAD TABRANI / Kebun Saldo / Puncak Lembah
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeEngine();
  initMobileMenu();
  initGTCalculator();
  initDashboardEngine();
  initTanggaSaldoEngine();
  initKaizenTracker();
});

/* ========================================================================= */
/* 1. THEME ENGINE                                                           */
/* ========================================================================= */
function initThemeEngine() {
  const themeBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('gt_theme') || 'dark';

  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
      localStorage.setItem('gt_theme', currentTheme);
      
      // Re-render active charts if theme changes
      if (window.gtEquityChart) window.gtEquityChart.update();
      if (window.gtLadderChart) window.gtLadderChart.update();
    });
  }
}

/* ========================================================================= */
/* 2. MOBILE NAVIGATION DRAWER                                              */
/* ========================================================================= */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileToggleBtn');
  const navMenu = document.getElementById('navMenu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }
}

/* ========================================================================= */
/* 3. GT METHOD MATH ENGINE & CALCULATOR                                     */
/* ========================================================================= */
function calculateGTLevels(open, high, low, close) {
  const o = parseFloat(open) || 0;
  const h = parseFloat(high) || 0;
  const l = parseFloat(low) || 0;
  const c = parseFloat(close) || 0;

  const bH = Math.max(o, c); // Atas
  const bL = Math.min(o, c); // Bawah
  const neto = Math.abs(c - o); // Neto
  const jangkauan = Math.max(0, h - l); // Jangkauan

  return {
    tinggi: h,
    rendah: l,
    atas: bH,
    bawah: bL,
    awal: o,
    neto: neto,
    inti: c,
    jangkauan: jangkauan
  };
}

function initGTCalculator() {
  const calcForm = document.getElementById('gtCalcForm');
  if (!calcForm) return;

  calcForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const open = parseFloat(document.getElementById('gtOpen').value);
    const high = parseFloat(document.getElementById('gtHigh').value);
    const low = parseFloat(document.getElementById('gtLow').value);
    const close = parseFloat(document.getElementById('gtClose').value);

    if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) {
      alert('Mohon masukkan semua harga (Open, High, Low, Close) dengan benar.');
      return;
    }

    const levels = calculateGTLevels(open, high, low, close);

    // Update UI Badges
    document.getElementById('resTinggi').textContent = levels.tinggi.toFixed(4);
    document.getElementById('resAtas').textContent = levels.atas.toFixed(4);
    document.getElementById('resAwal').textContent = levels.awal.toFixed(4);
    document.getElementById('resInti').textContent = levels.inti.toFixed(4);
    document.getElementById('resBawah').textContent = levels.bawah.toFixed(4);
    document.getElementById('resRendah').textContent = levels.rendah.toFixed(4);
    document.getElementById('resNeto').textContent = levels.neto.toFixed(4);
    document.getElementById('resJangkauan').textContent = levels.jangkauan.toFixed(4);

    // Draw visual GT Candlestick lines
    renderGTCanvasChart(levels);
  });
}

function renderGTCanvasChart(levels) {
  const canvas = document.getElementById('gtCandleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const maxP = Math.max(levels.tinggi, levels.atas, levels.inti, levels.awal) * 1.001;
  const minP = Math.min(levels.rendah, levels.bawah, levels.inti, levels.awal) * 0.999;
  const pDiff = (maxP - minP) || 1;

  function getY(price) {
    return h - 30 - ((price - minP) / pDiff) * (h - 60);
  }

  // Draw Levels
  const lines = [
    { name: 'Tinggi', val: levels.tinggi, color: '#06b6d4' },
    { name: 'Atas', val: levels.atas, color: '#10b981' },
    { name: 'Awal', val: levels.awal, color: '#94a3b8' },
    { name: 'Inti', val: levels.inti, color: '#ffd700' },
    { name: 'Bawah', val: levels.bawah, color: '#f59e0b' },
    { name: 'Rendah', val: levels.rendah, color: '#ef4444' }
  ];

  lines.forEach(line => {
    const y = getY(line.val);
    ctx.beginPath();
    ctx.strokeStyle = line.color;
    ctx.lineWidth = line.name === 'Inti' ? 3 : 1.5;
    if (line.name === 'Awal') ctx.setLineDash([4, 4]);
    else ctx.setLineDash([]);

    ctx.moveTo(60, y);
    ctx.lineTo(w - 20, y);
    ctx.stroke();

    ctx.fillStyle = line.color;
    ctx.font = 'bold 12px "JetBrains Mono"';
    ctx.fillText(`${line.name}: ${line.val.toFixed(4)}`, 10, y + 4);
  });
}

/* ========================================================================= */
/* 4. DASHBOARD & TRADING JOURNAL ENGINE                                     */
/* ========================================================================= */
function initDashboardEngine() {
  const form = document.getElementById('transactionForm');
  if (!form) return;

  let transactions = JSON.parse(localStorage.getItem('gt_trades')) || getInitialMockTrades();

  function updateDashboard() {
    renderTable();
    renderSummary();
    renderChart();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const asset = document.getElementById('asset').value.toUpperCase();
    const type = document.getElementById('type').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const entry = parseFloat(document.getElementById('entry').value);
    const exit = document.getElementById('exit').value ? parseFloat(document.getElementById('exit').value) : null;
    const notes = document.getElementById('notes').value || 'GT Method Trade';

    let profitLoss = 0;
    if (exit !== null) {
      if (asset === 'EURUSD') {
        const pips = (exit - entry) / 0.0001;
        profitLoss = type === 'buy' ? pips * 10 * amount : -pips * 10 * amount;
      } else if (asset === 'XAUUSD') {
        const pts = (exit - entry) / 0.01;
        profitLoss = type === 'buy' ? pts * 1 * amount : -pts * 1 * amount;
      } else { // BTC, ETH, Crypto
        profitLoss = type === 'buy' ? (exit - entry) * amount : (entry - exit) * amount;
      }
    }

    const trade = {
      id: Date.now(),
      date: new Date().toLocaleDateString('id-ID', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      asset,
      type,
      amount,
      entry,
      exit,
      profitLoss,
      notes
    };

    transactions.unshift(trade);
    localStorage.setItem('gt_trades', JSON.stringify(transactions));
    form.reset();
    updateDashboard();

    if (profitLoss > 0 && typeof confetti === 'function') {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    }
  });

  document.getElementById('resetButton')?.addEventListener('click', () => {
    if (confirm('Reset seluruh data transaksi Kaizen?')) {
      transactions = [];
      localStorage.removeItem('gt_trades');
      updateDashboard();
    }
  });

  function renderTable() {
    const tbody = document.getElementById('transactionBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (transactions.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color: var(--text-muted);">Belum ada transaksi recorded. Silakan tambah transaksi di atas.</td></tr>`;
      return;
    }

    transactions.forEach(t => {
      const row = document.createElement('tr');
      const plClass = t.profitLoss > 0 ? 'val-green' : (t.profitLoss < 0 ? 'val-red' : '');
      const typeBadge = t.type === 'buy' ? '<span class="val-green">BUY</span>' : '<span class="val-red">SELL</span>';

      row.innerHTML = `
        <td>${t.date}</td>
        <td><strong>${t.asset}</strong></td>
        <td>${typeBadge}</td>
        <td>${t.amount.toFixed(2)}</td>
        <td>${t.entry.toFixed(t.asset === 'EURUSD' ? 5 : 2)}</td>
        <td>${t.exit ? t.exit.toFixed(t.asset === 'EURUSD' ? 5 : 2) : '-'}</td>
        <td class="${plClass}">${t.profitLoss ? (t.profitLoss >= 0 ? '+' : '') + t.profitLoss.toFixed(2) + ' USD' : '-'}</td>
        <td>${t.notes}</td>
      `;
      tbody.appendChild(row);
    });
  }

  function renderSummary() {
    const totalTrades = transactions.length;
    const wins = transactions.filter(t => t.profitLoss > 0).length;
    const losses = transactions.filter(t => t.profitLoss < 0).length;
    const totalPL = transactions.reduce((acc, t) => acc + (t.profitLoss || 0), 0);
    const winRate = totalTrades > 0 ? (wins / totalTrades * 100).toFixed(1) : '0';

    if (document.getElementById('totalTrades')) document.getElementById('totalTrades').textContent = totalTrades;
    if (document.getElementById('totalPL')) {
      const plElem = document.getElementById('totalPL');
      plElem.textContent = (totalPL >= 0 ? '+' : '') + totalPL.toFixed(2) + ' USD';
      plElem.className = totalPL >= 0 ? 'val-green' : 'val-red';
    }
    if (document.getElementById('avgPL')) document.getElementById('avgPL').textContent = (totalTrades > 0 ? (totalPL / totalTrades).toFixed(2) : '0.00') + ' USD';
    if (document.getElementById('winRateVal')) document.getElementById('winRateVal').textContent = winRate + '%';
  }

  function renderChart() {
    const ctx = document.getElementById('transactionChart')?.getContext('2d');
    if (!ctx) return;

    const sortedTrades = [...transactions].reverse();
    let cumulative = 0;
    const labels = ['Awal'];
    const dataPoints = [0];

    sortedTrades.forEach((t, i) => {
      cumulative += (t.profitLoss || 0);
      labels.push(`T${i + 1}`);
      dataPoints.push(cumulative);
    });

    if (window.gtEquityChart) window.gtEquityChart.destroy();

    window.gtEquityChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Ekuitas Kumulatif (USD)',
          data: dataPoints,
          borderColor: '#ffd700',
          backgroundColor: 'rgba(255, 215, 0, 0.12)',
          borderWidth: 3,
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#ffd700'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#f8fafc', font: { family: 'Outfit' } } }
        },
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
          y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }
        }
      }
    });
  }

  updateDashboard();
}

function getInitialMockTrades() {
  return [
    { id: 1, date: '25 Jul 18:30', asset: 'BTCUSD', type: 'buy', amount: 0.01, entry: 64200, exit: 64800, profitLoss: 6.00, notes: 'GT Live Breakout Setup' },
    { id: 2, date: '25 Jul 19:15', asset: 'XAUUSD', type: 'sell', amount: 0.02, entry: 2385.50, exit: 2380.00, profitLoss: 11.00, notes: 'GT Inti Reversal Target' }
  ];
}

/* ========================================================================= */
/* 5. TANGGA SALDO DOLAR ESCALATOR ENGINE                                    */
/* ========================================================================= */
function initTanggaSaldoEngine() {
  const tableBody = document.querySelector('#levelTable tbody');
  if (!tableBody) return;

  const levels = generate100TanggaLevels();
  renderLevelTable(levels);
  renderLadderChart(levels);

  // Filter or Calculator bindings
  const calcBtn = document.getElementById('calcLadderBtn');
  if (calcBtn) {
    calcBtn.addEventListener('click', () => {
      const customCapital = parseFloat(document.getElementById('startCapitalInput').value) || 1.00;
      const updatedLevels = generate100TanggaLevels(customCapital);
      renderLevelTable(updatedLevels);
      renderLadderChart(updatedLevels);
    });
  }
}

/**
 * Calculates lot min & max based on saldo bracket rules (user-defined):
 *  $1–19   → 0.01 / 0.01
 *  $20–29  → 0.01 / 0.02
 *  $30–49  → 0.01 / 0.03
 *  $50–99  → 0.02 / 0.04
 *  $100–199 → 0.05 / 0.10
 *  $200–499 → 0.10 / 0.20
 *  $500–999 → 0.20 / 0.40
 *  $1000–1999 → 0.50 / 1.00
 *  $2000–4999 → 1.00 / 2.00
 *  $5000–9999 → 2.00 / 4.00
 *  $10000+    → 5.00 / 10.00 (scales 10× per decade)
 */
function getLotBracket(saldo) {
  if (saldo < 20)    return { min: 0.01, max: 0.01 };
  if (saldo < 30)    return { min: 0.01, max: 0.02 };
  if (saldo < 50)    return { min: 0.01, max: 0.03 };
  if (saldo < 100)   return { min: 0.02, max: 0.04 };
  if (saldo < 200)   return { min: 0.05, max: 0.10 };
  if (saldo < 500)   return { min: 0.10, max: 0.20 };
  if (saldo < 1000)  return { min: 0.20, max: 0.40 };
  if (saldo < 2000)  return { min: 0.50, max: 1.00 };
  if (saldo < 5000)  return { min: 1.00, max: 2.00 };
  if (saldo < 10000) return { min: 2.00, max: 4.00 };
  if (saldo < 20000) return { min: 5.00, max: 10.00 };
  if (saldo < 50000) return { min: 10.00, max: 20.00 };
  return              { min: 20.00, max: 50.00 };
}

function generate100TanggaLevels(startCapital = 1.00) {
  const data = [];
  let cap = startCapital;

  for (let i = 1; i <= 100; i++) {
    const lot = getLotBracket(cap);

    // Target step growth: 10% per ladder step
    const profitTarget = cap * 0.10;
    const ifProfit = cap + profitTarget;
    const ifLoss = Math.max(0, cap - (profitTarget * 0.5));
    const nextLevel = ifProfit;

    // Target pips / points calculation
    // 500 points (XAUUSD) or 50 pips (FOREX) per trade using lot.max
    // For XAUUSD: $profit = lot * 100 * points * 0.01  => points = profit / (lot * 1)
    // Simplified: target 500 pts @ lot.max means USD value
    const targetPts = 500; // points target
    const targetPips = 50; // pip target
    const estimatedUSD_pts = (lot.max * targetPts * 0.01).toFixed(2);  // XAUUSD
    const estimatedUSD_pips = (lot.max * targetPips * 10 * 0.01).toFixed(2); // FOREX

    data.push({
      tingkat: i,
      saldoAwal: cap,
      lotMin: lot.min,
      lotMax: lot.max,
      targetProfit: profitTarget,
      ifProfit: ifProfit,
      ifLoss: ifLoss,
      nextLevel: nextLevel,
      targetPts: targetPts,
      targetPips: targetPips,
      estUSD_pts: parseFloat(estimatedUSD_pts),
      estUSD_pips: parseFloat(estimatedUSD_pips)
    });

    cap = nextLevel;
  }
  return data;
}

function renderLevelTable(levels) {
  const tbody = document.querySelector('#levelTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  // Render from largest level 100 at the top down to smallest level 1 at the bottom
  const displayLevels = [...levels].reverse();

  displayLevels.forEach(l => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>Tangga ${l.tingkat}</strong></td>
      <td class="val-gold">$${l.saldoAwal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td style="white-space:nowrap;">
        <span style="color:var(--accent-cyan);">${l.lotMin.toFixed(2)}</span>
        <span style="color:var(--text-muted);"> / </span>
        <span style="color:var(--accent-gold);">${l.lotMax.toFixed(2)}</span>
        <small style="color:var(--text-muted);display:block;font-size:0.7rem;">min / maks</small>
      </td>
      <td style="white-space:nowrap;">
        <span class="val-green" style="font-size:0.85rem;">500 pts</span>
        <span style="color:var(--text-muted);font-size:0.75rem;"> / </span>
        <span style="color:var(--accent-amber);font-size:0.85rem;">50 pip</span>
        <small style="color:var(--text-muted);display:block;font-size:0.7rem;">≈$${l.estUSD_pts} (XAU) / $${l.estUSD_pips} (FX)</small>
      </td>
      <td class="val-green">+$${l.targetProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td class="val-green">$${l.ifProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td class="val-red">$${l.ifLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td class="val-gold">$${l.nextLevel.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderLadderChart(levels) {
  const ctx = document.getElementById('equityChart')?.getContext('2d');
  if (!ctx) return;

  const labels = levels.filter(l => l.tingkat % 5 === 0 || l.tingkat === 1).map(l => `T${l.tingkat}`);
  const dataPoints = levels.filter(l => l.tingkat % 5 === 0 || l.tingkat === 1).map(l => l.saldoAwal);

  if (window.gtLadderChart) window.gtLadderChart.destroy();

  window.gtLadderChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Pertumbuhan Tangga Saldo ($)',
        data: dataPoints,
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.15)',
        borderWidth: 3,
        fill: true,
        tension: 0.2,
        pointBackgroundColor: '#06b6d4'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#f8fafc' } }
      },
      scales: {
        x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
        y: { type: 'logarithmic', grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }
      }
    }
  });
}

/* ========================================================================= */
/* 6. KAIZEN TRACKER                                                         */
/* ========================================================================= */
function initKaizenTracker() {
  const checkboxes = document.querySelectorAll('.kaizen-check');
  checkboxes.forEach(cb => {
    const key = `kaizen_rule_${cb.id}`;
    cb.checked = localStorage.getItem(key) === 'true';

    cb.addEventListener('change', () => {
      localStorage.setItem(key, cb.checked);
    });
  });
}
