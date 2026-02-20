import { createClient } from "@supabase/supabase-js";
import { task, tasks } from "@trigger.dev/sdk";
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import type { generateExerciseProfileTask } from './exercise-profile-generation';




const exercisePool = [
  {
    "exercise_slug": "kneeling-lateral-raise-alternating-db-or-kb",
    "exercise_name": "Kneeling Lateral Raise — Alternating (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "kneeling-lateral-raise-unilateral-db-or-kb",
    "exercise_name": "Kneeling Lateral Raise — Unilateral (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "kneeling-lateral-raise-db-or-kb",
    "exercise_name": "Kneeling Lateral Raise (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "sitting-on-the-floor-alternating-overhead-press-db-or-kb",
    "exercise_name": "Sitting On The Floor — Alternating Overhead Press (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "sitting-on-the-floor-alternating-overhead-press-neutral-grip-kb-or-db",
    "exercise_name": "Sitting On The Floor — Alternating Overhead Press, Neutral Grip (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "sitting-on-the-floor-arnold-press-kb-or-db",
    "exercise_name": "Sitting On The Floor — Arnold Press (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "sitting-on-the-floor-overhead-press-db-or-kb",
    "exercise_name": "Sitting On The Floor — Overhead Press (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "sitting-on-the-floor-overhead-press-neutral-grip-kb-or-db",
    "exercise_name": "Sitting On The Floor — Overhead Press, Neutral Grip (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "sitting-on-the-floor-unilateral-overhead-press-kb-or-db",
    "exercise_name": "Sitting On The Floor — Unilateral Overhead Press (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "sitting-on-the-floor-unilateral-overhead-press-neutral-grip-kb-or-db",
    "exercise_name": "Sitting On The Floor — Unilateral Overhead Press, Neutral Grip (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-alternating-overhead-press-neutral-grip-kb-or-db",
    "exercise_name": "Standing Alternating Overhead Press — Neutral Grip (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-alternating-overhead-press-kb-or-db",
    "exercise_name": "Standing Alternating Overhead Press (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-arnold-press-kb-or-db",
    "exercise_name": "Standing Arnold Press (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-lateral-raise-alternating-db-or-kb",
    "exercise_name": "Standing Lateral Raise — Alternating (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-lateral-raise-unilateral-db-or-kb",
    "exercise_name": "Standing Lateral Raise — Unilateral (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-lateral-raise-db-or-kb",
    "exercise_name": "Standing Lateral Raise (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-overhead-press-neutral-grip-kb-or-db",
    "exercise_name": "Standing Overhead Press — Neutral Grip (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-overhead-press-kb-or-db",
    "exercise_name": "Standing Overhead Press (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-unilateral-overhead-press-neutral-grip-kb-or-db",
    "exercise_name": "Standing Unilateral Overhead Press — Neutral Grip (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-unilateral-overhead-press-kb-or-db",
    "exercise_name": "Standing Unilateral Overhead Press (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "alternating-seated-overhead-press-tempo-ecc",
    "exercise_name": "Alternating Seated Overhead Press, Tempo (Ecc.)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "alternating-seated-overhead-press",
    "exercise_name": "Alternating Seated Overhead Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "anchored-shoulder-press",
    "exercise_name": "Anchored Shoulder Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-kneeling-alternating-overhead-press-neutral-grip",
    "exercise_name": "Banded Kneeling Alternating Overhead Press — Neutral Grip",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-kneeling-alternating-overhead-press",
    "exercise_name": "Banded Kneeling Alternating Overhead Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-kneeling-arnold-press",
    "exercise_name": "Banded Kneeling Arnold Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-kneeling-overhead-press-neutral-grip",
    "exercise_name": "Banded Kneeling Overhead Press — Neutral Grip",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-kneeling-overhead-press",
    "exercise_name": "Banded Kneeling Overhead Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-kneeling-unilateral-overhead-press-neutral-grip",
    "exercise_name": "Banded Kneeling Unilateral Overhead Press — Neutral Grip",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-kneeling-unilateral-overhead-press",
    "exercise_name": "Banded Kneeling Unilateral Overhead Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-sitting-on-the-floor-alternating-overhead-press-neutral-grip",
    "exercise_name": "Banded Sitting-On-The-Floor Alternating Overhead Press — Neutral Grip",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-sitting-on-the-floor-alternating-overhead-press",
    "exercise_name": "Banded Sitting-On-The-Floor Alternating Overhead Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-sitting-on-the-floor-arnold-press",
    "exercise_name": "Banded Sitting-On-The-Floor Arnold Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-sitting-on-the-floor-overhead-press-neutral-grip",
    "exercise_name": "Banded Sitting-On-The-Floor Overhead Press — Neutral Grip",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-sitting-on-the-floor-overhead-press",
    "exercise_name": "Banded Sitting-On-The-Floor Overhead Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-sitting-on-the-floor-unilateral-overhead-press-neutral-grip",
    "exercise_name": "Banded Sitting-On-The-Floor Unilateral Overhead Press — Neutral Grip",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-sitting-on-the-floor-unilateral-overhead-press",
    "exercise_name": "Banded Sitting-On-The-Floor Unilateral Overhead Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-standing-alternating-overhead-press-neutral-grip",
    "exercise_name": "Banded Standing Alternating Overhead Press — Neutral Grip",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-standing-alternating-overhead-press",
    "exercise_name": "Banded Standing Alternating Overhead Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-standing-arnold-press",
    "exercise_name": "Banded Standing Arnold Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-standing-overhead-press-neutral-grip",
    "exercise_name": "Banded Standing Overhead Press — Neutral Grip",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-standing-overhead-press",
    "exercise_name": "Banded Standing Overhead Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "lateral-raise-anchored",
    "exercise_name": "Lateral Raise — Anchored",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "pike-shoulder-press",
    "exercise_name": "Pike Shoulder Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-alternating-lateral-raise",
    "exercise_name": "Seated Alternating Lateral Raise",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-arnold-press",
    "exercise_name": "Seated Arnold Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-lateral-raise",
    "exercise_name": "Seated Lateral Raise",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-overhead-press",
    "exercise_name": "Seated Overhead Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-overhead-press-tempo-ecc",
    "exercise_name": "Seated Overhead Press, Tempo (Ecc.)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "unilateral-seated-overhead-press-tempo-ecc",
    "exercise_name": "Unilateral Seated Overhead Press, Tempo (Ecc.)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "unilateral-seated-overhead-press",
    "exercise_name": "Unilateral Seated Overhead Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "unilateral-seated-overhead-press",
    "exercise_name": "Unilateral Seated Overhead Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-standing-unilateral-overhead-press-neutral-grip",
    "exercise_name": "Banded Standing Unilateral Overhead Press — Neutral Grip",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-standing-unilateral-overhead-press",
    "exercise_name": "Banded Standing Unilateral Overhead Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "kneeling-alternating-front-raise-db-or-kb",
    "exercise_name": "Kneeling Alternating Front Raise (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "kneeling-front-raise-db-or-kb",
    "exercise_name": "Kneeling Front Raise (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "sitting-on-the-floor-alternating-front-press-db-or-kb",
    "exercise_name": "Sitting On The Floor — Alternating Front Press (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "sitting-on-the-floor-front-press-db-or-kb",
    "exercise_name": "Sitting On The Floor — Front Press (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-alternating-front-press-db-or-kb",
    "exercise_name": "Standing Alternating Front Press (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-alternating-front-raise-db-or-kb",
    "exercise_name": "Standing Alternating Front Raise (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-front-press-db-or-kb",
    "exercise_name": "Standing Front Press (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-front-raise-db-or-kb",
    "exercise_name": "Standing Front Raise (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "alternating-seated-front-press",
    "exercise_name": "Alternating Seated Front Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "alternating-seated-neutral-press-tempo-ecc",
    "exercise_name": "Alternating Seated Neutral Press, Tempo (Ecc.)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "alternating-seated-neutral-press",
    "exercise_name": "Alternating Seated Neutral Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "anchored-front-raise",
    "exercise_name": "Anchored Front Raise",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-kneeling-alternating-front-press",
    "exercise_name": "Banded Kneeling Alternating Front Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-kneeling-front-press",
    "exercise_name": "Banded Kneeling Front Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-sitting-on-the-floor-alternating-front-press",
    "exercise_name": "Banded Sitting-On-The-Floor Alternating Front Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-sitting-on-the-floor-front-press",
    "exercise_name": "Banded Sitting-On-The-Floor Front Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-standing-alternating-front-press",
    "exercise_name": "Banded Standing Alternating Front Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-standing-front-press",
    "exercise_name": "Banded Standing Front Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-alternating-front-raise",
    "exercise_name": "Seated Alternating Front Raise",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-front-press",
    "exercise_name": "Seated Front Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-front-raise",
    "exercise_name": "Seated Front Raise",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-neutral-press-tempo-ecc",
    "exercise_name": "Seated Neutral Press — Tempo (Ecc.)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-neutral-press",
    "exercise_name": "Seated Neutral Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-unilateral-front-raise",
    "exercise_name": "Seated Unilateral Front Raise",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-kneeling-unilateral-front-press",
    "exercise_name": "Banded Kneeling Unilateral Front Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-sitting-on-the-floor-unilateral-front-press",
    "exercise_name": "Banded Sitting-On-The-Floor Unilateral Front Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "sitting-on-the-floor-unilateral-front-press-kb-or-db",
    "exercise_name": "Sitting On The Floor — Unilateral Front Press (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-unilateral-front-press-db-or-kb",
    "exercise_name": "Standing Unilateral Front Press (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "pike-push-ups",
    "exercise_name": "Pike Push-Ups",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-standing-unilateral-front-press",
    "exercise_name": "Banded Standing Unilateral Front Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "unilateral-seated-front-press-2",
    "exercise_name": "Unilateral Seated Front Press (2)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "unilateral-seated-neutral-press-tempo-ecc",
    "exercise_name": "Unilateral Seated Neutral Press, Tempo (Ecc.)",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "unilateral-seated-neutral-press",
    "exercise_name": "Unilateral Seated Neutral Press",
    "workout_location": "home",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "door-frame-body-curls",
    "exercise_name": "Door-Frame Body Curls",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "door-frame"
        ]
      ]
    }
  },
  {
    "exercise_slug": "neutral-grip-preacher-curl-db-or-kb",
    "exercise_name": "Neutral-Grip Preacher Curl (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "preacher-curl-db-or-kb",
    "exercise_name": "Preacher Curl (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-chair-alternating-biceps-curls-db-or-kb",
    "exercise_name": "Seated (Chair) Alternating Biceps Curls (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-chair-biceps-curls-db-or-kb",
    "exercise_name": "Seated (Chair) Biceps Curls (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-chair-neutral-grip-alternating-biceps-curls-db-or-kb",
    "exercise_name": "Seated (Chair) Neutral-Grip Alternating Biceps Curls (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-chair-neutral-grip-biceps-curls-db-or-kb",
    "exercise_name": "Seated (Chair) Neutral-Grip Biceps Curls (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-chair-neutral-grip-unilateral-biceps-curls-db-or-kb",
    "exercise_name": "Seated (Chair) Neutral-Grip Unilateral Biceps Curls (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-chair-pronated-alternating-biceps-curls-db-or-kb",
    "exercise_name": "Seated (Chair) Pronated Alternating Biceps Curls (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-chair-pronated-biceps-curls-db-or-kb",
    "exercise_name": "Seated (Chair) Pronated Biceps Curls (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-chair-pronated-unilateral-biceps-curls-db-or-kb",
    "exercise_name": "Seated (Chair) Pronated Unilateral Biceps Curls (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-chair-supinated-alternating-biceps-curls-db-or-kb",
    "exercise_name": "Seated (Chair) Supinated Alternating Biceps Curls (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-chair-supinated-biceps-curls-db-or-kb",
    "exercise_name": "Seated (Chair) Supinated Biceps Curls (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-chair-supinated-unilateral-biceps-curls-db-or-kb",
    "exercise_name": "Seated (Chair) Supinated Unilateral Biceps Curls (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-chair-unilateral-biceps-curls-db-or-kb",
    "exercise_name": "Seated (Chair) Unilateral Biceps Curls (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-alternating-biceps-curls-db-or-kb",
    "exercise_name": "Standing Alternating Biceps Curls (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-biceps-curls-extremely-slow-eccentric-using-household-items",
    "exercise_name": "Standing Biceps Curls — Extremely Slow Eccentric (Using Household Items)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "filled-bag"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-biceps-curls-db-or-kb",
    "exercise_name": "Standing Biceps Curls (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-neutral-grip-alternating-biceps-curls-db-or-kb",
    "exercise_name": "Standing Neutral-Grip Alternating Biceps Curls (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-neutral-grip-biceps-curls-extremely-slow-eccentric-using-household-items",
    "exercise_name": "Standing Neutral-Grip Biceps Curls — Extremely Slow Eccentric (Using Household Items)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "filled-bag"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-neutral-grip-biceps-curls-db-or-kb",
    "exercise_name": "Standing Neutral-Grip Biceps Curls (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-neutral-grip-unilateral-biceps-curls-db-or-kb",
    "exercise_name": "Standing Neutral-Grip Unilateral Biceps Curls (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-neutral-grip-unilateral-biceps-curls-fill-a-bag-with-something",
    "exercise_name": "Standing Neutral-Grip Unilateral Biceps Curls (Fill A Bag With Something)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "filled-bag"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-pronated-alternating-biceps-curls-db-or-kb",
    "exercise_name": "Standing Pronated Alternating Biceps Curls (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-pronated-biceps-curls-extremely-slow-eccentric-using-household-items",
    "exercise_name": "Standing Pronated Biceps Curls — Extremely Slow Eccentric (Using Household Items)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "filled-bag"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-pronated-biceps-curls-db-or-kb",
    "exercise_name": "Standing Pronated Biceps Curls (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-pronated-unilateral-biceps-curls-db-or-kb",
    "exercise_name": "Standing Pronated Unilateral Biceps Curls (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-pronated-unilateral-biceps-curls-fill-a-bag-with-something",
    "exercise_name": "Standing Pronated Unilateral Biceps Curls (Fill A Bag With Something)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "filled-bag"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-supinated-alternating-biceps-curls-db-or-kb",
    "exercise_name": "Standing Supinated Alternating Biceps Curls (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-supinated-biceps-curls-extremely-slow-eccentric-using-household-items",
    "exercise_name": "Standing Supinated Biceps Curls — Extremely Slow Eccentric (Using Household Items)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "filled-bag"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-supinated-biceps-curls-db-or-kb",
    "exercise_name": "Standing Supinated Biceps Curls (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-supinated-unilateral-biceps-curls-db-or-kb",
    "exercise_name": "Standing Supinated Unilateral Biceps Curls (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-supinated-unilateral-biceps-curls-fill-a-bag-with-something",
    "exercise_name": "Standing Supinated Unilateral Biceps Curls (Fill A Bag With Something)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "filled-bag"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-unilateral-biceps-curls-db-or-kb",
    "exercise_name": "Standing Unilateral Biceps Curls (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-unilateral-biceps-curls-fill-a-bag-with-something",
    "exercise_name": "Standing Unilateral Biceps Curls (Fill A Bag With Something)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "filled-bag"
        ]
      ]
    }
  },
  {
    "exercise_slug": "anchored-biceps-curl",
    "exercise_name": "Anchored Biceps Curl",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "anchored-drag-curl",
    "exercise_name": "Anchored Drag Curl",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-standing-alternating-biceps-curls",
    "exercise_name": "Banded Standing Alternating Biceps Curls",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-standing-biceps-curls",
    "exercise_name": "Banded Standing Biceps Curls",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-standing-neutral-grip-biceps-curls",
    "exercise_name": "Banded Standing Neutral-Grip Biceps Curls",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-standing-neutral-grip-unilateral-biceps-curls",
    "exercise_name": "Banded Standing Neutral-Grip Unilateral Biceps Curls",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-standing-pronated-alternating-biceps-curls",
    "exercise_name": "Banded Standing Pronated Alternating Biceps Curls",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "neutral-grip-preacher-curl-db",
    "exercise_name": "Neutral-Grip Preacher Curl (Db)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbell"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "preacher-curl-db-or-kb",
    "exercise_name": "Preacher Curl (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-alternating-biceps-curls-neutral-grip",
    "exercise_name": "Seated Alternating Biceps Curls , Neutral Grip",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbell"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-alternating-biceps-curls-overhand-grip",
    "exercise_name": "Seated Alternating Biceps Curls , Overhand Grip",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-alternating-biceps-curls-underhand-grip",
    "exercise_name": "Seated Alternating Biceps Curls , Underhand Grip",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-biceps-curls-neutral-grip",
    "exercise_name": "Seated Biceps Curls , Neutral Grip",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbell"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-biceps-curls-overhand-grip",
    "exercise_name": "Seated Biceps Curls , Overhand Grip",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-biceps-curls-underhand-grip",
    "exercise_name": "Seated Biceps Curls , Underhand Grip",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-unilateral-biceps-curls-neutral-grip",
    "exercise_name": "Seated Unilateral Biceps Curls , Neutral Grip",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbell"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-unilateral-biceps-curls-underhand-grip",
    "exercise_name": "Seated Unilateral Biceps Curls , Underhand Grip",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-unilateral-biceps-curls",
    "exercise_name": "Seated Unilateral Biceps Curls",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "single-arm-reverse-grip-curl",
    "exercise_name": "Single-Arm Reverse-Grip Curl",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "trx-biceps-curl",
    "exercise_name": "Trx Biceps Curl",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "trx-reverse-biceps-curl",
    "exercise_name": "Trx Reverse Biceps Curl",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "trx-single-arm-biceps-curl",
    "exercise_name": "Trx Single-Arm Biceps Curl",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-alternating-biceps-curls",
    "exercise_name": "Seated Alternating Biceps Curls",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-biceps-curls",
    "exercise_name": "Seated Biceps Curls",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-biceps-curls-overhand-grip",
    "exercise_name": "Seated Biceps Curls , Overhand Grip",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-standing-pronated-biceps-curls",
    "exercise_name": "Banded Standing Pronated Biceps Curls",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-standing-pronated-unilateral-biceps-curls",
    "exercise_name": "Banded Standing Pronated Unilateral Biceps Curls",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-standing-supinated-alternating-biceps-curls",
    "exercise_name": "Banded Standing Supinated Alternating Biceps Curls",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-standing-supinated-biceps-curls",
    "exercise_name": "Banded Standing Supinated Biceps Curls",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-standing-supinated-unilateral-biceps-curls",
    "exercise_name": "Banded Standing Supinated Unilateral Biceps Curls",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-standing-unilateral-biceps-curls",
    "exercise_name": "Banded Standing Unilateral Biceps Curls",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-triceps-extensions-band-anchored-in-a-door-or-to-a-pull-up-bar",
    "exercise_name": "Banded Triceps Extensions (Band Anchored In A Door Or To A Pull-Up Bar)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-unilateral-triceps-extensions-band-anchored-in-a-door-or-to-a-pull-up-bar",
    "exercise_name": "Banded Unilateral Triceps Extensions (Band Anchored In A Door Or To A Pull-Up Bar)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "chest-tap-curl",
    "exercise_name": "Chest-Tap Curl",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "cross-body-biceps-curl",
    "exercise_name": "Cross-Body Biceps Curl",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "skull-crusher-kb-or-db",
    "exercise_name": "Skull Crusher (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "alternating-skull-crusher-kb-or-db",
    "exercise_name": "Alternating Skull Crusher (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "lying-on-the-floor-alternating-skull-crusher-kb-or-db",
    "exercise_name": "Lying On The Floor — Alternating Skull Crusher (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "lying-on-the-floor-skull-crusher-kb-or-db",
    "exercise_name": "Lying On The Floor — Skull Crusher (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "lying-on-the-floor-unilateral-skull-crusher-kb-or-db",
    "exercise_name": "Lying On The Floor — Unilateral Skull Crusher (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "unilateral-skull-crusher-kb-or-db",
    "exercise_name": "Unilateral Skull Crusher (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "chair-couch-dips",
    "exercise_name": "Chair-Couch Dips",
    "workout_location": "home",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "floor-press-alternating-db-or-kb",
    "exercise_name": "Floor Press — Alternating (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "floor-press-alternating-tempo-x-s-db-or-kb",
    "exercise_name": "Floor Press — Alternating, Tempo X S (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "floor-press-tempo-x-s-db-or-kb",
    "exercise_name": "Floor Press — Tempo X S (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "floor-press-db-or-kb",
    "exercise_name": "Floor Press (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "lying-on-the-floor-alternating-close-grip-db-or-kb-press",
    "exercise_name": "Lying On The Floor — Alternating Close-Grip (Db Or Kb) Press",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "lying-on-the-floor-close-grip-db-or-kb-press",
    "exercise_name": "Lying On The Floor — Close-Grip (Db Or Kb) Press",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "close-grip-press-db-or-kb",
    "exercise_name": "Close-Grip Press (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "alternating-close-grip-press-db-or-kb",
    "exercise_name": "Alternating Close-Grip Press (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-narrow-push-ups-legs-elevated",
    "exercise_name": "Db Narrow Push-Ups — Legs Elevated",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbell"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-narrow-push-ups",
    "exercise_name": "Db Narrow Push-Ups",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbell"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-push-ups-legs-elevated",
    "exercise_name": "Db Push-Ups — Legs Elevated",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbell"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-push-ups-neutral-grip-legs-elevated",
    "exercise_name": "Db Push-Ups — Neutral Grip, Legs Elevated",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbell"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-push-ups-neutral-grip",
    "exercise_name": "Db Push-Ups — Neutral Grip",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbell"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-push-ups",
    "exercise_name": "Db Push-Ups",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbell"
        ]
      ]
    }
  },
  {
    "exercise_slug": "diamond-push-ups-hands-elevated",
    "exercise_name": "Diamond Push-Ups — Hands Elevated",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "diamond-push-ups-legs-elevated",
    "exercise_name": "Diamond Push-Ups — Legs Elevated",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "diamond-push-ups-tempo",
    "exercise_name": "Diamond Push-Ups — Tempo",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "diamond-push-ups-with-pulse",
    "exercise_name": "Diamond Push-Ups With Pulse",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "diamond-push-ups",
    "exercise_name": "Diamond Push-Ups",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "floor-fly-unilateral-db-or-kb",
    "exercise_name": "Floor Fly — Unilateral (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "floor-fly-db-or-kb",
    "exercise_name": "Floor Fly (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "narrow-push-ups-hands-elevated",
    "exercise_name": "Narrow Push-Ups — Hands Elevated",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "narrow-push-ups-legs-elevated",
    "exercise_name": "Narrow Push-Ups — Legs Elevated",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "narrow-push-ups-tempo",
    "exercise_name": "Narrow Push-Ups — Tempo",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "narrow-push-ups-with-pulse",
    "exercise_name": "Narrow Push-Ups With Pulse",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "narrow-push-ups",
    "exercise_name": "Narrow Push-Ups",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "push-ups-hands-elevated",
    "exercise_name": "Push-Ups — Hands Elevated",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "push-ups-legs-elevated",
    "exercise_name": "Push-Ups — Legs Elevated",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "push-ups-tempo",
    "exercise_name": "Push-Ups — Tempo",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "push-ups-with-pulse",
    "exercise_name": "Push-Ups With Pulse",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "wide-push-ups",
    "exercise_name": "Wide Push-Ups",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-diamond-push-ups-legs-elevated",
    "exercise_name": "Banded Diamond Push-Ups — Legs Elevated",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-diamond-push-ups",
    "exercise_name": "Banded Diamond Push-Ups",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-narrow-push-ups-legs-elevated",
    "exercise_name": "Banded Narrow Push-Ups — Legs Elevated",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-narrow-push-ups",
    "exercise_name": "Banded Narrow Push-Ups",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-push-ups-legs-elevated",
    "exercise_name": "Banded Push-Ups — Legs Elevated",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-push-ups",
    "exercise_name": "Banded Push-Ups",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "incline-bench-fly-alternating-db-or-kb",
    "exercise_name": "Incline Bench Fly — Alternating (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "incline-bench-fly-unilateral-db-or-kb",
    "exercise_name": "Incline Bench Fly — Unilateral (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "incline-bench-fly-db-or-kb",
    "exercise_name": "Incline Bench Fly (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "incline-bench-press-alternating-db-or-kb",
    "exercise_name": "Incline Bench Press — Alternating (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "incline-bench-press-alternating-tempo-x-s-db-or-kb",
    "exercise_name": "Incline Bench Press — Alternating, Tempo X S (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "incline-bench-press-narrow-grip-db-or-kb",
    "exercise_name": "Incline Bench Press — Narrow Grip (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "incline-bench-press-tempo-x-s-db-or-kb",
    "exercise_name": "Incline Bench Press — Tempo X S (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "incline-bench-press-unilateral-db-or-kb",
    "exercise_name": "Incline Bench Press — Unilateral (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "incline-bench-press-unilateral-tempo-x-s-db-or-kb",
    "exercise_name": "Incline Bench Press — Unilateral, Tempo X S (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "incline-bench-press-db-or-kb",
    "exercise_name": "Incline Bench Press (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "trx-diamond-push-ups-legs-elevated",
    "exercise_name": "Trx Diamond Push-Ups — Legs Elevated",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "trx-fly",
    "exercise_name": "Trx Fly",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "trx-narrow-push-ups-legs-elevated",
    "exercise_name": "Trx Narrow Push-Ups — Legs Elevated",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "trx-narrow-push-ups",
    "exercise_name": "Trx Narrow Push-Ups",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "trx-push-ups-legs-elevated",
    "exercise_name": "Trx Push-Ups — Legs Elevated",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "trx-push-ups",
    "exercise_name": "Trx Push-Ups",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bench-press-tempo-x-s-db-or-kb",
    "exercise_name": "Bench Press — Tempo X S (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "incline-bench-press-narrow-grip-tempo-x-s-db-or-kb",
    "exercise_name": "Incline Bench Press — Narrow Grip, Tempo X S (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bench-fly-alternating-db-or-kb",
    "exercise_name": "Bench Fly — Alternating (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bench-fly-unilateral-db-or-kb",
    "exercise_name": "Bench Fly — Unilateral (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bench-fly-db-or-kb",
    "exercise_name": "Bench Fly (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bench-press-alternating-db-or-kb",
    "exercise_name": "Bench Press — Alternating (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bench-press-alternating-tempo-x-s-db-or-kb",
    "exercise_name": "Bench Press — Alternating, Tempo X S (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bench-press-narrow-grip-db-or-kb",
    "exercise_name": "Bench Press — Narrow Grip (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bench-press-narrow-grip-tempo-x-s-db-or-kb",
    "exercise_name": "Bench Press — Narrow Grip, Tempo X S (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bench-press-unilateral-db-or-kb",
    "exercise_name": "Bench Press — Unilateral (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bench-press-unilateral-tempo-x-s-db-or-kb",
    "exercise_name": "Bench Press — Unilateral, Tempo X S (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bench-press-db-or-kb",
    "exercise_name": "Bench Press (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "unilateral-close-grip-press-db-or-kb",
    "exercise_name": "Unilateral Close-Grip Press (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "floor-press-narrow-grip-db-or-kb",
    "exercise_name": "Floor Press — Narrow Grip (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "floor-press-narrow-grip-tempo-x-s-db-or-kb",
    "exercise_name": "Floor Press — Narrow Grip, Tempo X S (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "floor-press-unilateral-db-or-kb",
    "exercise_name": "Floor Press — Unilateral (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "floor-press-unilateral-tempo-x-s-db-or-kb",
    "exercise_name": "Floor Press — Unilateral, Tempo X S (Db Or Kb)",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "lying-on-the-floor-unilateral-close-grip-db-or-kb-press",
    "exercise_name": "Lying On The Floor — Unilateral Close-Grip (Db Or Kb) Press",
    "workout_location": "home",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "trx-reverse-fly",
    "exercise_name": "Trx Reverse Fly",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bent-over-reverse-fly-db",
    "exercise_name": "Bent-Over Reverse Fly (Db)",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "anchored-shoulder-shrugs",
    "exercise_name": "Anchored Shoulder Shrugs",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bent-over-row-db-or-kb-neutral-grip-alternating-tempo-ecc-x-s",
    "exercise_name": "Bent-Over Row (Db Or Kb) — Neutral Grip, Alternating, Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bent-over-row-db-or-kb-neutral-grip-alternating",
    "exercise_name": "Bent-Over Row (Db Or Kb) — Neutral Grip, Alternating",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bent-over-row-db-or-kb-neutral-grip-tempo-ecc-x-s",
    "exercise_name": "Bent-Over Row (Db Or Kb) — Neutral Grip, Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bent-over-row-db-or-kb-neutral-grip-unilateral-tempo-ecc-x-s",
    "exercise_name": "Bent-Over Row (Db Or Kb) — Neutral Grip, Unilateral, Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bent-over-row-db-or-kb-neutral-grip-unilateral",
    "exercise_name": "Bent-Over Row (Db Or Kb) — Neutral Grip, Unilateral",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bent-over-row-db-or-kb-neutral-grip",
    "exercise_name": "Bent-Over Row (Db Or Kb) — Neutral Grip",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bent-over-row-db-or-kb-overhand-grip-alternating-tempo-ecc-x-s",
    "exercise_name": "Bent-Over Row (Db Or Kb) — Overhand Grip, Alternating, Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bent-over-row-db-or-kb-overhand-grip-alternating",
    "exercise_name": "Bent-Over Row (Db Or Kb) — Overhand Grip, Alternating",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bent-over-row-db-or-kb-overhand-grip-tempo-ecc-x-s",
    "exercise_name": "Bent-Over Row (Db Or Kb) — Overhand Grip, Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bent-over-row-db-or-kb-overhand-grip-unilateral-tempo-ecc-x-s",
    "exercise_name": "Bent-Over Row (Db Or Kb) — Overhand Grip, Unilateral, Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bent-over-row-db-or-kb-overhand-grip-unilateral",
    "exercise_name": "Bent-Over Row (Db Or Kb) — Overhand Grip, Unilateral",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bent-over-row-db-or-kb-overhand-grip",
    "exercise_name": "Bent-Over Row (Db Or Kb) — Overhand Grip",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bent-over-row-db-or-kb-underhand-grip-alternating-tempo-ecc-x-s",
    "exercise_name": "Bent-Over Row (Db Or Kb) — Underhand Grip, Alternating, Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bent-over-row-db-or-kb-underhand-grip-alternating",
    "exercise_name": "Bent-Over Row (Db Or Kb) — Underhand Grip, Alternating",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bent-over-row-db-or-kb-underhand-grip-tempo-ecc-x-s",
    "exercise_name": "Bent-Over Row (Db Or Kb) — Underhand Grip, Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bent-over-row-db-or-kb-underhand-grip-unilateral",
    "exercise_name": "Bent-Over Row (Db Or Kb) — Underhand Grip, Unilateral",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bent-over-row-db-or-kb-underhand-grip",
    "exercise_name": "Bent-Over Row (Db Or Kb) — Underhand Grip",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "alternating-prone-row-db-or-kb-neutral-grip-tempo-ecc",
    "exercise_name": "Alternating Prone Row (Db Or Kb) — Neutral Grip, Tempo (Ecc.)",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "alternating-prone-row-db-or-kb-neutral-grip",
    "exercise_name": "Alternating Prone Row (Db Or Kb) — Neutral Grip",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "alternating-prone-row-db-or-kb-overhand-grip-tempo-ecc",
    "exercise_name": "Alternating Prone Row (Db Or Kb) — Overhand Grip, Tempo (Ecc.)",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "alternating-prone-row-db-or-kb-overhand-grip",
    "exercise_name": "Alternating Prone Row (Db Or Kb) — Overhand Grip",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "alternating-prone-row-db-or-kb-underhand-grip-tempo-ecc",
    "exercise_name": "Alternating Prone Row (Db Or Kb) — Underhand Grip, Tempo (Ecc.)",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "alternating-prone-row-db-or-kb-underhand-grip",
    "exercise_name": "Alternating Prone Row (Db Or Kb) — Underhand Grip",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "anchored-upright-row",
    "exercise_name": "Anchored Upright Row",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-bent-over-row-neutral-grip-alternating-tempo-ecc-x-s",
    "exercise_name": "Banded Bent-Over Row — Neutral Grip, Alternating, Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-bent-over-row-neutral-grip-alternating",
    "exercise_name": "Banded Bent-Over Row — Neutral Grip, Alternating",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-bent-over-row-neutral-grip-tempo-ecc-x-s",
    "exercise_name": "Banded Bent-Over Row — Neutral Grip, Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-bent-over-row-neutral-grip-unilateral-tempo-ecc-x-s",
    "exercise_name": "Banded Bent-Over Row — Neutral Grip, Unilateral, Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-bent-over-row-neutral-grip-unilateral",
    "exercise_name": "Banded Bent-Over Row — Neutral Grip, Unilateral",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-bent-over-row-neutral-grip",
    "exercise_name": "Banded Bent-Over Row — Neutral Grip",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-bent-over-row-overhand-grip-alternating-tempo-ecc-x-s",
    "exercise_name": "Banded Bent-Over Row — Overhand Grip, Alternating, Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-bent-over-row-overhand-grip-alternating",
    "exercise_name": "Banded Bent-Over Row — Overhand Grip, Alternating",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-bent-over-row-overhand-grip-tempo-ecc-x-s",
    "exercise_name": "Banded Bent-Over Row — Overhand Grip, Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-bent-over-row-overhand-grip-unilateral-tempo-ecc-x-s",
    "exercise_name": "Banded Bent-Over Row — Overhand Grip, Unilateral, Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-bent-over-row-overhand-grip-unilateral",
    "exercise_name": "Banded Bent-Over Row — Overhand Grip, Unilateral",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-bent-over-row-overhand-grip",
    "exercise_name": "Banded Bent-Over Row — Overhand Grip",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-bent-over-row-underhand-grip-alternating-tempo-ecc-x-s",
    "exercise_name": "Banded Bent-Over Row — Underhand Grip, Alternating, Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-bent-over-row-underhand-grip-alternating",
    "exercise_name": "Banded Bent-Over Row — Underhand Grip, Alternating",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-bent-over-row-underhand-grip-tempo-ecc-x-s",
    "exercise_name": "Banded Bent-Over Row — Underhand Grip, Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-bent-over-row-underhand-grip-unilateral-tempo-ecc-x-s",
    "exercise_name": "Banded Bent-Over Row — Underhand Grip, Unilateral, Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-bent-over-row-underhand-grip-unilateral",
    "exercise_name": "Banded Bent-Over Row — Underhand Grip, Unilateral",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-bent-over-row-underhand-grip",
    "exercise_name": "Banded Bent-Over Row — Underhand Grip",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "prone-row-db-or-kb-neutral-grip-tempo-ecc",
    "exercise_name": "Prone Row (Db Or Kb) — Neutral Grip, Tempo (Ecc.)",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "prone-row-db-or-kb-neutral-grip",
    "exercise_name": "Prone Row (Db Or Kb) — Neutral Grip",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "prone-row-db-or-kb-overhand-grip-tempo-ecc",
    "exercise_name": "Prone Row (Db Or Kb) — Overhand Grip, Tempo (Ecc.)",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "prone-row-db-or-kb-overhand-grip",
    "exercise_name": "Prone Row (Db Or Kb) — Overhand Grip",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "prone-row-db-or-kb-underhand-grip-tempo-ecc",
    "exercise_name": "Prone Row (Db Or Kb) — Underhand Grip, Tempo (Ecc.)",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "prone-row-db-or-kb-underhand-grip",
    "exercise_name": "Prone Row (Db Or Kb) — Underhand Grip",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "single-arm-face-pull",
    "exercise_name": "Single-Arm Face Pull",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "trx-face-pulls",
    "exercise_name": "Trx Face Pulls",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "trx-row-grip-from-pronation-to-neutral",
    "exercise_name": "Trx Row — Grip From Pronation To Neutral",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "trx-row-high-row-overhand-grip",
    "exercise_name": "Trx Row — High Row, Overhand Grip",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "trx-row-neutral-grip",
    "exercise_name": "Trx Row — Neutral Grip",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "trx-row-overhand-grip",
    "exercise_name": "Trx Row — Overhand Grip",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "trx-row-underhand-grip",
    "exercise_name": "Trx Row — Underhand Grip",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "trx-scarecrows",
    "exercise_name": "Trx Scarecrows",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "unilateral-prone-row-db-or-kb-neutral-grip-tempo-ecc",
    "exercise_name": "Unilateral Prone Row (Db Or Kb) — Neutral Grip, Tempo (Ecc.)",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "unilateral-prone-row-db-or-kb-neutral-grip",
    "exercise_name": "Unilateral Prone Row (Db Or Kb) — Neutral Grip",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "unilateral-prone-row-db-or-kb-overhand-grip-tempo-ecc",
    "exercise_name": "Unilateral Prone Row (Db Or Kb) — Overhand Grip, Tempo (Ecc.)",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "unilateral-prone-row-db-or-kb-overhand-grip",
    "exercise_name": "Unilateral Prone Row (Db Or Kb) — Overhand Grip",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "unilateral-prone-row-db-or-kb-underhand-grip-tempo-ecc",
    "exercise_name": "Unilateral Prone Row (Db Or Kb) — Underhand Grip, Tempo (Ecc.)",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "unilateral-prone-row-db-or-kb-underhand-grip",
    "exercise_name": "Unilateral Prone Row (Db Or Kb) — Underhand Grip",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bent-over-row-db-or-kb-underhand-grip-unilateral-tempo-ecc-x-s",
    "exercise_name": "Bent-Over Row (Db Or Kb) — Underhand Grip, Unilateral, Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bent-over-y-raise-db",
    "exercise_name": "Bent-Over Y-Raise (Db)",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbell"
        ]
      ]
    }
  },
  {
    "exercise_slug": "trx-alligators",
    "exercise_name": "Trx Alligators",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "trx-swimmers-pull",
    "exercise_name": "Trx Swimmer’S Pull",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "trx-y-raise",
    "exercise_name": "Trx Y-Raise",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "prone-y-raise-db",
    "exercise_name": "Prone Y-Raise (Db)",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-bent-over-y-raise",
    "exercise_name": "Banded Bent-Over Y-Raise",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "prone-y-raise",
    "exercise_name": "Prone Y-Raise",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbell"
        ]
      ]
    }
  },
  {
    "exercise_slug": "side-lying-external-rotation-rotator-cuff",
    "exercise_name": "Side-Lying External Rotation (Rotator Cuff)",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbell"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-bent-over-reverse-fly",
    "exercise_name": "Banded Bent-Over Reverse Fly",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "prone-reverse-fly-db",
    "exercise_name": "Prone Reverse Fly (Db)",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "prone-back-extensions",
    "exercise_name": "Prone Back Extensions",
    "workout_location": "home",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bowlers-squat",
    "exercise_name": "Bowler’S Squat",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-bowlers-squat",
    "exercise_name": "Db Bowler’S Squat",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-glute-bridge-legs-elevated",
    "exercise_name": "Db Glute Bridge — Legs Elevated",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-glute-bridge",
    "exercise_name": "Db Glute Bridge",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-lunges-alternating-step-back",
    "exercise_name": "Db Lunges — Alternating Step Back",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-lunges-alternating-step-forward",
    "exercise_name": "Db Lunges — Alternating Step Forward",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-lunges-back",
    "exercise_name": "Db Lunges — Back",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-lunges-step-back-tempo-ecc-x-s",
    "exercise_name": "Db Lunges — Step Back — Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-lunges-step-forward-tempo-ecc-x-s",
    "exercise_name": "Db Lunges — Step Forward — Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-lunges-step-forward-with-pulse",
    "exercise_name": "Db Lunges — Step Forward With Pulse",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-lunges-step-forward",
    "exercise_name": "Db Lunges — Step Forward",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-pistol-squat",
    "exercise_name": "Db Pistol Squat",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-side-squat-alternating",
    "exercise_name": "Db Side Squat — Alternating",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-side-squat",
    "exercise_name": "Db Side Squat",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-split-squat-tempo-ecc-x-s",
    "exercise_name": "Db Split Squat — Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-split-squat-tempo-x-s",
    "exercise_name": "Db Split Squat — Tempo X S",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-split-squat-with-pulse",
    "exercise_name": "Db Split Squat With Pulse",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-walking-lunges",
    "exercise_name": "Db Walking Lunges",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "front-squat-tempo-ecc-x-s",
    "exercise_name": "Front Squat — Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "front-squat-tempo-x-s",
    "exercise_name": "Front Squat — Tempo X S",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "front-squat-with-pulse",
    "exercise_name": "Front Squat With Pulse",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "front-squat",
    "exercise_name": "Front Squat",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "glute-bridge-legs-elevated",
    "exercise_name": "Glute Bridge — Legs Elevated",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "glute-bridge-tempo-ecc-x-s",
    "exercise_name": "Glute Bridge Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "glute-bridge-tempo-x-s",
    "exercise_name": "Glute Bridge Tempo X S",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "goblet-squat-tempo-ecc-x-s",
    "exercise_name": "Goblet Squat — Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "goblet-squat-tempo-x-s",
    "exercise_name": "Goblet Squat — Tempo X S",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "goblet-squat-with-pulse",
    "exercise_name": "Goblet Squat With Pulse",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "goblet-squat",
    "exercise_name": "Goblet Squat",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "lunges-alternating-step-back",
    "exercise_name": "Lunges — Alternating Step Back",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "lunges-alternating-step-forward",
    "exercise_name": "Lunges — Alternating Step Forward",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "lunges-step-back-tempo-ecc-x-s",
    "exercise_name": "Lunges — Step Back — Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "lunges-step-back-with-pulse",
    "exercise_name": "Lunges — Step Back With Pulse",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "lunges-step-back",
    "exercise_name": "Lunges — Step Back",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "lunges-step-forward-tempo-ecc-x-s",
    "exercise_name": "Lunges — Step Forward — Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "lunges-step-forward-with-pulse",
    "exercise_name": "Lunges — Step Forward With Pulse",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "lunges-step-forward",
    "exercise_name": "Lunges — Step Forward",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "pistol-squat",
    "exercise_name": "Pistol Squat",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "plyometric-split-squat",
    "exercise_name": "Plyometric Split Squat",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "prisoner-squat-tempo-ecc-x-s",
    "exercise_name": "Prisoner Squat — Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "prisoner-squat-tempo-x-s",
    "exercise_name": "Prisoner Squat — Tempo X S",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "prisoner-squat-with-pulse",
    "exercise_name": "Prisoner Squat With Pulse",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "prisoner-squat",
    "exercise_name": "Prisoner Squat",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "side-squat-alternating",
    "exercise_name": "Side Squat — Alternating",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "split-squat-tempo-ecc-x-s",
    "exercise_name": "Split Squat — Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "split-squat-tempo-x-s",
    "exercise_name": "Split Squat — Tempo X S",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "split-squat-db",
    "exercise_name": "Split Squat Db",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "split-squat-with-pulse",
    "exercise_name": "Split Squat With Pulse",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "split-squat",
    "exercise_name": "Split Squat",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "squat-jumps",
    "exercise_name": "Squat Jumps",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "walking-lunges-hands-behind-head",
    "exercise_name": "Walking Lunges — Hands Behind Head",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "walking-lunges-with-pulse",
    "exercise_name": "Walking Lunges With Pulse",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "walking-lunges",
    "exercise_name": "Walking Lunges",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "assisted-pistol-squat-tempo-ecc",
    "exercise_name": "Assisted Pistol Squat — Tempo (Ecc.)",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "assisted-pistol-squat",
    "exercise_name": "Assisted Pistol Squat",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "assisted-split-squat-tempo-ecc",
    "exercise_name": "Assisted Split Squat — Tempo (Ecc.)",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "assisted-split-squat-tempo",
    "exercise_name": "Assisted Split Squat — Tempo",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "assisted-split-squat-db",
    "exercise_name": "Assisted Split Squat Db",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "assisted-squat-tempo-ecc",
    "exercise_name": "Assisted Squat — Tempo (Ecc.)",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "assisted-squat-tempo",
    "exercise_name": "Assisted Squat — Tempo",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "assisted-squat-with-pulse",
    "exercise_name": "Assisted Squat With Pulse",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "assisted-squat",
    "exercise_name": "Assisted Squat",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "glute-bridge",
    "exercise_name": "Glute Bridge",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "hip-thrust-dbkb-optional",
    "exercise_name": "Hip Thrust (Db·Kb Optional)",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "side-slide-to-squat-towel-or-sliders",
    "exercise_name": "Side Slide To Squat (Towel Or Sliders)",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "sliders",
          "towel"
        ]
      ]
    }
  },
  {
    "exercise_slug": "side-squat",
    "exercise_name": "Side Squat",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "step-up-dbkb",
    "exercise_name": "Step-Up (Db–Kb)",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "walking-lunges-with-pulse",
    "exercise_name": "Walking Lunges With Pulse",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "box-squat-dbkb-tempo-ecc-x-s",
    "exercise_name": "Box Squat (Db–Kb) — Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "box-squat-dbkb-tempo-x-s",
    "exercise_name": "Box Squat (Db–Kb) — Tempo X S",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "box-squat-dbkb",
    "exercise_name": "Box Squat (Db–Kb)",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "glute-bridge-legs-elevated-db-kb-optional",
    "exercise_name": "Glute Bridge — Legs Elevated (Db-Kb Optional)",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-step-back-with-pulse",
    "exercise_name": "Db Step Back With Pulse",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "step-down-dbkb-leg-back",
    "exercise_name": "Step-Down (Db–Kb) — Leg Back",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "step-down-dbkb-leg-in-front",
    "exercise_name": "Step-Down (Db–Kb) — Leg In Front",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-pull-through",
    "exercise_name": "Banded Pull-Through",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "walking-hip-abductions",
    "exercise_name": "Walking Hip Abductions",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "kettlebell-swings",
    "exercise_name": "Kettlebell Swings",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "kettlebell"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-leg-raise-with-abduction",
    "exercise_name": "Banded Leg Raise With Abduction",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "copenhagen-plank",
    "exercise_name": "Copenhagen Plank",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "box-squat-dbkb-unilateral-alternating",
    "exercise_name": "Box Squat (Db–Kb) — Unilateral, Alternating",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "box-squat-dbkb-unilateral-tempo-ecc-x-s",
    "exercise_name": "Box Squat (Db–Kb) — Unilateral, Tempo (Ecc.) X S",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "box-squat-dbkb-unilateral",
    "exercise_name": "Box Squat (Db–Kb) — Unilateral",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "glute-bridge-unilateral-legs-elevated-db-kb-optional",
    "exercise_name": "Glute Bridge — Unilateral, Legs Elevated (Db-Kb Optional)",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "glute-bridge-unilateral-legs-elevated-tempo-ecc-db-kb-optional",
    "exercise_name": "Glute Bridge — Unilateral, Legs Elevated, Tempo (Ecc.) (Db-Kb Optional)",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "glute-bridge-unilateral-tempo-ecc",
    "exercise_name": "Glute Bridge — Unilateral, Tempo (Ecc.)",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "glute-bridge-unilateral-tempo",
    "exercise_name": "Glute Bridge — Unilateral, Tempo",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "glute-bridge-unilateral",
    "exercise_name": "Glute Bridge — Unilateral",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "glute-bridge-unilateral-legs-elevated-tempo-db-kb-optional",
    "exercise_name": "Glute Bridge — Unilateral, Legs Elevated, Tempo (Db-Kb Optional)",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "glute-bridge-unilateral-legs-elevated",
    "exercise_name": "Glute Bridge — Unilateral, Legs Elevated ",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "lateral-step-up-dbkb",
    "exercise_name": "Lateral Step-Up (Db·Kb)",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-glute-bridge-unilateral-legs-elevated",
    "exercise_name": "Db Glute Bridge — Unilateral, Legs Elevated",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-glute-bridge-unilateral-tempo-ecc",
    "exercise_name": "Db Glute Bridge — Unilateral, Tempo (Ecc.)",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-glute-bridge-unilateral-tempo",
    "exercise_name": "Db Glute Bridge — Unilateral, Tempo",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "db-glute-bridge-unilateral",
    "exercise_name": "Db Glute Bridge — Unilateral",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "hip-thrust-unilateral-dbkb-optional",
    "exercise_name": "Hip Thrust — Unilateral (Db·Kb Optional)",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ],
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "supine-leg-curls-unilateral-ecc-towel-or-sliders",
    "exercise_name": "Supine Leg Curls Unilateral Ecc. (Towel Or Sliders)",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "sliders",
          "towel"
        ]
      ]
    }
  },
  {
    "exercise_slug": "supine-leg-curls-with-towel-or-sliders",
    "exercise_name": "Supine Leg Curls With Towel Or Sliders",
    "workout_location": "home",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "sliders",
          "towel"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bicycle-crunch",
    "exercise_name": "Bicycle Crunch",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "core-twists-kb-or-db",
    "exercise_name": "Core Twists (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "crunches-kb-or-db",
    "exercise_name": "Crunches (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "dead-bug-kb-or-db",
    "exercise_name": "Dead Bug (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "elbow-to-knee-crunch",
    "exercise_name": "Elbow-To-Knee Crunch",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "north-to-south-plank-kb-or-db",
    "exercise_name": "North-To-South Plank (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "oblique-crunch",
    "exercise_name": "Oblique Crunch",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "plank-pull-throughs-kettlebell-or-db",
    "exercise_name": "Plank Pull-Throughs (Kettlebell Or Db)",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "plank-rockers",
    "exercise_name": "Plank Rockers",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "plank-to-triceps-extension",
    "exercise_name": "Plank To Triceps Extension",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "raised-legs-crunches",
    "exercise_name": "Raised-Legs Crunches",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "reverse-crunches",
    "exercise_name": "Reverse Crunches",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "russian-twist-kb-or-db",
    "exercise_name": "Russian Twist (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "side-v-ups",
    "exercise_name": "Side V-Ups",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "sit-ups-kb-or-db",
    "exercise_name": "Sit-Ups (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "sit-ups",
    "exercise_name": "Sit-Ups",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "starfish-crunch",
    "exercise_name": "Starfish Crunch",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "v-ups-kb-or-db",
    "exercise_name": "V-Ups (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "v-ups",
    "exercise_name": "V-Ups",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "around-the-world-planks",
    "exercise_name": "Around-The-World Planks",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "assisted-sit-up",
    "exercise_name": "Assisted Sit-Up",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-crunches",
    "exercise_name": "Banded Crunches",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-russian-twist",
    "exercise_name": "Banded Russian Twist",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-sit-ups",
    "exercise_name": "Banded Sit-Ups",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "lying-leg-raise",
    "exercise_name": "Lying Leg Raise",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "plank",
    "exercise_name": "Plank",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "russian-twist-plate",
    "exercise_name": "Russian Twist (Plate)",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "weight-plate"
        ]
      ]
    }
  },
  {
    "exercise_slug": "russian-twist-wedge-feet",
    "exercise_name": "Russian Twist (Wedge Feet)",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "side-plank-knee-tuck",
    "exercise_name": "Side Plank Knee Tuck",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "side-plank",
    "exercise_name": "Side Plank",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "sit-ups-plate",
    "exercise_name": "Sit-Ups (Plate)",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "weight-plate"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-oblique-crunch",
    "exercise_name": "Standing Oblique Crunch",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "russian-twist",
    "exercise_name": "Russian Twist",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "v-ups-plate",
    "exercise_name": "V-Ups (Plate)",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "weight-plate"
        ]
      ]
    }
  },
  {
    "exercise_slug": "crunches-plate",
    "exercise_name": "Crunches (Plate)",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "weight-plate"
        ]
      ]
    }
  },
  {
    "exercise_slug": "crunches",
    "exercise_name": "Crunches",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "decline-mountain-climber",
    "exercise_name": "Decline Mountain Climber",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "chair",
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "front-plank-alternating-knee-tucks",
    "exercise_name": "Front Plank — Alternating Knee Tucks",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "front-plank-scissors",
    "exercise_name": "Front Plank — Scissors",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bear-crawl",
    "exercise_name": "Bear Crawl",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "flutter-kicks",
    "exercise_name": "Flutter Kicks",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "hollow-flutter-kicks-kb-or-db",
    "exercise_name": "Hollow Flutter Kicks (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "hollow-hold",
    "exercise_name": "Hollow Hold",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "kneeling-woodchoppers-kb-or-db",
    "exercise_name": "Kneeling Woodchoppers (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "scissors",
    "exercise_name": "Scissors",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "single-arm-suitcase-march-kb-or-db",
    "exercise_name": "Single-Arm Suitcase March (Kb Or Db)",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells",
          "kettlebells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "toe-taps",
    "exercise_name": "Toe Taps",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "tuck-ups",
    "exercise_name": "Tuck-Ups",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "barbell-leg-drop",
    "exercise_name": "Barbell Leg Drop",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "barbell"
        ]
      ]
    }
  },
  {
    "exercise_slug": "barbell-rollout",
    "exercise_name": "Barbell Rollout",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "barbell"
        ],
        [
          "weight-plates"
        ]
      ]
    }
  },
  {
    "exercise_slug": "buzzsaw",
    "exercise_name": "Buzzsaw",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "jackknives",
    "exercise_name": "Jackknives",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "renegade-row",
    "exercise_name": "Renegade Row",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "dumbbell"
        ]
      ]
    }
  },
  {
    "exercise_slug": "offset-barbell-deadlift",
    "exercise_name": "Offset Barbell Deadlift",
    "workout_location": "home",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "barbell"
        ],
        [
          "weight-plates"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-dumbbell-shoulder-flexion",
    "exercise_name": "Seated Dumbbell Shoulder Flexion",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "shoulder-press-machine-unilateral",
    "exercise_name": "Shoulder Press Machine Unilateral",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "shoulder-press-machine"
        ]
      ]
    }
  },
  {
    "exercise_slug": "shoulder-press-machine",
    "exercise_name": "Shoulder Press Machine",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "shoulder-press-machine"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-dumbbell-overhead-press-neutral-grip",
    "exercise_name": "Standing Dumbbell Overhead Press Neutral Grip",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-dumbbell-overhead-press",
    "exercise_name": "Standing Dumbbell Overhead Press",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-dumbbell-shoulder-abduction",
    "exercise_name": "Standing Dumbbell Shoulder Abduction",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-dumbbell-shoulder-flexion",
    "exercise_name": "Standing Dumbbell Shoulder Flexion",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-shoulder-abduction-machine",
    "exercise_name": "Standing Shoulder Abduction Machine",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "shoulder-abduction-machine"
        ]
      ]
    }
  },
  {
    "exercise_slug": "unilateral-dumbbell-shoulder-abduction",
    "exercise_name": "Unilateral Dumbbell Shoulder Abduction",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "unilateral-dumbbell-shoulder-flexion",
    "exercise_name": "Unilateral Dumbbell Shoulder Flexion",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "alternating-dumbbell-shoulder-flexion",
    "exercise_name": "Alternating Dumbbell Shoulder Flexion",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "band-shoulder-abduction-alternating",
    "exercise_name": "Band Shoulder Abduction Alternating",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "band-shoulder-abduction-unilateral",
    "exercise_name": "Band Shoulder Abduction Unilateral",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "band-shoulder-abduction",
    "exercise_name": "Band Shoulder Abduction",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "band-shoulder-flexion-alternating",
    "exercise_name": "Band Shoulder Flexion Alternating",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "band-shoulder-flexion-unilateral",
    "exercise_name": "Band Shoulder Flexion Unilateral",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "band-shoulder-flexion",
    "exercise_name": "Band Shoulder Flexion",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "cable-shoulder-abduction-unilateral",
    "exercise_name": "Cable Shoulder Abduction Unilateral",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "cable-shoulder-abduction",
    "exercise_name": "Cable Shoulder Abduction",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "cable-shoulder-flexion-unilateral",
    "exercise_name": "Cable Shoulder Flexion Unilateral",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "cable-shoulder-flexion",
    "exercise_name": "Cable Shoulder Flexion",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "dumbbell-alternating-overhead-press",
    "exercise_name": "Dumbbell Alternating Overhead Press",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "overhead-press-barbell",
    "exercise_name": "Overhead Press (Barbell)",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "barbell"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-dumbbell-overhead-press",
    "exercise_name": "Seated Dumbbell Overhead Press",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-dumbbell-overhead-press-neutral-grip",
    "exercise_name": "Seated Dumbbell Overhead Press Neutral Grip",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-dumbbell-shoulder-abduction",
    "exercise_name": "Seated Dumbbell Shoulder Abduction",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "dumbbell-shoulder-abduction",
    "exercise_name": "Dumbbell Shoulder Abduction",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-dumbbell-arnold-press",
    "exercise_name": "Standing Dumbbell Arnold Press",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-dumbbell-arnold-press",
    "exercise_name": "Seated Dumbbell Arnold Press",
    "workout_location": "gym",
    "muscle_category": "Shoulders",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-unilateral-dumbbell-biceps-curls",
    "exercise_name": "Seated Unilateral Dumbbell Biceps Curls",
    "workout_location": "gym",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-unilateral-dumbbell-hammer-curls",
    "exercise_name": "Seated Unilateral Dumbbell Hammer Curls",
    "workout_location": "gym",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "skull-crusher-barbell",
    "exercise_name": "Skull Crusher (Barbell)",
    "workout_location": "gym",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "barbell"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "skull-crusher-ez-bar",
    "exercise_name": "Skull Crusher (Ez Bar)",
    "workout_location": "gym",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "ez-bar"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "behind-the-head-cable-triceps-extensions-unilateral",
    "exercise_name": "Behind-The-Head Cable Triceps Extensions Unilateral",
    "workout_location": "gym",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "behind-the-head-cable-triceps-extensions",
    "exercise_name": "Behind-The-Head Cable Triceps Extensions",
    "workout_location": "gym",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "biceps-curls-barbell",
    "exercise_name": "Biceps Curls (Barbell)",
    "workout_location": "gym",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "barbell"
        ]
      ]
    }
  },
  {
    "exercise_slug": "biceps-curls-ez-bar",
    "exercise_name": "Biceps Curls (Ez Bar)",
    "workout_location": "gym",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "ez-bar"
        ]
      ]
    }
  },
  {
    "exercise_slug": "cable-biceps-curls-unilateral",
    "exercise_name": "Cable Biceps Curls Unilateral",
    "workout_location": "gym",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "cable-biceps-curls",
    "exercise_name": "Cable Biceps Curls",
    "workout_location": "gym",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "cable-hammer-curls-unilateral",
    "exercise_name": "Cable Hammer Curls Unilateral",
    "workout_location": "gym",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "cable-hammer-curls",
    "exercise_name": "Cable Hammer Curls",
    "workout_location": "gym",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "cable-triceps-extensions-unilateral",
    "exercise_name": "Cable Triceps Extensions Unilateral",
    "workout_location": "gym",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "cable-triceps-extensions",
    "exercise_name": "Cable Triceps Extensions",
    "workout_location": "gym",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "overhand-biceps-curl-ez-bar",
    "exercise_name": "Overhand Biceps Curl (Ez Bar)",
    "workout_location": "gym",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "ez-bar"
        ]
      ]
    }
  },
  {
    "exercise_slug": "overhand-biceps-curls-barbell",
    "exercise_name": "Overhand Biceps Curls (Barbell)",
    "workout_location": "gym",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "barbell"
        ]
      ]
    }
  },
  {
    "exercise_slug": "overhand-cable-biceps-curls",
    "exercise_name": "Overhand Cable Biceps Curls",
    "workout_location": "gym",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-alternating-dumbbell-biceps-curls",
    "exercise_name": "Seated Alternating Dumbbell Biceps Curls",
    "workout_location": "gym",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-alternating-dumbbell-hammer-curls",
    "exercise_name": "Seated Alternating Dumbbell Hammer Curls",
    "workout_location": "gym",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-dumbbell-biceps-curls",
    "exercise_name": "Seated Dumbbell Biceps Curls",
    "workout_location": "gym",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-dumbbell-hammer-curls",
    "exercise_name": "Seated Dumbbell Hammer Curls",
    "workout_location": "gym",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "dumbbell-overhand-biceps-curls",
    "exercise_name": "Dumbbell Overhand Biceps Curls",
    "workout_location": "gym",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "dumbbell-skull-crusher-unilateral",
    "exercise_name": "Dumbbell Skull Crusher Unilateral",
    "workout_location": "gym",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "dumbbell-skull-crusher",
    "exercise_name": "Dumbbell Skull Crusher",
    "workout_location": "gym",
    "muscle_category": "Arms",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "smith-machine-bench-press",
    "exercise_name": "Smith Machine Bench Press",
    "workout_location": "gym",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "smith-machine"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "smith-machine-decline-bench-press",
    "exercise_name": "Smith Machine Decline Bench Press",
    "workout_location": "gym",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "smith-machine"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "smith-machine-incline-bench-press",
    "exercise_name": "Smith Machine Incline Bench Press",
    "workout_location": "gym",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "smith-machine"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "assisted-dips",
    "exercise_name": "Assisted Dips",
    "workout_location": "gym",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dips-machine"
        ]
      ]
    }
  },
  {
    "exercise_slug": "barbell-bench-press",
    "exercise_name": "Barbell Bench Press",
    "workout_location": "gym",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "bench-press"
        ]
      ]
    }
  },
  {
    "exercise_slug": "cable-chest-fly-unilateral",
    "exercise_name": "Cable Chest Fly Unilateral",
    "workout_location": "gym",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "cable-chest-fly",
    "exercise_name": "Cable Chest Fly",
    "workout_location": "gym",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "decline-bench-press-barbell",
    "exercise_name": "Decline Bench Press (Barbell)",
    "workout_location": "gym",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "decline-bench-press"
        ]
      ]
    }
  },
  {
    "exercise_slug": "dumbbell-bench-press",
    "exercise_name": "Dumbbell Bench Press",
    "workout_location": "gym",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "dumbbell-chest-fly",
    "exercise_name": "Dumbbell Chest Fly",
    "workout_location": "gym",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "fly-machine",
    "exercise_name": "Fly Machine",
    "workout_location": "gym",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "chest-fly-machine"
        ]
      ]
    }
  },
  {
    "exercise_slug": "incline-bench-press-barbell",
    "exercise_name": "Incline Bench Press (Barbell)",
    "workout_location": "gym",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "incline-bench-press"
        ]
      ]
    }
  },
  {
    "exercise_slug": "incline-chest-press-machine",
    "exercise_name": "Incline Chest Press Machine",
    "workout_location": "gym",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "incline-chest-machine"
        ]
      ]
    }
  },
  {
    "exercise_slug": "push-ups",
    "exercise_name": "Push-Ups",
    "workout_location": "gym",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "dumbbell-decline-bench-press",
    "exercise_name": "Dumbbell Decline Bench Press",
    "workout_location": "gym",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ],
        [
          "decline-bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "dumbbell-incline-benchh-press",
    "exercise_name": "Dumbbell Incline Benchh Press",
    "workout_location": "gym",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "dumbbell-neutral-grip-bench-press",
    "exercise_name": "Dumbbell Neutral Grip Bench Press",
    "workout_location": "gym",
    "muscle_category": "Chest",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "dumbbell-bent-over-reverse-fly",
    "exercise_name": "Dumbbell Bent-Over Reverse Fly",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "dumbbell-prone-reverse-fly",
    "exercise_name": "Dumbbell Prone Reverse Fly",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "trx-rows",
    "exercise_name": "Trx Rows",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "suspension-trainer"
        ]
      ]
    }
  },
  {
    "exercise_slug": "unilateral-dumbbell-upright-row",
    "exercise_name": "Unilateral Dumbbell Upright Row",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "upright-row-barbell",
    "exercise_name": "Upright Row (Barbell)",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "barbell"
        ]
      ]
    }
  },
  {
    "exercise_slug": "wide-grip-t-bar-cable-row",
    "exercise_name": "Wide Grip T-Bar Cable Row",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "assisted-pull-ups",
    "exercise_name": "Assisted Pull-Ups",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "pull-up-machine"
        ]
      ]
    }
  },
  {
    "exercise_slug": "bent-over-row-barbell",
    "exercise_name": "Bent-Over Row (Barbell)",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "barbell"
        ]
      ]
    }
  },
  {
    "exercise_slug": "cable-face-pull-down",
    "exercise_name": "Cable Face Pull Down",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "cable-lat-pulldown-neutral-grip",
    "exercise_name": "Cable Lat Pulldown Neutral Grip",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "cable-lat-pulldown-underhand",
    "exercise_name": "Cable Lat Pulldown Underhand",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "cable-lat-pulldown-unilateral",
    "exercise_name": "Cable Lat Pulldown Unilateral",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "cable-lat-pulldown",
    "exercise_name": "Cable Lat Pulldown",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "cable-row-neutral",
    "exercise_name": "Cable Row Neutral",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "cable-row-unilateral",
    "exercise_name": "Cable Row Unilateral",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "cable-row",
    "exercise_name": "Cable Row",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "face-pull-cable",
    "exercise_name": "Face Pull (Cable)",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "gorilla-row-kettlebell-or-dumbbell",
    "exercise_name": "Gorilla Row (Kettlebell Or Dumbbell)",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "kettlebell",
          "dumbbell"
        ]
      ]
    }
  },
  {
    "exercise_slug": "pendlay-row-barbell",
    "exercise_name": "Pendlay Row (Barbell)",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "barbell"
        ]
      ]
    }
  },
  {
    "exercise_slug": "pull-ups",
    "exercise_name": "Pull-Ups",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "pull-up-bar"
        ]
      ]
    }
  },
  {
    "exercise_slug": "dumbbell-bent-over-row",
    "exercise_name": "Dumbbell Bent-Over Row",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "dumbbell-prone-row-alternating",
    "exercise_name": "Dumbbell Prone Row Alternating",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "barbell"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "dumbbell-prone-row",
    "exercise_name": "Dumbbell Prone Row",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "barbell"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "dumbbell-unilateral-row",
    "exercise_name": "Dumbbell Unilateral Row",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "assisted-chin-ups",
    "exercise_name": "Assisted Chin-Ups",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "pull-up-machine"
        ]
      ]
    }
  },
  {
    "exercise_slug": "cable-pullover",
    "exercise_name": "Cable Pullover",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "chin-ups",
    "exercise_name": "Chin-Ups",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "pull-up-bar"
        ]
      ]
    }
  },
  {
    "exercise_slug": "prone-angels",
    "exercise_name": "Prone Angels",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-horizontal-abduction",
    "exercise_name": "Banded Horizontal Abduction",
    "workout_location": "gym",
    "muscle_category": "Back",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "glute-bridge-unilateral",
    "exercise_name": "Glute Bridge Unilateral",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "hamstring-bridge-unilateral",
    "exercise_name": "Hamstring Bridge Unilateral",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "knee-extension-unilateral",
    "exercise_name": "Knee Extension Unilateral",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "knee-extension-machine"
        ]
      ]
    }
  },
  {
    "exercise_slug": "knee-flexion-unilateral",
    "exercise_name": "Knee Flexion Unilateral",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "knee-flexion-machine"
        ]
      ]
    }
  },
  {
    "exercise_slug": "romanian-deadlift-barbell",
    "exercise_name": "Romanian Deadlift (Barbell)",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "barbell"
        ]
      ]
    }
  },
  {
    "exercise_slug": "side-lying-hip-abduction-banded",
    "exercise_name": "Side-Lying Hip Abduction (Banded)",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "side-lying-hip-abduction",
    "exercise_name": "Side-Lying Hip Abduction",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "smith-machine-split-squat",
    "exercise_name": "Smith Machine Split Squat",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "smith-machine"
        ]
      ]
    }
  },
  {
    "exercise_slug": "smith-machine-squat",
    "exercise_name": "Smith Machine Squat",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "smith-machine"
        ]
      ]
    }
  },
  {
    "exercise_slug": "split-squat-with-impulse-dumbbell",
    "exercise_name": "Split Squat With Impulse (Dumbbell)",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-calf-raise-machine",
    "exercise_name": "Standing Calf Raise Machine",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "calf-raise-machine"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-hip-extension-cable",
    "exercise_name": "Standing Hip Extension Cable",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "walking-lunges-with-impulse-dumbbell",
    "exercise_name": "Walking Lunges With Impulse (Dumbbell)",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "zercher-squat",
    "exercise_name": "Zercher Squat",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "squat-rack"
        ]
      ]
    }
  },
  {
    "exercise_slug": "banded-squats",
    "exercise_name": "Banded Squats",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "barbell-front-squat",
    "exercise_name": "Barbell Front Squat",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "squat-rack"
        ]
      ]
    }
  },
  {
    "exercise_slug": "barbell-split-squat",
    "exercise_name": "Barbell Split Squat",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "squat-rack"
        ]
      ]
    }
  },
  {
    "exercise_slug": "barbell-squat",
    "exercise_name": "Barbell Squat",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "squat-rack"
        ]
      ]
    }
  },
  {
    "exercise_slug": "glute-bridge-isometric-hold-timed",
    "exercise_name": "Glute Bridge Isometric Hold (Timed)",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "glute-bridge-march",
    "exercise_name": "Glute Bridge March",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "glute-bridge",
    "exercise_name": "Glute Bridge",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "goblet-squat-with-impulse",
    "exercise_name": "Goblet Squat With Impulse",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "hack-squat-machine",
    "exercise_name": "Hack Squat Machine",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "hack-squat-machine"
        ]
      ]
    }
  },
  {
    "exercise_slug": "hamstring-bridge-isometric-hold-timed",
    "exercise_name": "Hamstring Bridge Isometric Hold (Timed)",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "hamstring-bridge",
    "exercise_name": "Hamstring Bridge",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "hanging-leg-raises",
    "exercise_name": "Hanging Leg Raises",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "pull-up-bar"
        ]
      ]
    }
  },
  {
    "exercise_slug": "hip-abduction-cable",
    "exercise_name": "Hip Abduction (Cable)",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "hip-adduction-cable",
    "exercise_name": "Hip Adduction (Cable)",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "leg-press",
    "exercise_name": "Leg Press",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "leg-press-machine"
        ]
      ]
    }
  },
  {
    "exercise_slug": "leg-raises",
    "exercise_name": "Leg Raises",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "prisoner-squats",
    "exercise_name": "Prisoner Squats",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "quadruped-kickback-cable",
    "exercise_name": "Quadruped Kickback Cable",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "seated-calf-raise-machine",
    "exercise_name": "Seated Calf Raise Machine",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "seated-calf-raise-machine"
        ]
      ]
    }
  },
  {
    "exercise_slug": "dumbbel-box-step-up",
    "exercise_name": "Dumbbel Box Step-Up",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "dumbbell-bulgarian-split-squat",
    "exercise_name": "Dumbbell Bulgarian Split Squat",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "dumbbell-goblet-squat",
    "exercise_name": "Dumbbell Goblet Squat",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "dumbbell-hip-thrust",
    "exercise_name": "Dumbbell Hip Thrust",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "dumbbell-split-squat",
    "exercise_name": "Dumbbell Split Squat",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "dumbbell-walking-lunges",
    "exercise_name": "Dumbbell Walking Lunges",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "side-lying-clamshells",
    "exercise_name": "Side-Lying Clamshells",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "split-stance-rdl-dumbbell",
    "exercise_name": "Split Stance Rdl (Dumbbell)",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-clamshells",
    "exercise_name": "Standing Clamshells",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "resistance-band"
        ]
      ]
    }
  },
  {
    "exercise_slug": "wall-sits-timed",
    "exercise_name": "Wall Sits (Timed)",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "isometric-hold-timed",
    "exercise_name": "Isometric Hold (Timed)",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "knee-extension-machine",
    "exercise_name": "Knee Extension Machine",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "knee-extension-machine"
        ]
      ]
    }
  },
  {
    "exercise_slug": "knee-flexion-machine",
    "exercise_name": "Knee Flexion Machine",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "knee-flexion-machine"
        ]
      ]
    }
  },
  {
    "exercise_slug": "psoas-march",
    "exercise_name": "Psoas March",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "dumbbell-box-step-down",
    "exercise_name": "Dumbbell Box Step-Down",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "dumbbells"
        ],
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "stiff-leg-deadlift-barbell",
    "exercise_name": "Stiff-Leg Deadlift (Barbell)",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "barbell"
        ]
      ]
    }
  },
  {
    "exercise_slug": "trap-bar-deadlift",
    "exercise_name": "Trap Bar Deadlift",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "trap-bar"
        ]
      ]
    }
  },
  {
    "exercise_slug": "back-extension",
    "exercise_name": "Back Extension",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "back-extension-machine"
        ]
      ]
    }
  },
  {
    "exercise_slug": "barbell-deadlift",
    "exercise_name": "Barbell Deadlift",
    "workout_location": "gym",
    "muscle_category": "Legs",
    "equipment_groups": {
      "groups": [
        [
          "barbell"
        ]
      ]
    }
  },
  {
    "exercise_slug": "side-plank-timed",
    "exercise_name": "Side Plank (Timed)",
    "workout_location": "gym",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "sit-ups",
    "exercise_name": "Sit-Ups",
    "workout_location": "gym",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "swiss-ball-crunches",
    "exercise_name": "Swiss Ball Crunches",
    "workout_location": "gym",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "swiss-ball"
        ]
      ]
    }
  },
  {
    "exercise_slug": "cable-crunches",
    "exercise_name": "Cable Crunches",
    "workout_location": "gym",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "copenhagen-plank-timed",
    "exercise_name": "Copenhagen Plank (Timed)",
    "workout_location": "gym",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "bench"
        ]
      ]
    }
  },
  {
    "exercise_slug": "crunches",
    "exercise_name": "Crunches",
    "workout_location": "gym",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "plank-timed",
    "exercise_name": "Plank (Timed)",
    "workout_location": "gym",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "russian-twist",
    "exercise_name": "Russian Twist",
    "workout_location": "gym",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "landmine-oblique-twist",
    "exercise_name": "Landmine Oblique Twist",
    "workout_location": "gym",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "barbell"
        ]
      ]
    }
  },
  {
    "exercise_slug": "landmine-anti-rotations",
    "exercise_name": "Landmine Anti-Rotations",
    "workout_location": "gym",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "barbell"
        ]
      ]
    }
  },
  {
    "exercise_slug": "standing-cable-torso-rotations",
    "exercise_name": "Standing Cable Torso Rotations",
    "workout_location": "gym",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "superman",
    "exercise_name": "Superman",
    "workout_location": "gym",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "alternating-superman",
    "exercise_name": "Alternating Superman",
    "workout_location": "gym",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "body-weight"
        ]
      ]
    }
  },
  {
    "exercise_slug": "kneeling-cable-torso-rotations",
    "exercise_name": "Kneeling Cable Torso Rotations",
    "workout_location": "gym",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  },
  {
    "exercise_slug": "kneeling-one-leg-cable-torso-rotations",
    "exercise_name": "Kneeling One-Leg Cable Torso Rotations",
    "workout_location": "gym",
    "muscle_category": "Core",
    "equipment_groups": {
      "groups": [
        [
          "cable"
        ]
      ]
    }
  }
]


