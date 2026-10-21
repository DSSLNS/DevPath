import type { Project } from "@/content/types";
import { calculator } from "./calculator";
import { formValidation } from "./form-validation";
import { numberGuessingGame } from "./number-guessing-game";
import { todoList } from "./todo-list";

export const projects: Project[] = [calculator, formValidation, numberGuessingGame, todoList].sort((a, b) => a.order - b.order);
