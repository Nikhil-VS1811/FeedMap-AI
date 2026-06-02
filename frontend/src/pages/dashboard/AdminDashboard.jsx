import { RefreshCcw, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { assignDelivery, getAllDonations, removeDonation, updateDonationStatus } from '../../api/donationApi';
import { getAllUsers, updateNgoApproval } from '../../api/userApi';
import AnalyticsDashboard from '../../components/analytics/AnalyticsDashboard';
import FoodImage from '../../components/FoodImage';
import StatusBadge from '../../components/StatusBadge';
import { dismissToast, showError, showLoading, showSuccess, showWarning } from '../../utils/toast';
import DashboardCard from './DashboardCard';

const statuses = ['available', 'active', 'reserved', 'picked_up', 'in_transit', 'completed', 'delivered', 'expired', 'cancelled'];
const ngoStatuses = ['pending', 'approved', 'rejected'];

const AdminDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedDeliveryByDonation, setSelectedDeliveryByDonation] = useState({});

  const stats = useMemo(
    () => ({
      donations: donations.length,
      issues: users.filter((user) => user.role === 'ngo' && user.ngoApprovalStatus === 'pending').length,
      ngoUsers: users.filter((user) => user.role === 'ngo').length,
      users: users.length,
    }),
    [donations, users]
  );

  const deliveryUsers = users.filter((user) => user.role === 'delivery');
  const reservedDonations = donations.filter((donation) => donation.status === 'reserved' && !donation.assignedDelivery);

  const loadAdminData = async () => {
    setError('');
    setLoading(true);

    try {
      const [usersResponse, donationsResponse] = await Promise.all([getAllUsers(), getAllDonations()]);
      setUsers(usersResponse.data.users);
      setDonations(donationsResponse.data.donations);
      if (donationsResponse.data.donations.some((donation) => donation.expiryLevel === 'RED' || donation.priorityLevel === 'HIGH')) {
        showWarning('Critical donation requires attention', { icon: 'AI', id: 'admin-critical-donation' });
      }
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Could not load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleDonationStatus = async (donationId, status) => {
    setUpdating(`${donationId}:status`);
    const toastId = showLoading('Updating status...');

    try {
      const { data } = await updateDonationStatus(donationId, status);
      setDonations((current) => current.map((donation) => (donation._id === donationId ? data.donation : donation)));
      dismissToast(toastId);
      showSuccess('Donation status updated');
    } catch (apiError) {
      dismissToast(toastId);
      setError(apiError.response?.data?.message || 'Could not update donation status.');
    } finally {
      setUpdating('');
    }
  };

  const handleRemoveDonation = async (donationId) => {
    setUpdating(`${donationId}:remove`);
    const toastId = showLoading('Removing donation...');

    try {
      await removeDonation(donationId);
      setDonations((current) => current.filter((donation) => donation._id !== donationId));
      dismissToast(toastId);
      showSuccess('Donation removed');
    } catch (apiError) {
      dismissToast(toastId);
      setError(apiError.response?.data?.message || 'Could not remove donation.');
    } finally {
      setUpdating('');
    }
  };

  const handleAssignDelivery = async (donationId) => {
    const deliveryId = selectedDeliveryByDonation[donationId];

    if (!deliveryId) {
      setError('Select a delivery partner before assigning.');
      showWarning('Select a delivery partner before assigning.');
      return;
    }

    setUpdating(`${donationId}:assign`);
    const toastId = showLoading('Assigning delivery...', { icon: '🚚' });

    try {
      const { data } = await assignDelivery(donationId, deliveryId);
      setDonations((current) => current.map((donation) => (donation._id === donationId ? data.donation : donation)));
      setSelectedDeliveryByDonation((current) => ({ ...current, [donationId]: '' }));
      dismissToast(toastId);
      showSuccess('Delivery assigned successfully', { icon: '🚚' });
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Could not assign delivery partner.';
      dismissToast(toastId);
      setError(message);
      showError(message);
    } finally {
      setUpdating('');
    }
  };

  const handleNgoApproval = async (userId, ngoApprovalStatus) => {
    setUpdating(`${userId}:ngo`);
    const toastId = showLoading('Updating NGO status...');

    try {
      const { data } = await updateNgoApproval(userId, ngoApprovalStatus);
      setUsers((current) => current.map((user) => (user._id === userId ? data.user : user)));
      dismissToast(toastId);
      if (ngoApprovalStatus === 'approved') {
        showSuccess('NGO approved');
      } else if (ngoApprovalStatus === 'rejected') {
        showWarning('NGO rejected');
      } else {
        showSuccess('NGO approval status updated');
      }
    } catch (apiError) {
      dismissToast(toastId);
      setError(apiError.response?.data?.message || 'Could not update NGO approval.');
    } finally {
      setUpdating('');
    }
  };

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">Monitor users, donations, delivery flow, and platform health.</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-white"
          onClick={loadAdminData}
        >
          <RefreshCcw size={17} />
          Refresh
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard label="Users" value={stats.users} helper="Registered across all roles" />
        <DashboardCard label="NGOs" value={stats.ngoUsers} helper="Organizations on platform" />
        <DashboardCard label="Donations" value={stats.donations} helper="Total food listings" />
        <DashboardCard label="Pending approvals" value={stats.issues} helper="NGOs needing review" />
      </div>

      {loading && <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 text-sm font-medium text-ink-500">Loading admin data...</div>}
      {!loading && error && <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>}

      {!loading && (
        <>
          <div className="mt-8">
            <AnalyticsDashboard />
          </div>

          <div className="mt-8 rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-ink-900">Assign Delivery Partner</h2>
              <p className="mt-1 text-sm text-ink-500">Reserved donations are ready for delivery assignment.</p>
            </div>
            <div className="grid gap-4 p-5 lg:grid-cols-2">
              {reservedDonations.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-ink-500 lg:col-span-2">
                  No reserved donations waiting for assignment.
                </div>
              ) : (
                reservedDonations.map((donation) => (
                  <article key={donation._id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-ink-900">{donation.title}</h3>
                        <p className="mt-1 text-sm text-ink-500">{donation.quantity}</p>
                      </div>
                      <StatusBadge status={donation.status} />
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-ink-700 sm:grid-cols-2">
                      <p>
                        <span className="font-medium text-ink-900">NGO:</span> {donation.acceptedByNgo?.name || '-'}
                      </p>
                      <p>
                        <span className="font-medium text-ink-900">Donor:</span> {donation.donor?.name || '-'}
                      </p>
                      <p className="sm:col-span-2">
                        <span className="font-medium text-ink-900">Expiry:</span> {new Date(donation.expiryTime).toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <select
                        className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
                        value={selectedDeliveryByDonation[donation._id] || ''}
                        onChange={(event) =>
                          setSelectedDeliveryByDonation((current) => ({ ...current, [donation._id]: event.target.value }))
                        }
                      >
                        <option value="">Select delivery partner</option>
                        {deliveryUsers.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={updating === `${donation._id}:assign`}
                        className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
                        onClick={() => handleAssignDelivery(donation._id)}
                      >
                        {updating === `${donation._id}:assign` ? 'Assigning...' : 'Assign'}
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-ink-900">All Users</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-ink-500">
                  <tr>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">NGO Approval</th>
                    <th className="px-5 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-ink-900">{user.name}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-ink-500">{user.email}</td>
                      <td className="whitespace-nowrap px-5 py-4 capitalize text-ink-700">{user.role}</td>
                      <td className="whitespace-nowrap px-5 py-4">
                        {user.role === 'ngo' ? (
                          <select
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
                            value={user.ngoApprovalStatus || 'pending'}
                            disabled={updating === `${user._id}:ngo`}
                            onChange={(event) => handleNgoApproval(user._id, event.target.value)}
                          >
                            {ngoStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-ink-500">Not required</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-ink-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-ink-900">All Donations</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-ink-500">
                  <tr>
                    <th className="px-5 py-3">Food</th>
                    <th className="px-5 py-3">Donor</th>
                    <th className="px-5 py-3">NGO</th>
                    <th className="px-5 py-3">Recommended NGO</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Match</th>
                    <th className="px-5 py-3">Expiry</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {donations.map((donation) => (
                    <tr key={donation._id}>
                      <td className="min-w-52 px-5 py-4">
                        <div className="flex items-center gap-3">
                          <FoodImage alt={donation.title} className="h-12 w-16 shrink-0 rounded-md" src={donation.image} />
                          <div>
                            <p className="font-medium text-ink-900">{donation.title}</p>
                            <p className="text-xs text-ink-500">{donation.quantity}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-ink-500">{donation.donor?.name || 'Unknown'}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-ink-500">{donation.acceptedByNgo?.name || '-'}</td>
                      <td className="min-w-52 px-5 py-4">
                        <p className="font-medium text-ink-900">{donation.recommendedNgo?.name || 'Pending'}</p>
                        <p className="text-xs text-ink-500">{donation.recommendationReason || 'No recommendation yet'}</p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <StatusBadge status={donation.status} />
                      </td>
                      <td className="min-w-40 px-5 py-4">
                        <p className="text-sm font-semibold text-ink-900">{donation.ngoMatchScore || 0}/100</p>
                        <p className="text-xs text-ink-500">
                          {donation.acceptedByNgo && donation.recommendedNgo && donation.acceptedByNgo._id === donation.recommendedNgo._id
                            ? 'Accepted best match'
                            : donation.acceptedByNgo
                              ? 'Accepted different NGO'
                              : 'Awaiting acceptance'}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-ink-500">{new Date(donation.expiryTime).toLocaleString()}</td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
                            value={donation.status}
                            disabled={updating === `${donation._id}:status`}
                            onChange={(event) => handleDonationStatus(donation._id, event.target.value)}
                          >
                            {statuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            disabled={updating === `${donation._id}:remove`}
                            className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={() => handleRemoveDonation(donation._id)}
                            aria-label="Remove donation"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default AdminDashboard;
