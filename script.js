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
            runningTotal += t.profitLoss || 0;
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

// ====================== LOGIKA 100 TINGKATAN TANGGA SALDO ======================
if (document.getElementById('levelTable')) {
    // Data 100 tingkatan (sudah konsisten semua pakai "tingkat")
    const levelData = [
        { tingkat: 100, initialBalance: 5700.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 5800.00, ifLoss: 5600.00, nextLevelBalance: 5800.00, color: '#3498db' },
        { tingkat: 99, initialBalance: 5600.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 5700.00, ifLoss: 5500.00, nextLevelBalance: 5700.00, color: '#3498db' },
        { tingkat: 98, initialBalance: 5500.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 5600.00, ifLoss: 5400.00, nextLevelBalance: 5600.00, color: '#3498db' },
        { tingkat: 97, initialBalance: 5400.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 5500.00, ifLoss: 5300.00, nextLevelBalance: 5500.00, color: '#3498db' },
        { tingkat: 96, initialBalance: 5300.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 5400.00, ifLoss: 5200.00, nextLevelBalance: 5400.00, color: '#3498db' },
        { tingkat: 95, initialBalance: 5200.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 5300.00, ifLoss: 5100.00, nextLevelBalance: 5300.00, color: '#3498db' },
        { tingkat: 94, initialBalance: 5100.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 5200.00, ifLoss: 5000.00, nextLevelBalance: 5200.00, color: '#3498db' },
        { tingkat: 93, initialBalance: 5000.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 5100.00, ifLoss: 4900.00, nextLevelBalance: 5100.00, color: '#3498db' },
        { tingkat: 92, initialBalance: 4900.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 5000.00, ifLoss: 4800.00, nextLevelBalance: 5000.00, color: '#3498db' },
        { tingkat: 91, initialBalance: 4800.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 4900.00, ifLoss: 4700.00, nextLevelBalance: 4900.00, color: '#3498db' },
        { tingkat: 90, initialBalance: 4700.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 4800.00, ifLoss: 4600.00, nextLevelBalance: 4800.00, color: '#3498db' },
        { tingkat: 89, initialBalance: 4600.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 4700.00, ifLoss: 4500.00, nextLevelBalance: 4700.00, color: '#3498db' },
        { tingkat: 88, initialBalance: 4500.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 4600.00, ifLoss: 4400.00, nextLevelBalance: 4600.00, color: '#3498db' },
        { tingkat: 87, initialBalance: 4400.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 4500.00, ifLoss: 4300.00, nextLevelBalance: 4500.00, color: '#3498db' },
        { tingkat: 86, initialBalance: 4300.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 4400.00, ifLoss: 4200.00, nextLevelBalance: 4400.00, color: '#3498db' },
        { tingkat: 85, initialBalance: 4200.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 4300.00, ifLoss: 4100.00, nextLevelBalance: 4300.00, color: '#3498db' },
        { tingkat: 84, initialBalance: 4100.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 4200.00, ifLoss: 4000.00, nextLevelBalance: 4200.00, color: '#3498db' },
        { tingkat: 83, initialBalance: 4000.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 4100.00, ifLoss: 3900.00, nextLevelBalance: 4100.00, color: '#3498db' },
        { tingkat: 82, initialBalance: 3900.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 4000.00, ifLoss: 3800.00, nextLevelBalance: 4000.00, color: '#3498db' },
        { tingkat: 81, initialBalance: 3800.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 3900.00, ifLoss: 3700.00, nextLevelBalance: 3900.00, color: '#3498db' },
        { tingkat: 80, initialBalance: 3700.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 3800.00, ifLoss: 3600.00, nextLevelBalance: 3800.00, color: '#3498db' },
        { tingkat: 79, initialBalance: 3600.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 3700.00, ifLoss: 3500.00, nextLevelBalance: 3700.00, color: '#3498db' },
        { tingkat: 78, initialBalance: 3500.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 3600.00, ifLoss: 3400.00, nextLevelBalance: 3600.00, color: '#3498db' },
        { tingkat: 77, initialBalance: 3400.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 3500.00, ifLoss: 3300.00, nextLevelBalance: 3500.00, color: '#3498db' },
        { tingkat: 76, initialBalance: 3300.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 3400.00, ifLoss: 3200.00, nextLevelBalance: 3400.00, color: '#3498db' },
        { tingkat: 75, initialBalance: 3200.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 3300.00, ifLoss: 3100.00, nextLevelBalance: 3300.00, color: '#3498db' },
        { tingkat: 74, initialBalance: 3100.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 3200.00, ifLoss: 3000.00, nextLevelBalance: 3200.00, color: '#3498db' },
        { tingkat: 73, initialBalance: 3000.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 3100.00, ifLoss: 2900.00, nextLevelBalance: 3100.00, color: '#3498db' },
        { tingkat: 72, initialBalance: 2900.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 3000.00, ifLoss: 2800.00, nextLevelBalance: 3000.00, color: '#3498db' },
        { tingkat: 71, initialBalance: 2800.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 2900.00, ifLoss: 2700.00, nextLevelBalance: 2900.00, color: '#3498db' },
        { tingkat: 70, initialBalance: 2700.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 2800.00, ifLoss: 2600.00, nextLevelBalance: 2800.00, color: '#3498db' },
        { tingkat: 69, initialBalance: 2600.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 2700.00, ifLoss: 2500.00, nextLevelBalance: 2700.00, color: '#3498db' },
        { tingkat: 68, initialBalance: 2500.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 2600.00, ifLoss: 2400.00, nextLevelBalance: 2600.00, color: '#3498db' },
        { tingkat: 67, initialBalance: 2400.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 2500.00, ifLoss: 2300.00, nextLevelBalance: 2500.00, color: '#3498db' },
        { tingkat: 66, initialBalance: 2300.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 2400.00, ifLoss: 2200.00, nextLevelBalance: 2400.00, color: '#3498db' },
        { tingkat: 65, initialBalance: 2200.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 2300.00, ifLoss: 2100.00, nextLevelBalance: 2300.00, color: '#3498db' },
        { tingkat: 64, initialBalance: 2100.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 2200.00, ifLoss: 2000.00, nextLevelBalance: 2200.00, color: '#3498db' },
        { tingkat: 63, initialBalance: 2000.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 2100.00, ifLoss: 1900.00, nextLevelBalance: 2100.00, color: '#3498db' },
        { tingkat: 62, initialBalance: 1900.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 2000.00, ifLoss: 1800.00, nextLevelBalance: 2000.00, color: '#3498db' },
        { tingkat: 61, initialBalance: 1800.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 1900.00, ifLoss: 1700.00, nextLevelBalance: 1900.00, color: '#3498db' },
        { tingkat: 60, initialBalance: 1700.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 1800.00, ifLoss: 1600.00, nextLevelBalance: 1800.00, color: '#3498db' },
        { tingkat: 59, initialBalance: 1600.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 1700.00, ifLoss: 1500.00, nextLevelBalance: 1700.00, color: '#3498db' },
        { tingkat: 58, initialBalance: 1500.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 1600.00, ifLoss: 1400.00, nextLevelBalance: 1600.00, color: '#3498db' },
        { tingkat: 57, initialBalance: 1400.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 1500.00, ifLoss: 1300.00, nextLevelBalance: 1500.00, color: '#3498db' },
        { tingkat: 56, initialBalance: 1300.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 1400.00, ifLoss: 1200.00, nextLevelBalance: 1400.00, color: '#3498db' },
        { tingkat: 55, initialBalance: 1200.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 1300.00, ifLoss: 1100.00, nextLevelBalance: 1300.00, color: '#3498db' },
        { tingkat: 54, initialBalance: 1100.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 1200.00, ifLoss: 1000.00, nextLevelBalance: 1200.00, color: '#3498db' },
        { tingkat: 53, initialBalance: 1000.00, volume: 1.00, targetProfitLoss: 100.00, ifProfit: 1100.00, ifLoss: 900.00, nextLevelBalance: 1100.00, color: '#3498db' },
        { tingkat: 52, initialBalance: 900.00, volume: 0.90, targetProfitLoss: 100.00, ifProfit: 1000.00, ifLoss: 800.00, nextLevelBalance: 1000.00, color: '#3498db' },
        { tingkat: 51, initialBalance: 800.00, volume: 0.80, targetProfitLoss: 100.00, ifProfit: 900.00, ifLoss: 700.00, nextLevelBalance: 900.00, color: '#3498db' },
        { tingkat: 50, initialBalance: 700.00, volume: 0.70, targetProfitLoss: 100.00, ifProfit: 800.00, ifLoss: 600.00, nextLevelBalance: 800.00, color: '#3498db' },
        { tingkat: 49, initialBalance: 600.00, volume: 0.60, targetProfitLoss: 100.00, ifProfit: 700.00, ifLoss: 500.00, nextLevelBalance: 700.00, color: '#3498db' },
        { tingkat: 48, initialBalance: 500.00, volume: 0.50, targetProfitLoss: 100.00, ifProfit: 600.00, ifLoss: 400.00, nextLevelBalance: 600.00, color: '#7a7510' },
        { tingkat: 47, initialBalance: 400.00, volume: 0.40, targetProfitLoss: 100.00, ifProfit: 500.00, ifLoss: 300.00, nextLevelBalance: 500.00, color: '#7a7510' },
        { tingkat: 46, initialBalance: 300.00, volume: 0.30, targetProfitLoss: 100.00, ifProfit: 400.00, ifLoss: 200.00, nextLevelBalance: 400.00, color: '#7a7510' },
        { tingkat: 45, initialBalance: 200.00, volume: 0.20, targetProfitLoss: 100.00, ifProfit: 300.00, ifLoss: 100.00, nextLevelBalance: 300.00, color: '#7a7510' },
        { tingkat: 44, initialBalance: 180.00, volume: 0.18, targetProfitLoss: 20.00, ifProfit: 200.00, ifLoss: 160.00, nextLevelBalance: 200.00, color: '#7a7510' },
        { tingkat: 43, initialBalance: 141.00, volume: 0.14, targetProfitLoss: 39.00, ifProfit: 180.00, ifLoss: 102.00, nextLevelBalance: 180.00, color: '#d13f0f' },
        { tingkat: 42, initialBalance: 129.00, volume: 0.12, targetProfitLoss: 12.00, ifProfit: 141.00, ifLoss: 117.00, nextLevelBalance: 141.00, color: '#d13f0f' },
        { tingkat: 41, initialBalance: 118.00, volume: 0.11, targetProfitLoss: 11.00, ifProfit: 129.00, ifLoss: 107.00, nextLevelBalance: 107.00, color: '#d13f0f' },
        { tingkat: 40, initialBalance: 108.00, volume: 0.10, targetProfitLoss: 10.00, ifProfit: 118.00, ifLoss: 98.00, nextLevelBalance: 118.00, color: '#3498db' },
        { tingkat: 39, initialBalance: 99.00, volume: 0.09, targetProfitLoss: 9.00, ifProfit: 108.00, ifLoss: 90.00, nextLevelBalance: 108.00, color: '#3498db' },
        { tingkat: 38, initialBalance: 90.00, volume: 0.09, targetProfitLoss: 9.00, ifProfit: 99.00, ifLoss: 81.00, nextLevelBalance: 99.00, color: '#3498db' },
        { tingkat: 37, initialBalance: 82.00, volume: 0.08, targetProfitLoss: 8.00, ifProfit: 90.00, ifLoss: 74.00, nextLevelBalance: 90.00, color: '#ca34db' },
        { tingkat: 36, initialBalance: 75.00, volume: 0.07, targetProfitLoss: 7.00, ifProfit: 82.00, ifLoss: 68.00, nextLevelBalance: 82.00, color: '#ca34db' },
        { tingkat: 35, initialBalance: 69.00, volume: 0.06, targetProfitLoss: 6.00, ifProfit: 75.00, ifLoss: 63.00, nextLevelBalance: 75.00, color: '#ca34db' },
        { tingkat: 34, initialBalance: 63.00, volume: 0.06, targetProfitLoss: 6.00, ifProfit: 69.00, ifLoss: 57.00, nextLevelBalance: 69.00, color: '#ca34db' },
        { tingkat: 33, initialBalance: 58.00, volume: 0.05, targetProfitLoss: 5.00, ifProfit: 63.00, ifLoss: 53.00, nextLevelBalance: 63.00, color: '#ca34db' },
        { tingkat: 32, initialBalance: 53.00, volume: 0.05, targetProfitLoss: 5.00, ifProfit: 58.00, ifLoss: 48.00, nextLevelBalance: 58.00, color: '#ca34db' },
        { tingkat: 31, initialBalance: 49.00, volume: 0.04, targetProfitLoss: 4.00, ifProfit: 53.00, ifLoss: 45.00, nextLevelBalance: 53.00, color: '#3498db' },
        { tingkat: 30, initialBalance: 45.00, volume: 0.04, targetProfitLoss: 4.00, ifProfit: 49.00, ifLoss: 41.00, nextLevelBalance: 49.00, color: '#3498db' },
        { tingkat: 29, initialBalance: 42.00, volume: 0.03, targetProfitLoss: 3.00, ifProfit: 45.00, ifLoss: 39.00, nextLevelBalance: 46.00, color: '#3498db' },
        { tingkat: 28, initialBalance: 39.00, volume: 0.03, targetProfitLoss: 3.00, ifProfit: 42.00, ifLoss: 36.00, nextLevelBalance: 42.00, color: '#3498db' },
        { tingkat: 27, initialBalance: 36.00, volume: 0.03, targetProfitLoss: 3.00, ifProfit: 39.00, ifLoss: 33.00, nextLevelBalance: 39.00, color: '#3498db' },
        { tingkat: 26, initialBalance: 33.00, volume: 0.03, targetProfitLoss: 3.00, ifProfit: 36.00, ifLoss: 30.00, nextLevelBalance: 36.00, color: '#3498db' },
        { tingkat: 25, initialBalance: 30.00, volume: 0.02, targetProfitLoss: 2.00, ifProfit: 32.00, ifLoss: 28.00, nextLevelBalance: 33.00, color: '#3498db' },
        { tingkat: 24, initialBalance: 28.00, volume: 0.02, targetProfitLoss: 2.00, ifProfit: 30.00, ifLoss: 26.00, nextLevelBalance: 30.00, color: '#3498db' },
        { tingkat: 23, initialBalance: 26.00, volume: 0.02, targetProfitLoss: 2.00, ifProfit: 28.00, ifLoss: 24.00, nextLevelBalance: 28.00, color: '#3498db' },
        { tingkat: 22, initialBalance: 24.00, volume: 0.02, targetProfitLoss: 2.00, ifProfit: 26.00, ifLoss: 22.00, nextLevelBalance: 26.00, color: '#3498db' },
        { tingkat: 21, initialBalance: 22.00, volume: 0.02, targetProfitLoss: 2.00, ifProfit: 24.00, ifLoss: 20.00, nextLevelBalance: 24.00, color: '#3498db' },
        { tingkat: 20, initialBalance: 20.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 21.00, ifLoss: 19.00, nextLevelBalance: 22.00, color: '#3498db' },
        { tingkat: 19, initialBalance: 19.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 20.00, ifLoss: 18.00, nextLevelBalance: 20.00, color: '#3498db' },
        { tingkat: 18, initialBalance: 18.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 19.00, ifLoss: 17.00, nextLevelBalance: 19.00, color: '#3498db' },
        { tingkat: 17, initialBalance: 17.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 18.00, ifLoss: 16.00, nextLevelBalance: 18.00, color: '#3498db' },
        { tingkat: 16, initialBalance: 16.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 17.00, ifLoss: 15.00, nextLevelBalance: 17.00, color: '#3498db' },
        { tingkat: 15, initialBalance: 15.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 16.00, ifLoss: 14.00, nextLevelBalance: 16.00, color: '#3498db' },
        { tingkat: 14, initialBalance: 14.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 15.00, ifLoss: 13.00, nextLevelBalance: 15.00, color: '#3498db' },
        { tingkat: 13, initialBalance: 13.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 14.00, ifLoss: 12.00, nextLevelBalance: 14.00, color: '#3498db' },
        { tingkat: 12, initialBalance: 12.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 13.00, ifLoss: 11.00, nextLevelBalance: 13.00, color: '#3498db' },
        { tingkat: 11, initialBalance: 11.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 12.00, ifLoss: 10.00, nextLevelBalance: 12.00, color: '#3498db' },
        { tingkat: 10, initialBalance: 10.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 11.00, ifLoss: 9.00, nextLevelBalance: 11.00, color: '#3498db' },
        { tingkat: 9, initialBalance: 9.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 10.00, ifLoss: 8.00, nextLevelBalance: 10.00, color: '#3498db' },
        { tingkat: 8, initialBalance: 8.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 9.00, ifLoss: 7.00, nextLevelBalance: 9.00, color: '#3498db' },
        { tingkat: 7, initialBalance: 7.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 8.00, ifLoss: 6.00, nextLevelBalance: 8.00, color: '#3498db' },
        { tingkat: 6, initialBalance: 6.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 7.00, ifLoss: 5.00, nextLevelBalance: 7.00, color: '#2ecc78' },
        { tingkat: 5, initialBalance: 5.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 6.00, ifLoss: 4.00, nextLevelBalance: 6.00, color: '#45063f' },
        { tingkat: 4, initialBalance: 4.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 5.00, ifLoss: 3.00, nextLevelBalance: 5.00, color: '#45063f' },
        { tingkat: 3, initialBalance: 3.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 4.00, ifLoss: 2.00, nextLevelBalance: 4.00, color: '#2ecc78' },
        { tingkat: 2, initialBalance: 2.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 3.00, ifLoss: 1.00, nextLevelBalance: 3.00, color: '#2ecc78' },
        { tingkat: 1, initialBalance: 1.00, volume: 0.01, targetProfitLoss: 1.00, ifProfit: 2.00, ifLoss: 0.00, nextLevelBalance: 2.00, color: '#3498db' }
    ];

    // Fungsi untuk mengisi tabel
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
                <td>${row.tingkat}</td>
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

    // Grafik Equity
    const ctxEquity = document.getElementById('equityChart')?.getContext('2d');
    if (!ctxEquity) {
        console.error('Canvas #equityChart not found or context not available');
    } else {
        const reversedLevelData = [...levelData].reverse();
        new Chart(ctxEquity, {
            type: 'line',
            data: {
                labels: reversedLevelData.map(row => `Tingkat ${row.tingkat}`),
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
                    x: { title: { display: true, text: 'Tingkat' } }
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
