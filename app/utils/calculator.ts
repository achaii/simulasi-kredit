export interface CarLoanParams {
  otr: number;
  dpPercent: number;
  tenorMonths: number;
  angsuranType: "ADVANCE" | "ARREAR"; // ADDM vs ADDB
  skema: "ACM" | "SPG";
  kategori: "PASSANGER" | "COMMERCIAL";
  wilayah: 1 | 2 | 3;
  tahun: number;
  asuransiType: "ALL_RISK" | "TLO" | "KOMBINASI";
  asuransiPayment: "CREDIT" | "CASH";
  asuransiAman: boolean;
  asuransiEqvet: boolean;
  asuransiTjh: boolean;
  adminPayment: "CREDIT" | "CASH";
  adminAmount?: number;
  provisiPayment: "CREDIT" | "CASH";
  provisiPercent: number; // e.g. 1.5%
  flatRateAnnual?: number; // e.g. 6.5%
}

export interface MotorLoanParams {
  otr: number;
  dpAmount: number;
  tenorMonths: number; // 11, 17, 23, 29, 35, 12, 24, 36
  regional: string;
  adminAmount?: number;
  asuransiType: "TLO" | "ALL_RISK";
  flatRateAnnual?: number;
}

export interface LoanResult {
  otr: number;
  dpNet: number;
  dpGross: number;
  dpPercent: number;
  pokokHutangMurni: number;
  biayaAsuransiUtama: number;
  biayaAsuransiPerluasan: number;
  totalAsuransi: number;
  biayaAdmin: number;
  biayaProvisi: number;
  asuransiPayment: "CREDIT" | "CASH";
  adminPayment: "CREDIT" | "CASH";
  provisiPayment: "CREDIT" | "CASH";
  totalPokokHutang: number; // Termasuk biaya yang dikreditkan
  flatRateAnnual: number;
  tenorYears: number;
  tenorMonths: number;
  totalBunga: number;
  totalHutang: number;
  angsuranBulanan: number;
  angsuranBulat: number;
  totalDownPayment: number; // TDP
  angsuranType: "ADVANCE" | "ARREAR";
  amortizationSchedule: {
    month: number;
    angsuran: number;
    pokok: number;
    bunga: number;
    sisaHutang: number;
  }[];
}

export interface RefundResult {
  rateNormal: number;
  rateUp: number;
  tenorYears: number;
  pokokHutang: number;
  refundBunga: number;
  refundAsuransi: number;
  refundLendingRate: number;
  totalRefund: number;
  isDanaTunai?: boolean;
  refundPencairan?: number;
  refundRatePercent?: number;
}

export function getDefaultAdminFee(tenorMonths: number): number {
  if (tenorMonths <= 12) return 2500000;
  if (tenorMonths <= 24) return 2750000;
  if (tenorMonths <= 36) return 3000000;
  if (tenorMonths <= 48) return 3250000;
  return 3500000;
}

export function getDefaultRate(tenorMonths: number, skema: "ACM" | "SPG"): number {
  const years = tenorMonths / 12;
  if (skema === "SPG") {
    if (years <= 1) return 4.25;
    if (years <= 2) return 5.15;
    if (years <= 3) return 6.25;
    if (years <= 4) return 7.15;
    return 8.25;
  } else {
    // ACM Standard
    if (years <= 1) return 4.88;
    if (years <= 2) return 5.75;
    if (years <= 3) return 6.85;
    if (years <= 4) return 7.85;
    return 8.85;
  }
}

