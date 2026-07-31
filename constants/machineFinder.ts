export type MachineFinderTarget = {
  slug: string;
  keywords: string;
  /** Resolved muscle icon key, e.g. "chest", "quads" */
  muscleIconKey: string;
  muscleLabel: string;
};

/** Slug → English search labels for gym floor machines */
export const MACHINE_FINDER_MAP: Record<string, string> = {
  'shoulder-press-machine': 'Shoulder Press',
  'chest-fly-machine': 'Chest Fly',
  'incline-chest-press-machine': 'Incline Chest Press',
  'incline-chest-machine': 'Incline Chest Press',
  'pull-up-machine': 'Assisted Pull-Up',
  'knee-extension-machine': 'Leg Extension',
  'knee-flexion-machine': 'Leg Curl',
  'hack-squat-machine': 'Hack Squat or Squat Machine',
  'smith-machine': 'Smith Machine',
  'leg-press': 'Leg Press',
  'leg-press-machine': 'Leg Press',
  'dips-machine': 'Dip Machine',
  'calf-raise-machine': 'Calf Raise Machine',
  'seated-calf-raise-machine': 'Seated Calf Raise',
  'shoulder-abduction-machine': 'Shoulder Abduction',
  'back-extension-machine': 'Back Extension',
};

/**
 * Machine → detailed muscle icon (primary).
 * Every icon file is used at least once across machine + category maps.
 */
const MACHINE_SLUG_MUSCLE_ICON: Record<string, string> = {
  'shoulder-press-machine': 'shoulders',
  'shoulder-abduction-machine': 'shoulders',
  'chest-fly-machine': 'chest',
  'incline-chest-press-machine': 'chest',
  'incline-chest-machine': 'chest',
  'dips-machine': 'triceps',
  'pull-up-machine': 'lats',
  'back-extension-machine': 'lower-back',
  'knee-extension-machine': 'quads',
  'knee-flexion-machine': 'hamstrings',
  'hack-squat-machine': 'glutes',
  'smith-machine': 'posterior-chain',
  'leg-press': 'quads',
  'leg-press-machine': 'quads',
  'calf-raise-machine': 'calves',
  'seated-calf-raise-machine': 'calves',
};

/**
 * DB muscle_categories (6 broad) → icon fallback when machine has no map.
 * Uses remaining icons: back, biceps (+ shared defaults).
 */
const MUSCLE_CATEGORY_ICON: Record<string, string> = {
  shoulders: 'shoulders',
  chest: 'chest',
  back: 'back',
  arms: 'biceps',
  legs: 'quads',
  core: 'lower-back',
};

const MUSCLE_ICON_LABELS: Record<string, string> = {
  shoulders: 'Shoulders',
  chest: 'Chest',
  back: 'Back',
  lats: 'Lats',
  'lower-back': 'Lower Back',
  biceps: 'Biceps',
  triceps: 'Triceps',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  'posterior-chain': 'Posterior Chain',
};

/** All muscle icons in assets/muscle_icons/ */
const MUSCLE_ICON_MAP: Record<string, number> = {
  shoulders: require('../assets/muscle_icons/shoulders.png'),
  chest: require('../assets/muscle_icons/chest.png'),
  back: require('../assets/muscle_icons/back.png'),
  lats: require('../assets/muscle_icons/lats.png'),
  'lower-back': require('../assets/muscle_icons/lower-back.png'),
  biceps: require('../assets/muscle_icons/biceps.png'),
  triceps: require('../assets/muscle_icons/triceps.png'),
  quads: require('../assets/muscle_icons/quads.png'),
  hamstrings: require('../assets/muscle_icons/hamstrings.png'),
  glutes: require('../assets/muscle_icons/glutes.png'),
  calves: require('../assets/muscle_icons/calves.png'),
  'posterior-chain': require('../assets/muscle_icons/posterior-chain.png'),
};

