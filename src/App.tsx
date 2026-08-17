import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import OrderProviders from "@/components/ordering/OrderProviders";
import Index from "./pages/Index";
import Order from "./pages/Order";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Configure in .env as VITE_GOOGLE_CLIENT_ID. Google sign-in is skipped
// gracefully if this isn't set.
const GOOGLE_CLIENT_ID = '929251337249-ag6l7kmneg094tb1c8a5npljh81rv3v9.apps.googleusercontent.com';


const App = () => (
  <QueryClientProvider client={queryClient}>
    <GoogleOAuthProvider clientId ={GOOGLE_CLIENT_ID}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route
                  path="/order"
                  element={
                    <OrderProviders>
                      <Order />
                    </OrderProviders>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <OrderProviders>
                      <Checkout />
                    </OrderProviders>
                  }
                />
                <Route
                  path="/order-success"
                  element={
                    <OrderProviders>
                      <OrderSuccess />
                    </OrderProviders>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </GoogleOAuthProvider>
  </QueryClientProvider>
);

export default App;
