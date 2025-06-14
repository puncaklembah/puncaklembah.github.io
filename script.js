// Tema Gelap/Terang
const themeToggle = document.getElementById('disableDarkMode');

// Set tema awal berdasarkan localStorage
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
}

// Tambahkan event listener untuk toggle tema
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    // Simpan preferensi tema ke localStorage
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

    // Fungsi untuk memperbarui semua elemen
    function updateAll() {
        updateTable();
        updateSummary();
        updateTransactionChart();
    }

    // Panggil saat pertama kali dimuat
    updateAll();

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
            updateAll();
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
            updateAll();
        }
    });

    // Fungsi untuk menggambar grafik transaksi berdasarkan profit/loss
    function updateTransactionChart() {
        const ctx = document.getElementById('transactionChart')?.getContext('2d');
        if (!ctx) {
            console.error('Canvas #transactionChart not found');
            return;
        }

        // Hitung profit/loss kumulatif
        const cumulativePL = [];
        let runningTotal = 0;
        transactions.forEach((t, index) => {
            runningTotal += t.profitLoss || 0; // Jika profitLoss null, tambahkan 0
            cumulativePL.push({
                date: t.date,
                profitLoss: runningTotal,
                color: t.profitLoss > 0 ? '#2ecc71' : (t.profitLoss < 0 ? '#e74c3c' : '#3498db')
            });
        });

        // Hancurkan grafik sebelumnya jika ada
        if (window.transactionChart instanceof Chart) {
            window.transactionChart.destroy();
        }

        // Jika tidak ada transaksi, tampilkan grafik kosong
        if (cumulativePL.length === 0) {
            window.transactionChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Tidak ada data'],
                    datasets: [{
                        label: 'Profit/Loss Kumulatif ($)',
                        data: [0],
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, title: { display: true, text: 'Profit/Loss Kumulatif ($)' } },
                        x: { title: { display: true, text: 'Transaksi' } }
                    },
                    plugins: { legend: { display: false } }
                }
            });
            return;
        }

        // Buat grafik baru dengan data transaksi
        window.transactionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: cumulativePL.map((entry, index) => `Transaksi ${index + 1} (${entry.date})`),
                datasets: [{
                    label: 'Profit/Loss Kumulatif ($)',
                    data: cumulativePL.map(entry => entry.profitLoss),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.1,
                    pointBackgroundColor: cumulativePL.map(entry => entry.color),
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { 
                        beginAtZero: false, 
                        title: { display: true, text: 'Profit/Loss Kumulatif ($)' },
                        suggestedMin: Math.min(...cumulativePL.map(entry => entry.profitLoss)) - 10,
                        suggestedMax: Math.max(...cumulativePL.map(entry => entry.profitLoss)) + 10
                    },
                    x: { title: { display: true, text: 'Transaksi' } }
                },
                plugins: { 
                    legend: { display: false }, 
                    tooltip: { mode: 'index', intersect: false } 
                }
            }
        });
    }

    // Simulasi Pertumbuhan di Dashboard
    const data = [
        {transaksi: 11, volume: 10.00, targetPoin: 5000, modalAwal: 512.00, keuntungan: 500.00, modalAkhir: 1012.00, color: '#e74c3c'},
        {transaksi: 10, volume: 5.12, targetPoin: 5000, modalAwal: 256.00, keuntungan: 256.00, modalAkhir: 512.00, color: '#45063f'},
        {transaksi: 9, volume: 2.56, targetPoin: 5000, modalAwal: 128.00, keuntungan: 128.00, modalAkhir: 256.00, color: '#45063f'},
        {transaksi: 8, volume: 1.28, targetPoin: 5000, modalAwal: 64.00, keuntungan: 64.00, modalAkhir: 128.00, color: '#45063f'},
        {transaksi: 7, volume: 0.64, targetPoin: 5000, modalAwal: 32.00, keuntungan: 32.00, modalAkhir: 64.00, color: '#45063f'},
        {transaksi: 6, volume: 0.32, targetPoin: 5000, modalAwal: 16.00, keuntungan: 16.00, modalAkhir: 32.00, color: '#0b0645'},
        {transaksi: 5, volume: 0.16, targetPoin: 5000, modalAwal: 8.00, keuntungan: 8.00, modalAkhir: 16.00, color: '#0b0645'},
        {transaksi: 4, volume: 0.08, targetPoin: 5000, modalAwal: 4.00, keuntungan: 4.00, modalAkhir: 8.00, color: '#0b0645'},
        {transaksi: 3, volume: 0.04, targetPoin: 5000, modalAwal: 2.00, keuntungan: 2.00, modalAkhir: 4.00, color: '#2ecc71'},
        {transaksi: 2, volume: 0.02, targetPoin: 5000, modalAwal: 1.00, keuntungan: 1.00, modalAkhir: 2.00, color: '#2ecc71'},
        {transaksi: 1, volume: 0.01, targetPoin: 5000, modalAwal: 0.50, keuntungan: 0.50, modalAkhir: 1.00, color: '#3498db'}
    ];

    function populateTable() {
        const tableBody = document.querySelector("#growthTable tbody");
        if (tableBody) {
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
    }

    const ctxGrowth = document.getElementById('growthChart')?.getContext('2d');
    if (!ctxGrowth) {
        console.error('Canvas #growthChart not found or context not available');
    } else {
        const reversedData = [...data].reverse();
        new Chart(ctxGrowth, {
            type: 'line',
            data: {
                labels: reversedData.map(row => `Transaksi ${row.transaksi}`),
                datasets: [{
                    label: 'Modal Akhir ($)',
                    data: reversedData.map(row => row.modalAkhir),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.1,
                    pointBackgroundColor: reversedData.map(row => row.color),
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
        window.onload = function() {
            populateTable();
            updateAll();
        };
    }
}

// Logika 88 Levels
if (document.getElementById('levelTable')) {
    // Data statis untuk 88 Levels (tanpa koma di definisi)
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
        { level: 60, initialBalance: 8000.00, volume: 8.00, targetProfitLoss: 800.00, ifProfit: 8800.00, ifLoss: 7200.00, nextLevelBalance: 9000.00, color: '#3498db' },
        { level: 59, initialBalance: 7000.00, volume: 7.00, targetProfitLoss: 700.00, ifProfit: 7700.00, ifLoss: 6000.00, nextLevelBalance: 8000.00, color: '#3498db' },
        { level: 58, initialBalance: 6000.00, volume: 6.00, targetProfitLoss: 600.00, ifProfit: 6600.00, ifLoss: 5000.00, nextLevelBalance: 7000.00, color: '#3498db' },
        { level: 57, initialBalance: 5000.00, volume: 5.00, targetProfitLoss: 500.00, ifProfit: 5500.00, ifLoss: 4000.00, nextLevelBalance: 6000.00, color: '#3498db' },
        { level: 56, initialBalance: 4000.00, volume: 4.00, targetProfitLoss: 400.00, ifProfit: 4400.00, ifLoss: 3000.00, nextLevelBalance: 5000.00, color: '#3498db' },
        { level: 55, initialBalance: 3000.00, volume: 3.00, targetProfitLoss: 300.00, ifProfit: 3300.00, ifLoss: 2000.00, nextLevelBalance: 4000.00, color: '#3498db' },
        { level: 54, initialBalance: 2000.00, volume: 2.00, targetProfitLoss: 200.00, ifProfit: 2200.00, ifLoss: 1000.00, nextLevelBalance: 3000.00, color: '#3498db' },
        { level: 53, initialBalance: 1000.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 1100.00, ifLoss: 900.00, nextLevelBalance: 2000.00, color: '#3498db' },
        { level: 52, initialBalance: 900.00, volume: 0.90, targetProfitLoss: 100.00, ifProfit: 1000.00, ifLoss: 800.00, nextLevelBalance: 1000.00, color: '#3498db' },
        { level: 51, initialBalance: 800.00, volume: 0.80, targetProfitLoss: 100.00, ifProfit: 900.00, ifLoss: 700.00, nextLevelBalance: 900.00, color: '#3498db' },
        { level: 50, initialBalance: 700.00, volume: 0.70, targetProfitLoss: 100.00, ifProfit: 800.00, ifLoss: 600.00, nextLevelBalance: 800.00, color: '#3498db' },
        { level: 49, initialBalance: 600.00, volume: 0.60, targetProfitLoss: 100.00, ifProfit: 700.00, ifLoss: 500.00, nextLevelBalance: 700.00, color: '#3498db' },
        { level: 48, initialBalance: 500.00, volume: 0.50, targetProfitLoss: 100.00, ifProfit: 600.00, ifLoss: 500.00, nextLevelBalance: 600.00, color: '#7a7510' },
        { level: 47, initialBalance: 400.00, volume: 0.40, targetProfitLoss: 100.00, ifProfit: 500.00, ifLoss: 400.00, nextLevelBalance: 500.00, color: '#7a7510' },
        { level: 46, initialBalance: 300.00, volume: 0.30, targetProfitLoss: 100.00, ifProfit: 400.00, ifLoss: 200.00, nextLevelBalance: 400.00, color: '#7a7510' },
        { level: 45, initialBalance: 200.00, volume: 0.20, targetProfitLoss: 100.00, ifProfit: 300.00, ifLoss: 100.00, nextLevelBalance: 300.00, color: '#7a7510' },
        { level: 44, initialBalance: 180.00, volume: 0.18, targetProfitLoss: 20.00, ifProfit: 200.00, ifLoss: 160.00, nextLevelBalance: 200.00, color: '#7a7510' },
        { level: 43, initialBalance: 141.00, volume: 0.14, targetProfitLoss: 39.00, ifProfit: 180.00, ifLoss: 102.00, nextLevelBalance: 180.00, color: '#d13f0f' },
        { level: 42, initialBalance: 129.00, volume: 0.12, targetProfitLoss: 12.00, ifProfit: 141.00, ifLoss: 117.00, nextLevelBalance: 141.00, color: '#d13f0f' },
        { level: 41, initialBalance: 118.00, volume: 0.11, targetProfitLoss: 11.00, ifProfit: 129.00, ifLoss: 107.00, nextLevelBalance: 107.00, color: '#d13f0f' },
        { level: 40, initialBalance: 108.00, volume: 0.10, targetProfitLoss: 10.00, ifProfit: 118.00, ifLoss: 98.00, nextLevelBalance: 118.00, color: '#3498db' },
        { level: 39, initialBalance: 99.00, volume: 0.09, targetProfitLoss: 9.00, ifProfit: 108.00, ifLoss: 90.00, nextLevelBalance: 108.00, color: '#3498db' },
        { level: 38, initialBalance: 90.00, volume: 0.09, targetProfitLoss: 9.00, ifProfit: 99.00, ifLoss: 81.00, nextLevelBalance: 99.00, color: '#3498db' },
        { level: 37, initialBalance: 82.00, volume: 0.08, targetProfitLoss: 8.00, ifProfit: 90.00, ifLoss: 74.00, nextLevelBalance: 90.00, color: '#ca34db' },
        { level: 36, initialBalance: 75.00, volume: 0.07, targetProfitLoss: 7.00, ifProfit: 82.00, ifLoss: 68.00, nextLevelBalance: 82.00, color: '#ca34db' },
        { level: 35, initialBalance: 69.00, volume: 0.06, targetProfitLoss: 6.00, ifProfit: 75.00, ifLoss: 63.00, nextLevelBalance: 75.00, color: '#ca34db' },
        { level: 34, initialBalance: 63.00, volume: 0.06, targetProfitLoss: 6.00, ifProfit: 69.00, ifLoss: 57.00, nextLevelBalance: 69.00, color: '#ca34db' },
        { level: 33, initialBalance: 58.00, volume: 0.05, targetProfitLoss: 5.00, ifProfit: 63.00, ifLoss: 53.00, nextLevelBalance: 63.00, color: '#ca34db' },
        { level: 32, initialBalance: 53.00, volume: 0.05, targetProfitLoss: 5.00, ifProfit: 58.00, ifLoss: 48.00, nextLevelBalance: 58.00, color: '#ca34db' },
        { level: 31, initialBalance: 49.00, volume: 0.04, targetProfitLoss: 4.00, ifProfit: 53.00, ifLoss: 45.00, nextLevelBalance: 53.00, color: '#3498db' },
        { level: 30, initialBalance: 45.00, volume: 0.04, targetProfitLoss: 4.00, ifProfit: 49.00, ifLoss: 41.00, nextLevelBalance: 49.00, color: '#3498db' },
        { level: 29, initialBalance: 42.00, volume: 0.03, targetProfitLoss: 3.00, ifProfit: 45.00, ifLoss: 39.00, nextLevelBalance: 46.00, color: '#3498db' },
        { level: 28, initialBalance: 39.00, volume: 0.03, targetProfitLoss: 3.00, ifProfit: 42.00, ifLoss: 36.00, nextLevelBalance: 42.00, color: '#3498db' },
        { level: 27, initialBalance: 36.00, volume: 0.03, targetProfitLoss: 3.00, ifProfit: 39.00, ifLoss: 33.00, nextLevelBalance: 39.00, color: '#3498db' },
        { level: 26, initialBalance: 33.00, volume: 0.03, targetProfitLoss: 3.00, ifProfit: 36.00, ifLoss: 30.00, nextLevelBalance: 36.00, color: '#3498db' },
        { level: 25, initialBalance: 30.00, volume: 0.02, targetProfitLoss: 2.00, ifProfit: 32.00, ifLoss: 28.00, nextLevelBalance: 33.00, color: '#3498db' },
        { level: 24, initialBalance: 28.00, volume: 0.02, targetProfitLoss: 2.00, ifProfit: 30.00, ifLoss: 26.00, nextLevelBalance: 30.00, color: '#3498db' },
        { level: 23, initialBalance: 26.00, volume: 0.02, targetProfitLoss: 2.00, ifProfit: 28.00, ifLoss: 24.00, nextLevelBalance: 28.00, color: '#3498db' },
        { level: 22, initialBalance: 24.00, volume: 0.02, targetProfitLoss: 2.00, ifProfit: 26.00, ifLoss: 22.00, nextLevelBalance: 26.00, color: '#3498db' },
        { level: 21, initialBalance: 22.00, volume: 0.02, targetProfitLoss: 2.00, ifProfit: 24.00, ifLoss: 20.00, nextLevelBalance: 24.00, color: '#3498db' },
        { level: 20, initialBalance: 20.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 21.00, ifLoss: 19.00, nextLevelBalance: 22.00, color: '#3498db' },
        { level: 19, initialBalance: 19.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 20.00, ifLoss: 18.00, nextLevelBalance: 20.00, color: '#3498db' },
        { level: 18, initialBalance: 18.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 19.00, ifLoss: 17.00, nextLevelBalance: 19.00, color: '#3498db' },
        { level: 17, initialBalance: 17.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 18.00, ifLoss: 16.00, nextLevelBalance: 18.00, color: '#3498db' },
        { level: 16, initialBalance: 16.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 17.00, ifLoss: 15.00, nextLevelBalance: 17.00, color: '#3498db' },
        { level: 15, initialBalance: 15.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 16.00, ifLoss: 14.00, nextLevelBalance: 16.00, color: '#3498db' },
        { level: 14, initialBalance: 14.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 15.00, ifLoss: 13.00, nextLevelBalance: 15.00, color: '#3498db' },
        { level: 13, initialBalance: 13.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 14.00, ifLoss: 12.00, nextLevelBalance: 14.00, color: '#3498db' },
        { level: 12, initialBalance: 12.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 13.00, ifLoss: 11.00, nextLevelBalance: 13.00, color: '#3498db' },
        { level: 11, initialBalance: 11.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 12.00, ifLoss: 10.00, nextLevelBalance: 12.00, color: '#3498db' },
        { level: 10, initialBalance: 10.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 11.00, ifLoss: 9.00, nextLevelBalance: 11.00, color: '#3498db' },
        { level: 9, initialBalance: 9.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 10.00, ifLoss: 8.00, nextLevelBalance: 10.00, color: '#3498db' },
        { level: 8, initialBalance: 8.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 9.00, ifLoss: 7.00, nextLevelBalance: 9.00, color: '#3498db' },
        { level: 7, initialBalance: 7.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 8.00, ifLoss: 6.00, nextLevelBalance: 8.00, color: '#3498db' },
        { level: 6, initialBalance: 6.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 7.00, ifLoss: 5.00, nextLevelBalance: 7.00, color: '#2ecc78' },
        { level: 5, initialBalance: 5.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 6.00, ifLoss: 4.00, nextLevelBalance: 6.00, color: '#45063f' },
        { level: 4, initialBalance: 4.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 5.00, ifLoss: 3.00, nextLevelBalance: 5.00, color: '#45063f' },
        { level: 3, initialBalance: 3.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 4.00, ifLoss: 2.00, nextLevelBalance: 4.00, color: '#2ecc78' },
        { level: 2, initialBalance: 2.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 3.00, ifLoss: 1.00, nextLevelBalance: 3.00, color: '#2ecc78' },
        { level: 1, initialBalance: 1.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 2.00, ifLoss: 0.00, nextLevelBalance: 2.00, color: '#3498db' }
    ];

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
 // Picu efek konfeti
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00']
    });
