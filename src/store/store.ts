import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { paymentFiltersReducer } from "../features/payments/paymentFiltersSlice";

const rootReducer = combineReducers({
  paymentFilters: paymentFiltersReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const makeStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
