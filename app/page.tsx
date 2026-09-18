import { getCategories, getProducts } from "@/app/lib/api";
import Header from "@/app/Header";
import Link from "next/link";

const conditionLabel: Record<string, string> = {
  new: "جديد",
  used: "مستعمل",
  like_new: "كالجديد",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [categories, products, dealsProducts] = await Promise.all([
    getCategories(),
    getProducts(category),
    getProducts(undefined, true),
  ]);

  return (
    <div style={{ background: "#FFFDF9", minHeight: "100vh" }}>
      <Header />

      {/* Hero */}
      <section
        className="px-4 py-14"
        style={{ background: "radial-gradient(circle at 30% 20%, #7A1E31, #3E0C13 70%)" }}
      >
        <div className="max-w-6xl mx-auto text-right">
          <h1
            className="text-3xl md:text-4xl font-extrabold mb-4"
            style={{ color: "#FBF7EF", fontFamily: "var(--font-cairo)" }}
          >
            قطع غيار وزيوت عربيتك، من محلات موثوقة قريبة منك
          </h1>
          <div className="flex flex-wrap gap-2 justify-end">
            <Link
              href="/"
              className="px-3.5 py-2 rounded-full text-xs font-bold"
              style={{
                background: !category ? "#E8C97A" : "rgba(255,255,255,0.08)",
                color: !category ? "#3E0C13" : "#FBF7EF",
                fontFamily: "var(--font-tajawal)",
                border: "1px solid rgba(232,201,122,0.25)",
              }}
            >
              الكل
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/?category=${c.slug}`}
                className="px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5"
                style={{
                  background: category === c.slug ? "#E8C97A" : "rgba(255,255,255,0.08)",
                  color: category === c.slug ? "#3E0C13" : "#FBF7EF",
                  fontFamily: "var(--font-tajawal)",
                  border: "1px solid rgba(232,201,122,0.25)",
                }}
              >
                {c.image_url ? (
                  <img src={c.image_url} alt={c.name_ar} className="w-4 h-4 rounded-full object-cover" />
                ) : (
                  c.icon
                )}
                {c.name_ar}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Deals Carousel */}
      {dealsProducts.length > 0 && (
        <section
          className="px-4 py-8"
          style={{ background: "linear-gradient(135deg, #C0392B, #8E1B1B)" }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span
                className="px-3 py-1 rounded-full text-xs font-extrabold"
                style={{ background: "#E8C97A", color: "#3E0C13" }}
              >
                لفترة محدودة
              </span>
              <h2
                className="text-xl font-extrabold text-right"
                style={{ color: "#FFF9EC", fontFamily: "var(--font-cairo)" }}
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
                    style={{ height: 120, background: "linear-gradient(160deg, #7A1E31, #3E0C13)" }}
                  >
                    <span
                      className="absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-bold"
                      style={{ background: "#E8C97A", color: "#3E0C13" }}
                    >
                      خصم {Number(p.discount_percentage)}%
                    </span>
                    {p.category?.icon || "📦"}
                  </div>
                  <div className="p-3 space-y-1 text-right">
                    <h3
                      className="font-bold text-xs leading-snug line-clamp-2"
                      style={{ color: "#241416", fontFamily: "var(--font-cairo)" }}
                    >
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-sm" style={{ color: "#5C121B", fontFamily: "var(--font-cairo)" }}>
                        {Number(p.total_display_price).toLocaleString()} ج.م
                      </span>
                      <span className="text-xs line-through" style={{ color: "#8A7458" }}>
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

      {/* Products */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2
          className="text-xl font-extrabold mb-5 text-right"
          style={{ color: "#241416", fontFamily: "var(--font-cairo)" }}
        >
          منتجات متاحة الآن ({products.length})
        </h2>

        {products.length === 0 ? (
          <p className="text-center py-10" style={{ color: "#8A7458", fontFamily: "var(--font-tajawal)" }}>
            مفيش منتجات لسه - أول منتج هيظهر هنا بمجرد ما يتضاف
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="rounded-3xl overflow-hidden block"
                style={{ background: "white", boxShadow: "0 4px 20px rgba(92,18,27,0.08)" }}
              >
                <div
                  className="flex items-center justify-center text-6xl relative"
                  style={{ height: 150, background: "linear-gradient(160deg, #7A1E31, #3E0C13)" }}
                >
                  {Number(p.discount_percentage) > 0 && (
                    <span
                      className="absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-bold"
                      style={{ background: "#C0392B", color: "white" }}
                    >
                      خصم {Number(p.discount_percentage)}%
                    </span>
                  )}
                  {p.category?.icon || "📦"}
                </div>
                <div className="p-4 space-y-2 text-right">
                  <span
                    className="inline-block px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{ background: "#F5E8C8", color: "#3E0C13" }}
                  >
                    {conditionLabel[p.condition]}
                  </span>
                  <h3
                    className="font-bold text-sm leading-snug"
                    style={{ color: "#241416", fontFamily: "var(--font-cairo)" }}
                  >
                    {p.title}
                  </h3>
                  <div className="text-xs" style={{ color: "#8A7458", fontFamily: "var(--font-tajawal)" }}>
                    {p.vendor?.store_name} · {p.governorate}
                  </div>

                  {Number(p.discount_percentage) > 0 ? (
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <span
                        className="font-extrabold text-lg"
                        style={{ color: "#5C121B", fontFamily: "var(--font-cairo)" }}
                      >
                        {Number(p.total_display_price).toLocaleString()} ج.م
                      </span>
                      <span className="text-xs line-through" style={{ color: "#8A7458" }}>
                        {Number(p.price).toLocaleString()} ج.م
                      </span>
                    </div>
                  ) : (
                    <div
                      className="font-extrabold text-lg pt-1"
                      style={{ color: "#5C121B", fontFamily: "var(--font-cairo)" }}
                    >
                      {Number(p.total_display_price).toLocaleString()} ج.م
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer
        className="text-center text-xs py-6"
        style={{ color: "#8A7458", fontFamily: "var(--font-tajawal)" }}
      >
        © 2026 دكان البلد — كل حاجة، من كل مكان
      </footer>
    </div>
  );
}
