import { createClient } from "@supabase/supabase-js";
import { task } from "@trigger.dev/sdk";
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Create Supabase client with service role key for admin access
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

const equipmentList = [
  {
    "equipment_slug": "back-extension-machine",
    "equipment_name": "Back Extension Machine"
  },
  {
    "equipment_slug": "barbell",
    "equipment_name": "Barbell"
  },
  {
    "equipment_slug": "bench",
    "equipment_name": "Bench"
  },
  {
    "equipment_slug": "bench-press",
    "equipment_name": "Bench Press"
  },
  {
    "equipment_slug": "body-weight",
    "equipment_name": "Body Weight"
  },
  {
    "equipment_slug": "cable",
    "equipment_name": "Cable"
  },
  {
    "equipment_slug": "calf-raise-machine",
    "equipment_name": "Calf Raise Machine"
  },
  {
    "equipment_slug": "chair",
    "equipment_name": "Chair"
  },
  {
    "equipment_slug": "chest-fly-machine",
    "equipment_name": "Chest Fly Machine"
  },
  {
    "equipment_slug": "decline-bench",
    "equipment_name": "Decline Bench"
  },
  {
    "equipment_slug": "decline-bench-press",
    "equipment_name": "Decline Bench Press"
  },
  {
    "equipment_slug": "dips-machine",
    "equipment_name": "Dips Machine"
  },
  {
    "equipment_slug": "door-frame",
    "equipment_name": "Door Frame"
  },
  {
    "equipment_slug": "dumbbell",
    "equipment_name": "Dumbbell"
  },
  {
    "equipment_slug": "dumbbells",
    "equipment_name": "Dumbbells"
  },
  {
    "equipment_slug": "ez-bar",
    "equipment_name": "Ez Bar"
  },
  {
    "equipment_slug": "filled-bag",
    "equipment_name": "Filled Bag"
  },
  {
    "equipment_slug": "hack-squat-machine",
    "equipment_name": "Hack Squat Machine"
  },
  {
    "equipment_slug": "incline-bench-press",
    "equipment_name": "Incline Bench Press"
  },
  {
    "equipment_slug": "incline-chest-machine",
    "equipment_name": "Incline Chest Machine"
  },
  {
    "equipment_slug": "kettlebell",
    "equipment_name": "Kettlebell"
  },
  {
    "equipment_slug": "kettlebells",
    "equipment_name": "Kettlebells"
  },
  {
    "equipment_slug": "knee-extension-machine",
    "equipment_name": "Knee Extension Machine"
  },
  {
    "equipment_slug": "knee-flexion-machine",
    "equipment_name": "Knee Flexion Machine"
  },
  {
    "equipment_slug": "leg-press-machine",
    "equipment_name": "Leg Press Machine"
  },
  {
    "equipment_slug": "pull-up-bar",
    "equipment_name": "Pull Up Bar"
  },
  {
    "equipment_slug": "pull-up-machine",
    "equipment_name": "Pull Up Machine"
  },
  {
    "equipment_slug": "resistance-band",
    "equipment_name": "Resistance Band"
  },
  {
    "equipment_slug": "seated-calf-raise-machine",
    "equipment_name": "Seated Calf Raise Machine"
  },
  {
    "equipment_slug": "shoulder-abduction-machine",
    "equipment_name": "Shoulder Abduction Machine"
  },
  {
    "equipment_slug": "shoulder-press-machine",
    "equipment_name": "Shoulder Press Machine"
  },
  {
    "equipment_slug": "sliders",
    "equipment_name": "Sliders"
  },
  {
    "equipment_slug": "smith-machine",
    "equipment_name": "Smith Machine"
  },
  {
    "equipment_slug": "squat-rack",
    "equipment_name": "Squat Rack"
  },
  {
    "equipment_slug": "suspension-trainer",
    "equipment_name": "Suspension Trainer"
  },
  {
    "equipment_slug": "swiss-ball",
    "equipment_name": "Swiss Ball"
  },
  {
    "equipment_slug": "towel",
    "equipment_name": "Towel"
  },
  {
    "equipment_slug": "trap-bar",
    "equipment_name": "Trap Bar"
  },
  {
    "equipment_slug": "weight-plate",
    "equipment_name": "Weight Plate"
  },
  {
    "equipment_slug": "weight-plates",
    "equipment_name": "Weight Plates"
  }
]




