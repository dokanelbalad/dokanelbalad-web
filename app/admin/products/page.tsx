"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getAdminProducts,
  getAdminCategories,
  updateProductCategory,
  updateProductDiscount,
  Product,
  Category,
  AuthUser,
} from "@/app/lib/api";

const COLORS = {
  maroon: "#5C121B",
  maroonDark: "#3E0C13",
  gold: "#C89B3C",
  ivory: "#FBF7EF",
  ink: "#241416",
  sand: "#8A7458",
};

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [discountDrafts, setDiscountDrafts] = useState<Record<number, string>>({});

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

    Promise.all([getAdminProducts(token), getAdminCategories(token)])
      .then(([p, c]) => {
        setProducts(p);
        setCategories(c);
        const drafts: Record<number, string> = {};
        p.forEach((prod) => {
          drafts[prod.id] = prod.discount_percentage || "0";
        });
        setDiscountDrafts(drafts);
      })
      .catch((err) => setError(err.message || "حصل خطأ"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleCategoryChange(productId: number, categoryId: number) {
    const token = localStorage.getItem("token");
    if (!token) return;
    setSavingId(productId);
    try {
      await updateProductCategory(token, productId, categoryId);
      const newCategory = categories.find((c) => c.id === categoryId);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, category: newCategory! } : p))
      );
    } catch (err: any) {
      setError(err.message || "فشل تعديل التصنيف");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDiscountSave(productId: number) {
    const token = localStorage.getItem("token");
    if (!token) return;
    const value = Number(discountDrafts[productId] || "0");
    setSavingId(productId);
    try {
      const res = await updateProductDiscount(token, productId, value);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, discount_percentage: res.data.discount_percentage, price_after_discount: res.data.price_after_discount }
            : p
        )
      );
    } catch (err: any) {
      setError(err.message || "فشل تعديل الخصم");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div dir="rtl" style={{ background: COLORS.ivory, minHeight: "100vh", fontFamily: "var(--font-tajawal)" }}>
      <header className="px-4 py-4" style={{ background: `linear-gradient(90deg, ${COLORS.maroonDark}, ${COLORS.maroon})` }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-extrabold text-lg" style={{ color: COLORS.ivory, fontFamily: "var(--font-cairo)" }}>
            إدارة المنتجات
          </span>
          <Link href="/admin" className="text-sm font-bold" style={{ color: COLORS.gold }}>
            → رجوع للوحة التحكم
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <p className="text-sm font-bold mb-4 text-right" style={{ color: "#C0392B" }}>
            {error}
          </p>
        )}

        <h2 className="font-extrabold text-sm mb-4 text-right" style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}>
          كل المنتجات ({products.length})
        </h2>

        {loading ? (
          <p className="text-center py-10" style={{ color: COLORS.sand }}>
            جاري التحميل...
          </p>
        ) : products.length === 0 ? (
          <p className="text-center py-10" style={{ color: COLORS.sand }}>
            مفيش منتجات لسه
          </p>
        ) : (
          <div className="space-y-2">
            {products.map((p) => (
              <div
                key={p.id}
                className="rounded-xl p-3"
                style={{ background: "white", boxShadow: "0 2px 10px rgba(92,18,27,0.06)" }}
              >
                <div className="flex items-center justify-between">
                  <select
                    value={p.category?.id || ""}
                    onChange={(e) => handleCategoryChange(p.id, Number(e.target.value))}
                    disabled={savingId === p.id}
                    className="rounded-lg px-3 py-1.5 text-xs outline-none"
                    style={{ border: "1px solid #E5D8BE" }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name_ar}
                      </option>
                    ))}
                  </select>

                  <div className="text-right">
                    <span className="font-bold text-sm" style={{ color: COLORS.ink }}>
                      {p.title}
                    </span>
                    <div className="text-xs" style={{ color: COLORS.sand }}>
                      {p.vendor?.store_name} · {Number(p.price).toLocaleString()} ج.م
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: "1px solid #F2E4C9" }}>
                  <button
                    onClick={() => handleDiscountSave(p.id)}
                    disabled={savingId === p.id}
                    className="text-xs font-bold px-3 py-1.5 rounded-full shrink-0"
                    style={{ background: COLORS.maroon, color: COLORS.ivory, opacity: savingId === p.id ? 0.5 : 1 }}
                  >
                    حفظ الخصم
                  </button>

                  <div className="flex items-center gap-2">
                    {Number(p.discount_percentage) > 0 && (
                      <span className="text-xs font-bold" style={{ color: "#2E7D32" }}>
                        السعر الحالي: {Number(p.price_after_discount).toLocaleString()} ج.م
                      </span>
                    )}
                    <input
                      type="number"
                      min={0}
                      max={90}
                      value={discountDrafts[p.id] ?? "0"}
                      onChange={(e) =>
                        setDiscountDrafts((prev) => ({ ...prev, [p.id]: e.target.value }))
                      }
                      className="w-16 rounded-lg px-2 py-1 text-xs outline-none text-center"
                      style={{ border: "1px solid #E5D8BE" }}
                    />
                    <span className="text-xs font-bold" style={{ color: COLORS.ink }}>
                      % خصم
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
