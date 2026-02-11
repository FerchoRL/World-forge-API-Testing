/**
 * ===============================
 * Mongo Config
 * ===============================
 *
 * Centraliza la lectura y validación
 * de variables de entorno relacionadas a Mongo.
 */

export type MongoConfig = {
  uri: string;
  dbName: string;
};

export function getMongoConfig(): MongoConfig {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME;

  if (!uri) throw new Error("MONGO_URI is not defined");
  if (!dbName) throw new Error("MONGO_DB_NAME is not defined");

  return { uri, dbName };
}
