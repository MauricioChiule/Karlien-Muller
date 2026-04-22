import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  try {
    return new Intl.NumberFormat("pt-MZ", {
      style: "currency",
      currency: "MZN",
    }).format(value);
  } catch (e) {
    // Fallback for older Android/browsers that don't support pt-MZ or MZN in Intl
    const formatted = parseFloat(String(value)).toFixed(2).replace('.', ',');
    return `${formatted} MT`;
  }
}
