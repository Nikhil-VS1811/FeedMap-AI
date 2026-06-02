const DashboardCard = ({ label, value, helper }) => (
  <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-sm font-medium text-ink-500">{label}</p>
    <p className="mt-3 text-3xl font-bold text-ink-900">{value}</p>
    <p className="mt-2 text-sm text-ink-500">{helper}</p>
  </article>
);

export default DashboardCard;
