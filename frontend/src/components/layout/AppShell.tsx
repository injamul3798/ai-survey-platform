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
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/participants" className="text-lg font-semibold text-ink">
            AI Survey Platform
          </Link>
          <button onClick={logout} className="btn-secondary">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="panel p-3">
          <nav className="flex flex-col gap-1">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex h-10 items-center gap-3 rounded-md px-3 text-sm ${
                    isActive ? "bg-slate-900 text-white" : "text-ink hover:bg-slate-100"
                  }`
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

