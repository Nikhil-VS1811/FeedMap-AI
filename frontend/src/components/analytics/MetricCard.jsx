import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

const MetricCard = ({ helper, label, trend = 'up', value }) => {
  const TrendIcon = trend === 'down' ? ArrowDownRight : ArrowUpRight;
  const trendClass = trend === 'down' ? 'text-red-600 bg-red-50' : 'text-emerald-700 bg-emerald-50';

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-ink-900">{value}</p>
        </div>
        <span className={`rounded-full p-2 ${trendClass}`}>
          <TrendIcon size={18} />
        </span>
      </div>
      <p className="mt-3 text-xs text-ink-500">{helper}</p>
    </article>
  );
};

export default MetricCard;
