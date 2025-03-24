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

// Logika 88 Levels
if (document.getElementById('levelTable')) {
    // Data awal hanya sampai level 54 sebagai titik start
    const levelData = [
        { level: 88, initialBalance: 100000.00, volume: 100.00, targetProfitLoss: 10000.00, ifProfit: 110000.00, ifLoss: 90000.00, nextLevelBalance: 110000.00, color: '#e74c3c' },
        { level: 87, initialBalance: 91000.00, volume: 90.00, targetProfitLoss: 9000.00, ifProfit: 100000.00, ifLoss: 82000.00, nextLevelBalance: 100000.00, color: '#2ecc71' },
        { level: 86, initialBalance: 82000.00, volume: 80.00, targetProfitLoss: 8000.00, ifProfit: 90000.00, ifLoss: 74000.00, nextLevelBalance: 91000.00, color: '#2ecc71' },
        { level: 85, initialBalance: 74000.00, volume: 70.00, targetProfitLoss: 7000.00, ifProfit: 81000.00, ifLoss: 67000.00, nextLevelBalance: 82000.00, color: '#2ecc71' },
        { level: 84, initialBalance: 67000.00, volume: 60.00, targetProfitLoss: 6000.00, ifProfit: 73000.00, ifLoss: 61000.00, nextLevelBalance: 74000.00, color: '#2ecc71' },
        { level: 83, initialBalance: 61000.00, volume: 60.00, targetProfitLoss: 6000.00, ifProfit: 67000.00, ifLoss: 55000.00, nextLevelBalance: 67000.00, color: '#2ecc71' },
        { level: 82, initialBalance: 55000.00, volume: 50.00, targetProfitLoss: 5000.00, ifProfit: 60000.00, ifLoss: 50000.00, nextLevelBalance: 61000.00, color: '#2ecc71' },
        { level: 81, initialBalance: 50000.00, volume: 50.00, targetProfitLoss: 5000.00, ifProfit: 55000.00, ifLoss: 45000.00, nextLevelBalance: 55000.00, color: '#2ecc71' },
        { level: 80, initialBalance: 45000.00, volume: 40.00, targetProfitLoss: 4000.00, ifProfit: 49000.00, ifLoss: 41000.00, nextLevelBalance: 50000.00, color: '#2ecc71' },
        { level: 79, initialBalance: 41000.00, volume: 40.00, targetProfitLoss: 4000.00, ifProfit: 45000.00, ifLoss: 37000.00, nextLevelBalance: 45000.00, color: '#2ecc71' },
        { level: 78, initialBalance: 37000.00, volume: 30.00, targetProfitLoss: 3000.00, ifProfit: 40000.00, ifLoss: 34000.00, nextLevelBalance: 41000.00, color: '#3498db' },
        { level: 77, initialBalance: 34000.00, volume: 30.00, targetProfitLoss: 3000.00, ifProfit: 37000.00, ifLoss: 31000.00, nextLevelBalance: 37000.00, color: '#3498db' },
        { level: 76, initialBalance: 31000.00, volume: 30.00, targetProfitLoss: 3000.00, ifProfit: 34000.00, ifLoss: 28000.00, nextLevelBalance: 34000.00, color: '#3498db' },
        { level: 75, initialBalance: 28000.00, volume: 20.00, targetProfitLoss: 2000.00, ifProfit: 30000.00, ifLoss: 26000.00, nextLevelBalance: 31000.00, color: '#3498db' },
        { level: 74, initialBalance: 26000.00, volume: 20.00, targetProfitLoss: 2000.00, ifProfit: 28000.00, ifLoss: 24000.00, nextLevelBalance: 28000.00, color: '#3498db' },
        { level: 73, initialBalance: 24000.00, volume: 20.00, targetProfitLoss: 2000.00, ifProfit: 26000.00, ifLoss: 22000.00, nextLevelBalance: 26000.00, color: '#3498db' },
        { level: 72, initialBalance: 22000.00, volume: 20.00, targetProfitLoss: 2000.00, ifProfit: 24000.00, ifLoss: 20000.00, nextLevelBalance: 24000.00, color: '#3498db' },
        { level: 71, initialBalance: 20000.00, volume: 20.00, targetProfitLoss: 2000.00, ifProfit: 22000.00, ifLoss: 18000.00, nextLevelBalance: 22000.00, color: '#3498db' },
        { level: 70, initialBalance: 18000.00, volume: 10.00, targetProfitLoss: 1000.00, ifProfit: 19000.00, ifLoss: 17000.00, nextLevelBalance: 20000.00, color: '#3498db' },
        { level: 69, initialBalance: 17000.00, volume: 10.00, targetProfitLoss: 1000.00, ifProfit: 18000.00, ifLoss: 16000.00, nextLevelBalance: 18000.00, color: '#3498db' },
        { level: 68, initialBalance: 16000.00, volume: 10.00, targetProfitLoss: 1000.00, ifProfit: 17000.00, ifLoss: 15000.00, nextLevelBalance: 17000.00, color: '#3498db' },
        { level: 67, initialBalance: 15000.00, volume: 10.00, targetProfitLoss: 1000.00, ifProfit: 16000.00, ifLoss: 14000.00, nextLevelBalance: 16000.00, color: '#3498db' },
        { level: 66, initialBalance: 14000.00, volume: 10.00, targetProfitLoss: 1000.00, ifProfit: 15000.00, ifLoss: 13000.00, nextLevelBalance: 15000.00, color: '#3498db' },
        { level: 65, initialBalance: 13000.00, volume: 10.00, targetProfitLoss: 1000.00, ifProfit: 14000.00, ifLoss: 12000.00, nextLevelBalance: 14000.00, color: '#3498db' },
        { level: 64, initialBalance: 12000.00, volume: 10.00, targetProfitLoss: 1000.00, ifProfit: 13000.00, ifLoss: 11000.00, nextLevelBalance: 13000.00, color: '#3498db' },
        { level: 63, initialBalance: 11000.00, volume: 10.00, targetProfitLoss: 1000.00, ifProfit: 12000.00, ifLoss: 10000.00, nextLevelBalance: 12000.00, color: '#3498db' },
        { level: 62, initialBalance: 10000.00, volume: 10.00, targetProfitLoss: 1000.00, ifProfit: 11000.00, ifLoss: 9000.00, nextLevelBalance: 11000.00, color: '#3498db' },
        { level: 61, initialBalance: 9000.00, volume: 9.00, targetProfitLoss: 900.00, ifProfit: 9900.00, ifLoss: 8100.00, nextLevelBalance: 10000.00, color: '#3498db' },
        { level: 60, initialBalance: 8100.00, volume: 8.00, targetProfitLoss: 800.00, ifProfit: 8900.00, ifLoss: 7300.00, nextLevelBalance: 9000.00, color: '#3498db' },
        { level: 59, initialBalance: 7300.00, volume: 7.00, targetProfitLoss: 700.00, ifProfit: 8000.00, ifLoss: 6600.00, nextLevelBalance: 8100.00, color: '#3498db' },
        { level: 58, initialBalance: 6600.00, volume: 6.00, targetProfitLoss: 600.00, ifProfit: 7200.00, ifLoss: 6000.00, nextLevelBalance: 7300.00, color: '#3498db' },
        { level: 57, initialBalance: 6000.00, volume: 5.00, targetProfitLoss: 500.00, ifProfit: 6500.00, ifLoss: 5500.00, nextLevelBalance: 6600.00, color: '#3498db' },
        { level: 56, initialBalance: 5500.00, volume: 4.00, targetProfitLoss: 400.00, ifProfit: 5900.00, ifLoss: 5100.00, nextLevelBalance: 6000.00, color: '#3498db' },
        { level: 55, initialBalance: 5100.00, volume: 3.00, targetProfitLoss: 300.00, ifProfit: 5400.00, ifLoss: 4800.00, nextLevelBalance: 5500.00, color: '#3498db' },
        { level: 54, initialBalance: 4800.00, volume: 2.00, targetProfitLoss: 200.00, ifProfit: 5000.00, ifLoss: 4600.00, nextLevelBalance: 5100.00, color: '#3498db' }
    ];

    // Generate level 53 sampai 1 secara dinamis
    for (let i = 53; i >= 1; i--) {
        const prevLevel = levelData[levelData.length - 1];
        const volume = prevLevel.volume > 1 ? prevLevel.volume - 1 : 1; // Volume minimal 1
        const targetProfitLoss = volume * 100;
        const initialBalance = prevLevel.nextLevelBalance - targetProfitLoss;
        const ifProfit = prevLevel.nextLevelBalance;
        const ifLoss = initialBalance - targetProfitLoss < 0 ? 0 : initialBalance - targetProfitLoss; // Tidak boleh negatif
        const nextLevelBalance = ifProfit;
        const color = i % 5 === 0 ? '#e74c3c' : i % 3 === 0 ? '#3498db' : '#2ecc71';

        levelData.push({ level: i, initialBalance, volume, targetProfitLoss, ifProfit, ifLoss, nextLevelBalance, color });
    }

    // Fungsi untuk mengisi tabel dengan tanda koma
    function populateLevelTable() {
        const tableBody = document.querySelector("#levelTable tbody");
        if (!tableBody) {
            console.error('Element #levelTable tbody not found');
            return;
        }
        tableBody.innerHTML = '';
        levelData.forEach(row => {
            const tr = document.createElement('tr');
            tr.style.backgroundColor = row.color; // Tambah warna ke baris
            tr.innerHTML = `
                <td>${row.level}</td>
                <td>${row.initialBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>${row.volume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>${row.targetProfitLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>${row.ifProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>${row.ifLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>${row.nextLevelBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // Pastikan tabel terisi saat halaman dimuat
    window.addEventListener('load', populateLevelTable);

    // Grafik dengan level kecil di kiri dan besar di kanan
    const ctxEquity = document.getElementById('equityChart')?.getContext('2d');
    if (!ctxEquity) {
        console.error('Canvas #equityChart not found or context not available');
    } else {
        const reversedLevelData = [...levelData].reverse();
        new Chart(ctxEquity, {
            type: 'line',
            data: {
                labels: reversedLevelData.map(row => `Level ${row.level}`),
                datasets: [{
                    label: 'Saldo Awal Perdagangan ($)',
                    data: reversedLevelData.map(row => row.initialBalance),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.1,
                    pointBackgroundColor: reversedLevelData.map(row => row.color),
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
    }
}
