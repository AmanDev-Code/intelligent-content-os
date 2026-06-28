"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Home, Sparkles, CreditCard, BookOpen, ArrowLeft, Search, Rocket } from "lucide-react";

// Floating astronaut SVG component
function FloatingAstronaut({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Helmet */}
      <circle cx="100" cy="85" r="45" fill="#1f2937" />
      <circle cx="100" cy="85" r="38" fill="#374151" />
      {/* Visor */}
      <ellipse cx="100" cy="85" rx="30" ry="28" fill="url(#visor-gradient)" />
      {/* Visor reflection */}
      <ellipse cx="90" cy="78" rx="8" ry="6" fill="rgba(255,255,255,0.3)" />
      
      {/* Body */}
      <rect x="65" y="125" width="70" height="50" rx="10" fill="#374151" />
      <rect x="70" y="130" width="60" height="40" rx="8" fill="#1f2937" />
      
      {/* Backpack */}
      <rect x="135" y="130" width="20" height="35" rx="4" fill="#4b5563" />
      <rect x="45" y="130" width="20" height="35" rx="4" fill="#4b5563" />
      
      {/* Arms */}
      <rect x="30" y="125" width="35" height="14" rx="7" fill="#374151" />
      <rect x="135" y="125" width="35" height="14" rx="7" fill="#374151" />
      
      {/* Hands (gloves) */}
      <circle cx="25" cy="132" r="10" fill="#ff8a1f" />
      <circle cx="175" cy="132" r="10" fill="#ff8a1f" />
      
      {/* Legs */}
      <rect x="75" y="170" width="14" height="25" rx="5" fill="#374151" />
      <rect x="111" y="170" width="14" height="25" rx="5" fill="#374151" />
      
      {/* Boots */}
      <rect x="72" y="190" width="20" height="10" rx="4" fill="#ff8a1f" />
      <rect x="108" y="190" width="20" height="10" rx="4" fill="#ff8a1f" />
      
      {/* Oxygen tube */}
      <path
        d="M135 145 Q 150 155 145 165 Q 140 175 130 180"
        stroke="#6b7280"
        strokeWidth="3"
        fill="none"
      />
      
      {/* Stars around */}
      <circle cx="20" cy="50" r="2" fill="white" className="animate-pulse" />
      <circle cx="180" cy="40" r="1.5" fill="white" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
      <circle cx="165" cy="180" r="2" fill="white" className="animate-pulse" style={{ animationDelay: '1s' }} />
      <circle cx="35" cy="170" r="1.5" fill="white" className="animate-pulse" style={{ animationDelay: '0.7s' }} />
      
      <defs>
        <linearGradient id="visor-gradient" x1="70" y1="60" x2="130" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff8a1f" />
          <stop offset="50%" stopColor="#ff3d39" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Floating planet
function FloatingPlanet({ className, color = "#ff8a1f" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="30" cy="30" r="25" fill={color} opacity="0.2" />
      <circle cx="30" cy="30" r="20" fill={color} opacity="0.4" />
      <circle cx="30" cy="30" r="12" fill={color} />
      {/* Ring */}
      <ellipse cx="30" cy="30" rx="28" ry="8" stroke={color} strokeWidth="2" fill="none" opacity="0.5" />
    </svg>
  );
}

const QUICK_LINKS = [
  { href: "/", label: "Home", icon: Home, description: "Back to homepage" },
  { href: "/features", label: "Features", icon: Sparkles, description: "Explore what we offer" },
  { href: "/pricing", label: "Pricing", icon: CreditCard, description: "View our plans" },
  { href: "/guides", label: "Guides", icon: BookOpen, description: "Learn & grow" },
];

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-muted/30">
      {/* Animated stars background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Static stars */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white/40 animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
        
        {/* Gradient orbs */}
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      {/* Floating planets */}
      <FloatingPlanet 
        className="absolute left-[10%] top-[15%] h-16 w-16 animate-bounce opacity-60" 
        color="#ff8a1f" 
      />
      <FloatingPlanet 
        className="absolute right-[15%] top-[25%] h-10 w-10 animate-bounce opacity-40" 
        color="#8b5cf6" 
      />
      <FloatingPlanet 
        className="absolute left-[20%] bottom-[20%] h-12 w-12 animate-bounce opacity-50" 
        color="#ff3d39" 
      />

      <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        {/* Floating astronaut */}
        <div className="relative mx-auto mb-8 h-48 w-48">
          <FloatingAstronaut className="h-full w-full animate-float" />
          {/* Connection line from astronaut */}
          <svg className="absolute left-1/2 top-full h-24 w-2 -translate-x-1/2" viewBox="0 0 4 80">
            <path
              d="M2 0 Q 4 40 2 80"
              stroke="url(#rope-gradient)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="4 4"
              className="animate-dash"
            />
            <defs>
              <linearGradient id="rope-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff8a1f" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ff8a1f" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 404 Text */}
        <h1 className="font-display text-8xl font-bold tracking-tighter sm:text-9xl">
          <span className="bg-gradient-to-r from-primary via-orange-500 to-red-500 bg-clip-text text-transparent">
            4
          </span>
          <span className="relative inline-block">
            <Rocket className="h-20 w-20 text-muted-foreground/50 sm:h-24 sm:w-24" />
          </span>
          <span className="bg-gradient-to-r from-red-500 via-orange-500 to-primary bg-clip-text text-transparent">
            4
          </span>
        </h1>

        {/* Message */}
        <h2 className="mt-6 font-display text-2xl font-bold text-foreground sm:text-3xl">
          Houston, we have a problem!
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Looks like our astronaut got a bit lost in space. The page you're looking for 
          doesn't exist or has been moved to another galaxy.
        </p>

        {/* Search-like visual (decorative) */}
        <div className="mx-auto mt-8 flex max-w-md items-center gap-3 rounded-full border border-border/60 bg-card/50 px-5 py-3 backdrop-blur-sm">
          <Search className="h-5 w-5 text-muted-foreground" />
          <span className="flex-1 text-left text-muted-foreground/60">
            {pathname || "/unknown-page"}
          </span>
          <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-500">
            Not Found
          </span>
        </div>

        {/* Back button */}
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Earth
        </Link>

        {/* Quick links */}
        <div className="mt-12">
          <p className="mb-6 text-sm font-medium text-muted-foreground">
            Or explore these destinations:
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card/30 p-4 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card/60"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <link.icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {link.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {link.description}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(-3deg);
          }
          50% {
            transform: translateY(-20px) rotate(3deg);
          }
        }
        
        @keyframes dash {
          to {
            stroke-dashoffset: -16;
          }
        }
        
        :global(.animate-float) {
          animation: float 6s ease-in-out infinite;
        }
        
        :global(.animate-dash) {
          animation: dash 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
