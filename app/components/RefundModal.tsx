"use client";

import React, { useState } from "react";
import {
  formatRupiah,
  calculateRefund,
  generateRefundShareText,
} from "../utils/calculator";

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleType: string;
  tahun: number;
  pokokHutang: number;
  tenorMonths: number;
  rateNormal: number;
  totalAsuransi: number;
}

export default function RefundModal({
  isOpen,
  onClose,
  vehicleType,
  tahun,
  pokokHutang,
  tenorMonths,
  rateNormal,
  totalAsuransi,
}: RefundModalProps) {
  if (!isOpen) return null;

  const [rateUp, setRateUp] = useState<number>(Number((rateNormal + 1.5).toFixed(2)));
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
    <div className="flip7-modal-overlay">
      <div className="flip7-modal-content space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2BA8A2]/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FEE8E2] border border-[#EF6C4A] flex items-center justify-center text-xl shadow-sm">
              💰
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-[#1A3835]">
                  Simulasi Refund &amp; Fee Agen
                </h3>
                <span className="flip7-badge badge-coral">p$HitungRifund</span>
              </div>
              <p className="text-xs text-[#6B9590] mt-0.5">
                Perhitungan komisi marketing / dealer berdasarkan selisih bunga, asuransi, dan lending rate
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

        {/* Content */}
        <div className="py-2 space-y-4">
          <div className="p-3.5 rounded-2xl bg-[#EFF8F7] border border-[#2BA8A2]/20 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#6B9590] font-bold block">Kendaraan:</span>
              <p className="text-sm font-extrabold text-[#1A3835]">
                {vehicleType} ({tahun})
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#6B9590] font-bold block">Pokok Hutang:</span>
              <p className="text-sm font-extrabold text-[#1E8C86]">
                {formatRupiah(pokokHutang)}
              </p>
            </div>
          </div>

          {/* Rate Settings */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#EFF8F7] border border-[#2BA8A2]/20">
              <span className="text-xs text-[#6B9590] font-bold block mb-1">Rate Normal (Dasar):</span>
              <p className="text-xl font-black text-[#2BA8A2]">{rateNormal}%</p>
              <span className="text-[11px] text-[#6B9590]">Suku Bunga Dasar Standar</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFF4D0] border border-[#FFD23F]">
              <label className="text-xs font-bold text-[#996B00] flex items-center justify-between mb-1">
                <span>Rate Up (Jual):</span>
                <span className="flip7-badge badge-gold">
                  +{(rateUp - rateNormal).toFixed(2)}%
                </span>
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  min={rateNormal}
                  max={rateNormal + 5}
                  value={rateUp}
                  onChange={(e) => setRateUp(parseFloat(e.target.value) || rateNormal)}
                  className="flip7-input text-lg font-black text-[#996B00] py-1 border-[#FFD23F]"
                />
                <span className="text-[#996B00] font-bold">%</span>
              </div>
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="p-4 rounded-2xl bg-[#FFF8E7] border-2 border-[#FFD23F] space-y-2.5 shadow-sm text-xs">
            <div className="flex items-center justify-between border-b border-[#FFD23F]/30 pb-2">
              <span className="text-[#6B9590]">Refund Suku Bunga (Rate Up x Tenor):</span>
              <span className="font-extrabold text-[#1A3835]">
                {formatRupiah(refund.refundBunga)}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-[#FFD23F]/30 pb-2">
              <span className="text-[#6B9590]">Refund Premi Asuransi Kendaraan:</span>
              <span className="font-extrabold text-[#1A3835]">
                {formatRupiah(refund.refundAsuransi)}
              </span>
            </div>
            {refund.refundLendingRate > 0 && (
              <div className="flex items-center justify-between border-b border-[#FFD23F]/30 pb-2">
                <span className="text-[#6B9590]">Refund Lending Rate (Bonus LR):</span>
                <span className="font-extrabold text-[#27AE60]">
                  +{formatRupiah(refund.refundLendingRate)}
                </span>
              </div>
            )}
            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-[#996B00] block">
                  🎉 TOTAL REFUND / KOMISI:
                </span>
                <span className="text-[11px] text-[#6B9590]">
                  Estimasi fee bersih cair ke agen/dealer
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-[#27AE60]">
                  {formatRupiah(refund.totalRefund)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#2BA8A2]/15">
          <button
            type="button"
            onClick={handleCopy}
            className="btn-flip7 btn-outline text-xs"
          >
            <span>{copied ? "✅" : "📋"}</span>
            <span>{copied ? "Tersalin!" : "Salin Rincian"}</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="btn-flip7 btn-whatsapp text-xs"
            >
              <span>💬</span>
              <span>Kirim WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
