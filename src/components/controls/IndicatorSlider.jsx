import { formatNumber } from '../../utils/formatters';

export function IndicatorSlider({
  label,
  description,
  value,
  baseline,
  min,
  max,
  step,
  unit,
  onChange,
}) {
  const percentChange = baseline !== 0 ? ((value - baseline) / baseline) * 100 : 0;
  const hasChanged = value !== baseline;

  const formatValue = (val) => {
    switch (unit) {
      case 'number':
        return formatNumber(val);
      case 'percent':
        return `${(val * 100).toFixed(1)}%`;
      case 'euro_per_capita':
        return `€${formatNumber(val, 2)}`;
      default:
        return String(val);
    }
  };

  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <label className="text-sm font-medium text-gray-900">{label}</label>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
        <div className="text-right">
          <span className="text-sm font-semibold text-gray-900">
            {formatValue(value)}
          </span>
          {hasChanged && (
            <span className={`ml-2 text-sm font-medium ${percentChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
              ({percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%)
            </span>
          )}
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />

      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>Min: {formatValue(min)}</span>
        <span className="text-blue-600 font-medium">Baseline: {formatValue(baseline)}</span>
        <span>Max: {formatValue(max)}</span>
      </div>
    </div>
  );
}
