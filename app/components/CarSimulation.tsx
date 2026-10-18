"use client";

import React, { useState, useMemo, useEffect, useDeferredValue } from "react";
import dynamic from "next/dynamic";
import {
  CarLoanParams,
  LoanResult,
  calculateCarLoan,
  formatRupiah,
  generateShareText,
  getDefaultAdminFee,
  getDefaultRate,
} from "../utils/calculator";
import vehicleData from "../data/vehicleData.json";

// Dynamic imports for heavy modals
const RoundingModal = dynamic(() => import("./RoundingModal"), { ssr: false });
const RefundModal = dynamic(() => import("./RefundModal"), { ssr: false });
const CreditStructureModal = dynamic(() => import("./CreditStructureModal"), { ssr: false });

interface CarSimulationProps {
  initialVehicle?: string;
  onOpenGlossary: () => void;
}

export default function CarSimulation({ initialVehicle, onOpenGlossary }: CarSimulationProps) {
  // Form State
  const [skema, setSkema] = useState<"ACM" | "SPG">("ACM");
  const [kategori, setKategori] = useState<"PASSANGER" | "COMMERCIAL">("PASSANGER");
  const [wilayah, setWilayah] = useState<1 | 2 | 3>(2); // Default Wilayah 2 (Jabar, DKI, Banten)
  const [vehicleName, setVehicleName] = useState<string>(initialVehicle || "AVANZA 1.5 G MT");
  const [searchQuery, setSearchQuery] = useState<string>(initialVehicle || "AVANZA 1.5 G MT");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const [tahun, setTahun] = useState<number>(2024);
  const [otr, setOtr] = useState<number>(250000000);
  const [dpPercent, setDpPercent] = useState<number>(20);
  const [angsuranType, setAngsuranType] = useState<"ADVANCE" | "ARREAR">("ADVANCE");
  const [tenorMonths, setTenorMonths] = useState<number>(36);

  // Insurance
  const [asuransiType, setAsuransiType] = useState<"ALL_RISK" | "TLO" | "KOMBINASI">("ALL_RISK");
  const [asuransiPayment, setAsuransiPayment] = useState<"CREDIT" | "CASH">("CREDIT");
  const [asuransiAman, setAsuransiAman] = useState<boolean>(true);
  const [asuransiEqvet, setAsuransiEqvet] = useState<boolean>(false);
  const [asuransiTjh, setAsuransiTjh] = useState<boolean>(false);

  // Admin & Provision
  const [adminPayment, setAdminPayment] = useState<"CREDIT" | "CASH">("CREDIT");
  const [adminAmount, setAdminAmount] = useState<number>(getDefaultAdminFee(36));
  const [provisiPayment, setProvisiPayment] = useState<"CREDIT" | "CASH">("CREDIT");
  const [provisiPercent, setProvisiPercent] = useState<number>(1.5);

  // Suku Bunga Custom / Nego Rate
  const [customRate, setCustomRate] = useState<number | undefined>(undefined);

  // Modals
  const [isRoundingOpen, setIsRoundingOpen] = useState(false);
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [isStructureOpen, setIsStructureOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Handle external vehicle selection from Glossary
  useEffect(() => {
    if (initialVehicle) {
      setVehicleName(initialVehicle);
      setSearchQuery(initialVehicle);
    }
  }, [initialVehicle]);

  // Update default admin fee & rate when tenor changes
  useEffect(() => {
    setAdminAmount(getDefaultAdminFee(tenorMonths));
    setCustomRate(getDefaultRate(tenorMonths, skema));
  }, [tenorMonths, skema]);

  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Autocomplete vehicle options with deferred query (no input lag)
  const searchResults = useMemo(() => {
    if (!deferredSearchQuery) return vehicleData.cars.slice(0, 15);
    const q = deferredSearchQuery.toLowerCase().trim();
    return vehicleData.cars.filter((c: string) => c.toLowerCase().includes(q)).slice(0, 20);
  }, [deferredSearchQuery]);

  // Calculate live results
  const result: LoanResult = useMemo(() => {
    return calculateCarLoan({
      otr,
      dpPercent,
      tenorMonths,
      angsuranType,
      skema,
      kategori,
      wilayah,
      tahun,
      asuransiType,
      asuransiPayment,
      asuransiAman,
      asuransiEqvet,
      asuransiTjh,
      adminPayment,
      adminAmount,
      provisiPayment,
      provisiPercent,
      flatRateAnnual: customRate,
    });
  }, [
    otr,
    dpPercent,
    tenorMonths,
    angsuranType,
    skema,
    kategori,
    wilayah,
    tahun,
    asuransiType,
    asuransiPayment,
    asuransiAman,
    asuransiEqvet,
    asuransiTjh,
    adminPayment,
    adminAmount,
    provisiPayment,
    provisiPercent,
    customRate,
  ]);

  const handleCopy = () => {
    const text = generateShareText(vehicleName, tahun, result);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = generateShareText(vehicleName, tahun, result);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Scheme Switcher */}
      <div
        className="flip7-card accent-bar-teal"
        style={{ background: "linear-gradient(135deg, #FFFFFF 0%, #EFF8F7 50%, #E8F6F5 100%)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#2BA8A2]/25 flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
              🚗
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-extrabold text-[#1A3835]">
                  Simulasi Kredit Mobil
                </h1>
                <span className="flip7-badge badge-teal">Mobil Baru &amp; Bekas</span>
              </div>
              <p className="text-xs text-[#6B9590] mt-0.5 font-medium">
                Kalkulasi resmi skema In Advance (ADDM) &amp; In Arrear (ADDB) dengan simulasi bunga flat pembiayaan
              </p>
            </div>
          </div>

          {/* Scheme Switcher */}
          <div className="flex items-center gap-1.5 bg-[#EFF8F7] p-1.5 rounded-full border border-[#2BA8A2]/25 flex-shrink-0 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setSkema("ACM")}
              className={`btn-flip7 text-xs px-3.5 py-1.5 ${
                skema === "ACM" ? "btn-teal shadow-sm" : "bg-transparent text-[#325854]"
              }`}
            >
              Skema ACM (Retail)
            </button>
            <button
              type="button"
              onClick={() => setSkema("SPG")}
              className={`btn-flip7 text-xs px-3.5 py-1.5 ${
                skema === "SPG" ? "btn-teal shadow-sm" : "bg-transparent text-[#325854]"
              }`}
            >
              Skema SPG (Paket)
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Form (7 cols), Right Results (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: Kendaraan & OTR */}
          <div className="flip7-card accent-bar-teal space-y-4">
            <div className="section-title">
              <div className="section-title-label">
                <span className="emoji-badge">🚘</span>
                <span>1. Data Kendaraan &amp; Harga OTR</span>
              </div>
              <button
                type="button"
                onClick={onOpenGlossary}
                className="text-xs font-bold text-[#1E8C86] hover:text-[#2BA8A2] flex items-center gap-1 bg-[#EFF8F7] px-3 py-1.5 rounded-full border border-[#2BA8A2]/20 shadow-sm transition"
              >
                <span>Cari di Database OTR</span>
                <span>→</span>
              </button>
            </div>

            {/* Vehicle search autocomplete */}
            <div className="relative">
              <label className="flip7-label">Model / Tipe Kendaraan:</label>
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVehicleName(e.target.value);
                  setIsDropdownOpen(true);
                }}
                placeholder="Ketik tipe mobil (contoh: Avanza, Innova, Brio, Xpander...)"
                className="flip7-input font-bold text-[#1A3835]"
              />

              {isDropdownOpen && searchResults.length > 0 && (
                <div className="flip7-dropdown">
                  {searchResults.map((car: string, i: number) => (
                    <div
                      key={i}
                      className="flip7-dropdown-item flex items-center justify-between"
                      onClick={() => {
                        setVehicleName(car);
                        setSearchQuery(car);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <span>{car}</span>
                      <span className="flip7-badge badge-teal">OTR</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Tahun */}
              <div>
                <label className="flip7-label">Tahun Pembuatan:</label>
                <select
                  value={tahun}
                  onChange={(e) => setTahun(Number(e.target.value))}
                  className="flip7-select"
                >
                  {Array.from({ length: 16 }, (_, i) => 2026 - i).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kategori Kendaraan */}
              <div>
                <label className="flip7-label">Jenis Kendaraan:</label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value as any)}
                  className="flip7-select"
                >
                  <option value="PASSANGER">Penumpang (Passenger)</option>
                  <option value="COMMERCIAL">Komersial (Pick-up/Box)</option>
                </select>
              </div>

              {/* Wilayah / Regional */}
              <div>
                <label className="flip7-label">Wilayah Plat:</label>
                <select
                  value={wilayah}
                  onChange={(e) => setWilayah(Number(e.target.value) as any)}
                  className="flip7-select"
                >
                  <option value={2}>Wilayah 2 (DKI, Jabar, Banten)</option>
                  <option value={1}>Wilayah 1 (Sumatera &amp; Kep)</option>
                  <option value={3}>Wilayah 3 (Jateng, Jatim, Bali)</option>
                </select>
              </div>
            </div>

            {/* OTR Input */}
            <div>
              <div className="flip7-label">
                <span>Harga On The Road (OTR):</span>
                <span className="text-[#1E8C86] font-extrabold text-sm">{formatRupiah(otr)}</span>
              </div>
              <input
                type="number"
                step="1000000"
                min="30000000"
                value={otr}
                onChange={(e) => setOtr(Number(e.target.value) || 0)}
                className="flip7-input text-lg font-extrabold text-[#1E8C86]"
              />
            </div>
          </div>

          {/* Section 2: Uang Muka (DP), Tenor & Tipe Angsuran */}
          <div className="flip7-card accent-bar-gold space-y-4">
            <div className="section-title">
              <div className="section-title-label">
                <span className="emoji-badge">📊</span>
                <span>2. Uang Muka (DP), Tenor &amp; Skema Angsuran</span>
              </div>
            </div>

            {/* DP NET Slider & Input */}
            <div>
              <div className="flip7-label">
                <span>Uang Muka (% DP Murni):</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#27AE60] font-extrabold">{formatRupiah(result.dpNet)}</span>
                  <div className="relative flex items-center w-20">
                    <input
                      type="number"
                      min="10"
                      max="80"
                      step="1"
                      value={dpPercent || ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? 0 : Number(e.target.value);
                        setDpPercent(val > 80 ? 80 : val);
                      }}
                      onBlur={() => {
                        if (!dpPercent || dpPercent < 10) setDpPercent(10);
                        if (dpPercent > 80) setDpPercent(80);
                      }}
                      className="w-full py-0.5 px-2 pr-6 text-right font-black text-xs text-[#996B00] bg-white border border-[#FFD23F] rounded-lg shadow-sm outline-none"
                    />
                    <span className="absolute right-2 font-bold text-xs text-[#996B00] pointer-events-none">%</span>
                  </div>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                step="1"
                value={dpPercent}
                onChange={(e) => setDpPercent(Number(e.target.value))}
                className="w-full h-2.5 rounded-full cursor-pointer accent-[#FFD23F]"
                style={{ backgroundColor: "#FFF4D0" }}
              />
              <div className="flex justify-between text-xs text-[#6B9590] mt-1 font-semibold">
                <span>10%</span>
                <span>20% (Standar)</span>
                <span>30%</span>
                <span>50%</span>
                <span>80%</span>
              </div>
            </div>

            {/* Jenis Angsuran (ADVANCE vs ARREAR) */}
            <div>
              <label className="flip7-label">
                <span>Jenis Pembayaran Angsuran:</span>
                <span className="text-xs text-[#6B9590] font-normal">
                  {angsuranType === "ADVANCE" ? "ADDM (Angsuran Pertama di Muka)" : "ADDB (Angsuran Pertama di Belakang)"}
                </span>
              </label>
              <div className="pill-group">
                <button
                  type="button"
                  onClick={() => setAngsuranType("ADVANCE")}
                  className={`pill-item ${angsuranType === "ADVANCE" ? "active" : ""}`}
                >
                  ADDM (In Advance)
                </button>
                <button
                  type="button"
                  onClick={() => setAngsuranType("ARREAR")}
                  className={`pill-item ${angsuranType === "ARREAR" ? "active" : ""}`}
                >
                  ADDB (In Arrear)
                </button>
              </div>
            </div>

            {/* Tenor Selection */}
            <div>
              <div className="flip7-label">
                <span>Jangka Waktu Pembiayaan (Tenor):</span>
                <span className="text-[#996B00] font-extrabold">
                  {tenorMonths / 12} Tahun ({tenorMonths} Bulan)
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {[12, 24, 36, 48, 60].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTenorMonths(t)}
                    className={`tenor-btn ${tenorMonths === t ? "active-gold" : ""}`}
                  >
                    <span className="tenor-short">{t / 12} Th</span>
                    <span className="tenor-long"> ({t} Bln)</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Pengaturan Asuransi, Admin & Provisi */}
          <div className="flip7-card accent-bar-sky space-y-4">
            <div className="section-title">
              <div className="section-title-label">
                <span className="emoji-badge">🛡️</span>
                <span>3. Asuransi Kendaraan, Administrasi &amp; Provisi</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Jenis Asuransi */}
              <div>
                <label className="flip7-label">Jenis Asuransi Kendaraan:</label>
                <select
                  value={asuransiType}
                  onChange={(e) => setAsuransiType(e.target.value as any)}
                  className="flip7-select"
                >
                  <option value="ALL_RISK">All Risk (Comprehensive)</option>
                  <option value="TLO">Total Loss Only (TLO)</option>
                  <option value="KOMBINASI">Kombinasi (Th-1 AR + TLO)</option>
                </select>
              </div>

              {/* Metode Bayar Asuransi */}
              <div>
                <label className="flip7-label">Pembayaran Asuransi:</label>
                <select
                  value={asuransiPayment}
                  onChange={(e) => setAsuransiPayment(e.target.value as any)}
                  className="flip7-select"
                >
                  <option value="CREDIT">Masuk Kredit (Pokok Hutang)</option>
                  <option value="CASH">Bayar Tunai di Muka (TDP)</option>
                </select>
              </div>
            </div>

            {/* Asuransi Perluasan Checkboxes */}
            <div>
              <label className="flip7-label mb-2">
                Perluasan Proteksi Asuransi (Opsional):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div
                  onClick={() => setAsuransiAman(!asuransiAman)}
                  className={`tactile-switch ${asuransiAman ? "active" : ""}`}
                >
                  <span className="text-xs font-bold text-[#1A3835]">Asuransi AMAN (Jiwa)</span>
                  <span className={`text-base ${asuransiAman ? "text-[#27AE60]" : "text-[#A8D8D4]"}`}>
                    {asuransiAman ? "✅" : "⚪"}
                  </span>
                </div>
                <div
                  onClick={() => setAsuransiEqvet(!asuransiEqvet)}
                  className={`tactile-switch ${asuransiEqvet ? "active" : ""}`}
                >
                  <span className="text-xs font-bold text-[#1A3835]">EQVET (Gempa/Banjir)</span>
                  <span className={`text-base ${asuransiEqvet ? "text-[#27AE60]" : "text-[#A8D8D4]"}`}>
                    {asuransiEqvet ? "✅" : "⚪"}
                  </span>
                </div>
                <div
                  onClick={() => setAsuransiTjh(!asuransiTjh)}
                  className={`tactile-switch ${asuransiTjh ? "active" : ""}`}
                >
                  <span className="text-xs font-bold text-[#1A3835]">TJH (Pihak Ke-3)</span>
                  <span className={`text-base ${asuransiTjh ? "text-[#27AE60]" : "text-[#A8D8D4]"}`}>
                    {asuransiTjh ? "✅" : "⚪"}
                  </span>
                </div>
              </div>
            </div>

            {/* Administrasi & Provisi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 bg-[#EFF8F7] rounded-2xl border border-[#2BA8A2]/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#325854] font-bold">Biaya Administrasi:</span>
                  <span className="text-[#1E8C86] font-extrabold">{formatRupiah(adminAmount)}</span>
                </div>
                <select
                  value={adminPayment}
                  onChange={(e) => setAdminPayment(e.target.value as any)}
                  className="flip7-select text-xs py-1.5"
                >
                  <option value="CREDIT">Masuk Kredit</option>
                  <option value="CASH">Bayar Cash di Muka</option>
                </select>
              </div>

              <div className="p-3.5 bg-[#EFF8F7] rounded-2xl border border-[#2BA8A2]/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#325854] font-bold">Biaya Provisi (%):</span>
                  <span className="text-[#1E8C86] font-extrabold">
                    {provisiPercent}% ({formatRupiah(result.biayaProvisi)})
                  </span>
                </div>
                <select
                  value={provisiPayment}
                  onChange={(e) => setProvisiPayment(e.target.value as any)}
                  className="flip7-select text-xs py-1.5"
                >
                  <option value="CREDIT">Masuk Kredit</option>
                  <option value="CASH">Bayar Cash di Muka</option>
                </select>
              </div>
            </div>

            {/* Suku Bunga Flat Rate Input (Nego Rate) */}
            <div className="p-3.5 bg-[#FFF8E7] rounded-2xl border border-[#FFD23F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-[#996B00] block">
                  🎯 Suku Bunga Flat Tahunan (Nego Rate):
                </span>
                <span className="text-xs text-[#6B9590]">
                  Dapat disesuaikan untuk rate persetujuan khusus
                </span>
              </div>
              <div className="flex items-center gap-1.5 w-full sm:w-40">
                <input
                  type="number"
                  step="0.05"
                  value={customRate ?? ""}
                  onChange={(e) => setCustomRate(parseFloat(e.target.value) || 0)}
                  className="flip7-input text-right font-extrabold text-[#996B00] py-1 border-[#FFD23F]"
                />
                <span className="text-[#996B00] font-bold">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sticky Calculation Summary */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          <div className="flip7-hero-card space-y-4">
            <div className="flex items-center justify-between border-b border-[#FFD23F]/40 pb-3">
              <span className="flip7-badge badge-gold">✨ Hasil Hitungan Resmi</span>
              <span className="text-xs font-bold text-[#6B9590]">
                {angsuranType === "ADVANCE" ? "ADDM" : "ADDB"} • {skema}
              </span>
            </div>

            {/* Big Installment Figure */}
            <div className="p-4 bg-white rounded-2xl border-2 border-[#2BA8A2]/30 shadow-card space-y-1">
              <span className="text-xs font-extrabold text-[#6B9590] uppercase tracking-wide block">
                Angsuran per Bulan
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#1E8C86] tracking-tight">
                  {formatRupiah(result.angsuranBulanan)}
                </span>
                <span className="text-xs text-[#6B9590] font-bold">/ bln</span>
              </div>
              <p className="text-xs text-[#6B9590] font-medium pt-1">
                Bunga: <span className="text-[#1A3835] font-bold">{result.flatRateAnnual}% p.a.</span> | Tenor:{" "}
                <span className="text-[#1A3835] font-bold">{result.tenorMonths} Bulan</span>
              </p>
            </div>

            {/* Total Down Payment (TDP) */}
            <div
              className="p-4 rounded-2xl border border-[#FFD23F] space-y-1 shadow-sm"
              style={{ background: "linear-gradient(135deg, #FFF4D0 0%, #FFE47A 100%)" }}
            >
              <span className="text-xs font-extrabold text-[#996B00] uppercase tracking-wide block">
                Total Pembayaran Pertama (TDP)
              </span>
              <div className="text-2xl font-black text-[#8A6000]">
                {formatRupiah(result.totalDownPayment)}
              </div>
              <p className="text-[11px] text-[#996B00] font-medium">
                {angsuranType === "ADVANCE"
                  ? "*Termasuk: Uang Muka (DP) + Angsuran ke-1 + Biaya Cash"
                  : "*Uang Muka (DP) + Biaya Cash (Angsuran dibayar bulan ke-1)"}
              </p>
            </div>

            {/* Summary Breakdown List */}
            <div className="text-xs space-y-2 pt-1 border-t border-[#FFD23F]/30 text-[#325854]">
              <div className="flex justify-between py-1 border-b border-[#EFF8F7]">
                <span className="text-[#6B9590]">Harga OTR Kendaraan:</span>
                <span className="font-bold text-[#1A3835]">{formatRupiah(result.otr)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EFF8F7]">
                <span className="text-[#6B9590]">DP Murni ({result.dpPercent}%):</span>
                <span className="font-bold text-[#1A3835]">{formatRupiah(result.dpNet)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EFF8F7]">
                <span className="text-[#6B9590]">Total Pokok Hutang (PH):</span>
                <span className="font-bold text-[#2BA8A2]">{formatRupiah(result.totalPokokHutang)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EFF8F7]">
                <span className="text-[#6B9590]">Total Bunga ({result.tenorYears} Tahun):</span>
                <span className="font-bold text-[#EF6C4A]">{formatRupiah(result.totalBunga)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EFF8F7]">
                <span className="text-[#6B9590]">Premi Asuransi:</span>
                <span className="font-bold text-[#1A3835]">
                  {formatRupiah(result.totalAsuransi)} ({result.asuransiPayment})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EFF8F7]">
                <span className="text-[#6B9590]">Biaya Administrasi:</span>
                <span className="font-bold text-[#1A3835]">
                  {formatRupiah(result.biayaAdmin)} ({result.adminPayment})
                </span>
              </div>
            </div>

            {/* Action Tools Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsRoundingOpen(true)}
                className="btn-flip7 btn-gold text-xs py-2.5 w-full"
              >
                <span>🔢</span>
                <span>Bulatkan Nilai</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRefundOpen(true)}
                className="btn-flip7 btn-coral text-xs py-2.5 w-full"
              >
                <span>💰</span>
                <span>Hitung Refund</span>
              </button>
            </div>

            {/* Structure Modal Button */}
            <button
              type="button"
              onClick={() => setIsStructureOpen(true)}
              className="btn-flip7 btn-sky text-xs py-2.5 w-full"
            >
              <span>📋</span>
              <span>Lihat Struktur Kredit &amp; Amortisasi</span>
            </button>

            {/* Sharing Bar */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#FFD23F]/30">
              <button
                type="button"
                onClick={handleCopy}
                className="btn-flip7 btn-outline text-xs py-2.5"
              >
                <span>{copied ? "✅" : "📋"}</span>
                <span>{copied ? "Tersalin!" : "Salin Rincian"}</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="btn-flip7 btn-whatsapp text-xs py-2.5"
              >
                <span>💬</span>
                <span>Kirim WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RoundingModal
        isOpen={isRoundingOpen}
        onClose={() => setIsRoundingOpen(false)}
        currentAngsuran={result.angsuranBulanan}
        tenorMonths={result.tenorMonths}
        currentDp={result.dpNet}
        onApplyRounding={(targetAngsuran, newDp) => {
          const newDpPercent = Math.min(80, Math.max(10, Math.round((newDp / otr) * 100)));
          setDpPercent(newDpPercent);
        }}
      />

      <RefundModal
        isOpen={isRefundOpen}
        onClose={() => setIsRefundOpen(false)}
        vehicleType={vehicleName}
        tahun={tahun}
        pokokHutang={result.totalPokokHutang}
        tenorMonths={result.tenorMonths}
        rateNormal={result.flatRateAnnual}
        totalAsuransi={result.totalAsuransi}
      />

      <CreditStructureModal
        isOpen={isStructureOpen}
        onClose={() => setIsStructureOpen(false)}
        result={result}
        vehicleName={vehicleName}
      />
    </div>
  );
}
