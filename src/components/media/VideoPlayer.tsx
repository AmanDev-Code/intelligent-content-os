"use client";

/**
 * Shared video player — native <video> with custom controls.
 *
 * Vidstack was causing sizing issues with third-party CDN videos (Instagram,
 * TikTok) where the video rendered tiny inside its container. Native <video>
 * gives us full control over object-fit and avoids CORS complications.
 */

import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, Maximize, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VideoPlayerProps {
  /** Direct video URL (mp4, hls .m3u8, etc.) */
  src: string;
  /** Poster/thumbnail shown before playback starts */
  poster?: string | null;
  /** Accessible title for the media */
  title?: string;
  /** Aspect ratio — "9/16" for Reels/Shorts, "16/9" for landscape, "1/1" for square */
  aspectRatio?: "9/16" | "16/9" | "1/1" | "4/5";
  /** Autoplay muted on mount */
  autoPlay?: boolean;
  /** Loop playback */
  loop?: boolean;
  /** Extra classes on the outer wrapper */
  className?: string;
  /** Max width constraint */
  maxWidthClassName?: string;
  /** Enable CORS — leave false for Instagram/TikTok CDN URLs */
  crossOrigin?: boolean;
}

const ASPECT_CLASS: Record<NonNullable<VideoPlayerProps["aspectRatio"]>, string> = {
  "9/16": "aspect-[9/16]",
  "16/9": "aspect-video",
  "1/1": "aspect-square",
  "4/5": "aspect-[4/5]",
};

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function VideoPlayer({
  src,
  poster,
  title = "Video preview",
  aspectRatio = "9/16",
  autoPlay = false,
  loop = false,
  className,
  maxWidthClassName = "max-w-[320px]",
  crossOrigin = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
    } else {
      v.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const handleFullscreen = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen();
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * duration;
  }, [duration]);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => { setPlaying(false); setShowControls(true); };
    const onTime = () => setCurrentTime(v.currentTime);
    const onMeta = () => setDuration(v.duration);

    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);

    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
    };
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={cn(
        "group relative mx-auto w-full overflow-hidden rounded-xl bg-black",
        ASPECT_CLASS[aspectRatio],
        maxWidthClassName,
        className,
      )}
      onMouseMove={resetHideTimer}
      onMouseEnter={() => setShowControls(true)}
    >
      {/* Video element — fills the container */}
      <video
        ref={videoRef}
        src={src}
        poster={poster || undefined}
        title={title}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        crossOrigin={crossOrigin ? "anonymous" : undefined}
        className="absolute inset-0 h-full w-full object-cover"
        onClick={togglePlay}
        aria-label={title}
      />

      {/* Play button overlay (when paused) */}
      {!playing && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity"
          aria-label="Play video"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm">
            <Play className="h-6 w-6 fill-current text-zinc-900 ml-0.5" />
          </div>
        </button>
      )}

      {/* Bottom controls */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-8 transition-opacity duration-200",
          showControls || !playing ? "opacity-100" : "opacity-0",
        )}
      >
        {/* Progress bar */}
        <div
          className="mb-2 h-1 w-full cursor-pointer rounded-full bg-white/30"
          onClick={handleSeek}
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div
            className="h-full rounded-full bg-white transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="text-white/90 hover:text-white"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="h-4 w-4 fill-current" />
              )}
            </button>
            <button
              onClick={toggleMute}
              className="text-white/90 hover:text-white"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            <span className="text-[11px] tabular-nums text-white/70">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <button
            onClick={handleFullscreen}
            className="text-white/90 hover:text-white"
            aria-label="Fullscreen"
          >
            <Maximize className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
