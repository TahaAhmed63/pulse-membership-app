import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { MainLayout } from "./components/Layout/MainLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

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
import { Attendance } from "./pages/Attendance";
import { Batches } from "./pages/Batches";
import { AddBatch } from "./pages/AddBatch";
import { EditBatch } from "./pages/EditBatch";
import { Plans } from "./pages/Plans";
import { AddPlan } from "./pages/AddPlan";
import { EditPlan } from "./pages/EditPlan";
import Payments from "./pages/Payments";
import NotFound from "./pages/NotFound";
import { NotAuthorized } from "./pages/NotAuthorized";

const queryClient = new QueryClient();

const AuthenticatedRoute = ({ children }: { children: React.ReactNode }) => {
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
    
    {/* Protected routes with permission checks */}
    <Route path="/dashboard" element={<AuthenticatedRoute><Dashboard /></AuthenticatedRoute>} />
    
    {/* Member management routes - require edit_members permission */}
    <Route path="/members" element={
      <AuthenticatedRoute>
        <ProtectedRoute permission="edit_members">
          <Members />
        </ProtectedRoute>
      </AuthenticatedRoute>
    } />
    <Route path="/members/add" element={
      <AuthenticatedRoute>
        <ProtectedRoute permission="edit_members">
          <AddMember />
        </ProtectedRoute>
      </AuthenticatedRoute>
    } />
    <Route path="/members/:id" element={
      <AuthenticatedRoute>
        <ProtectedRoute permission="edit_members">
          <MemberProfile />
        </ProtectedRoute>
      </AuthenticatedRoute>
    } />
    <Route path="/members/:id/edit" element={
      <AuthenticatedRoute>
        <ProtectedRoute permission="edit_members">
          <EditMember />
        </ProtectedRoute>
      </AuthenticatedRoute>
    } />
    
    {/* Payment routes - require manage_payments permission */}
    <Route path="/payments" element={
      <AuthenticatedRoute>
        <ProtectedRoute permission="manage_payments">
          <Payments />
        </ProtectedRoute>
      </AuthenticatedRoute>
    } />
    
    {/* Attendance routes - require view_attendance permission */}
    <Route path="/attendance" element={
      <AuthenticatedRoute>
        <ProtectedRoute permission="view_attendance">
          <Attendance />
        </ProtectedRoute>
      </AuthenticatedRoute>
    } />
    
    {/* Batch routes - require manage_batches permission */}
    <Route path="/batches" element={
      <AuthenticatedRoute>
        <ProtectedRoute permission="manage_batches">
          <Batches />
        </ProtectedRoute>
      </AuthenticatedRoute>
    } />
    <Route path="/batches/add" element={
      <AuthenticatedRoute>
        <ProtectedRoute permission="manage_batches">
          <AddBatch />
        </ProtectedRoute>
      </AuthenticatedRoute>
    } />
    <Route path="/batches/:id/edit" element={
      <AuthenticatedRoute>
        <ProtectedRoute permission="manage_batches">
          <EditBatch />
        </ProtectedRoute>
      </AuthenticatedRoute>
    } />
    
    {/* Plan routes - require manage_plans permission */}
    <Route path="/plans" element={
      <AuthenticatedRoute>
        <ProtectedRoute permission="manage_plans">
          <Plans />
        </ProtectedRoute>
      </AuthenticatedRoute>
    } />
    <Route path="/plans/add" element={
      <AuthenticatedRoute>
        <ProtectedRoute permission="manage_plans">
          <AddPlan />
        </ProtectedRoute>
      </AuthenticatedRoute>
    } />
    <Route path="/plans/:id/edit" element={
      <AuthenticatedRoute>
        <ProtectedRoute permission="manage_plans">
          <EditPlan />
        </ProtectedRoute>
      </AuthenticatedRoute>
    } />
    
    {/* Access denied page */}
    <Route path="/not-authorized" element={<AuthenticatedRoute><NotAuthorized /></AuthenticatedRoute>} />
    
    {/* Catch-all */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <Provider store={store}>
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
  </Provider>
);

export default App;
