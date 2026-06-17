import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/use-auth';
import { Login } from './features/login/Login';
import { Dashboard } from './features/dashboard/Dashboard';
import { DashboardLayout } from './features/dashboard/DashboardLayout';
import { Patients } from './features/patients/Patients';
import { ConsentWorkflow } from './features/consent/ConsentWorkflow';
import { AdverseEvents } from './features/adverse-events/AdverseEvents';
import { Shipments } from './features/shipments/Shipments';
import { Settings } from './features/settings/Settings';
import { AuditLogs } from './features/audit/AuditLogs';
import { Reports } from './features/reports/Reports';
import { VeterinarianDashboard } from './features/veterinarians/VeterinarianDashboard';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireRole({ allowedRoles, children }: { allowedRoles: string[]; children: React.ReactNode }) {
  const { role, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!allowedRoles.includes(role || '')) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        <div className="text-center">
          <h2 className="text-lg font-medium mb-2">Access Denied</h2>
          <p>Your role ({role}) does not have permission to access this page.</p>
          <p className="text-sm mt-2">Required: {allowedRoles.join(', ')}</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

function AdminRoutes() {
  return (
    <RequireRole allowedRoles={['admin']}>
      <DashboardLayout>
        <Routes>
          <Route path="patients" element={<Patients />} />
          <Route path="consent" element={<ConsentWorkflow />} />
          <Route path="adverse-events" element={<AdverseEvents />} />
          <Route path="shipments" element={<Shipments />} />
          <Route path="audit" element={<AuditLogs />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </DashboardLayout>
    </RequireRole>
  );
}

function VetRoutes() {
  return (
    <RequireRole allowedRoles={['vet']}>
      <DashboardLayout>
        <Routes>
          <Route path="dashboard" element={<VeterinarianDashboard />} />
          <Route path="patients" element={<VeterinarianDashboard />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </DashboardLayout>
    </RequireRole>
  );
}

export function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RequireAuth><Navigate to="/dashboard" replace /></RequireAuth>} />
        <Route element={<RequireAuth><Outlet /></RequireAuth>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route element={<AdminRoutes />} />
          <Route element={<VetRoutes />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}