import type { Locale } from "@/lib/localization";

export const euro = (bedrag: number, locale: Locale = "nl") =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  }).format(bedrag);
