"use client";

import { useState } from "react";
import { forgotPassword, resetPassword } from "@/app/lib/api";

const COLORS = {
  maroon: "#5C121B",
  maroonDark: "#3E0C13",
  gold: "#C89B3C",
  ivory: "#FBF7EF",
  ink: "#241416",
  sand: "#8A7458",
};

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setStep(2);
    } catch (err: any) {
      setError(err.message || "حصل خطأ");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("كلمة المرور لازم تكون ٨ أحرف على الأقل");
      return;
    }
    if (password !== passwordConfirmation) {
      setError("كلمة المرور وتأكيدها مش متطابقين");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({
        email: email.trim(),
        code: code.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "حصل خطأ");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center px-4" style={{ background: COLORS.ivory }}>
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">✅</div>
          <h1 className="text-2xl font-extrabold" style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}>
            تم تغيير كلمة المرور بنجاح
          </h1>
          <a
            href="/login"
            className="inline-block mt-4 px-6 py-3 rounded-full font-extrabold"
            style={{ background: COLORS.maroon, color: COLORS.ivory, fontFamily: "var(--font-cairo)" }}
          >
            تسجيل الدخول
          </a>
        </div>
      </div>
    );
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
          استعادة كلمة المرور
        </h1>
        <p className="text-sm mb-6 text-right" style={{ color: COLORS.sand }}>
          {step === 1 ? "اكتب بريدك الإلكتروني وهنبعتلك رمز تحقق" : `اكتب الرمز اللي وصلك على ${email}`}
        </p>

        {step === 1 ? (
          <form onSubmit={handleSendCode} className="space-y-4 text-right">
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

            {error && (
              <p className="text-sm font-bold" style={{ color: "#C0392B" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full font-extrabold"
              style={{ background: COLORS.maroon, color: COLORS.ivory, fontFamily: "var(--font-cairo)", opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4 text-right">
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: COLORS.ink }}>
                رمز التحقق
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none text-center tracking-widest"
                style={{ border: "1px solid #E5D8BE" }}
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: COLORS.ink }}>
                كلمة المرور الجديدة
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

            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: COLORS.ink }}>
                تأكيد كلمة المرور
              </label>
              <input
                type="password"
                required
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
              style={{ background: COLORS.maroon, color: COLORS.ivory, fontFamily: "var(--font-cairo)", opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "جاري الحفظ..." : "تغيير كلمة المرور"}
            </button>
          </form>
        )}

        <p className="text-sm text-center mt-5" style={{ color: COLORS.sand }}>
          <a href="/login" className="font-bold" style={{ color: COLORS.maroon }}>
            رجوع لتسجيل الدخول
          </a>
        </p>
      </div>
    </div>
  );
}
