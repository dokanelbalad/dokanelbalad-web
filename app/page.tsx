import { getCategories, getProducts } from "@/app/lib/api";
import Header from "@/app/Header";
import Link from "next/link";
import BrandsPanel from "@/app/BrandsPanel";
import HomeToolbar from "@/app/HomeToolbar";
import { BRANDS } from "@/app/lib/brands";
import { normalizeAr } from "@/app/lib/governorates";

const COLORS = {
  green: "#0E5D45",
  greenDark: "#0B4A38",
  greenMid: "#246A55",
  sage: "#EBF2F0",
  orange: "#EA730D",
  orangeDark: "#C25E08",
  cream: "#FEFAF4",
  ink: "#1A1A1A",
  muted: "#6B7A75",
  line: "#EDE7DC",
};

// ترتيب الفئات في الشريط (اللي مش مذكورة هنا بتيجي في الآخر)
const CATEGORY_ORDER = [
  "cars-motorcycles",
  "auto-parts-oils",
  "home-appliances",
  "real-estate",
  "mobiles-tablets",
  "furniture",
  "clothes-shoes",
  "pets",
  "jobs-services",
  "other",
];

const conditionLabel: Record<string, string> = {
  new: "جديد",
  used: "مستعمل",
  like_new: "كالجديد",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    q?: string;
    gov?: string;
    sort?: string;
  }>;
}) {
  const { category, brand, q, gov, sort } = await searchParams;
  const [categories, products, dealsProducts] = await Promise.all([
    getCategories(),
    getProducts(category),
    getProducts(undefined, true),
  ]);

  const rank = (slug: string) => {
    const i = CATEGORY_ORDER.indexOf(slug);
    return i === -1 ? 999 : i;
  };
  const sortedCategories = [...categories].sort((a, b) => rank(a.slug) - rank(b.slug));

  // فلتر الماركة: بيدور على اسم الماركة في عنوان المنتج (لحد ما نضيف حقل ماركة في الباك إند)
  const activeBrand = BRANDS.find((b) => b.slug === brand);
  let filtered = activeBrand
    ? products.filter((p) => {
        const t = String(p.title ?? "").toLowerCase();
        return activeBrand.keywords.some((k) => t.includes(k.toLowerCase()));
      })
    : products;

  if (q) {
    const nq = normalizeAr(q);
    filtered = filtered.filter(
      (p) =>
        normalizeAr(String(p.title ?? "")).includes(nq) ||
        normalizeAr(String(p.vendor?.store_name ?? "")).includes(nq)
    );
  }
  if (gov) {
    const ng = normalizeAr(gov);
    filtered = filtered.filter((p) => normalizeAr(String(p.governorate ?? "")).includes(ng));
  }
  if (sort === "new") {
    filtered = [...filtered].sort((a, b) => Number(b.id) - Number(a.id));
  }
  const shownProducts = filtered;
  const hasFilters = !!(q || gov || activeBrand);

  // رابط إلغاء فلتر الماركة مع الحفاظ على باقي الفلاتر
  const clearBrandHref = (() => {
    const p = new URLSearchParams();
    if (category) p.set("category", category);
    if (q) p.set("q", q);
    if (gov) p.set("gov", gov);
    if (sort) p.set("sort", sort);
    const qs = p.toString();
    return `/${qs ? `?${qs}` : ""}#products`;
  })();

  return (
    <div style={{ background: COLORS.cream, minHeight: "100vh" }}>
      <Header />
      <HomeToolbar categories={sortedCategories} />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-8 pb-8 md:pt-10 md:pb-10">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-full md:w-1/2 opacity-20 md:opacity-100"
          style={{
            backgroundImage: "url(/hero.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            WebkitMaskImage: "linear-gradient(to right, black 45%, transparent 100%)",
            maskImage: "linear-gradient(to right, black 45%, transparent 100%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto text-right">
          <h1
            className="text-3xl md:text-5xl font-extrabold leading-tight mb-4"
            style={{ fontFamily: "var(--font-cairo)" }}
          >
            <span style={{ color: COLORS.green }}>بتدور على إيه؟</span>
            <br />
            <span style={{ color: COLORS.green }}>دكانك </span>
            <span style={{ color: COLORS.orange }}>قريب</span>
            <span style={{ color: COLORS.green }}> منك</span>
          </h1>
          <p
            className="text-sm md:text-base mb-6"
            style={{ color: COLORS.ink, fontFamily: "var(--font-tajawal)" }}
          >
            أي حاجه وكل حاجه، من محلات موثوقة قريبة منك
          </p>
          <a
            href="#products"
            className="inline-block px-7 py-3 rounded-full font-extrabold text-sm"
            style={{
              background: COLORS.orange,
              color: "white",
              fontFamily: "var(--font-cairo)",
            }}
          >
            شوف المنتجات
          </a>
        </div>
      </section>

      {/* Deals Carousel */}
      {dealsProducts.length > 0 && (
        <section
          className="px-4 py-8"
          style={{ background: `linear-gradient(135deg, ${COLORS.orange}, ${COLORS.orangeDark})` }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span
                className="px-3 py-1 rounded-full text-xs font-extrabold"
                style={{ background: "white", color: COLORS.orangeDark }}
              >
                لفترة محدودة
              </span>
              <h2
                className="text-xl font-extrabold text-right"
                style={{ color: "white", fontFamily: "var(--font-cairo)" }}
              >
                🔥 عروض وخصومات
              </h2>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollSnapType: "x mandatory" }}>
              {dealsProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.id}`}
                  className="rounded-2xl overflow-hidden shrink-0"
                  style={{ width: 190, background: "white", scrollSnapAlign: "start" }}
                >
                  <div
                    className="flex items-center justify-center text-5xl relative"
                    style={{
                      height: 120,
                      background: `linear-gradient(160deg, ${COLORS.greenMid}, ${COLORS.greenDark})`,
                    }}
                  >
                    <span
                      className="absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-bold"
                      style={{ background: COLORS.orange, color: "white" }}
                    >
                      خصم {Number(p.discount_percentage)}%
                    </span>
                    {p.category?.icon || "📦"}
                  </div>
                  <div className="p-3 space-y-1 text-right">
                    <h3
                      className="font-bold text-xs leading-snug line-clamp-2"
                      style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}
                    >
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className="font-extrabold text-sm"
                        style={{ color: COLORS.green, fontFamily: "var(--font-cairo)" }}
                      >
                        {Number(p.total_display_price).toLocaleString()} ج.م
                      </span>
                      <span className="text-xs line-through" style={{ color: COLORS.muted }}>
                        {Number(p.price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products + brands sidebar */}
      <section id="products" className="max-w-6xl mx-auto px-4 py-10 scroll-mt-20">
        <div className="flex flex-col md:flex-row gap-6">
          <BrandsPanel brands={BRANDS} activeSlug={activeBrand?.slug} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5 gap-3">
              {activeBrand ? (
                <Link
                  href={clearBrandHref}
                  scroll={false}
                  className="px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: COLORS.sage, color: COLORS.green }}
                >
                  ✕ {activeBrand.ar}
                </Link>
              ) : (
                <span />
              )}
              <h2
                className="text-xl font-extrabold text-right"
                style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}
              >
                منتجات متاحة الآن ({shownProducts.length})
              </h2>
            </div>

            {shownProducts.length === 0 ? (
              <p className="text-center py-10" style={{ color: COLORS.muted, fontFamily: "var(--font-tajawal)" }}>
                {hasFilters ? "مفيش نتايج مطابقة للفلاتر دي، جرّب تغيّر البحث أو المنطقة" : "مفيش منتجات لسه - أول منتج هيظهر هنا بمجرد ما يتضاف"}
              </p>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                {shownProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.id}`}
                    className="rounded-3xl overflow-hidden block"
                    style={{ background: "white", boxShadow: "0 4px 20px rgba(14,93,69,0.08)" }}
                  >
                    <div
                      className="flex items-center justify-center text-6xl relative"
                      style={{
                        height: 150,
                        background: `linear-gradient(160deg, ${COLORS.greenMid}, ${COLORS.greenDark})`,
                      }}
                    >
                      {Number(p.discount_percentage) > 0 && (
                        <span
                          className="absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-bold"
                          style={{ background: COLORS.orange, color: "white" }}
                        >
                          خصم {Number(p.discount_percentage)}%
                        </span>
                      )}
                      {p.category?.icon || "📦"}
                    </div>
                    <div className="p-4 space-y-2 text-right">
                      <span
                        className="inline-block px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{ background: COLORS.sage, color: COLORS.greenDark }}
                      >
                        {conditionLabel[p.condition]}
                      </span>
                      <h3
                        className="font-bold text-sm leading-snug"
                        style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}
                      >
                        {p.title}
                      </h3>
                      <div className="text-xs" style={{ color: COLORS.muted, fontFamily: "var(--font-tajawal)" }}>
                        {p.vendor?.store_name} · {p.governorate}
                      </div>

                      {Number(p.discount_percentage) > 0 ? (
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          <span
                            className="font-extrabold text-lg"
                            style={{ color: COLORS.green, fontFamily: "var(--font-cairo)" }}
                          >
                            {Number(p.total_display_price).toLocaleString()} ج.م
                          </span>
                          <span className="text-xs line-through" style={{ color: COLORS.muted }}>
                            {Number(p.price).toLocaleString()} ج.م
                          </span>
                        </div>
                      ) : (
                        <div
                          className="font-extrabold text-lg pt-1"
                          style={{ color: COLORS.green, fontFamily: "var(--font-cairo)" }}
                        >
                          {Number(p.total_display_price).toLocaleString()} ج.م
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
