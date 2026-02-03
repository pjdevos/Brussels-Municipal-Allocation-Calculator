import { useState } from 'react';
import { formatEuro } from '../../utils/formatters';
import { StatusBadge } from './StatusBadge';

function formatDelta(value) {
  if (value === 0) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatEuro(value)}`;
}

function formatDeltaPercent(value) {
  if (value === 0) return '';
  const sign = value > 0 ? '+' : '';
  return `(${sign}${value.toFixed(2)}%)`;
}

export function AllocationTable({ baselineResults, scenarioResults, selectedMunicipality }) {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  if (!scenarioResults.length) return null;

  // Combine baseline and scenario results
  const combinedResults = scenarioResults.map(scenario => {
    const baseline = baselineResults.find(b => b.id === scenario.id);

    const calcChange = scenario.calculated - baseline.calculated;
    const calcChangePercent = baseline.calculated !== 0
      ? (calcChange / baseline.calculated) * 100
      : 0;

    const paidChange = scenario.paid - baseline.paid;
    const paidChangePercent = baseline.paid !== 0
      ? (paidChange / baseline.paid) * 100
      : 0;

    return {
      ...scenario,
      baselineCalculated: baseline.calculated,
      baselinePaid: baseline.paid,
      calcChange,
      calcChangePercent,
      paidChange,
      paidChangePercent,
      isSelected: scenario.id === selectedMunicipality,
    };
  });

  // Sort results
  const sortedResults = [...combinedResults].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'calculated':
        comparison = a.calculated - b.calculated;
        break;
      case 'calcChange':
        comparison = a.calcChange - b.calcChange;
        break;
      case 'paid':
        comparison = a.paid - b.paid;
        break;
      case 'paidChange':
        comparison = a.paidChange - b.paidChange;
        break;
      default:
        comparison = 0;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortHeader = ({ field, children, className = '' }) => (
    <th
      onClick={() => handleSort(field)}
      className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${className}`}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </th>
  );

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">
          Allocation Results / Résultats des dotations
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Click column headers to sort / Cliquez sur les en-têtes pour trier
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <SortHeader field="name">
                <span>Municipality</span>
                <span className="block text-[10px] font-normal normal-case">Commune / Gemeente</span>
              </SortHeader>
              <SortHeader field="calculated">
                <span>Calculated</span>
                <span className="block text-[10px] font-normal normal-case">Calculé / Berekend</span>
              </SortHeader>
              <SortHeader field="calcChange">
                <span>Δ Calculated</span>
              </SortHeader>
              <SortHeader field="paid">
                <span>Paid</span>
                <span className="block text-[10px] font-normal normal-case">Versé / Betaald</span>
              </SortHeader>
              <SortHeader field="paidChange">
                <span>Δ Paid</span>
              </SortHeader>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <span>Mechanism</span>
                <span className="block text-[10px] font-normal normal-case">Mécanisme</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedResults.map(result => (
              <tr
                key={result.id}
                className={`${result.isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    {result.isSelected && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${result.isSelected ? 'font-semibold text-blue-900' : 'text-gray-900'}`}>
                      {result.name}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {formatEuro(result.calculated)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {result.calcChange !== 0 ? (
                      <>
                        {formatDelta(result.calcChange)}
                        <span className="text-xs ml-1 text-gray-500">
                          {formatDeltaPercent(result.calcChangePercent)}
                        </span>
                      </>
                    ) : (
                      '—'
                    )}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">
                  {formatEuro(result.paid)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <span className={`text-sm font-medium ${
                    result.status === 'normal' && result.paidChange !== 0
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }`}>
                    {result.paidChange !== 0 ? (
                      <>
                        {formatDelta(result.paidChange)}
                        <span className="text-xs ml-1 opacity-75">
                          {formatDeltaPercent(result.paidChangePercent)}
                        </span>
                      </>
                    ) : (
                      '—'
                    )}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <StatusBadge status={result.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
