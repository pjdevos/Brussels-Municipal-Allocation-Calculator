import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatEuro } from '../utils/formatters';
import { StatusBadge } from '../components/results/StatusBadge';
import { useLanguage } from '../i18n/LanguageContext';

function formatDelta(value) {
  if (value === 0) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatEuro(value)}`;
}

export function AllMunicipalities({ baselineResults, scenarioResults, selectedMunicipality }) {
  const { t, getMunicipalityName } = useLanguage();
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!scenarioResults.length) return null;

  // Combine baseline and scenario
  const combinedResults = scenarioResults.map(scenario => {
    const baseline = baselineResults.find(b => b.id === scenario.id);
    return {
      ...scenario,
      baselineCalculated: baseline.calculated,
      baselinePaid: baseline.paid,
      calcChange: scenario.calculated - baseline.calculated,
      paidChange: scenario.paid - baseline.paid,
      isSelected: scenario.id === selectedMunicipality,
    };
  });

  // Filter
  let filtered = combinedResults;
  if (statusFilter !== 'all') {
    filtered = filtered.filter(r => r.status === statusFilter);
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.name_fr.toLowerCase().includes(q) ||
      r.name_nl.toLowerCase().includes(q)
    );
  }

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case 'name': cmp = getMunicipalityName(a).localeCompare(getMunicipalityName(b)); break;
      case 'calculated': cmp = a.calculated - b.calculated; break;
      case 'calcChange': cmp = a.calcChange - b.calcChange; break;
      case 'paid': cmp = a.paid - b.paid; break;
      case 'paidChange': cmp = a.paidChange - b.paidChange; break;
      default: cmp = 0;
    }
    return sortDirection === 'asc' ? cmp : -cmp;
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
          <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </th>
  );

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {t('back_to_dashboard')}
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div>
          <label className="text-xs text-gray-500 font-medium mr-2">{t('table_filter_status')}:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">{t('table_filter_all')}</option>
            <option value="normal">{t('mechanism_normal')}</option>
            <option value="standstill">{t('mechanism_standstill')}</option>
            <option value="capped">{t('mechanism_capped')}</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium mr-2">{t('table_search')}:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="..."
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm w-48"
          />
        </div>
        <p className="text-xs text-gray-500 ml-auto">{t('table_sort_hint')}</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <SortHeader field="name">{t('table_municipality')}</SortHeader>
                <SortHeader field="calculated">{t('table_calculated')}</SortHeader>
                <SortHeader field="calcChange">{t('table_delta_calc')}</SortHeader>
                <SortHeader field="paid">{t('table_paid')}</SortHeader>
                <SortHeader field="paidChange">{t('table_delta_paid')}</SortHeader>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table_mechanism')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sorted.map(result => (
                <tr
                  key={result.id}
                  className={result.isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      {result.isSelected && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${result.isSelected ? 'font-semibold text-blue-900' : 'text-gray-900'}`}>
                        {getMunicipalityName(result)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatEuro(result.calculated)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {formatDelta(result.calcChange)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    {formatEuro(result.paid)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {formatDelta(result.paidChange)}
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
    </div>
  );
}
