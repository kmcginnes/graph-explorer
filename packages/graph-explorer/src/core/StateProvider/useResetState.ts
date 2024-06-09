import { RESET, useAtomCallback } from "jotai/utils";
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

export default function useResetState() {
  return useAtomCallback(
    useCallback((get, set) => {
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
}
