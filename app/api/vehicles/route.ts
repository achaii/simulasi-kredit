import { NextResponse } from "next/server";
import vehicleData from "../../data/vehicleData.json";
import glossaryData from "../../data/glossaryData.json";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "cars"; // "cars", "motors", "glossary"
  const q = searchParams.get("q")?.toLowerCase() || "";
  const limit = parseInt(searchParams.get("limit") || "100", 10);

  if (type === "motors") {
    let items = vehicleData.motors;
    if (q) {
      items = items.filter((m: string) => m.toLowerCase().includes(q));
    }
    return NextResponse.json({ items: items.slice(0, limit), total: items.length });
  }

  if (type === "glossary") {
    let items = glossaryData;
    if (q) {
      items = items.filter(
        (g: { model: string; kode_stnk: string; nama_pasar: string; kode: string }) =>
          g.model.toLowerCase().includes(q) ||
          g.kode_stnk.toLowerCase().includes(q) ||
          g.nama_pasar.toLowerCase().includes(q)
      );
    }
    return NextResponse.json({ items: items.slice(0, limit), total: items.length });
  }

  // Default: cars
  let items = vehicleData.cars;
  if (q) {
    items = items.filter((c: string) => c.toLowerCase().includes(q));
  }
  return NextResponse.json({ items: items.slice(0, limit), total: items.length });
}
