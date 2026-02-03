export function StatusBadge({ status }) {
  const styles = {
    normal: 'bg-green-100 text-green-800',
    standstill: 'bg-yellow-100 text-yellow-800',
    capped: 'bg-blue-100 text-blue-800',
  };

  const labels = {
    normal: 'Normal',
    standstill: 'Standstill',
    capped: 'Capped +4%',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.normal}`}>
      {labels[status] || status}
    </span>
  );
}
