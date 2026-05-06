"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BRAND } from "@/lib/brand";

interface Props {
  message?: string;
  scheduledEnd?: string;
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function getTimeLeft(endISO: string): TimeLeft {
  const diff = new Date(endISO).getTime() - Date.now();
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function MaintenancePage({ message, scheduledEnd }: Props) {
  // Initialize as null to avoid SSR/client hydration mismatch on Date.now()
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (!scheduledEnd) return;
    const tick = () => setTimeLeft(getTimeLeft(scheduledEnd));
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [scheduledEnd]);

  return (
    <>
      {/* Scoped keyframe animations — no external CSS dependency */}
      <style>{`
        @keyframes mn-float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(32px, -28px) scale(1.08); }
        }
        @keyframes mn-float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-22px, 22px) scale(0.94); }
        }
        @keyframes mn-float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(18px, -16px) scale(1.04); }
          66% { transform: translate(-14px, 12px) scale(0.96); }
        }
        @keyframes mn-pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(255,138,31,.5); }
          50% { opacity: 0.7; transform: scale(0.8); box-shadow: 0 0 0 6px rgba(255,138,31,0); }
        }
        @keyframes mn-gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .mn-orb-1 {
          position: absolute; border-radius: 50%; filter: blur(90px); pointer-events: none;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(255,138,31,.09) 0%, transparent 70%);
          top: -120px; right: -100px;
          animation: mn-float1 9s ease-in-out infinite;
        }
        .mn-orb-2 {
          position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none;
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(255,61,57,.07) 0%, transparent 70%);
          bottom: -60px; left: -60px;
          animation: mn-float2 11s ease-in-out infinite;
        }
        .mn-orb-3 {
          position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none;
          width: 220px; height: 220px;
          background: radial-gradient(circle, rgba(255,177,74,.06) 0%, transparent 70%);
          top: 42%; left: 18%;
          animation: mn-float3 14s ease-in-out infinite;
        }
        .mn-pulse-dot {
          display: inline-block; width: 8px; height: 8px; border-radius: 50%;
          background: #ff8a1f;
          animation: mn-pulse-dot 2.2s ease-in-out infinite;
          flex-shrink: 0;
        }
        .mn-gradient-text {
          background: linear-gradient(90deg, #ff8a1f, #ffb14a, #ff8a1f);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: mn-gradient-shift 4s ease infinite;
        }
        .mn-timer-box {
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,138,31,.22);
          border-radius: 14px;
          width: 88px; height: 88px;
          display: flex; align-items: center; justify-content: center;
          font-size: 2.125rem; font-weight: 700; color: #fff;
          font-variant-numeric: tabular-nums;
          box-shadow: 0 0 24px rgba(255,138,31,.1), inset 0 1px 0 rgba(255,255,255,.04);
          backdrop-filter: blur(12px);
          transition: box-shadow .3s;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#0a0f1e",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          fontFamily: "var(--font-poppins, system-ui, sans-serif)",
        }}
      >
        {/* Animated background orbs */}
        <div className="mn-orb-1" />
        <div className="mn-orb-2" />
        <div className="mn-orb-3" />

        {/* Main content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            textAlign: "center",
            padding: "2rem 1.5rem",
            maxWidth: "600px",
            width: "100%",
          }}
        >
          {/* Logo: use the color icon + white wordmark image directly to avoid dark/light ambiguity */}
          <div
            style={{
              marginBottom: "2.75rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Image
              src={BRAND.icon.color}
              alt=""
              width={40}
              height={40}
              priority
              style={{ width: 40, height: 40, objectFit: "contain" }}
            />
            {/* White wordmark rendered as text so it's always legible on dark bg */}
            <span
              style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-0.03em",
              }}
            >
              Trndinn
            </span>
          </div>

          {/* Status pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(255,138,31,.1)",
              border: "1px solid rgba(255,138,31,.25)",
              borderRadius: "9999px",
              padding: "0.375rem 1rem",
              marginBottom: "2rem",
            }}
          >
            <span className="mn-pulse-dot" />
            <span
              style={{
                color: "#ff8a1f",
                fontSize: "0.6875rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Maintenance in progress
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: "clamp(2.125rem, 6vw, 3.75rem)",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.1,
              marginBottom: "1.125rem",
              letterSpacing: "-0.025em",
            }}
          >
            We&apos;re improving things
            <br />
            <span className="mn-gradient-text">for you</span>
          </h1>

          {/* Subtext */}
          <p
            style={{
              color: "rgba(255,255,255,.55)",
              fontSize: "1.0625rem",
              lineHeight: 1.65,
              maxWidth: "460px",
              margin: "0 auto",
              marginBottom: message ? "0" : "2.5rem",
            }}
          >
            Trndinn is currently undergoing scheduled maintenance.
            <br />
            We&apos;ll be back shortly.
          </p>

          {/* Custom admin message */}
          {message && (
            <div
              style={{
                background: "rgba(255,255,255,.04)",
                border: "1px solid rgba(255,255,255,.1)",
                borderRadius: "14px",
                padding: "1rem 1.375rem",
                marginTop: "1.5rem",
                marginBottom: "0.5rem",
                textAlign: "left",
              }}
            >
              <p
                style={{
                  color: "rgba(255,255,255,.65)",
                  fontSize: "0.9375rem",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {message}
              </p>
            </div>
          )}

          {/* Countdown timer */}
          {scheduledEnd && timeLeft && !timeLeft.expired && (
            <div style={{ marginTop: "2.75rem" }}>
              <p
                style={{
                  color: "rgba(255,255,255,.35)",
                  fontSize: "0.6875rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "1.125rem",
                }}
              >
                Estimated time remaining
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "0.875rem",
                  justifyContent: "center",
                  alignItems: "flex-start",
                }}
              >
                {(
                  [
                    { value: pad(timeLeft.hours), label: "Hours" },
                    { value: pad(timeLeft.minutes), label: "Minutes" },
                    { value: pad(timeLeft.seconds), label: "Seconds" },
                  ] as const
                ).map(({ value, label }, i) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.875rem",
                    }}
                  >
                    {i > 0 && (
                      <span
                        style={{
                          color: "rgba(255,255,255,.2)",
                          fontSize: "1.75rem",
                          fontWeight: 300,
                          lineHeight: 1,
                          marginBottom: "1.5rem",
                          userSelect: "none",
                        }}
                      >
                        :
                      </span>
                    )}
                    <div
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}
                    >
                      <div className="mn-timer-box">{value}</div>
                      <span
                        style={{
                          color: "rgba(255,255,255,.35)",
                          fontSize: "0.6875rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* "Back shortly" fallback when no scheduledEnd */}
          {!scheduledEnd && (
            <div
              style={{
                marginTop: "2.75rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "rgba(255,255,255,.3)",
                fontSize: "0.875rem",
              }}
            >
              <span style={{ fontSize: "1.25rem" }}>⏳</span>
              We&apos;ll be back shortly
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "1.75rem",
            left: 0,
            right: 0,
            textAlign: "center",
          }}
        >
          <p style={{ color: "rgba(255,255,255,.2)", fontSize: "0.8125rem", margin: 0 }}>
            Follow us on{" "}
            <a
              href="https://linkedin.com/company/trndinn"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "rgba(255,138,31,.55)", textDecoration: "none" }}
            >
              LinkedIn
            </a>{" "}
            for updates
          </p>
        </div>
      </div>
    </>
  );
}
