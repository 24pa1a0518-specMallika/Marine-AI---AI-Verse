import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

export default function AppShell({ children, onAskAI, onEmergency, onChatWithAI, onAlerts }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const chatHandler = onChatWithAI || onAskAI;
  const alertsHandler = onAlerts || onEmergency;

  const handleToggleSidebar = () => {
    // If on mobile view, toggle mobile drawer; if on desktop, toggle collapsed state
    if (window.innerWidth < 1024) {
      setMobileOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1E2D] flex font-sans antialiased text-[#D8D2C2]">
      {/* PERSISTENT SIDEBAR WITH COLLAPSE TOGGLE SUPPORT */}
      <Sidebar 
        mobileOpen={mobileOpen} 
        onCloseMobile={() => setMobileOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* MAIN LAYOUT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER */}
        <Header
          onAskAIClick={chatHandler}
          onEmergencyClick={alertsHandler}
          onChatWithAIClick={chatHandler}
          onAlertsClick={alertsHandler}
          onToggleMobileMenu={handleToggleSidebar}
          isSidebarCollapsed={sidebarCollapsed}
        />

        {/* MAIN PAGE WORKSPACE CONTENT */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>

        {/* BOTTOM TELEMETRY FOOTER */}
        <Footer />
      </div>
    </div>
  );
}
