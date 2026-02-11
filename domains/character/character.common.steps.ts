import { Given } from "@cucumber/cucumber";

import {
  createCharacterContext,
  type CharacterContext,
} from "./character.context";
// Contexto compartido entre steps del dominio Character.
// Se inicializa una vez en el Given y se reutiliza en escenarios posteriores.
// ⚠️ OJO: el ctx debe ser compartido
// así que lo exportamos
export let ctx: CharacterContext;

Given("the Character service is available", async () => {
  ctx = await createCharacterContext();
});
