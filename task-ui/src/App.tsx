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

// Add this import
import { useFrappeAuth ,FrappeProvider} from 'frappe-react-sdk';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader } from "./components/Loader";

// Add this component
const ProtectedRoute = () => {
  const { currentUser, isLoading } = useFrappeAuth();
  if (isLoading) {
    return <Loader /> // Or use your custom loader component
  }
  return currentUser ? <Outlet /> : <Navigate to="/login" />;
};

import { Provider } from 'react-redux';
import { store } from './store';

import { StrictMode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <StrictMode>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <FrappeProvider>
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
          </FrappeProvider>
        </QueryClientProvider>
      </Provider>
    </StrictMode>
  );
};

export default App;
