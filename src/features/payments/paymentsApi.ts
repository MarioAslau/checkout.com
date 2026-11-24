import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../constants";
import type { PaymentQueryArgs, PaymentSearchResponse } from "../../types/payment";

export const paymentsApi = createApi({
  reducerPath: "paymentsApi",
  baseQuery: fetchBaseQuery({ baseUrl: window.location.origin }),
  endpoints: (builder) => ({
    getPayments: builder.query<PaymentSearchResponse, PaymentQueryArgs>({
      query: ({ search, currency, page, pageSize }) => ({
        url: API_URL,
        params: { search, currency, page, pageSize },
      }),
    }),
  }),
});

export const { useGetPaymentsQuery } = paymentsApi;
