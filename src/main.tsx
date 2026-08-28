import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";
import { LanguageProvider } from "./i18n/LanguageProvider";
import { AffiliateProvider } from "./providers/AffiliateProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { CartProvider } from "./providers/CartProvider";
import { OrdersProvider } from "./providers/OrdersProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

const root = document.getElementById("root");

if (!root) {
  throw new Error("Élément #root introuvable.");
}

createRoot(root).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <LanguageProvider>
          <AuthProvider>
            <AffiliateProvider>
              <CartProvider>
                <OrdersProvider>
                  <App />
                </OrdersProvider>
              </CartProvider>
            </AffiliateProvider>
          </AuthProvider>
          </LanguageProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>
);
