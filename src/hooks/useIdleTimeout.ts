import { useCallback, useEffect, useRef, useState } from "react";

export const LAST_ACTIVITY_KEY = "last-activity";

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "wheel", "scroll", "touchstart"] as const;
const WRITE_THROTTLE_MS = 5000;
const TICK_MS = 1000;

const readLastActivity = () => {
  try {
    return Number(localStorage.getItem(LAST_ACTIVITY_KEY)) || 0;
  } catch {
    return 0;
  }
};

export const markActivity = () => {
  try {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
  } catch {
    // Storage unavailable: the timer falls back to this tab's own activity only
  }
};

interface UseIdleTimeoutOptions {
  enabled: boolean;
  idleMs: number;
  warningMs: number;
  onTimeout: () => void;
}

// Tracks inactivity across all tabs via a shared last-activity timestamp, so the
// countdown stays correct when timers are throttled in background tabs or the device sleeps.
export function useIdleTimeout({ enabled, idleMs, warningMs, onTimeout }: UseIdleTimeoutOptions) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const isWarningRef = useRef(false);
  const lastWriteRef = useRef(0);
  const timedOutRef = useRef(false);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const check = useCallback(() => {
    if (timedOutRef.current) return;
    const idleFor = Date.now() - readLastActivity();

    if (idleFor >= idleMs + warningMs) {
      timedOutRef.current = true;
      onTimeoutRef.current();
    } else if (idleFor >= idleMs) {
      isWarningRef.current = true;
      setSecondsLeft(Math.ceil((idleMs + warningMs - idleFor) / 1000));
    } else {
      isWarningRef.current = false;
      setSecondsLeft(null);
    }
  }, [idleMs, warningMs]);

  useEffect(() => {
    if (!enabled) return;

    // First load with no record (e.g. storage was cleared): start the clock now
    if (!readLastActivity()) markActivity();

    const handleActivity = () => {
      // Activity while the warning is showing doesn't count; the user must choose Continue
      if (isWarningRef.current) return;
      const now = Date.now();
      if (now - lastWriteRef.current < WRITE_THROTTLE_MS) return;
      lastWriteRef.current = now;
      markActivity();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") check();
    };

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true, capture: true })
    );
    document.addEventListener("visibilitychange", handleVisibility);
    const interval = setInterval(check, TICK_MS);
    // Check straight away (deferred a tick) so a session idle past the limit, e.g. after
    // the laptop slept, is logged out on load rather than a second later
    const initialCheck = setTimeout(check, 0);

    return () => {
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, handleActivity, { capture: true })
      );
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
      clearTimeout(initialCheck);
    };
  }, [enabled, check]);

  const stayActive = useCallback(() => {
    lastWriteRef.current = Date.now();
    markActivity();
    isWarningRef.current = false;
    setSecondsLeft(null);
  }, []);

  return { isWarning: enabled && secondsLeft !== null, secondsLeft: secondsLeft ?? 0, stayActive };
}
