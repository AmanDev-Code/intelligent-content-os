

## Investigation Results

**Issues 1 & 2 from the user are already resolved:**
- `carousel_urls`, `hashtags`, `suggested_improvements` are already `TEXT[]` (udt_name: `_text`) -- not broken
- `user_roles.role` already uses `app_role` enum -- not broken

**What actually needs fixing:**

### 1. Database Migration (3 changes)

**A. Default role on signup** -- The `handle_new_user()` trigger only creates a profile row. It does NOT assign a default `'user'` role. This must be added so every new signup gets a role in `user_roles`.

Update `handle_new_user()` to also insert into `user_roles`:
```sql
INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
```

**B. `created_at DESC` index on `generated_content`** -- Missing, needed for feed performance.

**C. `UNIQUE (user_id)` constraint on `subscriptions`** -- Currently allows multiple subscription rows per user.

### 2. Frontend: Realtime subscription to `generation_jobs`

The `useGenerationProgress` hook currently runs fake progress only. When a real generation job exists, the frontend should subscribe to Supabase Realtime on the `generation_jobs` table, and when the job status changes to `ready`, call `complete()` to jump progress to 100%.

This involves:
- Creating a `useGenerationJob` hook that subscribes to a specific job row via Supabase Realtime channel
- When `status` changes to `ready` or `failed`, emit callbacks
- The existing `useGenerationProgress` hook's `complete()` function gets called when realtime delivers completion

### Files changed:
- **New migration SQL** -- update `handle_new_user`, add index, add unique constraint
- **New hook** `src/hooks/useGenerationJob.ts` -- Supabase Realtime subscription for a generation job
- No other file changes needed (the realtime hook will be consumed by future generation UI)

