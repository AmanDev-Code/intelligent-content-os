import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/apiClient';

const LEET_MAP: Record<string, string> = {
  '3': 'e',
  '0': 'o',
  '1': 'i',
  '@': 'a',
  $: 's',
  '!': 'i',
  '4': 'a',
  '5': 's',
  '7': 't',
  '8': 'b',
};

const ZERO_WIDTH_RE =
  /[\u200B\u200C\u200D\u200E\u200F\uFEFF\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180E\u2060\u2061\u2062\u2063\u2064\u2066\u2067\u2068\u2069\u206A\u206B\u206C\u206D\u206E\u206F]/g;

function normaliseLeet(input: string): string {
  let out = '';
  for (const ch of input) {
    out += LEET_MAP[ch] ?? ch;
  }
  return out;
}

function normalise(raw: string): string {
  let text = raw.normalize('NFKC');
  text = text.replace(ZERO_WIDTH_RE, '');
  text = text.toLowerCase();
  text = normaliseLeet(text);
  return text;
}

function buildRegex(words: string[]): RegExp | null {
  if (words.length === 0) return null;
  const escaped = words.map((w) =>
    w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  );
  const sorted = [...escaped].sort((a, b) => b.length - a.length);
  const wb = '(?<![a-zA-Z0-9])';
  const wbEnd = '(?![a-zA-Z0-9])';
  return new RegExp(`${wb}(?:${sorted.join('|')})${wbEnd}`, 'gi');
}

export function useProfanityCheck() {
  const [wordList, setWordList] = useState<string[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const regexRef = useRef<RegExp | null>(null);
  const wordSetRef = useRef<Set<string>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    let cancelled = false;

    async function fetchWordList() {
      try {
        const data = await apiClient.get('/moderation/word-list');
        if (cancelled) return;

        const words: string[] = data?.words ?? [];
        setWordList(words);
        regexRef.current = buildRegex(words);
        wordSetRef.current = new Set(words.map((w) => w.toLowerCase()));
      } catch {
        // Graceful degradation — server is the ultimate gatekeeper
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchWordList();
    return () => {
      cancelled = true;
    };
  }, []);

  const checkText = useCallback(
    (text: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        if (!regexRef.current || wordSetRef.current.size === 0) {
          setIsBlocked(false);
          return;
        }

        const normalised = normalise(text);
        regexRef.current.lastIndex = 0;

        let hit = false;
        let match: RegExpExecArray | null;
        while ((match = regexRef.current.exec(normalised)) !== null) {
          if (wordSetRef.current.has(match[0].toLowerCase())) {
            hit = true;
            break;
          }
        }

        setIsBlocked(hit);
      }, 300);
    },
    [wordList],
  );

  const reset = useCallback(() => {
    setIsBlocked(false);
  }, []);

  return { isBlocked, isLoading, checkText, reset };
}
