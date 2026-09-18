"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAdminCategories, createCategory, updateCategory, deleteCategory, Category, AuthUser } from "@/app/lib/api";

const COLORS = {
  maroon: "#5C121B",
  maroonDark: "#3E0C13",
  gold: "#C89B3C",
  ivory: "#FBF7EF",
  ink: "#241416",
  sand: "#8A7458",
};

const ICON_SUGGESTIONS = ["🚗", "🛢️", "🔧", "🔋", "🛞", "🏍️", "👕", "📱", "💻", "🏠", "🍽️", "🧴", "📦", "🛠️", "⚙️"];

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  function loadCategories(token: string) {
    setLoading(true);
    getAdminCategories(token)
      .then(setCategories)
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
    loadCategories(token);
  }, [router]);

  function resetForm() {
    setEditingId(null);
    setNameAr("");
    setNameEn("");
    setSlug("");
    setIcon("");
    setImageFile(null);
    setImagePreview(null);
    setError("");
  }

  function startEdit(c: Category) {
    setEditingId(c.id);
    setNameAr(c.name_ar);
    setNameEn(c.name_en || "");
    setSlug(c.slug);
    setIcon(c.icon || "");
    setImageFile(null);
    setImagePreview(c.image_url || null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!nameAr.trim() || !slug.trim()) {
      setError("لازم تكتب الاسم بالعربي والـ slug");
      return;
    }

    const formData = new FormData();
    formData.append("name_ar", nameAr.trim());
    if (nameEn.trim()) formData.append("name_en", nameEn.trim());
    formData.append("slug", slug.trim());
    if (icon.trim()) formData.append("icon", icon.trim());
    if (imageFile) formData.append("image", imageFile);

    setSubmitting(true);
    try {
      if (editingId) {
        await updateCategory(token, editingId, formData);
      } else {
        await createCategory(token, formData);
      }
      resetForm();
      loadCategories(token);
    } catch (err: any) {
      setError(err.message || "فشلت العملية");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await deleteCategory(token, id);
      if (editingId === id) resetForm();
      loadCategories(token);
    } catch (err: any) {
      setError(err.message || "فشل حذف التصنيف");
    }
  }

  return (
    <div dir="rtl" style={{ background: COLORS.ivory, minHeight: "100vh", fontFamily: "var(--font-tajawal)" }}>
      <header className="px-4 py-4" style={{ background: `linear-gradient(90deg, ${COLORS.maroonDark}, ${COLORS.maroon})` }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-extrabold text-lg" style={{ color: COLORS.ivory, fontFamily: "var(--font-cairo)" }}>
            إدارة التصنيفات
          </span>
          <Link href="/admin" className="text-sm font-bold" style={{ color: COLORS.gold }}>
            → رجوع للوحة التحكم
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="rounded-2xl p-5 mb-8" style={{ background: "white", boxShadow: "0 4px 16px rgba(92,18,27,0.08)" }}>
          <div className="flex items-center justify-between mb-4">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-bold px-3 py-1.5 rounded-full"
                style={{ border: "1px solid #E5D8BE", color: COLORS.ink }}
              >
                إلغاء التعديل
              </button>
            )}
            <h2 className="font-extrabold text-sm text-right" style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}>
              {editingId ? "تعديل التصنيف" : "إضافة تصنيف جديد"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-right">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: COLORS.ink }}>
                  الاسم بالعربي
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مثال: ملابس"
                  className="w-full rounded-xl px-4 py-2 text-sm outline-none"
                  style={{ border: "1px solid #E5D8BE" }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: COLORS.ink }}>
                  الاسم بالإنجليزي (اختياري)
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="Clothes"
                  className="w-full rounded-xl px-4 py-2 text-sm outline-none"
                  style={{ border: "1px solid #E5D8BE" }}
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: COLORS.ink }}>
                Slug (بالإنجليزي، بدون مسافات)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="clothes"
                className="w-full rounded-xl px-4 py-2 text-sm outline-none"
                style={{ border: "1px solid #E5D8BE" }}
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: COLORS.ink }}>
                صورة التصنيف (اختياري، JPG/PNG)
              </label>
              <div className="flex items-center gap-3">
                {imagePreview && (
                  <img src={imagePreview} alt="preview" className="w-14 h-14 rounded-xl object-cover" style={{ border: "1px solid #E5D8BE" }} />
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="flex-1 text-sm" />
              </div>
              <div className="text-xs mt-1" style={{ color: COLORS.sand }}>
                لو رفعت صورة، هتظهر بدل الأيقونة تلقائيًا
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: COLORS.ink }}>
                أيقونة احتياطية (لو مفيش صورة)
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="👕"
                className="w-full rounded-xl px-4 py-2 text-sm outline-none"
                style={{ border: "1px solid #E5D8BE" }}
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {ICON_SUGGESTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className="w-8 h-8 rounded-lg text-sm flex items-center justify-center"
                    style={{ border: icon === emoji ? `2px solid ${COLORS.maroon}` : "1px solid #E5D8BE", background: "white" }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm font-bold" style={{ color: "#C0392B" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-full font-extrabold text-sm"
              style={{ background: COLORS.maroon, color: COLORS.ivory, fontFamily: "var(--font-cairo)", opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? "جاري الحفظ..." : editingId ? "حفظ التعديلات" : "إضافة التصنيف"}
            </button>
          </form>
        </div>

        <h2 className="font-extrabold text-sm mb-4 text-right" style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}>
          التصنيفات الحالية ({categories.length})
        </h2>

        {loading ? (
          <p className="text-center py-10" style={{ color: COLORS.sand }}>
            جاري التحميل...
          </p>
        ) : categories.length === 0 ? (
          <p className="text-center py-10" style={{ color: COLORS.sand }}>
            مفيش تصنيفات لسه
          </p>
        ) : (
          <div className="space-y-2">
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl p-3"
                style={{
                  background: "white",
                  boxShadow: "0 2px 10px rgba(92,18,27,0.06)",
                  border: editingId === c.id ? `2px solid ${COLORS.maroon}` : "none",
                }}
              >
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleDelete(c.id)} className="text-sm px-2" style={{ color: "#C0392B" }} aria-label="حذف">
                    🗑️
                  </button>
                  <button onClick={() => startEdit(c)} className="text-sm px-2" style={{ color: COLORS.maroon }} aria-label="تعديل">
                    ✏️
                  </button>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div className="text-right">
                    <span className="font-bold text-sm" style={{ color: COLORS.ink }}>
                      {!c.image_url && c.icon} {c.name_ar}
                    </span>
                    <span className="text-xs mr-2" style={{ color: COLORS.sand }}>
                      ({c.slug})
                    </span>
                  </div>
                  {c.image_url && <img src={c.image_url} alt={c.name_ar} className="w-10 h-10 rounded-lg object-cover" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}