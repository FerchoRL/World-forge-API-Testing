import type {
  ChangeUniverseStatusResponse,
  CreateUniverseInput,
  CreateUniverseResponse,
  UniverseApi,
  UniverseDTO,
} from "./universe.api";
import type { UniverseId } from "./universe.types";
import { buildValidUniversePayload } from "./create/universe-create.payload";

export async function createUniverseWithValidPayload(
  universeApi: UniverseApi
): Promise<UniverseId> {
  const payload = buildValidUniversePayload();
  const response = await universeApi.createUniverse(payload);
  const body = (await response.json()) as CreateUniverseResponse;
  return body.universe.id;
}

export async function createUniverseWithStatus(
  universeApi: UniverseApi,
  status: CreateUniverseInput["status"]
): Promise<UniverseDTO> {
  const payload = buildValidUniversePayload({ status });

  const response = await universeApi.createUniverse(payload);
  const body = (await response.json()) as CreateUniverseResponse;
  return body.universe;
}

export async function createUniverseWithNameAndStatus(
  universeApi: UniverseApi,
  name: string,
  status: CreateUniverseInput["status"]
): Promise<UniverseDTO> {
  const payload = buildValidUniversePayload({ name, status });

  const response = await universeApi.createUniverse(payload);
  const body = (await response.json()) as CreateUniverseResponse;
  return body.universe;
}

export async function transitionUniverseToArchived(
  universeApi: UniverseApi,
  universeId: UniverseId
): Promise<UniverseDTO> {
  const response = await universeApi.changeUniverseStatus(universeId, {
    status: "ARCHIVED",
  });

  const body = (await response.json()) as ChangeUniverseStatusResponse;
  return body.universe;
}
