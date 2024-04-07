import { atom } from "jotai";
import { atomWithReset } from "jotai/utils";
import type { Edge } from "../../@types/entities";
import { sanitizeText } from "../../utils";
import { activeConfigurationAtom } from "./configuration";
import isDefaultValue from "./isDefaultValue";
import { schemaAtom, SchemaInference } from "./schema";

export type Edges = Array<Edge>;

export const edgesAtom = atomWithReset<Edges>([]);

export const edgesSelector = atom(
  get => {
    return get(edgesAtom);
  },
  (get, set, newValue: Edges) => {
    if (isDefaultValue(newValue)) {
      set(edgesAtom, newValue);
      return;
    }

    set(edgesAtom, newValue);

    const cleanFn = (curr: Set<string>) => {
      const existingEdgesIds = new Set<string>();
      curr.forEach(eId => {
        const exist = newValue.find(n => n.data.id === eId);
        if (exist) {
          existingEdgesIds.add(eId);
        }
      });
      return existingEdgesIds;
    };
    // Clean all dependent states
    get(edgesSelectedIdsAtom).size > 0 && set(edgesSelectedIdsAtom, cleanFn);
    get(edgesHiddenIdsAtom).size > 0 && set(edgesHiddenIdsAtom, cleanFn);
    get(edgesOutOfFocusIdsAtom).size > 0 &&
      set(edgesOutOfFocusIdsAtom, cleanFn);
    get(edgesFilteredIdsAtom).size > 0 && set(edgesFilteredIdsAtom, cleanFn);

    const activeConfig = get(activeConfigurationAtom);
    if (!activeConfig) {
      return;
    }
    const schemas = get(schemaAtom);
    const activeSchema = schemas.get(activeConfig);

    set(schemaAtom, prevSchemas => {
      const updatedSchemas = new Map(prevSchemas);

      updatedSchemas.set(activeConfig, {
        edges: newValue.reduce(
          (schema, edge) => {
            if (!schema.find(s => s.type === edge.data.type)) {
              schema.push({
                type: edge.data.type,
                displayLabel: "",
                attributes: Object.keys(edge.data.attributes).map(attr => ({
                  name: attr,
                  displayLabel: sanitizeText(attr),
                  hidden: false,
                })),
              });
            }

            return schema;
          },
          activeSchema?.edges as SchemaInference["edges"]
        ),
        vertices: activeSchema?.vertices || [],
        ...(activeSchema || {}),
      });

      return updatedSchemas;
    });
  }
);

export const edgesSelectedIdsAtom = atomWithReset(new Set<string>());
export const edgesHiddenIdsAtom = atomWithReset(new Set<string>());
export const edgesOutOfFocusIdsAtom = atomWithReset(new Set<string>());
export const edgesFilteredIdsAtom = atomWithReset(new Set<string>());
export const edgesTypesFilteredAtom = atomWithReset(new Set<string>());
