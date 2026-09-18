"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAdminOverview, AdminOverview, AuthUser } from "@/app/lib/api";

const COLORS = {
  maroon: "#5C121B",
  maroonDark: "#3E0C13",
  gold: "#C89B3C",
  ivory: "#FBF7EF",
  ink: "#241416",
  sand: "#8A7458",
};

export default function AdminPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    const user: AuthUser = JSON.parse(userStr);
    if (user.role !== "admin") {
      router.push("/");
      return;
    }

    getAdminOverview(token)
      .then(setOverview)
      .catch((err) => setError(err.message || "حصل خطأ"))
      .finally(() => setLoading(false));
  }, [router]);

  const cards = overview
    ? [
        { label: "إجمالي المستخدمين", value: overview.total_users },
        { label: "إجمالي البائعين", value: overview.total_vendors },
        { label: "بائعين قيد المراجعة", value: overview.pending_vendors, highlight: overview.pending_vendors > 0 },
        { label: "إجمالي المنتجات", value: overview.total_products },
        { label: "إجمالي الطلبات", value: overview.total_orders },
        {
          label: "عمولات معلقة",
          value: `${Number(overview.total_pending_commission).toLocaleString()} ج.م`,
          highlight: overview.total_pending_commission > 0,
        },
      ]
    : [];

  const sections = [
    { href: "/admin/vendors", label: "إدارة البائعين", icon: "🏪", desc: "الموافقة أو الرفض على البائعين الجدد" },
    { href: "/admin/categories", label: "إدارة التصنيفات", icon: "📂", desc: "إضافة وتعديل وحذف تصنيفات المنتجات" },
    { href: "/admin/products", label: "إدارة المنتجات", icon: "📦", desc: "تعديل تصنيف أي منتج في الموقع" },
    { href: "/admin/commissions", label: "تحصيل العمولات", icon: "💰", desc: "تحصيل رصيد العمولة المعلق من البائعين" },
  ];

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center" style={{ background: COLORS.ivory }}>
        <p style={{ color: COLORS.sand }}>جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ background: COLORS.ivory, minHeight: "100vh", fontFamily: "var(--font-tajawal)" }}>
      <header className="px-4 py-4" style={{ background: `linear-gradient(90deg, ${COLORS.maroonDark}, ${COLORS.maroon})` }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-extrabold text-lg" style={{ color: COLORS.ivory, fontFamily: "var(--font-cairo)" }}>
            لوحة تحكم الأدمن
          </span>
          <Link href="/" className="text-sm font-bold" style={{ color: COLORS.gold }}>
            رجوع للموقع
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {error && (
          <p className="text-sm font-bold mb-4 text-right" style={{ color: "#C0392B" }}>
            {error}
          </p>
        )}

        <h1 className="text-xl font-extrabold mb-4 text-right" style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}>
          نظرة عامة
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-2xl p-5 text-right"
              style={{
                background: "white",
                boxShadow: "0 4px 16px rgba(92,18,27,0.08)",
                border: c.highlight ? `2px solid ${COLORS.gold}` : "none",
              }}
            >
              <div className="text-2xl font-extrabold" style={{ color: COLORS.maroon, fontFamily: "var(--font-cairo)" }}>
                {c.value}
              </div>
              <div className="text-xs mt-1" style={{ color: COLORS.sand }}>
                {c.label}
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-extrabold mb-4 text-right" style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}>
          الأقسام
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-2xl p-5 text-right block"
              style={{ background: "white", boxShadow: "0 4px 16px rgba(92,18,27,0.08)" }}
            >
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="font-extrabold text-sm" style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}>
                {s.label}
              </div>
              <div className="text-xs mt-1" style={{ color: COLORS.sand }}>
                {s.desc}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}