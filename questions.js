const questionGenerator = {
    // Membantu mencari FPB untuk menyederhanakan pecahan
    gcd(a, b) {
        return b ? this.gcd(b, a % b) : a;
    },

    // Membantu menyederhanakan pecahan ke format string teks
    simplifyFraction(num, denom) {
        const d = this.gcd(num, denom);
        num = num / d;
        denom = denom / d;
        if (denom === 1) return `${num}`;
        return `${num}/${denom}`;
    },

    // Membantu mengacak posisi pilihan jawaban A, B, C, D
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    // Membuat pengecoh distrator jawaban bilangan bulat acak yang masuk akal sekitar nilai jawaban asli
    generateIntegerDistractors(correctAnswer, count = 3) {
        const distractors = new Set();
        while (distractors.size < count) {
            const offset = Math.floor(Math.random() * 7) - 3; // Rentang selisih -3 s/d +3
            const candidate = correctAnswer + offset;
            if (candidate !== correctAnswer && candidate >= 0) {
                distractors.add(candidate);
            }
        }
        return Array.from(distractors);
    },

    // Generate soal utama berdasarkan ID Materi & Tingkat kesulitan
    generate(materiId, level) {
        let text = "";
        let correctVal = 0;
        let options = [];
        
        // Atur rentang default
        let min = 0, max = 10;

        switch (materiId) {
            case 'penjumlahan':
                if (level === 'easy') { max = 20; }
                else if (level === 'normal') { max = 100; }
                else { max = 1000; }
                const a1 = Math.floor(Math.random() * (max - min + 1)) + min;
                const b1 = Math.floor(Math.random() * (max - min + 1)) + min;
                text = `${a1} + ${b1}`;
                correctVal = a1 + b1;
                options = this.generateIntegerDistractors(correctVal).map(v => v.toString());
                options.push(correctVal.toString());
                break;

            case 'pengurangan':
                if (level === 'easy') { max = 20; }
                else if (level === 'normal') { max = 100; }
                else { max = 1000; }
                let a2 = Math.floor(Math.random() * (max - min + 1)) + min;
                let b2 = Math.floor(Math.random() * (max - min + 1)) + min;
                if (a2 < b2) [a2, b2] = [b2, a2]; // Menghindari hasil bernilai minus (-)
                text = `${a2} - ${b2}`;
                correctVal = a2 - b2;
                options = this.generateIntegerDistractors(correctVal).map(v => v.toString());
                options.push(correctVal.toString());
                break;

            case 'perkalian':
                if (level === 'easy') { min = 1; max = 10; }
                else if (level === 'normal') { min = 1; max = 20; }
                else { min = 1; max = 50; }
                const a3 = Math.floor(Math.random() * (max - min + 1)) + min;
                const b3 = Math.floor(Math.random() * (max - min + 1)) + min;
                text = `${a3} × ${b3}`;
                correctVal = a3 * b3;
                options = this.generateIntegerDistractors(correctVal).map(v => v.toString());
                options.push(correctVal.toString());
                break;

            case 'pembagian':
                // Selalu jamin hasil pembagian bulat menggunakan skema perkalian terbalik
                if (level === 'easy') { min = 1; max = 10; }
                else if (level === 'normal') { min = 1; max = 15; }
                else { min = 2; max = 25; }
                const hasilPembagian = Math.floor(Math.random() * (max - min + 1)) + min;
                const pembagi = Math.floor(Math.random() * (max === 10 ? 9 : 12)) + 2; 
                const angkaDepan = hasilPembagian * pembagi;

                text = `${angkaDepan} ÷ ${pembagi}`;
                correctVal = hasilPembagian;
                options = this.generateIntegerDistractors(correctVal).map(v => v.toString());
                options.push(correctVal.toString());
                break;

            case 'pecahan_tambah_kurang':
                // Menggunakan daftar penyebut konstan sederhana agar ramah anak SD
                const penyebutList = [2, 3, 4, 5, 6, 8];
                const penyebut = penyebutList[Math.floor(Math.random() * penyebutList.length)];
                const n1 = Math.floor(Math.random() * (penyebut - 1)) + 1;
                let n2 = Math.floor(Math.random() * (penyebut - 1)) + 1;
                
                // Acak operasi tambah atau kurang
                const isTambah = Math.random() > 0.5;
                if (isTambah) {
                    text = `${n1}/${penyebut} + ${n2}/${penyebut}`;
                    correctVal = this.simplifyFraction(n1 + n2, penyebut);
                    // Generate pengacau
                    options = [
                        this.simplifyFraction(Math.abs(n1 - n2) || 1, penyebut),
                        this.simplifyFraction(n1 + n2 + 1, penyebut),
                        this.simplifyFraction(n1 + n2, penyebut + 1)
                    ];
                } else {
                    let top1 = n1, top2 = n2;
                    if(top1 < top2) [top1, top2] = [top2, top1];
                    text = `${top1}/${penyebut} - ${top2}/${penyebut}`;
                    correctVal = this.simplifyFraction(top1 - top2, penyebut);
                    options = [
                        this.simplifyFraction(top1 + top2, penyebut),
                        this.simplifyFraction(Math.abs(top1 - top2) + 1, penyebut),
                        this.simplifyFraction(top1, penyebut)
                    ];
                }
                options.push(correctVal);
                break;

            case 'pecahan_kali_bagi':
                const p1_num = Math.floor(Math.random() * 3) + 1;
                const p1_den = Math.floor(Math.random() * 3) + 2; // 2 s/d 4
                const p2_num = Math.floor(Math.random() * 3) + 1;
                const p2_den = Math.floor(Math.random() * 3) + 2;

                const isKali = Math.random() > 0.5;
                if (isKali) {
                    text = `${p1_num}/${p1_den} × ${p2_num}/${p2_den}`;
                    correctVal = this.simplifyFraction(p1_num * p2_num, p1_den * p2_den);
                    options = [
                        this.simplifyFraction(p1_num + p2_num, p1_den + p2_den),
                        this.simplifyFraction(p1_num * p2_num, p1_den + p2_den),
                        this.simplifyFraction(p1_num, p2_den)
                    ];
                } else {
                    text = `${p1_num}/${p1_den} ÷ ${p2_num}/${p2_den}`;
                    // Aturan bagi pecahan dibalik jadi kali
                    correctVal = this.simplifyFraction(p1_num * p2_den, p1_den * p2_num);
                    options = [
                        this.simplifyFraction(p1_num * p2_num, p1_den * p2_den),
                        this.simplifyFraction(p1_num, p1_den),
                        this.simplifyFraction(p2_num, p2_den)
                    ];
                }
                options.push(correctVal);
                break;

            case 'pecahan_bulat':
                const pb_num = Math.floor(Math.random() * 4) + 1;
                const pb_den = Math.floor(Math.random() * 4) + 2; // 2 s/d 5
                const bulat = Math.floor(Math.random() * 5) + 2; // Bilangan bulat 2 s/d 6

                text = `${pb_num}/${pb_den} × ${bulat}`;
                correctVal = this.simplifyFraction(pb_num * bulat, pb_den);
                options = [
                    this.simplifyFraction(pb_num, pb_den),
                    this.simplifyFraction(pb_num * bulat + 1, pb_den),
                    this.simplifyFraction(pb_num, pb_den * bulat)
                ];
                options.push(correctVal);
                break;
        }

        // Amankan filter duplikasi string dan bersihkan opsi unik
        options = Array.from(new Set(options));
        while(options.length < 4) {
            options.push(options[0] + "1");
        }

        return {
            question: text,
            answer: correctVal.toString(),
            choices: this.shuffleArray(options)
        };
    }
};
