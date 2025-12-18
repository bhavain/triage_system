import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { UrgentQueue } from './pages/UrgentQueue';
import { VolumeAnalysis } from './pages/VolumeAnalysis';
import { BugSearch } from './pages/BugSearch';
import { ExecutiveSummary } from './pages/ExecutiveSummary';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<UrgentQueue />} />
          <Route path="trends" element={<VolumeAnalysis />} />
          <Route path="bugs" element={<BugSearch />} />
          <Route path="summary" element={<ExecutiveSummary />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
