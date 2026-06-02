import { CalendarClock, MapPin, Package } from 'lucide-react';

import { getExpiryLevel, getRemainingTimeText } from '../utils/expiryUtils';
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

const DonationCard = ({ actionLabel, actionLoading, onAction, onDetails, donation }) => {
  const expiry = new Date(donation.expiryTime);
  const expiryLevel = getExpiryLevel(donation);
  const isExpired = expiryLevel === 'GRAY';
  const priorityBorderStyles = {
    HIGH: 'border-red-300 shadow-[0_0_24px_rgba(220,38,38,0.18)]',
    LOW: 'border-emerald-200',
    MEDIUM: 'border-amber-300',
  };
  const expiryCardStyles = {
    GRAY: 'border-slate-200 opacity-60 grayscale',
    GREEN: 'border-emerald-300 shadow-[0_0_22px_rgba(16,185,129,0.16)]',
    RED: 'border-red-400 shadow-[0_0_26px_rgba(220,38,38,0.28)] animate-pulse',
    YELLOW: 'border-amber-300 shadow-[0_0_22px_rgba(217,119,6,0.18)]',
  };

  return (
    <article
      className={`overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-300 ${
        expiryCardStyles[expiryLevel] || priorityBorderStyles[donation.priorityLevel] || 'border-slate-200'
      }`}
    >
      <FoodImage alt={donation.title} className="h-40 w-full" src={donation.image} />

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink-900">{donation.title}</h2>
            <p className="mt-1 text-sm text-ink-500">{categoryLabels[donation.category] || donation.category}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={donation.status} />
            <PriorityBadge level={donation.priorityLevel} />
            <ExpiryBadge donation={donation} />
          </div>
        </div>

        <div className="space-y-2 text-sm text-ink-700">
          <p className="flex items-center gap-2">
            <Package size={16} className="text-ink-500" />
            {donation.quantity}
          </p>
          <p className="flex items-center gap-2">
            <CalendarClock size={16} className="text-ink-500" />
            {getRemainingTimeText(donation)}
          </p>
          <p className="text-xs text-ink-500">Expires {expiry.toLocaleString()}</p>
          <p className="flex items-start gap-2">
            <MapPin size={16} className="mt-0.5 shrink-0 text-ink-500" />
            <span>{donation.pickupAddress}</span>
          </p>
        </div>

        <PriorityProgress score={donation.priorityScore} />
        <PriorityInsights insights={donation.priorityInsights} />
        <RecommendationPanel donation={donation} compact />

        {(onDetails || onAction) && (
          <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row">
            {onDetails && (
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-slate-50"
                onClick={() => onDetails(donation)}
              >
                Details
              </button>
            )}
            {onAction && (
              <button
                type="button"
                disabled={actionLoading || isExpired}
                className="rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => onAction(donation)}
              >
                {isExpired ? 'Expired' : actionLoading ? 'Working...' : actionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default DonationCard;
