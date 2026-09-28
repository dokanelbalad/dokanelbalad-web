"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Brand } from "@/app/lib/brands";

const COLORS = {
  green: "#0E5D45",
  sage: "#EBF2F0",
  ink: "#1A1A1A",
  muted: "#6B7A75",
  line: "#EDE7DC",
};

const COLLAPSED_COUNT = 9;

function BrandTile({
  brand,
  active,
  href,
  hiddenOnDesktop,
}: {
  brand: Brand;
  active: boolean;
  href: string;
  hiddenOnDesktop: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // لو الصورة فشلت قبل ما React يشتغل، نلحقها هنا
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);

  return (
    <Link
      href={href}
      scroll={false}
      className={`shrink-0 w-24 md:w-auto rounded-xl flex items-center justify-center text-center ${
        hiddenOnDesktop ? "md:hidden" : ""
      }`}
      style={{
        height: 76,
        background: active ? COLORS.sage : "white",
        border: `2px solid ${active ? COLORS.green : COLORS.line}`,
        padding: 6,
      }}
      title={brand.ar}
    >
      {failed ? (
        <span className="flex flex-col leading-tight">
          <span
            className="text-sm font-extrabold"
            style={{ color: COLORS.green, fontFamily: "var(--font-cairo)" }}
          >
            {brand.ar}
          </span>
          <span className="text-[10px]" style={{ color: COLORS.muted }}>
            {brand.en}
          </span>
        </span>
      ) : (
        <img
          ref={imgRef}
          src={`/brands/${brand.slug}.svg`}
          alt={brand.ar}
          onError={() => setFailed(true)}
          style={{ maxHeight: 48, maxWidth: "100%", objectFit: "contain" }}
        />
      )}
    </Link>
  );
}

export default function BrandsPanel({
  brands,
  activeSlug,
}: {
  brands: Brand[];
  activeSlug?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const sp = useSearchParams();

  const hrefFor = (slug: string) => {
    const params = new URLSearchParams(sp.toString()); // نحافظ على الفئة والمنطقة والبحث
    if (activeSlug === slug) params.delete("brand"); // الضغط تاني على نفس الماركة يلغي الفلتر
    else params.set("brand", slug);
    const qs = params.toString();
    return `/${qs ? `?${qs}` : ""}#products`;
  };

  return (
    <aside className="md:w-72 lg:w-80 shrink-0">
      <h3
        className="text-base font-extrabold mb-3 text-right"
        style={{ color: COLORS.ink, fontFamily: "var(--font-cairo)" }}
      >
        ماركات السيارات
      </h3>

      {/* موبايل: صف أفقي بيتسحب | ديسكتوب: شبكة 3 أعمدة */}
      <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 md:grid md:grid-cols-3 md:gap-3 [scrollbar-width:thin] [scrollbar-color:#0E5D45_#EBF2F0]">
        {brands.map((b, i) => (
          <BrandTile
            key={b.slug}
            brand={b}
            active={activeSlug === b.slug}
            href={hrefFor(b.slug)}
            hiddenOnDesktop={!expanded && i >= COLLAPSED_COUNT}
          />
        ))}
      </div>

      {brands.length > COLLAPSED_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="hidden md:block w-full mt-3 py-2.5 rounded-xl text-sm font-bold"
          style={{
            background: "white",
            color: COLORS.green,
            border: `1.5px solid ${COLORS.green}`,
            fontFamily: "var(--font-tajawal)",
          }}
        >
          {expanded ? "عرض أقل ⌃" : "عرض المزيد ⌄"}
        </button>
      )}
    </aside>
  );
}
