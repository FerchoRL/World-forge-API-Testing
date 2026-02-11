import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let db: Db;

export async function getDatabase(): Promise<Db> {

  if (!client) {
    client = new MongoClient(process.env.MONGO_URI as string);
    await client.connect();
    console.log("Connected to MongoDB from automation");
    db = client.db(process.env.MONGO_DB_NAME);
  }

  return db;
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
  }
}