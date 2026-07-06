// DATA MATERI AWAL
const DAFTAR_MATERI = [
    { id: 'penjumlahan', title: 'Penjumlahan', icon: '➕', color: '#3a86ff' },
    { id: 'pengurangan', title: 'Pengurangan', icon: '➖', color: '#38b000' },
    { id: 'perkalian', title: 'Perkalian', icon: '✖️', color: '#ffbe0b' },
    { id: 'pembagian', title: 'Pembagian', icon: '➗', color: '#fb5607' },
    { id: 'pecahan_tambah_kurang', title: 'Pecahan: + & -', icon: '🍕', color: '#8338ec' },
    { id: 'pecahan_kali_bagi', title: 'Pecahan: × & ÷', icon: '🍰', color: '#ff006e' },
    { id: 'pecahan_bulat', title: 'Pecahan × Bulat', icon: '🍩', color: '#00f5d4' },
    { id: 'campuran', title: 'Campuran Acak', icon: '🎒', color: '#7209b7' }
];

// LIST BANNER MOTIVASI (IKLAN EDUKATIF MINIMAL 15)
const BANNER_MOTIVASI = [
    "🌟 Hebat! Terus semangat belajar ya!",
    "🚀 Kamu pintar sekali, ayo selesaikan!",
    "💎 Matematika itu mudah dan asyik!",
    "🌈 Setiap kesalahan membuatmu makin cerdas!",
    "✨ Fokus dan konsentrasi, kamu pasti bisa!",
    "🏆 Selangkah lagi jadi juara matematika!",
    "🍎 Otakmu bekerja luar biasa hari ini!",
    "⚡ Wow! Keren banget cara berhitungmu!",
    "🎉 Kamu anak hebat, pantang menyerah!",
    "🎈 Belajar berhitung sama dengan melatih otot pintar!",
    "⭐ Pertahankan semangatmu yang menyala-nyala!",
    "🍦 Kamu luar biasa, ayo lanjut berpetualang!",
    "🧩 Matematika adalah teka-teki yang seru!",
    "🎯 Kamu tepat sasaran terus, hebat!",
    "🦁 Kuat dan cerdas seperti singa juara!"
];

// STATE MANAGEMENT GAME
let gameState = {
    currentMateri: '',
    currentLevel: '',
    currentQuestionIndex: 0,
    totalQuestions: 20,
    score: 0,
    correctCount: 0,
    wrongCount: 0,
    startTime: 0,
    activeQuestion: null,
    timerInterval: null,
    timeLeft: 0
};

let chartInstance = null; // Menahan referensi Chart.js

// VIEW MANAGER
const viewManager = {
    showView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
        document.getElementById(viewId).classList.remove('hidden');
        
        // Atur tombol navigasi
        if (viewId === 'view-home') {
            document.getElementById('btn-home-nav').classList.add('hidden');
            document.getElementById('btn-stats-nav').classList.remove('hidden');
        } else {
            document.getElementById('btn-home-nav').classList.remove('hidden');
        }

        if (viewId === 'view-stats') {
            this.renderDashboard();
        }
    },

    renderDashboard() {
        const stats = storageManager.getDashboardStats();
        document.getElementById('dash-high').innerText = stats.highScore;
        document.getElementById('dash-total').innerText = stats.totalGames;
        document.getElementById('dash-correct').innerText = stats.totalCorrect;
        document.getElementById('dash-acc').innerText = stats.avgAccuracy + '%';

        // Render diagram Chart.js
        const history = storageManager.getHistory().reverse(); // Urutan kronologis lama ke baru
        const labels = history.map((h, i) => `Sesi ${i+1}\n(${h.date})`);
        const scores = history.map(h => h.score);

        const ctx = document.getElementById('historyChart').getContext('2d');
        if (chartInstance) { chartInstance.destroy(); } // Reset diagram lama

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Perkembangan Nilai',
                    data: scores,
                    borderColor: '#3a86ff',
                    backgroundColor: 'rgba(58, 134, 255, 0.1)',
                    borderWidth: 4,
                    tension: 0.3,
                    fill: true,
                    pointRadius: 6,
                    pointBackgroundColor: '#ffbe0b'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { min: 0, max: 100 }
                }
            }
        });
    }
};

