

## Final Production-Grade Plan: Database + UI Polish

All previous plan items remain unchanged. Here are the 5 final corrections added:

---

### Database Migration Additions

1. **`user_roles` explicit UNIQUE constraint**: `UNIQUE (user_id, role)` on table creation
2. **`generation_jobs.progress` constraint**: `CHECK (progress >= 0 AND progress <= 100)` — use a validation trigger instead of CHECK constraint per Supabase guidelines
3. **`idx_jobs_status`** index on `generation_jobs(status)` for realtime filtering performance
4. **`ai_config` updated_at trigger** explicitly included alongside `generated_content` and `generation_jobs` triggers

### Architecture Adjustment

**n8n no longer writes directly to DB.** Updated flow:

```text
User clicks Generate
  → Create generation_job (status: generating)
  → Call Edge Function "trigger-generation"
    → Edge Function calls n8n webhook
    → n8n processes, returns JSON response to Edge Function
    → Edge Function validates response
    → Edge Function inserts generated_content row
    → Edge Function updates generation_job (status: ready, progress: 100)
  → Frontend listens via Supabase Realtime on generation_jobs
  → Job ready → navigate to Post Detail
```

All DB writes go through the Edge Function — centralized validation, security, and logging.

### UI Addition: Latency Masking

During generation, the frontend does NOT wait passively. It runs a **fake progress simulation**:

- `useGenerationProgress` hook that auto-increments progress with randomized delays
- Stages cycle through: "Scanning trends" → "Analyzing signals" → "Ranking opportunities" → "Generating insights" → "Writing content" → "Designing visuals" → "Finalizing"
- Progress increments: 0→20 (fast), 20→40 (medium), 40→70 (slow), 70→90 (slower) — never hits 100 until real completion
- When Realtime delivers `status: ready`, immediately jump to 100 and transition

This masks network latency and makes the system feel responsive even during 10-15 second generation runs.

---

### Complete Migration Summary (Single SQL)

All items from the approved plan plus these corrections:

- **Enums**: `content_status`, `subscription_status`, `app_role`
- **Alter tables**: `generated_content.status` → enum, `ai_score` → NUMERIC(4,1), add `deleted_at`; `generation_logs` add `retry_count`; `profiles` add LinkedIn token columns
- **New tables**: `generation_jobs` (with content_id FK, progress validation trigger, retry_count), `subscriptions` (with status enum), `ai_config` (singleton enforced, default row inserted), `feature_flags`, `user_roles` (with UNIQUE constraint)
- **Triggers**: `update_updated_at_column()` on `generated_content`, `generation_jobs`, `ai_config`; progress validation trigger on `generation_jobs`
- **Indexes**: `idx_gc_user_id`, `idx_gc_status`, `idx_gc_deleted_at`, `idx_logs_user_id`, `idx_jobs_user_id`, `idx_jobs_status`
- **Security**: `has_role()` security definer function, RLS on all new tables

### Complete UI Summary

All items from the approved plan plus latency masking:

- **Global CSS**: semantic tokens, noise texture, ambient glows, `prefers-reduced-motion`, focus-visible, new animations
- **Components**: Auth (glassmorphic, staggered animations), Sidebar (active glow, keyboard nav), TopBar (gradient border), KPICards (gradient tints, useCountUp), ContentFeed (color-coded scores, skeleton states)
- **State feedback**: skeleton loading, error retry cards, success toasts, confetti micro-animation
- **Delight**: thinking pulse, success burst, latency masking with fake progress stages
- **Accessibility**: ARIA labels, keyboard navigation, reduced motion support

