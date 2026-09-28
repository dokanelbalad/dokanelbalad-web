import Link from "next/link";
import { FOOTER_GROUPS } from "@/app/lib/policies";

const COLORS = {
  green: "#0E5D45",
  ink: "#1A1A1A",
  muted: "#6B7A75",
  line: "#E4DED2",
};

export default function Footer() {
  return (
    <footer style={{ background: "white", borderTop: `1px solid ${COLORS.line}` }}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-right">
          {FOOTER_GROUPS.map((g) => (
            <div key={g.title}>
              <h4
                className="text-sm font-extrabold mb-3"
                style={{ color: COLORS.green, fontFamily: "var(--font-cairo)" }}
              >
                {g.title}
              </h4>
              <ul className="space-y-2">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-xs hover:underline"
                      style={{ color: COLORS.ink, fontFamily: "var(--font-tajawal)" }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-8 pt-5 text-center text-xs"
          style={{
            borderTop: `1px solid ${COLORS.line}`,
            color: COLORS.muted,
            fontFamily: "var(--font-tajawal)",
          }}
        >
          © 2026 دكان البلد — دكانك قريب. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
