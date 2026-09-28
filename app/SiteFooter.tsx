"use client";

import { usePathname } from "next/navigation";
import Footer from "@/app/Footer";

// صفحات الشغل (الأدمن ولوحة البائع) من غير فوتر
const HIDE_ON = ["/admin", "/vendor-dashboard"];

export default function SiteFooter() {
  const pathname = usePathname() || "/";
  if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null;
  return <Footer />;
}
