import type { KbNote } from "@/content/types";
import { e2eWhatIsE2eTesting } from "./e2e-what-is-e2e-testing";
import { e2eTestPyramid } from "./e2e-test-pyramid";
import { e2eTestScenariosAndCases } from "./e2e-test-scenarios-and-cases";
import { e2eTestArchitecture } from "./e2e-test-architecture";
import { e2eTestDataManagement } from "./e2e-test-data-management";
import { e2eTestEnvironments } from "./e2e-test-environments";
import { e2eAssertions } from "./e2e-assertions";
import { e2eTestIsolation } from "./e2e-test-isolation";
import { e2eFlakyTests } from "./e2e-flaky-tests";
import { e2eDebuggingFailures } from "./e2e-debugging-failures";

export const fundamentalsNotes: KbNote[] = [
  e2eWhatIsE2eTesting,
  e2eTestPyramid,
  e2eTestScenariosAndCases,
  e2eTestArchitecture,
  e2eTestDataManagement,
  e2eTestEnvironments,
  e2eAssertions,
  e2eTestIsolation,
  e2eFlakyTests,
  e2eDebuggingFailures,
];
