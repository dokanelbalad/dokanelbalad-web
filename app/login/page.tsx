"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/app/lib/api";

const COLORS = {
  maroon: "#5C121B",
  maroonDark: "#3E0C13",
  gold: "#C89B3C",
  ivory: "#FBF7EF",
  ink: "#241416",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user, token } = await loginUser({ email, password });
            localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      router.push(user.role === "admin" ? "/admin" : "/");
    } catch (err: any) {
      setError(err.message || "حصل خطأ، حاول تاني");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: COLORS.ivory, fontFamily: "var(--font-tajawal)" }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-8"
        style={{ background: "white", boxShadow: "0 8px 30px rgba(92,18,27,0.12)" }}
      >
        <h1
          className="text-2xl font-extrabold mb-1 text-right"
          style={{ color: COLORS.maroon, fontFamily: "var(--font-cairo)" }}
        >
          تسجيل الدخول
        </h1>
        <p className="text-sm mb-6 text-right" style={{ color: "#8A7458" }}>
          أهلاً بيك تاني في دكان البلد
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: COLORS.ink }}>
              البريد الإلكتروني
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ border: "1px solid #E5D8BE" }}
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: COLORS.ink }}>
              كلمة المرور
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ border: "1px solid #E5D8BE" }}
              dir="ltr"
            />
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
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>

        <p className="text-sm text-center mt-5" style={{ color: "#8A7458" }}>
          مفيش حساب؟{" "}
          <a href="/register" className="font-bold" style={{ color: COLORS.maroon }}>
            سجل دلوقتي
          </a>
        </p>
      </div>
    </div>
  );
}
