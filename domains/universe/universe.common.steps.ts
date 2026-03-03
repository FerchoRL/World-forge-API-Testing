import { Given } from "@cucumber/cucumber";

import {
  createUniverseContext,
  type UniverseContext,
} from "./universe.context";

export let ctx: UniverseContext;

Given("the Universe service is available", async () => {
  ctx = await createUniverseContext();
});
