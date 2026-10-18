"use client";

import React, { useState, useMemo, useEffect, useDeferredValue } from "react";
import dynamic from "next/dynamic";
import {
  DanaTunaiResult,
  calculateDanaTunai,
  formatRupiah,
  generateDanaTunaiShareText,
} from "../utils/calculator";
import vehicleData from "../data/vehicleData.json";

// Dynamic imports for heavy modals
const RoundingModal = dynamic(() => import("./RoundingModal"), { ssr: false });
const RefundModal = dynamic(() => import("./RefundModal"), { ssr: false });
const CreditStructureModal = dynamic(() => import("./CreditStructureModal"), { ssr: false });

interface DanaTunaiSimulationProps {
  initialVehicle?: string;
  onOpenGlossary: () => void;
}

const CAR_BRANDS = [
  "TOYOTA",
  "HONDA",
  "DAIHATSU",
  "MITSUBISHI",
  "SUZUKI",
  "NISSAN",
  "HYUNDAI",
  "WULING",
  "ISUZU",
  "MAZDA",
  "FORD",
  "CHEVROLET",
  "BMW",
  "MERCEDES-BENZ",
  "KIA",
  "HINO",
  "LAINNYA",
];

const MOTOR_BRANDS = [
  "HONDA",
  "YAMAHA",
  "SUZUKI",
  "KAWASAKI",
  "VESPA",
  "PIAGGIO",
  "LAINNYA",
];

const CAR_BRAND_ALIASES: Record<string, string[]> = {
  TOYOTA: [
    "AVANZA", "INNOVA", "FORTUNER", "CALYA", "AGYA", "RUSH", "YARIS", "RAIZE",
    "VELOZ", "COROLLA", "CAMRY", "ALPHARD", "VOXY", "HILUX", "HIACE", "SIENTA",
    "VIOS", "ETIOS", "CHR", "HARRIER", "PRADO", "DYNA", "GRNDNW AVANZA",
    "ALN AVANZA", "ALN VELOZ", "ALN AGYA", "ZENIX", "RANGGA", "HILUXRANGGA"
  ],
  HONDA: [
    "BRIO", "HRV", "HR-V", "CRV", "CR-V", "BRV", "BR-V", "WRV", "WR-V",
    "CIVIC", "CITY", "JAZZ", "MOBILIO", "ACCORD", "FREED", "STREAM", "ODYSSEY",
    "CR-Z", "ALN HRV", "ALN BRV"
  ],
  DAIHATSU: [
    "XENIA", "AYLA", "TERIOS", "SIGRA", "ROCKY", "GRANMAX", "GRAN MAX",
    "LUXIO", "SIRION", "GRN XENIA", "NEW XENIA", "ALN XENIA", "ALN AYLA"
  ],
  MITSUBISHI: [
    "XPANDER", "PAJERO", "OUTLANDER", "MIRAGE", "TRITON", "L300", "L 300",
    "COLT", "ECLIPSE", "XFORCE", "FUSO", "STRADA"
  ],
  SUZUKI: [
    "ERTIGA", "XL7", "IGNIS", "BALENO", "SWIFT", "KARIMUN", "CARRY", "APV",
    "S-PRESSO", "SX4", "GRAND VITARA", "SPLASH", "JIMNY", "ALN ERTIGA"
  ],
  NISSAN: [
    "LIVINA", "SERENA", "X-TRAIL", "XTRAIL", "MARCH", "JUKE", "EVALIA",
    "TEANA", "NAVARA", "KICKS", "MAGNITE", "TERRA", "ALMERA"
  ],
  HYUNDAI: [
    "CRETA", "STARGAZER", "IONIQ", "SANTA FE", "PALISADE", "KONA", "TUCSON",
    "H-1", "H1", "AVEGA", "I10", "I20", "STARIA"
  ],
  WULING: [
    "ALMAZ", "CORTEZ", "CONFERO", "ALVEZ", "AIR EV", "BINGUO", "FORMO"
  ],
  ISUZU: [
    "PANTHER", "ELF", "GIGA", "TRAGA", "D-MAX", "DMAX", "MU-X", "NKR", "NMR",
    "NLR", "BISON"
  ],
  MAZDA: ["MAZDA", "CX", "BIANTE"],
  FORD: ["FIESTA", "ECOSPORT", "RANGER", "EVEREST", "FOCUS", "ESCAPE"],
  CHEVROLET: ["SPIN", "CAPTIVA", "TRAX", "TRAILBLAZER", "AVEO", "SPARK", "COLORADO"],
  BMW: ["320", "330", "520", "530", "X1", "X3", "X5", "X6", "M3", "M4"],
  "MERCEDES-BENZ": ["C 200", "C 300", "E 200", "E 300", "GLA", "GLC", "GLE", "GLS", "CLA"],
  KIA: ["PICANTO", "RIO", "SELTOS", "SONET", "SPORTAGE", "CARNIVAL", "CARENS", "EV6"],
  HINO: ["HINO", "DUTRO", "FG", "FL", "FM", "SG", "RK", "RN"],
};

