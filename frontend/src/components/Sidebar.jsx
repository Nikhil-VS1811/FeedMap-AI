import { BarChart3, Bike, Building2, HandHeart, LayoutDashboard, ShieldCheck, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const allLinks = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, roles: ['donor', 'ngo', 'delivery', 'admin'], end: true },
  { label: 'Donor', to: '/dashboard/donor', icon: HandHeart, roles: ['donor', 'admin'] },
  { label: 'NGO', to: '/dashboard/ngo', icon: Building2, roles: ['ngo', 'admin'] },
  { label: 'Delivery', to: '/dashboard/delivery', icon: Bike, roles: ['delivery', 'admin'] },
  { label: 'Admin', to: '/dashboard/admin', icon: ShieldCheck, roles: ['admin'] },
];

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const links = allLinks.filter((link) => link.roles.includes(user?.role));

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/40 transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 transform flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:z-auto lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white">
              <BarChart3 size={21} />
            </div>
            <div>
              <p className="text-sm font-bold text-ink-900">FeedMap AI</p>
              <p className="text-xs text-ink-500">Operations Console</p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-ink-500 hover:bg-slate-100 lg:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {links.map(({ end, icon: Icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-ink-700 hover:bg-slate-100 hover:text-ink-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
