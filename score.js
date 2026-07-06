const scoreCalculator = {
    // Ambil predikat teks beserta format bintang emojinya
    getPredicate(score) {
        if (score >= 95) return { stars: '⭐⭐⭐⭐⭐', text: 'Luar Bisa 🏆' };
        if (score >= 80) return { stars: '⭐⭐⭐⭐', text: 'Sangat Baik 👍' };
        if (score >= 65) return { stars: '⭐⭐⭐', text: 'Baik 🌟' };
        if (score >= 50) return { stars: '⭐⭐', text: 'Cukup 💪' };
        return { stars: '⭐', text: 'Tetap Semangat ❤️' };
    }
};
