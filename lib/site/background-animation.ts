/** Shared tuning for marketing-shell background motion (2D + WebGL + CSS sheen). */

/** Baseline ambient pace; CSS sheen duration ≈ SHEEN_BASE_SEC / pace. */
export const BG_AMBIENT_PACE_BASE = 0.72;

/** Peak pace multiplier after route / in-app navigation (decays in EmotionalUxLayer). */
export const BG_AMBIENT_PACE_NAV_PEAK = 1.65;

/** Drift velocity scale for WebGL + 2D marketing backgrounds (1 = legacy pace). */
export const BG_DRIFT_VEL_SCALE = 0.58;

/** Rotation speed scale for WebGL floaters. */
export const BG_ROT_VEL_SCALE = 0.55;

/** How quickly nav-linked pace returns to baseline (per animation frame step). */
export const BG_NAV_ENERGY_DECAY = 0.9;

/** Nav energy bump on pathname change or `SPARKKI_BG_NAV_EVENT`. */
export const BG_NAV_ENERGY_BUMP = 0.52;

export const BG_NAV_ENERGY_MAX = 1.85;
