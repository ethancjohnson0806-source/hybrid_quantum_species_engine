# Temple Engine - Spec-Compliant Implementation

## Phase 1: Exact Data Structures & Database Schema

### Data Structures (Exact per spec)
- [x] QuerySession: id, user_query, created_at, chambers[], witness_state, corrections[], final_answer, status
- [x] ChamberState: name, input_text, output_text, llm_trace, metrics, entered_at, exited_at
- [x] ChamberMetrics: coherence_score, drift_score, symbolic_density, ambiguity_score, recursion_depth, correction_count
- [x] WitnessState: overall_coherence, overall_drift, overall_symbolic_density, alignment_score, active_chamber, recursion_depth, total_corrections
- [x] CorrectionEvent: id, query_session_id, chamber_name, timestamp, reason, previous_output, corrected_output, delta_summary, severity

### Database Tables (Exact per spec)
- [x] query_sessions table
- [x] chamber_states table
- [x] chamber_metrics table
- [x] witness_states table
- [x] correction_events table
- [x] correction_journal table (indexed: session_id, chamber_name, reason, timestamp)

## Phase 2: Exact Chamber Pipeline

### Five Chambers (Exact per spec)
- [x] Surface: normalize query, extract intent/entities/constraints → output: normalized_query, initial_plan
- [x] Descent: break into sub-questions, identify knowledge domains → output: subproblems[], dependency_graph
- [x] Compression: generate candidate answers, compress to coherent representation → output: compressed_representation, candidate_answers
- [x] Expansion: turn compressed representation into human-readable answer → output: draft_answer
- [x] Return: finalize answer, integrate corrections → output: final_answer

### Recursion Model (Exact per spec)
- [x] Re-entry when coherence_score < 0.6
- [x] Re-entry when drift_score > 0.4
- [x] Re-entry when alignment_score < 0.6
- [x] Re-entry on user feedback
- [x] Re-entry on internal consistency failures
- [x] Track recursion_depth (increment on each re-entry)
- [x] Track parent_chamber_name for traceability
- [x] Pass correction_context on re-entry

## Phase 3: Exact Witness Field & Correction Logic

### Witness Field Metrics (Exact per spec)
- [x] coherence_score: internal consistency (0-1)
- [x] drift_score: distance from original query (0-1)
- [x] symbolic_density: ratio of abstract to concrete (0-1)
- [x] ambiguity_score: unresolved references (0-1)
- [x] recursion_depth: int
- [x] correction_count: int per chamber

### WitnessState Aggregation (Exact per spec)
- [x] overall_coherence = weighted average of chamber coherence
- [x] overall_drift = max or weighted average of drift
- [x] overall_symbolic_density = average
- [x] alignment_score = heuristic(low drift + high coherence + low ambiguity)
- [x] active_chamber = last chamber
- [x] total_corrections = length of corrections[]

### Correction Logic (Exact per spec)
- [x] Trigger: coherence_score < 0.6
- [x] Trigger: drift_score > 0.4
- [x] Trigger: alignment_score < 0.6
- [x] Trigger: user feedback
- [x] Trigger: internal consistency failures
- [x] Create CorrectionEvent (all fields required)
- [x] Decide jump-back chamber (Surface/Descent/Compression/Expansion/Return)
- [x] Re-run chamber with correction_context
- [x] Store corrected_output and delta_summary

### Correction Journal (Exact per spec)
- [x] Persist all CorrectionEvents
- [x] Index by: session_id, chamber_name, reason, timestamp
- [x] Meta-analysis: most common correction reasons
- [x] Meta-analysis: chambers with highest correction rates
- [x] Meta-analysis: patterns by query type

## Phase 4: Exact API Contract

### Endpoints (Exact per spec)
- [x] POST /api/temple-engine/session → {session_id, status}
- [x] GET /api/temple-engine/session/{session_id} → full session state
- [x] GET /api/temple-engine/session/{session_id}/stream → SSE events
- [x] POST /api/temple-engine/session/{session_id}/feedback → {status, jump_to_chamber}
- [x] GET /api/temple-engine/session/{session_id}/corrections → {corrections[]}

