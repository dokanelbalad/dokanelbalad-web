"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getConversations, Conversation, AuthUser } from "@/app/lib/api";

const COLORS = {
  maroon: "#5C121B",
  maroonDark: "#3E0C13",
  gold: "#C89B3C",
  ivory: "#FBF7EF",
  ink: "#241416",
  sand: "#8A7458",
};

export default function InboxPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    setCurrentUser(JSON.parse(userStr));

    getConversations(token)
      .then(setConversations)
      .catch((err) => setError(err.message || "حصل خطأ"))
      .finally(() => setLoading(false));
  }, [router]);

  function otherPartyName(conv: Conversation): string {
    if (currentUser && conv.buyer_id === currentUser.id) {
      return conv.vendor?.store_name || "البائع";
    }
    return conv.buyer?.name || "المشتري";
  }

  return (
    <div dir="rtl" style={{ background: COLORS.ivory, minHeight: "100vh", fontFamily: "var(--font-tajawal)" }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/" className="text-sm font-bold mb-6 inline-block" style={{ color: COLORS.maroon }}>
          → رجوع للرئيسية
        </Link>

        <h1 className="text-2xl font-extrabold mb-6 text-right" style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}>
          الرسائل
        </h1>

        {loading ? (
          <p className="text-center py-16" style={{ color: COLORS.sand }}>
            جاري التحميل...
          </p>
        ) : error ? (
          <p className="text-center py-16" style={{ color: "#C0392B" }}>
            {error}
          </p>
        ) : conversations.length === 0 ? (
          <div className="text-center py-16">
            <p style={{ color: COLORS.sand }}>مفيش محادثات لسه</p>
            <Link
              href="/"
              className="inline-block mt-4 px-6 py-3 rounded-full font-extrabold"
              style={{ background: COLORS.maroon, color: COLORS.ivory, fontFamily: "var(--font-cairo)" }}
            >
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/inbox/${conv.id}`}
                className="flex items-center gap-4 rounded-2xl p-4 block"
                style={{ background: "white", boxShadow: "0 4px 16px rgba(92,18,27,0.08)" }}
              >
                <div
                  className="flex items-center justify-center text-2xl rounded-xl shrink-0"
                  style={{ width: 52, height: 52, background: `linear-gradient(160deg, ${COLORS.maroon}, ${COLORS.maroonDark})` }}
                >
                  {conv.product?.category?.icon || "💬"}
                </div>

                <div className="flex-1 text-right">
                  <div className="font-bold text-sm" style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}>
                    {otherPartyName(conv)}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: COLORS.sand }}>
                    {conv.product?.title}
                  </div>
                </div>

                <span style={{ color: COLORS.sand }}>←</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}