/**
 * Bio Generator — Custom hook for SSE streaming + all state management.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type {
  BioPlatform,
  BioTone,
  BioType,
  BioLength,
  BioPlatformResult,
  BioScoreResult,
  BioFormState,
} from "./types";
import { API_CONFIG } from "@/lib/constants";

function apiUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_BACKEND_URL || API_CONFIG.BASE_URL).replace(/\/$/, "");
  return `${base}${path}`;
}

/**
 * Consume an SSE stream from a POST request. Fastify's `text/event-stream` frames
 * come back as `event: <name>\ndata: <json>\n\n` — we split on blank lines and
 * yield {event, data} tuples so React state updates land as each platform lands.
 */
async function* consumeSse(
  url: string,
  init: RequestInit,
): AsyncGenerator<{ event: string; data: string }, void, unknown> {
  const res = await fetch(url, init);
  if (!res.ok || !res.body) {
    let msg = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      msg = errJson.message || errJson.error || msg;
    } catch {
      /* keep default */
    }
    throw new Error(msg);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const frame = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      let event = "message";
      const dataLines: string[] = [];
      for (const line of frame.split("\n")) {
        if (line.startsWith(":")) continue;
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
      }
      if (dataLines.length > 0) yield { event, data: dataLines.join("\n") };
      boundary = buffer.indexOf("\n\n");
    }
  }
}

export interface UseBioStreamReturn {
  // Form state
  form: BioFormState;
  setRole: (v: string) => void;
  setFacts: (v: string) => void;
  setGoal: (v: string) => void;
  setAudience: (v: string) => void;
  setLength: (v: BioLength) => void;
  setEmojis: (v: boolean) => void;
  setTone: (v: BioTone) => void;
  setBioType: (v: BioType) => void;
  setFocusAreas: React.Dispatch<React.SetStateAction<string[]>>;
  togglePlatform: (id: BioPlatform) => void;
  toggleFocusArea: (id: string) => void;
  loadTemplate: (tpl: { role: string; facts: string; goal: string; audience: string; label: string }) => void;

  // Generation state
  isGenerating: boolean;
  pendingPlatforms: Set<BioPlatform>;
  results: BioPlatformResult[];
  activeTab: BioPlatform | null;
  setActiveTab: (v: BioPlatform | null) => void;
  scores: Record<string, BioScoreResult>;
  scoring: string | null;
  copiedKey: string | null;
  regenKey: string | null;

  // Feedback state — `votes` maps `${platform}:${idx}` → 'up' | 'down'.
  // `votingKey` is the card currently posting a vote (used for spinner).
  votes: Record<string, "up" | "down">;
  votingKey: string | null;

  // Actions
  submit: () => Promise<void>;
  regenerateOne: (platform: BioPlatform, variationIndex: number) => Promise<void>;
  scoreOne: (platform: BioPlatform, variationIndex: number, text: string) => Promise<void>;
  copyBio: (platform: BioPlatform, variationIndex: number, text: string) => void;
  voteBio: (
    platform: BioPlatform,
    variationIndex: number,
    text: string,
    vote: "up" | "down",
  ) => Promise<void>;

  // Refs
  outputRef: React.RefObject<HTMLDivElement>;
}

