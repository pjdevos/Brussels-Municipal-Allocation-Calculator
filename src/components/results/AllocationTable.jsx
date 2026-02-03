import { useState } from 'react';
import { formatEuro, formatPercentChange } from '../../utils/formatters';
import { StatusBadge } from './StatusBadge';

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

    return {
      ...scenario,
      baselineCalculated: baseline.calculated,
      calcChange,
      calcChangePercent,
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
      case 'baselineCalculated':
        comparison = a.baselineCalculated - b.baselineCalculated;
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

  const SortHeader = ({ field, children }) => (
    <th
      onClick={() => handleSort(field)}
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
              <SortHeader field="name">Municipality</SortHeader>
              <SortHeader field="baselineCalculated">Baseline Calc.</SortHeader>
              <SortHeader field="calculated">Scenario Calc.</SortHeader>
              <SortHeader field="calcChange">Change</SortHeader>
              <SortHeader field="paid">Paid</SortHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedResults.map(result => (
              <tr
                key={result.id}
                className={`${result.isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    {result.isSelected && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                    )}
                    <span className={`text-sm ${result.isSelected ? 'font-semibold text-blue-900' : 'text-gray-900'}`}>
                      {result.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {formatEuro(result.baselineCalculated)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {formatEuro(result.calculated)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`text-sm font-medium ${
                    result.calcChange > 0
                      ? 'text-green-600'
                      : result.calcChange < 0
                        ? 'text-red-600'
                        : 'text-gray-500'
                  }`}>
                    {result.calcChange !== 0 ? (
                      <>
                        {formatEuro(result.calcChange)}
                        <br />
                        <span className="text-xs">
                          ({formatPercentChange(result.calcChangePercent)})
                        </span>
                      </>
                    ) : (
                      '—'
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">
                  {formatEuro(result.paid)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
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
