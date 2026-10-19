import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import { router } from "./routes/index.tsx";
import { ThemeProvider } from "./providers/theme.provider.tsx";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "./redux/store.ts";
import { Toaster } from "./components/ui/sonner.tsx";
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

const queryClient = new QueryClient()
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster richColors />
        </QueryClientProvider>
      </ThemeProvider>
    </ReduxProvider>
  </React.StrictMode>
);
