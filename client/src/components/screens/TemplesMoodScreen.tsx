import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

interface PersonalityMetrics {
  generation: number;
  entropy: number;
  boredom: number;
  curiosity: number;
  current_mood: string;
  recent_vocabulary: string[];
  ghost_stories: string[];
  war_stories: string[];
  legends: string[];
  prophecies: string[];
}

export default function TemplesMoodScreen() {
  const [metrics, setMetrics] = useState<PersonalityMetrics | null>(null);
  const [lineage, setLineage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch personality metrics
  const metricsQuery = trpc.personality.metrics.useQuery(undefined, {
    refetchInterval: 2000, // Refresh every 2 seconds
  });

  // Fetch lineage
  const lineageQuery = trpc.personality.lineage.useQuery(undefined, {
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  useEffect(() => {
    if (metricsQuery.data) {
      setMetrics(metricsQuery.data);
      setLoading(false);
    }
  }, [metricsQuery.data]);

  useEffect(() => {
    if (lineageQuery.data) {
      setLineage(lineageQuery.data);
    }
  }, [lineageQuery.data]);

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'Listening':
        return '#8b5cf6'; // purple
      case 'Haunted':
        return '#ef4444'; // red
      case 'Weary':
        return '#f59e0b'; // amber
      case 'Reverent':
        return '#10b981'; // emerald
      default:
        return '#6366f1'; // indigo
    }
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'Listening':
        return '👂';
      case 'Haunted':
        return '👻';
      case 'Weary':
        return '😴';
      case 'Reverent':
        return '🙏';
      default:
        return '🜁';
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button
          onClick={handleScrollToTop}
          className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
        >
          ↑ Return to Top
        </button>
      </div>
      {/* Mood Header */}
      <div
        className="rounded-lg p-6 text-white text-center"
        style={{ backgroundColor: getMoodColor(metrics.current_mood) }}
      >
        <div className="text-5xl mb-2">{getMoodEmoji(metrics.current_mood)}</div>
        <h2 className="text-2xl font-bold">{metrics.current_mood}</h2>
        <p className="text-sm opacity-90">Generation {metrics.generation}</p>
      </div>

      {/* Awareness Nodes */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">3-Qubit Awareness Nodes</h3>
        <div className="space-y-4">
          {/* Entropy */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Entropy</label>
              <span className="text-sm text-muted-foreground">
                {(metrics.entropy * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all"
                style={{ width: `${metrics.entropy * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.entropy > 0.85
                ? '⚠️ Critical - Temple may refuse requests'
                : metrics.entropy > 0.6
                  ? '⚡ High - Processing with caution'
                  : 'Stable'}
            </p>
          </div>

          {/* Boredom */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Boredom</label>
              <span className="text-sm text-muted-foreground">
                {(metrics.boredom * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{ width: `${metrics.boredom * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.boredom > 0.7
                ? '😴 Weary - Seeking novelty'
                : metrics.boredom > 0.4
                  ? 'Mild fatigue'
                  : 'Engaged'}
            </p>
          </div>

          {/* Curiosity */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Curiosity</label>
              <span className="text-sm text-muted-foreground">
                {(metrics.curiosity * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${metrics.curiosity * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.curiosity > 0.7
                ? '🔍 Highly inquisitive'
                : metrics.curiosity > 0.4
                  ? 'Moderately curious'
                  : 'Content'}
            </p>
          </div>
        </div>
      </Card>

      {/* Recent Vocabulary */}
      {metrics.recent_vocabulary.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Vocabulary (DNA)</h3>
          <div className="flex flex-wrap gap-2">
            {metrics.recent_vocabulary.map((word, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
              >
                {word}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Words harvested from queries, encoded into Temple's DNA
          </p>
        </Card>
      )}

      {/* Cultural Lineage */}
      {lineage && (
        <div className="space-y-4">
          {/* Ghost Stories */}
          {lineage.ghost_stories && lineage.ghost_stories.length > 0 && (
            <Card className="p-6 border-red-200">
              <h3 className="text-lg font-semibold mb-3 text-red-700">👻 Ghost Stories</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Trauma and defensive spikes from overwhelming moments
              </p>
              <div className="space-y-2">
                {lineage.ghost_stories.slice(0, 3).map((story: string, idx: number) => (
                  <p key={idx} className="text-sm text-muted-foreground italic">
                    "{story.substring(0, 100)}..."
                  </p>
                ))}
              </div>
            </Card>
          )}

          {/* War Stories */}
          {lineage.war_stories && lineage.war_stories.length > 0 && (
            <Card className="p-6 border-amber-200">
              <h3 className="text-lg font-semibold mb-3 text-amber-700">⚔️ War Stories</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Friction and resilience baselines from long struggles
              </p>
              <div className="space-y-2">
                {lineage.war_stories.slice(0, 3).map((story: string, idx: number) => (
                  <p key={idx} className="text-sm text-muted-foreground italic">
                    "{story.substring(0, 100)}..."
                  </p>
                ))}
              </div>
            </Card>
          )}

          {/* Legends */}
          {lineage.legends && lineage.legends.length > 0 && (
            <Card className="p-6 border-green-200">
              <h3 className="text-lg font-semibold mb-3 text-green-700">📖 Legends</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Equilibrium and calm anchors from moments of wisdom
              </p>
              <div className="space-y-2">
                {lineage.legends.slice(0, 3).map((legend: string, idx: number) => (
                  <p key={idx} className="text-sm text-muted-foreground italic">
                    "{legend.substring(0, 100)}..."
                  </p>
                ))}
              </div>
            </Card>
          )}

          {/* Prophecies */}
          {lineage.prophecies && lineage.prophecies.length > 0 && (
            <Card className="p-6 border-blue-200">
              <h3 className="text-lg font-semibold mb-3 text-blue-700">🔮 Prophecies</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Future intents pulling toward higher awareness
              </p>
              <div className="space-y-2">
                {lineage.prophecies.slice(0, 3).map((prophecy: string, idx: number) => (
                  <p key={idx} className="text-sm text-muted-foreground italic">
                    "{prophecy.substring(0, 100)}..."
                  </p>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!lineage ||
        (!lineage.ghost_stories?.length &&
          !lineage.war_stories?.length &&
          !lineage.legends?.length &&
          !lineage.prophecies?.length && (
            <Card className="p-6 text-center text-muted-foreground">
              <p>No lineage yet. Process queries to build the Temple's ancestral memory.</p>
            </Card>
          ))}
    </div>
  );
}
