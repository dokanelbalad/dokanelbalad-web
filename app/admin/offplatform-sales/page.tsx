"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getOffplatformSalesPendingReview,
  getOffplatformSalesPendingIntervention,
  approveOffplatformSaleAdmin,
  dismissOffplatformSaleAdmin,
  forceResolveOffplatformSale,
  OffplatformSale,
} from "@/app/lib/api";

const COLORS = {
  green: "#0E5D45",
  orange: "#EA730D",
  cream: "#FEFAF4",
  ink: "#1A1A1A",
  muted: "#6B7A75",
  line: "#EDE7DC",
  danger: "#C0392B",
  sage: "#EBF2F0",
};

const statusLabel: Record<string, string> = {
  pending: "مستنية رد المشتري",
  rejected: "رفضها المشتري",
  expired: "فاتت مهلة الـ24 ساعة",
};

function SaleCard({ sale, children }: { sale: OffplatformSale; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "white", border: `1px solid ${COLORS.line}` }}>
      <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
        <div className="text-right">
          <div className="font-extrabold text-sm" style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}>
            {sale.conversation?.product?.title}
          </div>
          <div className="text-xs mt-0.5" style={{ color: COLORS.muted }}>
            البائع: {sale.vendor?.store_name} · المشتري: {sale.conversation?.buyer?.name}
          </div>
        </div>
        <span
          className="px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
          style={{ background: "#FCE8D6", color: "#9A4A08" }}
        >
          {statusLabel[sale.buyer_confirmation] || sale.buyer_confirmation}
        </span>
      </div>

      <div className="text-xs mb-3" style={{ color: COLORS.muted }}>
        قيمة العمولة:{" "}
        <span className="font-extrabold" style={{ color: COLORS.green }}>
          {sale.amount} ج.م
        </span>
        {" · "}
        مهلة الرد: {new Date(sale.confirmation_deadline).toLocaleString("ar-EG")}
      </div>

      {children}
    </div>
  );
}

export default function OffplatformSalesPage() {
  const router = useRouter();
  const [needsReview, setNeedsReview] = useState<OffplatformSale[]>([]);
  const [pending, setPending] = useState<OffplatformSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState<number | null>(null);
  const [showPending, setShowPending] = useState(false);

  function load(token: string) {
    Promise.all([getOffplatformSalesPendingReview(token), getOffplatformSalesPendingIntervention(token)])
      .then(([review, pend]) => {
        setNeedsReview(review);
        setPending(pend);
      })
      .catch((err) => setError(err.message || "حصل خطأ"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    load(token);
  }, [router]);

  async function handleApprove(id: number) {
    const token = localStorage.getItem("token");
    if (!token) return;
    setActingId(id);
    try {
      await approveOffplatformSaleAdmin(token, id);
      setNeedsReview((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActingId(null);
    }
  }

  async function handleDismiss(id: number) {
    const token = localStorage.getItem("token");
    if (!token) return;
    setActingId(id);
    try {
      await dismissOffplatformSaleAdmin(token, id);
      setNeedsReview((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActingId(null);
    }
  }

  async function handleForceResolve(id: number, decision: "approve" | "dismiss") {
    const token = localStorage.getItem("token");
    if (!token) return;

    const warning =
      decision === "approve"
        ? "دي حالة لسه في وقتها ومستنية رد المشتري. التدخل الفوري ده لازم يكون بس لحالة فيها بلاغ أو شكوى واضحة. متأكد؟"
        : "دي حالة لسه في وقتها. متأكد إنك عايز تلغي العمولة دي فوراً من غير ما تستنى رد المشتري؟";
    if (!confirm(warning)) return;

    setActingId(id);
    try {
      await forceResolveOffplatformSale(token, id, decision);
      setPending((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActingId(null);
    }
  }

  return (
    <div dir="rtl" style={{ background: COLORS.cream, minHeight: "100vh", fontFamily: "var(--font-tajawal)" }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/admin" className="text-sm font-bold mb-4 inline-block" style={{ color: COLORS.green }}>
          → رجوع للوحة الإدارة
        </Link>

        <h1 className="text-2xl font-extrabold mb-1 text-right" style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}>
          بيعات بره الموقع
        </h1>
        <p className="text-sm mb-6 text-right" style={{ color: COLORS.muted }}>
          البيعات اللي البائع بلّغ عنها (زرار "تم البيع") ومحتاجة قرارك
        </p>

        {loading ? (
          <p className="text-center py-16" style={{ color: COLORS.muted }}>
            جاري التحميل...
          </p>
        ) : error ? (
          <p className="text-center py-16" style={{ color: COLORS.danger }}>
            {error}
          </p>
        ) : (
          <>
            <h2 className="text-base font-extrabold mb-3 text-right" style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}>
              محتاجة مراجعة ({needsReview.length})
            </h2>

            {needsReview.length === 0 ? (
              <p className="text-sm py-6 text-center" style={{ color: COLORS.muted }}>
                مفيش حالات محتاجة مراجعة دلوقتي
              </p>
            ) : (
              <div className="space-y-3 mb-8">
                {needsReview.map((sale) => (
                  <SaleCard key={sale.id} sale={sale}>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(sale.id)}
                        disabled={actingId === sale.id}
                        className="flex-1 py-2 rounded-full font-extrabold text-xs"
                        style={{ background: COLORS.green, color: "white" }}
                      >
                        اعتماد العمولة (مستحقة فعلاً)
                      </button>
                      <button
                        onClick={() => handleDismiss(sale.id)}
                        disabled={actingId === sale.id}
                        className="flex-1 py-2 rounded-full font-extrabold text-xs"
                        style={{ background: "white", color: COLORS.danger, border: `1px solid ${COLORS.danger}` }}
                      >
                        إلغاء (مفيش عمولة مستحقة)
                      </button>
                    </div>
                  </SaleCard>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowPending((v) => !v)}
              className="text-xs font-bold mb-3"
              style={{ color: COLORS.orange }}
            >
              {showPending ? "إخفاء" : "عرض"} الحالات اللي لسه في وقتها ({pending.length}) — تدخل استثنائي بس ⌄
            </button>

            {showPending && (
              <div className="space-y-3">
                <p className="text-xs rounded-xl p-3" style={{ background: "#FCE8D6", color: "#9A4A08" }}>
                  ⚠️ الحالات دي لسه في وقتها الطبيعي ومستنية رد المشتري. متدخلش فيها إلا لو فيه بلاغ أو شكوى واضحة،
                  لأن التدخل بيلغي حق المشتري في وقته الكامل.
                </p>
                {pending.length === 0 ? (
                  <p className="text-sm py-6 text-center" style={{ color: COLORS.muted }}>
                    مفيش حالات مستنية دلوقتي
                  </p>
                ) : (
                  pending.map((sale) => (
                    <SaleCard key={sale.id} sale={sale}>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleForceResolve(sale.id, "approve")}
                          disabled={actingId === sale.id}
                          className="flex-1 py-2 rounded-full font-extrabold text-xs"
                          style={{ background: COLORS.green, color: "white" }}
                        >
                          تدخل فوري: اعتماد
                        </button>
                        <button
                          onClick={() => handleForceResolve(sale.id, "dismiss")}
                          disabled={actingId === sale.id}
                          className="flex-1 py-2 rounded-full font-extrabold text-xs"
                          style={{ background: "white", color: COLORS.danger, border: `1px solid ${COLORS.danger}` }}
                        >
                          تدخل فوري: إلغاء
                        </button>
                      </div>
                    </SaleCard>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
