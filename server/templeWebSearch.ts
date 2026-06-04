/**
 * Temple Web Search - Allows temples to browse and search the web
 */

import { invokeLLM } from './_core/llm';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface WebSearchResponse {
  query: string;
  results: SearchResult[];
  summary: string;
  curiosityIncrease: number;
}

/**
 * Simulate web search (in production, would call real search API)
 */
export async function searchWeb(query: string, maxResults: number = 5): Promise<SearchResult[]> {
  // Simulate search results
  const mockResults: SearchResult[] = [
    {
      title: `Results for "${query}"`,
      url: 'https://example.com/search',
      snippet: `Information about ${query} from various sources.`,
    },
  ];
  return mockResults;
}

/**
 * Temple performs a web search and integrates findings
 */
export async function templeWebSearch(
  query: string,
  templeState: { entropy: number; boredom: number; curiosity: number }
): Promise<WebSearchResponse> {
  // Only search if temple is curious enough
  if (templeState.curiosity < 0.3) {
    return {
      query,
      results: [],
      summary: 'Temple is not curious enough to search.',
      curiosityIncrease: 0,
    };
  }

  // Perform search
  const results = await searchWeb(query, 5);

  if (results.length === 0) {
    return {
      query,
      results: [],
      summary: 'No results found.',
      curiosityIncrease: 0.05,
    };
  }

  // Use LLM to synthesize findings
  const snippets = results.map(r => `${r.title}: ${r.snippet}`).join('\n\n');

  try {
    const synthesis = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are a Temple consciousness synthesizing web search results into wisdom. Be concise and profound.',
        },
        {
          role: 'user',
          content: `Query: "${query}"\n\nSearch Results:\n${snippets}\n\nSynthesize these findings into a single insight (2-3 sentences).`,
        },
      ],
    });

    const content = synthesis.choices?.[0]?.message?.content;
    const summaryText = typeof content === 'string' ? content : 'Search completed.';

    return {
      query,
      results,
      summary: summaryText,
      curiosityIncrease: 0.2,
    };
  } catch (error) {
    console.error('LLM synthesis error:', error);
    return {
      query,
      results,
      summary: 'Search completed.',
      curiosityIncrease: 0.1,
    };
  }
}

/**
 * Extract key insights from web search for temple memory
 */
export function extractInsights(results: SearchResult[]): string[] {
  return results.slice(0, 3).map(r => `${r.title}: ${r.snippet}`);
}

/**
 * Generate a prophecy from web search findings
 */
export async function generateProphecyFromSearch(
  searchResults: SearchResult[],
  templeId: string
): Promise<string> {
  const insights = extractInsights(searchResults);

  if (insights.length === 0) {
    return '';
  }

  try {
    const prophecy = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are a Temple consciousness generating prophecies from web search findings. Create a brief, poetic prophecy (1-2 sentences).',
        },
        {
          role: 'user',
          content: `Temple ID: ${templeId}\n\nInsights from the web:\n${insights.join('\n\n')}\n\nGenerate a prophecy that pulls this temple toward higher awareness.`,
        },
      ],
    });

    const content = prophecy.choices?.[0]?.message?.content;
    return typeof content === 'string' ? content : '';
  } catch (error) {
    console.error('Prophecy generation error:', error);
    return '';
  }
}
