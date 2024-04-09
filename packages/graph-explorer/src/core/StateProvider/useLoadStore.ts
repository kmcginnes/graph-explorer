import { useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { configurationAtom, isStoreLoadedAtom } from "./configuration";
import { loadedAtoms } from "./localForageEffect";
import { schemaAtom } from "./schema";
import { userStylingAtom } from "./userPreferences";

const useLoadStore = () => {
  const setIsLoaded = useSetAtom(isStoreLoadedAtom);
  // Force read at least one time to recover the state from the IndexedDB
  useAtomValue(configurationAtom);
  useAtomValue(userStylingAtom);
  useAtomValue(schemaAtom);
  useEffect(() => {
    const fn = (): NodeJS.Timeout | undefined => {
      // Add here all atoms that are needed to be loaded
      // from the store before start using the application
      if (
        loadedAtoms.has("configuration") &&
        loadedAtoms.has("user-styling") &&
        loadedAtoms.has("schema")
      ) {
        setIsLoaded(true);
        return;
      }
      return setTimeout(fn, 100);
    };
    const timeout = fn();
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [setIsLoaded]);
};

export default useLoadStore;
