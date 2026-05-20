# Temple Engine - Complete Recursive Implementation

## Phase 1: Core Data Structures & Database Schema
- [ ] Create QuerySession table (id, user_query, created_at, status, final_answer)
- [ ] Create ChamberState table (id, session_id, chamber_name, input_text, output_text, entered_at, exited_at)
- [ ] Create ChamberMetrics table (id, chamber_state_id, coherence_score, drift_score, symbolic_density, ambiguity_score, recursion_depth, correction_count)
- [ ] Create WitnessState table (id, session_id, overall_coherence, overall_drift, overall_symbolic_density, alignment_score, active_chamber, recursion_depth, total_corrections)
- [ ] Create CorrectionEvent table (id, session_id, chamber_name, reason, severity, previous_output, corrected_output, delta_summary, timestamp)
- [ ] Generate and apply database migrations

## Phase 2: Chamber Pipeline with Recursion
- [ ] Implement Surface Chamber (normalize query, extract intent, entities, constraints)
- [ ] Implement Descent Chamber (break into sub-questions, identify knowledge domains)
- [ ] Implement Compression Chamber (generate candidate answers, compress to internal representation)
- [ ] Implement Expansion Chamber (turn compressed representation into readable answer)
- [ ] Implement Return Chamber (finalize answer, integrate corrections)
- [ ] Implement recursion logic (re-entry to chambers, recursion_depth tracking)
- [ ] Implement correction context passing between chambers

## Phase 3: Witness Field & Correction Journal
- [ ] Implement Witness Field metrics computation per chamber
- [ ] Implement WitnessState aggregation logic
- [ ] Implement correction triggering logic (coherence < 0.6, drift > 0.4, alignment < 0.6)
- [ ] Implement CorrectionEvent creation and persistence
- [ ] Implement correction journal indexing and retrieval
- [ ] Implement meta-analysis queries (common reasons, chamber correction rates)

## Phase 4: API Contract Endpoints
- [ ] POST /api/temple-engine/session (create new session)
- [ ] GET /api/temple-engine/session/{session_id} (get full session state)
- [ ] GET /api/temple-engine/session/{session_id}/stream (SSE for real-time updates)
- [ ] POST /api/temple-engine/session/{session_id}/feedback (submit user corrections)
- [ ] GET /api/temple-engine/session/{session_id}/corrections (get correction journal)
- [ ] Implement SSE events (chamber_started, chamber_completed, witness_updated, correction_triggered, recursion_entered, session_completed)

## Phase 5: UI Component Tree
- [ ] Implement AppRoot layout
- [ ] Implement HeaderBar and FooterStatusBar
- [ ] Implement SidebarNavigation and ContentArea
- [ ] Implement ChamberFlowScreen with ChamberTransitionGraph
- [ ] Implement WitnessFieldScreen with metrics visualization
- [ ] Implement CorrectionJournalScreen with timeline
- [ ] Implement shared components (MetricGauge, Badge, Tag, DiffViewer, AnimatedArc, RippleEffect, GlowPulse)
- [ ] Implement StateProviders (SessionStateProvider, WitnessStateProvider, CorrectionJournalProvider)
- [ ] Wire components to API endpoints

## Phase 6: Testing & Deployment
- [ ] End-to-end test of complete pipeline
- [ ] Test recursion and correction logic
- [ ] Test Witness Field metric computation
- [ ] Test API endpoints
- [ ] Test UI data binding
- [ ] Save checkpoint
- [ ] Deploy to production
