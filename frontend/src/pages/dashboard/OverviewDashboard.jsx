import { Navigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import DashboardCard from './DashboardCard';

const roleHome = {
  admin: '/dashboard/admin',
  delivery: '/dashboard/delivery',
  donor: '/dashboard/donor',
  ngo: '/dashboard/ngo',
};

const OverviewDashboard = () => {
  const { user } = useAuth();

  if (roleHome[user?.role]) {
    return <Navigate to={roleHome[user.role]} replace />;
  }

  return (
    <section>
      <h1 className="text-2xl font-bold text-ink-900">Overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard label="Donations" value="0" helper="Food listings ready for matching" />
        <DashboardCard label="Requests" value="0" helper="NGO demand signals" />
        <DashboardCard label="Deliveries" value="0" helper="Pickup tasks in motion" />
        <DashboardCard label="Impact" value="0 kg" helper="Food redirected from waste" />
      </div>
    </section>
  );
};

export default OverviewDashboard;