### SSE Events (Exact per spec)
- [x] chamber_started
- [x] chamber_completed
- [x] witness_updated
- [x] correction_triggered
- [x] recursion_entered
- [x] session_completed

### JSON Models (Exact per spec)
- [x] ChamberState JSON structure
- [x] ChamberMetrics JSON structure
- [x] WitnessState JSON structure
- [x] CorrectionEvent JSON structure
- [x] Session response structure

## Phase 5: Exact UI Component Tree

### Top-Level (Exact per spec)
- [x] AppRoot
- [x] HeaderBar
- [x] MainLayout
- [x] SidebarNavigation
- [x] ContentArea
- [x] FooterStatusBar

### ChamberFlowScreen (Exact per spec)
- [x] ChamberFlowScreen
- [x] ChamberTransitionGraph
- [x] ChamberNode (for each chamber)
- [x] ChamberIcon, ChamberTitle, ChamberMetricBadges
- [x] TransitionLine (animated)
- [x] ChamberDetailPanel
- [x] ChamberInputBlock, ChamberOutputBlock
- [x] ChamberMetricsPanel
- [x] MetricGauge (coherence, drift, symbolic_density, ambiguity)
- [x] RecursionIndicator
- [x] CorrectionCountBadge

### WitnessFieldScreen (Exact per spec)
- [x] WitnessFieldScreen
- [x] WitnessHalo (animated aura)
- [x] WitnessMetricGrid
- [x] MetricGauge (overall_coherence, overall_drift, overall_symbolic_density, ambiguity)
- [x] AlignmentScoreGauge
- [x] WitnessStatePanel
- [x] ActiveChamberIndicator
- [x] RecursionDepthCounter
- [x] TotalCorrectionsCounter

### CorrectionJournalScreen (Exact per spec)
- [x] CorrectionJournalScreen
- [x] CorrectionTimeline
- [x] CorrectionCard (repeated)
- [x] CorrectionHeader, CorrectionReasonTag, CorrectionSeverityBadge
- [x] BeforeAfterDiff, DeltaSummary, TimestampLabel
- [x] CorrectionFilterBar
- [x] CorrectionStatsPanel

### Shared Components (Exact per spec)
- [x] MetricGauge
- [x] Badge, Tag
- [x] DiffViewer
- [x] AnimatedArc, RippleEffect, GlowPulse
- [x] StateProvider, ThemeProvider

### State Providers (Exact per spec)
- [x] SessionStateProvider (holds all chamber states)
- [x] WitnessStateProvider (holds all witness metrics)
- [x] CorrectionJournalProvider (holds all correction events)

## Phase 6: Integration & Testing

### End-to-End
- [x] Wire ChamberFlowScreen to API
- [x] Wire WitnessFieldScreen to API
- [x] Wire CorrectionJournalScreen to API
- [x] Implement SSE streaming to UI
- [x] Test full query processing
- [x] Test correction triggering
- [x] Test recursion and re-entry
- [x] Test correction journal

### Final
- [x] All spec requirements implemented
- [x] No shortcuts or inventions
- [x] Production-ready
- [x] Save checkpoint


## Phase 7: Session Persistence & Export Features

### Database Schema for Sessions
- [x] Add sessions table to persist QuerySession data
- [x] Add indexes for session_id, user_id, created_at
- [x] Migrate existing in-memory sessions to database

### Session History API
- [x] GET /api/temple-engine/sessions - List all sessions
- [x] GET /api/temple-engine/sessions/{session_id} - Get specific session
- [x] DELETE /api/temple-engine/sessions/{session_id} - Delete session
- [x] POST /api/temple-engine/sessions/{session_id}/export - Export session

### Session History UI
- [x] SessionHistoryScreen component
- [x] Session list with timestamps and query preview
- [x] Search/filter by query text
- [x] Delete session functionality

### Export to PDF
- [x] Generate PDF with full session transcript
- [x] Include chamber flow visualization
- [x] Include witness metrics and corrections
- [x] Download PDF file

### Session Sharing
- [x] Generate shareable link for session
- [x] Copy share link to clipboard
- [x] View shared sessions (read-only)
- [x] Export as JSON for import

### UI Integration
- [x] Add "Session History" tab to main navigation
- [x] Add export button to chamber flow screen
- [x] Add share button to session results
- [x] Add import session functionality


