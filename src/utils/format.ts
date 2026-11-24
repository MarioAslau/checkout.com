import { format } from "date-fns";

export function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

export function formatDate(iso: string): string {
  return format(new Date(iso), "dd/MM/yyyy, HH:mm:ss");
}
