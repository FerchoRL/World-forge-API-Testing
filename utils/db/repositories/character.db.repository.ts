import { getDatabase } from "../mongo/mongo.client";
import { CharacterMongoDocument } from "../mongo/mongo.types";


export async function findCharacterById(id: string) {
  const db = await getDatabase();

  return db
    .collection<CharacterMongoDocument>("characters")
    .findOne({ _id: id });
}

export async function findCharactersByStatus(status: string) {
  const db = await getDatabase();
  return db.collection("characters").find({ status }).toArray();
}