const MOTOR_BRAND_ALIASES: Record<string, string[]> = {
  HONDA: [
    "BEAT", "VARIO", "SCOOPY", "PCX", "ADV", "GENIO", "CBR", "CB", "CRF",
    "REVO", "SUPRA", "BLADE", "SONIC", "FORZA", "VERZA", "MEGA PRO", "TIGER", "SPACY"
  ],
  YAMAHA: [
    "NMAX", "AEROX", "MIO", "FAZZIO", "FILANO", "LEXI", "XMAX", "R15", "R25",
    "VIXION", "WR155", "JUPITER", "VEGA", "BYSON", "SCORPIO", "FREEGO", "GEAR",
    "FINO", "XSR", "MT-15", "MT-25"
  ],
  SUZUKI: ["SATRIA", "GSX", "ADDRESS", "NEX", "BURGMAN", "SMASH", "SHOGUN", "THUNDER", "GIXXER"],
  KAWASAKI: ["NINJA", "KLX", "D-TRACKER", "W175", "VULCAN", "VERSYS", "Z125", "Z250"],
  VESPA: ["VESPA", "SPRINT", "PRIMA VERA", "PRIMA", "GTS", "LX", "S 125"],
  PIAGGIO: ["MEDLEY", "LIBERTY", "BEVERLY", "ZIP", "FLY"],
};

function detectBrand(name: string, isMotor: boolean): string {
  const upper = name.toUpperCase();
  const dict = isMotor ? MOTOR_BRAND_ALIASES : CAR_BRAND_ALIASES;
  for (const [brand, prefixes] of Object.entries(dict)) {
    if (upper.includes(brand)) return brand;
    for (const prefix of prefixes) {
      if (upper.startsWith(prefix) || upper.includes(" " + prefix)) return brand;
    }
  }
  return "LAINNYA";
}

function getEstimatedMarketPrice(category: "MOBIL" | "MOTOR", vehicleType: string): number {
  const upper = vehicleType.toUpperCase();
  if (category === "MOBIL") {
    if (
      upper.includes("FORTUNER") ||
      upper.includes("PAJERO") ||
      upper.includes("ALPHARD") ||
      upper.includes("PALISADE") ||
      upper.includes("CRV") ||
      upper.includes("CR-V")
    ) {
      return 420000000;
    }
    if (
      upper.includes("INNOVA") ||
      upper.includes("ZENIX") ||
      upper.includes("HRV") ||
      upper.includes("HR-V") ||
      upper.includes("CX-5") ||
      upper.includes("SANTA FE")
    ) {
      return 310000000;
    }
    if (
      upper.includes("AVANZA") ||
      upper.includes("XENIA") ||
      upper.includes("XPANDER") ||
      upper.includes("ERTIGA") ||
      upper.includes("LIVINA") ||
      upper.includes("BRV") ||
      upper.includes("RUSH") ||
      upper.includes("TERIOS") ||
      upper.includes("XL7")
    ) {
      return 210000000;
    }
    if (
      upper.includes("BRIO") ||
      upper.includes("AGYA") ||
      upper.includes("AYLA") ||
      upper.includes("SIGRA") ||
      upper.includes("CALYA") ||
      upper.includes("IGNIS") ||
      upper.includes("RAIZE") ||
      upper.includes("ROCKY") ||
      upper.includes("WRV")
    ) {
      return 150000000;
    }
    if (
      upper.includes("GRANMAX") ||
      upper.includes("CARRY") ||
      upper.includes("L300") ||
      upper.includes("TRAGA")
    ) {
      return 135000000;
    }
    return 190000000;
  } else {
    if (
      upper.includes("XMAX") ||
      upper.includes("FORZA") ||
      upper.includes("CBR 250") ||
      upper.includes("NINJA 250")
    ) {
      return 62000000;
    }
    if (
      upper.includes("NMAX") ||
      upper.includes("PCX") ||
      upper.includes("ADV") ||
      upper.includes("AEROX") ||
      upper.includes("CBR 150") ||
      upper.includes("R15") ||
      upper.includes("VESPA")
    ) {
      return 33000000;
    }
    if (
      upper.includes("VARIO") ||
      upper.includes("SCOOPY") ||
      upper.includes("FAZZIO") ||
      upper.includes("FILANO") ||
      upper.includes("LEXI")
    ) {
      return 24000000;
    }
    if (
      upper.includes("BEAT") ||
      upper.includes("GENIO") ||
      upper.includes("MIO") ||
      upper.includes("GEAR") ||
      upper.includes("REVO") ||
      upper.includes("SUPRA")
    ) {
      return 18000000;
    }
    return 22000000;
  }
}

