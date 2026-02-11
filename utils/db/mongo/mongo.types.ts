export type CharacterMongoDocument = {
  _id: string;
  name: string;
  status: string;
  categories: string[];
  identity: string;
  inspirations: string[];
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
};