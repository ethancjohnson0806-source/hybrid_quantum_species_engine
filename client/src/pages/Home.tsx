import React, { useState } from 'react';
import { SessionStateProvider, useSessionState } from '@/contexts/SessionStateProvider';
import { WitnessStateProvider } from '@/contexts/WitnessStateProvider';
import { CorrectionJournalProvider, useCorrectionJournal } from '@/contexts/CorrectionJournalProvider';
import ChamberFlowScreen from '@/components/screens/ChamberFlowScreen';
import WitnessFieldScreen from '@/components/screens/WitnessFieldScreen';
import CorrectionJournalScreen from '@/components/screens/CorrectionJournalScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { trpc } from '@/lib/trpc';

function HomeContent() {
  const { session, setSession } = useSessionState();
  const { addCorrection } = useCorrectionJournal();
  const [activeScreen, setActiveScreen] = useState<'chamber' | 'witness' | 'journal'>('chamber');
  const [query, setQuery] = useState('');
  const [emotionalValence, setEmotionalValence] = useState(0.5);
  const [urgency, setUrgency] = useState(0.5);
  const [isProcessing, setIsProcessing] = useState(false);

  const processQuery = async () => {
    if (!query.trim()) return;

    setIsProcessing(true);
    try {
      const result = await trpc.templeEngine.processQuery.mutate({
        user_query: query,
        emotional_valence: emotionalValence,
        urgency: urgency,
      });

      setSession({
        id: result.session_id,
        user_query: query,
        created_at: new Date().toISOString(),
        status: 'completed',
        chambers: result.chambers,
        witness_state: result.witness_state,
        corrections: result.corrections,
        final_answer: result.final_answer,
      });

      // Add corrections to journal
      result.corrections.forEach((correction: any) => {
        addCorrection({
          id: Math.random().toString(),
          chamber_name: correction.chamber_name,
          reason: correction.reason,
          severity: correction.severity,
          previous_output: correction.previous_output,
          corrected_output: correction.corrected_output,
          delta_summary: correction.delta_summary,
          timestamp: new Date().toISOString(),
        });
      });
    } catch (error) {
      console.error('Error processing query:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="home-container">
      <header className="temple-header">
        <h1>🜁 Temple Engine</h1>
        <p>Recursive reasoning through five sacred chambers</p>
      </header>

      <div className="input-section">
        <Input
          placeholder="Enter your query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isProcessing}
        />
        <div className="slider-group">
          <div className="slider-item">
            <label>Emotional Valence</label>
            <Slider
              value={[emotionalValence]}
              onValueChange={(v) => setEmotionalValence(v[0])}
              min={0}
              max={1}
              step={0.1}
            />
          </div>
          <div className="slider-item">
            <label>Urgency</label>
            <Slider
              value={[urgency]}
              onValueChange={(v) => setUrgency(v[0])}
              min={0}
              max={1}
              step={0.1}
            />
          </div>
        </div>
        <Button
          onClick={processQuery}
          disabled={isProcessing || !query.trim()}
          className="process-button"
        >
          {isProcessing ? 'Processing...' : 'Process Query'}
        </Button>
      </div>

      <div className="screen-tabs">
        <button
          className={`tab ${activeScreen === 'chamber' ? 'active' : ''}`}
          onClick={() => setActiveScreen('chamber')}
        >
          Chamber Flow
        </button>
        <button
          className={`tab ${activeScreen === 'witness' ? 'active' : ''}`}
          onClick={() => setActiveScreen('witness')}
        >
          Witness Field
        </button>
        <button
          className={`tab ${activeScreen === 'journal' ? 'active' : ''}`}
          onClick={() => setActiveScreen('journal')}
        >
          Correction Journal
        </button>
      </div>

      <div className="screen-content">
        {activeScreen === 'chamber' && <ChamberFlowScreen />}
        {activeScreen === 'witness' && <WitnessFieldScreen />}
        {activeScreen === 'journal' && <CorrectionJournalScreen />}
      </div>

      {session?.final_answer && (
        <div className="final-answer-section">
          <h2>Final Revelation</h2>
          <p>{session.final_answer}</p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <SessionStateProvider>
      <WitnessStateProvider>
        <CorrectionJournalProvider>
          <HomeContent />
        </CorrectionJournalProvider>
      </WitnessStateProvider>
    </SessionStateProvider>
  );
}