export default function DanaTunaiSimulation({
  initialVehicle,
  onOpenGlossary,
}: DanaTunaiSimulationProps) {
  // Category: Mobil or Motor
  const [category, setCategory] = useState<"MOBIL" | "MOTOR">("MOBIL");

  // 1. Merk State
  const [merk, setMerk] = useState<string>("TOYOTA");

  // 2. Type State
  const [vehicleType, setVehicleType] = useState<string>(initialVehicle || "AVANZA 1.5 G MT");
  const [searchQuery, setSearchQuery] = useState<string>(initialVehicle || "AVANZA 1.5 G MT");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Market Value (Taksasi / OTR) & Tahun
  const [tahun, setTahun] = useState<number>(2022);
  const [otr, setOtr] = useState<number>(200000000);

  // 4. LTV (Loan to Value) percentage
  const [ltvPercent, setLtvPercent] = useState<number>(80);

  // 3. Tenor
  const [tenorMonths, setTenorMonths] = useState<number>(36);

  // Additional credit conditions
  const [biayaDipotongPencairan, setBiayaDipotongPencairan] = useState<boolean>(true);
  const [angsuranType, setAngsuranType] = useState<"ARREAR" | "ADVANCE">("ARREAR");
  const [asuransiType, setAsuransiType] = useState<"TLO" | "ALL_RISK" | "NONE">("TLO");
  const [adminAmount, setAdminAmount] = useState<number>(2500000);
  const [provisiPercent, setProvisiPercent] = useState<number>(1.5);
  const [customRate, setCustomRate] = useState<number | undefined>(undefined);

  // Modals & Sharing
  const [isRoundingOpen, setIsRoundingOpen] = useState<boolean>(false);
  const [isRefundOpen, setIsRefundOpen] = useState<boolean>(false);
  const [isStructureOpen, setIsStructureOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // External initial vehicle selection
  useEffect(() => {
    if (initialVehicle) {
      setVehicleType(initialVehicle);
      setSearchQuery(initialVehicle);
      const isMotorGuess = vehicleData.motors.includes(initialVehicle);
      const cat = isMotorGuess ? "MOTOR" : "MOBIL";
      setCategory(cat);
      const b = detectBrand(initialVehicle, isMotorGuess);
      setMerk(b);
      const est = getEstimatedMarketPrice(cat, initialVehicle);
      setOtr(est);
    }
  }, [initialVehicle]);

  // Adjust defaults when category changes
  const handleCategoryChange = (newCat: "MOBIL" | "MOTOR") => {
    setCategory(newCat);
    if (newCat === "MOBIL") {
      setMerk("TOYOTA");
      setVehicleType("AVANZA 1.5 G MT");
      setSearchQuery("AVANZA 1.5 G MT");
      setOtr(200000000);
      setTenorMonths(36);
      setAdminAmount(2500000);
      setCustomRate(undefined);
    } else {
      setMerk("HONDA");
      setVehicleType("VARIO 160 CBS");
      setSearchQuery("VARIO 160 CBS");
      setOtr(25000000);
      setTenorMonths(35);
      setAdminAmount(750000);
      setCustomRate(undefined);
    }
  };

  // Adjust defaults when tenor changes
  useEffect(() => {
    if (category === "MOBIL") {
      const defaultAdmin =
        tenorMonths <= 12
          ? 2000000
          : tenorMonths <= 24
          ? 2250000
          : tenorMonths <= 36
          ? 2500000
          : 2750000;
      setAdminAmount(defaultAdmin);
    } else {
      const defaultAdmin = tenorMonths <= 12 ? 650000 : 800000;
      setAdminAmount(defaultAdmin);
    }
  }, [tenorMonths, category]);

  // Brand list based on category
  const brandList = useMemo(() => {
    return category === "MOBIL" ? CAR_BRANDS : MOTOR_BRANDS;
  }, [category]);

  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Filtered vehicle types based on brand and deferred search query (no input lag)
  const searchResults = useMemo(() => {
    const rawList = category === "MOBIL" ? vehicleData.cars : vehicleData.motors;
    const isMotor = category === "MOTOR";
    const q = deferredSearchQuery.toLowerCase().trim();

    return rawList
      .filter((item: string) => {
        // If specific merk selected, ensure it matches brand (or match all if "LAINNYA")
        if (merk && merk !== "LAINNYA") {
          const itemBrand = detectBrand(item, isMotor);
          if (itemBrand !== merk && !item.toUpperCase().includes(merk)) {
            return false;
          }
        }
        if (!q) return true;
        return item.toLowerCase().includes(q);
      })
      .slice(0, 25);
  }, [category, merk, deferredSearchQuery]);

  // Plafon Pinjaman (calculated from OTR * LTV%)
  const plafonPinjaman = Math.round(otr * (ltvPercent / 100));

  // Handle direct change of Plafon amount
  const handlePlafonChange = (amount: number) => {
    if (otr > 0) {
      const calculatedLtv = Math.min(100, Math.max(10, Math.round((amount / otr) * 100)));
      setLtvPercent(calculatedLtv);
    }
  };

  // Live calculation result
  const result: DanaTunaiResult = useMemo(() => {
    return calculateDanaTunai({
      category,
      merk,
      vehicleType,
      tahun,
      otr,
      ltvPercent,
      tenorMonths,
      flatRateAnnual: customRate,
      adminAmount,
      provisiPercent,
      asuransiType,
      biayaDipotongPencairan,
      angsuranType,
    });
  }, [
    category,
    merk,
    vehicleType,
    tahun,
    otr,
    ltvPercent,
    tenorMonths,
    customRate,
    adminAmount,
    provisiPercent,
    asuransiType,
    biayaDipotongPencairan,
    angsuranType,
  ]);

  const handleCopy = () => {
    const text = generateDanaTunaiShareText(merk, vehicleType, tahun, result);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = generateDanaTunaiShareText(merk, vehicleType, tahun, result);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div
        className="flip7-card accent-bar-gold"
        style={{ background: "linear-gradient(135deg, #FFFFFF 0%, #FFF8E7 50%, #EFF8F7 100%)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#FFD23F] flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
              💵
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-extrabold text-[#1A3835]">
                  Simulasi Dana Tunai (Gadai BPKB)
                </h1>
                <span className="flip7-badge badge-gold">Pencairan Maksimal</span>
              </div>
              <p className="text-xs text-[#6B9590] mt-0.5 font-medium">
                Plafon dana tunai tinggi berdasarkan LTV agunan kendaraan, bunga kompetitif &amp; dana cair langsung ke rekening
              </p>
            </div>
          </div>

          {/* Category Toggle: Mobil vs Motor */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="pill-group bg-white border border-[#2BA8A2]/25 shadow-sm p-1">
              <button
                type="button"
                onClick={() => handleCategoryChange("MOBIL")}
                className={`pill-item ${category === "MOBIL" ? "active" : ""}`}
              >
                🚗 Mobil
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange("MOTOR")}
                className={`pill-item ${category === "MOTOR" ? "active" : ""}`}
              >
                🏍️ Motor
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Form on Left, Result Sticky on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Inputs 1 to 4 */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: Input 1 (Merk) & Input 2 (Pilih Type) */}
          <div className="flip7-card accent-bar-teal space-y-4">
            <div className="section-title">
              <div className="section-title-label">
                <span className="emoji-badge">🏷️</span>
                <span>1. Merk &amp; 2. Pilih Tipe Kendaraan</span>
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

            {/* 1. MERK SELECTOR */}
            <div>
              <div className="flip7-label">
                <span>1. Merk Kendaraan:</span>
                <span className="flip7-badge badge-teal">{merk}</span>
              </div>

              {/* Quick Brand Pills */}
              <div className="flex gap-1.5 flex-wrap mb-2.5">
                {brandList.slice(0, 8).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      setMerk(b);
                      setSearchQuery("");
                    }}
                    className={`text-xs px-3 py-1.5 rounded-full font-bold transition border ${
                      merk === b
                        ? "bg-[#2BA8A2] text-white border-[#1E8C86] shadow-sm"
                        : "bg-[#EFF8F7] hover:bg-[#D8F1EE] text-[#1A3835] border-[#2BA8A2]/20"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              {/* Dropdown for All Brands */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#6B9590] block mb-1">
                    Pilih Merk Lengkap:
                  </label>
                  <select
                    value={merk}
                    onChange={(e) => {
                      setMerk(e.target.value);
                      setSearchQuery("");
                    }}
                    className="flip7-select font-bold"
                  >
                    {brandList.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tahun Kendaraan */}
                <div>
                  <label className="text-[11px] font-bold text-[#6B9590] block mb-1">
                    Tahun Kendaraan:
                  </label>
                  <select
                    value={tahun}
                    onChange={(e) => setTahun(Number(e.target.value))}
                    className="flip7-select font-bold"
                  >
                    {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012].map(
                      (y) => (
                        <option key={y} value={y}>
                          Tahun {y}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. PILIH TYPE AUTOCOMPLETE */}
            <div className="relative pt-1">
              <div className="flip7-label">
                <span>2. Pilih Tipe Model ({merk}):</span>
                <span className="text-xs text-[#6B9590] font-medium">
                  {searchResults.length} tipe ditemukan
                </span>
              </div>

              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVehicleType(e.target.value);
                  setIsDropdownOpen(true);
                }}
                placeholder={`Ketik / pilih tipe model ${merk} (contoh: Avanza, Innova, Vario, Brio...)`}
                className="flip7-input font-bold text-[#1A3835]"
              />

              {isDropdownOpen && searchResults.length > 0 && (
                <div className="flip7-dropdown max-h-56 overflow-y-auto">
                  {searchResults.map((item: string, i: number) => (
                    <div
                      key={i}
                      className="flip7-dropdown-item flex items-center justify-between"
                      onClick={() => {
                        setVehicleType(item);
                        setSearchQuery(item);
                        setIsDropdownOpen(false);
                        const detectedB = detectBrand(item, category === "MOTOR");
                        if (detectedB !== "LAINNYA") setMerk(detectedB);
                        const estPrice = getEstimatedMarketPrice(category, item);
                        setOtr(estPrice);
                      }}
                    >
                      <span className="font-semibold text-xs sm:text-sm">{item}</span>
                      <span className="flip7-badge badge-teal text-[10px]">Pilih</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Nilai Taksasi Pasar (OTR) */}
            <div className="pt-1">
              <div className="flip7-label">
                <span>Nilai Taksasi Pasar Kendaraan (OTR):</span>
                <span className="text-[#1E8C86] font-extrabold text-sm">{formatRupiah(otr)}</span>
              </div>
              <input
                type="number"
                step={category === "MOBIL" ? 5000000 : 500000}
                min={category === "MOBIL" ? 20000000 : 3000000}
                value={otr}
                onChange={(e) => setOtr(Number(e.target.value) || 0)}
                className="flip7-input font-black text-[#1E8C86] text-base"
              />
              <span className="text-[11px] text-[#6B9590] mt-1 block">
                *Nilai pasar/taksasi resmi acuan perhitungan persentase LTV pencairan dana
              </span>
            </div>
          </div>

          {/* Section 2: Input 4 (LTV Persentasenya) & Plafon Pinjaman */}
          <div className="flip7-card accent-bar-gold space-y-4">
            <div className="section-title">
              <div className="section-title-label">
                <span className="emoji-badge">📊</span>
                <span>4. Persentase LTV (Loan To Value) &amp; Plafon</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#6B9590] hidden sm:inline">Persentase LTV:</span>
                <div className="relative flex items-center w-24">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={ltvPercent || ""}
                    onChange={(e) => {
                      const val = e.target.value === "" ? 0 : Number(e.target.value);
                      setLtvPercent(val > 100 ? 100 : val);
                    }}
                    onBlur={() => {
                      if (!ltvPercent || ltvPercent < 1) setLtvPercent(10);
                      if (ltvPercent > 100) setLtvPercent(100);
                    }}
                    className="w-full py-1 px-2.5 pr-7 text-right font-black text-sm text-[#996B00] bg-white border-2 border-[#FFD23F] rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-[#FFD23F]/50"
                  />
                  <span className="absolute right-2 font-extrabold text-xs text-[#996B00] pointer-events-none">%</span>
                </div>
              </div>
            </div>

            {/* LTV Quick Chips */}
            <div>
              <div className="flip7-label mb-2">
                <span>Pilih Cepat Persentase LTV:</span>
                <span className="text-[#996B00] font-bold text-xs">{ltvPercent}% dari Nilai Taksasi</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {[50, 60, 70, 75, 80, 85, 90].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setLtvPercent(pct)}
                    className={`tenor-btn flex-1 min-w-[55px] ${ltvPercent === pct ? "active-gold" : ""}`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              {/* Slider for LTV with 1% step & direct manual input */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="1"
                    value={ltvPercent}
                    onChange={(e) => setLtvPercent(Number(e.target.value))}
                    className="w-full h-2.5 bg-[#D8F1EE] rounded-lg appearance-none cursor-pointer accent-[#2BA8A2]"
                  />
                  <div className="relative flex items-center min-w-[90px] w-[90px]">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      step="1"
                      value={ltvPercent || ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? 0 : Number(e.target.value);
                        setLtvPercent(val > 100 ? 100 : val);
                      }}
                      onBlur={() => {
                        if (!ltvPercent || ltvPercent < 1) setLtvPercent(10);
                        if (ltvPercent > 100) setLtvPercent(100);
                      }}
                      className="w-full py-1.5 px-2.5 pr-7 text-right font-black text-base text-[#1A3835] bg-white border-2 border-[#2BA8A2]/40 focus:border-[#2BA8A2] rounded-xl shadow-sm outline-none transition"
                    />
                    <span className="absolute right-2.5 font-black text-sm text-[#2BA8A2] pointer-events-none">
                      %
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-[11px] text-[#6B9590] font-semibold px-0.5">
                  <span>10%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>85%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Plafon Pinjaman Result Display & Two-way Input */}
            <div className="p-3.5 bg-[#FFF4D0] rounded-2xl border border-[#FFD23F] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#996B00] uppercase">
                  Plafon Pembiayaan / Nilai Pinjaman (Gross):
                </span>
                <span className="text-[11px] font-bold text-[#8A6000]">
                  {formatRupiah(otr)} × {ltvPercent}%
                </span>
              </div>
              <input
                type="number"
                step={category === "MOBIL" ? 1000000 : 250000}
                value={plafonPinjaman}
                onChange={(e) => handlePlafonChange(Number(e.target.value) || 0)}
                className="flip7-input font-black text-lg sm:text-xl text-[#8A6000] bg-white border-[#FFD23F]"
              />
              <p className="text-[11px] text-[#996B00] font-medium">
                💡 Anda dapat menggeser slider (kelipatan 1%), mengetik persentase LTV di kolom %, atau mengetik langsung nominal dana yang diinginkan
              </p>
            </div>
          </div>

          {/* Section 3: Input 3 (Tenor) & Skema Pembayaran */}
          <div className="flip7-card accent-bar-coral space-y-4">
            <div className="section-title">
              <div className="section-title-label">
                <span className="emoji-badge">⏱️</span>
                <span>3. Tenor Pembiayaan Dana Tunai</span>
              </div>
              <span className="flip7-badge badge-coral font-bold">{tenorMonths} Bulan</span>
            </div>

            {/* Tenor Quick Buttons */}
            <div>
              <div className="flip7-label">
                <span>Pilihan Jangka Waktu (Tenor):</span>
                <span className="text-[#EF6C4A] font-extrabold text-xs">
                  {tenorMonths} Bulan ({(tenorMonths / 12).toFixed(1)} Tahun)
                </span>
              </div>

              {category === "MOBIL" ? (
                <div className="grid grid-cols-5 gap-2">
                  {[12, 24, 36, 48, 60].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTenorMonths(t)}
                      className={`tenor-btn ${tenorMonths === t ? "active-gold" : ""}`}
                    >
                      <span className="font-extrabold">{t} Bln</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
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
              )}
            </div>

            {/* Biaya & Suku Bunga Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Skema Pemotongan Biaya */}
              <div>
                <label className="flip7-label">Skema Biaya:</label>
                <select
                  value={biayaDipotongPencairan ? "POTONG" : "KREDIT"}
                  onChange={(e) => setBiayaDipotongPencairan(e.target.value === "POTONG")}
                  className="flip7-select font-bold"
                >
                  <option value="POTONG">Dipotong dari Pencairan (Nett)</option>
                  <option value="KREDIT">Dikreditkan (Pencairan Utuh 100%)</option>
                </select>
              </div>

              {/* Tipe Angsuran */}
              <div>
                <label className="flip7-label">Tipe Angsuran:</label>
                <select
                  value={angsuranType}
                  onChange={(e) => setAngsuranType(e.target.value as any)}
                  className="flip7-select font-bold"
                >
                  <option value="ARREAR">ADDB (Angsuran Pertama di Belakang)</option>
                  <option value="ADVANCE">ADDM (Angsuran Pertama di Muka)</option>
                </select>
              </div>

              {/* Suku Bunga Flat p.a. */}
              <div>
                <div className="flip7-label">
                  <span>Suku Bunga Flat (% p.a.):</span>
                  <span className="text-[#EF6C4A] font-extrabold">{result.flatRateAnnual}%</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="3"
                  max="35"
                  value={customRate ?? result.flatRateAnnual}
                  onChange={(e) => setCustomRate(Number(e.target.value) || 0)}
                  className="flip7-input font-bold"
                />
              </div>

              {/* Biaya Administrasi */}
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

              {/* Asuransi Kendaraan */}
              <div>
                <label className="flip7-label">Proteksi Asuransi:</label>
                <select
                  value={asuransiType}
                  onChange={(e) => setAsuransiType(e.target.value as any)}
                  className="flip7-select font-bold"
                >
                  <option value="TLO">Total Loss Only (TLO)</option>
                  <option value="ALL_RISK">All Risk (Komprehensif)</option>
                  <option value="NONE">Tanpa Asuransi Tambahan</option>
                </select>
              </div>

              {/* Biaya Provisi */}
              <div>
                <div className="flip7-label">
                  <span>Biaya Provisi (%):</span>
                  <span className="text-[#1E8C86] font-bold">
                    {provisiPercent}% ({formatRupiah(result.biayaProvisi)})
                  </span>
                </div>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="5"
                  value={provisiPercent}
                  onChange={(e) => setProvisiPercent(Number(e.target.value) || 0)}
                  className="flip7-input font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sticky Summary: Hasil Perhitungan Dana Tunai */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          <div className="flip7-hero-card space-y-4">
            <div className="flex items-center justify-between border-b border-[#FFD23F]/40 pb-3">
              <span className="flip7-badge badge-gold">✨ Hasil Hitungan Dana Tunai</span>
              <span className="text-xs font-bold text-[#6B9590] truncate max-w-[200px]">
                {merk} - {vehicleType}
              </span>
            </div>

            {/* Estimasi Dana Cair Bersih Hero Box */}
            <div
              className="p-4 rounded-2xl border-2 border-[#FFD23F] space-y-1.5 shadow-sm"
              style={{ background: "linear-gradient(135deg, #FFF4D0 0%, #FFE47A 100%)" }}
            >
              <span className="text-xs font-extrabold text-[#996B00] uppercase tracking-wide block">
                💵 Estimasi Dana Cair Bersih ke Rekening
              </span>
              <div className="text-3xl sm:text-4xl font-black text-[#8A6000] tracking-tight">
                {formatRupiah(result.pencairanBersih)}
              </div>
              <p className="text-[11px] text-[#996B00] font-semibold">
                {biayaDipotongPencairan
                  ? "*Dana bersih siap cair (setelah dipotong biaya admin, provisi & asuransi)"
                  : "*Pencairan 100% utuh tanpa potongan (biaya dikreditkan dalam angsuran)"}
              </p>
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
                <span className="text-[#1A3835] font-bold">{result.tenorMonths} Bulan</span> |{" "}
                <span className="text-[#1E8C86] font-bold">
                  {angsuranType === "ARREAR" ? "ADDB" : "ADDM"}
                </span>
              </p>
            </div>

            {/* Detailed Summary Breakdown */}
            <div className="text-xs space-y-2 pt-1 border-t border-[#FFD23F]/30 text-[#325854]">
              <div className="flex justify-between py-1 border-b border-[#EFF8F7]">
                <span className="text-[#6B9590]">Nilai Taksasi Pasar (OTR):</span>
                <span className="font-bold text-[#1A3835]">{formatRupiah(result.nilaiTaksasi)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EFF8F7]">
                <span className="text-[#6B9590]">Persentase LTV:</span>
                <span className="font-extrabold text-[#996B00]">{result.ltvPercent}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EFF8F7]">
                <span className="text-[#6B9590]">Plafon Pembiayaan (Gross):</span>
                <span className="font-bold text-[#1E8C86]">{formatRupiah(result.plafonPinjaman)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EFF8F7]">
                <span className="text-[#6B9590]">Total Pokok Hutang (PH):</span>
                <span className="font-bold text-[#2BA8A2]">{formatRupiah(result.totalPokokHutang)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EFF8F7]">
                <span className="text-[#6B9590]">Total Bunga ({result.tenorYears} Th):</span>
                <span className="font-bold text-[#EF6C4A]">{formatRupiah(result.totalBunga)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EFF8F7]">
                <span className="text-[#6B9590]">Biaya Administrasi:</span>
                <span className="font-bold text-[#1A3835]">{formatRupiah(result.biayaAdmin)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EFF8F7]">
                <span className="text-[#6B9590]">Biaya Provisi ({provisiPercent}%):</span>
                <span className="font-bold text-[#1A3835]">{formatRupiah(result.biayaProvisi)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EFF8F7]">
                <span className="text-[#6B9590]">Premi Asuransi ({asuransiType}):</span>
                <span className="font-bold text-[#1A3835]">{formatRupiah(result.totalAsuransi)}</span>
              </div>
              {biayaDipotongPencairan && (
                <div className="flex justify-between py-1 border-b border-[#EFF8F7] font-bold text-[#EF6C4A]">
                  <span>Total Potongan Biaya:</span>
                  <span>- {formatRupiah(result.totalPotongan)}</span>
                </div>
              )}
            </div>

            {/* Action Tools Grid: Same features as Car & Motor */}
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

            {/* Credit Structure & Amortization Modal Button */}
            <button
              type="button"
              onClick={() => setIsStructureOpen(true)}
              className="btn-flip7 btn-sky text-xs py-2.5 w-full"
            >
              <span>📋</span>
              <span>Lihat Struktur Kredit &amp; Amortisasi</span>
            </button>

            {/* Share & WhatsApp Action Bar */}
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

      {/* Modals: Feature parity with Car & Motor */}
      <RoundingModal
        isOpen={isRoundingOpen}
        onClose={() => setIsRoundingOpen(false)}
        currentAngsuran={result.angsuranBulanan}
        tenorMonths={result.tenorMonths}
        currentDp={result.totalDownPayment}
        onApplyRounding={(targetAngsuran, newDp) => {
          // Adjust custom rate or admin fee if rounded
          const diffPerMonth = targetAngsuran - result.angsuranBulanan;
          if (diffPerMonth !== 0) {
            const adjustedRate = Number(
              (
                result.flatRateAnnual +
                (diffPerMonth * result.tenorMonths * 100) /
                  (result.totalPokokHutang * result.tenorYears)
              ).toFixed(2)
            );
            setCustomRate(Math.max(1, adjustedRate));
          }
        }}
      />

      <RefundModal
        isOpen={isRefundOpen}
        onClose={() => setIsRefundOpen(false)}
        vehicleType={`${merk} ${vehicleType}`}
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
        vehicleName={`${merk} - ${vehicleType}`}
        isDanaTunai={true}
      />
    </div>
  );
}