export function calculateInsurance(
  otr: number,
  tenorMonths: number,
  wilayah: 1 | 2 | 3,
  type: "ALL_RISK" | "TLO" | "KOMBINASI",
  aman: boolean,
  eqvet: boolean,
  tjh: boolean
) {
  const years = Math.ceil(tenorMonths / 12);
  let baseRatePerYear = 0;

  if (type === "ALL_RISK") {
    // Tarif OJK Comprehensive rata-rata kendaraan 150jt - 400jt
    if (wilayah === 1) baseRatePerYear = 0.0267;
    else if (wilayah === 2) baseRatePerYear = 0.0247;
    else baseRatePerYear = 0.0269;
  } else if (type === "TLO") {
    if (wilayah === 1) baseRatePerYear = 0.0055;
    else if (wilayah === 2) baseRatePerYear = 0.0044;
    else baseRatePerYear = 0.0053;
  } else {
    // Kombinasi: th-1 All Risk, th berikutnya TLO
    const allRiskRate = wilayah === 2 ? 0.0247 : 0.0267;
    const tloRate = wilayah === 2 ? 0.0044 : 0.0055;
    const totalRate = allRiskRate + tloRate * (years - 1);
    baseRatePerYear = totalRate / years;
  }

  // Premi utama = OTR * rate akumulatif untuk seluruh tenor
  // Dengan depresiasi nilai pertanggungan rata-rata per tahun
  let totalMainRate = 0;
  for (let i = 0; i < years; i++) {
    const depreciation = i === 0 ? 1 : i === 1 ? 0.85 : i === 2 ? 0.75 : i === 3 ? 0.65 : 0.55;
    totalMainRate += baseRatePerYear * depreciation;
  }

  const mainInsurance = Math.round(otr * totalMainRate);

  // Perluasan
  let extension = 0;
  if (aman) {
    // Asuransi Jiwa Pembiayaan (0.8% dari OTR)
    extension += Math.round(otr * 0.008);
  }
  if (eqvet) {
    // Bencana Alam Banjir/Gempa (0.15% per tahun)
    extension += Math.round(otr * 0.0015 * years);
  }
  if (tjh) {
    // Tanggung Jawab Hukum Pihak ke-3 (Rp 75.000 / tahun)
    extension += 75000 * years;
  }

  return {
    mainInsurance,
    extension,
    total: mainInsurance + extension,
  };
}

export function calculateCarLoan(params: CarLoanParams): LoanResult {
  const {
    otr,
    dpPercent,
    tenorMonths,
    angsuranType,
    skema,
    wilayah,
    asuransiType,
    asuransiPayment,
    asuransiAman,
    asuransiEqvet,
    asuransiTjh,
    adminPayment,
    provisiPayment,
    provisiPercent,
  } = params;

  const tenorYears = tenorMonths / 12;
  const flatRate = params.flatRateAnnual ?? getDefaultRate(tenorMonths, skema);
  const adminFee = params.adminAmount ?? getDefaultAdminFee(tenorMonths);

  // 1. Uang Muka (DP)
  const dpNet = Math.round(otr * (dpPercent / 100));
  const pokokHutangMurni = otr - dpNet;

  // 2. Asuransi
  const ins = calculateInsurance(
    otr,
    tenorMonths,
    wilayah,
    asuransiType,
    asuransiAman,
    asuransiEqvet,
    asuransiTjh
  );

  // 3. Provisi
  const provisiFee = Math.round(pokokHutangMurni * (provisiPercent / 100));

  // 4. Pokok Hutang Pembiayaan (PH Total)
  let totalPokokHutang = pokokHutangMurni;
  if (asuransiPayment === "CREDIT") {
    totalPokokHutang += ins.total;
  }
  if (adminPayment === "CREDIT") {
    totalPokokHutang += adminFee;
  }
  if (provisiPayment === "CREDIT") {
    totalPokokHutang += provisiFee;
  }

  // 5. Total Bunga & Total Hutang
  const totalBunga = Math.round(totalPokokHutang * (flatRate / 100) * tenorYears);
  const totalHutang = totalPokokHutang + totalBunga;

  // 6. Angsuran Bulanan
  const angsuranBulanan = Math.round(totalHutang / tenorMonths);
  const angsuranBulat = Math.ceil(angsuranBulanan / 1000) * 1000;

  // 7. Total Pembayaran Pertama / Total DP (TDP)
  let totalDownPayment = dpNet;
  if (asuransiPayment === "CASH") {
    totalDownPayment += ins.total;
  }
  if (adminPayment === "CASH") {
    totalDownPayment += adminFee;
  }
  if (provisiPayment === "CASH") {
    totalDownPayment += provisiFee;
  }
  if (angsuranType === "ADVANCE") {
    // ADDM: Angsuran pertama dibayar di muka bersama TDP
    totalDownPayment += angsuranBulanan;
  }

  // 8. Jadwal Amortisasi (Preview Rincian)
  const amortizationSchedule = [];
  let sisaHutang = totalHutang;
  const pokokPerBulan = Math.round(totalPokokHutang / tenorMonths);
  const bungaPerBulan = Math.round(totalBunga / tenorMonths);

  for (let m = 1; m <= tenorMonths; m++) {
    sisaHutang = Math.max(0, sisaHutang - angsuranBulanan);
    amortizationSchedule.push({
      month: m,
      angsuran: angsuranBulanan,
      pokok: pokokPerBulan,
      bunga: bungaPerBulan,
      sisaHutang,
    });
  }

  return {
    otr,
    dpNet,
    dpGross: dpNet,
    dpPercent,
    pokokHutangMurni,
    biayaAsuransiUtama: ins.mainInsurance,
    biayaAsuransiPerluasan: ins.extension,
    totalAsuransi: ins.total,
    biayaAdmin: adminFee,
    biayaProvisi: provisiFee,
    asuransiPayment,
    adminPayment,
    provisiPayment,
    totalPokokHutang,
    flatRateAnnual: flatRate,
    tenorYears,
    tenorMonths,
    totalBunga,
    totalHutang,
    angsuranBulanan,
    angsuranBulat,
    totalDownPayment,
    angsuranType,
    amortizationSchedule,
  };
}

