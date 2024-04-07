import { useAtomCallback, RESET } from "jotai/utils";
import {
  edgesAtom,
  edgesFilteredIdsAtom,
  edgesHiddenIdsAtom,
  edgesOutOfFocusIdsAtom,
  edgesSelectedIdsAtom,
  edgesTypesFilteredAtom,
} from "./edges";
import {
  nodesAtom,
  nodesFilteredIdsAtom,
  nodesHiddenIdsAtom,
  nodesOutOfFocusIdsAtom,
  nodesSelectedIdsAtom,
  nodesTypesFilteredAtom,
} from "./nodes";
import { useCallback } from "react";

const useResetState = () => {
  return useAtomCallback(
    useCallback((_get, set): void => {
      set(nodesAtom, RESET);
      set(nodesSelectedIdsAtom, RESET);
      set(nodesHiddenIdsAtom, RESET);
      set(nodesOutOfFocusIdsAtom, RESET);
      set(nodesFilteredIdsAtom, RESET);
      set(nodesTypesFilteredAtom, RESET);
      set(edgesAtom, RESET);
      set(edgesSelectedIdsAtom, RESET);
      set(edgesHiddenIdsAtom, RESET);
      set(edgesOutOfFocusIdsAtom, RESET);
      set(edgesFilteredIdsAtom, RESET);
      set(edgesTypesFilteredAtom, RESET);
    }, [])
  );
};

export default useResetState;
