import type { KbNote } from "@/content/types";
import { pwActions } from "./pw-actions";
import { pwApiTesting } from "./pw-api-testing";
import { pwAssertions } from "./pw-assertions";
import { pwAutoWaiting } from "./pw-auto-waiting";
import { pwBrowserContextPage } from "./pw-browser-context-page";
import { pwFixtures } from "./pw-fixtures";
import { pwFundamentals } from "./pw-fundamentals";
import { pwGetByLabel } from "./pw-get-by-label";
import { pwGetByRole } from "./pw-get-by-role";
import { pwGetByTestId } from "./pw-get-by-test-id";
import { pwGetByText } from "./pw-get-by-text";
import { pwHooksAuth } from "./pw-hooks-auth";
import { pwLocators } from "./pw-locators";
import { pwNetworkInterception } from "./pw-network-interception";

export const playwrightNotes: KbNote[] = [
  pwActions,
  pwApiTesting,
  pwAssertions,
  pwAutoWaiting,
  pwBrowserContextPage,
  pwFixtures,
  pwFundamentals,
  pwGetByLabel,
  pwGetByRole,
  pwGetByTestId,
  pwGetByText,
  pwHooksAuth,
  pwLocators,
  pwNetworkInterception,
];
