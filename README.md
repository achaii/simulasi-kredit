# Simulasi Kredit

Aplikasi web modern untuk kalkulasi simulasi kredit pembiayaan mobil dan motor, dilengkapi skema ADDM & ADDB, perhitungan asuransi (All Risk, TLO, Perluasan AMAN/EQVET/TJH), pembulatan angsuran, kalkulator refund fee agen marketing, dan database 5.000+ kendaraan OTR live.

---

## ✨ Fitur Utama

1. **🚗 Simulasi Kredit Mobil (ACM & SPG)**
   - Mendukung Skema **ACM (Customer/Retail)** dan **SPG (Paket Gross)**.
   - Pilihan tipe pembayaran **In Advance (ADDM)** dan **In Arrear (ADDB)**.
   - Proteksi Asuransi Komprehensif (All Risk), Total Loss Only (TLO), Kombinasi, serta perluasan TJH, EQVET, dan AMAN Jiwa.
   - Biaya Administrasi & Biaya Provisi (Cash / Masuk Kredit).
   - Fitur **Nego Rate / Suku Bunga Custom** tahunan.
   - Fitur **Pembulatan Nilai Angsuran** (`p$Bulatkan`) ke ratusan ribu terdekat dengan penyesuaian DP otomatis.
   - Rincian **Struktur Pembiayaan & Amortisasi** lengkap.
   - Tombol **Kirim WhatsApp** dan **Salin Rincian** satu kali klik.

2. **🏍️ Simulasi Kredit Motor (MCY)**
   - Opsi tenor reguler motor: **11, 17, 23, 29, dan 35 Bulan**.
   - Opsi tenor tahunan: **12 Bulan (1 Th), 24 Bulan (2 Th), 36 Bulan (3 Th)**.
   - Presets Down Payment (10%, 15%, 20%, 25%, 30%).
   - Pembagian regional wilayah plat motor.

3. **📖 Database & Glossary OTR (5,000+ Data)**
   - Pencarian real-time untuk 2,180 tipe mobil dan 845 motor.
   - Pencarian berdasarkan nama kendaraan, tipe pasar, atau kode STNK kepolisian.
   - Tombol "Pilih" langsung mengisi form kalkulator secara instan.

4. **💰 Kalkulator Refund & Fee Agen Marketing**
   - Perhitungan estimasi komisi agen/marketing berdasarkan Rate Up (Selisih Rate Jual vs Rate Dasar).
   - Bonus pencairan asuransi dan bonus Lending Rate (LR).
   - Template share rincian komisi ke WhatsApp.

5. **📱 Desain Modern & Responsif (Flip7 Style)**
   - Tampilan bersih desktop mode dengan menu navigasi yang proporsional.
   - Tampilan mobile mode dengan **Burger Menu (☰)** responsif dan touch-friendly.
   - Skema warna kontras teal-coral-gold yang elegan dan profesional.

---

## 🚀 Menjalankan Secara Lokal

### Prasyarat
- [Node.js](https://nodejs.org/) v18+ atau v20+
- npm / yarn / pnpm

### Instalasi & Menjalankan
```bash
# Clone repository
git clone https://github.com/achaii/simulasi-kredit.git
cd simulasi-kredit

# Install dependensi
npm install

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Build Production
```bash
npm run build
npm run start
```

---

## 🛠️ Teknologi yang Digunakan
- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Library:** React 19, TypeScript
- **Styling:** Vanilla CSS murni dengan CSS variables & responsive design system
- **Icons:** Lucide React & Native Unicode Emojis

---

## 📄 Lisensi
© 2026 Adyatma Simulasi Kredit. All rights reserved.
