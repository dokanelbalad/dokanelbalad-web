"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getCategories, createVendorProduct, getVendorDashboard, Category } from "@/app/lib/api";

const COLORS = {
  maroon: "#0E5D45",
  maroonDark: "#0B4A38",
  ivory: "#FEFAF4",
  ink: "#1A1A1A",
  sand: "#8A7458",
  line: "#E5D8BE",
};

const MAX_IMAGES = 5;

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // الصور: نخزن الملفات نفسها + رابط معاينة محلي لكل واحدة
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);

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

  // تنضيف روابط المعاينة لما الصفحة تتقفل، عشان منسربش ذاكرة المتصفح
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, [images]);

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // يسمح باختيار نفس الملف تاني لو اتشال بالغلط

    if (files.length === 0) return;

    setImages((prev) => {
      const room = MAX_IMAGES - prev.length;
      if (room <= 0) {
        setError(`أقصى عدد صور ${MAX_IMAGES}`);
        return prev;
      }
      const toAdd = files.slice(0, room).map((file) => ({ file, preview: URL.createObjectURL(file) }));
      if (files.length > room) setError(`أقصى عدد صور ${MAX_IMAGES}، اتضافت أول ${room} بس`);
      else setError("");
      return [...prev, ...toAdd];
    });
  }

  function removeImage(index: number) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      await createVendorProduct(
        token,
        {
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
        },
        images.map((img) => img.file)
      );
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
        style={{ background: "white", boxShadow: "0 8px 30px rgba(14,93,69,0.12)" }}
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
            style={{ background: "#FCE8D6", color: "#9A4A08" }}
          >
            💡 عمولة المنصة على منتجاتك: {commissionRate}% — احسبها في تسعيرك
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          {/* صور المنتج */}
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: COLORS.ink }}>
              صور المنتج (حتى {MAX_IMAGES} صور - أول صورة هي الغلاف)
            </label>

            <div className="grid grid-cols-3 gap-2">
              {images.map((img, i) => (
                <div
                  key={img.preview}
                  className="relative rounded-xl overflow-hidden"
                  style={{ aspectRatio: "1 / 1", border: `1px solid ${COLORS.line}` }}
                >
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span
                      className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: COLORS.maroon, color: "white" }}
                    >
                      الغلاف
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 left-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.6)", color: "white" }}
                    aria-label="شيل الصورة"
                  >
                    ×
                  </button>
                </div>
              ))}

              {images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl flex items-center justify-center text-xs font-bold"
                  style={{
                    aspectRatio: "1 / 1",
                    border: `1.5px dashed ${COLORS.line}`,
                    color: COLORS.sand,
                  }}
                >
                  + أضف صورة
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: COLORS.ink }}>
              التصنيف
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ border: `1px solid ${COLORS.line}` }}
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
              style={{ border: `1px solid ${COLORS.line}` }}
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
              style={{ border: `1px solid ${COLORS.line}` }}
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
                style={{ border: `1px solid ${COLORS.line}` }}
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
                style={{ border: `1px solid ${COLORS.line}` }}
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
                style={{ border: `1px solid ${COLORS.line}` }}
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
                style={{ border: `1px solid ${COLORS.line}` }}
              />
            </div>
          </div>

          <div className="rounded-xl p-4" style={{ background: COLORS.ivory, border: `1px solid ${COLORS.line}` }}>
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
                  style={{ border: `1px solid ${COLORS.line}`, background: "white" }}
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
                  style={{ border: `1px solid ${COLORS.line}`, background: "white" }}
                >
                  <option value="buyer">المشتري</option>
                  <option value="vendor">أنا (شحن مجاني للمشتري)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-4" style={{ background: COLORS.ivory, border: `1px solid ${COLORS.line}` }}>
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
              style={{ border: `1px solid ${COLORS.line}`, background: "white" }}
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
