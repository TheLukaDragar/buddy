/**
 * Bar weight in kg to add for exercises using barbell or EZ-bar.
 * Erik's suggestion: barbell +20kg, ez-bar +8kg.
 * Stored weight = plates only; for display and stats we add bar weight.
 */
const BARBELL_KG = 20;
const EZ_BAR_KG = 8;

/**
 * Returns bar weight (kg) to add for exercises that use barbell or ez-bar.
 * Checks exercise name and equipment text (case-insensitive).
 */
export function getBarWeightKg(exerciseNameOrEquipment: string | null | undefined): number {
  if (!exerciseNameOrEquipment) return 0;
  const s = exerciseNameOrEquipment.toLowerCase();
  if (s.includes('ez-bar') || s.includes('ez bar')) return EZ_BAR_KG;
  if (s.includes('barbell')) return BARBELL_KG;
  return 0;
}

/**
 * Effective weight for display/stats: stored weight (plates) + bar weight.
 */
export function getEffectiveWeightKg(
  storedWeight: number,
  exerciseNameOrEquipment: string | null | undefined
): number {
  return storedWeight + getBarWeightKg(exerciseNameOrEquipment);
}