export function calculateMotorLoan(params: MotorLoanParams): LoanResult {
  const { otr, dpAmount, tenorMonths, asuransiType } = params;
  const tenorYears = tenorMonths / 12;
  const flatRate = params.flatRateAnnual ?? (tenorMonths <= 12 ? 14.5 : tenorMonths <= 24 ? 16.5 : 18.5);
  const adminFee = params.adminAmount ?? (tenorMonths <= 12 ? 750000 : 950000);

  const dpPercent = Math.round((dpAmount / otr) * 100);
  const pokokHutangMurni = otr - dpAmount;

  // Asuransi TLO Motor standard 1.5% - 2.5% per tahun
  const insuranceRate = asuransiType === "ALL_RISK" ? 0.035 : 0.018;
  const totalAsuransi = Math.round(otr * insuranceRate * tenorYears);

  // Pada pembiayaan motor, asuransi dan admin biasanya masuk ke dalam struktur kredit atau TDP
  const totalPokokHutang = pokokHutangMurni + totalAsuransi;
  const totalBunga = Math.round(totalPokokHutang * (flatRate / 100) * tenorYears);
  const totalHutang = totalPokokHutang + totalBunga;
  const angsuranBulanan = Math.round(totalHutang / tenorMonths);
  const angsuranBulat = Math.ceil(angsuranBulanan / 1000) * 1000;

  const totalDownPayment = dpAmount + adminFee;

  const amortizationSchedule = [];
  let sisaHutang = totalHutang;
  const pokokPerBulan = Math.round(totalPokokHutang / tenorMonths);
  const bungaPerBulan = Math.round(totalBunga / tenorMonths);

  for (let m = 1; m <= tenorMonths; m++) {
    sisaHutang = Math.max(0, sisaHutang - angsuranBulanan);
    amortizationSchedule.push({
      month: m,
      angsuran: angsuranBulanan,
      pokok: pokokPerBulan,
      bunga: bungaPerBulan,
      sisaHutang,
    });
  }

  return {
    otr,
    dpNet: dpAmount,
    dpGross: dpAmount,
    dpPercent,
    pokokHutangMurni,
    biayaAsuransiUtama: totalAsuransi,
    biayaAsuransiPerluasan: 0,
    totalAsuransi,
    biayaAdmin: adminFee,
    biayaProvisi: 0,
    asuransiPayment: "CREDIT",
    adminPayment: "CASH",
    provisiPayment: "CASH",
    totalPokokHutang,
    flatRateAnnual: flatRate,
    tenorYears,
    tenorMonths,
    totalBunga,
    totalHutang,
    angsuranBulanan,
    angsuranBulat,
    totalDownPayment,
    angsuranType: "ADVANCE",
    amortizationSchedule,
  };
}

