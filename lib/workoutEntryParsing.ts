/**
 * Parse first integer from strings like "30 sec", "8-12", "40kg".
 */
export function parseFirstInt(text: string | null | undefined): number | undefined {
  if (text == null || text === '') return undefined;
  const match = String(text).match(/(\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
}

/** Stored on workout_entries / workout_preset_entries */
export type PrescriptionType = 'reps' | 'time';

export function normalizePrescriptionType(
  value: string | null | undefined
): PrescriptionType | null {
  if (value === 'reps' || value === 'time') return value;
  return null;
}

/**
 * Legacy inference when `prescription_type` is absent (old rows / cached payloads).
 */
export function inferPrescriptionType(
  repsStr: string | null | undefined,
  timeStr: string | null | undefined
): PrescriptionType {
  const normalizedReps = (repsStr ?? '').trim();
  const timeSeconds = parseFirstInt(timeStr);
  if (timeSeconds != null && timeSeconds > 0 && !/\d/.test(normalizedReps)) {
    return 'time';
  }
  return 'reps';
}

/**
 * Target for the right-column control (reps count or hold seconds depending on type).
 *
 * - `prescriptionType === 'time'`: primary value from **time** (seconds), then first digit in reps if any.
 * - Otherwise: first number in **reps**, default 8 if missing.
 * - If `prescriptionType` is null/unknown, uses **inferPrescriptionType** (legacy).
 */
export function targetRepsFromEntry(
  repsStr: string | null | undefined,
  timeStr: string | null | undefined,
  prescriptionTypeRaw?: string | null
): number {
  const pt = normalizePrescriptionType(prescriptionTypeRaw) ?? inferPrescriptionType(repsStr, timeStr);

  if (pt === 'time') {
    const timeSeconds = parseFirstInt(timeStr);
    if (timeSeconds != null && timeSeconds > 0) {
      return timeSeconds;
    }
    const normalizedReps = (repsStr ?? '').trim();
    const match = normalizedReps.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 8;
  }

  const normalizedReps = (repsStr ?? '').trim();
  const match = normalizedReps.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 8;
}
