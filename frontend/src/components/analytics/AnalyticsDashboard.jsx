import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { getDashboardAnalytics } from '../../api/analyticsApi';
import { showError, showInfo } from '../../utils/toast';
import ChartCard from './ChartCard';
import MetricCard from './MetricCard';

const filters = ['today', 'weekly', 'monthly', 'all'];
const colors = ['#16a34a', '#d97706', '#dc2626', '#2563eb', '#7c3aed', '#0f766e'];

const Skeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="h-28 animate-pulse rounded-lg bg-slate-200" />
    ))}
  </div>
);

const EmptyState = () => (
  <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-ink-500">
    Analytics will appear once donations and deliveries are recorded.
  </div>
);

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setError('');
      setLoading(true);

      try {
        const { data } = await getDashboardAnalytics(filter);
        setAnalytics(data);
        if (data.metrics?.urgentDonations > 0) {
          showInfo(`${data.metrics.urgentDonations} urgent donations need attention`, { id: 'analytics-urgent' });
        }
      } catch (apiError) {
        const message = apiError.response?.data?.message || 'Could not load analytics.';
        setError(message);
        showError(message);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [filter]);

  if (loading) {
    return <Skeleton />;
  }

  if (error) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>;
  }

  if (!analytics) {
    return <EmptyState />;
  }

  const { charts, metrics, overview, recentActivity, systemHealth } = analytics;

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-ink-900">Analytics Intelligence</h2>
          <p className="text-sm text-ink-500">Live operational metrics from FeedMap donation workflows.</p>
        </div>
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              className={`rounded-md px-3 py-1.5 text-sm font-semibold capitalize ${
                filter === item ? 'bg-primary-600 text-white' : 'text-ink-600 hover:bg-slate-50'
              }`}
              onClick={() => setFilter(item)}
            >
              {item === 'all' ? 'All time' : item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Food Saved" value={`${metrics.totalFoodSaved} kg`} helper="Completed delivery impact" />
        <MetricCard label="Meals Distributed" value={metrics.mealsDistributed} helper={overview[0]} />
        <MetricCard label="NGOs Active" value={metrics.ngosActive} helper={overview[2]} />
        <MetricCard label="High Priority Donations" value={metrics.highPriorityDonations} helper={overview[1]} trend={metrics.highPriorityDonations ? 'up' : 'down'} />
        <MetricCard label="Waste Prevented" value={`${metrics.wastePreventedKg} kg`} helper="Estimated avoided waste" />
        <MetricCard label="Delivery Success Rate" value={`${metrics.deliverySuccessRate}%`} helper="Completed / assigned" />
        <MetricCard label="Average Delivery Time" value={`${metrics.averageDeliveryTime}m`} helper="Pickup to completion" />
        <MetricCard label="AI Match Efficiency" value={`${metrics.recommendationEfficiency}%`} helper="Accepted recommended NGO" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Food Category Distribution">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={charts.categoryDistribution} dataKey="value" nameKey="name" outerRadius={95} label>
                {charts.categoryDistribution.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Delivery Completion Statistics">
          <ResponsiveContainer>
            <BarChart data={charts.deliveryCompletion}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#16a34a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Donations Trend">
          <ResponsiveContainer>
            <LineChart data={charts.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="donations" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Priority Distribution">
          <ResponsiveContainer>
            <BarChart data={charts.priorityDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#dc2626" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="NGO Activity">
          <ResponsiveContainer>
            <BarChart data={charts.ngoActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="donationsHandled" fill="#2563eb" />
              <Bar dataKey="deliveriesCompleted" fill="#16a34a" />
              <Bar dataKey="activeRequests" fill="#d97706" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Expiry Statistics">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={charts.expiryStatistics} dataKey="value" nameKey="name" outerRadius={95} label>
                {charts.expiryStatistics.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-ink-900">System Health</h3>
          <div className="mt-4 grid gap-3 text-sm text-ink-700">
            <p>Total users: <span className="font-semibold text-ink-900">{systemHealth.totalUsers}</span></p>
            <p>Approved NGOs: <span className="font-semibold text-ink-900">{systemHealth.approvedNgos}</span></p>
            <p>Pending NGOs: <span className="font-semibold text-ink-900">{systemHealth.pendingNgos}</span></p>
            <p>Delivery users: <span className="font-semibold text-ink-900">{systemHealth.deliveryUsers}</span></p>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-ink-900">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p className="mt-4 text-sm text-ink-500">No activity yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentActivity.map((item) => (
                <div key={item.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="font-semibold text-ink-900">{item.message}</p>
                  <p className="text-ink-500">{item.title} · {new Date(item.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
};

export default AnalyticsDashboard;
