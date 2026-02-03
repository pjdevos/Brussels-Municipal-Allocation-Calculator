import { Header } from './Header';

export function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="bg-gray-800 text-gray-400 py-4 px-6 text-center text-sm">
        <p>
          Based on the joint ordinance of July 20, 2017 (Brussels Capital Region)
        </p>
        <p className="mt-1">
          Total Budget 2024: €410,733,862
        </p>
      </footer>
    </div>
  );
}
