import type { Currency } from "../constants";

export type PaymentStatus = "completed" | "pending" | "failed" | "refunded";

export interface Payment {
  id: string;
  customerName?: string;
  amount: number;
  customerAddress: string;
  currency?: Currency;
  status: PaymentStatus;
  date: string;
  description: string;
  clientId?: string;
}

export interface PaymentSearchResponse {
  payments: Payment[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PaymentQueryArgs {
  search?: string;
  currency?: Currency;
  page: number;
  pageSize: number;
}
