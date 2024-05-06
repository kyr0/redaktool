import { useStore } from "@nanostores/react";
import { atom, type WritableAtom } from "nanostores";
import { getStorage } from "simply-persist-sync";
import { getNamespacedKey } from "./utils";

export interface PersistentAtom<Value = any> extends WritableAtom<Value> {
  name: string;
  initial: Value;
  hasBeenRead: boolean;
}

export const usePersistentStore = <T = any>(atom: PersistentAtom<T>) => {
  return useStore(atom);
};

export function persistentAtomPerPage(name: string, initial = undefined) {
  const storage = getStorage("local");
  const a = atom(initial) as PersistentAtom;

  const set = a.set;
  a.set = (newValue) => {
    storage.set(getNamespacedKey(name), newValue);
    set(newValue);
  };

  const get = a.get;
  a.get = () => {
    let v = get();
    if (!a.hasBeenRead) {
      v = storage.get(getNamespacedKey(name), initial);
      set(v);
      a.hasBeenRead = true;
    }
    return v;
  };
  a.name = getNamespacedKey(name);
  a.initial = initial;

  return a;
}
