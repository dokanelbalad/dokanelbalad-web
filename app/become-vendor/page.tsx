"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendOtp, verifyOtp, registerUser, registerVendor } from "@/app/lib/api";

const COLORS = {
  maroon: "#5C121B",
  maroonDark: "#3E0C13",
  gold: "#C89B3C",
  ivory: "#FBF7EF",
  ink: "#241416",
  sand: "#8A7458",
};

const entityTypes = [
  { value: "individual", label: "فرد" },
  { value: "retail_shop", label: "محل / بائع قطاعي" },
  { value: "wholesale", label: "بائع جملة" },
  { value: "company", label: "شركة / مورد" },
];

const steps = ["البريد الإلكتروني", "رمز التحقق", "بيانات الحساب", "مستوى التوثيق", "المستندات", "العنوان", "المراجعة"];

export default function BecomeVendorWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // step 0-1: email + otp
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  // step 2: account info
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [entityType, setEntityType] = useState<"individual" | "retail_shop" | "wholesale" | "company">("individual");

  // step 3: verification tier
  const [tier, setTier] = useState<"basic" | "verified">("basic");

  // step 4: documents
  const [nationalIdNumber, setNationalIdNumber] = useState("");
  const [nationalIdFront, setNationalIdFront] = useState<File | null>(null);
  const [nationalIdBack, setNationalIdBack] = useState<File | null>(null);
  const [commercialRegisterNo, setCommercialRegisterNo] = useState("");
  const [commercialRegisterImage, setCommercialRegisterImage] = useState<File | null>(null);
  const [isVatRegistered, setIsVatRegistered] = useState(false);
  const [taxNumber, setTaxNumber] = useState("");

  // step 5: address
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");

  const [success, setSuccess] = useState(false);

  function next() {
    setError("");
    setStep((s) => s + 1);
  }
  function back() {
    setError("");
    setStep((s) => s - 1);
  }

  async function handleSendOtp() {
    setError("");
    if (!email.trim()) {
      setError("اكتب بريدك الإلكتروني");
      return;
    }
    setLoading(true);
    try {
      await sendOtp(email.trim());
      next();
    } catch (err: any) {
      setError(err.message || "حصل خطأ");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setError("");
    if (otpCode.trim().length !== 6) {
      setError("اكتب الرمز المكوّن من ٦ أرقام");
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(email.trim(), otpCode.trim());
      next();
    } catch (err: any) {
      setError(err.message || "حصل خطأ");
    } finally {
      setLoading(false);
    }
  }

  function validateAccountInfo() {
    if (!name.trim() || !phone.trim() || password.length < 8 || !storeName.trim()) {
      setError("املا كل الحقول المطلوبة (كلمة المرور ٨ أحرف على الأقل)");
      return false;
    }
    return true;
  }

  function validateDocuments() {
    if (tier === "basic") {
      if (!nationalIdNumber.trim() || !nationalIdFront || !nationalIdBack) {
        setError("اكتب الرقم القومي وارفع صورتي البطاقة");
        return false;
      }
    } else {
      if (!commercialRegisterNo.trim() || !commercialRegisterImage) {
        setError("اكتب رقم السجل التجاري وارفع صورته");
        return false;
      }
    }
    if (isVatRegistered && !taxNumber.trim()) {
      setError("اكتب الرقم الضريبي");
      return false;
    }
    return true;
  }

  function validateAddress() {
    if (!addressLine1.trim() || !city.trim()) {
      setError("اكتب العنوان والمدينة");
      return false;
    }
    return true;
  }

  async function handleFinalSubmit() {
    setError("");
    setLoading(true);
    try {
      // 1) create the buyer account
      const authRes = await registerUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        password_confirmation: password,
      });

      // 2) submit vendor application
      const formData = new FormData();
      formData.append("store_name", storeName.trim());
      if (storeDescription.trim()) formData.append("store_description", storeDescription.trim());
      formData.append("entity_type", entityType);
      formData.append("verification_tier", tier);
      formData.append("address_line1", addressLine1.trim());
      if (addressLine2.trim()) formData.append("address_line2", addressLine2.trim());
      formData.append("city", city.trim());

      if (tier === "basic") {
        formData.append("national_id_number", nationalIdNumber.trim());
        if (nationalIdFront) formData.append("national_id_front_image", nationalIdFront);
        if (nationalIdBack) formData.append("national_id_back_image", nationalIdBack);
      } else {
        formData.append("commercial_register_no", commercialRegisterNo.trim());
        if (commercialRegisterImage) formData.append("commercial_register_image", commercialRegisterImage);
      }

      formData.append("is_vat_registered", isVatRegistered ? "1" : "0");
      if (isVatRegistered) formData.append("tax_registration_number", taxNumber.trim());

      await registerVendor(authRes.token, formData);

      localStorage.setItem("token", authRes.token);
      localStorage.setItem("user", JSON.stringify(authRes.user));

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "حصل خطأ، حاول تاني");
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
            تم إنشاء حسابك وإرسال طلبك بنجاح
          </h1>
          <p className="text-sm" style={{ color: COLORS.sand, fontFamily: "var(--font-tajawal)" }}>
            هيتم مراجعة طلبك من فريق دكان البلد، وهتوصلك رسالة بمجرد الموافقة عشان تبدأ تضيف منتجاتك.
          </p>
          <a
            href="/"
            className="inline-block mt-4 px-6 py-3 rounded-full font-extrabold"
            style={{ background: COLORS.maroon, color: COLORS.ivory, fontFamily: "var(--font-cairo)" }}
          >
            العودة للرئيسية
          </a>
        </div>
      </div>
    );
  }

  const inputStyle = { border: "1px solid #E5D8BE" };
  const labelClass = "block text-sm font-bold mb-1";

  return (
    <div dir="rtl" className="min-h-screen px-4 py-10" style={{ background: COLORS.ivory, fontFamily: "var(--font-tajawal)" }}>
      <div className="max-w-lg mx-auto rounded-3xl p-8" style={{ background: "white", boxShadow: "0 8px 30px rgba(92,18,27,0.12)" }}>
        <h1 className="text-2xl font-extrabold mb-1 text-right" style={{ color: COLORS.maroon, fontFamily: "var(--font-cairo)" }}>
          سجّل كبائع في دكان البلد
        </h1>
        <p className="text-xs mb-5 text-right" style={{ color: COLORS.sand }}>
          خطوة {step + 1} من {steps.length}: {steps[step]}
        </p>

        {/* progress bar */}
        <div className="flex gap-1 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1.5 rounded-full"
              style={{ background: i <= step ? COLORS.maroon : "#E5D8BE" }}
            />
          ))}
        </div>

        <div className="text-right space-y-4">
          {/* Step 0: email */}
          {step === 0 && (
            <div>
              <label className={labelClass} style={{ color: COLORS.ink }}>
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                style={inputStyle}
                dir="ltr"
              />
              <p className="text-xs mt-2" style={{ color: COLORS.sand }}>
                هنبعتلك رمز تحقق مكوّن من ٦ أرقام
              </p>
            </div>
          )}

          {/* Step 1: otp */}
          {step === 1 && (
            <div>
              <label className={labelClass} style={{ color: COLORS.ink }}>
                رمز التحقق
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none text-center tracking-widest"
                style={inputStyle}
                dir="ltr"
              />
              <p className="text-xs mt-2" style={{ color: COLORS.sand }}>
                اتبعت رمز التحقق على {email}
              </p>
            </div>
          )}

          {/* Step 2: account info */}
          {step === 2 && (
            <>
              <div>
                <label className={labelClass} style={{ color: COLORS.ink }}>
                  الاسم بالكامل
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelClass} style={{ color: COLORS.ink }}>
                  رقم الموبايل
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={inputStyle}
                  dir="ltr"
                />
              </div>
              <div>
                <label className={labelClass} style={{ color: COLORS.ink }}>
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={inputStyle}
                  dir="ltr"
                />
              </div>
              <div>
                <label className={labelClass} style={{ color: COLORS.ink }}>
                  اسم المحل / النشاط
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelClass} style={{ color: COLORS.ink }}>
                  وصف مختصر (اختياري)
                </label>
                <textarea
                  rows={2}
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelClass} style={{ color: COLORS.ink }}>
                  نوع النشاط
                </label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value as any)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={inputStyle}
                >
                  {entityTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Step 3: verification tier */}
          {step === 3 && (
            <div className="space-y-2">
              <label className="flex items-start gap-2 cursor-pointer rounded-xl p-3" style={{ border: `1px solid ${tier === "basic" ? COLORS.maroon : "#E5D8BE"}` }}>
                <input type="radio" checked={tier === "basic"} onChange={() => setTier("basic")} className="mt-1" />
                <div>
                  <div className="text-sm font-bold" style={{ color: COLORS.ink }}>
                    تحقق أساسي (رقم قومي)
                  </div>
                  <div className="text-xs" style={{ color: COLORS.sand }}>
                    عمولة 10% — حد أقصى 25,000 ج.م للطلب
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-2 cursor-pointer rounded-xl p-3" style={{ border: `1px solid ${tier === "verified" ? COLORS.maroon : "#E5D8BE"}` }}>
                <input type="radio" checked={tier === "verified"} onChange={() => setTier("verified")} className="mt-1" />
                <div>
                  <div className="text-sm font-bold" style={{ color: COLORS.ink }}>
                    تحقق موثّق (سجل تجاري) ✓
                  </div>
                  <div className="text-xs" style={{ color: COLORS.sand }}>
                    عمولة 5% — بدون حد أقصى + شارة "موثّق"
                  </div>
                </div>
              </label>
            </div>
          )}

          {/* Step 4: documents */}
          {step === 4 && (
            <>
              {tier === "basic" ? (
                <>
                  <div>
                    <label className={labelClass} style={{ color: COLORS.ink }}>
                      الرقم القومي
                    </label>
                    <input
                      type="text"
                      maxLength={14}
                      value={nationalIdNumber}
                      onChange={(e) => setNationalIdNumber(e.target.value)}
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                      style={inputStyle}
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className={labelClass} style={{ color: COLORS.ink }}>
                      صورة البطاقة (الوجه الأمامي)
                    </label>
                    <input type="file" accept="image/*" onChange={(e) => setNationalIdFront(e.target.files?.[0] || null)} className="w-full text-sm" />
                  </div>
                  <div>
                    <label className={labelClass} style={{ color: COLORS.ink }}>
                      صورة البطاقة (الوجه الخلفي)
                    </label>
                    <input type="file" accept="image/*" onChange={(e) => setNationalIdBack(e.target.files?.[0] || null)} className="w-full text-sm" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className={labelClass} style={{ color: COLORS.ink }}>
                      رقم السجل التجاري
                    </label>
                    <input
                      type="text"
                      value={commercialRegisterNo}
                      onChange={(e) => setCommercialRegisterNo(e.target.value)}
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                      style={inputStyle}
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className={labelClass} style={{ color: COLORS.ink }}>
                      صورة السجل التجاري
                    </label>
                    <input type="file" accept="image/*" onChange={(e) => setCommercialRegisterImage(e.target.files?.[0] || null)} className="w-full text-sm" />
                  </div>
                </>
              )}

              <div className="rounded-xl p-4" style={{ background: COLORS.ivory, border: "1px solid #E5D8BE" }}>
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="checkbox" checked={isVatRegistered} onChange={(e) => setIsVatRegistered(e.target.checked)} />
                  <span className="text-sm font-bold" style={{ color: COLORS.ink }}>
                    مسجل في ضريبة القيمة المضافة
                  </span>
                </label>
                {isVatRegistered && (
                  <input
                    type="text"
                    placeholder="الرقم الضريبي"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    className="w-full rounded-xl px-4 py-2 text-sm outline-none"
                    style={{ ...inputStyle, background: "white" }}
                    dir="ltr"
                  />
                )}
              </div>
            </>
          )}

          {/* Step 5: address */}
          {step === 5 && (
            <>
              <div>
                <label className={labelClass} style={{ color: COLORS.ink }}>
                  العنوان بالتفصيل
                </label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="اسم الشارع، رقم العمارة..."
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelClass} style={{ color: COLORS.ink }}>
                  تفاصيل إضافية (اختياري)
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="علامة مميزة، رقم دور..."
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelClass} style={{ color: COLORS.ink }}>
                  المدينة / المحافظة
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
            </>
          )}

          {/* Step 6: review */}
          {step === 6 && (
            <div className="space-y-2 text-sm">
              <div className="rounded-xl p-4" style={{ background: COLORS.ivory }}>
                <div><strong>الاسم:</strong> {name}</div>
                <div><strong>البريد:</strong> {email}</div>
                <div><strong>الموبايل:</strong> {phone}</div>
                <div><strong>المحل:</strong> {storeName}</div>
                <div><strong>النشاط:</strong> {entityTypes.find((t) => t.value === entityType)?.label}</div>
                <div><strong>مستوى التوثيق:</strong> {tier === "basic" ? "أساسي" : "موثّق"}</div>
                <div><strong>العنوان:</strong> {addressLine1}, {city}</div>
              </div>
              <p className="text-xs" style={{ color: COLORS.sand }}>
                بالضغط على "إرسال الطلب"، هيتعمل حسابك وهيتبعت طلب بائع لمراجعة فريق دكان البلد.
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm font-bold" style={{ color: "#C0392B" }}>
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            {step > 0 && (
              <button
                type="button"
                onClick={back}
                disabled={loading}
                className="flex-1 py-3 rounded-full font-extrabold"
                style={{ border: `2px solid ${COLORS.maroon}`, color: COLORS.maroon, fontFamily: "var(--font-cairo)" }}
              >
                السابق
              </button>
            )}

            {step === 0 && (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="flex-1 py-3 rounded-full font-extrabold"
                style={{ background: COLORS.maroon, color: COLORS.ivory, fontFamily: "var(--font-cairo)", opacity: loading ? 0.6 : 1 }}
              >
                {loading ? "جاري الإرسال..." : "إرسال الرمز"}
              </button>
            )}

            {step === 1 && (
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={loading}
                className="flex-1 py-3 rounded-full font-extrabold"
                style={{ background: COLORS.maroon, color: COLORS.ivory, fontFamily: "var(--font-cairo)", opacity: loading ? 0.6 : 1 }}
              >
                {loading ? "جاري التحقق..." : "تحقق"}
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={() => validateAccountInfo() && next()}
                className="flex-1 py-3 rounded-full font-extrabold"
                style={{ background: COLORS.maroon, color: COLORS.ivory, fontFamily: "var(--font-cairo)" }}
              >
                التالي
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={next}
                className="flex-1 py-3 rounded-full font-extrabold"
                style={{ background: COLORS.maroon, color: COLORS.ivory, fontFamily: "var(--font-cairo)" }}
              >
                التالي
              </button>
            )}

            {step === 4 && (
              <button
                type="button"
                onClick={() => validateDocuments() && next()}
                className="flex-1 py-3 rounded-full font-extrabold"
                style={{ background: COLORS.maroon, color: COLORS.ivory, fontFamily: "var(--font-cairo)" }}
              >
                التالي
              </button>
            )}

            {step === 5 && (
              <button
                type="button"
                onClick={() => validateAddress() && next()}
                className="flex-1 py-3 rounded-full font-extrabold"
                style={{ background: COLORS.maroon, color: COLORS.ivory, fontFamily: "var(--font-cairo)" }}
              >
                التالي
              </button>
            )}

            {step === 6 && (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading}
                className="flex-1 py-3 rounded-full font-extrabold"
                style={{ background: COLORS.maroon, color: COLORS.ivory, fontFamily: "var(--font-cairo)", opacity: loading ? 0.6 : 1 }}
              >
                {loading ? "جاري الإرسال..." : "إرسال الطلب"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
