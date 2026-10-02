"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getFrozenAccounts, unfreezeUserAccount, FrozenAccount } from "@/app/lib/api";

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

const reasonLabel: Record<string, string> = {
  phone_sharing: "مشاركة أرقام تواصل",
  commission_overdue: "عمولة متأخرة",
  admin_manual: "تجميد يدوي من الإدارة",
};

export default function FrozenAccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<FrozenAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState<number | null>(null);

  function load(token: string) {
    getFrozenAccounts(token)
      .then(setAccounts)
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

  async function handleUnfreeze(id: number) {
    const token = localStorage.getItem("token");
    if (!token) return;
    if (!confirm("متأكد إنك عايز ترفع التجميد عن الحساب ده؟")) return;

    setActingId(id);
    try {
      await unfreezeUserAccount(token, id);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.message || "فشل رفع التجميد");
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
          الحسابات المجمّدة
        </h1>
        <p className="text-sm mb-6 text-right" style={{ color: COLORS.muted }}>
          كل حساب (بائع أو مشتري) مجمّد دلوقتي، سواء تلقائي (عمولة متأخرة أو مخالفة أرقام) أو يدوي منك
        </p>

        {loading ? (
          <p className="text-center py-16" style={{ color: COLORS.muted }}>
            جاري التحميل...
          </p>
        ) : error ? (
          <p className="text-center py-16" style={{ color: COLORS.danger }}>
            {error}
          </p>
        ) : accounts.length === 0 ? (
          <p className="text-center py-16" style={{ color: COLORS.muted }}>
            مفيش حسابات مجمّدة دلوقتي 🎉
          </p>
        ) : (
          <div className="space-y-3">
            {accounts.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl p-4"
                style={{ background: "white", border: `1px solid ${COLORS.line}` }}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="text-right">
                    <div className="font-extrabold text-sm" style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}>
                      {a.name}{" "}
                      <span className="font-normal" style={{ color: COLORS.muted }}>
                        ({a.role === "seller" ? "بائع" : a.role === "admin" ? "أدمن" : "مشتري"})
                      </span>
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: COLORS.muted }} dir="ltr">
                      {a.email} · {a.phone}
                    </div>
                    {a.vendorProfile && (
                      <div className="text-xs mt-0.5" style={{ color: COLORS.muted }}>
                        المتجر: {a.vendorProfile.store_name}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-start gap-1 shrink-0">
                    {a.permanently_banned ? (
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-extrabold"
                        style={{ background: "#FDEDEC", color: COLORS.danger }}
                      >
                        مغلق نهائياً
                      </span>
                    ) : (
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{ background: "#FCE8D6", color: "#9A4A08" }}
                      >
                        {reasonLabel[a.frozen_reason || ""] || a.frozen_reason}
                      </span>
                    )}
                    {a.frozen_until && (
                      <span className="text-xs" style={{ color: COLORS.muted }}>
                        لحد: {new Date(a.frozen_until).toLocaleString("ar-EG")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3 text-xs" style={{ color: COLORS.muted }}>
                  <span>مخالفات أرقام: {a.phone_violation_strikes}</span>
                  <span>تجميد أرقام سابق: {a.phone_freeze_count}</span>
                  <span>تجميد عمولة سابق: {a.commission_freeze_count}</span>
                </div>

                <button
                  onClick={() => handleUnfreeze(a.id)}
                  disabled={actingId === a.id}
                  className="mt-3 px-4 py-2 rounded-full text-xs font-extrabold"
                  style={{ background: COLORS.green, color: "white", fontFamily: "var(--font-cairo)" }}
                >
                  {actingId === a.id ? "جاري الرفع..." : "رفع التجميد"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
