import type { HTMLAttributes } from "react";

interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  compact?: boolean;
  hideText?: boolean;
  large?: boolean;
  invert?: boolean;
}

export function Logo({
  className = "",
  compact = false,
  hideText = false,
  large = false,
  invert = false,
  ...props
}: LogoProps) {
  return (
    <div
      className={`flex min-w-0 items-center ${hideText ? "justify-center" : "gap-3"} ${invert ? "text-white" : ""} ${className}`}
      {...props}
    >
      <img
        src="/logo.jpeg"
        alt="AVC Logo"
        className={`shrink-0 rounded-full object-cover shadow-glow ${
          hideText ? (large ? "h-24 w-24" : "h-8 w-8") : compact ? "h-10 w-10" : "h-12 w-12"
        }`}
      />
      {!hideText && (
        <div className={`min-w-0 ${compact ? "text-sm" : "text-base"}`}>
          <p className="truncate font-semibold">Amazing Voices Choir</p>
          <p
            className={`truncate text-[10px] uppercase tracking-[0.22em] ${
              invert ? "text-white/60" : "text-muted-foreground"
            }`}
          >
            Choir Portal
          </p>
        </div>
      )}
    </div>
  );
}

import type { HTMLAttributes } from "react";

interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  compact?: boolean;
  hideText?: boolean;
  invert?: boolean;
}

export function Logo({
  className = "",
  compact = false,
  hideText = false,
  invert = false,
  ...props
}: LogoProps) {
  return (
    <div
      className={`flex min-w-0 items-center ${hideText ? "justify-center" : "gap-3"} ${invert ? "text-white" : ""} ${className}`}
      {...props}
    >
      <img
        src="/logo.jpeg"
        alt="AVC Logo"
        className={`shrink-0 rounded-full object-cover shadow-glow ${
          hideText ? "h-8 w-8" : compact ? "h-10 w-10" : "h-12 w-12"
        }`}
      />
      {!hideText && (
        <div className={`min-w-0 ${compact ? "text-sm" : "text-base"}`}>
          <p className="truncate font-semibold">Amazing Voices Choir</p>
          <p
            className={`truncate text-[10px] uppercase tracking-[0.22em] ${
              invert ? "text-white/60" : "text-muted-foreground"
            }`}
          >
            Choir Portal
          </p>
        </div>
      )}
    </div>
  );
}
