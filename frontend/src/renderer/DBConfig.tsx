export const DB_NAME = 'animeDB';
export const STORE_NAME = 'favorites';
export const DB_VERSION = 1;

export const DBConfig = {
  name: DB_NAME,
  version: DB_VERSION,
  objectStoresMeta: [
    {
      store: STORE_NAME,
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'episode', keypath: 'episode', options: { unique: false } },
      ],
    },
  ],
};
