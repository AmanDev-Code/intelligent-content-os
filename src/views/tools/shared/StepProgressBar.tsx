"use client";

/**
 * StepProgressBar — numbered step progress indicator (1 -> 2 -> 3).
 * Active step gets an orange circle + bold label; inactive steps are muted.
 * Connecting lines/arrows between steps.
 *
 * Design tokens: --primary, --primary-foreground, --tool-surface,
 *   --tool-border, --muted-foreground, --foreground.
 * Icons: Lucide only (ChevronRight for connector).
 */

import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  number: number;
  label: string;
  sublabel?: string;
}

export interface StepProgressBarProps {
  steps: Step[];
  activeStep: number;
  /** Additional class names for the outer container */
  className?: string;
}

export function StepProgressBar({
  steps,
  activeStep,
  className,
}: StepProgressBarProps) {
  if (!steps.length) return null;

  return (
    <nav
      aria-label="Progress steps"
      className={cn("w-full", className)}
    >
      <ol className="flex items-start justify-center gap-0">
        {steps.map((step, index) => {
          const isActive = step.number === activeStep;
          const isCompleted = step.number < activeStep;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.number}
              className="flex items-start"
              aria-current={isActive ? "step" : undefined}
            >
              {/* Step circle + labels */}
              <div className="flex flex-col items-center gap-1.5">
                {/* Circle */}
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all sm:h-10 sm:w-10",
                    isActive &&
                      "text-[hsl(var(--primary-foreground))] shadow-[0_0_12px_hsl(var(--primary)/0.4)]",
                    isCompleted &&
                      "text-[hsl(var(--primary-foreground))] opacity-80",
                    !isActive &&
                      !isCompleted &&
                      "border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface))] text-muted-foreground"
                  )}
                  style={
                    isActive || isCompleted
                      ? {
                          background:
                            "linear-gradient(135deg, #F97316, #F59E0B)",
                        }
                      : undefined
                  }
                >
                  {step.number}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "max-w-[100px] text-center text-xs font-semibold leading-tight sm:max-w-[120px] sm:text-sm",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>

                {/* Sublabel */}
                {step.sublabel && (
                  <span className="max-w-[100px] text-center text-[10px] leading-tight text-muted-foreground/70 sm:max-w-[120px] sm:text-xs">
                    {step.sublabel}
                  </span>
                )}
              </div>

              {/* Connector arrow */}
              {!isLast && (
                <div className="flex items-center self-start pt-2.5 sm:pt-3">
                  <div
                    className={cn(
                      "mx-1 h-px w-6 sm:mx-2 sm:w-10",
                      isCompleted
                        ? "bg-[hsl(var(--primary))]"
                        : "bg-[hsl(var(--tool-border))]"
                    )}
                  />
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isCompleted
                        ? "text-[hsl(var(--primary))]"
                        : "text-muted-foreground/50"
                    )}
                    aria-hidden="true"
                  />
                  <div
                    className={cn(
                      "mx-1 h-px w-6 sm:mx-2 sm:w-10",
                      isCompleted
                        ? "bg-[hsl(var(--primary))]"
                        : "bg-[hsl(var(--tool-border))]"
                    )}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
