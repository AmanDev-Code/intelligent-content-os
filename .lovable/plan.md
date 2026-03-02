

## ContentOS AI — Phase 1: User Workspace

### 1. Design System & Brand Identity
- Dark-first theme with deep navy/indigo backgrounds (#0a0b14, #12132a)
- Purple-to-blue gradient accents for highlights and CTAs
- Glassmorphism cards with subtle backdrop-blur and soft borders
- Premium typography using Inter (clean, modern)
- CSS custom properties for the full color palette (dark + light mode via next-themes)
- Reusable animated components: magnetic hover, smooth card elevation, fade-in-up entrance animations
- Micro-interaction utilities (scale on hover, glow effects, shimmer loading states)

### 2. Authentication Flow
- Login/Signup page with email + Google OAuth (Supabase Auth)
- Premium-styled auth page with gradient background and glassmorphic card
- Password reset flow with dedicated `/reset-password` route
- Protected route wrapper for authenticated pages
- Profiles table in Supabase (username, avatar, plan info, credits)
- Auto-create profile trigger on signup

### 3. App Layout & Navigation
- Sidebar navigation (collapsible) with icons: Dashboard, Generate, Content, Analytics, Settings
- Top bar with user avatar, plan badge, credits indicator, notifications
- Smooth page transitions between routes
- Mobile-responsive layout with bottom nav on small screens

### 4. AI Command Center (Dashboard)
- Dynamic greeting with user name, plan, and credit usage
- Animated KPI cards: posts generated, posts published, avg content score, performance trend
- AI Activity panel: recent generations, suggested improvements, category insights
- Content feed: scrollable, filterable list of generated posts with title, category tag, AI score, status badge, and visual thumbnail
- Filters: category, status, date range
- Cards elevate on hover with smooth depth animation

### 5. "Generate Post" Experience
- Trigger button on dashboard and sidebar
- Immersive full-screen generation overlay with animated stages:
  - Scanning trends → Analyzing signals → Ranking opportunities → Generating insights → Writing content → Designing visuals → Finalizing
- Each stage has icon, progress animation, and subtle particle/glow effects
- Calls Supabase Edge Function → triggers n8n webhook → stores result in DB
- On completion, smoothly transitions to the Post Detail view

### 6. Post Detail (Split Layout)
- **Left panel**: Editable rich text area, copy button, character count
- **Right panel**: Visual preview (image or interactive carousel), AI reasoning panel explaining content selection
- **Bottom section**: Hashtags (copyable), performance prediction score, suggested improvements
- **Actions**: Regenerate, Edit, Publish to LinkedIn, Download
- Smooth transitions between draft/ready/posted states

### 7. LinkedIn Publishing Flow
- Publish button triggers confirmation modal
- Calls edge function → n8n webhook for LinkedIn publish
- Success state with animated checkmark and post link
- Status updates in real-time on the content card

### 8. Analytics Page
- Performance trends (line chart with smooth animations)
- Category distribution (donut chart)
- Score analysis over time
- Engagement prediction indicators
- Growth trajectory visualization
- Stripe/Vercel-quality animated charts using Recharts

### 9. Subscription & Usage Page
- Current plan display with visual hierarchy
- Credit usage progress bars (daily + monthly)
- Feature comparison for upgrade prompts (elegant, not aggressive)
- Premium users get subtle UI accent differences (gold/purple glow)

### 10. Database Structure (Supabase)
- `profiles` table (user info, plan, credits, preferences)
- `generated_content` table (posts, scores, status, visuals, hashtags, AI reasoning)
- `content_categories` table
- `generation_logs` table (tracking each generation run)
- `user_usage` table (daily/monthly credit tracking)
- RLS policies for user-scoped data access
- Edge functions for: triggering n8n, publishing to LinkedIn, fetching analytics

This plan focuses entirely on the user workspace. The Admin Control Layer will be planned as Phase 2 after this is built and polished.

