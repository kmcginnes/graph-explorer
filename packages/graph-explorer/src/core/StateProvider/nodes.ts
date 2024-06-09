import { atom } from "jotai";
import type { Vertex } from "../../@types/entities";
import { sanitizeText } from "../../utils";
import { activeConfigurationAtom } from "./configuration";
import { schemaAtom, SchemaInference } from "./schema";
import { atomWithReset, RESET } from "jotai/utils";

export const nodesAtom = atomWithReset<Array<Vertex>>([]);

export const nodesSelector = atom(
  get => get(nodesAtom),
  async (get, set, newValue: Vertex[] | typeof RESET) => {
    if (newValue === RESET) {
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

    const activeConfig = await get(activeConfigurationAtom);
    if (!activeConfig) {
      return;
    }
    const schemas = await get(schemaAtom);
    const activeSchema = schemas.get(activeConfig);

    set(schemaAtom, async prevSchemas => {
      const resolvedPrevSchemas = await prevSchemas;
      const updatedSchemas = new Map(resolvedPrevSchemas);

      updatedSchemas.set(activeConfig, {
        ...(activeSchema || {}),
        vertices: newValue.reduce(
          (schema, node) => {
            // Find the node type definition in the schema
            const schemaNode = schema.find(s => s.type === node.data.type);

            if (!schemaNode) {
              schema.push({
                type: node.data.type,
                displayLabel: "",
                attributes: Object.keys(node.data.attributes).map(attr => ({
                  name: attr,
                  displayLabel: sanitizeText(attr),
                  hidden: false,
                })),
              });

              // Since the node type is new we can go ahead and return
              return schema;
            }

            // Ensure the node attributes are updated in the schema
            const schemaAttributes = schemaNode.attributes.map(a => a.name);
            const missingAttributeNames = Object.keys(
              node.data.attributes
            ).filter(name => !schemaAttributes.includes(name));

            for (const attributeName of missingAttributeNames) {
              schemaNode.attributes.push({
                name: attributeName,
                displayLabel: sanitizeText(attributeName),
                hidden: false,
              });
            }

            return schema;
          },
          activeSchema?.vertices as SchemaInference["vertices"]
        ),
        edges: activeSchema?.edges || [],
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
