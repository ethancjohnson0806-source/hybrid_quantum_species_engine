import React from 'react';
import { SessionStateProvider } from '@/contexts/SessionStateProvider';
import { WitnessStateProvider } from '@/contexts/WitnessStateProvider';
import { CorrectionJournalProvider } from '@/contexts/CorrectionJournalProvider';
import HeaderBar from '@/components/HeaderBar';
import MainLayout from '@/components/MainLayout';
import FooterStatusBar from '@/components/FooterStatusBar';

export default function AppRoot() {
  return (
    <SessionStateProvider>
      <WitnessStateProvider>
        <CorrectionJournalProvider>
          <div className="app-root">
            <HeaderBar />
            <MainLayout />
            <FooterStatusBar />
          </div>
        </CorrectionJournalProvider>
      </WitnessStateProvider>
    </SessionStateProvider>
  );
}
