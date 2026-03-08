

## Plan: Complete Platform Redesign — Content Scheduling Command Center

This is a full redesign transforming ContentOS from a simple generation tool into a professional content scheduling and AI content platform. Every button, view, and interaction will be functional with real Supabase data.

### Design Direction
- **Color**: Teal/emerald primary (`160 84% 39%`) + clean neutrals. No more purple-only.
- **Style**: Minimal borders, no excessive shadows/hovers, clean cards with 1px borders. Inspired by Linear/Stripe/Postiz but original.
- **Light mode**: White backgrounds, subtle gray borders. **Dark mode**: Near-black backgrounds, subtle borders.
- **No dummy data**: Empty states when no data exists. All KPIs from real Supabase queries.

### Architecture

```text
src/
├── lib/constants.ts              ← NEW: centralized env vars + config
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx         ← REWRITE: new sidebar + topbar
│   │   ├── Sidebar.tsx           ← NEW: icon sidebar with nav
│   │   └── TopBar.tsx            ← REWRITE: page title, notifications, theme toggle
│   ├── dashboard/
│   │   ├── KPIStrip.tsx          ← NEW: real data KPI cards
│   │   ├── CalendarGrid.tsx      ← NEW: month view with past-date disable
│   │   ├── DayView.tsx           ← NEW: hourly timeline
│   │   ├── WeekView.tsx          ← NEW: 7-column grid
│   │   ├── ListView.tsx          ← NEW: chronological list
│   │   ├── SocialChannels.tsx    ← NEW: connect platforms card
│   │   └── ContentFeed.tsx       ← DELETE (replaced by calendar)
│   │   └── KPICards.tsx          ← DELETE (replaced by KPIStrip)
│   └── ai-agent/
│       ├── ViralTopicPanel.tsx   ← NEW: trigger n8n, show progress + results
│       └── CustomTopicPanel.tsx  ← NEW: user input topic generation
├── pages/
│   ├── Dashboard.tsx             ← REWRITE: calendar command center
│   ├── AIAgent.tsx               ← NEW: replaces Generate.tsx
│   ├── Analytics.tsx             ← NEW: real usage data charts
│   ├── Media.tsx                 ← NEW: placeholder for media library
│   ├── Settings.tsx              ← NEW: user settings
│   ├── Billing.tsx               ← NEW: plan management
│   ├── Affiliate.tsx             ← NEW: coming soon placeholder
│   ├── Content.tsx               ← KEEP: content library
│   ├── PostDetail.tsx            ← KEEP
│   └── Generate.tsx              ← DELETE (replaced by AIAgent)
├── hooks/
│   ├── useGenerationJob.ts       ← KEEP (untouched)
│   ├── useSmoothProgress.ts      ← KEEP (untouched)
│   ├── useDashboardStats.ts      ← NEW: fetch KPI data from Supabase
│   └── useScheduledPosts.ts      ← NEW: fetch posts by date range
```

### What Gets Built (All Functional)

#### 1. `src/lib/constants.ts`
- `APP_NAME`, `SUPABASE_URL`, `SUPABASE_KEY`, `BACKEND_URL` from `import.meta.env`
- `SOCIAL_CHANNELS` config array (LinkedIn, Twitter, Instagram, Facebook with icons, labels)
- `PLAN_TIERS` config
- `CALENDAR_VIEWS` enum

#### 2. Theme Overhaul (`src/index.css`)
- New `:root` (light): white bg, gray-50 cards, teal primary, clean neutrals
- New `.dark`: near-black bg, gray-900 cards, teal primary
- Remove `glass`, `glass-strong`, `gradient-text`, `glow-primary` utilities — replace with clean classes
- Keep `gradient-primary` but change to teal gradient

#### 3. Sidebar (`src/components/layout/Sidebar.tsx`)
- Compact icon + label sidebar
- **Top nav**: Dashboard (calendar icon), AI Agent (sparkles), Content (file), Analytics (chart), Media (image)
- **Bottom nav**: Affiliate, Billing, Settings
- Active state: left border indicator, teal highlight
- Collapse toggle
- No "Calendar" as separate item — Dashboard IS the calendar

#### 4. TopBar (`src/components/layout/TopBar.tsx`)
- Left: page title (dynamic based on route)
- Right: search input, notification bell (dropdown with empty state), theme toggle, user avatar dropdown

#### 5. Dashboard (`src/pages/Dashboard.tsx`) — The Command Center
- **KPI Strip** (4 cards, real data):
  - Scheduled Posts: count from `generated_content` where status='ready' or 'draft'
  - Connected Channels: count from `profiles` LinkedIn token check
  - This Month: count from `generated_content` this month
  - AI Credits: from `profiles.credits_remaining` / `monthly_credits`
- **Calendar View Tabs**: Day | Week | Month | List — all functional
- **Month View**: 
  - Grid calendar with `date-fns`
  - Past dates: diagonal lines overlay, no + button
  - Today: highlighted border
  - Future dates: + button on hover to navigate to create post
  - Scheduled posts shown as small colored dots/labels
