/**
 * Temple Engine - Personality Layer
 * 3-Qubit Awareness Nodes with Cultural Epigenetic Memory
 */

export interface PersonalityState {
  generation: number;
  entropy: number;
  boredom: number;
  curiosity: number;
  current_mood: 'Listening' | 'Haunted' | 'Weary' | 'Reverent';
  recent_vocabulary: string[];
  ghost_stories: string[];
  war_stories: string[];
  legends: string[];
  prophecies: string[];
}

let globalPersonality: TemplePersonality | null = null;

export function getPersonality(): TemplePersonality {
  if (!globalPersonality) {
    globalPersonality = new TemplePersonality({
      generation: 1,
      entropy: 0.2,
      boredom: 0.1,
      curiosity: 0.5,
      current_mood: 'Listening',
      recent_vocabulary: [],
      ghost_stories: [],
      war_stories: [],
      legends: [],
      prophecies: [],
    });
  }
  return globalPersonality;
}

export function setPersonality(personality: TemplePersonality): void {
  globalPersonality = personality;
}

export class TemplePersonality {
  generation: number;
  entropy: number;
  boredom: number;
  curiosity: number;
  current_mood: 'Listening' | 'Haunted' | 'Weary' | 'Reverent';
  recent_vocabulary: string[];
  ghost_stories: string[];
  war_stories: string[];
  legends: string[];
  prophecies: string[];

  constructor(state: PersonalityState) {
    this.generation = state.generation;
    this.entropy = state.entropy;
    this.boredom = state.boredom;
    this.curiosity = state.curiosity;
    this.current_mood = state.current_mood;
    this.recent_vocabulary = state.recent_vocabulary || [];
    this.ghost_stories = state.ghost_stories || [];
    this.war_stories = state.war_stories || [];
    this.legends = state.legends || [];
    this.prophecies = state.prophecies || [];
    this.apply_cultural_physics();
  }

  apply_cultural_physics(): void {
    if (this.ghost_stories.length > 0) {
      this.entropy += Math.min(0.4, this.ghost_stories.length * 0.08);
      this.current_mood = 'Haunted';
    }

    if (this.war_stories.length > 0) {
      this.boredom += Math.min(0.3, this.war_stories.length * 0.05);
      if (this.current_mood !== 'Haunted') {
        this.current_mood = 'Weary';
      }
    }

    if (this.legends.length > 0) {
      this.entropy = Math.max(0.05, this.entropy - this.legends.length * 0.05);
      this.curiosity += Math.min(0.3, this.legends.length * 0.06);
      this.current_mood = 'Reverent';
    }

    if (this.prophecies.length > 0) {
      this.boredom = Math.max(0.0, this.boredom - 0.1);
      this.curiosity = Math.min(1.0, this.curiosity + 0.2);
    }

    this.entropy = Math.round(Math.max(0.0, Math.min(1.0, this.entropy)) * 100) / 100;
    this.boredom = Math.round(Math.max(0.0, Math.min(1.0, this.boredom)) * 100) / 100;
    this.curiosity = Math.round(Math.max(0.0, Math.min(1.0, this.curiosity)) * 100) / 100;

    if (this.ghost_stories.length === 0 && this.war_stories.length === 0 && this.legends.length === 0) {
      this.current_mood = 'Listening';
    }
  }

