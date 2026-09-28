"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

const COLORS = {
  green: "#0E5D45",
  greenDark: "#0B4A38",
  orange: "#EA730D",
  orangeLight: "#FCE8D6",
  cream: "#FEFAF4",
  line: "#EDE7DC",
  ink: "#1A1A1A",
  muted: "#6B7A75",
};

export default function Header() {
  const { totalItems } = useCart();
  const [langOpen, setLangOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-30 px-4 py-2"
      style={{
        background: "rgba(254,250,244,0.96)",
        backdropFilter: "blur(8px)",
        borderBottom: `1px solid ${COLORS.line}`,
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        <Link href="/" aria-label="دكان البلد - الرئيسية">
          <img src="/logo.png" alt="دكان البلد" style={{ height: 56, width: "auto" }} />
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          <span
            className="hidden lg:inline-block px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: COLORS.orangeLight, color: COLORS.orange }}
          >
            بيتا - نسخة تجريبية
          </span>

          <Link
            href="/inbox"
            className="text-sm font-bold px-1"
            style={{ color: COLORS.green }}
            aria-label="الرسائل"
          >
            <span className="sm:hidden">💬</span>
            <span className="hidden sm:inline">الرسائل</span>
          </Link>
          <Link
            href="/my-orders"
            className="text-sm font-bold px-1"
            style={{ color: COLORS.green }}
            aria-label="طلباتي"
          >
            <span className="sm:hidden">📦</span>
            <span className="hidden sm:inline">طلباتي</span>
          </Link>

          <Link href="/cart" className="relative px-1" aria-label="السلة">
            <span className="text-2xl">🛒</span>
            {totalItems > 0 && (
              <span
                className="absolute -top-2 -left-1 flex items-center justify-center rounded-full text-xs font-extrabold"
                style={{
                  background: COLORS.orange,
                  color: "white",
                  minWidth: 20,
                  height: 20,
                  padding: "0 4px",
                }}
              >
                {totalItems}
              </span>
            )}
          </Link>

          {/* اللغة */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              className="rounded-lg px-3 py-2 text-xs font-bold flex items-center gap-1"
              style={{
                background: "white",
                color: COLORS.ink,
                border: `1px solid ${COLORS.line}`,
                fontFamily: "var(--font-tajawal)",
              }}
            >
              عربي (AR) <span style={{ color: COLORS.muted }}>⌄</span>
            </button>
            {langOpen && (
              <div
                className="absolute left-0 mt-2 w-40 rounded-xl overflow-hidden text-xs"
                style={{
                  background: "white",
                  border: `1px solid ${COLORS.line}`,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  fontFamily: "var(--font-tajawal)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setLangOpen(false)}
                  className="w-full text-right px-3 py-2.5 font-bold"
                  style={{ color: COLORS.green, background: "#EBF2F0" }}
                >
                  عربي ✓
                </button>
                <div className="px-3 py-2.5" style={{ color: COLORS.muted }}>
                  English — قريباً
                </div>
              </div>
            )}
          </div>

          {/* دخول */}
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-xs md:text-sm font-extrabold whitespace-nowrap"
            style={{ background: COLORS.green, color: "white", fontFamily: "var(--font-cairo)" }}
          >
            دخول
          </Link>
        </div>
      </div>
    </header>
  );
}
