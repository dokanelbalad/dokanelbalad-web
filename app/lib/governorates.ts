export type Governorate = { name: string; lat: number; lng: number };

// إحداثيات تقريبية لمركز كل محافظة (بتستخدم في زرار "القريب")
export const GOVERNORATES: Governorate[] = [
  { name: "القاهرة", lat: 30.04, lng: 31.24 },
  { name: "الجيزة", lat: 30.01, lng: 31.21 },
  { name: "الإسكندرية", lat: 31.2, lng: 29.92 },
  { name: "القليوبية", lat: 30.41, lng: 31.21 },
  { name: "الشرقية", lat: 30.59, lng: 31.5 },
  { name: "الدقهلية", lat: 31.04, lng: 31.38 },
  { name: "الغربية", lat: 30.79, lng: 31.0 },
  { name: "المنوفية", lat: 30.55, lng: 31.01 },
  { name: "البحيرة", lat: 31.04, lng: 30.47 },
  { name: "كفر الشيخ", lat: 31.11, lng: 30.94 },
  { name: "دمياط", lat: 31.42, lng: 31.81 },
  { name: "بورسعيد", lat: 31.27, lng: 32.3 },
  { name: "الإسماعيلية", lat: 30.59, lng: 32.27 },
  { name: "السويس", lat: 29.97, lng: 32.55 },
  { name: "شمال سيناء", lat: 31.13, lng: 33.8 },
  { name: "جنوب سيناء", lat: 28.24, lng: 33.62 },
  { name: "الفيوم", lat: 29.31, lng: 30.84 },
  { name: "بني سويف", lat: 29.07, lng: 31.1 },
  { name: "المنيا", lat: 28.11, lng: 30.75 },
  { name: "أسيوط", lat: 27.18, lng: 31.18 },
  { name: "سوهاج", lat: 26.56, lng: 31.7 },
  { name: "قنا", lat: 26.16, lng: 32.72 },
  { name: "الأقصر", lat: 25.7, lng: 32.64 },
  { name: "أسوان", lat: 24.09, lng: 32.9 },
  { name: "البحر الأحمر", lat: 27.26, lng: 33.81 },
  { name: "الوادي الجديد", lat: 25.45, lng: 30.55 },
  { name: "مطروح", lat: 31.35, lng: 27.24 },
];

// توحيد الكتابة العربية عشان البحث ما يتأثرش بالهمزات والتاء المربوطة
export function normalizeAr(s: string): string {
  return s
    .replace(/[\u064B-\u065F\u0640]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .trim()
    .toLowerCase();
}

export function nearestGovernorate(lat: number, lng: number): string {
  let best = GOVERNORATES[0];
  let bestD = Infinity;
  const k = Math.cos((lat * Math.PI) / 180);
  for (const g of GOVERNORATES) {
    const d = (g.lat - lat) ** 2 + ((g.lng - lng) * k) ** 2;
    if (d < bestD) {
      bestD = d;
      best = g;
    }
  }
  return best.name;
}
