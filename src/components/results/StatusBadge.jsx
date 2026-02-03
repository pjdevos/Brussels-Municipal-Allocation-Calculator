export function StatusBadge({ status }) {
  const styles = {
    normal: 'bg-green-100 text-green-800',
    standstill: 'bg-gray-100 text-gray-800',
    capped: 'bg-orange-100 text-orange-800',
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
