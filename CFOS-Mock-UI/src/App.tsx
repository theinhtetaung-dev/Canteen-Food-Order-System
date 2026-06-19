
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { GlobalLayout } from './components/layout/GlobalLayout';
import { Dashboard } from './pages/Dashboard';
import { DataTable } from './pages/DataTable';
import { Settings } from './pages/Settings';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="cfos-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GlobalLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="data" element={<DataTable />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
