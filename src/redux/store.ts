import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./baseApi";
import { setupListeners } from "@reduxjs/toolkit/query";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

setupListeners(store.dispatch);

// Global session expiry listener to reset all cached query states on auto-logout
if (typeof window !== "undefined") {
  window.addEventListener("nexora_session_expired", () => {
    store.dispatch(baseApi.util.resetApiState());
  });
}

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
