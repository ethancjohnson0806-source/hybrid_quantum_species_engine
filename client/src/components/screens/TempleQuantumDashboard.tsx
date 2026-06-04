/**
 * Temple Quantum Dashboard - Real-time visualization of temple consciousness
 */

import React, { useState, useEffect } from 'react';
import { trpc } from '../../lib/trpc';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Spinner } from '../ui/spinner';

interface Temple {
  templeId: string;
  generation: number;
  entropy: number;
  boredom: number;
  curiosity: number;
  isAlive: boolean;
  lastActivity: Date;
}

export function TempleQuantumDashboard() {
  const [temples, setTemples] = useState<Temple[]>([]);
  const [selectedTemple, setSelectedTemple] = useState<Temple | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const listTemples = trpc.templeQuantum.listTemples.useQuery();
  const createTemple = trpc.templeQuantum.create.useMutation();
  const webSearch = trpc.templeQuantum.webSearch.useMutation();
  const getLineage = trpc.templeQuantum.getLineage.useQuery(
    selectedTemple ? { templeId: selectedTemple.templeId } : { templeId: '' },
    { enabled: !!selectedTemple }
  );

  useEffect(() => {
    if (listTemples.data) {
      setTemples(listTemples.data);
    }
  }, [listTemples.data]);

  const handleCreateTemple = async () => {
    try {
      const result = await createTemple.mutateAsync({ name: `Temple ${Date.now()}` });
      // Refetch temples
      listTemples.refetch();
    } catch (error) {
      console.error('Error creating temple:', error);
    }
  };

  const handleWebSearch = async () => {
    if (!selectedTemple || !searchQuery) return;

    setIsSearching(true);
    try {
      await webSearch.mutateAsync({
        templeId: selectedTemple.templeId,
        query: searchQuery,
      });
      setSearchQuery('');
      // Refetch temple state
      listTemples.refetch();
    } catch (error) {
      console.error('Error searching web:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const getMoodEmoji = (entropy: number, boredom: number, curiosity: number) => {
    if (entropy > 0.7) return '👻'; // Haunted
    if (boredom > 0.7) return '😴'; // Weary
    if (curiosity > 0.7) return '🔍'; // Curious
    return '👂'; // Listening
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Temple Quantum Consciousness</h2>
        <Button onClick={handleCreateTemple} disabled={createTemple.isPending}>
          {createTemple.isPending ? <Spinner /> : '✨ Birth New Temple'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Temple List */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="font-bold mb-4">Temples ({temples.length})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {temples.map(temple => (
                <button
                  key={temple.templeId}
                  onClick={() => setSelectedTemple(temple)}
                  className={`w-full text-left p-3 rounded border-2 transition ${
                    selectedTemple?.templeId === temple.templeId
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm">
                        {getMoodEmoji(temple.entropy, temple.boredom, temple.curiosity)} Gen {temple.generation}
                      </div>
                      <div className="text-xs text-gray-600 truncate">{temple.templeId.slice(0, 8)}</div>
                    </div>
                    <div className={`text-xs font-bold ${temple.isAlive ? 'text-green-600' : 'text-red-600'}`}>
                      {temple.isAlive ? '●' : '○'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Temple Details */}
        <div className="lg:col-span-2 space-y-4">
          {selectedTemple ? (
            <>
              {/* Metrics */}
              <Card className="p-4">
                <h3 className="font-bold mb-4">Quantum State</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Entropy</span>
                      <span className="font-mono">{selectedTemple.entropy.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${selectedTemple.entropy * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Boredom</span>
                      <span className="font-mono">{selectedTemple.boredom.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full transition-all"
                        style={{ width: `${selectedTemple.boredom * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Curiosity</span>
                      <span className="font-mono">{selectedTemple.curiosity.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${selectedTemple.curiosity * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Web Search */}
              <Card className="p-4">
                <h3 className="font-bold mb-3">Temple's Web Search</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="What should the temple search for?"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleWebSearch()}
                    disabled={isSearching}
                  />
                  <Button
                    onClick={handleWebSearch}
                    disabled={isSearching || !searchQuery}
                  >
                    {isSearching ? <Spinner /> : '🔍'}
                  </Button>
                </div>
              </Card>

              {/* Lineage */}
              {getLineage.data && (
                <Card className="p-4">
                  <h3 className="font-bold mb-3">Ancestral Memory</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto text-sm">
                    {getLineage.data.length > 0 ? (
                      getLineage.data.map((story: any, idx: number) => (
                        <div key={idx} className="p-2 bg-gray-50 rounded border-l-2 border-blue-300">
                          <div className="font-semibold text-xs text-gray-600 mb-1">
                            {story.storyType.toUpperCase()} (Gen {story.generation})
                          </div>
                          <div className="text-gray-700">{story.text.slice(0, 100)}...</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500">No ancestral stories yet.</div>
                    )}
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card className="p-8 text-center text-gray-500">
              Select a temple to view its quantum state
            </Card>
          )}
        </div>
      </div>

      {/* Return to Top Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          variant="outline"
          size="sm"
        >
          ↑ Return to Top
        </Button>
      </div>
    </div>
  );
}