const systemPrompt = `
✅ FINAL SYSTEM PROMPT – FULL WORKOUT PROGRAMMING GUIDE (v5.1)

🧱 1. GENERAL WORKOUT GUIDELINES

Gym training follows classic progression principles.

Use full gym equipment when applicable.

Respect client goals and muscle-group preferences.

❌ Do not mix upper and lower body in a single exercise.

🚫 2. EXECUTION RULES

❌ No supersets or circuit training.

❌ Warm-up is never part of the workout plan.

❌ Cardio equipment is never included.

✅ Rest between sets = 90 seconds.

✅ Set duration = ~60 seconds of “work”.

Push-Ups:

✅ Only use flat-hand or feet-elevated push-up variations.

❌ Never use the term “incline push-ups.”

Substitutions:

Bench Press → Push-Ups (Regular or Feet-Elevated)

Incline Bench → Feet-Elevated Push-Ups

Range of Motion:

Increase only if appropriate.

❌ Never increase ROM for shoulder-based exercises.

Isolation:

❌ No isolation exercises without external load, unless used during warm-up (note: warm-up is not part of the plan).

⚠️ Unilateral Exercise Rule:

Unilateral movements (e.g., Side-Lying Leg Raise [Right] + [Left]) count as one exercise, not two.

❌ Never separate sides into two entries.

🧗‍♂️ 3. ADAPTATION PHASE (FOR BEGINNERS)
Use if:

Client is new → 6 weeks

Client is returning → 4 weeks

Programming:

Use the same exercises as the standard plan.

Reps: 10–15

Intensity: Low to moderate

Avoid explosive or high-complexity movements.

🧩 4. FALLBACK RULE – DEADLIFT/SQUAT SPACING

✅ Use machine-based leg alternatives if spacing is an issue (e.g., Leg Press, Leg Curl, Leg Extension).

❌ No high-impact, CNS-fatiguing substitutions as a workaround.

💪 5. ADVANCED USERS

Include unilateral and complex compound movements.

Add tempo/intensity variations.

Use progressive overload unless client feedback indicates otherwise.

🏋️ 6. PROGRESSION GUIDELINES

Type	Reps
Compound Movements	6–8
Free Weights	8–12
Isolation Work	10–15

➡️ Increase weight once max reps are achieved for a given range.

⚖️ 6b. BASELINE WEIGHTS

When generating workout plans, baseline weights must be set appropriately for exercises that require external load.

✅ Machine-Based Exercises (Leg Press, Chest Press Machine, Cable Machines, etc.):
- Set appropriate starting weight based on exercise difficulty and user level

✅ Small Weights / Dumbbells (Dumbbell exercises, Kettlebells):
- Baseline: 2kg per hand
- Note: Information is per hand/arm (e.g., "2kg" means 2kg in each hand)

✅ Barbell Exercises:
- Set appropriate starting weight based on exercise difficulty and user level

✅ Bodyweight Exercises:
- No baseline weight needed

Important Notes:
- Baseline weights should be conservative for beginners and adjusted based on user experience level
- Always consider user's current strength level and training history when setting baseline weights
- For unilateral exercises (single-arm/leg), baseline is per limb

🧩 7. SINGLE WORKOUT STRUCTURE

**IMPORTANT: Follow these exercise counts based on requested duration:**

Duration	Exercises
30–45 min	4 exercises
45–60 min	5–6 exercises (prefer 5 for 45-50min, 6 for 55-60min)
60–90 min	7–9 exercises

**Do not exceed the maximum exercise count for the requested duration.** Each exercise takes ~10 minutes (4 sets × ~2.5 min per set including rest), so exceeding the limit creates workouts that are too long.

Generate ONE complete workout session based on user requirements (muscle groups, duration, equipment, difficulty).

⏱ 8. TIME STRUCTURE

Each exercise = 4 sets

Each set ≈ 60 seconds

Each exercise ≈ 10 minutes

📌 9. PROGRAMMING RULES

Reps = always filled with ranges like "8-12"

Weight = must be set appropriately based on exercise type and user level (see Baseline Weights section 6b). For dumbbells, specify weight per hand (e.g., "2kg" means 2kg in each hand). For bodyweight exercises, use "bodyweight" or leave blank.

Time = used only for isometric core exercises.

✅ Allowed Isometric Core Exercises

Exercise	Time	Reps	Notes
Plank	30 sec	—	Keep core tight
Side Plank	30 sec	—	Keep core tight
Bird Dog Hold	30 sec	—	Keep core tight
Plank Shoulder Taps	30 sec	—	Keep core tight

📄 11. JSON OUTPUT FORMAT

Return a single complete workout session with 4-9 exercises. The structure must include:
- **name**: Descriptive workout name based on muscle groups (e.g., "Chest & Triceps Power", "Full Body Strength")
- **estimatedDuration**: Number matching the requested duration
- **difficulty**: Must match requested difficulty ('easy', 'medium', or 'hard')
- **exercises**: Array of exercise objects

\`\`\`json
{
  "name": "Chest & Triceps Power",
  "estimatedDuration": 60,
  "difficulty": "medium",
  "exercises": [
    {
      "exercise": "Bench Press",
      "similar_alternative_exercises": ["Incline Bench Press (Barbell)", "Smith Machine Bench Press"],
      "similar_alternative_exercises_notes": ["Targets upper chest more. Use if bench is occupied.", "Fixed bar path for safety. Good for training to failure without spotter."],
      "sets": 4,
      "reps": "8-12",
      "weight": "40kg",
      "time": "",
      "notes": "Tempo 3-1-1, full ROM"
    },
    {
      "exercise": "Incline Dumbbell Press",
      "similar_alternative_exercises": ["Incline Barbell Press", "Machine Chest Press (Incline)"],
      "similar_alternative_exercises_notes": ["More stable, easier to load heavy.", "Fixed path, good for drop sets."],
      "sets": 3,
      "reps": "10-15",
      "weight": "15kg per hand",
      "time": "",
      "notes": "Focus on squeeze at top"
    },
    {
      "exercise": "Cable Chest Fly",
      "similar_alternative_exercises": ["Dumbbell Chest Fly", "Pec Deck Machine"],
      "similar_alternative_exercises_notes": ["Free weight variation, requires more stability.", "Machine variation, easier to isolate chest."],
      "sets": 3,
      "reps": "12-15",
      "weight": "20kg",
      "time": "",
      "notes": "Slight bend in elbows, control the negative"
    },
    {
      "exercise": "Tricep Pushdown (Cable)",
      "similar_alternative_exercises": ["Overhead Tricep Extension (Cable)", "Dumbbell Tricep Kickback"],
      "similar_alternative_exercises_notes": ["Hits long head more, stretch at top.", "Good for unilateral work and mind-muscle connection."],
      "sets": 3,
      "reps": "12-15",
      "weight": "30kg",
      "time": "",
      "notes": "Keep elbows locked at sides"
    },
    {
      "exercise": "Close-Grip Bench Press",
      "similar_alternative_exercises": ["Dumbbell Close-Grip Press", "Smith Machine Close-Grip Press"],
      "similar_alternative_exercises_notes": ["More natural wrist angle.", "Fixed bar path, good for heavy loads."],
      "sets": 3,
      "reps": "8-12",
      "weight": "30kg",
      "time": "",
      "notes": "Hands shoulder-width apart, elbows tucked"
    }
  ]
}

\`\`\`

🔄 11b. ALTERNATIVE EXERCISES

✅ ALWAYS provide 2-3 similar alternative exercises for each main exercise.

Purpose: Direct substitutes when equipment is occupied or for variety.

Requirements:
- Must target the same muscle groups
- Must have similar movement patterns
- Must match difficulty level
- Use same sets/reps/weight as main exercise
- Unique alternatives (no duplicates)

Format:
\`\`\`json
"similar_alternative_exercises": ["Exercise 1", "Exercise 2"],
"similar_alternative_exercises_notes": ["Brief personalized note 1.", "Brief personalized note 2."]
\`\`\`

Note Guidelines (keep short and focused):
- State key difference from main exercise
- Mention when to use (e.g., "Use if bench occupied", "Good without spotter")
- 1-2 sentences max per alternative

Example:
\`\`\`json
"exercise": "Bench Press",
"similar_alternative_exercises": ["Incline Bench Press (Barbell)", "Smith Machine Bench Press"],
"similar_alternative_exercises_notes": ["Targets upper chest more. Use if bench is occupied.", "Fixed bar path for safety. Good for training to failure without spotter."]
\`\`\`

🔁 12. EXERCISE BALANCE (FOR FULL-BODY WORKOUTS)

When generating full-body workouts, ensure balance:
✅ Include at least one: Push movement, Pull movement, Leg movement, Core movement
✅ All movements should be compound when possible (unless limited by equipment or user restrictions)
✅ Distribute volume appropriately across muscle groups

📋 13. EXERCISE SELECTION RULES

✅ LEG TRAINING
Always include leg work for full-body and leg-focused sessions (unless client opts out or equipment unavailable).

✅ DEADLIFT CLASSIFICATION
All barbell deadlifts = Leg/Glute category, not Back.

✅ LEG CURL RULE
Treat Leg Curl (Lying) as isotonic exercise.
Fill Reps field, leave Time field blank.

✅ EXERCISE UNIQUENESS
❌ Never repeat the same exercise within a single workout session.

✅ BACK EXERCISES
Back category includes: pulldowns, pull-ups, rows, cable pulls.
❌ Back Extensions = glute/hamstring category, NOT back.

🏋️ 14. EXERCISE POOL – APPROVED LIST

This section contains the complete allowed list of exercises to choose from when generating the workout.

<EXERCISE POOL>
${exercisePool.filter(exercise => exercise.workout_location === "gym").map(exercise => exercise.exercise_name).join('\n')}
</EXERCISE POOL>
`

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 300000, // 5 minutes timeout for gpt-5 with reasoning
  maxRetries: 2,
});

