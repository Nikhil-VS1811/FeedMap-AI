const ChartCard = ({ children, title }) => (
  <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
    <div className="mt-4 h-72">{children}</div>
  </section>
);

export default ChartCard;
