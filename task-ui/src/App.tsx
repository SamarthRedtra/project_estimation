import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import History from "./pages/History";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import { UserProvider } from "@/contexts/UserContext";

import { FrappeProvider } from 'frappe-react-sdk'

// Add this import
import { useFrappeAuth } from 'frappe-react-sdk';
import { Navigate, Outlet } from 'react-router-dom';
import { set } from "date-fns";
import { Loader } from "./components/Loader";

// Add this component
const ProtectedRoute = () => {
  const { currentUser, isLoading } = useFrappeAuth();
  if (isLoading) {
    return <Loader /> // Or use your custom loader component
  }
  return currentUser ? <Outlet /> : <Navigate to="/login" />;
};

const App = () => (
  <FrappeProvider>
    <QueryClientProvider client={new QueryClient()}>
      <TooltipProvider>
        <UserProvider>
          <Toaster />
          <Sonner position="top-center" />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Index />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/history" element={<History />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </FrappeProvider>
);

export default App;