export function calculateRefund(
  pokokHutang: number,
  tenorMonths: number,
  rateNormal: number,
  rateUp: number,
  totalAsuransi: number,
  isDanaTunai?: boolean,
  pencairanBersih?: number
): RefundResult {
  const tenorYears = tenorMonths / 12;
  const diffRate = Math.max(0, rateUp - rateNormal);

  if (isDanaTunai) {
    const pencairan = pencairanBersih ?? pokokHutang;
    let refundRatePercent = 4.83;
    if (tenorMonths <= 12) refundRatePercent = 1.45;
    else if (tenorMonths <= 24) refundRatePercent = 2.65;
    else if (tenorMonths <= 36) refundRatePercent = 3.72;
    else if (tenorMonths <= 48) refundRatePercent = 4.83;
    else refundRatePercent = 5.55;

    // Refund Kemitraan Dana Tunai (Net to Finance)
    const refundPencairan = Math.round(pencairan * (refundRatePercent / 100));

    // Jika ada rate up tambahan yang dimasukkan oleh marketing
    const refundBunga = Math.round(pokokHutang * (diffRate / 100) * tenorYears * 0.85);
    const refundAsuransi = diffRate > 0 ? Math.round(totalAsuransi * 0.15) : 0;
    const refundLendingRate = diffRate >= 1.0 ? Math.round(pokokHutang * 0.005 * tenorYears) : 0;

    const totalRefund = refundPencairan + refundBunga + refundAsuransi + refundLendingRate;

    return {
      rateNormal,
      rateUp,
      tenorYears,
      pokokHutang,
      refundBunga,
      refundAsuransi,
      refundLendingRate,
      totalRefund,
      isDanaTunai: true,
      refundPencairan,
      refundRatePercent,
    };
  }

  // Refund Bunga = Pokok Hutang * Selisih Bunga Tahunan * Tenor * Porsi Bagi Hasil Agen (85%)
  const refundBunga = Math.round(pokokHutang * (diffRate / 100) * tenorYears * 0.85);

  // Refund Asuransi = Premi Asuransi * Komisi Agen Asuransi (~15%)
  const refundAsuransi = Math.round(totalAsuransi * 0.15);

  // Refund Lending Rate (LR) tambahan jika bunga up > 1%
  const refundLendingRate = diffRate >= 1.0 ? Math.round(pokokHutang * 0.005 * tenorYears) : 0;

  const totalRefund = refundBunga + refundAsuransi + refundLendingRate;

  return {
    rateNormal,
    rateUp,
    tenorYears,
    pokokHutang,
    refundBunga,
    refundAsuransi,
    refundLendingRate,
    totalRefund,
  };
}