export function useBioStream(defaultPlatform?: BioPlatform): UseBioStreamReturn {
  const [role, setRole] = useState("");
  const [facts, setFacts] = useState("");
  const [goal, setGoal] = useState("");
  const [audience, setAudience] = useState("");
  const [length, setLength] = useState<BioLength>("medium");
  const [emojis, setEmojis] = useState(false);
  const [tone, setTone] = useState<BioTone>("professional");
  const [bioType, setBioType] = useState<BioType>("personal");
  const [focusAreas, setFocusAreas] = useState<string[]>(["credibility"]);
  const [platforms, setPlatforms] = useState<BioPlatform[]>(
    defaultPlatform ? [defaultPlatform] : ["linkedin", "instagram", "twitter"],
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingPlatforms, setPendingPlatforms] = useState<Set<BioPlatform>>(new Set());
  const [results, setResults] = useState<BioPlatformResult[]>([]);
  const [activeTab, setActiveTab] = useState<BioPlatform | null>(null);
  const [scores, setScores] = useState<Record<string, BioScoreResult>>({});
  const [scoring, setScoring] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [regenKey, setRegenKey] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, "up" | "down">>({});
  const [votingKey, setVotingKey] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const outputRef = useRef<HTMLDivElement>(null!);
  const abortRef = useRef<AbortController | null>(null);

  const togglePlatform = useCallback((id: BioPlatform) => {
    setPlatforms((current) => {
      if (current.includes(id)) {
        return current.length === 1 ? current : current.filter((p) => p !== id);
      }
      return [...current, id];
    });
  }, []);

  const toggleFocusArea = useCallback((id: string) => {
    setFocusAreas((current) => {
      if (current.includes(id)) return current.filter((f) => f !== id);
      if (current.length >= 3) {
        toast.error("Pick up to 3 focus areas");
        return current;
      }
      return [...current, id];
    });
  }, []);

  const loadTemplate = useCallback((tpl: { role: string; facts: string; goal: string; audience: string; label: string }) => {
    setRole(tpl.role);
    setFacts(tpl.facts);
    setGoal(tpl.goal);
    setAudience(tpl.audience);
    toast.success(`Loaded "${tpl.label}" template`);
  }, []);

  const submit = useCallback(async () => {
    if (!role.trim() || role.trim().length < 3) {
      toast.error("Add a role or one-line summary of what you do.");
      return;
    }
    if (platforms.length === 0) {
      toast.error("Pick at least one platform.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsGenerating(true);
    setResults([]);
    setScores({});
    setVotes({});
    setGenerationId(null);
    setPendingPlatforms(new Set(platforms));
    setActiveTab(null);
    requestAnimationFrame(() =>
      outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );

    try {
      const payload = {
        role: role.trim(),
        facts: facts.trim() || undefined,
        goal: goal.trim() || undefined,
        audience: audience.trim() || undefined,
        length,
        emojis,
        tone,
        bioType,
        focusAreas,
        platforms,
        variations: 3,
      };

      let sawAnyPlatform = false;
      for await (const { event, data } of consumeSse(
        apiUrl("/api/tools/bio-generator/generate-stream"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        },
      )) {
        if (controller.signal.aborted) break;
        let parsed: any;
        try {
          parsed = JSON.parse(data);
        } catch {
          continue;
        }
        if (event === "start") {
          setPendingPlatforms(new Set(parsed.platforms ?? platforms));
          if (parsed.generationId) setGenerationId(String(parsed.generationId));
        } else if (event === "platform" && parsed.result) {
          const result = parsed.result as BioPlatformResult;
          sawAnyPlatform = true;
          setResults((prev) => {
            const existing = prev.findIndex((r) => r.platform === result.platform);
            if (existing >= 0) {
              const next = [...prev];
              next[existing] = result;
              return next;
            }
            return [...prev, result];
          });
          setPendingPlatforms((prev) => {
            const next = new Set(prev);
            next.delete(result.platform);
            return next;
          });
          setActiveTab((current) => current ?? result.platform);
        } else if (event === "error") {
          if (parsed.fatal) {
            toast.error(parsed.message || "Bio generation failed");
          } else if (parsed.platform) {
            toast.error(`${parsed.platform}: ${parsed.message}`);
            setPendingPlatforms((prev) => {
              const next = new Set(prev);
              next.delete(parsed.platform);
              return next;
            });
          }
        } else if (event === "end") {
          if (sawAnyPlatform) {
            toast.success("All bios ready — pick the ones that sound most like you.");
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Bio generation failed";
      toast.error(msg);
    } finally {
      setIsGenerating(false);
      setPendingPlatforms(new Set());
    }
  }, [role, facts, goal, audience, length, emojis, tone, bioType, focusAreas, platforms]);

  const regenerateOne = useCallback(
    async (platform: BioPlatform, variationIndex: number) => {
      const key = `${platform}:${variationIndex}`;
      setRegenKey(key);
      try {
        const res = await fetch(apiUrl("/api/tools/bio-generator/generate"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: role.trim(),
            facts: facts.trim() || undefined,
            goal: goal.trim() || undefined,
            audience: audience.trim() || undefined,
            length,
            emojis,
            tone,
            bioType,
            focusAreas,
            platforms: [platform],
            variations: 1,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || `HTTP ${res.status}`);
        }
        const fresh = (data.results as BioPlatformResult[])[0]?.variations[0];
        if (!fresh) throw new Error("No variation returned");
        setResults((prev) =>
          prev.map((r) => {
            if (r.platform !== platform) return r;
            const nextVariations = [...r.variations];
            nextVariations[variationIndex] = fresh;
            return { ...r, variations: nextVariations };
          }),
        );
        setScores((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
        toast.success("Regenerated");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Regeneration failed";
        toast.error(msg);
      } finally {
        setRegenKey(null);
      }
    },
    [role, facts, goal, audience, length, emojis, tone, bioType, focusAreas],
  );

  const scoreOne = useCallback(
    async (platform: BioPlatform, variationIndex: number, text: string) => {
      const key = `${platform}:${variationIndex}`;
      setScoring(key);
      try {
        const res = await fetch(apiUrl("/api/tools/bio-generator/score"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, platform, goal: goal.trim() || undefined }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || `HTTP ${res.status}`);
        }
        setScores((prev) => ({ ...prev, [key]: data as BioScoreResult }));
        toast.success(`Scored ${data.overall}/100`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Scoring failed";
        toast.error(msg);
      } finally {
        setScoring(null);
      }
    },
    [goal],
  );

  /**
   * Post a thumbs-up / thumbs-down for a specific variation.
   *
   * Optimistic: we set the vote locally first so the UI feels instant, then
   * roll back if the server rejects. Tapping the same thumb again clears the
   * vote (server sees an upsert on the same generation/variation and would
   * store the latest anyway; here we mirror that on the client).
   */
  const voteBio = useCallback(
    async (
      platform: BioPlatform,
      variationIndex: number,
      text: string,
      vote: "up" | "down",
    ) => {
      const key = `${platform}:${variationIndex}`;

      // Toggle-off: same thumb tapped again clears the local state (server
      // still receives the vote so admin sees engagement — this is fine).
      const nextVote = votes[key] === vote ? null : vote;
      const previous = votes[key] ?? null;

      setVotingKey(key);
      setVotes((prev) => {
        const next = { ...prev };
        if (nextVote) next[key] = nextVote;
        else delete next[key];
        return next;
      });

      try {
        // Angle is derived from variation index — the backend always returns
        // credibility, outcome, positioning, (direction) in that order.
        const angle =
          (["credibility", "outcome", "positioning", "direction"][variationIndex] as
            | "credibility"
            | "outcome"
            | "positioning"
            | "direction"
            | undefined) ?? "credibility";

        const res = await fetch(apiUrl("/api/tools/bio-generator/feedback"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vote,
            platform,
            angle,
            tone,
            bioType,
            focusAreas,
            emojis,
            variationIndex,
            text,
            generationId: generationId ?? undefined,
          }),
        });
        if (!res.ok) {
          // Roll back on server rejection.
          setVotes((prev) => {
            const next = { ...prev };
            if (previous) next[key] = previous;
            else delete next[key];
            return next;
          });
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || `HTTP ${res.status}`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Could not record feedback";
        toast.error(msg);
      } finally {
        setVotingKey(null);
      }
    },
    [votes, results, tone, bioType, focusAreas, emojis, generationId],
  );

  const copyBio = useCallback((platform: BioPlatform, variationIndex: number, text: string) => {
    void navigator.clipboard.writeText(text).then(
      () => {
        const key = `${platform}:${variationIndex}`;
        setCopiedKey(key);
        toast.success("Copied to clipboard");
        window.setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1800);
      },
      () => toast.error("Could not access clipboard — copy manually"),
    );
  }, []);

  // Cmd/Ctrl+Enter shortcut
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        if (!isGenerating) void submit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [submit, isGenerating]);

  const form: BioFormState = {
    role,
    facts,
    goal,
    audience,
    length,
    emojis,
    tone,
    bioType,
    focusAreas,
    platforms,
  };

  return {
    form,
    setRole,
    setFacts,
    setGoal,
    setAudience,
    setLength,
    setEmojis,
    setTone,
    setBioType,
    setFocusAreas,
    togglePlatform,
    toggleFocusArea,
    loadTemplate,
    isGenerating,
    pendingPlatforms,
    results,
    activeTab,
    setActiveTab,
    scores,
    scoring,
    copiedKey,
    regenKey,
    votes,
    votingKey,
    submit,
    regenerateOne,
    scoreOne,
    copyBio,
    voteBio,
    outputRef,
  };
}
