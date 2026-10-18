"use client";

import React, { useState } from "react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { id: "car", label: "Simulasi Mobil", emoji: "🚗" },
    { id: "motor", label: "Simulasi Motor", emoji: "🏍️" },
    { id: "glossary", label: "Glossary OTR", emoji: "📖" },
    { id: "refund", label: "Hitung Refund", emoji: "💰" },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="flip7-header">
      {/* Main Header Bar */}
      <div className="flip7-header-container">
        {/* Brand Logo & Title */}
        <div
          className="flip7-brand"
          onClick={() => handleSelectTab("car")}
        >
          <div className="flip7-brand-icon">
            <span>⚡</span>
          </div>

          <div className="flip7-brand-text">
            <span className="flip7-brand-title">Simulasi Kredit</span>
            <p className="flip7-brand-subtitle hidden sm:block">
              Kalkulator Pembiayaan Mobil &amp; Motor
            </p>
          </div>
        </div>

        {/* Desktop Normal Menu (Visible on >= 768px) */}
        <nav className="hidden md:flex items-center gap-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                className={`flip7-normal-nav-link ${isActive ? "active" : ""}`}
              >
                <span className="text-base">{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile Burger Menu Button (Visible on < 768px) */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flip7-burger-btn"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <span className="text-xl font-black leading-none">✕</span>
            ) : (
              <span className="text-2xl font-black leading-none">☰</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="flip7-mobile-drawer md:hidden">
          <div className="space-y-1.5 p-3">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectTab(tab.id)}
                  className={`flip7-mobile-drawer-item ${isActive ? "active" : ""}`}
                >
                  <span className="text-lg">{tab.emoji}</span>
                  <span className="font-bold text-sm">{tab.label}</span>
                  {isActive && (
                    <span className="ml-auto text-xs text-[#2BA8A2] font-extrabold bg-[#D8F1EE] px-2.5 py-0.5 rounded-full">
                      Aktif
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
