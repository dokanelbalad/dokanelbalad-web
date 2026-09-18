"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getVendorDashboard, getVendorProducts, deleteVendorProduct, VendorDashboard } from "@/app/lib/api";

const COLORS = {
  maroon: "#5C121B",
  maroonDark: "#3E0C13",
  gold: "#C89B3C",
  ivory: "#FBF7EF",
  ink: "#241416",
  sand: "#8A7458",
};

const conditionLabel: Record<string, string> = {
  new: "جديد",
  used: "مستعمل",
  like_new: "كالجديد",
};

export default function VendorDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<VendorDashboard | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function loadData(token: string) {
    Promise.all([getVendorDashboard(token), getVendorProducts(token)])
      .then(([dashboard, productsRes]) => {
        setData(dashboard);
        setProducts(productsRes.data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadData(token);
  }, [router]);

  async function handleDelete(productId: number) {
    const token = localStorage.getItem("token");
    if (!token) return;
    if (!confirm("متأكد إنك عايز تحذف المنتج ده؟")) return;

    setDeletingId(productId);
    try {
      await deleteVendorProduct(token, productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      if (data) {
        setData({
          ...data,
          stats: { ...data.stats, products_count: data.stats.products_count - 1 },
        });
      }
    } catch (err: any) {
      alert(err.message || "فشل حذف المنتج");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.ivory }}>
        <p style={{ color: COLORS.maroon, fontFamily: "var(--font-tajawal)" }}>جاري التحميل...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        dir="rtl"
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: COLORS.ivory, fontFamily: "var(--font-tajawal)" }}
      >
        <div className="text-center">
          <p className="font-bold mb-2" style={{ color: "#C0392B" }}>
            {error}
          </p>
          <p className="text-sm" style={{ color: COLORS.sand }}>
            الحساب ده لسه مش مسجل كبائع في المنصة
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { label: "منتجات نشطة", value: data.stats.products_count },
    { label: "إجمالي الطلبات", value: data.stats.orders_count },
    { label: "إجمالي المبيعات", value: `${Number(data.stats.total_sales).toLocaleString()} ج.م` },
    { label: "عمولة مستحقة", value: `${data.stats.pending_commission_balance} ج.م` },
  ];

  return (
    <div dir="rtl" style={{ background: COLORS.ivory, minHeight: "100vh", fontFamily: "var(--font-tajawal)" }}>
      <header className="px-4 py-6" style={{ background: `linear-gradient(90deg, ${COLORS.maroonDark}, ${COLORS.maroon})` }}>
        <div className="max-w-5xl mx-auto text-right">
          <h1 className="text-xl font-extrabold" style={{ color: COLORS.ivory, fontFamily: "var(--font-cairo)" }}>
            أهلاً، {data.vendor.store_name}
          </h1>
          {data.vendor.is_founding_seller && (
            <span
              className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: COLORS.gold, color: COLORS.maroonDark }}
            >
              بائع مؤسس
            </span>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-3xl p-4 text-right"
              style={{ background: "white", boxShadow: "0 4px 16px rgba(92,18,27,0.06)" }}
            >
              <div className="font-extrabold text-lg" style={{ color: COLORS.maroon, fontFamily: "var(--font-cairo)" }}>
                {s.value}
              </div>
              <div className="text-xs" style={{ color: COLORS.sand }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          
            <a href="/vendor-dashboard/new-product"
            className="px-5 py-2.5 rounded-full font-extrabold text-sm"
            style={{ background: COLORS.maroon, color: COLORS.ivory, fontFamily: "var(--font-cairo)" }}
          >
            + إضافة منتج جديد
          </a>
          <h2 className="text-lg font-extrabold text-right" style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}>
            منتجاتي ({products.length})
          </h2>
        </div>

        {products.length === 0 ? (
          <p className="text-center py-10" style={{ color: COLORS.sand }}>
            لسه معندكش منتجات - دوس على "إضافة منتج جديد" عشان تبدأ
          </p>
        ) : (
          <div className="rounded-3xl overflow-hidden" style={{ background: "white", boxShadow: "0 4px 16px rgba(92,18,27,0.06)" }}>
            {products.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-5 py-4 text-right gap-3"
                style={{ borderBottom: i < products.length - 1 ? "1px solid #F2E4C9" : "none" }}
              >
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
                  style={{ background: "#F5E8C8", color: COLORS.maroonDark }}
                >
                  {conditionLabel[p.condition]}
                </span>
                <span className="text-sm flex-1" style={{ color: COLORS.ink }}>
                  {p.title}
                </span>
                <span className="font-extrabold shrink-0" style={{ color: COLORS.maroon, fontFamily: "var(--font-cairo)" }}>
                  {Number(p.price).toLocaleString()} ج.م
                </span>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={deletingId === p.id}
                  className="text-xs font-bold shrink-0 px-3 py-1.5 rounded-full"
                  style={{ color: "#C0392B", border: "1px solid #C0392B" }}
                >
                  {deletingId === p.id ? "جاري الحذف..." : "حذف"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}