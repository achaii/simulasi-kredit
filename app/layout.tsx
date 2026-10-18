import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Simulasi Kredit • Hitung Angsuran Mobil & Motor Resmi",
  description:
    "Aplikasi Simulasi Kredit Pembiayaan dengan skema ADDM, ADDB, Asuransi All Risk/TLO, Bunga Flat, Refund Agen, dan Database 5.000+ Kendaraan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={plusJakartaSans.variable} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#2BA8A2" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
