"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GOVERNORATES, nearestGovernorate } from "@/app/lib/governorates";

type Cat = {
  id: number | string;
  slug: string;
  name_ar: string;
  icon?: string | null;
  image_url?: string | null;
};

const COLORS = {
  green: "#0E5D45",
  sage: "#EBF2F0",
  orange: "#EA730D",
  ink: "#1A1A1A",
  muted: "#6B7A75",
  line: "#E4DED2",
  band: "#F4F1E8",
};

export default function HomeToolbar({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const params = useSearchParams();

  const category = params.get("category") || "";
  const gov = params.get("gov") || "";
  const sort = params.get("sort") || "";
  const near = params.get("near") === "1";

  const [q, setQ] = useState(params.get("q") || "");
  const [locating, setLocating] = useState(false);
  const [geoMsg, setGeoMsg] = useState("");

  const buildQs = (changes: Record<string, string | undefined>) => {
    const p = new URLSearchParams(params.toString());
    Object.entries(changes).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    const qs = p.toString();
    return qs ? `/?${qs}` : "/";
  };

  const push = (changes: Record<string, string | undefined>) =>
    router.push(buildQs(changes), { scroll: false });

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    push({ q: q.trim() || undefined, brand: undefined });
  };

  const onNearby = () => {
    if (near) {
      push({ gov: undefined, near: undefined });
      return;
    }
    if (!navigator.geolocation) {
      setGeoMsg("المتصفح مش بيدعم تحديد الموقع");
      return;
    }
    setLocating(true);
    setGeoMsg("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        push({
          gov: nearestGovernorate(pos.coords.latitude, pos.coords.longitude),
          near: "1",
          brand: undefined,
        });
      },
      () => {
        setLocating(false);
        setGeoMsg("مقدرناش نحدد موقعك، اختار المحافظة يدوي");
      },
      { timeout: 10000 }
    );
  };

  const items: Cat[] = [{ id: "all", slug: "", name_ar: "الرئيسية", icon: "🏠" }, ...categories];
  const hasFilters = !!(gov || sort || q || category);

  const chip = (active: boolean): React.CSSProperties => ({
    background: active ? COLORS.green : "white",
    color: active ? "white" : COLORS.ink,
    border: `1.5px solid ${active ? COLORS.green : COLORS.line}`,
    fontFamily: "var(--font-tajawal)",
  });

  return (
    <div style={{ background: COLORS.band, borderBottom: `1px solid ${COLORS.line}` }}>
      <div className="max-w-6xl mx-auto px-4 pt-4 pb-3">
        {/* البحث + أضف إعلانك */}
        <div className="flex items-stretch gap-3">
          <form
            onSubmit={onSearch}
            className="flex flex-1 items-center rounded-2xl overflow-hidden"
            style={{ background: "white", border: `1px solid ${COLORS.line}`, height: 52 }}
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث عن سلعة"
              className="flex-1 min-w-0 h-full px-4 outline-none text-sm bg-transparent"
              style={{ color: COLORS.ink, fontFamily: "var(--font-tajawal)" }}
            />
            <button
              type="submit"
              aria-label="بحث"
              className="h-full px-5 text-lg"
              style={{ color: COLORS.green, borderRight: `1px solid ${COLORS.line}` }}
            >
              🔍
            </button>
          </form>

          <Link
            href="/vendor-dashboard"
            className="shrink-0 rounded-2xl px-4 md:px-6 flex items-center gap-1.5 text-sm font-extrabold"
            style={{ background: COLORS.orange, color: "white", fontFamily: "var(--font-cairo)" }}
          >
            <span className="text-lg leading-none">+</span>
            <span>
              <span className="hidden sm:inline">أضف إعلانك</span>
              <span className="sm:hidden">أضف</span>
            </span>
          </Link>
        </div>

        {/* الفئات */}
        <div
          className="flex gap-1.5 overflow-x-auto mt-3 pb-2 [scrollbar-width:thin] [scrollbar-color:#0E5D45_#EBF2F0]"
          style={{ scrollSnapType: "x proximity" }}
        >
          {items.map((c) => {
            const active = c.slug === category;
            return (
              <Link
                key={c.id}
                href={buildQs({ category: c.slug || undefined, brand: undefined })}
                scroll={false}
                className="shrink-0 rounded-xl px-2 py-2.5 flex flex-col items-center gap-1 text-center"
                style={{
                  width: 84,
                  scrollSnapAlign: "start",
                  background: active ? "#DCE9E4" : "transparent",
                }}
              >
                <span className="w-9 h-9 flex items-center justify-center text-2xl overflow-hidden">
                  {c.image_url ? (
                    <img src={c.image_url} alt={c.name_ar} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    c.icon
                  )}
                </span>
                <span
                  className="text-xs font-bold leading-tight"
                  style={{
                    color: active ? COLORS.green : COLORS.muted,
                    fontFamily: "var(--font-tajawal)",
                  }}
                >
                  {c.name_ar}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* الفلاتر: المنطقة / القريب / جديد */}
      <div style={{ background: "white", borderTop: `1px solid ${COLORS.line}` }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-2">
          <label
            className="rounded-full px-3 py-1.5 text-xs font-bold flex items-center gap-1.5"
            style={chip(!!gov && !near)}
          >
            <span>📍</span>
            <select
              value={gov}
              onChange={(e) => push({ gov: e.target.value || undefined, near: undefined, brand: undefined })}
              className="bg-transparent outline-none cursor-pointer"
              style={{ color: "inherit", fontFamily: "inherit" }}
            >
              <option value="" style={{ color: COLORS.ink }}>المنطقة</option>
              {GOVERNORATES.map((g) => (
                <option key={g.name} value={g.name} style={{ color: COLORS.ink }}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={onNearby}
            disabled={locating}
            className="rounded-full px-3 py-1.5 text-xs font-bold"
            style={chip(near)}
          >
            🧭 {locating ? "بنحدد موقعك..." : "القريب"}
          </button>

          <button
            type="button"
            onClick={() => push({ sort: sort === "new" ? undefined : "new" })}
            className="rounded-full px-3 py-1.5 text-xs font-bold"
            style={chip(sort === "new")}
          >
            ✨ جديد
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                router.push("/", { scroll: false });
              }}
              className="rounded-full px-3 py-1.5 text-xs font-bold"
              style={{ color: COLORS.orange, fontFamily: "var(--font-tajawal)" }}
            >
              ✕ مسح الفلاتر
            </button>
          )}

          {geoMsg && (
            <span className="text-xs" style={{ color: COLORS.muted, fontFamily: "var(--font-tajawal)" }}>
              {geoMsg}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
