import type { KbNote } from "@/content/types";
import { cyArchitecture } from "./cy-architecture";
import { cyAssertions } from "./cy-assertions";
import { cyCheckUncheck } from "./cy-check-uncheck";
import { cyClear } from "./cy-clear";
import { cyClick } from "./cy-click";
import { cyContains } from "./cy-contains";
import { cyDescribeIt } from "./cy-describe-it";
import { cyFindWithin } from "./cy-find-within";
import { cyGet } from "./cy-get";
import { cyInstallationConfig } from "./cy-installation-config";
import { cySelect } from "./cy-select";
import { cySpecStructure } from "./cy-spec-structure";
import { cyType } from "./cy-type";
import { cyVisit } from "./cy-visit";

export const cypressNotes: KbNote[] = [
  cyArchitecture,
  cyAssertions,
  cyCheckUncheck,
  cyClear,
  cyClick,
  cyContains,
  cyDescribeIt,
  cyFindWithin,
  cyGet,
  cyInstallationConfig,
  cySelect,
  cySpecStructure,
  cyType,
  cyVisit,
];
