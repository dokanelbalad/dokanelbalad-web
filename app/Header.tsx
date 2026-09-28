"use client";

import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

const COLORS = {
  green: "#0E5D45",
  greenDark: "#0B4A38",
  orange: "#EA730D",
  orangeLight: "#FCE8D6",
  cream: "#FEFAF4",
  line: "#EDE7DC",
};

export default function Header() {
  const { totalItems } = useCart();

  return (
    <header
      className="sticky top-0 z-20 px-4 py-2"
      style={{
        background: "rgba(254,250,244,0.95)",
        backdropFilter: "blur(8px)",
        borderBottom: `1px solid ${COLORS.line}`,
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" aria-label="دكان البلد - الرئيسية">
          <img src="/logo.png" alt="دكان البلد" style={{ height: 64, width: "auto" }} />
        </Link>

        <div className="flex items-center gap-3 md:gap-5">
          <span
            className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: COLORS.orangeLight, color: COLORS.orange }}
          >
            بيتا - نسخة تجريبية
          </span>
          <Link href="/inbox" className="text-sm font-bold" style={{ color: COLORS.green }}>
            الرسائل
          </Link>
          <Link href="/my-orders" className="text-sm font-bold" style={{ color: COLORS.green }}>
            طلباتي
          </Link>
          <Link href="/cart" className="relative" aria-label="السلة">
            <span className="text-2xl">🛒</span>
            {totalItems > 0 && (
              <span
                className="absolute -top-2 -left-2 flex items-center justify-center rounded-full text-xs font-extrabold"
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
        </div>
      </div>
    </header>
  );
}
