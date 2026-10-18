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
  totalAsuransi: number
): RefundResult {
  const tenorYears = tenorMonths / 12;
  const diffRate = Math.max(0, rateUp - rateNormal);

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
