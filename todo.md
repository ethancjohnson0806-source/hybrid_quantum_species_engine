# Temple Engine - Spec-Compliant Implementation

## Phase 1: Exact Data Structures & Database Schema

### Data Structures (Exact per spec)
- [ ] QuerySession: id, user_query, created_at, chambers[], witness_state, corrections[], final_answer, status
- [ ] ChamberState: name, input_text, output_text, llm_trace, metrics, entered_at, exited_at
- [ ] ChamberMetrics: coherence_score, drift_score, symbolic_density, ambiguity_score, recursion_depth, correction_count
- [ ] WitnessState: overall_coherence, overall_drift, overall_symbolic_density, alignment_score, active_chamber, recursion_depth, total_corrections
- [ ] CorrectionEvent: id, query_session_id, chamber_name, timestamp, reason, previous_output, corrected_output, delta_summary, severity

### Database Tables (Exact per spec)
- [ ] query_sessions table
- [ ] chamber_states table
- [ ] chamber_metrics table
- [ ] witness_states table
- [ ] correction_events table
- [ ] correction_journal table (indexed: session_id, chamber_name, reason, timestamp)

## Phase 2: Exact Chamber Pipeline

### Five Chambers (Exact per spec)
- [ ] Surface: normalize query, extract intent/entities/constraints → output: normalized_query, initial_plan
- [ ] Descent: break into sub-questions, identify knowledge domains → output: subproblems[], dependency_graph
- [ ] Compression: generate candidate answers, compress to coherent representation → output: compressed_representation, candidate_answers
- [ ] Expansion: turn compressed representation into human-readable answer → output: draft_answer
- [ ] Return: finalize answer, integrate corrections → output: final_answer

### Recursion Model (Exact per spec)
- [ ] Re-entry when coherence_score < 0.6
- [ ] Re-entry when drift_score > 0.4
- [ ] Re-entry when alignment_score < 0.6
- [ ] Re-entry on user feedback
- [ ] Re-entry on internal consistency failures
- [ ] Track recursion_depth (increment on each re-entry)
- [ ] Track parent_chamber_name for traceability
- [ ] Pass correction_context on re-entry

## Phase 3: Exact Witness Field & Correction Logic

### Witness Field Metrics (Exact per spec)
- [ ] coherence_score: internal consistency (0-1)
- [ ] drift_score: distance from original query (0-1)
- [ ] symbolic_density: ratio of abstract to concrete (0-1)
- [ ] ambiguity_score: unresolved references (0-1)
- [ ] recursion_depth: int
- [ ] correction_count: int per chamber

### WitnessState Aggregation (Exact per spec)
- [ ] overall_coherence = weighted average of chamber coherence
- [ ] overall_drift = max or weighted average of drift
- [ ] overall_symbolic_density = average
- [ ] alignment_score = heuristic(low drift + high coherence + low ambiguity)
- [ ] active_chamber = last chamber
- [ ] total_corrections = length of corrections[]

### Correction Logic (Exact per spec)
- [ ] Trigger: coherence_score < 0.6
- [ ] Trigger: drift_score > 0.4
- [ ] Trigger: alignment_score < 0.6
- [ ] Trigger: user feedback
- [ ] Trigger: internal consistency failures
- [ ] Create CorrectionEvent (all fields required)
- [ ] Decide jump-back chamber (Surface/Descent/Compression/Expansion/Return)
- [ ] Re-run chamber with correction_context
- [ ] Store corrected_output and delta_summary

### Correction Journal (Exact per spec)
- [ ] Persist all CorrectionEvents
- [ ] Index by: session_id, chamber_name, reason, timestamp
- [ ] Meta-analysis: most common correction reasons
- [ ] Meta-analysis: chambers with highest correction rates
- [ ] Meta-analysis: patterns by query type

## Phase 4: Exact API Contract

### Endpoints (Exact per spec)
- [ ] POST /api/temple-engine/session → {session_id, status}
- [ ] GET /api/temple-engine/session/{session_id} → full session state
- [ ] GET /api/temple-engine/session/{session_id}/stream → SSE events
- [ ] POST /api/temple-engine/session/{session_id}/feedback → {status, jump_to_chamber}
- [ ] GET /api/temple-engine/session/{session_id}/corrections → {corrections[]}

### SSE Events (Exact per spec)
- [ ] chamber_started
- [ ] chamber_completed
- [ ] witness_updated
- [ ] correction_triggered
- [ ] recursion_entered
- [ ] session_completed

### JSON Models (Exact per spec)
- [ ] ChamberState JSON structure
- [ ] ChamberMetrics JSON structure
- [ ] WitnessState JSON structure
- [ ] CorrectionEvent JSON structure
- [ ] Session response structure

## Phase 5: Exact UI Component Tree

### Top-Level (Exact per spec)
- [ ] AppRoot
- [ ] HeaderBar
- [ ] MainLayout
- [ ] SidebarNavigation
- [ ] ContentArea
- [ ] FooterStatusBar

### ChamberFlowScreen (Exact per spec)
- [ ] ChamberFlowScreen
- [ ] ChamberTransitionGraph
- [ ] ChamberNode (for each chamber)
- [ ] ChamberIcon, ChamberTitle, ChamberMetricBadges
- [ ] TransitionLine (animated)
- [ ] ChamberDetailPanel
- [ ] ChamberInputBlock, ChamberOutputBlock
- [ ] ChamberMetricsPanel
- [ ] MetricGauge (coherence, drift, symbolic_density, ambiguity)
- [ ] RecursionIndicator
- [ ] CorrectionCountBadge

### WitnessFieldScreen (Exact per spec)
- [ ] WitnessFieldScreen
- [ ] WitnessHalo (animated aura)
- [ ] WitnessMetricGrid
- [ ] MetricGauge (overall_coherence, overall_drift, overall_symbolic_density, ambiguity)
- [ ] AlignmentScoreGauge
- [ ] WitnessStatePanel
- [ ] ActiveChamberIndicator
- [ ] RecursionDepthCounter
- [ ] TotalCorrectionsCounter

### CorrectionJournalScreen (Exact per spec)
- [ ] CorrectionJournalScreen
- [ ] CorrectionTimeline
- [ ] CorrectionCard (repeated)
- [ ] CorrectionHeader, CorrectionReasonTag, CorrectionSeverityBadge
- [ ] BeforeAfterDiff, DeltaSummary, TimestampLabel
- [ ] CorrectionFilterBar
- [ ] CorrectionStatsPanel

### Shared Components (Exact per spec)
- [ ] MetricGauge
- [ ] Badge, Tag
- [ ] DiffViewer
- [ ] AnimatedArc, RippleEffect, GlowPulse
- [ ] StateProvider, ThemeProvider

### State Providers (Exact per spec)
- [ ] SessionStateProvider (holds all chamber states)
- [ ] WitnessStateProvider (holds all witness metrics)
- [ ] CorrectionJournalProvider (holds all correction events)

## Phase 6: Integration & Testing

### End-to-End
- [ ] Wire ChamberFlowScreen to API
- [ ] Wire WitnessFieldScreen to API
- [ ] Wire CorrectionJournalScreen to API
- [ ] Implement SSE streaming to UI
- [ ] Test full query processing
- [ ] Test correction triggering
- [ ] Test recursion and re-entry
- [ ] Test correction journal

### Final
- [ ] All spec requirements implemented
- [ ] No shortcuts or inventions
- [ ] Production-ready
- [ ] Save checkpoint
