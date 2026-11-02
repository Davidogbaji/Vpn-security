import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { IpLookupPage } from './pages/IpLookupPage';
import { DetectionPage } from './pages/DetectionPage';
import { LeakTestPage } from './pages/LeakTestPage';
import { NetworkToolsPage } from './pages/NetworkToolsPage';
import { BulkAnalysisPage } from './pages/BulkAnalysisPage';
import { HistoryPage } from './pages/HistoryPage';
import { AdminPage } from './pages/AdminPage';
import { HelpCenterPage } from './pages/HelpCenterPage';

export function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [searchTargetIp, setSearchTargetIp] = useState<string>('');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchIp = (ip: string) => {
    setSearchTargetIp(ip);
  };

  const handleNavigateToIp = (ip: string) => {
    setSearchTargetIp(ip);
    setCurrentPage('detection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-cyber-darkest text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Navigation Header */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main Page Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'landing' && (
          <LandingPage
            onNavigate={handleNavigate}
            onSearchIp={handleSearchIp}
          />
        )}

        {currentPage === 'dashboard' && (
          <DashboardPage
            onNavigate={handleNavigate}
            onSearchIp={handleSearchIp}
          />
        )}

        {currentPage === 'lookup' && (
          <IpLookupPage initialIp={searchTargetIp} />
        )}

        {currentPage === 'detection' && (
          <DetectionPage initialIp={searchTargetIp} />
        )}

        {currentPage === 'leak-test' && <LeakTestPage />}

        {currentPage === 'tools' && <NetworkToolsPage />}

        {currentPage === 'bulk' && <BulkAnalysisPage />}

        {currentPage === 'history' && (
          <HistoryPage
            onOpenAuth={() => setAuthModalOpen(true)}
            onNavigateToIp={handleNavigateToIp}
          />
        )}

        {currentPage === 'admin' && (
          <AdminPage onOpenAuth={() => setAuthModalOpen(true)} />
        )}

        {currentPage === 'help' && <HelpCenterPage />}
      </main>

      {/* Global Academic Footer */}
      <Footer />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
