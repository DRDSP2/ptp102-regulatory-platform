import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import TrialPortal from '../features/login/TrialPortal';
import ResetPassword from '../features/login/ResetPassword';
import { DashboardLayout } from '../features/dashboard/DashboardLayout';
import Patients from '../features/patients/Patients';
import ConsentWorkflow from '../features/consent/ConsentWorkflow';
import AdverseEvents from '../features/adverse-events/AdverseEvents';
import Shipments from '../features/shipments/Shipments';
import Settings from '../features/settings/Settings';
import AuditLogs from '../features/audit/AuditLogs';
import Reports from '../features/reports/Reports';
import VeterinarianDashboard from '../features/veterinarians/VeterinarianDashboard';
import DealRoom from '../features/dealroom/DealRoom';
import VisualAid from '../features/visual-aid/VisualAid';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">Loading...</div>;
  if (status !== 'authenticated') return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireRole({ allowedRoles, children }: { allowedRoles: string[]; children: React.ReactNode }) {
  const { status, role } = useAuth();
  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">Loading...</div>;
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
      <DashboardLayout title="PTP-102 Admin">
        <Routes>
          <Route path="patients" element={<Patients />} />
          <Route path="consent" element={<ConsentWorkflow />} />
          <Route path="adverse-events" element={<AdverseEvents />} />
          <Route path="shipments" element={<Shipments />} />
          <Route path="audit" element={<AuditLogs />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="deal-room/*" element={<DealRoom />} />
          <Route path="visual-aid" element={<VisualAid />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </DashboardLayout>
    </RequireRole>
  );
}

function VetRoutes() {
  return (
    <RequireRole allowedRoles={['vet']}>
      <DashboardLayout title="PTP-102 Vet">
        <Routes>
          <Route path="dashboard" element={<VeterinarianDashboard />} />
          <Route path="patients" element={<VeterinarianDashboard />} />
          <Route path="visual-aid" element={<VisualAid />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </DashboardLayout>
    </RequireRole>
  );
}

function DealRoutes() {
  return (
    <RequireRole allowedRoles={['admin', 'deal']}>
      <DashboardLayout title="Deal Room">
        <Routes>
          <Route path="dashboard" element={<DealRoom />} />
          <Route path="data-room" element={<DealRoom page="data-room" />} />
          <Route path="term-sheet" element={<DealRoom page="term-sheet" />} />
          <Route path="transactions" element={<DealRoom page="transactions" />} />
          <Route path="*" element={<DealRoom />} />
        </Routes>
      </DashboardLayout>
    </RequireRole>
  );
}

export function App() {
  const { status, role } = useAuth();

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">Loading...</div>;
  }

  const roleHome = () => {
    if (role === 'deal') return '/deal/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'vet') return '/vet/dashboard';
    return '/login';
  };

  return (
    <Routes>
      <Route path="/login" element={<TrialPortal />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={status === 'authenticated' ? <Navigate to={roleHome()} replace /> : <TrialPortal />} />
      <Route path="/dashboard" element={<RequireAuth><Navigate to={roleHome()} replace /></RequireAuth>} />
      <Route element={<RequireAuth><Outlet /></RequireAuth>}>
        <Route path="admin/*" element={<AdminRoutes />} />
        <Route path="vet/*" element={<VetRoutes />} />
        <Route path="deal/*" element={<DealRoutes />} />
      </Route>
      <Route path="*" element={<Navigate to={roleHome()} replace />} />
    </Routes>
  );
}