/** Icon asset per machine slug (aliases share the same asset). */
const MACHINE_ICON_MAP: Record<string, number> = {
  'back-extension-machine': require('../assets/equipment_icons/back-extension-machine.png'),
  'calf-raise-machine': require('../assets/equipment_icons/calf-raise-machine.png'),
  'chest-fly-machine': require('../assets/equipment_icons/chest-fly-machine.png'),
  'dips-machine': require('../assets/equipment_icons/dips-machine.png'),
  'hack-squat-machine': require('../assets/equipment_icons/hack-squat-machine.png'),
  'smith-machine': require('../assets/equipment_icons/smith-machine.png'),
  'incline-chest-press-machine': require('../assets/equipment_icons/incline-chest-press-machine.png'),
  'incline-chest-machine': require('../assets/equipment_icons/incline-chest-press-machine.png'),
  'knee-extension-machine': require('../assets/equipment_icons/knee-extension-machine.png'),
  'knee-flexion-machine': require('../assets/equipment_icons/knee-flexion-machine.png'),
  'leg-press': require('../assets/equipment_icons/leg-press.png'),
  'leg-press-machine': require('../assets/equipment_icons/leg-press.png'),
  'pull-up-machine': require('../assets/equipment_icons/pull-up-machine.png'),
  'seated-calf-raise-machine': require('../assets/equipment_icons/seated-calf-raise-machine.png'),
  'shoulder-abduction-machine': require('../assets/equipment_icons/shoulder-abduction-machine.png'),
  'shoulder-press-machine': require('../assets/equipment_icons/shoulder-press-machine.png'),
};

/**
 * Parse exercise.equipment_groups into string[][] groups.
 * Shape: { groups: string[][] } or JSON string of the same.
 */
export function parseEquipmentGroups(equipmentGroups: unknown): string[][] {
  if (!equipmentGroups) return [];

  let parsed: unknown = equipmentGroups;
  if (typeof equipmentGroups === 'string') {
    try {
      parsed = JSON.parse(equipmentGroups);
    } catch {
      return [];
    }
  }

  if (parsed && typeof parsed === 'object' && Array.isArray((parsed as { groups?: unknown }).groups)) {
    return ((parsed as { groups: unknown[] }).groups)
      .filter(Array.isArray)
      .map((group) => group.filter((slug): slug is string => typeof slug === 'string'));
  }

  return [];
}

/** Flatten groups in order (first group first) and return unique slugs. */
export function flattenEquipmentSlugs(groups: string[][]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const group of groups) {
    for (const slug of group) {
      if (!seen.has(slug)) {
        seen.add(slug);
        result.push(slug);
      }
    }
  }
  return result;
}

/** Match free-text equipment labels (e.g. "Shoulder Press Machine") to a finder slug. */
function resolveFromEquipmentText(equipmentText: string): string | null {
  const normalized = equipmentText.toLowerCase();
  const slugs = Object.keys(MACHINE_FINDER_MAP).sort((a, b) => b.length - a.length);
  for (const slug of slugs) {
    const phrase = slug.replace(/-/g, ' ');
    if (normalized.includes(phrase)) {
      return slug;
    }
  }
  return null;
}

/** Prefer detailed machine icon; fall back to broad DB category. */
export function resolveMuscleIconKey(
  machineSlug: string,
  muscleCategories?: (string | null | undefined)[] | null
): string {
  const fromMachine = MACHINE_SLUG_MUSCLE_ICON[machineSlug];
  if (fromMachine) return fromMachine;

  if (muscleCategories?.length) {
    for (const raw of muscleCategories) {
      if (!raw) continue;
      const key = MUSCLE_CATEGORY_ICON[raw.trim().toLowerCase()];
      if (key) return key;
    }
  }

  return 'back';
}

function buildTarget(
  slug: string,
  muscleCategories?: (string | null | undefined)[] | null
): MachineFinderTarget {
  const muscleIconKey = resolveMuscleIconKey(slug, muscleCategories);
  return {
    slug,
    keywords: MACHINE_FINDER_MAP[slug],
    muscleIconKey,
    muscleLabel: MUSCLE_ICON_LABELS[muscleIconKey] ?? muscleIconKey,
  };
}

/** First equipment slug that has machine-finder keywords, or null. */
export function resolveMachineFinderTarget(
  equipmentGroups: unknown,
  equipmentText?: string | null,
  muscleCategories?: (string | null | undefined)[] | null
): MachineFinderTarget | null {
  const slugs = flattenEquipmentSlugs(parseEquipmentGroups(equipmentGroups));
  for (const slug of slugs) {
    if (MACHINE_FINDER_MAP[slug]) {
      return buildTarget(slug, muscleCategories);
    }
  }

  if (equipmentText?.trim()) {
    const slug = resolveFromEquipmentText(equipmentText);
    if (slug) return buildTarget(slug, muscleCategories);
  }

  return null;
}

export function getMachineFinderIcon(slug: string): number {
  return MACHINE_ICON_MAP[slug] ?? require('../assets/equipment_icons/body-weight.png');
}

export function getMuscleCategoryIcon(key: string): number {
  return MUSCLE_ICON_MAP[key] ?? MUSCLE_ICON_MAP.back;
}
