import { QueryEngineSchema } from "@shared/types";
import { z } from "zod";

export const AuthModeSchema = z.enum(["IAM", "public"] as const);
export type AuthMode = z.infer<typeof AuthModeSchema>;

export const DatabaseRequestSchema = z.object({
  databaseUrl: z.string().url(),
  queryEngine: QueryEngineSchema,
  authMode: AuthModeSchema.default("public"),
  query: z.string(),
});

export type DatabaseRequest = z.infer<typeof DatabaseRequestSchema>;