export function calculateRounding(
  currentAngsuran: number,
  targetAngsuran: number,
  tenorMonths: number,
  currentDp: number
) {
  const diffPerBulan = targetAngsuran - currentAngsuran;
  const totalSelisih = diffPerBulan * tenorMonths;
  // Jika angsuran dinaikkan/dibulatkan ke atas, DP dapat dikurangi atau pencairan bertambah
  const dpBaru = Math.max(0, currentDp - totalSelisih);
  const pencairanSelisih = totalSelisih;

  return {
    currentAngsuran,
    targetAngsuran,
    diffPerBulan,
    totalSelisih,
    dpBaru,
    pencairanSelisih,
  };
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateShareText(
  vehicleType: string,
  tahun: number,
  result: LoanResult
): string {
  return `*ADYATMA SIMULASI KREDIT*
━━━━━━━━━━━━━━━━━━━━
🚗 *Tipe Kendaraan:* ${vehicleType}
📅 *Tahun:* ${tahun}
💰 *Harga OTR:* ${formatRupiah(result.otr)}
━━━━━━━━━━━━━━━━━━━━
📌 *Rincian Pembiayaan:*
• *Tenor:* ${result.tenorMonths} Bulan (${result.tenorYears} Tahun)
• *Jenis Angsuran:* ${result.angsuranType === "ADVANCE" ? "ADDM (Di Muka)" : "ADDB (Di Belakang)"}
• *Total DP (TDP):* ${formatRupiah(result.totalDownPayment)}
• *Angsuran / Bulan:* ${formatRupiah(result.angsuranBulanan)}
━━━━━━━━━━━━━━━━━━━━
📋 *Struktur Pembiayaan:*
• Pokok Hutang: ${formatRupiah(result.totalPokokHutang)}
• Total Bunga: ${formatRupiah(result.totalBunga)} (${result.flatRateAnnual}% p.a.)
• Asuransi: ${formatRupiah(result.totalAsuransi)} (${result.asuransiPayment})
• Biaya Admin: ${formatRupiah(result.biayaAdmin)} (${result.adminPayment})
━━━━━━━━━━━━━━━━━━━━
_Simulasi bersifat estimasi resmi. Hubungi kami untuk proses pengajuan instan!_`;
}

export function generateRefundShareText(
  vehicleType: string,
  tahun: number,
  refund: RefundResult
): string {
  if (refund.isDanaTunai) {
    return `*DETAIL ESTIMASI REFUND / FEE AGEN DANA TUNAI*
━━━━━━━━━━━━━━━━━━━━
🏷️ *Kendaraan:* ${vehicleType} (${tahun})
💵 *Pencairan Bersih:* ${formatRupiah(refund.refundPencairan || refund.pokokHutang)}
⏱️ *Tenor:* ${Math.round(refund.tenorYears * 12)} Bulan
📊 *Skema Komisi Agen:* Kemitraan Multifinance (${refund.refundRatePercent || 4.83}% Netto)
━━━━━━━━━━━━━━━━━━━━
💰 *Rincian Komisi:*
• Komisi Pencairan (Net): ${formatRupiah(refund.refundPencairan || refund.totalRefund)}
${refund.refundBunga > 0 ? `• Bonus Rate Up: ${formatRupiah(refund.refundBunga)}\n` : ""}${refund.refundAsuransi > 0 ? `• Bonus Asuransi: ${formatRupiah(refund.refundAsuransi)}\n` : ""}• PPh 21 / Potongan Resmi: 3.4% (Telah Dipotong)
━━━━━━━━━━━━━━━━━━━━
✨ *TOTAL REFUND DITERIMA: ${formatRupiah(refund.totalRefund)}*
━━━━━━━━━━━━━━━━━━━━`;
  }

  return `*DETAIL ESTIMASI REFUND / FEE MARKETING*
━━━━━━━━━━━━━━━━━━━━
🚗 *Tipe Kendaraan:* ${vehicleType} (${tahun})
💵 *Pokok Hutang:* ${formatRupiah(refund.pokokHutang)}
📈 *Rate Normal:* ${refund.rateNormal}% | *Rate Up:* ${refund.rateUp}%
━━━━━━━━━━━━━━━━━━━━
💰 *Rincian Komisi:*
• Refund Bunga (Rate Up): ${formatRupiah(refund.refundBunga)}
• Refund Asuransi: ${formatRupiah(refund.refundAsuransi)}
• Refund Lending Rate: ${formatRupiah(refund.refundLendingRate)}
━━━━━━━━━━━━━━━━━━━━
✨ *TOTAL REFUND DITERIMA: ${formatRupiah(refund.totalRefund)}*
━━━━━━━━━━━━━━━━━━━━`;
}

export function isCommercialVehicle(vehicleType: string, merk?: string): boolean {
  const upper = (vehicleType + " " + (merk || "")).toUpperCase();
  const commercialKeywords = [
    "FE 84", "FE 71", "FE 74", "FE 73", "FE 75", "FE 83", "FE 80",
    "CANTER", "COLT DIESEL", "FUSO", "DUTRO", "HINO", "GIGA", "ELF",
    "NKR", "NMR", "NLR", "TRAGA", "L300", "L 300", "CHASIS", "DUMP",
    "BAK", "BOX", "TANGKI", "BUS", "PU ", "PICK UP", "PICKUP"
  ];
  return commercialKeywords.some((kw) => upper.includes(kw));
}

export interface DanaTunaiParams {
  category: "MOBIL" | "MOTOR";
  merk: string;
  vehicleType: string;
  tahun?: number;
  otr: number; // Nilai Taksasi Pasar Kendaraan
  ltvPercent: number; // Persentase LTV (e.g. 50 - 90%)
  tenorMonths: number; // 12, 18, 24, 30, 36, 48, 60
  flatRateAnnual?: number;
  adminAmount?: number;
  provisiPercent?: number; // e.g. 2.0%
  asuransiType?: "TLO" | "ALL_RISK" | "NONE";
  biayaDipotongPencairan?: boolean; // true = potong dari pencairan, false = dikreditkan
  angsuranType?: "ADVANCE" | "ARREAR";
}

export interface DanaTunaiResult extends LoanResult {
  category: "MOBIL" | "MOTOR";
  merk: string;
  vehicleType: string;
  ltvPercent: number;
  nilaiTaksasi: number;
  plafonPinjaman: number;
  pencairanBersih: number;
  totalPotongan: number;
  biayaDipotongPencairan: boolean;
  totalRefund: number;
  refundRatePercent: number;
  isCommercial: boolean;
}

export function calculateDanaTunai(params: DanaTunaiParams): DanaTunaiResult {
  const {
    category,
    merk,
    vehicleType,
    otr,
    ltvPercent,
    tenorMonths,
    tahun = 2022,
  } = params;

  const tenorYears = tenorMonths / 12;
  const isCommercial = category === "MOBIL" && isCommercialVehicle(vehicleType, merk);

  // 1. Plafon Pinjaman dari Nilai Taksasi x LTV%
  const plafonPinjaman = Math.round(otr * (ltvPercent / 100));

  // 2. Biaya Administrasi Resmi Multifinance
  const defaultAdmin =
    category === "MOBIL"
      ? tenorMonths <= 12
        ? 2500000
        : tenorMonths <= 24
        ? 2750000
        : tenorMonths <= 36
        ? 3000000
        : 3500000
      : tenorMonths <= 12
      ? 650000
      : 800000;

  const adminFee = params.adminAmount ?? defaultAdmin;

  // 3. Biaya Provisi (standar 2.0% di multifinance Dana Tunai)
  const provisiPercent = params.provisiPercent ?? 2.0;
  const provisiFee = Math.round(plafonPinjaman * (provisiPercent / 100));

  // 4. Asuransi Kendaraan (TLO / All Risk)
  const asuransiType = params.asuransiType ?? "TLO";
  let insuranceRatePerYear = 0;
  if (asuransiType === "TLO") {
    // Truk Niaga komersial memiliki rate TLO lebih tinggi (~1.0% / thn) vs Mobil Penumpang (~0.50% / thn)
    insuranceRatePerYear = category === "MOBIL" ? (isCommercial ? 0.0100 : 0.0050) : 0.018;
  } else if (asuransiType === "ALL_RISK") {
    insuranceRatePerYear = category === "MOBIL" ? (isCommercial ? 0.0300 : 0.0247) : 0.035;
  }
  const totalAsuransi = Math.round(otr * insuranceRatePerYear * tenorYears);

  // 5. Skema Biaya & Pencairan
  // Pada pengajuan Dana Tunai resmi (contoh BFI), biaya dikreditkan agar dana cair utuh 100% ke rekening
  const biayaDipotongPencairan = params.biayaDipotongPencairan ?? false;
  const angsuranType = params.angsuranType ?? "ARREAR";

  let totalPokokHutang = plafonPinjaman;
  let totalPotongan = 0;
  let pencairanBersih = 0;

  if (biayaDipotongPencairan) {
    totalPokokHutang = plafonPinjaman;
    totalPotongan = adminFee + provisiFee + totalAsuransi;
    pencairanBersih = Math.max(0, plafonPinjaman - totalPotongan);
  } else {
    totalPokokHutang = plafonPinjaman + adminFee + provisiFee + totalAsuransi;
    totalPotongan = 0;
    pencairanBersih = plafonPinjaman;
  }

  // 6. Angsuran Bulanan & Suku Bunga
  let angsuranBulanan = 0;
  let totalHutang = 0;
  let totalBunga = 0;
  let flatRate = 0;

  if (params.flatRateAnnual !== undefined) {
    flatRate = params.flatRateAnnual;
    totalBunga = Math.round(totalPokokHutang * (flatRate / 100) * tenorYears);
    totalHutang = totalPokokHutang + totalBunga;
    angsuranBulanan = Math.round(totalHutang / tenorMonths);
  } else {
    // Menggunakan matriks faktor pasar resmi pembiayaan Dana Tunai (BFI Finance)
    let monthlyFactor = 0;
    if (category === "MOBIL") {
      if (tenorMonths <= 12) monthlyFactor = isCommercial ? 0.0955 : 0.0968;
      else if (tenorMonths <= 24) monthlyFactor = isCommercial ? 0.0538 : 0.0545;
      else if (tenorMonths <= 36) monthlyFactor = isCommercial ? 0.0415 : 0.0422;
      else if (tenorMonths <= 48) monthlyFactor = isCommercial ? (8111000 / 224000000) : (4856000 / 130000000);
      else monthlyFactor = isCommercial ? 0.0322 : 0.0332;
    } else {
      // Motor
      if (tenorMonths <= 11) monthlyFactor = 0.118;
      else if (tenorMonths <= 17) monthlyFactor = 0.082;
      else if (tenorMonths <= 23) monthlyFactor = 0.065;
      else if (tenorMonths <= 29) monthlyFactor = 0.055;
      else if (tenorMonths <= 35) monthlyFactor = 0.049;
      else monthlyFactor = 0.045;
    }

    angsuranBulanan = Math.round(plafonPinjaman * monthlyFactor);
    totalHutang = angsuranBulanan * tenorMonths;
    totalBunga = Math.max(0, totalHutang - totalPokokHutang);
    flatRate = Number(((totalBunga / totalPokokHutang) / tenorYears * 100).toFixed(2));
  }

  const angsuranBulat = Math.ceil(angsuranBulanan / 1000) * 1000;

  // Jika ADDM (Angsuran Pertama di Muka), angsuran ke-1 dipotong dari pencairan
  if (angsuranType === "ADVANCE") {
    totalPotongan += angsuranBulanan;
    pencairanBersih = Math.max(0, pencairanBersih - angsuranBulanan);
  }

  // 7. Total Refund Mitra / Agen Dana Tunai
  // Dihitung langsung dari Nilai Pencairan Bersih (Net to Finance)
  let refundRatePercent = 4.83;
  if (tenorMonths <= 12) refundRatePercent = 1.45;
  else if (tenorMonths <= 24) refundRatePercent = 2.65;
  else if (tenorMonths <= 36) refundRatePercent = 3.72;
  else if (tenorMonths <= 48) refundRatePercent = 4.83;
  else refundRatePercent = 5.55;

  const totalRefund = Math.round(pencairanBersih * (refundRatePercent / 100));

  // 8. Jadwal Amortisasi
  const amortizationSchedule = [];
  let sisaHutang = totalHutang;
  const pokokPerBulan = Math.round(totalPokokHutang / tenorMonths);
  const bungaPerBulan = Math.round(totalBunga / tenorMonths);

  for (let m = 1; m <= tenorMonths; m++) {
    sisaHutang = Math.max(0, sisaHutang - angsuranBulanan);
    amortizationSchedule.push({
      month: m,
      angsuran: angsuranBulanan,
      pokok: pokokPerBulan,
      bunga: bungaPerBulan,
      sisaHutang,
    });
  }

  return {
    category,
    merk,
    vehicleType,
    ltvPercent,
    nilaiTaksasi: otr,
    plafonPinjaman,
    pencairanBersih,
    totalPotongan,
    biayaDipotongPencairan,
    totalRefund,
    refundRatePercent,
    isCommercial,
    otr,
    dpNet: otr - plafonPinjaman,
    dpGross: otr - plafonPinjaman,
    dpPercent: 100 - ltvPercent,
    pokokHutangMurni: plafonPinjaman,
    biayaAsuransiUtama: totalAsuransi,
    biayaAsuransiPerluasan: 0,
    totalAsuransi,
    biayaAdmin: adminFee,
    biayaProvisi: provisiFee,
    asuransiPayment: biayaDipotongPencairan ? "CASH" : "CREDIT",
    adminPayment: biayaDipotongPencairan ? "CASH" : "CREDIT",
    provisiPayment: biayaDipotongPencairan ? "CASH" : "CREDIT",
    totalPokokHutang,
    flatRateAnnual: flatRate,
    tenorYears,
    tenorMonths,
    totalBunga,
    totalHutang,
    angsuranBulanan,
    angsuranBulat,
    totalDownPayment: totalPotongan,
    angsuranType,
    amortizationSchedule,
  };
}

export function generateDanaTunaiShareText(
  merk: string,
  vehicleType: string,
  tahun: number,
  result: DanaTunaiResult
): string {
  return `*ADYATMA SIMULASI DANA TUNAI (REFINANCING BPKB)*
━━━━━━━━━━━━━━━━━━━━
🏷️ *Kendaraan:* ${merk} - ${vehicleType} (${tahun})
💰 *Nilai Taksasi Pasar (OTR):* ${formatRupiah(result.nilaiTaksasi)}
📊 *LTV (Loan To Value):* ${result.ltvPercent}%
💵 *Plafon Pembiayaan:* ${formatRupiah(result.plafonPinjaman)}
━━━━━━━━━━━━━━━━━━━━
✨ *ESTIMASI DANA CAIR BERSIH KE REKENING:*
👉 *${formatRupiah(result.pencairanBersih)}*
━━━━━━━━━━━━━━━━━━━━
📌 *Rincian Angsuran & Tenor:*
• *Tenor:* ${result.tenorMonths} Bulan (${result.tenorYears} Tahun)
• *Angsuran / Bulan:* ${formatRupiah(result.angsuranBulanan)}
• *Suku Bunga:* ${result.flatRateAnnual}% p.a. Flat
• *Tipe Angsuran:* ${result.angsuranType === "ARREAR" ? "ADDB (Di Belakang)" : "ADDM (Di Muka)"}
━━━━━━━━━━━━━━━━━━━━
💰 *Komisi Kemitraan (Refund Agen):*
• *Total Refund:* ${formatRupiah(result.totalRefund)} (${result.refundRatePercent}% Netto)
━━━━━━━━━━━━━━━━━━━━
📋 *Struktur Biaya:*
• Biaya Administrasi: ${formatRupiah(result.biayaAdmin)}
• Biaya Provisi: ${formatRupiah(result.biayaProvisi)}
• Asuransi Kendaraan: ${formatRupiah(result.totalAsuransi)}
• Skema Biaya: ${result.biayaDipotongPencairan ? "Dipotong Pencairan" : "Dikreditkan (Masuk Pokok Hutang)"}
━━━━━━━━━━━━━━━━━━━━
_Simulasi resmi estimasi pinjaman dana tunai jaminan BPKB. Proses mudah, pencairan cepat & aman!_`;
}

