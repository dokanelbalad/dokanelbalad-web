"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProduct, startConversation, getMessages, sendMessage, Product } from "@/app/lib/api";
import { useCart } from "@/app/context/CartContext";

const COLORS = {
  maroon: "#5C121B",
  maroonDark: "#3E0C13",
  gold: "#C89B3C",
  ivory: "#FBF7EF",
  ink: "#241416",
  sand: "#8A7458",
};

const conditionLabel: Record<string, string> = {
  new: "جديد",
  used: "مستعمل",
  like_new: "كالجديد",
};

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  useEffect(() => {
    getProduct(productId)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [productId]);

  async function handleOpenChat() {
    setChatError("");
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setChatOpen(true);
    setChatLoading(true);
    try {
      const conversation = await startConversation(token, productId);
      setConversationId(conversation.id);
      const msgs = await getMessages(token, conversation.id);
      setMessages(msgs);
    } catch (err: any) {
      setChatError(err.message || "حصل خطأ");
    } finally {
      setChatLoading(false);
    }
  }

  async function handleSend() {
    const token = localStorage.getItem("token");
    if (!token || !conversationId || !newMessage.trim()) return;

    try {
      const message = await sendMessage(token, conversationId, newMessage.trim());
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    } catch (err: any) {
      setChatError(err.message || "فشل إرسال الرسالة");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.ivory }}>
        <p style={{ color: COLORS.maroon, fontFamily: "var(--font-tajawal)" }}>جاري التحميل...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.ivory }}>
        <p style={{ color: "#C0392B", fontFamily: "var(--font-tajawal)" }}>المنتج مش موجود</p>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ background: COLORS.ivory, minHeight: "100vh", fontFamily: "var(--font-tajawal)" }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push("/")}
          className="text-sm font-bold mb-6"
          style={{ color: COLORS.maroon }}
        >
          → رجوع للرئيسية
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          <div
            className="rounded-3xl flex items-center justify-center text-9xl relative"
            style={{ height: 340, background: `linear-gradient(160deg, ${COLORS.maroon}, ${COLORS.maroonDark})` }}
          >
            {Number(product.discount_percentage) > 0 && (
              <span
                className="absolute top-3 right-3 px-2.5 py-1.5 rounded-lg text-sm font-bold"
                style={{ background: "#C0392B", color: "white" }}
              >
                خصم {Number(product.discount_percentage)}%
              </span>
            )}
            {product.category?.icon || "📦"}
          </div>

          <div className="text-right space-y-4">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: "#F5E8C8", color: COLORS.maroonDark }}
            >
              {conditionLabel[product.condition]}
            </span>

            <h1 className="text-2xl font-extrabold" style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}>
              {product.title}
            </h1>

            {Number(product.discount_percentage) > 0 ? (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-3xl font-extrabold" style={{ color: COLORS.maroon, fontFamily: "var(--font-cairo)" }}>
                  {Number(product.total_display_price).toLocaleString()} ج.م
                </span>
                <span className="text-base line-through" style={{ color: COLORS.sand }}>
                  {Number(product.price).toLocaleString()} ج.م
                </span>
              </div>
            ) : (
              <div className="text-3xl font-extrabold" style={{ color: COLORS.maroon, fontFamily: "var(--font-cairo)" }}>
                {Number(product.total_display_price).toLocaleString()} ج.م
              </div>
            )}
            {product.display_shipping_fee > 0 && (
              <div className="text-xs" style={{ color: COLORS.sand }}>
                شامل {Number(product.display_shipping_fee).toLocaleString()} ج.م رسوم شحن
              </div>
            )}

            <div className="rounded-2xl p-4" style={{ background: "white" }}>
              <div className="font-bold" style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}>
                {product.vendor?.store_name}
              </div>
              <div className="text-xs mt-1" style={{ color: COLORS.sand }}>
                {product.governorate}
              </div>
            </div>

            <p className="text-sm leading-relaxed" style={{ color: "#5A4A3A" }}>
              {product.description}
            </p>
            <button
              onClick={() => {
                addToCart(product);
                setAddedToCart(true);
                setTimeout(() => setAddedToCart(false), 2000);
              }}
              className="w-full py-3 rounded-full font-extrabold"
              style={{ background: COLORS.maroon, color: COLORS.ivory, fontFamily: "var(--font-cairo)" }}
            >
              {addedToCart ? "✓ تمت الإضافة للسلة" : "أضف للسلة"}
            </button>
            <button
              onClick={handleOpenChat}
              className="w-full py-3 rounded-full font-extrabold"
              style={{ border: `2px solid ${COLORS.maroon}`, color: COLORS.maroon, fontFamily: "var(--font-cairo)" }}
            >
              راسل البائع
            </button>
          </div>
        </div>

        {chatOpen && (
          <div className="mt-10 rounded-3xl p-5" style={{ background: "white", boxShadow: "0 4px 16px rgba(92,18,27,0.08)" }}>
            <h2 className="font-extrabold mb-4 text-right" style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}>
              المحادثة مع {product.vendor?.store_name}
            </h2>

            {chatError && (
              <p className="text-sm font-bold mb-3 text-right" style={{ color: "#C0392B" }}>
                {chatError}
              </p>
            )}

            {chatLoading ? (
              <p className="text-sm text-center py-6" style={{ color: COLORS.sand }}>
                جاري التحميل...
              </p>
            ) : (
              <>
                <div className="space-y-2 mb-4 max-h-72 overflow-y-auto">
                  {messages.length === 0 ? (
                    <p className="text-sm text-center py-6" style={{ color: COLORS.sand }}>
                      ابدأ المحادثة بسؤالك الأول
                    </p>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className="max-w-[75%] px-4 py-2 rounded-2xl text-sm"
                        style={{
                          background: COLORS.ivory,
                          marginRight: "auto",
                          marginLeft: 0,
                          color: COLORS.ink,
                        }}
                      >
                        <div className="font-bold text-xs mb-0.5" style={{ color: COLORS.maroon }}>
                          {m.sender?.name}
                        </div>
                        {m.body}
                      </div>
                    ))
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
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
