import { AfterAll, Then, When } from "@cucumber/cucumber";
import { expect, type APIResponse } from "@playwright/test";

import { ctx } from "../character.common.steps";
import { disposeCharacterContext } from "../character.context";
import type { ChangeCharacterStatusResponse, CharacterDTO, CreateCharacterResponse } from "../character.api";
import { buildValidCharacterPayload } from "../create/character-create.payload";
import { closeDatabase } from "../../../utils/db/mongo/mongo.client";

let response: APIResponse;
let responseBody: CharacterDTO;
let sourceCharacterId: string;
let responseErrorMessage: string | undefined;

// -----------------------------
// WHEN steps
// -----------------------------

When("I request to change character status from {string} to {string}", async function (from: string, to: string) {
    // Normaliza estados para comparar/transicionar de forma consistente.
    const fromStatus = from.trim().toUpperCase();
    const toStatus = to.trim().toUpperCase() as "ACTIVE" | "ARCHIVED";

    // Crea el character base en el estado inicial más cercano al escenario.
    const initialCreateStatus = fromStatus === "DRAFT" ? undefined : "ACTIVE";

    const createResponse = await ctx.characterApi.createCharacter(
        buildValidCharacterPayload({
            status: initialCreateStatus,
        })
    );
    const createStatusCode = createResponse.status();
    expect(createStatusCode).toBe(201);

    const created = (await createResponse.json()) as CreateCharacterResponse;
    sourceCharacterId = created.character.id;
    let characterBeforeChange: CharacterDTO = created.character;

    // Si el escenario parte de ARCHIVED, primero hacemos esa transición.
    let archiveStatusCode: number | undefined;
    if (fromStatus === "ARCHIVED") {
        const archiveResponse = await ctx.characterApi.changeCharacterStatus(sourceCharacterId, {
            status: "ARCHIVED",
        });
        archiveStatusCode = archiveResponse.status();
        expect(archiveStatusCode).toBe(200);
        const archivedBody = (await archiveResponse.json()) as ChangeCharacterStatusResponse;
        characterBeforeChange = archivedBody.character;
    }

    // Acción bajo prueba: cambio final de estado solicitado.
    response = await ctx.characterApi.changeCharacterStatus(sourceCharacterId, {
        status: toStatus,
    });

    const responseRawBody = (await response.json()) as ChangeCharacterStatusResponse;
    responseBody = responseRawBody.character;
    const characterAfterChange: CharacterDTO = responseBody;

    await this.attach(
        JSON.stringify(
            {
                characterBeforeChange,
                characterAfterChange,
            },
            null,
            2
        ),
        "application/json"
    );
});

When(/^I request to change character status using raw id "([^"]*)" to "([^"]*)"$/, async function (id: string, to: string) {
    // Traduce token especial a un id en blanco real para probar validación.
    const resolvedId = id === "__SPACE__" ? " " : id;
    const toStatus = to.trim().toUpperCase() as "ACTIVE" | "ARCHIVED";

    // Ejecuta request directo para controlar exactamente el id enviado en la URL.
    response = await ctx.apiContext.patch(`/characters/${resolvedId}/status`, {
        data: {
            status: toStatus,
        },
    });

    const rawBody = (await response.json()) as { error?: string };
    responseErrorMessage = rawBody?.error;

    await this.attach(
        JSON.stringify(
            {
                request: {
                    id: resolvedId,
                    status: toStatus,
                },
                response: {
                    statusCode: response.status(),
                    body: rawBody,
                },
            },
            null,
            2
        ),
        "application/json"
    );
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
