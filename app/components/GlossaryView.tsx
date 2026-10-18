"use client";

import React, { useState, useMemo, useEffect, useDeferredValue } from "react";
import vehicleData from "../data/vehicleData.json";

interface GlossaryViewProps {
  onSelectVehicle: (model: string, isMotor?: boolean) => void;
}

export default function GlossaryView({ onSelectVehicle }: GlossaryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const deferredQuery = useDeferredValue(searchQuery);
  const [filterType, setFilterType] = useState<"ALL" | "MOBIL" | "MOTOR" | "STNK">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [glossaryItems, setGlossaryItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 30;

  // Asynchronously load heavy 465KB glossary data on demand
  useEffect(() => {
    let isMounted = true;
    import("../data/glossaryData.json").then((mod) => {
      if (isMounted) {
        setGlossaryItems(mod.default || mod);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter items using deferredQuery to prevent typing lag
  const filteredItems = useMemo(() => {
    const q = deferredQuery.toLowerCase().trim();

    if (filterType === "MOTOR") {
      let motors = vehicleData.motors.map((m: string) => ({
        model: m,
        kode_stnk: "-",
        nama_pasar: m,
        kode: "MCY",
        isMotor: true,
      }));
      if (q) {
        motors = motors.filter((m: { model: string }) => m.model.toLowerCase().includes(q));
      }
      return motors;
    }

    let glossary = glossaryItems.map((g: any) => ({
      ...g,
      isMotor: false,
    }));

    if (filterType === "MOBIL") {
      if (q) {
        glossary = glossary.filter(
          (g: any) =>
            g.model.toLowerCase().includes(q) ||
            g.nama_pasar.toLowerCase().includes(q)
        );
      }
      return glossary;
    }

    if (filterType === "STNK") {
      glossary = glossary.filter((g: any) => g.kode_stnk && g.kode_stnk !== "-");
      if (q) {
        glossary = glossary.filter(
          (g: any) =>
            g.kode_stnk.toLowerCase().includes(q) ||
            g.model.toLowerCase().includes(q)
        );
      }
      return glossary;
    }

    // ALL
    if (q) {
      glossary = glossary.filter(
        (g: any) =>
          g.model.toLowerCase().includes(q) ||
          g.kode_stnk.toLowerCase().includes(q) ||
          g.nama_pasar.toLowerCase().includes(q)
      );
    }
    return glossary;
  }, [deferredQuery, filterType, glossaryItems]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flip7-card accent-bar-teal bg-gradient-to-r from-white via-[#EFF8F7] to-[#E8F6F5]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F6F5] border-2 border-[#2BA8A2]/30 flex items-center justify-center text-2xl shadow-sm">
              📖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-extrabold text-[#1A3835]">
                  Glossary &amp; Database OTR
                </h1>
                <span className="flip7-badge badge-teal">5,075 Data Terhubung</span>
              </div>
              <p className="text-xs text-[#6B9590] mt-0.5 font-medium">
                Pencarian lengkap 2,180 tipe mobil, 845 motor, kode STNK kepolisian, dan nama pasar resmi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#6B9590]">Hasil Ditemukan:</span>
            <span className="flip7-badge badge-gold font-extrabold">{filteredItems.length} Kendaraan</span>
          </div>
        </div>
      </div>

      {/* Query Filter & Search Buffer */}
      <div className="flip7-card accent-bar-sky space-y-4">
        <div className="section-title">
          <div className="section-title-label">
            <span className="emoji-badge">🔍</span>
            <span>Pencarian Cepat Database OTR</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="flex-1 relative flex items-center">
            <span className="absolute left-3.5 text-base">🔎</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Ketik nama mobil, motor, merk, atau kode STNK (contoh: Avanza, Vario, Brio...)"
              className="flip7-input pl-10 text-sm font-semibold text-[#1A3835]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 text-xs font-bold text-[#EF6C4A] hover:bg-[#FEE8E2] px-2 py-1 rounded-full transition"
              >
                ✕ Hapus
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="pill-group">
            <button
              type="button"
              onClick={() => {
                setFilterType("ALL");
                setCurrentPage(1);
              }}
              className={`pill-item ${filterType === "ALL" ? "active" : ""}`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterType("MOBIL");
                setCurrentPage(1);
              }}
              className={`pill-item ${filterType === "MOBIL" ? "active" : ""}`}
            >
              Mobil
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterType("MOTOR");
                setCurrentPage(1);
              }}
              className={`pill-item ${filterType === "MOTOR" ? "active" : ""}`}
            >
              Motor
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterType("STNK");
                setCurrentPage(1);
              }}
              className={`pill-item ${filterType === "STNK" ? "active" : ""}`}
            >
              Kode STNK
            </button>
          </div>
        </div>
      </div>

      {/* Table Results */}
      <div className="flip7-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#EFF8F7] border-b border-[#2BA8A2]/15 text-[#1E8C86] font-bold">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Tipe &amp; Model Kendaraan</th>
                <th className="py-3 px-4 w-36">Kode STNK</th>
                <th className="py-3 px-4">Nama Pasar / Segmen</th>
                <th className="py-3 px-4 w-24 text-center">Unit</th>
                <th className="py-3 px-4 w-32 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFF8F7]">
              {isLoading && filterType !== "MOTOR" ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#2BA8A2] font-bold">
                    <div className="flex items-center justify-center gap-2">
                      <span className="inline-block animate-spin text-lg">⏳</span>
                      <span>Memuat database OTR lengkap...</span>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((item: any, idx: number) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                  return (
                    <tr
                      key={idx}
                      className="hover:bg-[#FFF8E7]/60 transition-colors"
                    >
                      <td className="py-3 px-4 text-center text-[#6B9590] font-bold">
                        {globalIndex}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#1A3835]">
                        {item.model}
                      </td>
                      <td className="py-3 px-4 text-[#EF6C4A] font-extrabold">
                        {item.kode_stnk || "-"}
                      </td>
                      <td className="py-3 px-4 text-[#325854]">
                        {item.nama_pasar || item.model}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`flip7-badge ${
                            item.isMotor ? "badge-gold" : "badge-teal"
                          }`}
                        >
                          {item.isMotor ? "Motor" : "Mobil"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onSelectVehicle(item.model, item.isMotor)}
                          className="btn-flip7 btn-teal text-xs py-1.5 px-3.5"
                        >
                          <span>Pilih</span>
                          <span>→</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#6B9590] font-medium">
                    Tidak ditemukan data kendaraan untuk kata kunci &quot;{searchQuery}&quot;
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs font-semibold pt-2 text-[#325854]">
          <span className="text-[#6B9590]">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(currentPage * itemsPerPage, filteredItems.length)} dari{" "}
            {filteredItems.length} unit
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="btn-flip7 btn-outline text-xs py-1.5 px-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Sebelumnya
            </button>
            <span className="text-[#1E8C86] font-bold px-2">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="btn-flip7 btn-outline text-xs py-1.5 px-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Berikutnya →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
