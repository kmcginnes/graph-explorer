import { atom } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import type { Vertex } from "../../@types/entities";
import { sanitizeText } from "../../utils";
import { activeConfigurationAtom } from "./configuration";
import isDefaultValue from "./isDefaultValue";
import { schemaAtom, SchemaInference } from "./schema";

export const nodesAtom = atomWithReset<Array<Vertex>>([]);

export const nodesSelector = atom(
  get => get(nodesAtom),
  (get, set, newValue: Vertex[] | typeof RESET) => {
    if (isDefaultValue(newValue)) {
      set(nodesAtom, newValue);
      return;
    }

    set(nodesAtom, newValue);
    const cleanFn = (curr: Set<string>) => {
      const existingNodesIds = new Set<string>();
      curr.forEach(nId => {
        const exist = newValue.find(n => n.data.id === nId);
        if (exist) {
          existingNodesIds.add(nId);
        }
      });
      return existingNodesIds;
    };
    // Clean all dependent states
    get(nodesSelectedIdsAtom).size > 0 && set(nodesSelectedIdsAtom, cleanFn);
    get(nodesHiddenIdsAtom).size > 0 && set(nodesHiddenIdsAtom, cleanFn);
    get(nodesOutOfFocusIdsAtom).size > 0 &&
      set(nodesOutOfFocusIdsAtom, cleanFn);
    get(nodesFilteredIdsAtom).size > 0 && set(nodesFilteredIdsAtom, cleanFn);

    const activeConfig = get(activeConfigurationAtom);
    if (!activeConfig) {
      return;
    }
    const schemas = get(schemaAtom);
    const activeSchema = schemas.get(activeConfig);

    set(schemaAtom, prevSchemas => {
      const updatedSchemas = new Map(prevSchemas);

      updatedSchemas.set(activeConfig, {
        vertices: newValue.reduce(
          (schema, node) => {
            if (!schema.find(s => s.type === node.data.type)) {
              schema.push({
                type: node.data.type,
                displayLabel: "",
                attributes: Object.keys(node.data.attributes).map(attr => ({
                  name: attr,
                  displayLabel: sanitizeText(attr),
                  hidden: false,
                })),
              });
            }

            return schema;
          },
          activeSchema?.vertices as SchemaInference["vertices"]
        ),
        edges: activeSchema?.edges || [],
        ...(activeSchema || {}),
      });

      return updatedSchemas;
    });
  }
);

export const nodesSelectedIdsAtom = atomWithReset(new Set<string>());
export const nodesHiddenIdsAtom = atomWithReset(new Set<string>());
export const nodesOutOfFocusIdsAtom = atomWithReset(new Set<string>());
export const nodesFilteredIdsAtom = atomWithReset(new Set<string>());
export const nodesTypesFilteredAtom = atomWithReset(new Set<string>());
