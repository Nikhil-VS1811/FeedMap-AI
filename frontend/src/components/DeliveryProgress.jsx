const steps = [
  { color: 'bg-blue-500', label: 'Reserved', timestampKey: 'reservedAt', value: 'reserved' },
  { color: 'bg-amber-500', label: 'Picked Up', timestampKey: 'pickedUpAt', value: 'picked_up' },
  { color: 'bg-orange-500', label: 'In Transit', timestampKey: 'transitStartedAt', value: 'in_transit' },
  { color: 'bg-emerald-500', label: 'Delivered', timestampKey: 'deliveredAt', value: 'delivered' },
  { color: 'bg-green-800', label: 'Completed', timestampKey: 'completedAt', value: 'completed' },
];

const statusRank = {
  completed: 4,
  delivered: 3,
  in_transit: 2,
  picked_up: 1,
  reserved: 0,
};

const formatTime = (value) => {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const DeliveryProgress = ({ donation, status }) => {
  const currentRank = statusRank[status] ?? 0;

  return (
    <div className="mt-4 rounded-lg bg-white p-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {steps.map((step, index) => {
          const isDone = index < currentRank;
          const isCurrent = index === currentRank;
          const timestamp = donation ? formatTime(donation[step.timestampKey]) : '';

          return (
            <div key={step.value} className="min-w-0">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  isDone || isCurrent ? step.color : 'bg-slate-200'
                } ${isCurrent ? 'animate-pulse' : ''}`}
              />
              <p className={`mt-1 truncate text-xs font-semibold ${isDone || isCurrent ? 'text-ink-900' : 'text-ink-500'}`}>
                {step.label}
              </p>
              <p className="mt-0.5 min-h-4 truncate text-[11px] text-ink-500">{timestamp}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeliveryProgress;
