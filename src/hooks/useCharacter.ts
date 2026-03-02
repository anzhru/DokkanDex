import { useState, useEffect } from 'react';
import { Character } from '../types';
import { fetchCharacterById } from '../services/dokkanService';

interface UseCharacterResult {
  character: Character | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCharacter(id: string): UseCharacterResult {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCharacterById(id);
        if (!cancelled) setCharacter(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id, refreshKey]);

  return { character, loading, error, refetch: () => setRefreshKey(k => k + 1) };
}