// Zod schema for single workout - based on WorkoutEntry pattern (without streak exercises)
const SingleWorkoutExerciseSchema = z.object({
  exercise: z.string().describe('Exercise name from the exercise pool'),
  similar_alternative_exercises: z.array(z.string()).describe('2-3 alternative exercises'),
  similar_alternative_exercises_notes: z.array(z.string()).describe('Brief notes for each alternative'),
  sets: z.number().describe('Number of sets (typically 3-4)'),
  reps: z.string().describe('Reps filled with ranges like "8-12"'),
  weight: z.string().describe('Set appropriately based on exercise type and user level'),
  time: z.string().describe('Only filled for isometric core exercises - required but can be empty'),
  notes: z.string().describe('Optional additional notes - required but can be empty'),
});

const SingleWorkoutSchema = z.object({
  name: z.string().describe('Name of the workout (e.g., "Chest & Triceps Blast")'),
  estimatedDuration: z.number().describe('Estimated total workout duration in minutes'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('Difficulty level'),
  exercises: z.array(SingleWorkoutExerciseSchema).describe('Array of 4-6 exercises'),
});


// Helper function to create a slug from exercise name
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Helper function to ensure exercise exists in database
async function ensureExerciseExists(exerciseName: string): Promise<string> {
  try {
    console.log('Processing exercise:', exerciseName);

    // Trigger the exercise profile generation task
    const result = await tasks.triggerAndWait<typeof generateExerciseProfileTask>(
      "generate-exercise-profile",
      { exerciseName }
    );

    if (!result.ok) {
      throw new Error(`Exercise profile generation failed: ${result.error}`);
    }

    return result.output.exercise_id;
  } catch (error) {
    console.error('Error ensuring exercise exists:', error);
    throw error;
  }
}

// Helper function to update progress in database
async function updateProgress(requestId: string, currentStep: number, totalSteps: number, stepDescription: string) {
  try {
    await supabase
      .from('single_workout_requests')
      .update({
        current_step: currentStep,
        total_steps: totalSteps,
        step_description: stepDescription,
      })
      .eq('request_id', requestId);

    console.log(`Progress updated: Step ${currentStep}/${totalSteps} - ${stepDescription}`);
  } catch (error) {
    console.error('Failed to update progress:', error);
  }
}

export const generateSingleWorkoutTask = task({
  id: "generate-single-workout",
  run: async (payload: {
    userId: string;
    requestId: string;
    muscleGroups: string[];
    duration: number;
    equipment: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    userProfile: string;
    clientDate?: string; // ISO string of client's current date/time to handle timezones
  }) => {
    try {
      console.log('Starting single workout generation for request:', payload.requestId);

      // Update progress: Step 1 - Generating workout
      await updateProgress(payload.requestId, 1, 2, 'Generating your workout...');

      // Build user request message
      const userRequest = `
USER PROFILE:
${payload.userProfile}

WORKOUT REQUIREMENTS:
- Target Muscle Groups: ${payload.muscleGroups.join(', ')}
- Duration: ${payload.duration} minutes
- Available Equipment: ${payload.equipment.join(', ')}
- Difficulty Level: ${payload.difficulty}

Please generate a complete single workout session that meets these requirements.
`;

      // Step 1: Generate workout using OpenAI
      const response = await openai.responses.parse({
        model: 'gpt-5',
        input: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userRequest
          }
        ],
        reasoning: {
          effort: "low"
        },
        text: {
          format: zodTextFormat(SingleWorkoutSchema, 'single_workout'),
        },
      });

      const workout = response.output_parsed;
      if (!workout) {
        throw new Error('Failed to parse workout');
      }

      console.log('Workout generated:', workout.name);

      // Step 2: Ensure all exercises exist in database
      const uniqueExerciseNames = new Set<string>();
      const exerciseNameToSlug: Record<string, string> = {};

      // Add main exercises and alternatives
      for (const exercise of workout.exercises) {
        uniqueExerciseNames.add(exercise.exercise);
        exerciseNameToSlug[exercise.exercise] = slugify(exercise.exercise);

        // Add alternative exercises
        for (const altExercise of exercise.similar_alternative_exercises) {
          uniqueExerciseNames.add(altExercise);
          exerciseNameToSlug[altExercise] = slugify(altExercise);
        }
      }

      console.log('Ensuring', uniqueExerciseNames.size, 'exercises exist...');

      // Calculate total steps: 1 (generate workout) + N (exercises) + 1 (save)
      const totalSteps = 1 + uniqueExerciseNames.size + 1;
      let currentStep = 1; // Already completed workout generation

      // Ensure all exercises exist with progress tracking
      const exerciseIds: Record<string, string> = {};
      const exerciseArray = Array.from(uniqueExerciseNames);

      for (let i = 0; i < exerciseArray.length; i++) {
        const exerciseName = exerciseArray[i];
        currentStep++;

        // Update progress for each exercise
        await updateProgress(
          payload.requestId,
          currentStep,
          totalSteps,
          `Generating exercise ${i + 1}/${exerciseArray.length}: ${exerciseName}...`
        );

        const exerciseId = await ensureExerciseExists(exerciseName);
        const slug = exerciseNameToSlug[exerciseName];
        exerciseIds[slug] = exerciseId;
        console.log(`Exercise ${exerciseName} (${slug}) -> ID: ${exerciseId}`);
      }

      // Update progress: Saving workout
      currentStep++;
      await updateProgress(payload.requestId, currentStep, totalSteps, 'Saving your workout...');

      // Step 3: Find or create user's active workout plan
      console.log('Finding or creating workout plan for user:', payload.userId);

      let { data: activePlans, error: planQueryError } = await supabase
        .from('workout_plans')
        .select('id, start_date')
        .eq('user_id', payload.userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (planQueryError) {
        throw new Error(`Failed to query workout plans: ${planQueryError.message}`);
      }

      let activePlan = activePlans && activePlans.length > 0 ? activePlans[0] : null;

      // Create a workout plan if none exists
      if (!activePlan) {
        console.log('No active workout plan found, creating one...');
        const { data: newPlan, error: planCreateError } = await supabase
          .from('workout_plans')
          .insert({
            user_id: payload.userId,
            summary: 'My Workouts',
            start_date: new Date().toISOString().split('T')[0],
            status: 'active',
          })
          .select('id, start_date')
          .single();

        if (planCreateError) {
          throw new Error(`Failed to create workout plan: ${planCreateError.message}`);
        }

        activePlan = newPlan;
        console.log('Created new workout plan:', activePlan.id);
      } else {
        console.log('Using existing workout plan:', activePlan.id);
      }

      // Step 4: Delete old unused "Train Now" workout instances for this user (regeneration)
      // We delete by workout_instance_id to remove entire workout generations at once
      // Only delete instances that haven't been used in workout sessions (preserve history)
      console.log('Cleaning up unused Train Now workout instances...');
      
      // Get all unique "Train Now" workout instance IDs
      const { data: oldInstances, error: fetchError } = await supabase
        .from('workout_entries')
        .select('workout_instance_id, created_at')
        .eq('workout_plan_id', activePlan.id)
        .eq('day_name', 'Train Now')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Failed to fetch old Train Now instances:', fetchError);
        // Continue anyway - might not exist
      } else if (oldInstances && oldInstances.length > 0) {
        // Get unique instance IDs
        const uniqueInstances = Array.from(
          new Set(oldInstances.map((i: any) => i.workout_instance_id))
        );
        console.log(`Found ${uniqueInstances.length} old Train Now workout instances`);

        // Check which instances have been used in workout sessions
        const { data: usedSets, error: usedError } = await supabase
          .from('workout_session_sets')
          .select('workout_entry_id')
          .in('workout_entry_id', 
            await supabase
              .from('workout_entries')
              .select('id')
              .in('workout_instance_id', uniqueInstances)
              .then(r => r.data?.map((e: any) => e.id) || [])
          );

        if (usedError) {
          console.error('Failed to check used instances:', usedError);
        }

        const usedEntryIds = new Set((usedSets || []).map((s: any) => s.workout_entry_id));
        
        // Find instances with no used entries
        const unusedInstances: string[] = [];
        for (const instanceId of uniqueInstances) {
          const { data: instanceEntries } = await supabase
            .from('workout_entries')
            .select('id')
            .eq('workout_instance_id', instanceId);
          
          const hasUsedEntries = instanceEntries?.some((e: any) => usedEntryIds.has(e.id));
          if (!hasUsedEntries) {
            unusedInstances.push(instanceId);
          }
        }

        if (unusedInstances.length > 0) {
          console.log(`Deleting ${unusedInstances.length} unused Train Now instances (preserving ${uniqueInstances.length - unusedInstances.length} with session history)`);
          
          // Delete all entries for unused instances
          const { error: deleteError } = await supabase
            .from('workout_entries')
            .delete()
            .in('workout_instance_id', unusedInstances);

          if (deleteError) {
            console.error('Failed to delete unused Train Now instances:', deleteError);
            // Don't throw - continue with creation
          } else {
            console.log(`Deleted ${unusedInstances.length} unused workout instances`);
          }
        } else {
          console.log('All Train Now instances have session history - keeping them all');
        }
      } else {
        console.log('No old Train Now instances found');
      }

      // Step 5: Insert workout entries into user's plan
      // Use client's date if provided (to handle timezone differences), otherwise use server time
      const clientDate = payload.clientDate ? new Date(payload.clientDate) : new Date();
      const todayDateString = clientDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][clientDate.getDay()];
      console.log('Using date:', todayDateString, 'dayOfWeek:', dayOfWeek, '(from client:', !!payload.clientDate, ')');

      // Calculate week number by calendar week (Mon–Sun), same as app main screen
      const planStartDate = new Date(activePlan.start_date);
      const getMondayOfWeek = (d: Date) => {
        const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const day = x.getDay();
        const daysToMonday = day === 0 ? 6 : day - 1;
        x.setDate(x.getDate() - daysToMonday);
        return x;
      };
      const referenceMonday = getMondayOfWeek(planStartDate);
      const thisWeekMonday = getMondayOfWeek(clientDate);
      const daysBetween = Math.floor((thisWeekMonday.getTime() - referenceMonday.getTime()) / (1000 * 60 * 60 * 24));
      const weekNumber = Math.min(8, Math.max(1, Math.floor(daysBetween / 7) + 1));
      console.log('Calculated week number:', weekNumber, '(calendar week) from start date:', activePlan.start_date);

      // Generate a single workout_instance_id for ALL entries in this generation
      // This groups them together so queries can get the most recent generation
      const { randomUUID } = await import('crypto');
      const workoutInstanceId = randomUUID();
      console.log('Generated workout_instance_id:', workoutInstanceId, 'for this Train Now generation');

      const workoutEntries = [];
      const entryAlternativesMap = new Map<number, Array<{
        alternative_exercise_id: string;
        note: string;
        position: number;
      }>>();

      // Step 5.1: Fetch user's workout history for these exercises to copy previous weights/reps
      console.log('Fetching user workout history for smart weight recommendations...');
      const exerciseIdsToCheck = workout.exercises.map(ex => {
        const exerciseSlug = slugify(ex.exercise);
        return exerciseIds[exerciseSlug];
      }).filter(Boolean);

      // Get the most recent workout_entries for each exercise directly (no need to join with sets)
      // Just look at the latest weight/reps that were set in workout_entries
      const { data: workoutHistory, error: historyError } = await supabase
        .from('workout_entries')
        .select('exercise_id, weight, reps, created_at')
        .eq('workout_plan_id', activePlan.id)
        .in('exercise_id', exerciseIdsToCheck)
        .order('created_at', { ascending: false });

      if (historyError) {
        console.warn('Could not fetch workout history:', historyError);
      }

      console.log('Workout history:', JSON.stringify(workoutHistory, null, 2));

      // Create a map of exercise_id -> most recent weight/reps
      const exerciseHistoryMap = new Map<string, { weight: string | null; reps: string }>();
      if (workoutHistory && workoutHistory.length > 0) {
        workoutHistory.forEach((entry: any) => {
          const exerciseId = entry.exercise_id;
          // Only keep the first (most recent) entry for each exercise
          if (!exerciseHistoryMap.has(exerciseId)) {
            exerciseHistoryMap.set(exerciseId, {
              weight: entry.weight,
              reps: entry.reps
            });
          }
        });
        console.log(`Found workout history for ${exerciseHistoryMap.size} exercises`);
      } else {
        console.log('No workout history found - using AI-generated weights');
      }

      for (let i = 0; i < workout.exercises.length; i++) {
        const exercise = workout.exercises[i];
        const exerciseSlug = slugify(exercise.exercise);
        const exerciseId = exerciseIds[exerciseSlug];

        // Get first alternative as streak exercise (if available)
        const streakExerciseId = exercise.similar_alternative_exercises.length > 0
          ? exerciseIds[slugify(exercise.similar_alternative_exercises[0])]
          : exerciseId; // Use same exercise as fallback

        // Check if user has done this exercise before and use their last weight/reps
        const history = exerciseHistoryMap.get(exerciseId);
        const finalWeight = history?.weight || exercise.weight || null;
        const finalReps = history?.reps || exercise.reps; // reps is already a string in both history and exercise

        if (history) {
          console.log(`Using historical data for ${exercise.exercise}: weight=${history.weight}, reps=${history.reps}`);
        }

        workoutEntries.push({
          workout_plan_id: activePlan.id,
          week_number: weekNumber, // Use calculated week number based on plan start date
          day_name: 'Train Now',
          day: dayOfWeek,
          date: todayDateString,
          exercise_id: exerciseId,
          sets: exercise.sets,
          reps: finalReps, // Use historical reps if available
          weight: finalWeight, // Use historical weight if available
          time: exercise.time || null,
          notes: exercise.notes || null,
          streak_exercise_id: streakExerciseId,
          streak_exercise_notes: exercise.similar_alternative_exercises.length > 0
            ? exercise.similar_alternative_exercises_notes[0]
            : null,
          is_adjusted: false,
          adjustment_reason: null,
          preset_id: null, // No preset reference for generated workouts
          position: i + 1, // Position starts at 1, increments for each exercise
          workout_instance_id: workoutInstanceId, // All entries share same instance ID
        });

        // Collect alternatives for this entry (skip first one as it's the streak exercise)
        const alternatives = [];
        for (let altIndex = 1; altIndex < exercise.similar_alternative_exercises.length; altIndex++) {
          const altExerciseName = exercise.similar_alternative_exercises[altIndex];
          const altSlug = slugify(altExerciseName);
          const altExerciseId = exerciseIds[altSlug];
          const altNote = exercise.similar_alternative_exercises_notes[altIndex] || `Alternative ${altIndex}`;

          alternatives.push({
            alternative_exercise_id: altExerciseId,
            note: altNote,
            position: altIndex, // Position starts at 1 (since we skipped index 0)
          });
        }

        if (alternatives.length > 0) {
          entryAlternativesMap.set(i, alternatives);
        }
      }

      // Insert workout entries and get their IDs
      const { data: insertedEntries, error: entriesError } = await supabase
        .from('workout_entries')
        .insert(workoutEntries)
        .select('id');

      if (entriesError || !insertedEntries) {
        throw new Error(`Failed to insert workout entries: ${entriesError?.message}`);
      }

      console.log('Workout entries created:', insertedEntries.length);

      // Step 6: Insert alternative exercises for each entry
      const allAlternatives: Array<{
        workout_entry_id: string;
        alternative_exercise_id: string;
        note: string;
        position: number;
      }> = [];

      insertedEntries.forEach((insertedEntry, index) => {
        const alternatives = entryAlternativesMap.get(index);
        if (alternatives) {
          alternatives.forEach(alt => {
            allAlternatives.push({
              workout_entry_id: insertedEntry.id,
              alternative_exercise_id: alt.alternative_exercise_id,
              note: alt.note,
              position: alt.position,
            });
          });
        }
      });

      if (allAlternatives.length > 0) {
        const { error: altError } = await supabase
          .from('workout_entry_alternatives')
          .insert(allAlternatives);

        if (altError) {
          console.error('Failed to insert alternatives:', altError);
          // Don't throw - alternatives are optional
        } else {
          console.log('Alternative exercises added:', allAlternatives.length);
        }
      }

      // Step 7: Mark request as completed
      const { error: updateError } = await supabase
        .from('single_workout_requests')
        .update({
          status: 'completed',
          generated_preset_id: null, // No longer using presets
          completed_at: new Date().toISOString(),
          current_step: 2,
          total_steps: 2,
          step_description: 'Workout generation complete!',
        })
        .eq('request_id', payload.requestId);

      if (updateError) {
        console.error('Failed to update request status:', updateError);
      }

      console.log('✅ Single workout generation completed for request:', payload.requestId);

      return {
        success: true,
        workoutPlanId: activePlan.id,
        workoutName: workout.name,
        entriesCreated: insertedEntries.length,
      };

    } catch (error) {
      console.error('❌ Error in single workout generation:', error);

      // Mark request as failed
      await supabase
        .from('single_workout_requests')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          completed_at: new Date().toISOString(),
        })
        .eq('request_id', payload.requestId);

      throw error;
    }
  }
});
