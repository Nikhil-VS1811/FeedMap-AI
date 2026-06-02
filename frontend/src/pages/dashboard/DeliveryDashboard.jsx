import { RefreshCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { getAssignedDeliveries, updateDonationStatus } from '../../api/donationApi';
import DeliveryProgress from '../../components/DeliveryProgress';
import DonationCard from '../../components/DonationCard';
import DonationDetailModal from '../../components/DonationDetailModal';
import ExpiryBadge from '../../components/ExpiryBadge';
import StatusBadge from '../../components/StatusBadge';
import { sortByExpiryUrgency } from '../../utils/expiryUtils';
import { dismissToast, showError, showLoading, showSuccess } from '../../utils/toast';
import DashboardCard from './DashboardCard';

const statusActions = {
  delivered: { label: 'Complete Delivery', nextStatus: 'completed', toast: 'Delivery completed' },
  in_transit: { label: 'Mark Delivered', nextStatus: 'delivered', toast: 'Food delivered' },
  picked_up: { label: 'Start Transit', nextStatus: 'in_transit', toast: 'Transit started' },
  reserved: { label: 'Mark Picked Up', nextStatus: 'picked_up', toast: 'Pickup started' },
};

const statusSections = [
  { empty: 'No reserved deliveries assigned to you.', label: 'Reserved Deliveries', status: 'reserved' },
  { empty: 'No picked up deliveries.', label: 'Picked Up', status: 'picked_up' },
  { empty: 'No deliveries currently in transit.', label: 'In Transit', status: 'in_transit' },
  { empty: 'No delivered orders awaiting completion.', label: 'Delivered', status: 'delivered' },
  { empty: 'Completed deliveries will appear here.', label: 'Completed Deliveries', status: 'completed' },
];

const DeliveryDashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState('');

  const stats = useMemo(
    () => ({
      assigned: deliveries.filter((delivery) => delivery.status === 'reserved').length,
      completed: deliveries.filter((delivery) => delivery.status === 'completed').length,
      delivered: deliveries.filter((delivery) => delivery.status === 'delivered').length,
      inMotion: deliveries.filter((delivery) => ['picked_up', 'in_transit', 'delivered'].includes(delivery.status)).length,
      total: deliveries.length,
    }),
    [deliveries]
  );

  const loadDeliveries = async () => {
    setError('');
    setLoading(true);

    try {
      const { data } = await getAssignedDeliveries();
      setDeliveries(sortByExpiryUrgency(data.donations));
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Could not load deliveries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const handleStatusUpdate = async (donationId, status) => {
    setError('');
    setStatusUpdating(`${donationId}:${status}`);
    const loadingLabels = {
      completed: 'Completing delivery...',
      delivered: 'Marking food delivered...',
      in_transit: 'Starting transit...',
      picked_up: 'Starting pickup...',
    };
    const toastId = showLoading(loadingLabels[status] || 'Updating status...', { icon: '🚚' });

    try {
      const { data } = await updateDonationStatus(donationId, status);
      setDeliveries((current) => sortByExpiryUrgency(current.map((delivery) => (delivery._id === donationId ? data.donation : delivery))));
      setSelectedDonation((current) => (current?._id === donationId ? data.donation : current));
      dismissToast(toastId);
      showSuccess(Object.values(statusActions).find((action) => action.nextStatus === status)?.toast || 'Delivery updated', { icon: '🚚' });
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Could not update delivery status.';
      dismissToast(toastId);
      setError(message);
      showError(message);
    } finally {
      setStatusUpdating('');
    }
  };

  const renderDeliveryCard = (delivery) => {
    const action = statusActions[delivery.status];

    return (
    <div key={delivery._id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all duration-300">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <StatusBadge status={delivery.status} />
        <ExpiryBadge donation={delivery} />
      </div>
      <DonationCard donation={delivery} onDetails={setSelectedDonation} />
      <DeliveryProgress donation={delivery} status={delivery.status} />
      <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-ink-700">
        <p><span className="font-semibold text-ink-900">Donor:</span> {delivery.donor?.name || 'Unknown'}</p>
        <p><span className="font-semibold text-ink-900">NGO:</span> {delivery.acceptedByNgo?.name || 'Pending'}</p>
        <p><span className="font-semibold text-ink-900">Delivery partner:</span> {delivery.assignedDelivery?.name || 'You'}</p>
        <p><span className="font-semibold text-ink-900">Current stage:</span> {delivery.status.replace('_', ' ')}</p>
        <p><span className="font-semibold text-ink-900">Food:</span> {delivery.title} · {delivery.quantity}</p>
      </div>
      {action && (
        <button
          type="button"
          disabled={statusUpdating === `${delivery._id}:${action.nextStatus}`}
          className="mt-3 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
          onClick={() => handleStatusUpdate(delivery._id, action.nextStatus)}
        >
          {statusUpdating === `${delivery._id}:${action.nextStatus}` ? 'Updating...' : action.label}
        </button>
      )}
    </div>
    );
  };

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Delivery Dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">Manage assigned pickups, routes, and delivery completion updates.</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-white"
          onClick={loadDeliveries}
        >
          <RefreshCcw size={17} />
          Refresh
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard label="Total assignments" value={stats.total} helper="Accepted NGO donations" />
        <DashboardCard label="Reserved" value={stats.assigned} helper="Ready to pick up" />
        <DashboardCard label="In motion" value={stats.inMotion} helper="Pickup through delivered" />
        <DashboardCard label="Completed" value={stats.completed} helper={`${stats.delivered} awaiting completion`} />
      </div>

      {loading && <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 text-sm font-medium text-ink-500">Loading deliveries...</div>}
      {!loading && error && <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>}

      {!loading && !error && (
        <>
          {statusSections.map((section) => {
            const sectionDeliveries = deliveries.filter((delivery) => delivery.status === section.status);

            return (
              <div className="mt-8" key={section.status}>
                <h2 className="mb-4 text-lg font-semibold text-ink-900">{section.label}</h2>
                {sectionDeliveries.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-ink-500">
                    {section.empty}
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {sectionDeliveries.map((delivery) => renderDeliveryCard(delivery))}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {selectedDonation && <DonationDetailModal donation={selectedDonation} onClose={() => setSelectedDonation(null)} />}
    </section>
  );
};

export default DeliveryDashboard;
