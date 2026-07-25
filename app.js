/* ========================================================================= */
/* PUNCAK LEMBAH GT - SPA CORE ENGINE (app.js)                               */
/* SPA Hash Router, Precision Compounding Engine, Tangga Saldo, Journal      */
/* ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  console.log("🚀 Puncak Lembah GT SPA Engine Initialized with Precision Compounding");

  // App State Initialization
  const state = {
    currentRoute: 'home',
    trades: JSON.parse(localStorage.getItem('gt_trades') || '[]'),
    kaizenState: JSON.parse(localStorage.getItem('gt_kaizen') || '{}'),
    selectedMonth: 1,
    chartInstance: null
  };

  /* ======================================================================= */
  /* 1. SPA ROUTER                                                           */
  /* ======================================================================= */
  function navigateTo(route) {
    const targetRoute = route.replace('#', '') || 'home';
    const targetView = document.getElementById(`view-${targetRoute}`);
    
    if (!targetView) {
      console.warn(`Route view-${targetRoute} not found, defaulting to home`);
      navigateTo('home');
      return;
    }

    // Hide all views
    document.querySelectorAll('.spa-view').forEach(view => {
      view.classList.remove('active-view');
    });

    // Show target view
    targetView.classList.add('active-view');
    state.currentRoute = targetRoute;

    // Update Nav links active states
    document.querySelectorAll('.top-nav-link, .sidebar-link').forEach(link => {
      const linkRoute = link.getAttribute('href')?.replace('#', '');
      if (linkRoute === targetRoute) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // View specific re-initializations
    if (targetRoute === 'dashboard') {
      renderTradeJournal();
      initTradingViewWidget();
    } else if (targetRoute === 'tangga') {
      renderMonthlyCompoundingTable();
      renderDailyGuide(state.selectedMonth);
      render100TanggaSaldoTable();
    } else if (targetRoute === 'metode') {
      calculateGTLevels();
    }
  }

  // Listen to Hash Changes
  window.addEventListener('hashchange', () => {
    navigateTo(window.location.hash);
  });

  // Initial Route Check
  navigateTo(window.location.hash || 'home');

  /* ======================================================================= */
  /* 2. SIDEBAR TOGGLE & NAVIGATION                                          */
  /* ======================================================================= */
  const sidebar = document.getElementById('sidebar');
  const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
  const contentArea = document.getElementById('contentArea');
  const footerArea = document.getElementById('footerArea');

  if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener('click', () => {
      const isCollapsed = sidebar.classList.toggle('collapsed');
      contentArea.classList.toggle('expanded', isCollapsed);
      footerArea.classList.toggle('expanded', isCollapsed);
    });
  }

  // Mobile menu close on link click
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 900) {
        sidebar.classList.remove('active-mobile');
      }
    });
  });

  /* ======================================================================= */
  /* 3. MARKET CLOCK & TRADING SESSIONS                                      */
  /* ======================================================================= */
  function updateMarketClock() {
    const clockEl = document.getElementById('marketClock');
    if (!clockEl) return;

    const now = new Date();
    const utcHours = now.getUTCHours();

    let activeSession = 'Sydney/Tokyo';
    if (utcHours >= 8 && utcHours < 13) activeSession = 'London Session 🟢';
    else if (utcHours >= 13 && utcHours < 17) activeSession = 'London + NY Overlap 🔥';
    else if (utcHours >= 17 && utcHours < 22) activeSession = 'New York Session 🟢';

    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    clockEl.innerHTML = `<span class="clock-dot"></span> ${timeStr} WIB | ${activeSession}`;
  }
  setInterval(updateMarketClock, 1000);
  updateMarketClock();

  /* ======================================================================= */
  /* 4. PRECISION COMPOUNDING ENGINE (CINDO.PAGES.DEV LOGIC)                */
  /* ======================================================================= */
  
  // A. Rencana Compounding Bulanan Gold (12 Levels)
  const monthlyData = [
    { level: 1, month: "Mei 2026", lot: "0.01", pips: "5.000 Poin (500 Pip)", start: 50, profit: 50, end: 100, growth: ">100%" },
    { level: 2, month: "Juni 2026", lot: "0.02", pips: "5.000 Poin (500 Pip)", start: 100, profit: 100, end: 200, growth: ">100%" },
    { level: 3, month: "Juli 2026", lot: "0.04", pips: "5.000 Poin (500 Pip)", start: 200, profit: 200, end: 400, growth: ">100%" },
    { level: 4, month: "Agustus 2026", lot: "0.08", pips: "5.000 Poin (500 Pip)", start: 400, profit: 400, end: 800, growth: ">100%" },
    { level: 5, month: "September 2026", lot: "0.16", pips: "5.000 Poin (500 Pip)", start: 800, profit: 800, end: 1600, growth: ">100%" },
    { level: 6, month: "Oktober 2026", lot: "0.32", pips: "5.000 Poin (500 Pip)", start: 1600, profit: 1600, end: 3200, growth: ">100%" },
    { level: 7, month: "November 2026", lot: "0.64", pips: "5.000 Poin (500 Pip)", start: 3200, profit: 3200, end: 6400, growth: ">100%" },
    { level: 8, month: "Desember 2026", lot: "1.28", pips: "5.000 Poin (500 Pip)", start: 6400, profit: 6400, end: 12800, growth: ">100%" },
    { level: 9, month: "Januari 2027", lot: "2.56", pips: "5.000 Poin (500 Pip)", start: 12800, profit: 12800, end: 25600, growth: ">100%" },
    { level: 10, month: "Februari 2027", lot: "5.12", pips: "5.000 Poin (500 Pip)", start: 25600, profit: 25600, end: 51200, growth: ">100%" },
    { level: 11, month: "Maret 2027", lot: "10.24", pips: "5.000 Poin (500 Pip)", start: 51200, profit: 51200, end: 102400, growth: ">100%" },
    { level: 12, month: "April 2027", lot: "20.48", pips: "5.000 Poin (500 Pip)", start: 102400, profit: 102400, end: 204800, growth: ">100%" }
  ];

  function renderMonthlyCompoundingTable() {
    const tbody = document.getElementById('monthlyCompoundingBody');
    if (!tbody) return;

    let html = '';
    monthlyData.forEach(row => {
      const fmtStart = row.start.toLocaleString('id-ID');
      const fmtProfit = row.profit.toLocaleString('id-ID');
      const fmtEnd = row.end.toLocaleString('id-ID');

      html += `
        <tr>
          <td>
            <strong>${row.month}</strong><br>
            <small style="color:var(--text-muted);">Level ${row.level}</small>
          </td>
          <td><span class="badge-kaizen" style="padding: 2px 10px; font-size:0.8rem;">${row.lot} Lot</span></td>
          <td style="color: var(--accent-amber);">${row.pips}</td>
          <td style="font-weight:600;">$${fmtStart} USD</td>
          <td style="color: var(--color-success); font-weight:700;">+$${fmtProfit} USD</td>
          <td style="color: var(--accent-cyan); font-weight:800; font-size:1rem;">$${fmtEnd} USD</td>
          <td><span style="color: var(--accent-lime); font-weight:700;">${row.growth}</span></td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  }

  // B. Panduan Kerja Harian (Target 4% / Hari - 20 Hari Kerja)
  function renderDailyGuide(monthLevel) {
    const container = document.getElementById('dailyGuideGrid');
    const headerInfo = document.getElementById('dailyGuideHeader');
    if (!container) return;

    const currentM = monthlyData.find(m => m.level === monthLevel) || monthlyData[0];
    let startBal = currentM.start;
    const baseLot = parseFloat(currentM.lot);

    if (headerInfo) {
      headerInfo.innerHTML = `
        <div class="grid-4" style="margin-bottom: 1.25rem;">
          <div class="gt-metric-card">
            <div class="gt-metric-title">Modal Awal Bulan ${monthLevel}</div>
            <div class="gt-metric-value">$${startBal.toLocaleString('id-ID')} USD</div>
          </div>
          <div class="gt-metric-card">
            <div class="gt-metric-title">Target Harian</div>
            <div class="gt-metric-value" style="color:var(--accent-lime);">4.0% / Hari</div>
          </div>
          <div class="gt-metric-card">
            <div class="gt-metric-title">Total Hari Kerja</div>
            <div class="gt-metric-value">20 Hari</div>
          </div>
          <div class="gt-metric-card">
            <div class="gt-metric-title">Proyeksi Akhir</div>
            <div class="gt-metric-value" style="color:var(--color-success);">+$${(startBal * 1.191).toFixed(2)} USD</div>
          </div>
        </div>
      `;
    }

    let cardsHtml = '';
    let currBal = startBal;

    for (let day = 1; day <= 20; day++) {
      const targetUsd = currBal * 0.04;
      // Calculate Lot proportionally to balance: (currBal / 50) * 0.01
      const dayLot = Math.max(0.01, parseFloat((currBal * 0.01 / 50).toFixed(2)));
      // Target pips: targetUsd / (dayLot * 10)
      const dayPips = Math.round((targetUsd / (dayLot * 10)) * 10); // in points
      const endBal = currBal + targetUsd;

      cardsHtml += `
        <div class="gt-metric-card" style="border-top: 3px solid var(--accent-cyan); background: rgba(11,21,40,0.85);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
            <span style="font-weight:700; color:var(--accent-cyan); font-size:0.9rem;">Hari ${day}</span>
            <span class="badge-kaizen" style="padding: 2px 8px; font-size:0.75rem;">+$${targetUsd.toFixed(2)} USD</span>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.5rem; font-size:0.82rem; margin-bottom:0.6rem; color:var(--text-secondary);">
            <div>Lot: <strong style="color:var(--text-primary);">${dayLot}</strong></div>
            <div>Target: <strong style="color:var(--accent-amber);">${dayPips} Pts (${(dayPips/10).toFixed(0)} Pip)</strong></div>
          </div>
          <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top:0.4rem; display:flex; justify-content:space-between; font-size:0.85rem;">
            <span style="color:var(--text-muted);">Saldo Akhir:</span>
            <strong style="color:var(--accent-lime); font-family:var(--font-mono);">$${endBal.toFixed(2)}</strong>
          </div>
        </div>
      `;

      currBal = endBal;
    }

    container.innerHTML = cardsHtml;
  }

  // Month selector buttons listener
  const monthBtnContainer = document.getElementById('monthBtnGroup');
  if (monthBtnContainer) {
    monthBtnContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('month-select-btn')) {
        document.querySelectorAll('.month-select-btn').forEach(btn => btn.classList.remove('btn-primary'));
        e.target.classList.add('btn-primary');
        state.selectedMonth = parseInt(e.target.getAttribute('data-month'));
        renderDailyGuide(state.selectedMonth);
      }
    });
  }

  // C. 100 Tangga Kebun Saldo (Urutan 100 ke 1 Presisi)
  function getLotBracketBySaldo(saldo) {
    if (saldo < 20) return { min: "0.01", max: "0.01" };
    if (saldo < 30) return { min: "0.01", max: "0.02" };
    if (saldo < 50) return { min: "0.01", max: "0.03" };
    if (saldo < 100) return { min: "0.02", max: "0.04" };
    if (saldo < 200) return { min: "0.05", max: "0.10" };
    if (saldo < 500) return { min: "0.10", max: "0.20" };
    if (saldo < 1000) return { min: "0.25", max: "0.50" };
    if (saldo < 2500) return { min: "0.50", max: "1.00" };
    if (saldo < 5000) return { min: "1.25", max: "2.50" };
    if (saldo < 10000) return { min: "2.50", max: "5.00" };
    if (saldo < 25000) return { min: "5.00", max: "10.00" };
    if (saldo < 50000) return { min: "12.50", max: "25.00" };
    if (saldo < 100000) return { min: "25.00", max: "50.00" };
    return { min: "50.00", max: "100.00" };
  }

  function render100TanggaSaldoTable() {
    const tbody = document.getElementById('tanggaSaldoBody');
    if (!tbody) return;

    let html = '';
    // Scaled smooth exponential 100 level progression from $204,800 down to $1
    // Formula: Saldo(level) = 50 * (2^((level-1)/9)) approx
    for (let level = 100; level >= 1; level--) {
      // Exponential curve from level 1 ($1) to level 100 ($204,800)
      const saldo = Math.round(50 * Math.pow(2, (level - 1) / 8.25));
      const lot = getLotBracketBySaldo(saldo);
      const target500PtsUsd = (parseFloat(lot.max) * 50).toFixed(2);
      
      const isMilestone = (level % 10 === 0);
      const rowClass = isMilestone ? 'highlight-tangga' : '';

      html += `
        <tr class="${rowClass}">
          <td><strong>Tangga ${level}</strong> ${isMilestone ? '⭐' : ''}</td>
          <td style="color: var(--accent-lime); font-weight:700;">$${saldo.toLocaleString('id-ID')} USD</td>
          <td><span style="color:var(--accent-cyan);">${lot.min}</span> - <span style="color:var(--accent-lime); font-weight:700;">${lot.max} Lot</span></td>
          <td style="color: var(--accent-amber); font-weight:700;">+$${target500PtsUsd.toLocaleString('id-ID')} USD</td>
          <td><span class="badge-kaizen" style="padding: 2px 10px; font-size: 0.75rem;">Level ${level}</span></td>
        </tr>
      `;
    }
    tbody.innerHTML = html;
  }

  /* ======================================================================= */
  /* 5. METODE GT MATHEMATICAL CALCULATOR & CANVAS                            */
  /* ======================================================================= */
  function calculateGTLevels() {
    const open = parseFloat(document.getElementById('gtOpen')?.value || 1.0850);
    const high = parseFloat(document.getElementById('gtHigh')?.value || 1.0890);
    const low = parseFloat(document.getElementById('gtLow')?.value || 1.0820);
    const close = parseFloat(document.getElementById('gtClose')?.value || 1.0875);

    const atas = Math.max(open, close);
    const bawah = Math.min(open, close);
    const neto = Math.abs(close - open);
    const jangkauan = high - low;

    // Display Results
    if (document.getElementById('resTinggi')) document.getElementById('resTinggi').innerText = high.toFixed(4);
    if (document.getElementById('resAtas')) document.getElementById('resAtas').innerText = atas.toFixed(4);
    if (document.getElementById('resAwal')) document.getElementById('resAwal').innerText = open.toFixed(4);
    if (document.getElementById('resInti')) document.getElementById('resInti').innerText = close.toFixed(4);
    if (document.getElementById('resBawah')) document.getElementById('resBawah').innerText = bawah.toFixed(4);
    if (document.getElementById('resRendah')) document.getElementById('resRendah').innerText = low.toFixed(4);
    if (document.getElementById('resNeto')) document.getElementById('resNeto').innerText = neto.toFixed(4);
    if (document.getElementById('resJangkauan')) document.getElementById('resJangkauan').innerText = jangkauan.toFixed(4);

    drawGTCandleCanvas(open, high, low, close, atas, bawah);
  }

  function drawGTCandleCanvas(open, high, low, close, atas, bawah) {
    const canvas = document.getElementById('gtCandleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const pad = 40;
    const minP = low - (high - low) * 0.1;
    const maxP = high + (high - low) * 0.1;
    const mapY = (val) => h - pad - ((val - minP) / (maxP - minP)) * (h - 2 * pad);

    const levels = [
      { val: high, label: `Tinggi: ${high.toFixed(4)}`, color: '#ef4444' },
      { val: atas, label: `Atas: ${atas.toFixed(4)}`, color: '#f59e0b' },
      { val: close, label: `Inti (Close): ${close.toFixed(4)}`, color: '#19bcb8' },
      { val: open, label: `Awal (Open): ${open.toFixed(4)}`, color: '#8668fc' },
      { val: bawah, label: `Bawah: ${bawah.toFixed(4)}`, color: '#f59e0b' },
      { val: low, label: `Rendah: ${low.toFixed(4)}`, color: '#10b981' }
    ];

    levels.forEach(lvl => {
      const y = mapY(lvl.val);
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = lvl.color;
      ctx.lineWidth = 1;
      ctx.moveTo(pad, y);
      ctx.lineTo(w - pad, y);
      ctx.stroke();

      ctx.font = '11px JetBrains Mono';
      ctx.fillStyle = lvl.color;
      ctx.fillText(lvl.label, w - pad - 140, y - 4);
    });

    const isBull = close >= open;
    const candleColor = isBull ? '#10b981' : '#ef4444';
    const cx = w / 3;
    const bodyW = 50;

    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.strokeStyle = candleColor;
    ctx.lineWidth = 3;
    ctx.moveTo(cx, mapY(high));
    ctx.lineTo(cx, mapY(low));
    ctx.stroke();

    const yOpen = mapY(open);
    const yClose = mapY(close);
    const bodyY = Math.min(yOpen, yClose);
    const bodyH = Math.max(Math.abs(yClose - yOpen), 4);

    ctx.fillStyle = candleColor;
    ctx.fillRect(cx - bodyW / 2, bodyY, bodyW, bodyH);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - bodyW / 2, bodyY, bodyW, bodyH);
  }

  const gtForm = document.getElementById('gtCalcForm');
  if (gtForm) {
    gtForm.addEventListener('submit', (e) => {
      e.preventDefault();
      calculateGTLevels();
    });
  }

  /* ======================================================================= */
  /* 6. DASHBOARD & TRADE JOURNAL ENGINE                                     */
  /* ======================================================================= */
  const txForm = document.getElementById('transactionForm');
  if (txForm) {
    txForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const symbol = document.getElementById('asset').value;
      const type = document.getElementById('type').value;
      const lot = parseFloat(document.getElementById('amount').value);
      const entry = parseFloat(document.getElementById('entry').value);
      const exit = parseFloat(document.getElementById('exit').value) || entry;
      const notes = document.getElementById('notes').value || 'GT Sinyal Execution';

      let pl = 0;
      if (type === 'buy') {
        pl = (exit - entry) * lot * (symbol.includes('XAU') ? 100 : 100000);
      } else {
        pl = (entry - exit) * lot * (symbol.includes('XAU') ? 100 : 100000);
      }

      const newTrade = {
        id: Date.now(),
        date: new Date().toLocaleDateString('id-ID'),
        symbol,
        type,
        lot,
        entry,
        exit,
        pl: parseFloat(pl.toFixed(2)),
        notes
      };

      state.trades.unshift(newTrade);
      localStorage.setItem('gt_trades', JSON.stringify(state.trades));

      if (pl > 0 && typeof confetti === 'function') {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      }

      txForm.reset();
      renderTradeJournal();
    });
  }

  const resetBtn = document.getElementById('resetButton');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm("Apakah Anda yakin ingin mereset seluruh jurnal transaksi GT?")) {
        state.trades = [];
        localStorage.removeItem('gt_trades');
        renderTradeJournal();
      }
    });
  }

  function renderTradeJournal() {
    const tbody = document.getElementById('transactionBody');
    if (!tbody) return;

    if (state.trades.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color: var(--text-muted);">Belum ada transaksi. Tambahkan melalui form di atas.</td></tr>`;
      updateKPISummary(0, 0, 0, 0);
      renderEquityChart([]);
      return;
    }

    let html = '';
    let totalPL = 0;
    let wins = 0;

    state.trades.forEach(t => {
      totalPL += t.pl;
      if (t.pl > 0) wins++;

      const plColor = t.pl >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
      const typeBadge = t.type === 'buy' 
        ? '<span style="color:var(--color-success); font-weight:700;">BUY</span>'
        : '<span style="color:var(--color-danger); font-weight:700;">SELL</span>';

      html += `
        <tr>
          <td>${t.date}</td>
          <td><strong>${t.symbol}</strong></td>
          <td>${typeBadge}</td>
          <td>${t.lot}</td>
          <td>${t.entry}</td>
          <td>${t.exit}</td>
          <td style="color: ${plColor}; font-weight: 700;">${t.pl >= 0 ? '+' : ''}${t.pl.toFixed(2)} USD</td>
          <td><small>${t.notes}</small></td>
        </tr>
      `;
    });

    tbody.innerHTML = html;

    const winRate = ((wins / state.trades.length) * 100).toFixed(1);
    const avgPL = (totalPL / state.trades.length).toFixed(2);

    updateKPISummary(state.trades.length, totalPL, avgPL, winRate);
    renderEquityChart(state.trades);
  }

  function updateKPISummary(total, pl, avg, winrate) {
    if (document.getElementById('totalTrades')) document.getElementById('totalTrades').innerText = total;
    if (document.getElementById('totalPL')) {
      const el = document.getElementById('totalPL');
      el.innerText = `${pl >= 0 ? '+' : ''}${pl.toFixed(2)} USD`;
      el.style.color = pl >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
    }
    if (document.getElementById('avgPL')) document.getElementById('avgPL').innerText = `${avg} USD`;
    if (document.getElementById('winRateVal')) document.getElementById('winRateVal').innerText = `${winrate}%`;
  }

  function renderEquityChart(trades) {
    const canvas = document.getElementById('transactionChart');
    if (!canvas) return;

    if (state.chartInstance) {
      state.chartInstance.destroy();
    }

    const reversedTrades = [...trades].reverse();
    let cum = 0;
    const dataPoints = reversedTrades.map(t => {
      cum += t.pl;
      return cum;
    });
    const labels = reversedTrades.map((t, idx) => `Trade ${idx + 1}`);

    if (typeof Chart === 'undefined') return;

    state.chartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels.length ? labels : ['Start'],
        datasets: [{
          label: 'Pertumbuhan Ekuitas (USD)',
          data: dataPoints.length ? dataPoints : [0],
          borderColor: '#19bcb8',
          backgroundColor: 'rgba(25, 188, 184, 0.15)',
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: '#bce13e'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#94a3b8' } } },
        scales: {
          x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  }

  /* ======================================================================= */
  /* 7. TRADINGVIEW LIVE WIDGET MANAGER                                      */
  /* ======================================================================= */
  function initTradingViewWidget() {
    const container = document.getElementById('tradingview_chart');
    if (!container || container.children.length > 0) return;

    if (typeof TradingView !== 'undefined') {
      new TradingView.widget({
        "autosize": true,
        "symbol": "BINANCE:BTCUSDT",
        "interval": "60",
        "timezone": "Asia/Jakarta",
        "theme": "dark",
        "style": "1",
        "locale": "id",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "container_id": "tradingview_chart"
      });
    }
  }

  /* ======================================================================= */
  /* 8. KAIZEN DISCIPLINE CHECKLIST ENGINE                                   */
  /* ======================================================================= */
  document.querySelectorAll('.kaizen-check').forEach(chk => {
    if (state.kaizenState[chk.id]) {
      chk.checked = true;
    }

    chk.addEventListener('change', () => {
      state.kaizenState[chk.id] = chk.checked;
      localStorage.setItem('gt_kaizen', JSON.stringify(state.kaizenState));
    });
  });

  /* ======================================================================= */
  /* 9. RISK / REWARD & POSITION SIZE CALCULATOR                              */
  /* ======================================================================= */
  const riskForm = document.getElementById('riskCalcForm');
  if (riskForm) {
    riskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const balance = parseFloat(document.getElementById('riskBalance').value);
      const riskPercent = parseFloat(document.getElementById('riskPercent').value);
      const slPips = parseFloat(document.getElementById('riskSLPips').value);

      const riskUsd = (balance * (riskPercent / 100));
      const maxLot = (riskUsd / (slPips * 10)).toFixed(2);

      if (document.getElementById('resRiskUsd')) document.getElementById('resRiskUsd').innerText = `$${riskUsd.toFixed(2)} USD`;
      if (document.getElementById('resMaxLot')) document.getElementById('resMaxLot').innerText = `${maxLot} Lot`;
    });
  }

});