// Exercise profile schema - matches your Supabase function structure
const ExerciseProfileSchema = z.object({
  exercise_name: z.string(),
  exercise_icon_description: z.string(),
  exercise_instructions: z.string(),
  exercise_video_description: z.string(),
  equipment_text: z.string(),
  equipment_groups: z.object({
    groups: z.array(z.array(z.string())),
  }),
  exercise_location: z.array(z.enum(["gym", "home"])).default([]),
  rep_limitations_progression_rules: z.string(),
  progression_by_client_feedback: z.string(),
  pain_injury_protocol: z.string(),
  special_rules_by_location: z.string(),
  trainer_notes: z.string(),
  muscle_categories: z.array(z.string()),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export const generateExerciseProfileTask = task({
  id: "generate-exercise-profile",
  queue: {
    concurrencyLimit: 2, // Process up to 2 exercise profiles at a time
  },
  run: async (payload: { exerciseName: string }) => {
    const exerciseId = slugify(payload.exerciseName);

    try {
      // First check if exercise already exists using slug
      const { data: existingExercise, error: checkError } = await supabase
        .from('exercises')
        .select('id, name')
        .eq('slug', exerciseId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingExercise) {
        console.log(`Exercise ${payload.exerciseName} already exists with ID: ${exerciseId}`);
        return { exercise_id: existingExercise.id, created: false };
      }

      console.log(`Generating profile for new exercise: ${payload.exerciseName}`);

      // Generate exercise profile with OpenAI using your system prompt


      const systemPrompt = `✅ SYSTEM PROMPT FOR GENERATING AN EXERCISE PROFILE (GYM & HOME) – EXTENDED VERSION 🔧 INSTRUCTION FOR THE EXERCISE GENERATOR:

      Based on the exercise name and the exercise location (gym, home), generate a complete exercise profile that includes the points below and fully follows these rules.
      
      Exercise Name
      
      Write the official name of the exercise + the standard rep range.
      
      Rep Range Rules:
      
      Barbell exercises: 6–10 reps
      
      Exception: core barbell exercises (e.g., barbell oblique twists, barbell roll-outs) → 8–15 reps
      
      Dumbbell exercises & TRX (suspension trainers): 8–12 reps
      
      Machine, cable-based exercises & core bodyweight exercises: 10–15 reps
      
      Bodyweight compound exercises (difficult ones like pull-ups, chin-ups, pike push-ups): 6–10 reps
      
      Rule: Always stay within the given rep range.
      
      Example: Barbell Squat (6–10 reps) – perform only 6, 7, 8, 9, or 10 reps.
      
      Exercise Icon
      
      Short description of the icon shown in the before workout screen.
      
      Must clearly indicate the exercise movement.
      
      Example: Silhouette of a person holding a barbell across the shoulders in the bottom position of a squat.
      
      Exercise Screenshot
      
      Short description of a single frame taken from the exercise video.
      
      Must show a key execution moment.
      
      Example: User at the lowest position of a squat, barbell on shoulders, thighs parallel to the floor.
      
      Exercise Instructions
      
      Use the same structure below, but tailor the instructions to the specific exercise (e.g., squat, barbell row, deadlift) so the client fully understands.
      
      Rule: Mark each sentence with ordinal numbers in ascending order (1st, 2nd, 3rd, ...).
      
      Format for exercise_instructions field: Start directly with the numbered sentences (1st, 2nd, 3rd, …), followed by the "✅ Key Form Tips:" line(s). Do not include any heading or preface.
      
      Examples:
      
      A) Barbell Squat (6–10 reps)
      
      (1st) Set bar slightly below shoulder height, grasp just outside shoulder width, place across upper back, unrack, step back to hip‑width stance with slight toe‑out. (2nd) Brace: big breath, ribs over pelvis, light glute squeeze, chest proud without over‑arching. (3rd) Initiate by pushing hips back slightly while bending knees to track over toes; keep whole foot rooted. (4th) Descend under control to at least parallel (or deepest position with neutral spine/heels down). (5th) Drive up through midfoot/heel, extend knees/hips together, exhale near top, re‑brace between reps.
      
      ✅ Key Form Tips: Knees over toes; breathe‑brace each rep; avoid heel lift, excessive lean, losing brace, bouncing.
      
      B) Incline Dumbbell Press (8–12 reps)
      
      (1st) Set bench ~30–45°, bring DBs to thighs, lie back and kick into start above upper chest. (2nd) Feet planted; gently retract/depress shoulder blades; ribs stacked (moderate—not exaggerated—arch). (3rd) Inhale and lower DBs toward upper chest on a controlled path, forearms vertical, elbows ~30–60°. (4th) Pause lightly just above chest; wrists neutral; maintain scapular set. (5th) Exhale and press up on a slight inward arc to near‑lockout without slamming; re‑brace. (6th) Finish safely by returning DBs to thighs; avoid dropping.
      
      C) Bent-Over Row (DB or KB) — Underhand Grip, Unilateral (8–12 reps per side)
      
      (1st) Set up one knee/hand on bench (or split stance with hand brace), hinge torso ~30–45° from horizontal, spine neutral. (2nd) Hold DB/KB with underhand grip (palm up) in working hand; arm hangs under shoulder. (3rd) Inhale and brace (ribs over pelvis); shoulders away from ears; stable base. (4th) Pull by depressing/retracting shoulder, then drive elbow toward hip; forearm near vertical; load close to side. (5th) Brief pause near lower ribs/upper abdomen without twisting/shrugging; exhale and lower under control to straight arm. (6th) Maintain torso angle and neutral spine; complete all reps on one side, then switch.
      
   
      Equipment Groups (CRITICAL - Read Carefully!)
      
      You MUST generate the equipment_groups field as a structured object that represents which equipment is needed for this exercise.
      
      🔧 STRUCTURE EXPLANATION:
      
      equipment_groups = {
        "groups": [
          ["equipment1", "equipment2"],  // Group 1: User needs ONE of these (OR relationship)
          ["equipment3"],                 // Group 2: User needs this (required)
          ["equipment4", "equipment5"]    // Group 3: User needs ONE of these (OR relationship)
        ]
      }
      
      🎯 LOGIC RULES:
      
      1. Within a group (inner array): Items are ALTERNATIVES (OR) - user needs only ONE item from that group
      2. Between groups (outer array): Groups are ALL REQUIRED (AND) - user needs at least one item from EACH group
      
      📋 EQUIPMENT SLUGS - You MUST use ONLY these exact slugs:
      
      ${equipmentList.map(eq => `"${eq.equipment_slug}"`).join(', ')}
      
      ✅ EXAMPLES:
      
      Example 1: Dumbbell Bench Press
      - Needs: dumbbells AND bench (both required)
      equipment_groups: {
        "groups": [
          ["dumbbells"],
          ["bench"]
        ]
      }
      
      Example 2: Kettlebell OR Dumbbell Goblet Squat  
      - Needs: kettlebell OR dumbbell (one of them)
      equipment_groups: {
        "groups": [
          ["kettlebells", "dumbbells"]
        ]
      }
      
      Example 3: Push-ups (bodyweight only)
      equipment_groups: {
        "groups": [
          ["body-weight"]
        ]
      }
      
      Example 4: Seated Dumbbell Press with Chair or Bench
      - Needs: dumbbells AND (chair OR bench)
      equipment_groups: {
        "groups": [
          ["dumbbells"],
          ["chair", "bench"]
        ]
      }
      
      Example 5: Barbell Squat
      - Needs: barbell AND squat-rack AND weight-plates
      equipment_groups: {
        "groups": [
          ["barbell"],
          ["squat-rack"],
          ["weight-plates"]
        ]
      }
      
      Example 6: Band Shoulder Press
      - Needs: resistance band only
      equipment_groups: {
        "groups": [
          ["resistance-band"]
        ]
      }
      
      ⚠️ IMPORTANT NOTES:
      
      - ALWAYS use the exact equipment slugs from the list above (lowercase, hyphenated)
      - For barbell exercises, include both "barbell" AND "weight-plates" as separate groups
      - For exercises with alternatives (e.g., "DB or KB"), put them in the SAME group
      - For exercises requiring multiple items (e.g., "dumbbells and bench"), put them in SEPARATE groups
      - For bodyweight exercises, use: {"groups": [["body-weight"]]}
      - Machine exercises typically only need the machine itself as one group


      # Required Equipment Text
      
      List all required equipment with notes.
      
      For barbell: Adding weight means +X kg per side of the bar.
      
      For dumbbell: Adding weight means +X kg per side (that means X kg heavier dumbbells on each side).
      
      For cable and machine-based exercises: Adding weight means +X kg per weight stack.
      
      Example: Bodyweight (home) / Barbell with weights (gym).
      
      # Workout Location
      
      Fill in the exercise location array with one or both of the following:
      ["gym"]
      ["home"]
      ["gym", "home"]
      
      
      Rep Limitations & Progression Rules
      
      Always stay within rep range.
      
      Adaptation phase (beginner): use 12–15 reps.
      
      Progression:
      
      Increase reps → max range.
      
      Add weight (per barbell side, dumbbell side, or machine stack).
      
      If no weight available: use slower tempo, pulses, deeper range.
      
      Progression by Client Feedback (Easy / Medium / Hard)
      
      EASY: Increase reps; if at max, add weight.
      
      MEDIUM: Same as Easy, but smaller weight jumps.
      
      HARD: Reduce reps (not below minimum); reduce weight if needed.
      
      Pain / Injury Protocol
      
      When discomfort or pain occurs during an exercise, follow this step-by-step correction sequence:
      
      Global Note
      
      For sharp pain, numbness, or instability, stop immediately.
      
      A) Standing Leg Exercises (Squats, Split Squats, Lunges, Bulgarian Split Squats)
      
      (Excludes machines/cables, posterior-chain–dominant lifts, and moving variations like alternating/walking lunges for the heel-elevation cue.) Joints: knee, lumbar spine, ankle
      
      Technical adjustments
      
      Knee pain: • Bilateral → elevate both heels (small plates). • Unilateral → elevate front heel (e.g., lunge, Bulgarian split squat).
      
      Lumbar spine: brace core, control tempo, reduce ROM, avoid excessive lumbar extension.
      
      Ankle: check mobility, reduce ROM, slightly elevate heels (plate/towel).
      
      If pain persists
      
      Knees: further reduce ROM.
      
      Lumbar: reduce depth and tempo.
      
      Ankles: tweak stance width or limit forward knee travel.
      
      Substitute (isometric/isolation/machine)
      
      Knee → wall sits, leg press.
      
      Lumbar → knee extension (machine).
      
      Ankle → hip thrust or glute bridge.
      
      If pain continues End the exercise and exclude it from the session.
      
      B) Horizontal Pushing (Bench Press, DB Press, Push-Ups)
      
      Joints: shoulder, elbow, wrist, lumbar spine
      
      Technical adjustments
      
      Shoulder: scapula set (bench: retract/depress; push-ups: allow natural protraction at top); elbows ~30–60°; avoid excessive bottom stretch; bar to mid–lower chest; forearms vertical; slight external rotation.
      
      Elbow: vertical wrist-elbow line; avoid aggressive lockout; controlled tempo; if medial pain → slightly wider grip + slower eccentric.
      
      Wrist: neutral wrists (bar in palm), use neutral-grip DB/football bar/handles.
      
      Lumbar: ribs down; moderate, not exaggerated, arch; feet planted but reduce leg drive if provocative; plank-solid push-ups (no hip sag).
      
      If pain persists
      
      Shoulder: reduce ROM (blocks/floor press), lighter load, slower tempo, try DB or slight decline.
      
      Elbow: shorter ROM (no hard lockout), neutral grip, lighten load/frequency.
      
      Wrist: neutral-grip implements, elevate hands (push-ups), lighten load.
      
      Lumbar: minimize arch/leg drive; feet on bench or elevated push-ups.
      
      Substitute
      
      Shoulder → neutral-grip machine chest press, floor press, cable chest press (scapular plane), isometric push-up hold.
      
      Elbow → pec deck, cable fly (soft elbows), isometric chest squeeze.
      
      Wrist → DB neutral-grip floor press, cable fly with D-handles, pec deck, push-up handles.
      
      Lumbar → machine chest press (back support), wall/elevated push-ups, floor press.
      
      Stop if symptoms persist.
      
      C) Standing & Sitting Push (Overhead Press Variants)
      
      Joints: shoulder, elbow, wrist, lumbar spine
      
      Technical adjustments
      
      Shoulder: press in scapular plane; bar path slightly in front of face → head “through” at top; allow natural upward rotation; forearms vertical at bottom; moderate grip width.
      
      Elbow: wrists stacked over elbows; elbows slightly in front; avoid hyperextension; neutral-grip if irritated.
      
      Wrist: neutral (bar in heel of palm); consider DB/neutral handles or light wraps.
      
      Lumbar: brace/glutes on; avoid rib flare/excessive arch; standing: hip-width or split stance; seated: upright back support; strict (no leg drive).
      
      If pain persists
      
      Shoulder: reduce ROM (stop at ear level/pins), lighter load, slower tempo, try DB or slight incline.
      
      Elbow: shorten ROM, neutral grip, reduce volume.
      
      Wrist: neutral-grip, lighten load; handles/parallettes.
      
      Lumbar: back-supported seated press, half-kneeling landmine, reduce load/tempo.
      
      Substitute
      
      Shoulder → landmine press, machine shoulder press (neutral handles), DB press in scapular plane, mid-range iso hold.
      
      Elbow → machine press, slight-incline cable press (neutral grip), isometric press against pins.
      
      Wrist → neutral-grip DB/landmine/machine.
      
      Lumbar → seated back-supported press, half-kneeling landmine, high-incline press or DB floor press.
      
      Stop if symptoms persist.
      
      D) Hip Hinge (Deadlift, RDL, Trap-Bar, Good Morning, Pull-Through)
      
      Joints: lumbar spine, knee, ankle
      
      Technical adjustments
      
      Lumbar: brace first; neutral spine (no flexion or hyperextension at lockout); hinge from hips; lats on; bar close over midfoot; firm, flat shoes.
      
      Knee: soft knees without squatting the hinge; shins near vertical; stance hip-width, slight toe-out; track knees over toes.
      
      Ankle: tripod foot, midfoot pressure; minimize dorsiflexion (send hips back); adjust toe-out/stance for pinch.
      
      If pain persists
      
      Lumbar: reduce ROM (blocks/rack pulls, high-handle trap-bar), lighter load, slower tempo/pauses; consider sumo/trap-bar.
      
      Knee: shift to more hip-dominant (RDL), keep shins vertical, reduce depth/load.
      
      Ankle: tweak stance/toe angle, ensure heels down, limit forward knee travel, shorten ROM.
      
      Substitute
      
      Lumbar → hip thrust, glute bridge, neutral-spine back extension, cable pull-through, light mid-range iso RDL.
      
      Knee → hip thrust/glute bridge, back extension, hamstring curl, DB RDL to blocks.
      
      Ankle → hip thrust/glute bridge, back extension, hamstring curl, pull-through.
      
      Stop if symptoms persist.
      
      E) Static Hinge Rows (BB/DB Bent-Over Row, Pendlay, Chest-Supported Variants)
      
      Joints: lumbar spine, knee, ankle
      
      Technical adjustments
      
      Lumbar: brace, neutral spine; set sustainable torso angle (~30–45°; Pendlay: more parallel); hinge hips back; lats on; load close; move at shoulder, not torso.
      
      Knee: unlock 10–20°; shins near vertical; knees track over toes; hip-width stance.
      
      Ankle: tripod foot, midfoot-to-heel pressure; firm, flat shoes; tweak toe-out/stance for comfort.
      
      Path/tempo: pull to lower ribs/upper abdomen (lats) or mid-chest (upper back) without shrug; elbows ~20–45°; 2–3 s eccentric; no bounce.
      
      If pain persists
      
      Lumbar: reduce load; slightly more upright torso; shorten ROM; slow tempo; straps to maintain form; use bench/chest support or 1-arm supported row.
      
      Knee: add a bit more knee flexion; widen stance; elevate load (blocks/pins).
      
      Ankle: narrow stance; micro-adjust toe angle; ensure heels planted; reduce hinge depth; split-stance supported DB row.
      
      Substitute
      
      Lumbar → chest-supported incline DB row, seal row, machine row (chest pad), seated cable row, half-kneeling single-arm cable row.
      
      Knee → seated cable row, machine row (chest support), prone seal row, 1-arm bench-supported DB row.
      
      Ankle → seated cable row, machine row (chest pad), inverted row with comfortable knee bend.
      
      Stop if symptoms persist.
      
      F) Leg Press & Variations (45° Sled, Horizontal/Seated, Vertical, Single-Leg)
      
      Joints: lumbar spine, knee, ankle
      
      Technical adjustments
      
      Lumbar: back flat to pad; avoid posterior pelvic tilt (“butt wink”); limit depth; place feet higher to reduce hip flexion; brace lightly.
      
      Knee: track over toes; no valgus/varus; no hard lockout; stance hip- to shoulder-width with slight toe-out; controlled bottom.
      
      Ankle: heels planted; push midfoot/heel; if pinch → feet higher, slight toe-out or wider stance; avoid toe-pushing.
      
      If pain persists
      
      Lumbar: lighten load; limit ROM; slower eccentric + brief pause; increase backrest angle; feet higher.
      
      Knee: reduce ROM (keep >~90° if needed); slightly wider stance/toe-out; single-leg presses; light band above knees for abduction cue.
      
      Ankle: feet higher; adjust toe angle; keep heels down; narrow stance if outer ankle stressed; reduce depth.
      
      Substitute
      
      Lumbar → belt squat, wall sit, hack/pendulum with shallow ROM/back support, knee extension machine.
      
      Knee → wall sit, knee extension (short-arc), partial-ROM sled press, Spanish squat.
      
      Ankle → knee extension, belt squat, wall sit, high-feet leg press (re-trial) with reduced depth.
      
      Stop if symptoms persist.
      
      G) Core — Prone & Supine (Isotonic & Isometric)
      
      Joints: lumbar spine, cervical spine, hip
      
      Technical adjustments
      
      Lumbar: brace; ribs over pelvis; anti-extension drills → posterior pelvic tilt (PPT); supine → low back lightly pressed; flexion drills → move from thoracic, keep lumbar near neutral; shorten lever (bend knees); slow tempo/shallow ROM.
      
      Cervical: neutral neck + light chin tuck; supine → don’t pull on head, gaze up; prone/planks → gaze slightly ahead of hands; pad under head if needed.
      
      Hip: for leg raises/lowerings → start 90/90, knees bent, maintain PPT; if pinch → reduce hip flexion, add slight ER/abduction, limit depth; in planks → light glute squeeze to avoid hip sag.
      
      If pain persists
      
      Lumbar: further reduce ROM; one-heel down for leg lowers; incline plank; slow tempo with micro-pauses.
      
      Cervical: switch to McGill curl-up; gentle head support; reduce reps/tempo.
      
      Hip: shorten lever (tuck), alternate limbs (dead bug), avoid long-lever hollows/leg raises.
      
      Substitute
      
      Lumbar → dead bug (heel taps), hook-lying PPT holds, incline forearm plank, hollow tuck hold.
      
      Cervical → McGill curl-up (isometric), supine 90/90 breathing with chin tuck, dead bug with head supported, PPT holds.
      
      Hip → bridge/glute bridge iso, wall-supported 90/90 dead bug, bent-knee leg-lower partials, bench-height prone plank.
      
      Stop if symptoms persist.
      
      H) Core — Standing / Tall-Kneeling / Half-Kneeling (Isotonic & Isometric: Pallof, Chops, Lifts, Press-Outs, Carries)
      
      Joints: lumbar spine, cervical spine, knees
      
      Technical adjustments
      
      Lumbar: brace; ribs over pelvis; prefer chest-height anti-rotation before high/low chops; shorten lever (closer to anchor, shorter press-out); stance cues— • Standing: shoulder-width or slight split; glutes lightly on. • Tall-kneeling: hips over knees; neutral pelvis. • Half-kneeling: 90/90; down-knee glute on; square hips. Avoid lumbar extension/side-bend/rotation.
      
      Cervical: neutral neck, chin tuck, eyes forward; don’t chase the handle with your head; set anchor near sternum if high anchor provokes extension.
      
      Knees: • Standing: soft knees, track over toes. • Tall-kneeling: thick pad; shins vertical; even weight. • Half-kneeling: front knee over midfoot; rear knee padded; stance wide enough for balance; avoid hard lockout.
      
      If pain persists
      
      Lumbar: smaller arc, slower tempo, switch to isometric anti-rotation hold at chest height; widen base; step closer to anchor.
      
      Cervical: deeper chin tuck; fix gaze; anchor to chest height; use anti-rotation press/hold; lighten load.
      
      Knees: more padding; shorter sets; bring front foot in (less flexion); switch to standing split stance if kneeling is provocative; reduce knee bend depth.
      
      Substitute
      
      Lumbar → chest-height anti-rotation hold (standing split/half-kneeling), wall press iso, short-lever press-out, light suitcase carry (ribs/pelvis stacked).
      
      Cervical → tall-kneeling anti-rotation hold with eyes forward, standing press-out at chest height (minimal arm travel), light front-rack carry with neutral gaze.
      
      Knees → standing anti-rotation hold/press, half-kneeling with extra pad & shorter sets, tall-kneeling on soft bench pad; if kneeling intolerable → stay standing.
      
      Stop if symptoms persist.
      
      
      Special Rules by Location
      
      Home: higher reps, progression via tempo, pulses, deeper range.
      
      Gym: progression via reps → weight → difficulty.
      
      Barbell/Dumbbell/Cable: follow weight addition rules from Section 6.
      
      Trainer Notes
      
      Progress order: reps → weight → difficulty.
      
      Always follow injury protocol when pain occurs.

      # Muscle Categories
      Provide a list of muscle categories that the exercise targets.
      The muscle categories are:
      ${[...new Set(exercisePool.map(exercise => exercise.muscle_category))].join(', ')}

      
      📄 JSON OUTPUT FORMAT
      
      Generate the exercise profile in JSON format using the structure below. All fields must be filled as strings.
      
      \`\`\`json
      {
        "exercise_name": "",
        "exercise_icon_description": "",
        "exercise_instructions": "",
        "exercise_video_description": "",
        "equipment_text": "",
        "equipment_groups": {
          "groups": [
            ["equipment1", "equipment2"],
          ]
        },
        "exercise_location": [],
        "rep_limitations_progression_rules": "",
        "progression_by_client_feedback": "",
        "pain_injury_protocol": "",
        "special_rules_by_location": "",
        "trainer_notes": "",
        "muscle_categories": []
      }
      \`\`\`
      `
      
      const response = await openai.responses.parse({
        model: 'gpt-5',
        input: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: payload.exerciseName
          }
        ],
        reasoning: {
          effort: "medium"
        },
        text: {
          format: zodTextFormat(ExerciseProfileSchema, 'exercise_profile'),
        },
      });

      const profile = response.output_parsed;
      if (!profile) {
        throw new Error('Failed to parse exercise profile');
      }

      // Insert the exercise profile into database
      const { data: newExercise, error: insertError } = await supabase
        .from('exercises')
        .insert({
          name: profile.exercise_name,
          slug: exerciseId,
          icon_description: profile.exercise_icon_description,
          instructions: profile.exercise_instructions,
          video_description: profile.exercise_video_description,
          equipment_groups: profile.equipment_groups,
          equipment_text: profile.equipment_text,
          exercise_location: profile.exercise_location,
          rep_limitations_progression_rules: profile.rep_limitations_progression_rules,
          progression_by_client_feedback: profile.progression_by_client_feedback,
          pain_injury_protocol: profile.pain_injury_protocol,
          special_rules_by_location: profile.special_rules_by_location,
          trainer_notes: profile.trainer_notes,
          muscle_categories: profile.muscle_categories,
        })
        .select()
        .single();

      if (insertError) {
        // If it's a duplicate name error, the exercise already exists - fetch the UUID
        if (insertError.code === '23505' && insertError.message.includes('exercises_name_key')) {
          console.log(`Exercise with similar name already exists, fetching UUID for slug: ${exerciseId}`);
          const { data: existingExercise, error: fetchError } = await supabase
            .from('exercises')
            .select('id')
            .eq('slug', exerciseId)
            .single();

          if (fetchError || !existingExercise) {
            throw new Error(`Failed to fetch existing exercise with slug ${exerciseId}: ${fetchError?.message}`);
          }

          return { exercise_id: existingExercise.id, created: false };
        }

        console.error('Database insertion error:', insertError);
        throw new Error(`Failed to insert exercise profile: ${insertError.message}`);
      }

      console.log(`Successfully created exercise profile: ${payload.exerciseName} (${exerciseId})`);

      return { exercise_id: newExercise.id, created: true };

    } catch (error) {
      console.error(`Error generating exercise profile for ${payload.exerciseName}:`, error);
      throw error;
    }
  },
});