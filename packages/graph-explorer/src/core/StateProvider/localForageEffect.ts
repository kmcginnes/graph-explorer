import * as localForage from "localforage";
import { atomWithStorage } from "jotai/utils";
import { AsyncStorage } from "jotai/vanilla/utils/atomWithStorage";

localForage.config({
  name: "ge",
  version: 1.0,
  storeName: "graph-explorer",
});

// The first time that the atom is loaded from the store,
// mark as loaded to avoid side effect on asynchronous events
// that can load the atom state before it is recovered from the store
export const loadedAtoms: Set<string> = new Set();

// const localForageEffect =
//   <T>(): AtomEffect<T> =>
//   ({ setSelf, onSet, trigger, node }) => {
//     // If there's a persisted value - set it on load
//     const loadPersisted = async () => {
//       const savedValue = await localForage.getItem(node.key);

//       if (savedValue != null) {
//         setSelf(savedValue as T | DefaultValue);
//         return;
//       }
//     };

//     if (trigger === "get") {
//       loadPersisted().then(() => {
//         loadedAtoms.add(node.key);
//       });
//     }

//     // Subscribe to state changes and persist them to localForage
//     onSet((newValue: T, _: T | DefaultValue, isReset: boolean) => {
//       isReset
//         ? localForage.removeItem(node.key)
//         : localForage.setItem(node.key, newValue);
//     });
//   };

export function createLocalForageJotaiStorage<T>(): AsyncStorage<T> {
  return {
    getItem: async (key: string, initialValue: T) => {
      return (await localForage.getItem<T>(key)) ?? initialValue;
    },
    setItem: async (key: string, newValue: T) => {
      await localForage.setItem<T>(key, newValue);
    },
    removeItem: async (key: string) => {
      await localForage.removeItem(key);
    },
  };
}

export function atomWithLocalForageStorage<T>(key: string, initialValue: T) {
  return atomWithStorage<T>(key, initialValue, createLocalForageJotaiStorage());
}
