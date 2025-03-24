// Tema Gelap/Terang
const themeToggle = document.getElementById('disableDarkMode');

if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    if (document.body.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light');
    } else {
        localStorage.setItem('theme', 'dark');
    }
});

// Logika Dashboard
if (document.getElementById('transactionForm')) {
    const validSymbols = ['EURUSD', 'XAUUSD', 'BTC', 'ETH'];
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    updateTable();
    updateSummary();

    document.getElementById('transactionForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';

        try {
            const asset = document.getElementById('asset').value.toUpperCase();
            const type = document.getElementById('type').value;
            const amount = parseFloat(document.getElementById('amount').value);
            const entry = parseFloat(document.getElementById('entry').value);
            const exit = document.getElementById('exit').value ? parseFloat(document.getElementById('exit').value) : null;
            const notes = document.getElementById('notes').value;

            if (!validSymbols.includes(asset)) {
                throw new Error('Simbol tidak valid. Gunakan EURUSD, XAUUSD, BTC, atau ETH.');
            }

            if (isNaN(amount) || isNaN(entry) || (exit !== null && isNaN(exit))) {
                throw new Error('Harga atau ukuran tidak valid.');
            }

            let profitLoss = null;
            if (exit !== null) {
                if (asset === 'EURUSD') {
                    const pipValue = 0.0001;
                    const pipDifference = (exit - entry) / pipValue;
                    let baseProfit = pipDifference * 10.00 * amount;
                    profitLoss = type === 'buy' ? baseProfit : -baseProfit;
                } else if (asset === 'XAUUSD') {
                    const pointValue = 0.01;
                    const pointDifference = (entry - exit) / pointValue;
                    let baseProfit = pointDifference * 1.00 * amount;
                    profitLoss = type === 'buy' ? -baseProfit : baseProfit;
                } else {
                    profitLoss = type === 'buy' ? (exit - entry) * amount : (entry - exit) * amount;
                }
            }

            const transaction = {
                date: new Date().toLocaleString('id-ID'),
                asset,
                type,
                amount,
                entry,
                exit,
                profitLoss,
                notes
            };
            transactions.push(transaction);
            localStorage.setItem('transactions', JSON.stringify(transactions));
            this.reset();
            updateTable();
            updateSummary();
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        }
    });

    function updateTable() {
        const tbody = document.getElementById('transactionBody');
        tbody.innerHTML = '';

        transactions.forEach((t) => {
            const isEurUsd = t.asset === 'EURUSD';
            const entryDisplay = Number.isInteger(t.entry) ? t.entry : t.entry.toFixed(isEurUsd ? 5 : 2);
            const exitDisplay = t.exit !== null ? 
                (Number.isInteger(t.exit) ? t.exit : t.exit.toFixed(isEurUsd ? 5 : 2)) : 
                '-';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${t.date}</td>
                <td>${t.asset}</td>
                <td>${t.type}</td>
                <td>${t.amount.toFixed(2)}</td>
                <td>${entryDisplay}</td>
                <td>${exitDisplay}</td>
                <td>${t.profitLoss !== null ? t.profitLoss.toFixed(2) : '-'}</td>
                <td>${t.notes || '-'}</td>
            `;
            tbody.appendChild(row);
        });
    }

    function updateSummary() {
        const totalTrades = transactions.length;
        const totalPL = transactions.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
        const avgPL = totalTrades > 0 ? totalPL / totalTrades : 0;
        const btcTrades = transactions.filter(t => t.asset === 'BTC').length;
        const ethTrades = transactions.filter(t => t.asset === 'ETH').length;
        const forexTrades = transactions.filter(t => t.asset === 'EURUSD').length;
        const xauTrades = transactions.filter(t => t.asset === 'XAUUSD').length;

        document.getElementById('totalTrades').textContent = totalTrades;
        document.getElementById('totalPL').textContent = totalPL.toFixed(2);
        document.getElementById('avgPL').textContent = avgPL.toFixed(2);
        document.getElementById('btcTrades').textContent = btcTrades;
        document.getElementById('ethTrades').textContent = ethTrades;
        document.getElementById('forexTrades').textContent = forexTrades;
        document.getElementById('xauTrades').textContent = xauTrades;
    }

    document.getElementById('resetButton').addEventListener('click', function() {
        if (confirm('Apakah Anda yakin ingin mereset semua data transaksi?')) {
            transactions = [];
            localStorage.removeItem('transactions');
            updateTable();
            updateSummary();
        }
    });

    // Simulasi Pertumbuhan di Dashboard
    const data = [
        {transaksi: 11, volume: 10.00, targetPoin: 5000, modalAwal: 512.00, keuntungan: 500.00, modalAkhir: 1012.00, color: '#e74c3c'},
        {transaksi: 10, volume: 5.12, targetPoin: 5000, modalAwal: 256.00, keuntungan: 256.00, modalAkhir: 512.00, color: '#2ecc71'},
        {transaksi: 9, volume: 2.56, targetPoin: 5000, modalAwal: 128.00, keuntungan: 128.00, modalAkhir: 256.00, color: '#2ecc71'},
        {transaksi: 8, volume: 1.28, targetPoin: 5000, modalAwal: 64.00, keuntungan: 64.00, modalAkhir: 128.00, color: '#2ecc71'},
        {transaksi: 7, volume: 0.64, targetPoin: 5000, modalAwal: 32.00, keuntungan: 32.00, modalAkhir: 64.00, color: '#2ecc71'},
        {transaksi: 6, volume: 0.32, targetPoin: 5000, modalAwal: 16.00, keuntungan: 16.00, modalAkhir: 32.00, color: '#2ecc71'},
        {transaksi: 5, volume: 0.16, targetPoin: 5000, modalAwal: 8.00, keuntungan: 8.00, modalAkhir: 16.00, color: '#2ecc71'},
        {transaksi: 4, volume: 0.08, targetPoin: 5000, modalAwal: 4.00, keuntungan: 4.00, modalAkhir: 8.00, color: '#2ecc71'},
        {transaksi: 3, volume: 0.04, targetPoin: 5000, modalAwal: 2.00, keuntungan: 2.00, modalAkhir: 4.00, color: '#2ecc71'},
        {transaksi: 2, volume: 0.02, targetPoin: 5000, modalAwal: 1.00, keuntungan: 1.00, modalAkhir: 2.00, color: '#2ecc71'},
        {transaksi: 1, volume: 0.01, targetPoin: 5000, modalAwal: 0.50, keuntungan: 0.50, modalAkhir: 1.00, color: '#3498db'}
    ];

    function populateTable() {
        const tableBody = document.querySelector("#growthTable tbody");
        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.transaksi}</td>
                <td>${row.volume.toFixed(2)}</td>
                <td>${row.targetPoin}</td>
                <td>${row.modalAwal.toFixed(2)}</td>
                <td>${row.keuntungan.toFixed(2)}</td>
                <td>${row.modalAkhir.toFixed(2)}</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    const ctx = document.getElementById('growthChart')?.getContext('2d');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(row => `Transaksi ${row.transaksi}`),
                datasets: [{
                    label: 'Modal Akhir ($)',
                    data: data.map(row => row.modalAkhir),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.1,
                    pointBackgroundColor: data.map(row => row.color),
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Modal Akhir ($)' } },
                    x: { title: { display: true, text: 'Transaksi' } }
                },
                plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } }
            }
        });
    }

    if (document.getElementById('growthTable')) {
        window.onload = populateTable;
    }
}

// Logika 88 Levels dengan Data Statis
if (document.getElementById('levelTable')) {
    // Data statis untuk semua 106 level (88 hingga -17)
    const levelData = [
        { level: 88, initialBalance: 19350.00, volume: 16.00, targetProfitLoss: 1600.00, ifProfit: 20950.00, ifLoss: 17750.00, nextLevelBalance: 20950.00, color: '#e74c3c' },
        { level: 87, initialBalance: 17850.00, volume: 15.00, targetProfitLoss: 1500.00, ifProfit: 19350.00, ifLoss: 16350.00, nextLevelBalance: 19350.00, color: '#e74c3c' },
        { level: 86, initialBalance: 16450.00, volume: 14.00, targetProfitLoss: 1400.00, ifProfit: 17850.00, ifLoss: 15050.00, nextLevelBalance: 17850.00, color: '#e74c3c' },
        { level: 85, initialBalance: 15150.00, volume: 13.00, targetProfitLoss: 1300.00, ifProfit: 16450.00, ifLoss: 13850.00, nextLevelBalance: 16450.00, color: '#e74c3c' },
        { level: 84, initialBalance: 13950.00, volume: 12.00, targetProfitLoss: 1200.00, ifProfit: 15150.00, ifLoss: 12750.00, nextLevelBalance: 15150.00, color: '#e74c3c' },
        { level: 83, initialBalance: 12850.00, volume: 11.00, targetProfitLoss: 1100.00, ifProfit: 13950.00, ifLoss: 11750.00, nextLevelBalance: 13950.00, color: '#e74c3c' },
        { level: 82, initialBalance: 11850.00, volume: 10.00, targetProfitLoss: 1000.00, ifProfit: 12850.00, ifLoss: 10850.00, nextLevelBalance: 12850.00, color: '#e74c3c' },
        { level: 81, initialBalance: 10900.00, volume: 9.50, targetProfitLoss: 950.00, ifProfit: 11850.00, ifLoss: 9950.00, nextLevelBalance: 11850.00, color: '#e74c3c' },
        { level: 80, initialBalance: 10000.00, volume: 9.00, targetProfitLoss: 900.00, ifProfit: 10900.00, ifLoss: 9100.00, nextLevelBalance: 10900.00, color: '#e74c3c' },
        { level: 79, initialBalance: 9150.00, volume: 8.50, targetProfitLoss: 850.00, ifProfit: 10000.00, ifLoss: 8300.00, nextLevelBalance: 10000.00, color: '#2ecc71' },
        { level: 78, initialBalance: 8350.00, volume: 8.00, targetProfitLoss: 800.00, ifProfit: 9150.00, ifLoss: 7550.00, nextLevelBalance: 9150.00, color: '#2ecc71' },
        { level: 77, initialBalance: 7600.00, volume: 7.50, targetProfitLoss: 750.00, ifProfit: 8350.00, ifLoss: 6850.00, nextLevelBalance: 8350.00, color: '#2ecc71' },
        { level: 76, initialBalance: 6900.00, volume: 7.00, targetProfitLoss: 700.00, ifProfit: 7600.00, ifLoss: 6200.00, nextLevelBalance: 7600.00, color: '#2ecc71' },
        { level: 75, initialBalance: 6250.00, volume: 6.50, targetProfitLoss: 650.00, ifProfit: 6900.00, ifLoss: 5600.00, nextLevelBalance: 6900.00, color: '#2ecc71' },
        { level: 74, initialBalance: 5650.00, volume: 6.00, targetProfitLoss: 600.00, ifProfit: 6250.00, ifLoss: 5050.00, nextLevelBalance: 6250.00, color: '#2ecc71' },
        { level: 73, initialBalance: 5100.00, volume: 5.50, targetProfitLoss: 550.00, ifProfit: 5650.00, ifLoss: 4550.00, nextLevelBalance: 5650.00, color: '#2ecc71' },
        { level: 72, initialBalance: 4600.00, volume: 5.00, targetProfitLoss: 500.00, ifProfit: 5100.00, ifLoss: 4100.00, nextLevelBalance: 5100.00, color: '#2ecc71' },
        { level: 71, initialBalance: 4150.00, volume: 4.50, targetProfitLoss: 450.00, ifProfit: 4600.00, ifLoss: 3700.00, nextLevelBalance: 4600.00, color: '#2ecc71' },
        { level: 70, initialBalance: 3750.00, volume: 4.00, targetProfitLoss: 400.00, ifProfit: 4150.00, ifLoss: 3350.00, nextLevelBalance: 4150.00, color: '#2ecc71' },
        { level: 69, initialBalance: 3400.00, volume: 3.75, targetProfitLoss: 350.00, ifProfit: 3750.00, ifLoss: 3050.00, nextLevelBalance: 3750.00, color: '#2ecc71' },
        { level: 68, initialBalance: 3100.00, volume: 3.50, targetProfitLoss: 300.00, ifProfit: 3400.00, ifLoss: 2800.00, nextLevelBalance: 3400.00, color: '#2ecc71' },
        { level: 67, initialBalance: 2850.00, volume: 3.25, targetProfitLoss: 250.00, ifProfit: 3100.00, ifLoss: 2600.00, nextLevelBalance: 3100.00, color: '#2ecc71' },
        { level: 66, initialBalance: 2625.00, volume: 3.00, targetProfitLoss: 225.00, ifProfit: 2850.00, ifLoss: 2400.00, nextLevelBalance: 2850.00, color: '#2ecc71' },
        { level: 65, initialBalance: 2425.00, volume: 2.75, targetProfitLoss: 200.00, ifProfit: 2625.00, ifLoss: 2225.00, nextLevelBalance: 2625.00, color: '#2ecc71' },
        { level: 64, initialBalance: 2250.00, volume: 2.50, targetProfitLoss: 175.00, ifProfit: 2425.00, ifLoss: 2075.00, nextLevelBalance: 2425.00, color: '#2ecc71' },
        { level: 63, initialBalance: 2100.00, volume: 2.25, targetProfitLoss: 150.00, ifProfit: 2250.00, ifLoss: 1950.00, nextLevelBalance: 2250.00, color: '#2ecc71' },
        { level: 62, initialBalance: 1975.00, volume: 2.00, targetProfitLoss: 125.00, ifProfit: 2100.00, ifLoss: 1850.00, nextLevelBalance: 2100.00, color: '#2ecc71' },
        { level: 61, initialBalance: 1875.00, volume: 1.90, targetProfitLoss: 100.00, ifProfit: 1975.00, ifLoss: 1775.00, nextLevelBalance: 1975.00, color: '#2ecc71' },
        { level: 60, initialBalance: 1800.00, volume: 1.80, targetProfitLoss: 75.00, ifProfit: 1875.00, ifLoss: 1725.00, nextLevelBalance: 1875.00, color: '#2ecc71' },
        { level: 59, initialBalance: 1725.00, volume: 1.70, targetProfitLoss: 75.00, ifProfit: 1800.00, ifLoss: 1650.00, nextLevelBalance: 1800.00, color: '#2ecc71' },
        { level: 58, initialBalance: 1650.00, volume: 1.60, targetProfitLoss: 75.00, ifProfit: 1725.00, ifLoss: 1575.00, nextLevelBalance: 1725.00, color: '#2ecc71' },
        { level: 57, initialBalance: 1575.00, volume: 1.50, targetProfitLoss: 75.00, ifProfit: 1650.00, ifLoss: 1500.00, nextLevelBalance: 1650.00, color: '#2ecc71' },
        { level: 56, initialBalance: 1500.00, volume: 1.40, targetProfitLoss: 75.00, ifProfit: 1575.00, ifLoss: 1425.00, nextLevelBalance: 1575.00, color: '#2ecc71' },
        { level: 55, initialBalance: 1425.00, volume: 1.30, targetProfitLoss: 75.00, ifProfit: 1500.00, ifLoss: 1350.00, nextLevelBalance: 1500.00, color: '#2ecc71' },
        { level: 54, initialBalance: 1350.00, volume: 1.20, targetProfitLoss: 75.00, ifProfit: 1425.00, ifLoss: 1275.00, nextLevelBalance: 1425.00, color: '#2ecc71' },
        { level: 53, initialBalance: 1275.00, volume: 1.10, targetProfitLoss: 75.00, ifProfit: 1350.00, ifLoss: 1200.00, nextLevelBalance: 1350.00, color: '#2ecc71' },
        { level: 52, initialBalance: 1200.00, volume: 1.00, targetProfitLoss: 75.00, ifProfit: 1275.00, ifLoss: 1125.00, nextLevelBalance: 1275.00, color: '#2ecc71' },
        { level: 51, initialBalance: 1125.00, volume: 0.95, targetProfitLoss: 75.00, ifProfit: 1200.00, ifLoss: 1050.00, nextLevelBalance: 1200.00, color: '#2ecc71' },
        { level: 50, initialBalance: 1050.00, volume: 0.90, targetProfitLoss: 75.00, ifProfit: 1125.00, ifLoss: 975.00, nextLevelBalance: 1125.00, color: '#2ecc71' },
        { level: 49, initialBalance: 975.00, volume: 0.85, targetProfitLoss: 75.00, ifProfit: 1050.00, ifLoss: 900.00, nextLevelBalance: 1050.00, color: '#2ecc71' },
        { level: 48, initialBalance: 900.00, volume: 0.80, targetProfitLoss: 75.00, ifProfit: 975.00, ifLoss: 825.00, nextLevelBalance: 975.00, color: '#2ecc71' },
        { level: 47, initialBalance: 825.00, volume: 0.75, targetProfitLoss: 75.00, ifProfit: 900.00, ifLoss: 750.00, nextLevelBalance: 900.00, color: '#2ecc71' },
        { level: 46, initialBalance: 750.00, volume: 0.70, targetProfitLoss: 75.00, ifProfit: 825.00, ifLoss: 675.00, nextLevelBalance: 825.00, color: '#2ecc71' },
        { level: 45, initialBalance: 675.00, volume: 0.65, targetProfitLoss: 75.00, ifProfit: 750.00, ifLoss: 600.00, nextLevelBalance: 750.00, color: '#2ecc71' },
        { level: 44, initialBalance: 600.00, volume: 0.60, targetProfitLoss: 75.00, ifProfit: 675.00, ifLoss: 525.00, nextLevelBalance: 675.00, color: '#2ecc71' },
        { level: 43, initialBalance: 525.00, volume: 0.55, targetProfitLoss: 75.00, ifProfit: 600.00, ifLoss: 450.00, nextLevelBalance: 600.00, color: '#2ecc71' },
        { level: 42, initialBalance: 450.00, volume: 0.50, targetProfitLoss: 75.00, ifProfit: 525.00, ifLoss: 375.00, nextLevelBalance: 525.00, color: '#2ecc71' },
        { level: 41, initialBalance: 375.00, volume: 0.45, targetProfitLoss: 75.00, ifProfit: 450.00, ifLoss: 300.00, nextLevelBalance: 450.00, color: '#2ecc71' },
        { level: 40, initialBalance: 300.00, volume: 0.40, targetProfitLoss: 75.00, ifProfit: 375.00, ifLoss: 225.00, nextLevelBalance: 375.00, color: '#2ecc71' },
        { level: 39, initialBalance: 225.00, volume: 0.35, targetProfitLoss: 75.00, ifProfit: 300.00, ifLoss: 150.00, nextLevelBalance: 300.00, color: '#2ecc71' },
        { level: 38, initialBalance: 150.00, volume: 0.30, targetProfitLoss: 75.00, ifProfit: 225.00, ifLoss: 75.00, nextLevelBalance: 225.00, color: '#2ecc71' },
        { level: 37, initialBalance: 75.00, volume: 0.25, targetProfitLoss: 75.00, ifProfit: 150.00, ifLoss: 0.00, nextLevelBalance: 150.00, color: '#2ecc71' },
        { level: 36, initialBalance: 0.00, volume: 0.20, targetProfitLoss: 75.00, ifProfit: 75.00, ifLoss: 0.00, nextLevelBalance: 75.00, color: '#2ecc71' },
        { level: 35, initialBalance: 0.00, volume: 0.19, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 34, initialBalance: 0.00, volume: 0.18, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 33, initialBalance: 0.00, volume: 0.17, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 32, initialBalance: 0.00, volume: 0.16, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 31, initialBalance: 0.00, volume: 0.15, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 30, initialBalance: 0.00, volume: 0.14, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 29, initialBalance: 0.00, volume: 0.13, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 28, initialBalance: 0.00, volume: 0.12, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 27, initialBalance: 0.00, volume: 0.11, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 26, initialBalance: 0.00, volume: 0.10, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 25, initialBalance: 0.00, volume: 0.09, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 24, initialBalance: 0.00, volume: 0.08, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 23, initialBalance: 0.00, volume: 0.07, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 22, initialBalance: 0.00, volume: 0.06, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 21, initialBalance: 0.00, volume: 0.05, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 20, initialBalance: 0.00, volume: 0.04, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 19, initialBalance: 0.00, volume: 0.03, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 18, initialBalance: 0.00, volume: 0.02, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 17, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 16, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 15, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 14, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 13, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 12, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 11, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 10, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 9, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 8, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 7, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 6, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 5, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 4, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 3, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 2, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 1, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: 0, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: -1, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: -2, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: -3, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: -4, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: -5, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: -6, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: -7, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: -8, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: -9, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#2ecc71' },
        { level: -10, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#3498db' },
        { level: -11, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#3498db' },
        { level: -12, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#3498db' },
        { level: -13, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#3498db' },
        { level: -14, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#3498db' },
        { level: -15, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#3498db' },
        { level: -16, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#3498db' },
        { level: -17, initialBalance: 0.00, volume: 0.01, targetProfitLoss: 0.00, ifProfit: 0.00, ifLoss: 0.00, nextLevelBalance: 0.00, color: '#3498db' }
    ];

    const ctxEquity = document.getElementById('equityChart')?.getContext('2d');
    if (ctxEquity) {
        new Chart(ctxEquity, {
            type: 'line',
            data: {
                labels: levelData.map(row => `Level ${row.level}`),
                datasets: [{
                    label: 'Saldo Awal Perdagangan ($)',
                    data: levelData.map(row => row.initialBalance),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.1,
                    pointBackgroundColor: levelData.map(row => row.color),
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Saldo Awal ($)' } },
                    x: { title: { display: true, text: 'Level' } }
                },
                plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } }
            }
        });
    } else {
        console.error('Canvas #equityChart not found');
    }
}
