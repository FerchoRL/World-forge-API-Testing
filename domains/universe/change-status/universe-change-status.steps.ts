import { AfterAll, Then, When } from "@cucumber/cucumber";
import { expect, type APIResponse } from "@playwright/test";

import { ctx } from "../universe.common.steps";
import { disposeUniverseContext } from "../universe.context";
import type { ChangeUniverseStatusResponse, UniverseDTO } from "../universe.api";
import {
	createUniverseWithNameAndStatus,
	createUniverseWithStatus,
	transitionUniverseToArchived,
} from "../universe.test-helpers";
import { closeDatabase } from "../../../utils/db/mongo/mongo.client";
import { attachJsonReport } from "../../../utils/reporting/cucumber-report.helper";

let response: APIResponse;
let responseBody: UniverseDTO;
let sourceUniverseId: string;
let responseErrorMessage: string | undefined;
let archivedUniverseName: string;
let conflictingActiveUniverseId: string;

// -----------------------------
// WHEN steps
// -----------------------------

When("I request to change universe status from {string} to {string}", async function (from: string, to: string) {
	// Limpiamos estado compartido para evitar arrastre entre escenarios.
	responseErrorMessage = undefined;
	// Normaliza estados para comparar/transicionar de forma consistente.
	const fromStatus = from.trim().toUpperCase();
	const toStatus = to.trim().toUpperCase() as "ACTIVE" | "ARCHIVED";

	// Creamos el universe inicial según el estado de origen del escenario.
	const initialCreateStatus = fromStatus === "DRAFT" ? "DRAFT" : "ACTIVE";
	let universeBeforeChange: UniverseDTO = await createUniverseWithStatus(ctx.universeApi, initialCreateStatus);
	sourceUniverseId = universeBeforeChange.id;

	// Si el escenario parte de ARCHIVED, primero hacemos esa transición.
	if (fromStatus === "ARCHIVED") {
		universeBeforeChange = await transitionUniverseToArchived(ctx.universeApi, sourceUniverseId);
	}

	// Acción bajo prueba: cambio final de estado solicitado.
	response = await ctx.universeApi.changeUniverseStatus(sourceUniverseId, {
		status: toStatus,
	});

	const responseRawBody = (await response.json()) as {
		universe?: UniverseDTO;
		error?: string;
	};

	let universeAfterChange: UniverseDTO | undefined;
	if (response.status() >= 400) {
		responseErrorMessage = responseRawBody.error;
	} else {
		responseBody = (responseRawBody as ChangeUniverseStatusResponse).universe;
		universeAfterChange = responseBody;
	}

	await attachJsonReport(this, {
		universeBeforeChange,
		universeAfterChange,
		responseErrorMessage,
	});
});

When("I request to change universe status using id {string}", async function (id: string) {
	// Soportamos id en blanco para TC04.
	const resolvedId = id === "__SPACE__" ? " " : id;

	// Si el id está en blanco validamos solo path; para ids no existentes enviamos payload mínimo.
	if (!resolvedId.trim()) {
		response = await ctx.apiContext.patch(`/universes/${resolvedId}/status`);
	} else {
		response = await ctx.universeApi.changeUniverseStatus(resolvedId, {
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

When(/^I request to change universe status using invalid status "([^"]*)"$/, async function (invalidStatus: string) {
	// Creamos un universe válido antes de probar status inválido.
	const createdUniverse = await createUniverseWithStatus(ctx.universeApi, "ACTIVE");
	sourceUniverseId = createdUniverse.id;

	// Enviamos el status inválido directo para validar la regla del endpoint.
	response = await ctx.universeApi.changeUniverseStatus(sourceUniverseId, {
		status: invalidStatus as any,
	});

	const rawBody = (await response.json()) as { error?: string };
	responseErrorMessage = rawBody?.error;

	await attachJsonReport(this, {
		universeBeforeChange: createdUniverse,
		request: {
			id: sourceUniverseId,
			status: invalidStatus,
		},
		response: {
			statusCode: response.status(),
			body: rawBody,
		},
	});
});

When("I archive a new active universe for reactivation conflict validation", async function () {
	// Creamos el universe base en ACTIVE.
	const activeUniverse = await createUniverseWithStatus(ctx.universeApi, "ACTIVE");
	sourceUniverseId = activeUniverse.id;
	archivedUniverseName = activeUniverse.name;

	// Lo llevamos a ARCHIVED para intentar reactivarlo después.
	const archivedUniverse = await transitionUniverseToArchived(ctx.universeApi, sourceUniverseId);

	await attachJsonReport(this, {
		activeUniverse,
		archivedUniverse,
	});
});

When("I create a new active universe with the archived universe name", async function () {
	// Creamos un segundo ACTIVE con el mismo nombre para provocar conflicto de unicidad.
	const conflictingUniverse = await createUniverseWithNameAndStatus(
		ctx.universeApi,
		archivedUniverseName,
		"ACTIVE"
	);
	conflictingActiveUniverseId = conflictingUniverse.id;

	await attachJsonReport(this, {
		archivedUniverseName,
		conflictingUniverse,
	});
});

When("I request to reactivate the archived universe", async function () {
	// Intentamos ARCHIVED -> ACTIVE sobre el universe original.
	response = await ctx.universeApi.changeUniverseStatus(sourceUniverseId, {
		status: "ACTIVE",
	});

	const rawBody = (await response.json()) as { error?: string };
	responseErrorMessage = rawBody?.error;

	await attachJsonReport(this, {
		archivedUniverseId: sourceUniverseId,
		archivedUniverseName,
		conflictingActiveUniverseId,
		response: {
			statusCode: response.status(),
			body: rawBody,
		},
	});
});

// -----------------------------
// THEN steps
// -----------------------------


Then("the change universe status request should return status code {int}", async function (expectedStatusCode: number) {
	expect(response.status()).toBe(expectedStatusCode);
});

Then("the changed universe status should be {word}", async function (expectedStatus: string) {
	expect(responseBody.status).toBe(expectedStatus);
});

Then("the changed universe id should match the source universe id", async function () {
	expect(responseBody.id).toBe(sourceUniverseId);
});

Then(/^the change universe status error should be "([^"]*)"$/, async function (expectedError: string) {
	expect(responseErrorMessage).toBe(expectedError);
});

AfterAll(async () => {
	await disposeUniverseContext(ctx);
	await closeDatabase();
});
