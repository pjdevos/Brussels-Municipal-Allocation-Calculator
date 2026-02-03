import { formatEuro, formatPercent } from '../../utils/formatters';
import { WEIGHTS, TOTAL_BUDGET } from '../../engine/constants';

const CRITERIA = [
  { key: 'surface', label: 'Surface area', labelFr: 'Superficie', weight: '2/105', tweakable: false },
  { key: 'populationGrowth', label: 'Population growth', labelFr: 'Croissance démographique', weight: '6/105', tweakable: false },
  { key: 'unemployment', label: 'Unemployment >1y', labelFr: 'Chômage >1 an', weight: '15/105', tweakable: true },
  { key: 'ris', label: 'RIS beneficiaries', labelFr: 'Bénéficiaires RIS', weight: '15/105', tweakable: true },
  { key: 'poverty', label: 'Poverty risk', labelFr: 'Risque de pauvreté', weight: '15/105', tweakable: true },
  { key: 'daycare', label: 'Daycare places', labelFr: 'Places crèches', weight: '1/105', tweakable: false },
  { key: 'schools', label: 'School population', labelFr: 'Population scolaire', weight: '4/105', tweakable: false },
  { key: 'propertyTax', label: 'Property tax capacity', labelFr: 'Capacité précompte immobilier', weight: '20/105', tweakable: true },
  { key: 'incomeTax', label: 'Income tax capacity', labelFr: 'Capacité IPP', weight: '12/105', tweakable: true },
  { key: 'density', label: 'Population density', labelFr: 'Densité de population', weight: '15/105', tweakable: false },
];

const WEIGHT_VALUES = {
  surface: WEIGHTS.SURFACE,
  populationGrowth: WEIGHTS.POPULATION_GROWTH,
  unemployment: WEIGHTS.UNEMPLOYMENT,
  ris: WEIGHTS.RIS,
  poverty: WEIGHTS.POVERTY,
  daycare: WEIGHTS.DAYCARE,
  schools: WEIGHTS.SCHOOLS,
  propertyTax: WEIGHTS.PROPERTY_TAX,
  incomeTax: WEIGHTS.INCOME_TAX,
  density: WEIGHTS.DENSITY,
};

export function AllocationBreakdown({ scenarioResults, selectedMunicipality }) {
  if (!selectedMunicipality || !scenarioResults.length) {
    return null;
  }

  const selected = scenarioResults.find(r => r.id === selectedMunicipality);
  if (!selected || !selected.keys) return null;

  const { keys } = selected;

  // Calculate contribution for each criterion
  const contributions = {};
  let total = 0;
  for (const criterion of CRITERIA) {
    const weight = WEIGHT_VALUES[criterion.key];
    const key = keys[criterion.key] || 0;
    const contribution = TOTAL_BUDGET * weight * key;
    contributions[criterion.key] = contribution;
    total += contribution;
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mt-6">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">
          Calculated Amount - Composition
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Montant calculé - composition / Berekend bedrag - samenstelling
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Criterion / Critère
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Weight / Poids
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Distribution Key / Clé
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Contribution
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {CRITERIA.map(criterion => {
              const key = keys[criterion.key] || 0;
              const contribution = contributions[criterion.key];

              return (
                <tr
                  key={criterion.key}
                  className={criterion.tweakable ? 'bg-blue-50' : ''}
                >
                  <td className="px-4 py-3">
                    <span className={criterion.tweakable ? 'font-semibold' : ''}>
                      {criterion.label}
                    </span>
                    <span className="text-gray-500 text-xs ml-2">
                      {criterion.labelFr}
                    </span>
                    {criterion.tweakable && (
                      <span className="ml-2 text-xs text-blue-600 font-medium">
                        (adjustable)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {criterion.weight}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {formatPercent(key)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatEuro(contribution)}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-gray-100 font-bold">
              <td className="px-4 py-3">
                TOTAL CALCULATED
                <span className="text-gray-500 text-xs ml-2 font-normal">
                  Total calculé / Totaal berekend
                </span>
              </td>
              <td className="px-4 py-3 text-right">105/105</td>
              <td className="px-4 py-3 text-right">—</td>
              <td className="px-4 py-3 text-right">{formatEuro(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 bg-gray-50 border-t text-xs text-gray-600">
        <span className="inline-block w-3 h-3 bg-blue-50 border border-blue-200 mr-2"></span>
        Highlighted rows = adjustable indicators in this scenario / Lignes surlignées = indicateurs ajustables
      </div>
    </div>
  );
}
