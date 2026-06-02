const PriorityInsights = ({ insights = [] }) => {
  if (!insights.length) {
    return null;
  }

  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-ink-500">AI Insights</p>
      <ul className="mt-2 space-y-1 text-xs text-ink-700">
        {insights.slice(0, 3).map((insight) => (
          <li key={insight}>- {insight}</li>
        ))}
      </ul>
    </div>
  );
};

export default PriorityInsights;
