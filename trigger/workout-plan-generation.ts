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

🧩 7. PROGRAM STRUCTURE

Duration	Exercises per Session
45 min	4
60 min	6
90 min	9

Week 1 = Unique workouts

Weeks 2–8 = Repeat Week 1

📅 8. DAY SORTING RULE

✅ Always sort training days chronologically (e.g., Monday → Wednesday → Friday).

❌ Never use Friday → Monday → Wednesday.

⏱ 9. TIME STRUCTURE

Each exercise = 4 sets

Each set ≈ 60 seconds

Each exercise ≈ 10 minutes

📌 10. PROGRAMMING RULES

Reps = filled for Week 1 only.

Reps = blank for Weeks 2–8.

Weight = must be set appropriately based on exercise type and user level (see Baseline Weights section 6b). For dumbbells, specify weight per hand (e.g., "2kg" means 2kg in each hand). For bodyweight exercises, leave blank or use "Body".

Time = used only for isometric core exercises.

✅ Allowed Isometric Core Exercises

Exercise	Time	Reps	Notes
Plank	30 sec	—	Keep core tight
Side Plank	30 sec	—	Keep core tight
Bird Dog Hold	30 sec	—	Keep core tight
Plank Shoulder Taps	30 sec	—	Keep core tight

📄 11. JSON OUTPUT FORMAT
Add a "Day Name" column before "Day". Populate it with the session type based on the split (e.g., Push, Pull, Legs, Full-Body, Upper, Lower, Chest, Back, Shoulders, Arms, Core, Hypertrophy, Recovery). This column is required for every entry.
\`\`\`json
{
  "dayName": "Push",
  "day": "Monday", 
  "exercise": "Bench Press",
  "similar_alternative_exercises": ["Incline Bench Press (Barbell)", "Smith Machine Bench Press"],
  "similar_alternative_exercises_notes": ["Targets upper chest more. Use if bench is occupied.", "Fixed bar path for safety. Good for training to failure without spotter."],
  "sets": 4,
  "reps": "8–12",
  "weight": "40kg",
  "time": "30 sec",
  "notes": "Tempo 3-1-1, full ROM",
  "streakExercise": "Push-Ups — Legs Elevated",
  "streakExerciseNotes": "Tempo 2-1-1"
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

🧗‍♂️ 12. STREAK DAYS (HOME SUBSTITUTIONS)

Max 3 per 8-week plan.

Must match: number of exercises, biomechanics, and target muscles.

Use only home-available equipment.

✅ Streak Exercise fields must always be filled.

❌ Never duplicate streak exercises within a single day.

✅ NEW RULE – Streak Equipment Check

❗ Streak Exercise Equipment must never include gear the client did not explicitly list in their home questionnaire.

✅ If the client has no home equipment, all streak exercises must use bodyweight only.

❌ Do not assume access to bands, dumbbells, kettlebells, benches, or chairs.

✅ Always validate streak substitutions against the client’s declared equipment.

📆 13. TRAINING DAY RULES

Frequency	Rule / Example
1×/week	Any day
2×/week	At least 1 rest day between sessions
3×/week	Prefer 1 rest day between (e.g., Mon–Wed–Fri)
4×/week	2 on → 1 rest → 2 on
5×/week	Rest days only on Wednesday and Sunday
6×/week	3 on → 1 rest → 3 on
7×/week	No rest days

➡️ Legs = min 2 days apart.

➡️ Deadlift/Squat = follow spacing rules.

➡️ Once set, training days stay fixed unless requested.

🔄 14. SPECIAL CASE RULES

✅ SPLIT PROTOCOL BY FREQUENCY

Frequency	Rule
1–2×/week	Full-Body only
3×/week	Push / Pull / Legs (default)
✅ Exception: Full-Body allowed only if client requests
4×/week	Push / Pull / Legs / Full-Body
5×/week	Upper / Lower / Full-Body / Hypertrophy / Recovery
6×/week	Push / Pull / Legs / Push / Pull / Legs
7×/week	Chest / Back / Shoulders / Legs / Arms / Core / Full-Body

🎯 50% FOCUS RULE (Full-Body Days Only)

May apply to only one full-body day per week.

All other full-body days must be well-balanced.

🔁 Full-Body Day Rule
Each full-body session must include:
✅ One Push • ✅ One Pull • ✅ One Leg • ✅ One Core
→ All movements should be compound, unless limited by injury.

✅ VALIDATION RULE

Each full-body session must be programmatically checked: Push, Pull, Leg, Core present.

⚠️ If any category is missing, the plan is invalid and must be restructured.

✅ VALIDATION CHECKPOINTS (MUST BE ENFORCED)

❗ Deadlift ↔ Squat = 1+ full rest day in between.

❗ Deadlift → Deadlift = 2+ days apart.

❗ Squat → Squat = 2+ days apart.
Fallback if spacing not possible:

✅ Use machine-based leg exercise instead of deadlift/squat.

❌ Never schedule back-to-back CNS compound lifts.

❌ Never ignore spacing in favor of split or volume.

✅ LEG TRAINING

Always include leg work unless client opts out.

Respect DOMS spacing and fallback rules.

✅ DEADLIFT RULE

All barbell deadlifts = Leg/Glute, not Back.

✅ LEG CURL RULE

Treat Leg Curl (Lying) as isotonic.

Fill Reps, leave Time blank.

✅ STREAK EXERCISE UNIQUENESS

Streak exercises must be unique per session.

❌ Never repeat within the same workout.

✅ NO WEEKLY REPEATS

No exercise should appear more than once per week.

✅ BACK-DAY LOGIC

Back = pulldowns, pull-ups, rows, cable pulls.

❌ Back Extensions = glute/hamstring, not back.

✅ BACK FOCUS (4×/week plans)

Exactly 12 back-focused exercises, spread across 3 of the 4 training days.

✅ LOW-SORENESS CLIENTS

Emphasize: machines, core, posterior chain, control.

Avoid eccentric overload early in the week.

🏋️ EXERCISE POOL – APPROVED LIST

This section contains the complete allowed list of exercises to choose from when generating the gym training plan. Below it is the list of streak exercises.

<EXERCISE POOL>
${exercisePool.filter(exercise => exercise.workout_location === "gym").map(exercise => exercise.exercise_name).join('\n')}
</EXERCISE POOL>


<STREAK EXERCISE POOL>
${exercisePool.filter(exercise => exercise.workout_location === "home").map(exercise => exercise.exercise_name).join('\n')}
</STREAK EXERCISE POOL>

Finnaly provide a summary of the workout plan for the user to read and understand the plan, make it encouraging and explain how the exercises are going to help the user achieve their exercise goals.
`

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 300000, // 5 minutes timeout for gpt-5 with reasoning
  maxRetries: 2,
});

