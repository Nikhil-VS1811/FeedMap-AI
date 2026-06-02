import { Plus, RefreshCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { createDonation, getDonorDonations } from '../../api/donationApi';
import DonationCard from '../../components/DonationCard';
import DonationFormModal from '../../components/DonationFormModal';
import { dismissToast, showError, showInfo, showLoading, showSuccess, showWarning } from '../../utils/toast';
import DashboardCard from './DashboardCard';

const DonorDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const stats = useMemo(
    () => ({
      active: donations.filter((donation) => ['available', 'active'].includes(donation.status)).length,
      completed: donations.filter((donation) => ['completed', 'delivered'].includes(donation.status)).length,
      matched: donations.filter((donation) => ['reserved', 'picked_up'].includes(donation.status)).length,
      total: donations.length,
    }),
    [donations]
  );

  const loadDonations = async () => {
    setError('');
    setLoading(true);

    try {
      const { data } = await getDonorDonations();
      setDonations(data.donations);
      if (data.donations.some((donation) => donation.acceptedByNgo)) {
        showInfo('Donation accepted by NGO', { id: 'donor-accepted-info', icon: 'i' });
      }
      if (data.donations.some((donation) => ['completed', 'delivered'].includes(donation.status))) {
        showSuccess('Delivery completed', { id: 'donor-delivery-completed' });
      }
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Could not load donations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const handleCreateDonation = async (payload) => {
    setFormError('');
    setSubmitting(true);
    const toastId = showLoading('Uploading donation...');

    try {
      const { data } = await createDonation(payload);
      setDonations((current) => [data.donation, ...current]);
      setModalOpen(false);
      dismissToast(toastId);
      showSuccess('Donation created successfully');
      if (data.donation.priorityLevel === 'HIGH') {
        showWarning('High Priority Donation detected', { icon: 'AI' });
      }
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Could not create donation.';
      dismissToast(toastId);
      setFormError(message);
      showError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Donor Dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">Create food donation listings and track their pickup status.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-white"
            onClick={loadDonations}
          >
            <RefreshCcw size={17} />
            Refresh
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
            onClick={() => setModalOpen(true)}
          >
            <Plus size={18} />
            Add Donation
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard label="Total donations" value={stats.total} helper="Food listings created" />
        <DashboardCard label="Available donations" value={stats.active} helper="Ready for NGO matching" />
        <DashboardCard label="Matched pickups" value={stats.matched} helper="Reserved or picked up" />
        <DashboardCard label="Completed" value={stats.completed} helper="Successfully delivered" />
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">Your Donations</h2>
        </div>

        {loading && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-medium text-ink-500">
            Loading donations...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && donations.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <h3 className="text-base font-semibold text-ink-900">No donations yet</h3>
            <p className="mt-2 text-sm text-ink-500">Create your first food donation to make it visible for matching.</p>
            <button
              type="button"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
              onClick={() => setModalOpen(true)}
            >
              <Plus size={18} />
              Add Donation
            </button>
          </div>
        )}

        {!loading && !error && donations.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {donations.map((donation) => (
              <DonationCard key={donation._id} donation={donation} />
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <DonationFormModal
          error={formError}
          onClose={() => setModalOpen(false)}
          onSubmit={handleCreateDonation}
          submitting={submitting}
        />
      )}
    </section>
  );
};

export default DonorDashboard;
