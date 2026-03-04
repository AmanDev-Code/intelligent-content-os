

## Plan: Smooth Optimistic Progress with Backend Synchronization

### Problem
Progress bar jumps abruptly (0→20→60→100) because it directly mirrors discrete database values.

### Solution
Create a `useSmoothProgress` hook that interpolates `displayProgress` toward a `targetProgress` using `requestAnimationFrame`, while `useGenerationJob` sets the target from backend updates.

### New File: `src/hooks/useSmoothProgress.ts`
- Maintains two values: `targetProgress` (ref) and `displayProgress` (state)
- Runs a `requestAnimationFrame` loop that increments `displayProgress` by ~1% per ~80ms toward `targetProgress`
- Exposes `setTarget(n)` to update the target and `displayProgress` for rendering
- When target is 100, snaps immediately to 100
- Cleanup cancels the animation frame

### Changes to `src/pages/Generate.tsx`
- Replace the `progress` state with `useSmoothProgress()`
- In `handleGenerate`: immediately call `setTarget(20)` after getting jobId (gives instant visual feedback)
- In `handleProgress`: call `setTarget(backendProgress)` instead of `setProgress`
- In `handleComplete`: call `setTarget(100)`
- In `handleFailed`: reset to 0
- Progress bar and percentage text use `displayProgress` instead of `progress`

### Behavior Timeline
1. Click Generate → `setTarget(20)` → bar animates 0→1→2→...→20
2. Backend sends 60 → `setTarget(60)` → bar animates 20→21→...→60
3. Backend sends 100 / status=ready → `setTarget(100)` → bar completes → navigate

### No changes to `useGenerationJob.ts`
The hook remains the source of truth for backend data. Only the consumer (Generate.tsx) adds the smoothing layer on top.

