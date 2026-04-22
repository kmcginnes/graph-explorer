import { z } from "zod";

const localDataVertexSchema = z.object({
  id: z.union([z.string(), z.number()]),
  type: z.string(),
  attributes: z.record(z.string(), z.unknown()).optional(),
});

const localDataEdgeSchema = z.object({
  id: z.union([z.string(), z.number()]),
  type: z.string(),
  source: z.union([z.string(), z.number()]),
  target: z.union([z.string(), z.number()]),
  attributes: z.record(z.string(), z.unknown()).optional(),
});

const localDataMetaSchema = z.object({
  version: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  source: z.string().optional(),
});

export const localDataPayloadSchema = z.object({
  meta: localDataMetaSchema,
  data: z.object({
    graph: z.object({
      vertices: z.array(localDataVertexSchema),
      edges: z.array(localDataEdgeSchema),
    }),
  }),
});

export type LocalDataPayload = z.infer<typeof localDataPayloadSchema>;
export type LocalDataVertex = z.infer<typeof localDataVertexSchema>;
export type LocalDataEdge = z.infer<typeof localDataEdgeSchema>;
