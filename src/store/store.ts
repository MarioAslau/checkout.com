import { combineReducers, configureStore, type Reducer } from "@reduxjs/toolkit";

type PlaceholderState = Record<string, never>;

// configureStore rejects an empty reducer map. T03 and T04 replace this.
const placeholderReducer: Reducer<PlaceholderState> = (state = {}) => state;

const rootReducer = combineReducers({
  app: placeholderReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const makeStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
