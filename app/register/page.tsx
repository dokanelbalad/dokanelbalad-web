"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/lib/api";

const COLORS = {
  maroon: "#5C121B",
  maroonDark: "#3E0C13",
  gold: "#C89B3C",
  ivory: "#FBF7EF",
  ink: "#241416",
};

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirmation) {
      setError("كلمة المرور وتأكيدها مش متطابقين");
      return;
    }

    setLoading(true);
    try {
      const { user, token } = await registerUser({
        name,
        email,
        phone,
        password,
        password_confirmation: passwordConfirmation,
      });
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      router.push("/");
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
        className="w-full max-w-md rounded-3xl p-8"
        style={{ background: "white", boxShadow: "0 8px 30px rgba(92,18,27,0.12)" }}
      >
        <h1
          className="text-2xl font-extrabold mb-1 text-right"
          style={{ color: COLORS.maroon, fontFamily: "var(--font-cairo)" }}
        >
          إنشاء حساب جديد
        </h1>
        <p className="text-sm mb-6 text-right" style={{ color: "#8A7458" }}>
          انضم لدكان البلد في أقل من دقيقة
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: COLORS.ink }}>
              الاسم بالكامل
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ border: "1px solid #E5D8BE" }}
            />
          </div>

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
              رقم الموبايل
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ border: "1px solid #E5D8BE" }}
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: COLORS.ink }}>
              تأكيد كلمة المرور
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
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
            {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
          </button>
        </form>

        <p className="text-sm text-center mt-5" style={{ color: "#8A7458" }}>
          عندك حساب بالفعل؟{" "}
          <a href="/login" className="font-bold" style={{ color: COLORS.maroon }}>
            سجل دخولك
          </a>
        </p>
      </div>
    </div>
  );
}