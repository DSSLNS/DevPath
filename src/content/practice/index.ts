import { fundamentalsChallenges } from "./fundamentals";
import { arraysChallenges } from "./arrays";
import { objectsChallenges } from "./objects";
import { functionsChallenges } from "./functions";
import { asyncChallenges } from "./async";
import { domChallenges } from "./dom";
import { apiChallenges } from "./api";
import { debuggingChallenges } from "./debugging";
import { reactChallenges } from "./react";
import { cypressChallenges } from "./cypress";
import { playwrightChallenges } from "./playwright";
import type { Challenge } from "@/content/types";

export const challenges: Challenge[] = [
  ...fundamentalsChallenges,
  ...arraysChallenges,
  ...objectsChallenges,
  ...functionsChallenges,
  ...asyncChallenges,
  ...domChallenges,
  ...apiChallenges,
  ...debuggingChallenges,
  ...reactChallenges,
  ...cypressChallenges,
  ...playwrightChallenges,
];
