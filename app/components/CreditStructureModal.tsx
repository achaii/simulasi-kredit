"use client";

import React, { useState } from "react";
import { LoanResult, formatRupiah } from "../utils/calculator";

interface CreditStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: LoanResult;
  vehicleName: string;
}

export default function CreditStructureModal({
  isOpen,
  onClose,
  result,
  vehicleName,
}: CreditStructureModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<"structure" | "schedule">("structure");

  return (
    <div className="flip7-modal-overlay">
      <div className="flip7-modal-content max-w-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2BA8A2]/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F4FC] border border-[#5DADE2] flex items-center justify-center text-xl shadow-sm">
              📋
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-[#1A3835]">
                  Struktur Kredit Pembiayaan
                </h3>
                <span className="flip7-badge badge-sky">Struktur Kredit</span>
              </div>
              <p className="text-xs text-[#6B9590] mt-0.5 font-medium">
                {vehicleName} • Tenor {result.tenorMonths} Bulan ({result.tenorYears} Tahun)
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

        {/* Tab switch */}
        <div className="pill-group">
          <button
            type="button"
            onClick={() => setActiveTab("structure")}
            className={`pill-item ${activeTab === "structure" ? "active" : ""}`}
          >
            Rincian Komponen Pembiayaan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("schedule")}
            className={`pill-item ${activeTab === "schedule" ? "active" : ""}`}
          >
            Jadwal Amortisasi ({result.tenorMonths} Bulan)
          </button>
        </div>

        {/* Content */}
        <div className="py-2">
          {activeTab === "structure" ? (
            <div className="space-y-3">
              {/* Item rows */}
              <div className="border border-[#2BA8A2]/20 rounded-2xl overflow-hidden text-xs bg-white shadow-sm">
                <div className="flex justify-between p-3.5 bg-[#FFF8E7] border-b border-[#FFD23F]/30 font-extrabold text-[#1A3835]">
                  <span>Harga On The Road (OTR):</span>
                  <span className="text-[#1E8C86] text-sm">{formatRupiah(result.otr)}</span>
                </div>
                <div className="flex justify-between p-3 border-b border-[#EFF8F7]">
                  <span className="text-[#6B9590]">Uang Muka Net ({result.dpPercent}%):</span>
                  <span className="font-bold text-[#1A3835]">{formatRupiah(result.dpNet)}</span>
                </div>
                <div className="flex justify-between p-3 border-b border-[#EFF8F7]">
                  <span className="text-[#6B9590]">Pokok Hutang Murni (OTR - DP):</span>
                  <span className="font-bold text-[#1A3835]">{formatRupiah(result.pokokHutangMurni)}</span>
                </div>
                <div className="flex justify-between p-3 border-b border-[#EFF8F7]">
                  <span className="text-[#6B9590]">
                    Premi Asuransi Kendaraan ({result.asuransiPayment}):
                  </span>
                  <span className="font-bold text-[#1A3835]">
                    {formatRupiah(result.totalAsuransi)}
                  </span>
                </div>
                <div className="flex justify-between p-3 border-b border-[#EFF8F7]">
                  <span className="text-[#6B9590]">Biaya Administrasi ({result.adminPayment}):</span>
                  <span className="font-bold text-[#1A3835]">{formatRupiah(result.biayaAdmin)}</span>
                </div>
                <div className="flex justify-between p-3 border-b border-[#EFF8F7]">
                  <span className="text-[#6B9590]">Biaya Provisi ({result.provisiPayment}):</span>
                  <span className="font-bold text-[#1A3835]">{formatRupiah(result.biayaProvisi)}</span>
                </div>
                <div className="flex justify-between p-3.5 bg-[#E8F6F5] border-b border-[#2BA8A2]/20 font-extrabold text-[#1E8C86]">
                  <span>Total Pokok Hutang Pembiayaan (PH):</span>
                  <span>{formatRupiah(result.totalPokokHutang)}</span>
                </div>
                <div className="flex justify-between p-3 border-b border-[#EFF8F7]">
                  <span className="text-[#6B9590]">
                    Suku Bunga Flat ({result.flatRateAnnual}% / thn x {result.tenorYears} thn):
                  </span>
                  <span className="font-bold text-[#EF6C4A]">
                    {formatRupiah(result.totalBunga)}
                  </span>
                </div>
                <div className="flex justify-between p-3.5 bg-[#EFF8F7] font-extrabold text-[#1A3835]">
                  <span>Total Kewajiban Pembayaran (PH + Bunga):</span>
                  <span className="text-[#27AE60] text-sm">{formatRupiah(result.totalHutang)}</span>
                </div>
              </div>

              {/* Summary Bottom Boxes */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-[#FFF4D0] border border-[#FFD23F]">
                  <span className="text-xs font-bold text-[#996B00] uppercase block">
                    Total DP Pertama (TDP)
                  </span>
                  <p className="text-lg font-black text-[#8A6000] mt-0.5">
                    {formatRupiah(result.totalDownPayment)}
                  </p>
                  <span className="text-[11px] text-[#996B00]">
                    {result.angsuranType === "ADVANCE" ? "Termasuk Angsuran ke-1 (ADDM)" : "Murni DP + Biaya (ADDB)"}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#E8F6F5] border border-[#2BA8A2]/30">
                  <span className="text-xs font-bold text-[#1E8C86] uppercase block">
                    Angsuran Bulanan
                  </span>
                  <p className="text-lg font-black text-[#1E8C86] mt-0.5">
                    {formatRupiah(result.angsuranBulanan)}
                  </p>
                  <span className="text-[11px] text-[#6B9590]">
                    Selama {result.tenorMonths} bulan
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto border border-[#2BA8A2]/20 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-[#EFF8F7] border-b border-[#2BA8A2]/20 text-[#1E8C86] font-bold">
                  <tr>
                    <th className="p-3 text-center">Bulan Ke</th>
                    <th className="p-3">Angsuran</th>
                    <th className="p-3">Porsi Pokok</th>
                    <th className="p-3">Porsi Bunga</th>
                    <th className="p-3">Sisa Hutang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFF8F7]">
                  {result.amortizationSchedule.map((row) => (
                    <tr key={row.month} className="hover:bg-[#FFF8E7]/60">
                      <td className="p-3 font-bold text-[#1A3835] text-center">
                        {row.month}
                      </td>
                      <td className="p-3 font-bold text-[#1E8C86]">
                        {formatRupiah(row.angsuran)}
                      </td>
                      <td className="p-3 text-[#325854]">
                        {formatRupiah(row.pokok)}
                      </td>
                      <td className="p-3 font-semibold text-[#EF6C4A]">
                        {formatRupiah(row.bunga)}
                      </td>
                      <td className="p-3 font-bold text-[#1A3835]">
                        {formatRupiah(row.sisaHutang)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-[#2BA8A2]/15">
          <button
            type="button"
            onClick={onClose}
            className="btn-flip7 btn-outline text-xs px-5"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
