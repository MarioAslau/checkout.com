import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { paymentFiltersReducer } from "../features/payments/paymentFiltersSlice";
import { paymentsApi } from "../features/payments/paymentsApi";

const rootReducer = combineReducers({
  paymentFilters: paymentFiltersReducer,
  [paymentsApi.reducerPath]: paymentsApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const makeStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(paymentsApi.middleware),
    preloadedState,
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
