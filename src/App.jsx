import { useState, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { ControlPanel } from './components/controls/ControlPanel';
import { SummaryStats } from './components/results/SummaryStats';
import { AllocationTable } from './components/results/AllocationTable';
import { useScenario } from './hooks/useScenario';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load municipality data
  useEffect(() => {
    fetch('/data/municipalities.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load municipality data');
        }
        return response.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Use scenario hook for state management and calculations
  const {
    selectedMunicipality,
    tweaks,
    municipalities,
    baselineResults,
    scenarioResults,
    selectedBaseline,
    selectMunicipality,
    updateTweak,
    resetTweaks,
  } = useScenario(data);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading municipality data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800">Error Loading Data</h2>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Control Panel - Left Side */}
        <div className="lg:col-span-1">
          <ControlPanel
            municipalities={data?.municipalities || []}
            selectedMunicipality={selectedMunicipality}
            selectedBaseline={selectedBaseline}
            tweaks={tweaks}
            onSelectMunicipality={selectMunicipality}
            onUpdateTweak={updateTweak}
            onResetTweaks={resetTweaks}
          />
        </div>

        {/* Results - Right Side */}
        <div className="lg:col-span-2">
          <SummaryStats
            baselineResults={baselineResults}
            scenarioResults={scenarioResults}
            selectedMunicipality={selectedMunicipality}
          />

          <AllocationTable
            baselineResults={baselineResults}
            scenarioResults={scenarioResults}
            selectedMunicipality={selectedMunicipality}
          />
        </div>
      </div>
    </AppLayout>
  );
}

export default App;
