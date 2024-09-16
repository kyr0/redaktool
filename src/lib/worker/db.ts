import Dexie, { type Table } from "dexie";

export interface KeyValue {
  id?: number;
  key?: string;
  value?: string;
}

export class RedakDatabase extends Dexie {
  public keyValues!: Table<KeyValue, number>;

  public constructor() {
    super("RedakDatabase");
    this.version(1).stores({
      keyValues: "++id,key,value",
    });
  }
}

export const db = new RedakDatabase();

export const dbGetValue = async (key: string): Promise<string | undefined> => {
  return new Promise((resolve, reject) => {
    db.transaction("rw", db.keyValues, async () => {
      const records = await db.keyValues.where("key").equals(key).toArray();
      if (records.length === 0) {
        resolve(undefined);
      } else {
        resolve(records[0].value);
      }
    }).catch((e) => {
      reject(e);
    });
  });
};

export const dbSetValue = async (
  key: string,
  value: string,
): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction("rw", db.keyValues, async () => {
      const count = await db.keyValues.where({ key }).count();
      if (count === 0) {
        resolve(await db.keyValues.add({ key, value }));
      } else {
        resolve(await db.keyValues.where({ key }).modify({ value }));
      }
    }).catch((e) => {
      reject(e);
    });
  });
};
