import { AlertTriangle, Clock3 } from 'lucide-react';

import { getExpiryLevel, getRemainingTimeText } from '../utils/expiryUtils';

const expiryStyles = {
  GRAY: 'border-slate-200 bg-slate-100 text-slate-600',
  GREEN: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  RED: 'border-red-200 bg-red-50 text-red-700',
  YELLOW: 'border-amber-200 bg-amber-50 text-amber-700',
};

const expiryLabels = {
  GRAY: 'Expired',
  GREEN: 'Fresh',
  RED: 'Critical',
  YELLOW: 'Expiring Soon',
};

const ExpiryBadge = ({ donation }) => {
  const level = getExpiryLevel(donation);
  const Icon = level === 'RED' ? AlertTriangle : Clock3;

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${expiryStyles[level]}`}>
      {level === 'RED' && <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" />}
      <Icon size={13} />
      <span>{expiryLabels[level]}</span>
      <span className="font-medium opacity-80">{getRemainingTimeText(donation)}</span>
    </div>
  );
};

export default ExpiryBadge;
