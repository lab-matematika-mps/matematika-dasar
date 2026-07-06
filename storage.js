const storageManager = {
    KEY_HISTORY: 'matematika_sd_history',

    // Ambil riwayat lengkap
    getHistory() {
        const data = localStorage.getItem(this.KEY_HISTORY);
        return data ? JSON.parse(data) : [];
    },

    // Simpan latihan baru (maksimal 10 terakhir)
    saveRecord(materi, level, score, totalCorrect, totalWrong, duration) {
        const history = this.getHistory();
        const newRecord = {
            id: Date.now(),
            date: new Date().toLocaleDateString('id-ID'),
            materi: materi,
            level: level,
            score: score,
            correct: totalCorrect,
            wrong: totalWrong,
            duration: duration
        };

        history.unshift(newRecord); // Tambahkan ke depan
        if (history.length > 10) history.pop(); // Batasi 10 item

        localStorage.setItem(this.KEY_HISTORY, JSON.stringify(history));
    },

    // Mengambil ringkasan statistik untuk dashboard prestasi
    getDashboardStats() {
        const history = this.getHistory();
        if (history.length === 0) {
            return { highScore: 0, totalGames: 0, totalCorrect: 0, avgAccuracy: 0 };
        }

        let highScore = 0;
        let totalCorrect = 0;
        let totalQuestions = 0;

        history.forEach(item => {
            if (item.score > highScore) highScore = item.score;
            totalCorrect += item.correct;
            totalQuestions += (item.correct + item.wrong);
        });

        const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

        return {
            highScore: highScore,
            totalGames: history.length,
            totalCorrect: totalCorrect,
            avgAccuracy: accuracy
        };
    }
};
