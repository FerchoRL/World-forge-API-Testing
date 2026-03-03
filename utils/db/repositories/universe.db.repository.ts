import type { UniverseMongoDocument } from "../../../domains/universe/universe.db";
import type { Status } from "../../../contracts/common/status";
import { getDatabase } from "../mongo/mongo.client";

const COLLECTION_NAME = "universes";

export async function findUniverseById(
  id: string
): Promise<UniverseMongoDocument | null> {
  const db = await getDatabase();

  return db
    .collection<UniverseMongoDocument>(COLLECTION_NAME)
    .findOne({ _id: id });
}
