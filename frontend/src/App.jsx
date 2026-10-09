import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AppShell from './components/common/AppShell';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AIAssistantPage from './pages/AIAssistantPage';
import MarineMapPage from './pages/MarineMapPage';
import PFZExplorerPage from './pages/PFZExplorerPage';
import SafetyRiskPage from './pages/SafetyRiskPage';
import SafeRoutesPage from './pages/SafeRoutesPage';
import AlertsPage from './pages/AlertsPage';
import WeatherPage from './pages/WeatherPage';
import SettingsPage from './pages/SettingsPage';
import GeofencesPage from './pages/GeofencesPage';
import ReportsPage from './pages/ReportsPage';
import CurrentsOverviewPage from './pages/CurrentsOverviewPage';
import CurrentsMapPage from './pages/CurrentsMapPage';
import CurrentsPredictionPage from './pages/CurrentsPredictionPage';
import CurrentsComparisonPage from './pages/CurrentsComparisonPage';
import CurrentsEvaluationPage from './pages/CurrentsEvaluationPage';
import CurrentsExplorerPage from './pages/CurrentsExplorerPage';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { LocationProvider } from './context/LocationContext';
import { ChatProvider } from './context/ChatContext';

function AuthenticatedApp() {
  const navigate = useNavigate();

  return (
    <ProtectedRoute>
      <AppShell
        onChatWithAI={() => navigate('/ai-assistant')}
        onAlerts={() => navigate('/alerts')}
        onAskAI={() => navigate('/ai-assistant')}
        onEmergency={() => navigate('/alerts')}
      >
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />
          <Route path="/marine-map" element={<MarineMapPage />} />
          <Route path="/pfz-explorer" element={<PFZExplorerPage />} />
          <Route path="/safety-risk" element={<SafetyRiskPage />} />
          <Route path="/safe-routes" element={<SafeRoutesPage />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/geofences" element={<GeofencesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* OCEAN CURRENT INTELLIGENCE ROUTES */}
          <Route path="/currents/overview" element={<CurrentsOverviewPage />} />
          <Route path="/currents/map" element={<CurrentsMapPage />} />
          <Route path="/currents/prediction" element={<CurrentsPredictionPage />} />
          <Route path="/currents/comparison" element={<CurrentsComparisonPage />} />
          <Route path="/currents/evaluation" element={<CurrentsEvaluationPage />} />
          <Route path="/currents/explorer" element={<CurrentsExplorerPage />} />
        </Routes>
      </AppShell>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <LocationProvider>
          <ChatProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/*" element={<AuthenticatedApp />} />
            </Routes>
          </ChatProvider>
        </LocationProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

