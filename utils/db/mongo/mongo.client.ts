import { MongoClient, Db } from "mongodb";
import { getMongoConfig } from "./mongo.config";

let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * ===============================
 * Mongo Client (Automation Layer)
 * ===============================
 *
 * Infraestructura compartida para conexión a MongoDB.
 *
 * - Implementa conexión lazy (singleton).
 * - Usa configuración centralizada.
 * - No contiene lógica de dominio.
 */

export async function getDatabase(): Promise<Db> {
  if (db) return db;

  const { uri, dbName } = getMongoConfig();

  client = new MongoClient(uri);
  await client.connect();

  db = client.db(dbName);
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
