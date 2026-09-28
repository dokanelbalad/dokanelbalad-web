import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/app/Header";
import { CONTACT, LAST_UPDATE, POLICIES, getPolicy } from "@/app/lib/policies";

const COLORS = {
  green: "#0E5D45",
  orange: "#EA730D",
  cream: "#FEFAF4",
  ink: "#1A1A1A",
  muted: "#6B7A75",
  line: "#E4DED2",
};

export function generateStaticParams() {
  return POLICIES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const policy = getPolicy(slug);
  return { title: policy ? `${policy.title} | دكان البلد` : "دكان البلد" };
}

export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) notFound();

  const hasContact = !!(CONTACT.email || CONTACT.whatsapp);

  return (
    <div style={{ background: COLORS.cream, minHeight: "100vh" }}>
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-10 text-right">
        <Link
          href="/"
          className="text-xs font-bold"
          style={{ color: COLORS.green, fontFamily: "var(--font-tajawal)" }}
        >
          → رجوع للرئيسية
        </Link>

        <h1
          className="text-2xl md:text-3xl font-extrabold mt-4 mb-3"
          style={{ color: COLORS.green, fontFamily: "var(--font-cairo)" }}
        >
          {policy.title}
        </h1>

        {policy.intro && (
          <p
            className="text-sm md:text-base leading-relaxed mb-6"
            style={{ color: COLORS.ink, fontFamily: "var(--font-tajawal)" }}
          >
            {policy.intro}
          </p>
        )}

        <div className="space-y-6">
          {policy.blocks.map((b, i) => (
            <section
              key={i}
              className="rounded-2xl p-5"
              style={{ background: "white", border: `1px solid ${COLORS.line}` }}
            >
              {b.h && (
                <h2
                  className="text-base font-extrabold mb-2"
                  style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}
                >
                  {b.h}
                </h2>
              )}
              {b.p?.map((t, j) => (
                <p
                  key={j}
                  className="text-sm leading-relaxed mb-2"
                  style={{ color: COLORS.ink, fontFamily: "var(--font-tajawal)" }}
                >
                  {t}
                </p>
              ))}
              {b.ul && (
                <ul className="space-y-2 pr-5 list-disc marker:text-[#EA730D]">
                  {b.ul.map((t, j) => (
                    <li
                      key={j}
                      className="text-sm leading-relaxed"
                      style={{ color: COLORS.ink, fontFamily: "var(--font-tajawal)" }}
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {policy.slug === "contact" && (
            <section
              className="rounded-2xl p-5 space-y-3"
              style={{ background: "white", border: `1px solid ${COLORS.line}` }}
            >
              {hasContact ? (
                <>
                  {CONTACT.email && (
                    <p className="text-sm" style={{ fontFamily: "var(--font-tajawal)" }}>
                      البريد الإلكتروني:{" "}
                      <a href={`mailto:${CONTACT.email}`} style={{ color: COLORS.green, fontWeight: 700 }}>
                        {CONTACT.email}
                      </a>
                    </p>
                  )}
                  {CONTACT.whatsapp && (
                    <p className="text-sm" style={{ fontFamily: "var(--font-tajawal)" }}>
                      واتساب:{" "}
                      <a
                        href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}`}
                        style={{ color: COLORS.green, fontWeight: 700 }}
                        dir="ltr"
                      >
                        {CONTACT.whatsapp}
                      </a>
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm" style={{ color: COLORS.muted, fontFamily: "var(--font-tajawal)" }}>
                  بيانات التواصل هتتضاف هنا قريباً. لحد وقتها تقدر تراسل البائع من صفحة المنتج.
                </p>
              )}
            </section>
          )}
        </div>

        <p
          className="text-xs mt-8"
          style={{ color: COLORS.muted, fontFamily: "var(--font-tajawal)" }}
        >
          آخر تحديث: {LAST_UPDATE}
        </p>
      </main>

    </div>
  );
}
