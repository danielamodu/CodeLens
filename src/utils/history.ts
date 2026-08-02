import type { AnalysisResult, Mode } from '../api';
import { supabase, isSupabaseConfigured } from '../supabase';

export interface HistoryItem {
  id: string;
  code: string;
  mode: Mode;
  result: AnalysisResult;
  timestamp: number;
}

const STORAGE_KEY = 'codelens-history';
const MAX_ITEMS = 5;

// ─── LocalStorage Fallback Helpers ────────────────────────────────────────────

function getLocalHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read history from localStorage:', err);
    return [];
  }
}

function saveLocalHistory(code: string, mode: Mode, result: AnalysisResult): HistoryItem[] {
  const current = getLocalHistory();
  const newItem: HistoryItem = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    code,
    mode,
    result,
    timestamp: Date.now(),
  };

  const updated = [newItem, ...current].slice(0, MAX_ITEMS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save history to localStorage:', err);
  }
  return updated;
}

function clearLocalHistory(): HistoryItem[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear history from localStorage:', err);
  }
  return [];
}

// ─── Unified History Functions (Supabase DB + LocalStorage fallback) ─────────

export async function fetchHistory(userId?: string): Promise<HistoryItem[]> {
  if (userId && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(MAX_ITEMS);

      if (error) {
        console.error('Error fetching history from Supabase:', error.message);
        return getLocalHistory();
      }

      return (data || []).map((row) => ({
        id: row.id,
        code: row.code,
        mode: row.mode as Mode,
        result: row.result as AnalysisResult,
        timestamp: new Date(row.created_at).getTime(),
      }));
    } catch (err) {
      console.error('Supabase fetch exception:', err);
      return getLocalHistory();
    }
  }

  return getLocalHistory();
}

export async function saveHistory(
  code: string,
  mode: Mode,
  result: AnalysisResult,
  userId?: string
): Promise<HistoryItem[]> {
  if (userId && isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('analyses').insert([
        {
          user_id: userId,
          code,
          mode,
          result,
        },
      ]);

      if (error) {
        console.error('Error inserting analysis into Supabase:', error.message);
        return saveLocalHistory(code, mode, result);
      }

      return fetchHistory(userId);
    } catch (err) {
      console.error('Supabase save exception:', err);
      return saveLocalHistory(code, mode, result);
    }
  }

  return saveLocalHistory(code, mode, result);
}

export async function clearHistoryStore(userId?: string): Promise<HistoryItem[]> {
  if (userId && isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('analyses')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error clearing history in Supabase:', error.message);
        return clearLocalHistory();
      }

      return [];
    } catch (err) {
      console.error('Supabase clear exception:', err);
      return clearLocalHistory();
    }
  }

  return clearLocalHistory();
}
