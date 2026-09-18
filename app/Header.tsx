"use client";

import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

export default function Header() {
  const { totalItems } = useCart();

  return (
    <header
      className="sticky top-0 z-20 px-4 py-3"
      style={{ background: "linear-gradient(90deg, #3E0C13, #5C121B)" }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <img src="/logo.png" alt="دكان البلد" style={{ height: 160, width: "auto" }} />

        <div className="flex items-center gap-4">
          <span className="text-sm font-bold" style={{ color: "#E8C97A" }}>
            بيتا - نسخة تجريبية
          </span>
                    <Link href="/inbox" className="text-sm font-bold" style={{ color: "#E8C97A" }}>
            الرسائل
          </Link>
          <Link href="/my-orders" className="text-sm font-bold" style={{ color: "#E8C97A" }}>
            طلباتي
          </Link>
          <Link href="/cart" className="relative" aria-label="السلة">
            <span className="text-2xl">🛒</span>
            {totalItems > 0 && (
              <span
                className="absolute -top-2 -left-2 flex items-center justify-center rounded-full text-xs font-extrabold"
                style={{
                  background: "#E8C97A",
                  color: "#3E0C13",
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