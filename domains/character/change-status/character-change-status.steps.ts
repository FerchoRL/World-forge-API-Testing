import { AfterAll, Then, When } from "@cucumber/cucumber";
import { expect, type APIResponse } from "@playwright/test";

import { ctx } from "../character.common.steps";
import { disposeCharacterContext } from "../character.context";
import type { ChangeCharacterStatusResponse, CharacterDTO } from "../character.api";
import { createCharacterWithStatus, transitionCharacterToArchived } from "../character.test-helpers";
import { closeDatabase } from "../../../utils/db/mongo/mongo.client";
import { attachJsonReport } from "../../../utils/reporting/cucumber-report.helper";

let response: APIResponse;
let responseBody: CharacterDTO;
let sourceCharacterId: string;
let responseErrorMessage: string | undefined;

// -----------------------------
// WHEN steps
// -----------------------------

When("I request to change character status from {string} to {string}", async function (from: string, to: string) {
    // Limpiamos estado compartido para evitar arrastre entre escenarios.
    responseErrorMessage = undefined;
    // Normaliza estados para comparar/transicionar de forma consistente.
    const fromStatus = from.trim().toUpperCase();
    const toStatus = to.trim().toUpperCase() as "ACTIVE" | "ARCHIVED";

    // Creamos el character inicial según el estado de origen del escenario.
    const initialCreateStatus = fromStatus === "DRAFT" ? "DRAFT" : "ACTIVE";
    let characterBeforeChange: CharacterDTO = await createCharacterWithStatus(ctx.characterApi, initialCreateStatus);
    sourceCharacterId = characterBeforeChange.id;

    // Si el escenario parte de ARCHIVED, primero hacemos esa transición.
    if (fromStatus === "ARCHIVED") {
        characterBeforeChange = await transitionCharacterToArchived(ctx.characterApi, sourceCharacterId);
    }

    // Acción bajo prueba: cambio final de estado solicitado.
    response = await ctx.characterApi.changeCharacterStatus(sourceCharacterId, {
        status: toStatus,
    });

    const responseRawBody = (await response.json()) as {
        character?: CharacterDTO;
        error?: string;
    };

    let characterAfterChange: CharacterDTO | undefined;
    if (response.status() >= 400) {
        responseErrorMessage = responseRawBody.error;
    } else {
        responseBody = (responseRawBody as ChangeCharacterStatusResponse).character;
        characterAfterChange = responseBody;
    }

    await attachJsonReport(this, {
        characterBeforeChange,
        characterAfterChange,
        responseErrorMessage,
    });
});

When(/^I request to change character status using id "([^"]*)"$/, async function (id: string) {
    // Soportamos id en blanco para TC04.
    const resolvedId = id === "__SPACE__" ? " " : id;

    // Si el id está en blanco validamos solo path; para ids no existentes enviamos payload mínimo.
    if (!resolvedId.trim()) {
        response = await ctx.apiContext.patch(`/characters/${resolvedId}/status`);
    } else {
        response = await ctx.characterApi.changeCharacterStatus(resolvedId, {
            status: "ACTIVE",
        });
    }

    const rawBody = (await response.json()) as { error?: string };
    responseErrorMessage = rawBody?.error;

    await attachJsonReport(this, {
        request: {
            id: resolvedId,
        },
        response: {
            statusCode: response.status(),
            body: rawBody,
        },
    });
});

When(/^I request to change character status using invalid status "([^"]*)"$/, async function (invalidStatus: string) {
    // Creamos un character válido antes de probar status inválido.
    const createdCharacter = await createCharacterWithStatus(ctx.characterApi, "ACTIVE");
    sourceCharacterId = createdCharacter.id;

    // Enviamos el status inválido directo para validar la regla del endpoint.
    response = await ctx.characterApi.changeCharacterStatus(sourceCharacterId, {
        status: invalidStatus as any,
    });

    const rawBody = (await response.json()) as { error?: string };
    responseErrorMessage = rawBody?.error;

    await attachJsonReport(this, {
        characterBeforeChange: createdCharacter,
        request: {
            id: sourceCharacterId,
            status: invalidStatus,
        },
        response: {
            statusCode: response.status(),
            body: rawBody,
        },
    });
});


// -----------------------------
// THEN steps
// -----------------------------

Then("the change character status request should return status code {int}", async (expectedStatusCode: number) => {
    expect(response.status()).toBe(expectedStatusCode);
});

Then("the changed character status should be {word}", async (expectedStatus: string) => {
    expect(responseBody.status).toBe(expectedStatus);
});

Then("the changed character id should match the source character id", async () => {
    expect(responseBody.id).toBe(sourceCharacterId);
});

Then(/^the change character status error should be "([^"]*)"$/, async (expectedError: string) => {
    expect(responseErrorMessage).toBe(expectedError);
});

AfterAll(async () => {
    await disposeCharacterContext(ctx);
    await closeDatabase();
});