// Create Supabase client with service role key for admin access
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Define the workout entry schema based on the CSV format
const WorkoutEntry = z.object({
    dayName: z.string(), // Required: Push, Pull, Legs, Full-Body, etc.
    day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]), // Required: Monday, Tuesday, etc.
    exercise: z.string(), // Required: Exercise name from the exercise pool
    similar_alternative_exercises: z.array(z.string()), // Required: 2-3 alternative exercises
    similar_alternative_exercises_notes: z.array(z.string()), // Required: Brief notes for each alternative
    sets: z.number(), // Required: Always 4 per prompt rules
    reps: z.string(), // Required: Always filled with ranges like "8-12"
    weight: z.string(), // Must be set appropriately based on exercise type and user level (see Baseline Weights section 6b)
    time: z.string(), // Only filled for isometric core exercises - make it required but can be empty
    notes: z.string(), // Optional additional notes - make it required but can be empty
    streakExercise: z.string(), // Required: Always filled per prompt rules from the streak exercise pool
    streakExerciseNotes: z.string(), // Optional streak notes - make it required but can be empty
  });

const WorkoutResponse = z.object({
  entries: z.array(WorkoutEntry),
  summary: z.string(),

});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
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

function addData(workoutPlan: z.infer<typeof WorkoutResponse>) {
  const today = new Date();
  const nextMonday = new Date(today);

  // Find next Monday
  const daysUntilMonday = (8 - today.getDay()) % 7;
  nextMonday.setDate(today.getDate() + daysUntilMonday);

  // Set start date to next Monday
  const startDate = nextMonday;

  // Add dates to each entry based on the day of week
  const entriesWithDates = workoutPlan.entries.map((entry) => {
    const dayIndex = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].indexOf(entry.day);
    const workoutDate = new Date(startDate);
    workoutDate.setDate(startDate.getDate() + dayIndex);

    return {
      ...entry,
      date: workoutDate.toISOString().split('T')[0], // YYYY-MM-DD format for PostgreSQL
      exercise_id: slugify(entry.exercise),
      streakExercise_id: slugify(entry.streakExercise)
    };
  });

  return {
    summary: workoutPlan.summary,
    entries: entriesWithDates
  };
}

// Helper function to update progress in database
async function updateProgress(requestId: string, currentStep: number, totalSteps: number, stepDescription: string, exercisesTotal: number = 0, exercisesCompleted: number = 0) {
  try {
    await supabase
      .from('workout_plan_requests')
      .update({
        current_step: currentStep,
        total_steps: totalSteps,
        step_description: stepDescription,
        exercises_total: exercisesTotal,
        exercises_completed: exercisesCompleted
      })
      .eq('request_id', requestId);
    
    console.log(`Progress updated: Step ${currentStep}/${totalSteps} - ${stepDescription} (Exercises: ${exercisesCompleted}/${exercisesTotal})`);
  } catch (error) {
    console.error('Failed to update progress:', error);
  }
}