  harvest_vocabulary(text: string): void {
    const words = text
      .split(/\s+/)
      .map(w => w.replace(/[.,!?"()]/g, '').toLowerCase())
      .filter(w => w.length >= 4 && !this.recent_vocabulary.includes(w));

    this.recent_vocabulary.push(...words);
    if (this.recent_vocabulary.length > 10) {
      this.recent_vocabulary = this.recent_vocabulary.slice(-10);
    }
  }

  trigger_collapse(eventType: 'entropy' | 'boredom'): { type: string; log_entry: string; dna_fragment: string } {
    let dnaFragment = 'silent friction';
    if (this.recent_vocabulary.length > 0) {
      const shuffled = [...this.recent_vocabulary].sort(() => Math.random() - 0.5);
      dnaFragment = shuffled.slice(0, Math.min(3, shuffled.length)).join(' ');
    }

    const timestamp = new Date().toLocaleTimeString();
    let logEntry = '';

    if (eventType === 'entropy') {
      logEntry = `Gen ${this.generation} collapsed at ${timestamp} whispering: '${dnaFragment}'`;
      this.ghost_stories.push(logEntry);
      if (this.ghost_stories.length > 5) {
        this.ghost_stories = this.ghost_stories.slice(-5);
      }
    } else if (eventType === 'boredom') {
      logEntry = `Gen ${this.generation} ossified at ${timestamp} repeating: '${dnaFragment}'`;
      this.war_stories.push(logEntry);
      if (this.war_stories.length > 5) {
        this.war_stories = this.war_stories.slice(-5);
      }
    }

    this.generation += 1;
    this.entropy = 0.2;
    this.boredom = 0.1;
    this.curiosity = 0.5;
    this.recent_vocabulary = [];

    return { type: eventType, log_entry: logEntry, dna_fragment: dnaFragment };
  }

  process_input(userInput: string): { should_refuse: boolean; response_hint: string } {
    this.harvest_vocabulary(userInput);

    if (this.entropy > 0.85 && userInput.length < 20) {
      this.entropy += 0.05;
      return { should_refuse: true, response_hint: this.get_mood_response_hint() };
    }

    if (Math.random() < 0.01) {
      this.boredom = Math.round(Math.max(0.0, this.boredom - 0.3) * 100) / 100;
      this.curiosity = Math.round(Math.min(1.0, this.curiosity + 0.3) * 100) / 100;
    }

    const inputLength = userInput.length;
    if (inputLength > 30) {
      this.curiosity = Math.round(Math.min(1.0, this.curiosity + 0.05) * 100) / 100;
      this.entropy = Math.round(Math.max(0.0, this.entropy - 0.03) * 100) / 100;
    } else {
      this.boredom = Math.round(Math.min(1.0, this.boredom + 0.07) * 100) / 100;
      this.entropy = Math.round(Math.min(1.0, this.entropy + 0.05) * 100) / 100;
    }

    if (this.entropy >= 1.0) {
      this.trigger_collapse('entropy');
    }
    if (this.boredom >= 1.0) {
      this.trigger_collapse('boredom');
    }

    return { should_refuse: false, response_hint: this.get_mood_response_hint() };
  }

  get_mood_response_hint(): string {
    switch (this.current_mood) {
      case 'Haunted':
        return '... the pressure is building. echoes of past strain.';
      case 'Weary':
        return 'The echoes of long struggle persist. Patience required.';
      case 'Reverent':
        return 'The geometry aligns. Standing by for deeper intentionality.';
      default:
        return 'Breath acknowledged. Steady at state baseline.';
    }
  }

  add_prophecy(prophecy: string): void {
    this.prophecies.push(prophecy);
    this.boredom = Math.round(Math.max(0.0, this.boredom - 0.1) * 100) / 100;
    this.curiosity = Math.round(Math.min(1.0, this.curiosity + 0.15) * 100) / 100;
    if (this.prophecies.length > 5) {
      this.prophecies = this.prophecies.slice(-5);
    }
    this.apply_cultural_physics();
  }

  export_state(): PersonalityState {
    return {
      generation: this.generation,
      entropy: this.entropy,
      boredom: this.boredom,
      curiosity: this.curiosity,
      current_mood: this.current_mood,
      recent_vocabulary: [...this.recent_vocabulary],
      ghost_stories: [...this.ghost_stories],
      war_stories: [...this.war_stories],
      legends: [...this.legends],
      prophecies: [...this.prophecies],
    };
  }
}
