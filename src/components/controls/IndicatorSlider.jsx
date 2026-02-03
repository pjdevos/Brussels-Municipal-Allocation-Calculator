import { useState } from 'react';
import { formatNumber } from '../../utils/formatters';

export function IndicatorSlider({
  label,
  description,
  tooltip,
  value,
  baseline,
  min,
  max,
  step,
  unit,
  onChange,
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const percentChange = baseline !== 0 ? ((value - baseline) / baseline) * 100 : 0;
  const hasChanged = Math.abs(value - baseline) > 0.001;

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
    <div className="mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-900">{label}</label>
            {tooltip && (
              <div className="relative">
                <button
                  type="button"
                  className="w-4 h-4 rounded-full bg-gray-300 text-gray-600 text-xs flex items-center justify-center hover:bg-gray-400"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={() => setShowTooltip(!showTooltip)}
                >
                  ?
                </button>
                {showTooltip && (
                  <div className="absolute z-10 left-6 top-0 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                    {tooltip}
                  </div>
                )}
              </div>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
        <div className="text-right ml-4">
          <span className="text-sm font-semibold text-gray-900">
            {formatValue(value)}
          </span>
          {hasChanged && (
            <span className="ml-2 text-sm font-medium text-gray-600">
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
        className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />

      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>Min: {formatValue(min)}</span>
        <button
          type="button"
          onClick={() => onChange(baseline)}
          className="text-blue-600 font-medium hover:text-blue-800 hover:underline"
        >
          Baseline: {formatValue(baseline)}
        </button>
        <span>Max: {formatValue(max)}</span>
      </div>
    </div>
  );
}
