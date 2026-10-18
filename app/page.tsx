"use client";

import React, { useState } from "react";
import Navbar from "./components/Navbar";
import CarSimulation from "./components/CarSimulation";
import MotorSimulation from "./components/MotorSimulation";
import DanaTunaiSimulation from "./components/DanaTunaiSimulation";
import GlossaryView from "./components/GlossaryView";
import RefundFeeCalculator from "./components/RefundFeeCalculator";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("car");
  const [selectedCar, setSelectedCar] = useState<string>("AVANZA 1.5 G MT");
  const [selectedMotor, setSelectedMotor] = useState<string>("VARIO 160 CBS");
  const [selectedDanaTunai, setSelectedDanaTunai] = useState<string>("AVANZA 1.5 G MT");

  const handleSelectFromGlossary = (model: string, isMotor?: boolean) => {
    if (isMotor) {
      setSelectedMotor(model);
      setSelectedDanaTunai(model);
      setActiveTab("motor");
    } else {
      setSelectedCar(model);
      setSelectedDanaTunai(model);
      setActiveTab("car");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EFF8F7] text-[#1A3835]">
      {/* Flip7 Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Active Tab Screen */}
        {activeTab === "car" && (
          <CarSimulation
            initialVehicle={selectedCar}
            onOpenGlossary={() => setActiveTab("glossary")}
          />
        )}

        {activeTab === "motor" && (
          <MotorSimulation
            initialMotor={selectedMotor}
            onOpenGlossary={() => setActiveTab("glossary")}
          />
        )}

        {activeTab === "dana-tunai" && (
          <DanaTunaiSimulation
            initialVehicle={selectedDanaTunai}
            onOpenGlossary={() => setActiveTab("glossary")}
          />
        )}

        {activeTab === "glossary" && (
          <GlossaryView onSelectVehicle={handleSelectFromGlossary} />
        )}

        {activeTab === "refund" && <RefundFeeCalculator />}

      </main>

      {/* Footer */}
      <footer className="border-t border-[#2BA8A2]/15 bg-white py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B9590]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FFF4D0] border border-[#FFD23F] flex items-center justify-center font-black text-[#996B00]">
              A
            </div>
            <p className="font-bold text-[#1A3835]">
              © 2026 Adyatma Simulasi Kredit
            </p>
          </div>

          <div className="text-xs text-[#6B9590] font-medium">
            Kalkulator Pembiayaan Mobil &amp; Motor Resmi
          </div>
        </div>
      </footer>
    </div>
  );
}
