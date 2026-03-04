

## Plan: Create Content Page and Route

### Problem
After generation completes, `navigate("/content")` goes to a 404 because no `/content` route exists.

### Implementation

#### 1. Create `src/pages/Content.tsx`
- Fetch from `generated_content` table filtered by `user_id`, ordered by `created_at DESC`, excluding soft-deleted rows (`deleted_at IS NULL`)
- Reuse the existing `ContentFeed` component pattern (card layout, status badges, score colors)
- Each card displays: title, content preview, hashtags as badges, visual type, created date (formatted with `date-fns`)
- Show thumbnail if `visual_url` exists
- Empty state: "Your generated content will appear here." with a link to `/generate`
- Loading skeleton state while fetching
- Status filter dropdown (reuse pattern from `ContentFeed`)

#### 2. Update `src/App.tsx`
- Import `Content` from `./pages/Content`
- Add `<Route path="/content" element={<Content />} />` inside the protected layout group (alongside `/` and `/generate`)

### Files

| Action | File |
|--------|------|
| Create | `src/pages/Content.tsx` |
| Edit   | `src/App.tsx` (add import + route) |

No database or backend changes needed. The sidebar already has the `/content` nav link.