// GAMEPLAY ENGINE
const gameEngine = {
    init() {
        this.renderMateriCards();
    },

    renderMateriCards() {
        const container = document.getElementById('materi-container');
        container.innerHTML = '';
        DAFTAR_MATERI.forEach(m => {
            const card = document.createElement('div');
            card.className = 'materi-card';
            card.style.boxShadow = `0 8px 0 ${m.color}88`;
            card.style.border = `2px solid ${m.color}33`;
            card.innerHTML = `
                <div class="icon">${m.icon}</div>
                <h3>${m.title}</h3>
            `;
            card.onclick = () => this.selectMateri(m.id, m.title);
            container.appendChild(card);
        });
    },

    selectMateri(id, title) {
        gameState.currentMateri = id;
        document.getElementById('selected-materi-title').innerText = title;
        viewManager.showView('view-difficulty');
    },

    startWithDifficulty(level) {
        gameState.currentLevel = level;
        gameState.currentQuestionIndex = 0;
        gameState.score = 0;
        gameState.correctCount = 0;
        gameState.wrongCount = 0;
        gameState.startTime = Date.now();
        
        viewManager.showView('view-game');
        this.loadNextQuestion();
    },

    getTimerDuration() {
        // Tentukan batas waktu per materi sesuai instruksi
        if (gameState.currentMateri.startsWith('pecahan')) {
            return 25; // Materi pecahan = 25 detik
        }
        if (gameState.currentMateri === 'perkalian' || gameState.currentMateri === 'pembagian') {
            return 15; // Perkalian / Pembagian = 15 detik
        }
        return 10; // Penjumlahan & Pengurangan = 10 detik
    },

    loadNextQuestion() {
        clearInterval(gameState.timerInterval);
        
        // Cek apakah latihan telah mencapai batas 20 soal
        if (gameState.currentQuestionIndex >= gameState.totalQuestions) {
            this.finishGame();
            return;
        }

        // Trigger Banner Iklan Motivasi setiap kelipatan setelah selesai 5 soal (misal soal ke-6, ke-11, ke-16)
        if (gameState.currentQuestionIndex > 0 && gameState.currentQuestionIndex % 5 === 0) {
            this.showMotivationalAd();
            return;
        }

        // Tampilkan kemajuan nomor soal
        const curNumber = gameState.currentQuestionIndex + 1;
        document.getElementById('progress-text').innerText = `Soal ${curNumber} dari ${gameState.totalQuestions}`;
        document.getElementById('progress-bar-fill').style.width = `${(curNumber / gameState.totalQuestions) * 100}%`;

        // Tentukan materi pemicu jikalau tipenya campuran acak
        let targetMateri = gameState.currentMateri;
        if (targetMateri === 'campuran') {
            const listMateriAsli = DAFTAR_MATERI.filter(m => m.id !== 'campuran');
            targetMateri = listMateriAsli[Math.floor(Math.random() * listMateriAsli.length)].id;
        }

        // Generate Soal Baru Dinamis
        gameState.activeQuestion = questionGenerator.generate(targetMateri, gameState.currentLevel);

        // Pasang ke HTML Teks Soal
        document.getElementById('question-text').innerText = gameState.activeQuestion.question + " = ...";

        // Pasang Tombol Pilihan Jawaban
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        gameState.activeQuestion.choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerText = choice;
            btn.onclick = () => this.checkAnswer(choice);
            optionsContainer.appendChild(btn);
        });

        // Jalankan Timer hitung mundur
        gameState.timeLeft = this.getTimerDuration();
        this.runTimer();
    },

    runTimer() {
        const timerEl = document.getElementById('timer-circle');
        timerEl.innerText = gameState.timeLeft;
        timerEl.style.background = '#38b000'; // Reset Hijau
        timerEl.classList.remove('timer-blink');

        gameState.timerInterval = setInterval(() => {
            gameState.timeLeft--;
            timerEl.innerText = gameState.timeLeft;

            // Transisi Perubahan Warna Timer Indikator
            if (gameState.timeLeft <= 3) {
                timerEl.style.background = '#fb5607'; // Merah
                timerEl.classList.add('timer-blink');
                // Fitur Opisinal Audio Suara Detak
                this.playBeepSound();
            } else if (gameState.timeLeft <= 6) {
                timerEl.style.background = '#ffbe0b'; // Kuning
            }

            if (gameState.timeLeft <= 0) {
                clearInterval(gameState.timerInterval);
                this.handleTimeout();
            }
        }, 1000);
    },

    playBeepSound() {
        // Audio Sintetis tanpa file eksternal agar aman & instan di Github Pages
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            osc.type = 'sine'; osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            osc.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.08);
        } catch(e) {}
    },

    handleTimeout() {
        gameState.wrongCount++;
        this.showFeedback(false, "Waktu Habis! ⏰");
    },

    checkAnswer(selected) {
        clearInterval(gameState.timerInterval);
        const isCorrect = (selected === gameState.activeQuestion.answer);

        if (isCorrect) {
            gameState.score += 5;
            gameState.correctCount++;
            this.showFeedback(true, "Benar! ✨");
        } else {
            gameState.wrongCount++;
            this.showFeedback(false, "Kurang Tepat ❌");
        }
    },

    showFeedback(isCorrect, msg) {
        const overlay = document.getElementById('feedback-overlay');
        const content = document.getElementById('feedback-content');
        
        overlay.classList.remove('hidden');
        if (isCorrect) {
            content.innerHTML = `<span style="color: #38b000;"><i class="fa-solid fa-circle-check"></i><br>${msg}</span>`;
        } else {
            content.innerHTML = `<span style="color: #fb5607;"><i class="fa-solid fa-circle-xmark"></i><br>${msg}</span>`;
        }

        setTimeout(() => {
            overlay.classList.add('hidden');
            gameState.currentQuestionIndex++;
            this.loadNextQuestion();
        }, 1000); // Overlay Tampil 1 detik lalu pindah soal otomatis
    },

    showMotivationalAd() {
        viewManager.showView('view-ad');
        
        // Ambil kalimat motivasi secara acak
        const randomMsg = BANNER_MOTIVASI[Math.floor(Math.random() * BANNER_MOTIVASI.length)];
        document.getElementById('ad-message').innerText = randomMsg;

        setTimeout(() => {
            // Hilang otomatis setelah 3 detik dan lanjutkan permainan
            viewManager.showView('view-game');
            // Sedikit trik: hapus status kelipatan 5 dengan melanjutkan indeks tanpa memicu iklan ganda
            const curNumber = gameState.currentQuestionIndex + 1;
            document.getElementById('progress-text').innerText = `Soal ${curNumber} dari ${gameState.totalQuestions}`;
            
            let targetMateri = gameState.currentMateri;
            if (targetMateri === 'campuran') {
                const list = DAFTAR_MATERI.filter(m => m.id !== 'campuran');
                targetMateri = list[Math.floor(Math.random() * list.length)].id;
            }
            gameState.activeQuestion = questionGenerator.generate(targetMateri, gameState.currentLevel);
            document.getElementById('question-text').innerText = gameState.activeQuestion.question + " = ...";
            
            const container = document.getElementById('options-container');
            container.innerHTML = '';
            gameState.activeQuestion.choices.forEach(choice => {
                const btn = document.createElement('button');
                btn.className = 'option-btn'; btn.innerText = choice;
                btn.onclick = () => this.checkAnswer(choice);
                container.appendChild(btn);
            });

            gameState.timeLeft = this.getTimerDuration();
            this.runTimer();
        }, 3000);
    },

    finishGame() {
        const totalTime = Math.round((Date.now() - gameState.startTime) / 1000);
        
        // Simpan permanen ke local storage
        storageManager.saveRecord(
            gameState.currentMateri, 
            gameState.currentLevel, 
            gameState.score, 
            gameState.correctCount, 
            gameState.wrongCount, 
            totalTime
        );

        // Tampilkan hasil ke halaman skor akhir
        document.getElementById('result-score').innerText = gameState.score;
        document.getElementById('res-right').innerText = gameState.correctCount;
        document.getElementById('res-wrong').innerText = gameState.wrongCount;
        document.getElementById('res-time').innerText = totalTime + " detik";
        document.getElementById('res-acc').innerText = Math.round((gameState.correctCount / 20) * 100) + "%";

        const evalResult = scoreCalculator.getPredicate(gameState.score);
        document.getElementById('result-stars').innerText = evalResult.stars;
        document.getElementById('result-predicate').innerText = evalResult.text;

        viewManager.showView('view-result');

        // Picu efek selebrasi confetti jika nilai memuaskan (>= 80)
        if (gameState.score >= 80) {
            confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 }
            });
        }
    },

    rematch() {
        this.startWithDifficulty(gameState.currentLevel);
    }
};

// INITIALIZE KETIKA WINDOW SIAP
window.onload = () => {
    gameEngine.init();
};
