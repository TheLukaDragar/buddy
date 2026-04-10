/**
 * Voice agent (AnimatedAIButton) fills — Figma “It’sBuddy” + globals from `nucleus` where noted.
 *
 * File: https://www.figma.com/design/PpkZ19ybaNY5qCda8CxyUt/It-sBuddy
 */
import { nucleus } from '../BiXo_variables.js';
export const voiceAgentDisconnected = {
  blob1: '#F0F6A1',
  blob2: '#6BA8CA',
  blob3: '#4D96BF',
} as const;

/** Alternate blob keyframe for the existing `colorProgress` loop (when connected + isActive) */
export const voiceAgentPulse = {
  blob1: '#EAF27C',
  blob2: '#4D96BF',
  blob3: '#6BA8CA',
} as const;

/**
 * Listening — global/blue/40 * (back), global/brand/60 (mid), global/brand/80 (inner).
 * blob1 = back, blob2 = mid, blob3 = inner (SVG order).
 */
export const voiceAgentListening = {
  blob1: nucleus.light.global.blue['40'],
  blob2: nucleus.light.global.brand['60'],
  blob3: nucleus.light.global.brand['80'],
} as const;

/**
 * Talking — global/brand/60 (back), global/blue/70 (mid), global/blue/80 (inner).
 * blob1 = back, blob2 = mid, blob3 = inner (SVG order).
 */
export const voiceAgentSpeaking = {
  blob1: nucleus.light.global.brand['60'],
  blob2: nucleus.light.global.blue['70'],
  blob3: nucleus.light.global.blue['80'],
} as const;

/**
 * BiXo character (center) — fixed; only the outer ring blobs use listening/speaking.
 * Body = yellow mass; sclera = eye fill.
 */
export const voiceAgentCharacter = {
  bixoBody: nucleus.light.global.brand['40'],
  /** Eye sclera — original asset fill */
  sclera: '#B9E6FF',
} as const;

export const voiceAgentInk = '#203627';
