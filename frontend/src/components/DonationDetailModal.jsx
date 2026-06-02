import { CalendarClock, MapPin, Package, User, X } from 'lucide-react';

import ExpiryBadge from './ExpiryBadge';
import FoodImage from './FoodImage';
import PriorityBadge from './PriorityBadge';
import PriorityInsights from './PriorityInsights';
import PriorityProgress from './PriorityProgress';
import RecommendationPanel from './RecommendationPanel';
import StatusBadge from './StatusBadge';

const categoryLabels = {
  bakery: 'Bakery',
  cooked_food: 'Cooked Food',
  dairy: 'Dairy',
  fruits_vegetables: 'Fruits & Vegetables',
  grains: 'Grains',
  other: 'Other',
  packaged_food: 'Packaged Food',
  raw_food: 'Raw Food',
};

const DonationDetailModal = ({ donation, onClose, primaryAction, primaryActionLabel, primaryActionLoading }) => {
  if (!donation) {
    return null;
  }

  const expiry = new Date(donation.expiryTime);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 px-4 py-4 sm:items-center">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-soft">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-ink-900">{donation.title}</h2>
              <StatusBadge status={donation.status} />
              <PriorityBadge level={donation.priorityLevel} />
              <ExpiryBadge donation={donation} />
            </div>
            <p className="text-sm text-ink-500">{categoryLabels[donation.category] || donation.category}</p>
          </div>
          <button type="button" className="rounded-lg p-2 text-ink-500 hover:bg-slate-100" onClick={onClose} aria-label="Close details">
            <X size={20} />
          </button>
        </div>

        <FoodImage alt={donation.title} className="h-56 w-full" src={donation.image} />

        <div className="space-y-4 p-5 text-sm text-ink-700">
          <p className="flex items-center gap-2">
            <Package size={17} className="text-ink-500" />
            <span className="font-medium text-ink-900">Quantity:</span> {donation.quantity}
          </p>
          <p className="flex items-center gap-2">
            <CalendarClock size={17} className="text-ink-500" />
            <span className="font-medium text-ink-900">Expiry:</span> {expiry.toLocaleString()}
          </p>
          <p className="flex items-start gap-2">
            <MapPin size={17} className="mt-0.5 shrink-0 text-ink-500" />
            <span>
              <span className="font-medium text-ink-900">Pickup:</span> {donation.pickupAddress}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <User size={17} className="text-ink-500" />
            <span className="font-medium text-ink-900">Donor:</span> {donation.donor?.name || 'Unknown donor'}
          </p>
          {donation.acceptedByNgo && (
            <p className="flex items-center gap-2">
              <User size={17} className="text-ink-500" />
              <span className="font-medium text-ink-900">Accepted by:</span> {donation.acceptedByNgo.name}
            </p>
          )}
          {donation.assignedDelivery && (
            <p className="flex items-center gap-2">
              <User size={17} className="text-ink-500" />
              <span className="font-medium text-ink-900">Delivery:</span> {donation.assignedDelivery.name}
            </p>
          )}
          <p className="text-xs text-ink-500">
            Coordinates: {donation.latitude}, {donation.longitude}
          </p>
          <PriorityProgress score={donation.priorityScore} />
          <PriorityInsights insights={donation.priorityInsights} />
          <RecommendationPanel donation={donation} />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end">
          <button type="button" className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-slate-50" onClick={onClose}>
            Close
          </button>
          {primaryAction && (
            <button
              type="button"
              disabled={primaryActionLoading}
              className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
              onClick={primaryAction}
            >
              {primaryActionLoading ? 'Working...' : primaryActionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationDetailModal;
