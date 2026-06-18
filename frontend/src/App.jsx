import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import Home from './pages/Home';
import Analyze from './pages/Analyze';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import Legal from './pages/Legal';
import Feedback from './pages/Feedback';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analyze/:ticker" element={<Analyze />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/legal/:section" element={<Legal />} />
        <Route path="/feedback" element={<Feedback />} />
      </Routes>
      <SpeedInsights />
      <Analytics />
    </BrowserRouter>
  );
}
