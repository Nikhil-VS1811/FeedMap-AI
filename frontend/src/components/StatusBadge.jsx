const statusStyles = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  available: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 ring-rose-200',
  completed: 'bg-sky-50 text-sky-700 ring-sky-200',
  delivered: 'bg-sky-50 text-sky-700 ring-sky-200',
  expired: 'bg-slate-100 text-slate-700 ring-slate-200',
  in_transit: 'bg-violet-50 text-violet-700 ring-violet-200',
  picked_up: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  reserved: 'bg-amber-50 text-amber-700 ring-amber-200',
};

const formatStatus = (status) =>
  status
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');

const StatusBadge = ({ status }) => (
  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[status] || statusStyles.expired}`}>
    {formatStatus(status)}
  </span>
);

export default StatusBadge;
