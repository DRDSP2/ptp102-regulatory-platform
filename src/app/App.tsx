import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import TrialPortal from '../features/login/TrialPortal';
import ResetPassword from '../features/login/ResetPassword';
import VetSignup from '../features/vet-signup/VetSignup';
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
import Spinner from '../components/ui/spinner';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  if (status === 'loading')
    return (
      <div className="min-h-screen grid place-items-center bg-[var(--page-bg)] text-ink-900">
        <div className="flex items-center gap-3">
          <Spinner size={22} />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  if (status !== 'authenticated') return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireRole({ allowedRoles, children }: { allowedRoles: string[]; children: React.ReactNode }) {
  const { status, role } = useAuth();
  if (status === 'loading')
    return (
      <div className="min-h-screen grid place-items-center bg-[var(--page-bg)] text-ink-900">
        <div className="flex items-center gap-3">
          <Spinner size={22} />
          <span className="text-sm">Checking access...</span>
        </div>
      </div>
    );
  if (!allowedRoles.includes(role || '')) {
    return (
      <div className="min-h-screen grid place-items-center bg-[var(--page-bg)] text-ink-900">
        <div className="panel p-8 text-center max-w-md animate-slide-up">
          <div className="text-base font-semibold text-ink-900">Access Denied</div>
          <p className="mt-2 text-sm text-ink-500">Your role ({role ?? 'none'}) does not have permission to access this page.</p>
          <p className="mt-1 text-xs text-ink-400">Required: {allowedRoles.join(', ')}</p>
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

  const roleHome = () => {
    if (role === 'deal') return '/deal/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'vet') return '/vet/dashboard';
    return '/login';
  };

  return (
    <Routes>
      <Route path="/login" element={<TrialPortal />} />
      <Route path="/signup" element={<VetSignup />} />
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
