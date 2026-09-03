const STYLES = {
  online: 'bg-emerald-100 text-emerald-700',
  offline: 'bg-slate-100 text-slate-500',
  unknown: 'bg-amber-100 text-amber-700',
};

export function StatusBadge({ device }) {
  let label = device.is_active ? 'online' : 'offline';
  let style = STYLES[label];
  if (!device.is_known) {
    label = device.is_active ? 'online · unreviewed' : 'offline · unreviewed';
    style = STYLES.unknown;
  }

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}
