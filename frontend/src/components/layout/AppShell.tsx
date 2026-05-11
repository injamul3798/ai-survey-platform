import { BarChart3, LogOut, Sparkles, SquarePen, Users } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../../features/auth/AuthProvider";

const navigation = [
  { to: "/participants", label: "Participants", icon: Users },
  { to: "/surveys", label: "Surveys", icon: SquarePen },
];

export function AppShell() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-surface">
      <header className="topbar border-b border-line">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200/60">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <Link to="/participants" className="text-lg font-semibold tracking-tight text-ink">
                AI Survey Platform
              </Link>
              <p className="text-sm text-muted">Survey operations, participant management, and AI-assisted authoring.</p>
            </div>
          </div>
          <button onClick={logout} className="btn-secondary">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="panel-muted p-4">
          <div className="rounded-2xl bg-[linear-gradient(135deg,#dbeafe_0%,#eff6ff_42%,#f8fafc_100%)] px-4 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="eyebrow">Workspace</p>
                <p className="text-sm font-semibold text-ink">Admin Console</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Create surveys faster, keep participants organized, and control invitation flow from a single workspace.
            </p>
          </div>
          <nav className="mt-4 flex flex-col gap-1">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `${isActive ? "nav-link nav-link-active" : "nav-link"}`}>
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

