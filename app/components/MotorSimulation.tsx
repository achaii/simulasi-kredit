"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  MotorLoanParams,
  LoanResult,
  calculateMotorLoan,
  formatRupiah,
  generateShareText,
} from "../utils/calculator";
import RoundingModal from "./RoundingModal";
import RefundModal from "./RefundModal";
import CreditStructureModal from "./CreditStructureModal";
import vehicleData from "../data/vehicleData.json";

interface MotorSimulationProps {
  initialMotor?: string;
  onOpenGlossary: () => void;
}

export default function MotorSimulation({ initialMotor, onOpenGlossary }: MotorSimulationProps) {
  const [motorName, setMotorName] = useState<string>(initialMotor || "VARIO 160 CBS");
  const [searchQuery, setSearchQuery] = useState<string>(initialMotor || "VARIO 160 CBS");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const [regional, setRegional] = useState<string>("JABAR 1");
  const [otr, setOtr] = useState<number>(27500000);
  const [dpAmount, setDpAmount] = useState<number>(3500000);
  const [tenorMonths, setTenorMonths] = useState<number>(35); // 11, 17, 23, 29, 35
  const [asuransiType, setAsuransiType] = useState<"TLO" | "ALL_RISK">("TLO");
  const [adminAmount, setAdminAmount] = useState<number>(850000);
  const [flatRateAnnual, setFlatRateAnnual] = useState<number>(16.5);

  // Modals
  const [isRoundingOpen, setIsRoundingOpen] = useState(false);
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [isStructureOpen, setIsStructureOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialMotor) {
      setMotorName(initialMotor);
      setSearchQuery(initialMotor);
    }
  }, [initialMotor]);

  // Autocomplete motor options
  const searchResults = useMemo(() => {
    if (!searchQuery) return vehicleData.motors.slice(0, 15);
    const q = searchQuery.toLowerCase();
    return vehicleData.motors.filter((m: string) => m.toLowerCase().includes(q)).slice(0, 20);
  }, [searchQuery]);

  // Adjust rate based on tenor
  useEffect(() => {
    if (tenorMonths <= 12) setFlatRateAnnual(14.5);
    else if (tenorMonths <= 24) setFlatRateAnnual(16.5);
    else setFlatRateAnnual(18.5);
  }, [tenorMonths]);

  const result: LoanResult = useMemo(() => {
    return calculateMotorLoan({
      otr,
      dpAmount,
      tenorMonths,
      regional,
      adminAmount,
      asuransiType,
      flatRateAnnual,
    });
  }, [otr, dpAmount, tenorMonths, regional, adminAmount, asuransiType, flatRateAnnual]);

  const handleCopy = () => {
    const text = generateShareText(motorName, 2024, result);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = generateShareText(motorName, 2024, result);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div
        className="flip7-card accent-bar-teal"
        style={{ background: "linear-gradient(135deg, #FFFFFF 0%, #EFF8F7 50%, #E8F6F5 100%)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#2BA8A2]/25 flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
              🏍️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-extrabold text-[#1A3835]">
                  Simulasi Kredit Motor (MCY)
                </h1>
                <span className="flip7-badge badge-teal">Motor Baru &amp; Bekas</span>
              </div>
              <p className="text-xs text-[#6B9590] mt-0.5 font-medium">
                Simulasi kredit motor resmi dengan opsi tenor fleksibel (11, 17, 23, 29, 35 bulan) &amp; proses kilat
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
            <span className="text-xs font-bold text-[#6B9590]">Wilayah:</span>
            <span className="flip7-badge badge-gold font-bold">{regional}</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: Kendaraan & OTR */}
          <div className="flip7-card accent-bar-teal space-y-4">
            <div className="section-title">
              <div className="section-title-label">
                <span className="emoji-badge">🛵</span>
                <span>1. Tipe Sepeda Motor &amp; Harga OTR</span>
              </div>
              <button
                type="button"
                onClick={onOpenGlossary}
                className="text-xs font-bold text-[#1E8C86] hover:text-[#2BA8A2] flex items-center gap-1 bg-[#EFF8F7] px-3 py-1.5 rounded-full border border-[#2BA8A2]/20 shadow-sm transition"
              >
                <span>Cari di Database</span>
                <span>→</span>
              </button>
            </div>

            {/* Motorcycle search */}
            <div className="relative">
              <label className="flip7-label">Model / Tipe Motor:</label>
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setMotorName(e.target.value);
                  setIsDropdownOpen(true);
                }}
                placeholder="Ketik tipe motor (contoh: Vario 160, NMAX, Beat, Aerox, Scoopy...)"
                className="flip7-input font-bold text-[#1A3835]"
              />

              {isDropdownOpen && searchResults.length > 0 && (
                <div className="flip7-dropdown">
                  {searchResults.map((m: string, i: number) => (
                    <div
                      key={i}
                      className="flip7-dropdown-item flex items-center justify-between"
                      onClick={() => {
                        setMotorName(m);
                        setSearchQuery(m);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <span>{m}</span>
                      <span className="flip7-badge badge-teal">MCY</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Regional */}
              <div>
                <label className="flip7-label">Wilayah Regional Motor:</label>
                <select
                  value={regional}
                  onChange={(e) => setRegional(e.target.value)}
                  className="flip7-select"
                >
                  <option value="JABAR 1">JABAR 1 (Bandung &amp; Sekitarnya)</option>
                  <option value="JABAR 2">JABAR 2 (Bekasi, Karawang, Bogor)</option>
                  <option value="DKI JAKARTA">DKI JAKARTA &amp; TANGERANG</option>
                  <option value="JATENG & DIY">JAWA TENGAH &amp; DIY</option>
                  <option value="JATIM & BALI">JAWA TIMUR &amp; BALI</option>
                  <option value="SUMATERA">SUMATERA</option>
                </select>
              </div>

              {/* OTR Motor */}
              <div>
                <div className="flip7-label">
                  <span>Harga On The Road (OTR):</span>
                  <span className="text-[#1E8C86] font-extrabold text-xs">{formatRupiah(otr)}</span>
                </div>
                <input
                  type="number"
                  step="500000"
                  min="10000000"
                  value={otr}
                  onChange={(e) => setOtr(Number(e.target.value) || 0)}
                  className="flip7-input font-extrabold text-[#1E8C86]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Uang Muka (DP) & Tenor Khusus Motor */}
          <div className="flip7-card accent-bar-gold space-y-4">
            <div className="section-title">
              <div className="section-title-label">
                <span className="emoji-badge">💰</span>
                <span>2. Uang Muka (DP) &amp; Tenor Pembiayaan</span>
              </div>
            </div>

            {/* DP Amount Input */}
            <div>
              <div className="flip7-label">
                <span>Uang Muka (DP Rupiah):</span>
                <span className="flip7-badge badge-gold">
                  {Math.round((dpAmount / otr) * 100)}% dari OTR
                </span>
              </div>
              <input
                type="number"
                step="500000"
                min="1000000"
                max={otr - 1000000}
                value={dpAmount}
                onChange={(e) => setDpAmount(Number(e.target.value) || 0)}
                className="flip7-input text-base font-extrabold text-[#27AE60]"
              />
              <div className="flex gap-1.5 sm:gap-2 mt-2 flex-wrap">
                {[10, 15, 20, 25, 30].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDpAmount(Math.round((otr * pct) / 100))}
                    className="text-xs px-2.5 py-1 rounded-full bg-[#FFF4D0] hover:bg-[#FFE47A] text-[#996B00] font-bold border border-[#FFD23F]/50 transition"
                  >
                    {pct}% ({formatRupiah(Math.round((otr * pct) / 100))})
                  </button>
                ))}
              </div>
            </div>

            {/* Tenor Selection (Special Motor Tenors) */}
            <div className="space-y-2.5">
              <div className="flip7-label">
                <span>Pilihan Tenor Khusus Motor:</span>
                <span className="text-[#996B00] font-extrabold">{tenorMonths} Bulan</span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-[#6B9590] block mb-1">
                  Tenor Reguler Motor (Bulan):
                </span>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {[11, 17, 23, 29, 35].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTenorMonths(t)}
                      className={`tenor-btn ${tenorMonths === t ? "active-gold" : ""}`}
                    >
                      {t} Bln
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-[#6B9590] block mb-1">
                  Tenor Tahunan (1 - 3 Tahun):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[12, 24, 36].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTenorMonths(t)}
                      className={`tenor-btn ${tenorMonths === t ? "active-teal" : ""}`}
                    >
                      {t} Bln ({t / 12} Th)
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Asuransi & Admin Fee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="flip7-label">Proteksi Asuransi:</label>
                <select
                  value={asuransiType}
                  onChange={(e) => setAsuransiType(e.target.value as any)}
                  className="flip7-select"
                >
                  <option value="TLO">Total Loss Only (TLO)</option>
                  <option value="ALL_RISK">All Risk (Komprehensif)</option>
                </select>
              </div>

              <div>
                <div className="flip7-label">
                  <span>Biaya Administrasi:</span>
                  <span className="text-[#1E8C86] font-bold">{formatRupiah(adminAmount)}</span>
                </div>
                <input
                  type="number"
                  step="50000"
                  value={adminAmount}
                  onChange={(e) => setAdminAmount(Number(e.target.value) || 0)}
                  className="flip7-input font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sticky Calculation Summary */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          <div className="flip7-hero-card space-y-4">
            <div className="flex items-center justify-between border-b border-[#FFD23F]/40 pb-3">
              <span className="flip7-badge badge-gold">✨ Hasil Hitungan Motor</span>
              <span className="text-xs font-bold text-[#6B9590]">{motorName}</span>
            </div>

            {/* Angsuran Bulanan */}
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

            {/* Total Pembayaran Pertama (TDP) */}
            <div
              className="p-4 rounded-2xl border border-[#FFD23F] space-y-1 shadow-sm"
              style={{ background: "linear-gradient(135deg, #FFF4D0 0%, #FFE47A 100%)" }}
            >
              <span className="text-xs font-extrabold text-[#996B00] uppercase tracking-wide block">
                Total Uang Muka Pertama (TDP)
              </span>
              <div className="text-2xl font-black text-[#8A6000]">
                {formatRupiah(result.totalDownPayment)}
              </div>
              <p className="text-[11px] text-[#996B00] font-medium">
                *Termasuk DP Murni ({formatRupiah(dpAmount)}) + Biaya Administrasi
              </p>
            </div>

            {/* Summary Breakdown */}
            <div className="text-xs space-y-2 pt-1 border-t border-[#FFD23F]/30 text-[#325854]">
              <div className="flex justify-between py-1 border-b border-[#EFF8F7]">
                <span className="text-[#6B9590]">Harga OTR Motor:</span>
                <span className="font-bold text-[#1A3835]">{formatRupiah(result.otr)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EFF8F7]">
                <span className="text-[#6B9590]">Uang Muka (DP):</span>
                <span className="font-bold text-[#1A3835]">{formatRupiah(dpAmount)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EFF8F7]">
                <span className="text-[#6B9590]">Total Pokok Hutang (PH):</span>
                <span className="font-bold text-[#2BA8A2]">{formatRupiah(result.totalPokokHutang)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EFF8F7]">
                <span className="text-[#6B9590]">Total Bunga:</span>
                <span className="font-bold text-[#EF6C4A]">{formatRupiah(result.totalBunga)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EFF8F7]">
                <span className="text-[#6B9590]">Premi Asuransi:</span>
                <span className="font-bold text-[#1A3835]">{formatRupiah(result.totalAsuransi)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EFF8F7]">
                <span className="text-[#6B9590]">Biaya Administrasi:</span>
                <span className="font-bold text-[#1A3835]">{formatRupiah(result.biayaAdmin)}</span>
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
        currentDp={dpAmount}
        onApplyRounding={(targetAngsuran, newDp) => {
          setDpAmount(Math.max(1000000, newDp));
        }}
      />

      <RefundModal
        isOpen={isRefundOpen}
        onClose={() => setIsRefundOpen(false)}
        vehicleType={motorName}
        tahun={2024}
        pokokHutang={result.totalPokokHutang}
        tenorMonths={result.tenorMonths}
        rateNormal={result.flatRateAnnual}
        totalAsuransi={result.totalAsuransi}
      />

      <CreditStructureModal
        isOpen={isStructureOpen}
        onClose={() => setIsStructureOpen(false)}
        result={result}
        vehicleName={motorName}
      />
    </div>
  );
}
