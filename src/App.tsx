import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import SplashScreen from "@/components/SplashScreen";
import SalesPage from "@/pages/SalesPage";
import KitchenPage from "@/pages/KitchenPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import MenuPage from "@/pages/MenuPage";
import ExpensesPage from "@/pages/ExpensesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
        <BrowserRouter>
          <div className="max-w-lg mx-auto min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<SalesPage />} />
              <Route path="/kitchen" element={<KitchenPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
