import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { AllMunicipalities } from './pages/AllMunicipalities';
import { About } from './pages/About';
import { LanguageProvider } from './i18n/LanguageContext';
import { useScenario } from './hooks/useScenario';

function AppContent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/data/municipalities.json')
      .then(response => {
        if (!response.ok) throw new Error('Failed to load municipality data');
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

  const {
    selectedMunicipality,
    tweaks,
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
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800">Error</h2>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              data={data}
              selectedMunicipality={selectedMunicipality}
              selectedBaseline={selectedBaseline}
              tweaks={tweaks}
              baselineResults={baselineResults}
              scenarioResults={scenarioResults}
              selectMunicipality={selectMunicipality}
              updateTweak={updateTweak}
              resetTweaks={resetTweaks}
            />
          }
        />
        <Route
          path="/municipalities"
          element={
            <AllMunicipalities
              baselineResults={baselineResults}
              scenarioResults={scenarioResults}
              selectedMunicipality={selectedMunicipality}
            />
          }
        />
        <Route path="/about" element={<About />} />
      </Routes>
    </AppLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
