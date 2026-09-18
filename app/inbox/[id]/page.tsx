"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getConversations, getMessages, sendMessage, Conversation, AuthUser } from "@/app/lib/api";

const COLORS = {
  maroon: "#5C121B",
  maroonDark: "#3E0C13",
  gold: "#C89B3C",
  ivory: "#FBF7EF",
  ink: "#241416",
  sand: "#8A7458",
};

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = Number(params.id);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
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

    Promise.all([getConversations(token), getMessages(token, conversationId)])
      .then(([conversations, msgs]) => {
        const conv = conversations.find((c) => c.id === conversationId);
        if (!conv) {
          setError("المحادثة مش موجودة");
        } else {
          setConversation(conv);
          setMessages(msgs);
        }
      })
      .catch((err) => setError(err.message || "حصل خطأ"))
      .finally(() => setLoading(false));
  }, [conversationId, router]);

  async function handleSend() {
    const token = localStorage.getItem("token");
    if (!token || !newMessage.trim()) return;

    try {
      const message = await sendMessage(token, conversationId, newMessage.trim());
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    } catch (err: any) {
      setError(err.message || "فشل إرسال الرسالة");
    }
  }

  function otherPartyName(): string {
    if (!conversation || !currentUser) return "";
    if (conversation.buyer_id === currentUser.id) {
      return conversation.vendor?.store_name || "البائع";
    }
    return conversation.buyer?.name || "المشتري";
  }

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center" style={{ background: COLORS.ivory }}>
        <p style={{ color: COLORS.sand }}>جاري التحميل...</p>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center" style={{ background: COLORS.ivory }}>
        <p style={{ color: "#C0392B" }}>{error || "المحادثة مش موجودة"}</p>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ background: COLORS.ivory, minHeight: "100vh", fontFamily: "var(--font-tajawal)" }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/inbox" className="text-sm font-bold mb-6 inline-block" style={{ color: COLORS.maroon }}>
          → رجوع للرسائل
        </Link>

        <div className="rounded-2xl p-4 mb-4 text-right" style={{ background: "white", boxShadow: "0 4px 16px rgba(92,18,27,0.08)" }}>
          <div className="font-extrabold text-sm" style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}>
            {otherPartyName()}
          </div>
          <div className="text-xs mt-1" style={{ color: COLORS.sand }}>
            بخصوص: {conversation.product?.title}
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: "white", boxShadow: "0 4px 16px rgba(92,18,27,0.08)" }}>
          <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: COLORS.sand }}>
                ابدأ المحادثة بسؤالك الأول
              </p>
            ) : (
              messages.map((m) => {
                const isMine = currentUser && m.sender_id === currentUser.id;
                return (
                  <div
                    key={m.id}
                    className="max-w-[75%] px-4 py-2 rounded-2xl text-sm"
                    style={{
                      background: isMine ? COLORS.maroon : COLORS.ivory,
                      color: isMine ? COLORS.ivory : COLORS.ink,
                      marginRight: isMine ? 0 : "auto",
                      marginLeft: isMine ? "auto" : 0,
                    }}
                  >
                    <div
                      className="font-bold text-xs mb-0.5"
                      style={{ color: isMine ? COLORS.gold : COLORS.maroon }}
                    >
                      {m.sender?.name}
                    </div>
                    {m.body}
                  </div>
                );
              })
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="اكتب رسالتك..."
              className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none"
              style={{ border: "1px solid #E5D8BE" }}
            />
            <button
              onClick={handleSend}
              className="px-5 py-2.5 rounded-full font-bold text-sm"
              style={{ background: COLORS.maroon, color: COLORS.ivory }}
            >
              إرسال
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}