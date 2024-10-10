import { QueryEngineSchema } from "@shared/types";
import { z } from "zod";

const AuthModeSchema = z.discriminatedUnion("name", [
  z.object({
    name: z.literal("PUBLIC"),
  }),
  z.object({
    name: z.literal("IAM"),
    region: z.string(),
    serviceType: z.enum(["neptune-db", "neptune-graph"]),
  }),
]);
export type AuthMode = z.infer<typeof AuthModeSchema>;

export const DatabaseRequestSchema = z.object({
  databaseUrl: z.string().url(),
  queryEngine: QueryEngineSchema,
  authMode: AuthModeSchema.default({ name: "PUBLIC" }),
  query: z.string(),
});

export type DatabaseRequest = z.infer<typeof DatabaseRequestSchema>;
