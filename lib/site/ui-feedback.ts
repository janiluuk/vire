/**
 * Phase 10 — optional primary-action feedback (haptics + opt-in sound).
 * Sound: set NEXT_PUBLIC_ENABLE_UI_SOUNDS=true (still respects reduced motion).
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const w = window as typeof window & {
      webkitAudioContext?: typeof AudioContext;
    };
    const AC = window.AudioContext ?? w.webkitAudioContext;
    if (!AC) return null;
    audioCtx ??= new AC();
    return audioCtx;
  } catch {
    return null;
  }
}

/** Short haptic + optional near-silent tick when user taps the main order CTA. */
export function feedbackPrimaryCTA(): void {
  if (typeof window === "undefined") return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduced && typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(10);
  }

  if (reduced || process.env.NEXT_PUBLIC_ENABLE_UI_SOUNDS !== "true") return;

  void (async () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    await ctx.resume().catch(() => {});
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 1568;
    gain.gain.value = 0.012;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.035);
  })();
}
