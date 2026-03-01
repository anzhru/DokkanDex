import { Character } from '../types';
import { API_BASE_URL } from '../constants';

/**
 * Placeholder service for fetching Dokkan Battle character data.
 * Replace API calls with the actual data source / scraper you choose.
 */

export async function fetchCharacters(): Promise<Character[]> {
  // TODO: wire up to real data source
  const response = await fetch(`${API_BASE_URL}/characters`);
  if (!response.ok) {
    throw new Error(`Failed to fetch characters: ${response.status}`);
  }
  return response.json();
}

export async function fetchCharacterById(id: number): Promise<Character> {
  const response = await fetch(`${API_BASE_URL}/characters/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch character ${id}: ${response.status}`);
  }
  return response.json();
}

export async function searchCharacters(query: string): Promise<Character[]> {
  const encoded = encodeURIComponent(query);
  const response = await fetch(`${API_BASE_URL}/characters?search=${encoded}`);
  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`);
  }
  return response.json();
}
