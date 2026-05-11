import { LogOut, SquarePen, Users } from "lucide-react";
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
            <Link to="/participants" className="text-lg font-semibold tracking-tight text-ink">
              AI Survey Platform
            </Link>
            <span className="hidden rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 md:inline-flex">
              Admin Console
            </span>
          </div>
          <button onClick={logout} className="btn-secondary">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="panel p-3">
          <div className="mb-3 rounded-2xl bg-slate-900 px-4 py-4 text-white">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Workspace</p>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-100">
              Manage participants, generate surveys, and send invitations from one place.
            </p>
          </div>
          <nav className="flex flex-col gap-1">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `${isActive ? "nav-link nav-link-active" : "nav-link"}`
                }
              >
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

