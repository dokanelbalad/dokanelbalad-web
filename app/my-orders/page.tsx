"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMyOrders, Order } from "@/app/lib/api";

const COLORS = {
  maroon: "#5C121B",
  maroonDark: "#3E0C13",
  gold: "#C89B3C",
  ivory: "#FBF7EF",
  ink: "#241416",
  sand: "#8A7458",
};

const statusLabel: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "تم التأكيد",
  shipped: "جاري الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

const statusColor: Record<string, string> = {
  pending: "#C89B3C",
  confirmed: "#2E7D32",
  shipped: "#1565C0",
  delivered: "#2E7D32",
  cancelled: "#C0392B",
};

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    getMyOrders(token)
      .then((res) => setOrders(res.data))
      .catch((err) => setError(err.message || "حصل خطأ"))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div dir="rtl" style={{ background: COLORS.ivory, minHeight: "100vh", fontFamily: "var(--font-tajawal)" }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/" className="text-sm font-bold mb-6 inline-block" style={{ color: COLORS.maroon }}>
          → رجوع للرئيسية
        </Link>

        <h1 className="text-2xl font-extrabold mb-6 text-right" style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}>
          طلباتي
        </h1>

        {loading ? (
          <p className="text-center py-16" style={{ color: COLORS.sand }}>
            جاري التحميل...
          </p>
        ) : error ? (
          <p className="text-center py-16" style={{ color: "#C0392B" }}>
            {error}
          </p>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <p style={{ color: COLORS.sand }}>مفيش طلبات لسه</p>
            <Link
              href="/"
              className="inline-block mt-4 px-6 py-3 rounded-full font-extrabold"
              style={{ background: COLORS.maroon, color: COLORS.ivory, fontFamily: "var(--font-cairo)" }}
            >
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl p-5"
                style={{ background: "white", boxShadow: "0 4px 16px rgba(92,18,27,0.08)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: `${statusColor[order.status]}20`, color: statusColor[order.status] }}
                  >
                    {statusLabel[order.status] || order.status}
                  </span>
                  <div className="text-right">
                    <div className="font-bold text-sm" style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}>
                      طلب #{order.order_number}
                    </div>
                    <div className="text-xs" style={{ color: COLORS.sand }}>
                      {new Date(order.created_at).toLocaleDateString("ar-EG")}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-2" style={{ borderColor: "#F0E6D2" }}>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span style={{ color: COLORS.ink }}>
                        {Number(item.unit_price).toLocaleString()} ج.م × {item.quantity}
                      </span>
                      <span className="font-bold text-right" style={{ color: COLORS.ink }}>
                        {item.product.title}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: "#F0E6D2" }}>
                  <span className="font-extrabold" style={{ color: COLORS.maroon, fontFamily: "var(--font-cairo)" }}>
                    {Number(order.total).toLocaleString()} ج.م
                  </span>
                  <span className="text-xs" style={{ color: COLORS.sand }}>
                    {order.vendor?.store_name} · {order.shipping_governorate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}