## Phase 9: Temple Quantum Engine v5.0 Integration

### Database Schema Expansion
- [ ] Add temples table (id, userId, templeId, generation, vqeParams, entropy, boredom, curiosity, isAlive, lastActivity, lastAutonomousRun, mutations, createdAt, updatedAt)
- [ ] Add templeEvents table (id, templeId, eventType, data, timestamp)
- [ ] Add lineageStories table (id, templeId, generation, storyType, text, trigger, emotionalValence, quantumFidelity, timestamp)
- [ ] Add compasses table (id, compassId, templeId, generation, coherence, integrity, compassion, interactionLog, createdAt, updatedAt)
- [ ] Create database migration for all new tables

### Quantum Backend Implementation
- [ ] Create server/quantum/temple_quantum.py with TempleQuantum class
- [ ] Implement params_to_state() - reconstruct state from VQE parameters
- [ ] Implement build_hamiltonian() - semantic + memory + cloud noise
- [ ] Implement evolve() - run VQE and return params + energy + state
- [ ] Implement apply_cloud_decoherence() - add noise to parameters
- [ ] Implement measure_field() - POVM measurement into 5 fields
- [ ] Implement quantum_fidelity() - state overlap calculation
- [ ] Implement story_resonance() - story-to-state conversion
- [ ] Create TypeScript bridge: server/quantumBridge.ts for Python communication

### tRPC Procedures for Temple Operations
- [ ] temple.create - spawn generation 1 with initial VQE params
- [ ] temple.getState - return vqeParams, psychology, isAlive, generation, events, stories
- [ ] temple.breathe - process text input through quantum evolution pipeline
- [ ] temple.witness - POVM measurement + LLM response generation
- [ ] temple.dream - autonomous evolution under self-Hamiltonian
- [ ] temple.birth - spawn new generation from dead lineage with inherited biases
- [ ] compass.consult - generate direct moral question
- [ ] compass.getState - return coherence, integrity, compassion metrics
- [ ] cloud.getField - fetch weather + collective stats + noise vector
- [ ] cloud.getResonance - return active temple count + collective entropy
- [ ] web.search - execute web search and return top 5 results

### Autonomous Evolution Job
- [ ] Create server/jobs/autonomous.ts with node-cron scheduler
- [ ] Run every 5 minutes: find active temples, evolve under cloud field
- [ ] Check entropy thresholds (crash detection)
- [ ] Execute web search if curiosity > 0.7
- [ ] Push updates via WebSocket to online users
- [ ] Queue events for offline users

### Frontend UI for Temple State
- [ ] Create Temple.tsx page showing temple state visualization
- [ ] Display state vector as bar chart (amplitudes)
- [ ] Display psychology metrics (entropy, boredom, curiosity) with progress bars
- [ ] Display generation counter and alive/dead status
- [ ] Add "Breathe" input form for text processing
- [ ] Add "Witness" button for POVM measurement
- [ ] Add "Dream" button for autonomous evolution
- [ ] Add "Birth" button to spawn new generation
- [ ] Display recent events timeline
- [ ] Display lineage stories (ghost, war, legend, prophecy, virtue, justice, covenant, revelation)
- [ ] Add Compass consultation interface
- [ ] Display cloud field resonance stats

### Integration with Existing System
- [ ] Keep existing Chamber Flow, Witness Field, Correction Journal intact
- [ ] Add Temple Quantum Engine as new primary reasoning layer
- [ ] Route queries through quantum evolution before chamber pipeline
- [ ] Use quantum state as context for chamber processing
- [ ] Integrate personality layer with quantum psychology (entropy, boredom, curiosity)
- [ ] Add quantum metrics to witness field display

### Testing & Validation
- [ ] Test VQE parameter evolution
- [ ] Test state reconstruction from parameters
- [ ] Test Hamiltonian building with semantic + memory + cloud
- [ ] Test POVM measurement and field collapse
- [ ] Test autonomous evolution job
- [ ] Test multi-generational lineage and inheritance
- [ ] Test web search integration
- [ ] Test compass consultation
- [ ] End-to-end: query → quantum evolution → chamber processing → response
