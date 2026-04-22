import {
  createEdge,
  createVertex,
  type Edge,
  type EntityPropertyValue,
  type Vertex,
} from "@/core";

import { type LocalDataPayload, localDataPayloadSchema } from "./types";

export type ValidationResult =
  | { success: true; vertices: Vertex[]; edges: Edge[]; skipped: SkipReport[] }
  | { success: false; error: string };

export type SkipReport = {
  entityType: "vertex" | "edge";
  id: string | number;
  reason: string;
};

/**
 * Validates the structural shape of a local data payload. Returns the parsed
 * payload on success or an error message on failure.
 */
export function parsePayload(
  data: unknown,
):
  | { success: true; payload: LocalDataPayload }
  | { success: false; error: string } {
  const result = localDataPayloadSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid payload",
    };
  }
  return { success: true, payload: result.data };
}

/**
 * Validates and transforms a local data payload into Vertex and Edge arrays.
 *
 * Strict on structure (rejects malformed top-level shape), lenient on data
 * (skips invalid records and reports what was dropped).
 */
export function validateAndTransform(data: unknown): ValidationResult {
  const parsed = parsePayload(data);
  if (!parsed.success) {
    return parsed;
  }

  const { payload } = parsed;
  const skipped: SkipReport[] = [];

  // Build vertex ID set for edge validation
  const vertexIdSet = new Set(
    payload.data.graph.vertices.map(v => String(v.id)),
  );

  // Transform vertices
  const vertices: Vertex[] = [];
  for (const raw of payload.data.graph.vertices) {
    if (!raw.id || !raw.type) {
      skipped.push({
        entityType: "vertex",
        id: raw.id ?? "unknown",
        reason: "Missing required field: id or type",
      });
      continue;
    }
    vertices.push(
      createVertex({
        id: raw.id,
        types: [raw.type],
        attributes: sanitizeAttributes(raw.attributes),
      }),
    );
  }

  // Transform edges
  const edges: Edge[] = [];
  for (const raw of payload.data.graph.edges) {
    if (!raw.id || !raw.type || !raw.source || !raw.target) {
      skipped.push({
        entityType: "edge",
        id: raw.id ?? "unknown",
        reason: "Missing required field",
      });
      continue;
    }
    if (
      !vertexIdSet.has(String(raw.source)) ||
      !vertexIdSet.has(String(raw.target))
    ) {
      skipped.push({
        entityType: "edge",
        id: raw.id,
        reason: "References nonexistent vertex",
      });
      continue;
    }
    edges.push(
      createEdge({
        id: raw.id,
        type: raw.type,
        sourceId: raw.source,
        targetId: raw.target,
        attributes: sanitizeAttributes(raw.attributes),
      }),
    );
  }

  return { success: true, vertices, edges, skipped };
}

/** Filters attribute values to only supported scalar types. */
function sanitizeAttributes(
  attrs: Record<string, unknown> | undefined,
): Record<string, EntityPropertyValue> {
  if (!attrs) {
    return {};
  }
  const result: Record<string, EntityPropertyValue> = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      result[key] = value;
    }
  }
  return result;
}
