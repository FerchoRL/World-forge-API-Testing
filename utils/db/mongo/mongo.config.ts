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
  dbName?: string; // Optional: puede estar incluido en la URI
};

export function getMongoConfig(): MongoConfig {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME;

  if (!uri) throw new Error("MONGO_URI is not defined");
  
  // MONGO_DB_NAME es opcional si la URI ya incluye el nombre de la DB
  // Ejemplo: mongodb+srv://user:pass@cluster.mongodb.net/dbname
  return { uri, dbName };
}