- **Day View**: Hourly 6AM-11PM timeline, posts shown in time slots, + to add
- **Week View**: 7 columns, posts distributed
- **List View**: Chronological list of all scheduled/draft posts
- **Social Channels Card**: LinkedIn (show real connection status from profiles.linkedin_access_token), Twitter/Instagram/Facebook with "Connect" buttons (link to Settings for OAuth setup)
- **Filter dropdown** and **Search** both functional — filter by status, search by title

#### 6. AI Agent (`src/pages/AIAgent.tsx`)
- Two tabs: **Find Viral Topics** | **Custom Topic**
- **Find Viral Topics tab**:
  - "Find Viral Topics" button triggers existing backend flow (`BACKEND_URL/generation/start`)
  - Progress bar using `useSmoothProgress` + `useGenerationJob` (same hooks, untouched)
  - Shows current stage text during generation
  - When complete: shows the generated content inline (title, content preview, hashtags)
  - Button text: "Find Viral Topics"
- **Custom Topic tab**:
  - Text input for user's topic
  - Button text: "Generate Content"
  - Same generation flow but passes topic in request body
- **Recent Generations** section below: fetches from `generated_content` ordered by `created_at DESC`, shows last 10 items with title, date, status badge
- All navigation to content detail works

#### 7. Analytics (`src/pages/Analytics.tsx`)
- Real data from `user_usage` table
- Charts using `recharts` (already installed):
  - Generations over time (line chart)
  - Credits used per day (bar chart)
  - Publications count
- Summary cards at top with totals
- Date range filter (this week / this month / all time)

#### 8. Media (`src/pages/Media.tsx`)
- Grid layout showing `visual_url` from `generated_content` where visual_url is not null
- Each media item shows thumbnail, title, date
- Empty state: "No media yet. Generate content with visuals to see them here."

#### 9. Settings (`src/pages/Settings.tsx`)
- Profile section: edit full_name, username (updates `profiles` table)
- Connected accounts: LinkedIn connection status, connect/disconnect
- Preferences: theme selection
- Save button that calls `supabase.from('profiles').update()`

#### 10. Billing (`src/pages/Billing.tsx`)
- Current plan display from `profiles.plan`
- Credits usage: `credits_remaining` / `monthly_credits`
- Plan comparison cards (Free, Pro, Enterprise) — upgrade buttons (placeholder action with toast)

#### 11. Affiliate (`src/pages/Affiliate.tsx`)
- Simple centered card: "Affiliate Program — Coming Soon"
- Brief description text

#### 12. Hooks
- `useDashboardStats`: queries `generated_content` count by status, `profiles` for credits, checks LinkedIn token
- `useScheduledPosts(startDate, endDate)`: fetches posts in date range for calendar views

#### 13. Route Updates (`src/App.tsx`)
- `/` → Dashboard
- `/ai-agent` → AIAgent
- `/content` → Content (keep)
- `/content/:slug` → PostDetail (keep)
- `/analytics` → Analytics
- `/media` → Media
- `/settings` → Settings
- `/billing` → Billing
- `/affiliate` → Affiliate
- Remove `/generate` route (redirect to `/ai-agent`)

### Backend — No Changes
- Edge function `generate-post` untouched
- `useGenerationJob` hook untouched
- `useSmoothProgress` hook untouched
- n8n webhook flow untouched
- All Supabase tables/RLS untouched

### Files Summary

| Action | File |
|--------|------|
| Create | `src/lib/constants.ts` |
| Create | `src/components/layout/Sidebar.tsx` |
| Create | `src/components/dashboard/KPIStrip.tsx` |
| Create | `src/components/dashboard/CalendarGrid.tsx` |
| Create | `src/components/dashboard/DayView.tsx` |
| Create | `src/components/dashboard/WeekView.tsx` |
| Create | `src/components/dashboard/ListView.tsx` |
| Create | `src/components/dashboard/SocialChannels.tsx` |
| Create | `src/components/ai-agent/ViralTopicPanel.tsx` |
| Create | `src/components/ai-agent/CustomTopicPanel.tsx` |
| Create | `src/pages/AIAgent.tsx` |
| Create | `src/pages/Analytics.tsx` |
| Create | `src/pages/Media.tsx` |
| Create | `src/pages/Settings.tsx` |
| Create | `src/pages/Billing.tsx` |
| Create | `src/pages/Affiliate.tsx` |
| Create | `src/hooks/useDashboardStats.ts` |
| Create | `src/hooks/useScheduledPosts.ts` |
| Rewrite | `src/index.css` |
| Rewrite | `src/pages/Dashboard.tsx` |
| Rewrite | `src/components/layout/AppLayout.tsx` |
| Rewrite | `src/components/layout/TopBar.tsx` |
| Rewrite | `src/App.tsx` |
| Delete | `src/components/layout/AppSidebar.tsx` |
| Delete | `src/components/dashboard/KPICards.tsx` |
| Delete | `src/components/dashboard/ContentFeed.tsx` |
| Delete | `src/pages/Generate.tsx` |

This will be implemented across multiple messages due to the scope — starting with theme + layout + constants, then dashboard + calendar, then AI agent + remaining pages.

