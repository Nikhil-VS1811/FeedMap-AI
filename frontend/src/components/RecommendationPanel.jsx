const getBadge = (donation) => {
  const reason = donation.recommendationReason || '';

  if (reason.includes('Nearby location')) {
    return 'Closest NGO';
  }

  if (reason.includes('Faster delivery')) {
    return 'Fastest Delivery';
  }

  return 'Best Match';
};

const RecommendationPanel = ({ donation, compact = false }) => {
  if (!donation?.recommendedNgo) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-ink-500">
        AI recommendation pending
      </div>
    );
  }

  const score = Math.max(0, Math.min(100, Number(donation.ngoMatchScore) || 0));

  return (
    <div className="rounded-lg border border-primary-100 bg-primary-50/60 p-3 shadow-[0_0_18px_rgba(34,197,94,0.12)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-primary-700">AI Recommended NGO</p>
          <p className="mt-1 text-sm font-bold text-ink-900">{donation.recommendedNgo.name}</p>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-primary-700">{getBadge(donation)}</span>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs font-medium text-ink-500">
          <span>Match score</span>
          <span>{score}/100</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-primary-600" style={{ width: `${score}%` }} />
        </div>
      </div>

      {!compact && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-ink-700">Why this NGO?</p>
          <p className="mt-1 text-xs text-ink-500">{donation.recommendationReason}</p>
        </div>
      )}
    </div>
  );
};

export default RecommendationPanel;
