import { LogOut, Menu } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import RoleBadge from './RoleBadge';

const Topbar = ({ onMenuClick }) => {
  const { logout, user } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-ink-700 hover:bg-slate-100 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>
        <div>
          <p className="text-sm font-semibold text-ink-900">Dashboard</p>
          <p className="hidden text-xs text-ink-500 sm:block">Coordinate food recovery with role-aware workflows</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <RoleBadge role={user?.role} />
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-ink-900">{user?.name}</p>
          <p className="text-xs text-ink-500">{user?.email}</p>
        </div>
        <button
          type="button"
          className="rounded-lg p-2 text-ink-500 hover:bg-slate-100 hover:text-ink-900"
          onClick={logout}
          aria-label="Log out"
          title="Log out"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
