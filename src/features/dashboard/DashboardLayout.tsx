import { useAuth } from '../../hooks/use-auth';
import { signOut } from '../../lib/api';
import { LogOut, LayoutPanelTop, Activity, Eye } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

type DashboardLayoutProps = {
  title: string;
  children: React.ReactNode;
};

export function DashboardLayout({ title, children }: DashboardLayoutProps) {
  const { role, signOut: ctxSignOut, user } = useAuth();
  const location = useLocation();
  const displayName = (role === 'admin' ? 'Admin' : 'Vet') + (user.email ? ` · ${user.email}` : '');

  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            <LayoutPanelTop className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium tracking-tight">{title}</span>
          </div>
          <nav className="flex items-center gap-1">
            <Link 
              to={role === 'admin' ? '/admin/visual-aid' : '/vet/visual-aid'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
                isActive('visual-aid') 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Visual Aid</span>
            </Link>
            <Link 
              to={role === 'admin' ? '/admin/deal-room' : '/vet/deal-room'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
                isActive('deal-room') 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Deal Room</span>
            </Link>
          </nav>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <span className="hidden sm:inline text-slate-400">{displayName}</span>
            <button
              onClick={async () => {
                await signOut();
                ctxSignOut();
              }}
              className="inline-flex items-center gap-1.5 rounded border border-slate-800 px-2 py-1 hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-4">{children}</main>
    </div>
  );
}
