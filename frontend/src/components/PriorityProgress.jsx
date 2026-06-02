const PriorityProgress = ({ score = 0 }) => {
  const boundedScore = Math.max(0, Math.min(100, Number(score) || 0));
  const barColor = boundedScore >= 80 ? 'bg-red-500' : boundedScore >= 50 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div title="AI priority based on expiry, quantity, food type, and distance.">
      <div className="flex items-center justify-between text-xs font-medium text-ink-500">
        <span>AI priority</span>
        <span>{boundedScore}/100</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${boundedScore}%` }} />
      </div>
    </div>
  );
};

export default PriorityProgress;
