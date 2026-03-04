

## Unified Implementation Plan

This combines all previously approved work plus the new edge function and Generate page into one consolidated plan.

### Already Completed (No Changes Needed)

- Database schema: array types (`TEXT[]`), `app_role` enum -- already correct
- `handle_new_user()` trigger: assigns default `'user'` role on signup -- done
- `created_at DESC` index on `generated_content` -- done
- `UNIQUE(user_id)` constraint on `subscriptions` -- done
- `useGenerationProgress` hook (fake latency masking) -- done
- `useGenerationJob` hook (Supabase Realtime subscription) -- done
- `useCountUp` hook, KPI cards, content feed, animations, accessibility -- done

### What Will Be Implemented Now

#### 1. Edge Function: `supabase/functions/generate-post/index.ts`

- CORS headers for browser preflight
- `verify_jwt = false` in config.toml + manual auth via `getClaims()` (required by Supabase signing-keys)
- Extract `userId` from JWT `sub` claim -- never from request body
- Create `generation_jobs` row (`status: 'generating'`, `progress: 0`, `current_stage: 'Starting...'`)
- Return 500 if job creation fails
- Call `N8N_WEBHOOK_URL` secret in try/catch -- on failure, update job to `status: 'failed'`, `error: 'Webhook failed'`
- Return `{ jobId }` on success

#### 2. Update `supabase/config.toml`

```toml
project_id = "pfrhlcmkgpfiuyrfdmee"

[functions.generate-post]
verify_jwt = false
```

#### 3. Create `src/pages/Generate.tsx`

Full generation page with:
- `const [isGenerating, setIsGenerating] = useState(false)`
- `const [jobId, setJobId] = useState<string | null>(null)`
- Generate button with `disabled={isGenerating}` to prevent double clicks
- On click: `setIsGenerating(true)` then `supabase.functions.invoke('generate-post')` then `setJobId(result.jobId)`
- `useGenerationProgress(isGenerating)` -- smooth fake progress bar for UX
- `useGenerationJob({ jobId, onComplete, onFailed, onProgress })` -- real-time sync with backend
- `onComplete`: call `complete()` then `setIsGenerating(false)` then `navigate("/content")`
- `onFailed`: `setIsGenerating(false)` then show error toast
- UI: progress bar, current stage text, thinking pulse animation, card layout using existing components

#### 4. Update `src/App.tsx`

Add `/generate` route inside the protected layout alongside the existing `/` route.

#### 5. Secret: `N8N_WEBHOOK_URL`

Will use the secrets tool to prompt for the n8n webhook URL. The edge function will not work without it.

### Files to Create/Edit

| Action | File |
|--------|------|
| Create | `supabase/functions/generate-post/index.ts` |
| Edit   | `supabase/config.toml` |
| Create | `src/pages/Generate.tsx` |
| Edit   | `src/App.tsx` |

