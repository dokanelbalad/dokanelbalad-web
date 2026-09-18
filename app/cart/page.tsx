"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { createOrder, startPayment } from "@/app/lib/api";

const COLORS = {
  maroon: "#5C121B",
  maroonDark: "#3E0C13",
  gold: "#C89B3C",
  ivory: "#FBF7EF",
  ink: "#241416",
  sand: "#8A7458",
};

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();

  const [address, setAddress] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleCheckout() {
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!address.trim() || !governorate.trim()) {
      setError("من فضلك اكتب عنوان التوصيل والمحافظة");
      return;
    }

    setSubmitting(true);
    try {
      const orders = await createOrder(token, {
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        payment_method: paymentMethod,
        shipping_address: address.trim(),
        shipping_governorate: governorate.trim(),
      });

      if (paymentMethod === "online") {
        // pay for the first created order (COD orders can be split by vendor;
        // online payment currently pays the first one - fine for the single-vendor MVP case)
        const firstOrder = Array.isArray(orders) ? orders[0] : orders;
        const { payment_url } = await startPayment(token, firstOrder.id);
        clearCart();
        window.location.href = payment_url;
        return;
      }

      clearCart();
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "حصل خطأ أثناء إتمام الطلب");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center px-4" style={{ background: COLORS.ivory }}>
        <div className="text-center space-y-4">
          <div className="text-6xl">✅</div>
          <h1 className="text-2xl font-extrabold" style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}>
            تم إتمام طلبك بنجاح
          </h1>
          <p style={{ color: COLORS.sand, fontFamily: "var(--font-tajawal)" }}>
            هيتواصل معاك البائع قريب لتأكيد التوصيل
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-3 rounded-full font-extrabold"
            style={{ background: COLORS.maroon, color: COLORS.ivory, fontFamily: "var(--font-cairo)" }}
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ background: COLORS.ivory, minHeight: "100vh", fontFamily: "var(--font-tajawal)" }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/" className="text-sm font-bold mb-6 inline-block" style={{ color: COLORS.maroon }}>
          → رجوع للرئيسية
        </Link>

        <h1 className="text-2xl font-extrabold mb-6 text-right" style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}>
          سلة المشتريات
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p style={{ color: COLORS.sand }}>السلة فاضية دلوقتي</p>
            <Link
              href="/"
              className="inline-block mt-4 px-6 py-3 rounded-full font-extrabold"
              style={{ background: COLORS.maroon, color: COLORS.ivory, fontFamily: "var(--font-cairo)" }}
            >
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-8">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-4 rounded-2xl p-4"
                  style={{ background: "white", boxShadow: "0 4px 16px rgba(92,18,27,0.08)" }}
                >
                  <div
                    className="flex items-center justify-center text-3xl rounded-xl shrink-0"
                    style={{ width: 64, height: 64, background: `linear-gradient(160deg, ${COLORS.maroon}, ${COLORS.maroonDark})` }}
                  >
                    {item.product.category?.icon || "📦"}
                  </div>

                  <div className="flex-1 text-right">
                    <h3 className="font-bold text-sm" style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}>
                      {item.product.title}
                    </h3>
                    <div className="text-xs mt-0.5" style={{ color: COLORS.sand }}>
                      {item.product.vendor?.store_name}
                    </div>
                    <div className="font-extrabold text-sm mt-1" style={{ color: COLORS.maroon }}>
                      {item.product.total_display_price.toLocaleString()} ج.م
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full font-bold"
                      style={{ background: COLORS.ivory, color: COLORS.maroon }}
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-bold" style={{ color: COLORS.ink }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full font-bold"
                      style={{ background: COLORS.ivory, color: COLORS.maroon }}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-lg px-1"
                    style={{ color: "#C0392B" }}
                    aria-label="حذف"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-5 mb-6" style={{ background: "white", boxShadow: "0 4px 16px rgba(92,18,27,0.08)" }}>
              <div className="flex justify-between items-center mb-4">
                <span className="font-extrabold text-lg" style={{ color: COLORS.maroon, fontFamily: "var(--font-cairo)" }}>
                  {totalPrice.toLocaleString()} ج.م
                </span>
                <span className="font-bold text-sm" style={{ color: COLORS.ink }}>
                  الإجمالي
                </span>
              </div>

              <div className="space-y-3 text-right">
                <div>
                  <label className="text-xs font-bold block mb-1.5" style={{ color: COLORS.ink }}>
                    المحافظة
                  </label>
                  <input
                    type="text"
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    placeholder="مثال: القاهرة"
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                    style={{ border: "1px solid #E5D8BE" }}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1.5" style={{ color: COLORS.ink }}>
                    عنوان التوصيل بالتفصيل
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="اسم الشارع، رقم العمارة، أقرب علامة مميزة..."
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                    style={{ border: "1px solid #E5D8BE" }}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-2" style={{ color: COLORS.ink }}>
                    طريقة الدفع
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label
                      className="flex items-center gap-2 rounded-xl p-3 cursor-pointer"
                      style={{ border: `2px solid ${paymentMethod === "cod" ? COLORS.maroon : "#E5D8BE"}` }}
                    >
                      <input type="radio" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                      <div>
                        <div className="text-sm font-bold" style={{ color: COLORS.ink }}>
                          كاش عند الاستلام
                        </div>
                      </div>
                    </label>
                    <label
                      className="flex items-center gap-2 rounded-xl p-3 cursor-pointer"
                      style={{ border: `2px solid ${paymentMethod === "online" ? COLORS.maroon : "#E5D8BE"}` }}
                    >
                      <input type="radio" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} />
                      <div>
                        <div className="text-sm font-bold" style={{ color: COLORS.ink }}>
                          ادفع أونلاين بالبطاقة
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm font-bold mb-3 text-right" style={{ color: "#C0392B" }}>
                {error}
              </p>
            )}

            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="w-full py-3.5 rounded-full font-extrabold"
              style={{
                background: COLORS.maroon,
                color: COLORS.ivory,
                fontFamily: "var(--font-cairo)",
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting
                ? paymentMethod === "online"
                  ? "جاري تجهيز صفحة الدفع..."
                  : "جاري إتمام الطلب..."
                : paymentMethod === "online"
                  ? "المتابعة للدفع"
                  : "إتمام الطلب"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
