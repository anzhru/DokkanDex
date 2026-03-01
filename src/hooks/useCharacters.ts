import { useState, useEffect } from 'react';
import { Character } from '../types';
import { fetchCharacters } from '../services/dokkanService';

interface UseCharactersResult {
  characters: Character[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCharacters(): UseCharactersResult {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCharacters();
        if (!cancelled) setCharacters(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [refreshKey]);

  return { characters, loading, error, refetch: () => setRefreshKey(k => k + 1) };
}
