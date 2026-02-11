import { Given } from "@cucumber/cucumber";

import {
  createCharacterContext,
  type CharacterContext,
} from "./character.context";

// ⚠️ OJO: el ctx debe ser compartido
// así que lo exportamos
export let ctx: CharacterContext;

Given("the Character service is available", async () => {
  ctx = await createCharacterContext();
});
