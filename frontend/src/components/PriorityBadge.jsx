const priorityStyles = {
  HIGH: 'border-red-200 bg-red-50 text-red-700 shadow-[0_0_18px_rgba(220,38,38,0.22)]',
  LOW: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  MEDIUM: 'border-amber-200 bg-amber-50 text-amber-700',
};

const PriorityBadge = ({ level = 'LOW' }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${priorityStyles[level] || priorityStyles.LOW}`}
    title="AI priority based on expiry, quantity, food type, and distance."
  >
    {level} PRIORITY
  </span>
);

export default PriorityBadge;
