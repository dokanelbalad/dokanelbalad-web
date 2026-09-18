"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCategories, createVendorProduct, getVendorDashboard, Category } from "@/app/lib/api";

const COLORS = {
  maroon: "#5C121B",
  maroonDark: "#3E0C13",
  ivory: "#FBF7EF",
  ink: "#241416",
  sand: "#8A7458",
};

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState<"new" | "used" | "like_new">("new");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
    const [governorate, setGovernorate] = useState("");
  const [shippingFee, setShippingFee] = useState("0");
  const [discountPercentage, setDiscountPercentage] = useState("0");
  const [shippingPaidBy, setShippingPaidBy] = useState<"vendor" | "buyer">("buyer");
  const [commissionRate, setCommissionRate] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
    useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    getCategories().then(setCategories);
    getVendorDashboard(token)
      .then((res) => setCommissionRate(res.vendor.commission_rate))
      .catch(() => {});
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
           await createVendorProduct(token, {
        category_id: Number(categoryId),
        title,
        description,
        condition,
        price: Number(price),
        discount_percentage: Number(discountPercentage),
        shipping_fee: Number(shippingFee),
        shipping_paid_by: shippingPaidBy,
        quantity: Number(quantity),
        governorate,
      });
      router.push("/vendor-dashboard");
    } catch (err: any) {
      setError(err.message || "حصل خطأ، حاول تاني");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: COLORS.ivory, fontFamily: "var(--font-tajawal)" }}
    >
      <div
        className="w-full max-w-lg rounded-3xl p-8"
        style={{ background: "white", boxShadow: "0 8px 30px rgba(92,18,27,0.12)" }}
      >
                <h1
          className="text-2xl font-extrabold mb-2 text-right"
          style={{ color: COLORS.maroon, fontFamily: "var(--font-cairo)" }}
        >
          إضافة منتج جديد
        </h1>

        {commissionRate && (
          <div
            className="rounded-xl px-4 py-2.5 mb-6 text-xs font-bold text-right"
            style={{ background: "#F5E8C8", color: "#3E0C13" }}
          >
            💡 عمولة المنصة على منتجاتك: {commissionRate}% — احسبها في تسعيرك
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: COLORS.ink }}>
              التصنيف
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ border: "1px solid #E5D8BE" }}
            >
              <option value="">اختر تصنيف</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name_ar}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: COLORS.ink }}>
              اسم المنتج
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ border: "1px solid #E5D8BE" }}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: COLORS.ink }}>
              الوصف
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ border: "1px solid #E5D8BE" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: COLORS.ink }}>
                الحالة
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{ border: "1px solid #E5D8BE" }}
              >
                <option value="new">جديد</option>
                <option value="used">مستعمل</option>
                <option value="like_new">كالجديد</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: COLORS.ink }}>
                الكمية
              </label>
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{ border: "1px solid #E5D8BE" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: COLORS.ink }}>
                السعر (ج.م)
              </label>
              <input
                type="number"
                min={0}
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{ border: "1px solid #E5D8BE" }}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: COLORS.ink }}>
                المحافظة
              </label>
              <input
                type="text"
                required
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{ border: "1px solid #E5D8BE" }}
              />
            </div>
          </div>

          <div className="rounded-xl p-4" style={{ background: COLORS.ivory, border: "1px solid #E5D8BE" }}>
            <div className="text-xs font-bold mb-3" style={{ color: COLORS.ink }}>
              🚚 الشحن
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: COLORS.ink }}>
                  رسوم الشحن (ج.م)
                </label>
                <input
                  type="number"
                  min={0}
                  value={shippingFee}
                  onChange={(e) => setShippingFee(e.target.value)}
                  className="w-full rounded-xl px-4 py-2 text-sm outline-none"
                  style={{ border: "1px solid #E5D8BE", background: "white" }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: COLORS.ink }}>
                  مين يتحمل الشحن؟
                </label>
                <select
                  value={shippingPaidBy}
                  onChange={(e) => setShippingPaidBy(e.target.value as "vendor" | "buyer")}
                  className="w-full rounded-xl px-4 py-2 text-sm outline-none"
                  style={{ border: "1px solid #E5D8BE", background: "white" }}
                >
                  <option value="buyer">المشتري</option>
                  <option value="vendor">أنا (شحن مجاني للمشتري)</option>
                </select>
              </div>
            </div>
          </div>
                    <div className="rounded-xl p-4" style={{ background: COLORS.ivory, border: "1px solid #E5D8BE" }}>
            <label className="block text-xs font-bold mb-1" style={{ color: COLORS.ink }}>
              🏷️ نسبة خصم (اختياري، %)
            </label>
            <input
              type="number"
              min={0}
              max={90}
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
              className="w-full rounded-xl px-4 py-2 text-sm outline-none"
              style={{ border: "1px solid #E5D8BE", background: "white" }}
            />
            <div className="text-xs mt-1" style={{ color: COLORS.sand }}>
              لو حطيت خصم، هيظهر السعر القديم مشطوب والسعر الجديد بارز للمشتري
            </div>
          </div>
          {error && (
            <p className="text-sm font-bold" style={{ color: "#C0392B" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full font-extrabold"
            style={{ background: COLORS.maroon, color: COLORS.ivory, fontFamily: "var(--font-cairo)" }}
          >
            {loading ? "جاري الإضافة..." : "إضافة المنتج"}
          </button>
        </form>
      </div>
    </div>
  );
}