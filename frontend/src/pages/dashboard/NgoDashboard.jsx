import { RefreshCcw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { acceptDonation, getAcceptedDonations, getAvailableDonations, rejectDonation } from '../../api/donationApi';
import DonationCard from '../../components/DonationCard';
import DonationDetailModal from '../../components/DonationDetailModal';
import DonationFilterPanel from '../../components/DonationFilterPanel';
import DonationMap from '../../components/DonationMap';
import RecommendationPanel from '../../components/RecommendationPanel';
import { defaultDonationFilters } from '../../utils/donationFilters';
import { getExpiryLevel } from '../../utils/expiryUtils';
import { dismissToast, showError, showInfo, showLoading, showSuccess, showWarning } from '../../utils/toast';
import DashboardCard from './DashboardCard';

const NgoDashboard = () => {
  const [acceptedDonations, setAcceptedDonations] = useState([]);
  const [activeDonations, setActiveDonations] = useState([]);
  const [actionError, setActionError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState('');
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(defaultDonationFilters);
  const [loading, setLoading] = useState(true);
  const [mapRefreshKey, setMapRefreshKey] = useState(0);

  const loadActiveDonations = useCallback(async (activeFilters) => {
    setError('');
    setLoading(true);

    try {
      const { data } = await getAvailableDonations(activeFilters);
      console.log('[ngo dashboard] filtered donations', { count: data.count, filters: activeFilters });
      setActiveDonations(data.donations);
      if (data.donations.some((donation) => getExpiryLevel(donation) === 'RED')) {
        showWarning('Critical food detected', { icon: 'AI', id: 'ngo-critical-food' });
      }
      if (data.donations.length > 0) {
        showInfo('New nearby donation available', { icon: 'i', id: 'ngo-new-nearby' });
      }
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Could not load NGO donations.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAcceptedDonations = useCallback(async () => {
    try {
      const { data } = await getAcceptedDonations();
      setAcceptedDonations(data.donations);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Could not load accepted donations.');
    }
  }, []);

  const refreshDashboard = () => {
    loadActiveDonations(filters);
    loadAcceptedDonations();
    setMapRefreshKey((current) => current + 1);
  };

  useEffect(() => {
    loadAcceptedDonations();
  }, [loadAcceptedDonations]);

  useEffect(() => {
    const debounceDelay = filters.search ? 250 : 0;
    const timeoutId = window.setTimeout(() => loadActiveDonations(filters), debounceDelay);

    return () => window.clearTimeout(timeoutId);
  }, [filters, loadActiveDonations]);

  const handleAcceptDonation = async (donation) => {
    console.log('[ngo dashboard] accept clicked', donation);
    setActionError('');

    if (getExpiryLevel(donation) === 'GRAY') {
      const message = 'Expired donations cannot be accepted.';
      setActionError(message);
      showWarning(message);
      return;
    }

    setActionLoadingId(donation._id);
    const toastId = showLoading('Accepting donation...');

    try {
      const { data } = await acceptDonation(donation._id);
      setActiveDonations((current) => current.filter((item) => item._id !== donation._id));
      setAcceptedDonations((current) => [data.donation, ...current]);
      setSelectedDonation(null);
      setMapRefreshKey((current) => current + 1);
      dismissToast(toastId);
      showSuccess('Donation accepted');
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Could not accept donation.';
      dismissToast(toastId);
      setActionError(message);
      showError(message);
    } finally {
      setActionLoadingId('');
    }
  };

  const handleRejectDonation = async (donation) => {
    console.log('[ngo dashboard] reject clicked', donation);
    setActionError('');
    setActionLoadingId(donation._id);
    const toastId = showLoading('Rejecting donation...');

    try {
      await rejectDonation(donation._id);
      setAcceptedDonations((current) => current.filter((item) => item._id !== donation._id));
      await loadActiveDonations(filters);
      setSelectedDonation(null);
      setMapRefreshKey((current) => current + 1);
      dismissToast(toastId);
      showSuccess('Donation rejected');
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Could not reject donation.';
      dismissToast(toastId);
      setActionError(message);
      showError(message);
    } finally {
      setActionLoadingId('');
    }
  };

  const urgentCount = activeDonations.filter((donation) => donation.priorityLevel === 'HIGH').length;
  const mediumCount = activeDonations.filter((donation) => donation.priorityLevel === 'MEDIUM').length;
  const lowCount = activeDonations.filter((donation) => donation.priorityLevel === 'LOW').length;
  const topRecommendation = activeDonations.find((donation) => donation.recommendedNgo);

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">NGO Dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">Review matched donations, raise requests, and coordinate distribution.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-white"
            onClick={refreshDashboard}
          >
            <RefreshCcw size={17} />
            Refresh
          </button>
          <button className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
            New request
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard label="Open requests" value="0" helper="Active food needs" />
        <DashboardCard label="Available donations" value={activeDonations.length} helper="Ready for matching" />
        <DashboardCard label="Accepted donations" value={acceptedDonations.length} helper="Reserved for your NGO" />
        <DashboardCard label="Urgent donations" value={urgentCount} helper="High AI priority" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <DashboardCard label="High priority" value={urgentCount} helper="Act first" />
        <DashboardCard label="Medium priority" value={mediumCount} helper="Monitor closely" />
        <DashboardCard label="Low priority" value={lowCount} helper="Stable for now" />
      </div>

      {topRecommendation && (
        <div className="mt-6">
          <RecommendationPanel donation={topRecommendation} />
        </div>
      )}

      <DonationMap
        donations={activeDonations}
        filters={filters}
        loading={loading}
        onAcceptDonation={handleAcceptDonation}
        onDetails={setSelectedDonation}
        refreshKey={mapRefreshKey}
        showAcceptActions
      />

      {actionError && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="mt-8">
        <DonationFilterPanel filters={filters} loading={loading} onChange={setFilters} resultCount={activeDonations.length} />

        <div className="mb-4 mt-6 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-ink-900">Active Food Donations</h2>
          <p className="text-sm font-semibold text-primary-700">
            {activeDonations.length} {activeDonations.length === 1 ? 'Donation' : 'Donations'} Found
          </p>
        </div>

        {loading && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-medium text-ink-500">
            Loading available donations...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && activeDonations.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <h3 className="text-base font-semibold text-ink-900">No donations match current filters</h3>
            <p className="mt-2 text-sm text-ink-500">Adjust or clear filters to broaden the available donation list.</p>
          </div>
        )}

        {!loading && !error && activeDonations.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeDonations.map((donation) => (
              <DonationCard
                key={donation._id}
                actionLabel="Accept"
                actionLoading={actionLoadingId === donation._id}
                donation={donation}
                onAction={handleAcceptDonation}
                onDetails={setSelectedDonation}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-ink-900">Accepted Donations</h2>

        {loading && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-medium text-ink-500">
            Loading accepted donations...
          </div>
        )}

        {!loading && !error && acceptedDonations.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <h3 className="text-base font-semibold text-ink-900">No accepted donations yet</h3>
            <p className="mt-2 text-sm text-ink-500">Accepted donations will move here with reserved status.</p>
          </div>
        )}

        {!loading && !error && acceptedDonations.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {acceptedDonations.map((donation) => (
              <DonationCard
                key={donation._id}
                actionLabel="Reject"
                actionLoading={actionLoadingId === donation._id}
                donation={donation}
                onAction={handleRejectDonation}
                onDetails={setSelectedDonation}
              />
            ))}
          </div>
        )}
      </div>

      {selectedDonation && (
        <DonationDetailModal
          donation={selectedDonation}
          onClose={() => setSelectedDonation(null)}
          primaryAction={
            ['available', 'active'].includes(selectedDonation.status)
              ? () => handleAcceptDonation(selectedDonation)
              : selectedDonation.acceptedByNgo
                ? () => handleRejectDonation(selectedDonation)
                : null
          }
          primaryActionLabel={['available', 'active'].includes(selectedDonation.status) ? 'Accept Donation' : 'Reject Donation'}
          primaryActionLoading={actionLoadingId === selectedDonation._id}
        />
      )}
    </section>
  );
};

export default NgoDashboard;
