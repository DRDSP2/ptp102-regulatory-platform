import { useAuth } from '../../hooks/use-auth';
import { signOut } from '../../lib/api';
import { LogOut, LayoutPanelTop, Activity, Eye } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

type DashboardLayoutProps = {
  title: string;
  children: React.ReactNode;
};

export function DashboardLayout({ title, children }: DashboardLayoutProps) {
  const { role, signOut: ctxSignOut, user } = useAuth();
  const location = useLocation();
  const displayName = (role === 'admin' ? 'Admin' : role === 'deal' ? 'Partner' : 'Vet') + (user.email ? ` · ${user.email}` : '');

  const nav = [
    {
      label: 'Visual Aid',
      to: role === 'admin' ? '/admin/visual-aid' : '/vet/visual-aid',
      active: location.pathname.includes('visual-aid'),
      icon: Eye,
    },
    {
      label: 'Deal Room',
      to: role === 'admin' ? '/admin/deal-room' : role === 'deal' ? '/deal/dashboard' : '/vet/deal-room',
      active: location.pathname.includes('deal-room') || location.pathname.includes('deal'),
      icon: Activity,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-strong)]">
      <header className="sticky top-0 z-20 border-b border-ink-200/70 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            <LayoutPanelTop className="h-4 w-4 text-ink-500" />
            <span className="text-sm font-medium tracking-tight text-ink-900">{title}</span>
          </div>
          <nav className="hidden gap-1 md:flex">
            {nav.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm transition-all',
                  item.active ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-ink-600 hover:bg-ink-100'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4 text-sm text-ink-600">
            <span className="hidden sm:inline">{displayName}</span>
            <button
              onClick={async () => {
                await signOut();
                ctxSignOut();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-2.5 py-1.5 text-ink-800 hover:border-ink-300 hover:bg-ink-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-4 md:py-6">
        <div className="animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
