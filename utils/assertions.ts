import { expect, APIResponse } from "@playwright/test";

export async function expectInternalServerError(response: APIResponse) {
  expect(response.status()).toBe(500);

  const body = await response.json();
}
