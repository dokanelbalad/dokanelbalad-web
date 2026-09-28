export type Brand = {
  slug: string; // اسم ملف اللوجو: public/brands/<slug>.png
  ar: string;
  en: string;
  keywords: string[]; // كلمات البحث في عنوان المنتج
};

export const BRANDS: Brand[] = [
  { slug: "toyota", ar: "تويوتا", en: "Toyota", keywords: ["تويوتا", "toyota"] },
  { slug: "nissan", ar: "نيسان", en: "Nissan", keywords: ["نيسان", "nissan"] },
  { slug: "ford", ar: "فورد", en: "Ford", keywords: ["فورد", "ford"] },
  { slug: "mercedes", ar: "مرسيدس", en: "Mercedes", keywords: ["مرسيدس", "mercedes", "benz"] },
  { slug: "chevrolet", ar: "شيفروليه", en: "Chevrolet", keywords: ["شيفروليه", "شيفرولية", "شيفرولت", "chevrolet"] },
  { slug: "lexus", ar: "لكزس", en: "Lexus", keywords: ["لكزس", "lexus"] },
  { slug: "dodge", ar: "دودج", en: "Dodge", keywords: ["دودج", "dodge"] },
  { slug: "bmw", ar: "بي إم دبليو", en: "BMW", keywords: ["بي إم دبليو", "بي ام دبليو", "bmw"] },
  { slug: "gmc", ar: "جي إم سي", en: "GMC", keywords: ["جي إم سي", "جي ام سي", "gmc"] },
  { slug: "hyundai", ar: "هيونداي", en: "Hyundai", keywords: ["هيونداي", "هيونداى", "hyundai"] },
  { slug: "kia", ar: "كيا", en: "Kia", keywords: ["كيا", "kia"] },
  { slug: "honda", ar: "هوندا", en: "Honda", keywords: ["هوندا", "honda"] },
  { slug: "mazda", ar: "مازدا", en: "Mazda", keywords: ["مازدا", "mazda"] },
  { slug: "mitsubishi", ar: "ميتسوبيشي", en: "Mitsubishi", keywords: ["ميتسوبيشي", "mitsubishi"] },
  { slug: "suzuki", ar: "سوزوكي", en: "Suzuki", keywords: ["سوزوكي", "suzuki"] },
  { slug: "peugeot", ar: "بيجو", en: "Peugeot", keywords: ["بيجو", "peugeot"] },
  { slug: "renault", ar: "رينو", en: "Renault", keywords: ["رينو", "renault"] },
  { slug: "fiat", ar: "فيات", en: "Fiat", keywords: ["فيات", "fiat"] },
  { slug: "opel", ar: "أوبل", en: "Opel", keywords: ["أوبل", "اوبل", "opel"] },
  { slug: "skoda", ar: "سكودا", en: "Skoda", keywords: ["سكودا", "skoda"] },
  { slug: "volkswagen", ar: "فولكس فاجن", en: "Volkswagen", keywords: ["فولكس", "volkswagen", "vw"] },
  { slug: "audi", ar: "أودي", en: "Audi", keywords: ["أودي", "اودي", "audi"] },
  { slug: "jeep", ar: "جيب", en: "Jeep", keywords: ["جيب", "jeep"] },
  { slug: "chery", ar: "شيري", en: "Chery", keywords: ["شيري", "chery"] },
  { slug: "mg", ar: "إم جي", en: "MG", keywords: ["إم جي", "ام جي", "mg"] },
  { slug: "lada", ar: "لادا", en: "Lada", keywords: ["لادا", "lada"] },
  { slug: "daewoo", ar: "دايو", en: "Daewoo", keywords: ["دايو", "daewoo"] },
  { slug: "changan", ar: "شانجان", en: "Changan", keywords: ["شانجان", "تشانجان", "changan"] },
  { slug: "daihatsu", ar: "دايهاتسو", en: "Daihatsu", keywords: ["دايهاتسو", "daihatsu"] },
  { slug: "gac", ar: "جي أيه سي", en: "GAC", keywords: ["جي أيه سي", "جي ايه سي", "gac"] },
  { slug: "geely", ar: "جيلي", en: "Geely", keywords: ["جيلي", "geely"] },
  { slug: "haval", ar: "هافال", en: "Haval", keywords: ["هافال", "haval"] },
  { slug: "proton", ar: "بروتون", en: "Proton", keywords: ["بروتون", "proton"] },
  { slug: "seat", ar: "سيات", en: "Seat", keywords: ["سيات", "seat"] },
  { slug: "volvo", ar: "فولفو", en: "Volvo", keywords: ["فولفو", "volvo"] },
];
