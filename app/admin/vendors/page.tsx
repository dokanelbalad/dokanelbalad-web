"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAdminVendors, approveVendor, rejectVendor, AdminVendor, AuthUser } from "@/app/lib/api";

const COLORS = {
  maroon: "#5C121B",
  maroonDark: "#3E0C13",
  gold: "#C89B3C",
  ivory: "#FBF7EF",
  ink: "#241416",
  sand: "#8A7458",
};

const statusLabel: Record<string, string> = {
  pending: "قيد المراجعة",
  approved: "مقبول",
  rejected: "مرفوض",
};

const statusColor: Record<string, string> = {
  pending: "#C89B3C",
  approved: "#2E7D32",
  rejected: "#C0392B",
};

export default function AdminVendorsPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<AdminVendor[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  function loadVendors(token: string, status?: string) {
    setLoading(true);
    getAdminVendors(token, status === "all" ? undefined : status)
      .then(setVendors)
      .catch((err) => setError(err.message || "حصل خطأ"))
      .finally(() => setLoading(false));
  }

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
    loadVendors(token, filter);
  }, [router, filter]);

  async function handleApprove(id: number) {
    const token = localStorage.getItem("token");
    if (!token) return;
    setActionLoading(id);
    try {
      await approveVendor(token, id);
      loadVendors(token, filter);
    } catch (err: any) {
      setError(err.message || "فشلت العملية");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id: number) {
    const token = localStorage.getItem("token");
    if (!token) return;
    setActionLoading(id);
    try {
      await rejectVendor(token, id);
      loadVendors(token, filter);
    } catch (err: any) {
      setError(err.message || "فشلت العملية");
    } finally {
      setActionLoading(null);
    }
  }

  const filters = [
    { key: "all", label: "الكل" },
    { key: "pending", label: "قيد المراجعة" },
    { key: "approved", label: "مقبول" },
    { key: "rejected", label: "مرفوض" },
  ];

  return (
    <div dir="rtl" style={{ background: COLORS.ivory, minHeight: "100vh", fontFamily: "var(--font-tajawal)" }}>
      <header className="px-4 py-4" style={{ background: `linear-gradient(90deg, ${COLORS.maroonDark}, ${COLORS.maroon})` }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-extrabold text-lg" style={{ color: COLORS.ivory, fontFamily: "var(--font-cairo)" }}>
            إدارة البائعين
          </span>
          <Link href="/admin" className="text-sm font-bold" style={{ color: COLORS.gold }}>
            → رجوع للوحة التحكم
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 mb-6 justify-end">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-4 py-2 rounded-full text-xs font-bold"
              style={{
                background: filter === f.key ? COLORS.maroon : "white",
                color: filter === f.key ? COLORS.ivory : COLORS.ink,
                border: `1px solid ${filter === f.key ? COLORS.maroon : "#E5D8BE"}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-sm font-bold mb-4 text-right" style={{ color: "#C0392B" }}>
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-center py-16" style={{ color: COLORS.sand }}>
            جاري التحميل...
          </p>
        ) : vendors.length === 0 ? (
          <p className="text-center py-16" style={{ color: COLORS.sand }}>
            مفيش بائعين في القسم ده
          </p>
        ) : (
          <div className="space-y-3">
            {vendors.map((v) => (
              <div
                key={v.id}
                className="rounded-2xl p-5"
                style={{ background: "white", boxShadow: "0 4px 16px rgba(92,18,27,0.08)" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: `${statusColor[v.status]}20`, color: statusColor[v.status] }}
                  >
                    {statusLabel[v.status] || v.status}
                  </span>
                  <div className="text-right">
                    <div className="font-extrabold text-sm" style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}>
                      {v.store_name}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: COLORS.sand }}>
                      {v.user?.name} · {v.user?.phone}
                    </div>
                  </div>
                </div>

                <div className="text-xs mb-3 text-right" style={{ color: COLORS.sand }}>
                  {v.vendor_type === "shop" ? "محل" : "فرد"} · عمولة {v.commission_rate}%
                  {Number(v.pending_commission_balance) > 0 && (
                    <> · رصيد معلق: {Number(v.pending_commission_balance).toLocaleString()} ج.م</>
                  )}
                </div>

                {v.status === "pending" && (
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleReject(v.id)}
                      disabled={actionLoading === v.id}
                      className="px-5 py-2 rounded-full text-sm font-bold"
                      style={{ border: "2px solid #C0392B", color: "#C0392B", opacity: actionLoading === v.id ? 0.5 : 1 }}
                    >
                      رفض
                    </button>
                    <button
                      onClick={() => handleApprove(v.id)}
                      disabled={actionLoading === v.id}
                      className="px-5 py-2 rounded-full text-sm font-bold"
                      style={{ background: "#2E7D32", color: "white", opacity: actionLoading === v.id ? 0.5 : 1 }}
                    >
                      قبول
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}