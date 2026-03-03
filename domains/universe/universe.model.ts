import type { Status } from "../../contracts/common/status";
import type { UniverseId } from "./universe.types";

export type UniverseModel = {
  id: UniverseId;
  name: string;
  status: Status;
  premise: string;
  rules?: string[];
  notes?: string;
};
