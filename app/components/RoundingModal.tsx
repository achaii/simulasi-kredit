"use client";

import React, { useState } from "react";
import { formatRupiah, calculateRounding } from "../utils/calculator";

interface RoundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAngsuran: number;
  tenorMonths: number;
  currentDp: number;
  onApplyRounding: (roundedAngsuran: number, newDp: number) => void;
}

export default function RoundingModal({
  isOpen,
  onClose,
  currentAngsuran,
  tenorMonths,
  currentDp,
  onApplyRounding,
}: RoundingModalProps) {
  if (!isOpen) return null;

  const defaultTarget = Math.round(currentAngsuran / 50000) * 50000;
  const [targetInput, setTargetInput] = useState<number>(defaultTarget);

  const calc = calculateRounding(currentAngsuran, targetInput, tenorMonths, currentDp);

  const handleApply = () => {
    onApplyRounding(targetInput, calc.dpBaru);
    onClose();
  };

  const handleQuickPreset = (roundType: "up100k" | "down100k" | "nearest50k") => {
    if (roundType === "up100k") {
      setTargetInput(Math.ceil(currentAngsuran / 100000) * 100000);
    } else if (roundType === "down100k") {
      setTargetInput(Math.floor(currentAngsuran / 100000) * 100000);
    } else {
      setTargetInput(Math.round(currentAngsuran / 50000) * 50000);
    }
  };

  return (
    <div className="flip7-modal-overlay">
      <div className="flip7-modal-content space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2BA8A2]/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF4D0] border border-[#FFD23F] flex items-center justify-center text-xl shadow-sm">
              🔢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-[#1A3835]">
                  Pembulatan Nilai Angsuran
                </h3>
                <span className="flip7-badge badge-gold">p$Bulatkan</span>
              </div>
              <p className="text-xs text-[#6B9590] mt-0.5">
                Penyesuaian angka angsuran rapi &amp; kompensasi dana ke Uang Muka (DP)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#EFF8F7] hover:bg-[#FEE8E2] text-[#6B9590] hover:text-[#EF6C4A] font-bold flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="py-2 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#EFF8F7] border border-[#2BA8A2]/20">
              <span className="text-xs text-[#6B9590] font-bold block">Angsuran Awal:</span>
              <p className="text-lg font-extrabold text-[#1E8C86] mt-0.5">
                {formatRupiah(currentAngsuran)}
              </p>
              <span className="text-[11px] text-[#6B9590]">Kalkulasi Murni Sistem</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#EFF8F7] border border-[#2BA8A2]/20">
              <span className="text-xs text-[#6B9590] font-bold block">Tenor Pembiayaan:</span>
              <p className="text-lg font-extrabold text-[#1A3835] mt-0.5">
                {tenorMonths} Bulan
              </p>
              <span className="text-[11px] text-[#6B9590]">{tenorMonths / 12} Tahun</span>
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <label className="flip7-label mb-2">
              Pilihan Cepat Pembulatan:
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickPreset("nearest50k")}
                className="btn-flip7 btn-outline text-xs py-1.5 px-3"
              >
                ± Kelipatan 50rb
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset("down100k")}
                className="btn-flip7 btn-outline text-xs py-1.5 px-3"
              >
                ⬇️ Bulat ke Bawah (100rb)
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset("up100k")}
                className="btn-flip7 btn-outline text-xs py-1.5 px-3"
              >
                ⬆️ Bulat ke Atas (100rb)
              </button>
            </div>
          </div>

          {/* Target Angsuran Input */}
          <div>
            <label className="flip7-label">
              <span>Target Angsuran Bulat (Rp):</span>
              <span className="text-xs text-[#1E8C86] font-bold">Ketik nominal bebas</span>
            </label>
            <input
              type="number"
              step="10000"
              value={targetInput}
              onChange={(e) => setTargetInput(Number(e.target.value) || 0)}
              className="flip7-input text-lg font-extrabold text-[#1E8C86]"
            />
          </div>

          {/* Result Calculation Preview */}
          <div className="p-4 rounded-2xl bg-[#FFF8E7] border-2 border-[#FFD23F] space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#6B9590]">Selisih Angsuran per Bulan:</span>
              <span
                className={`font-extrabold ${
                  calc.diffPerBulan >= 0 ? "text-[#27AE60]" : "text-[#EF6C4A]"
                }`}
              >
                {calc.diffPerBulan >= 0 ? "+" : ""}
                {formatRupiah(calc.diffPerBulan)} / bln
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#6B9590]">Akumulasi Selisih ({tenorMonths} bulan):</span>
              <span className="font-extrabold text-[#1A3835]">
                {calc.totalSelisih >= 0 ? "+" : ""}
                {formatRupiah(calc.totalSelisih)}
              </span>
            </div>
            <div className="border-t border-[#FFD23F]/40 pt-2 flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#996B00]">Estimasi DP Baru (Net):</span>
              <span className="font-black text-[#996B00] text-lg">
                {formatRupiah(calc.dpBaru)}
              </span>
            </div>
            <p className="text-[11px] text-[#996B00] font-medium pt-1">
              *Jika angsuran dibulatkan naik, nasabah mendapat kelebihan dana / DP berkurang sebesar{" "}
              <strong>{formatRupiah(Math.abs(calc.totalSelisih))}</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#2BA8A2]/15">
          <button
            type="button"
            onClick={onClose}
            className="btn-flip7 btn-outline text-xs"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="btn-flip7 btn-gold text-xs"
          >
            <span>✅</span>
            <span>Terapkan Pembulatan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
