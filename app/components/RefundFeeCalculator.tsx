"use client";

import React, { useState } from "react";
import { formatRupiah, calculateRefund, generateRefundShareText } from "../utils/calculator";

export default function RefundFeeCalculator() {
  const [vehicleType, setVehicleType] = useState<string>("INNOVA ZENIX 2.0 G CVT");
  const [tahun, setTahun] = useState<number>(2024);
  const [pokokHutang, setPokokHutang] = useState<number>(350000000);
  const [tenorMonths, setTenorMonths] = useState<number>(36);
  const [rateNormal, setRateNormal] = useState<number>(6.5);
  const [rateUp, setRateUp] = useState<number>(8.0);
  const [totalAsuransi, setTotalAsuransi] = useState<number>(18500000);
  const [copied, setCopied] = useState<boolean>(false);

  const refund = calculateRefund(pokokHutang, tenorMonths, rateNormal, rateUp, totalAsuransi);

  const handleCopy = () => {
    const text = generateRefundShareText(vehicleType, tahun, refund);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = generateRefundShareText(vehicleType, tahun, refund);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flip7-card accent-bar-coral bg-gradient-to-r from-white via-[#EFF8F7] to-[#FEE8E2]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FEE8E2] border-2 border-[#EF6C4A]/30 flex items-center justify-center text-2xl shadow-sm">
              💰
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-extrabold text-[#1A3835]">
                  Kalkulator Refund &amp; Fee Agen
                </h1>
                <span className="flip7-badge badge-coral">Komisi Marketing</span>
              </div>
              <p className="text-xs text-[#6B9590] mt-0.5 font-medium">
                Hitung estimasi pencairan refund suku bunga (Rate Up x Tenor), refund asuransi, dan bonus lending rate (LR)
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-[#6B9590] block">Total Refund Diperoleh:</span>
            <span className="text-2xl font-black text-[#27AE60]">
              {formatRupiah(refund.totalRefund)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs */}
        <div className="lg:col-span-7 space-y-4 flip7-card accent-bar-coral">
          <div className="section-title">
            <div className="section-title-label">
              <span className="emoji-badge">📈</span>
              <span>Parameter Pembiayaan &amp; Rate Bunga</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flip7-label">Nama Kendaraan:</label>
              <input
                type="text"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="flip7-input font-bold"
              />
            </div>
            <div>
              <label className="flip7-label">Tahun Kendaraan:</label>
              <input
                type="number"
                value={tahun}
                onChange={(e) => setTahun(Number(e.target.value) || 2024)}
                className="flip7-input font-bold"
              />
            </div>
          </div>

          <div>
            <div className="flip7-label">
              <span>Pokok Hutang Pembiayaan (PH):</span>
              <span className="text-[#1E8C86] font-extrabold">{formatRupiah(pokokHutang)}</span>
            </div>
            <input
              type="number"
              step="5000000"
              value={pokokHutang}
              onChange={(e) => setPokokHutang(Number(e.target.value) || 0)}
              className="flip7-input text-lg font-extrabold text-[#1E8C86]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="flip7-label">Tenor (Bulan):</label>
              <select
                value={tenorMonths}
                onChange={(e) => setTenorMonths(Number(e.target.value))}
                className="flip7-select"
              >
                {[12, 24, 36, 48, 60].map((t) => (
                  <option key={t} value={t}>
                    {t} Bulan ({t / 12} Th)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flip7-label">Rate Normal Standar (%):</label>
              <input
                type="number"
                step="0.1"
                value={rateNormal}
                onChange={(e) => setRateNormal(parseFloat(e.target.value) || 0)}
                className="flip7-input font-black text-[#2BA8A2]"
              />
            </div>

            <div>
              <label className="flip7-label">Rate Up Nego (%):</label>
              <input
                type="number"
                step="0.1"
                value={rateUp}
                onChange={(e) => setRateUp(parseFloat(e.target.value) || 0)}
                className="flip7-input font-black text-[#EF6C4A]"
              />
            </div>
          </div>

          <div>
            <div className="flip7-label">
              <span>Total Premi Asuransi (Rp):</span>
              <span className="text-[#325854] font-bold">{formatRupiah(totalAsuransi)}</span>
            </div>
            <input
              type="number"
              step="500000"
              value={totalAsuransi}
              onChange={(e) => setTotalAsuransi(Number(e.target.value) || 0)}
              className="flip7-input"
            />
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flip7-hero-card space-y-4">
            <div className="flex items-center justify-between border-b border-[#FFD23F]/40 pb-3">
              <span className="flip7-badge badge-gold">✨ Rincian Perhitungan Refund</span>
              <span className="flip7-badge badge-coral">
                +{(rateUp - rateNormal).toFixed(2)}% Selisih
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border-2 border-[#2BA8A2]/30 shadow-card space-y-1">
              <span className="text-xs font-extrabold text-[#6B9590] uppercase tracking-wide block">
                Total Komisi Agen (Refund)
              </span>
              <div className="text-3xl md:text-4xl font-black text-[#27AE60]">
                {formatRupiah(refund.totalRefund)}
              </div>
              <p className="text-xs text-[#6B9590] font-medium pt-1">
                Selisih Rate: +{(rateUp - rateNormal).toFixed(2)}% | Tenor: {tenorMonths / 12} Tahun
              </p>
            </div>

            <div className="text-xs space-y-2 pt-1 border-t border-[#FFD23F]/30 text-[#325854]">
              <div className="flex justify-between py-1 border-b border-[#EFF8F7]">
                <span className="text-[#6B9590]">Refund Bunga (Rate Up x Tenor):</span>
                <span className="font-bold text-[#1A3835]">{formatRupiah(refund.refundBunga)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EFF8F7]">
                <span className="text-[#6B9590]">Refund Premi Asuransi (15%):</span>
                <span className="font-bold text-[#1A3835]">{formatRupiah(refund.refundAsuransi)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EFF8F7]">
                <span className="text-[#6B9590]">Bonus Lending Rate (LR):</span>
                <span className="font-bold text-[#27AE60]">
                  +{formatRupiah(refund.refundLendingRate)}
                </span>
              </div>
            </div>

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
    </div>
  );
}
