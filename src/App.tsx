
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { MainLayout } from "./components/Layout/MainLayout";

// Auth pages
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { VerifyOTP } from "./pages/auth/VerifyOTP";

// Main pages
import { Dashboard } from "./pages/Dashboard";
import { Members } from "./pages/Members";
import { AddMember } from "./pages/AddMember";
import { MemberProfile } from "./pages/MemberProfile";
import { EditMember } from "./pages/EditMember";
import { Batches } from "./pages/Batches";
import { AddBatch } from "./pages/AddBatch";
import { EditBatch } from "./pages/EditBatch";
import { Plans } from "./pages/Plans";
import { AddPlan } from "./pages/AddPlan";
import { EditPlan } from "./pages/EditPlan";
import { Payments } from "./pages/Payments";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  return user ? <MainLayout>{children}</MainLayout> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
    <Route path="/verify-otp" element={<PublicRoute><VerifyOTP /></PublicRoute>} />
    
    {/* Protected routes */}
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/members" element={<ProtectedRoute><Members /></ProtectedRoute>} />
    <Route path="/members/add" element={<ProtectedRoute><AddMember /></ProtectedRoute>} />
    <Route path="/members/:id" element={<ProtectedRoute><MemberProfile /></ProtectedRoute>} />
    <Route path="/members/:id/edit" element={<ProtectedRoute><EditMember /></ProtectedRoute>} />
    
    {/* Payment routes */}
    <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
    
    {/* Batch routes */}
    <Route path="/batches" element={<ProtectedRoute><Batches /></ProtectedRoute>} />
    <Route path="/batches/add" element={<ProtectedRoute><AddBatch /></ProtectedRoute>} />
    <Route path="/batches/:id/edit" element={<ProtectedRoute><EditBatch /></ProtectedRoute>} />
    
    {/* Plan routes */}
    <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
    <Route path="/plans/add" element={<ProtectedRoute><AddPlan /></ProtectedRoute>} />
    <Route path="/plans/:id/edit" element={<ProtectedRoute><EditPlan /></ProtectedRoute>} />
    
    {/* Catch-all */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
