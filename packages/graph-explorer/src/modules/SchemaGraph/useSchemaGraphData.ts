import {
  useActiveSchema,
  useDisplayVertexTypeConfigs,
  useDisplayEdgeTypeConfigs,
} from "@/core";
import type { GraphNode, GraphEdge } from "@/components/Graph/Graph.model";

export type SchemaGraphNode = GraphNode & {
  data: {
    id: string;
    type: string;
    displayLabel: string;
    attributeCount: number;
    total?: number;
  };
};

export type SchemaGraphEdge = GraphEdge & {
  data: {
    id: string;
    source: string;
    target: string;
    type: string;
    displayLabel: string;
  };
};

/** Creates a unique ID for an edge connection. */
function createEdgeConnectionId(
  sourceLabel: string,
  edgeType: string,
  targetLabel: string,
): string {
  return `${sourceLabel}-[${edgeType}]->${targetLabel}`;
}

/** Transforms vertex type configs into schema graph nodes. */
export function useSchemaGraphNodes(): SchemaGraphNode[] {
  const vtConfigs = useDisplayVertexTypeConfigs();
  const schema = useActiveSchema();

  // Create a map of vertex type totals from the schema
  const totalsByType = new Map(schema.vertices.map(v => [v.type, v.total]));

  const nodes: SchemaGraphNode[] = [];

  for (const config of vtConfigs.values()) {
    nodes.push({
      data: {
        id: config.type,
        type: config.type,
        displayLabel: config.displayLabel,
        attributeCount: config.attributes.length,
        total: totalsByType.get(config.type),
      },
    });
  }

  return nodes;
}

/** Transforms edge connections into schema graph edges, filtering out edges with missing nodes. */
export function useSchemaGraphEdges(
  existingNodeIds: Set<string>,
): SchemaGraphEdge[] {
  const schema = useActiveSchema();
  const edgeConnections = schema.edgeConnections ?? [];
  const etConfigs = useDisplayEdgeTypeConfigs();

  const edges: SchemaGraphEdge[] = [];

  for (const connection of edgeConnections) {
    // Skip edges where source or target node doesn't exist
    if (!existingNodeIds.has(connection.sourceLabel)) continue;
    if (!existingNodeIds.has(connection.targetLabel)) continue;

    const edgeConfig = etConfigs.get(connection.edgeType);
    const displayLabel = edgeConfig?.displayLabel ?? connection.edgeType;

    edges.push({
      data: {
        id: createEdgeConnectionId(
          connection.sourceLabel,
          connection.edgeType,
          connection.targetLabel,
        ),
        source: connection.sourceLabel,
        target: connection.targetLabel,
        type: connection.edgeType,
        displayLabel,
      },
    });
  }

  return edges;
}

/** Returns both schema graph nodes and edges. */
export function useSchemaGraphData() {
  const nodes = useSchemaGraphNodes();
  const existingNodeIds = new Set(nodes.map(n => n.data.id));
  const edges = useSchemaGraphEdges(existingNodeIds);
  return { nodes, edges };
}
