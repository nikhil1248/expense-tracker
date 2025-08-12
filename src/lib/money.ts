export type Currency = "USD" | "CAD" | "EUR" | "INR";

export const formatMoney = (cents: number, currency: Currency = "USD") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(cents / 100);