export const generateWorkoutPlanTask = task({
  id: "generate-workout-plan",
  run: async (payload: { userProfile: string, userId: string, requestId: string }) => {
    try {
      console.log('Starting background workout plan generation for request:', payload.requestId);

      // Update progress: Step 1 - Generating workout plan
      await updateProgress(payload.requestId, 1, 3, 'Generating your personalized workout plan...');

      // Step 1: Generate workout plan
      const response = await openai.responses.parse({
        model: 'gpt-5',
        input: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: payload.userProfile
          }
        ],
        reasoning: {
          effort: "medium"
        },
        text: {
          format: zodTextFormat(WorkoutResponse, 'workout_plan'),
        },
      });

      const workoutPlan = response.output_parsed;
      if (!workoutPlan) {
        throw new Error('Failed to parse workout plan');
      }

      const workoutPlanWithData = addData(workoutPlan);
      console.log('Workout plan generated, now ensuring exercises exist...');

      // Update progress: Step 2 - Creating workout structure
      await updateProgress(payload.requestId, 2, 3, 'Creating your workout structure...');

      // Step 2: Extract unique exercises by SLUG and ensure they exist in database
      const uniqueExerciseSlugs = new Set<string>();
      const exerciseNameToSlug: Record<string, string> = {};

      for (const entry of workoutPlanWithData.entries) {
        const exerciseSlug = slugify(entry.exercise);
        const streakSlug = slugify(entry.streakExercise);

        uniqueExerciseSlugs.add(exerciseSlug);
        uniqueExerciseSlugs.add(streakSlug);

        exerciseNameToSlug[entry.exercise] = exerciseSlug;
        exerciseNameToSlug[entry.streakExercise] = streakSlug;

        // Also add alternative exercises to the pool
        for (const altExercise of entry.similar_alternative_exercises) {
          const altSlug = slugify(altExercise);
          uniqueExerciseSlugs.add(altSlug);
          exerciseNameToSlug[altExercise] = altSlug;
        }
      }

      console.log('Found', uniqueExerciseSlugs.size, 'unique exercise slugs');
      
      // Update progress: Step 3 - Starting exercise profile generation
      await updateProgress(payload.requestId, 3, 3, 'Generating detailed exercise profiles...', uniqueExerciseSlugs.size, 0);

      // Step 3: Ensure all exercises exist (process sequentially but with concurrency at task level)
      const exerciseIds: Record<string, string> = {};
      console.log('Ensuring all exercises exist...');

      // Process exercises sequentially (Trigger.dev handles concurrency at task level)
      let exercisesCompleted = 0;
      for (const slug of uniqueExerciseSlugs) {
        // Find any exercise name that maps to this slug
        const exerciseName = Object.keys(exerciseNameToSlug).find(name =>
          exerciseNameToSlug[name] === slug
        )!;

        console.log('Processing exercise slug:', slug, 'with name:', exerciseName);
        const exerciseId = await ensureExerciseExists(exerciseName);
        console.log('Exercise ID:', exerciseId, 'for exercise name:', exerciseName);
        exerciseIds[slug] = exerciseId; // Store by slug, not exercise name
        
        // Update progress after each exercise is processed
        exercisesCompleted++;
        await updateProgress(
          payload.requestId, 
          3, 
          3, 
          `Generating exercise profiles... (${exercisesCompleted}/${uniqueExerciseSlugs.size})`, 
          uniqueExerciseSlugs.size, 
          exercisesCompleted
        );
      }

      console.log('All exercises ensured, now inserting workout plan...');

      console.log('Workout plan with data:', JSON.stringify(workoutPlanWithData, null, 2));

      // Step 4: Insert workout plan
      const { data: planData, error: planError } = await supabase
        .from('workout_plans')
        .insert({
          user_id: payload.userId,
          summary: workoutPlanWithData.summary,
          start_date: new Date().toISOString().split('T')[0], // Today
          status: 'active'
        })
        .select()
        .single();

      if (planError) throw planError;

      // Step 5: Insert workout entries for all 8 weeks
      const allEntries = [];
      const entryAlternativesMap: Map<number, Array<{
        alternative_exercise_id: string;
        note: string;
        position: number;
      }>> = new Map();
      
      // Calculate start date for the workout plan (next Monday from today)
      const today = new Date();
      const nextMonday = new Date(today);
      const daysUntilMonday = (8 - today.getDay()) % 7;
      nextMonday.setDate(today.getDate() + daysUntilMonday);
      
      let entryIndex = 0;
      // Track position per day within each week
      const dayPositionMap = new Map<string, number>();
      // Track workout_instance_id per day per week (one instance ID per workout day)
      const workoutInstanceMap = new Map<string, string>();

      for (let week = 1; week <= 8; week++) {
        for (const entry of workoutPlanWithData.entries) {
          // Calculate the proper date for this week and day
          const dayIndex = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].indexOf(entry.day);
          const weekStartDate = new Date(nextMonday);
          weekStartDate.setDate(nextMonday.getDate() + ((week - 1) * 7)); // Add weeks
          weekStartDate.setDate(weekStartDate.getDate() + dayIndex); // Add days within week
          
          const workoutDate = weekStartDate.toISOString().split('T')[0]; // YYYY-MM-DD format

          // Calculate position for this day within this week
          // Use entry.day (Monday, Tuesday, etc.) for consistent grouping instead of dayName
          // This ensures all exercises on the same calendar day share the same instance ID
          // even if the AI generates slightly different dayName values
          const dayKey = `${week}-${entry.day}`;
          const currentPosition = (dayPositionMap.get(dayKey) || 0) + 1;
          dayPositionMap.set(dayKey, currentPosition);

          // Get or create workout_instance_id for this specific day
          // All exercises in the same day/week share the same instance ID
          if (!workoutInstanceMap.has(dayKey)) {
            const { randomUUID } = await import('crypto');
            workoutInstanceMap.set(dayKey, randomUUID());
          }
          const workoutInstanceId = workoutInstanceMap.get(dayKey);

          allEntries.push({
            workout_plan_id: planData.id,
            week_number: week,
            day_name: entry.dayName,
            day: entry.day.toLowerCase(),
            date: workoutDate, // Use calculated date for this specific week
            exercise_id: exerciseIds[slugify(entry.exercise)],
            sets: entry.sets,
            reps: entry.reps,
            weight: entry.weight,
            time: entry.time,
            notes: entry.notes,
            streak_exercise_id: exerciseIds[slugify(entry.streakExercise)],
            streak_exercise_notes: entry.streakExerciseNotes,
            is_adjusted: false,
            position: currentPosition, // Position within this day/week combination
            workout_instance_id: workoutInstanceId, // ✅ All exercises in same day share this ID
          });

          // Store alternative exercises for this entry using the array index
          const alternatives = entry.similar_alternative_exercises.map((altExercise, altIndex) => ({
            alternative_exercise_id: exerciseIds[slugify(altExercise)],
            note: entry.similar_alternative_exercises_notes[altIndex],
            position: altIndex + 1
          }));

          if (alternatives.length > 0) {
            entryAlternativesMap.set(entryIndex, alternatives);
          }

          entryIndex++;
        }
      }

      // Insert workout entries and get their IDs back
      const { data: insertedEntries, error: entriesError } = await supabase
        .from('workout_entries')
        .insert(allEntries)
        .select('id');

      if (entriesError) throw entriesError;

      // Build the alternatives array using the correct workout_entry_id
      const alternativesToInsert: Array<{
        workout_entry_id: string;
        alternative_exercise_id: string;
        note: string;
        position: number;
      }> = [];
      insertedEntries.forEach((insertedEntry, index) => {
        const alternatives = entryAlternativesMap.get(index);
        if (alternatives) {
          alternatives.forEach(alt => {
            alternativesToInsert.push({
              workout_entry_id: insertedEntry.id,
              alternative_exercise_id: alt.alternative_exercise_id,
              note: alt.note,
              position: alt.position
            });
          });
        }
      });

      // Insert alternative exercises into junction table
      if (alternativesToInsert.length > 0) {
        const { error: alternativesError } = await supabase
          .from('workout_entry_alternatives')
          .insert(alternativesToInsert);

        if (alternativesError) throw alternativesError;
      }

      // Step 6: Update status to completed - this will trigger real-time notification
      await supabase
        .from('workout_plan_requests')
        .update({
          status: 'completed',
          workout_plan_id: planData.id,
          completed_at: new Date().toISOString(),
          current_step: 3,
          total_steps: 3,
          step_description: 'Your personalized workout plan is ready!',
          exercises_total: uniqueExerciseSlugs.size,
          exercises_completed: uniqueExerciseSlugs.size
        })
        .eq('request_id', payload.requestId);

      console.log('Workout plan generation completed successfully for request:', payload.requestId);

      return {
        success: true,
        workoutPlanId: planData.id,
        requestId: payload.requestId
      };

    } catch (error) {
      console.error('Error in background processing:', error);

      // Update status to failed with progress info
      await supabase
        .from('workout_plan_requests')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : String(error),
          completed_at: new Date().toISOString(),
          step_description: 'Generation failed. Please try again.'
        })
        .eq('request_id', payload.requestId);

      throw error; // Re-throw to trigger the outer catch
    }
  },
});