import { z } from "zod";

/** Coerces a string to a boolean value in a case insensitive way. */
export const BooleanStringSchema = z
  .string()
  .refine(s => s.toLowerCase() === "true" || s.toLowerCase() === "false")
  .transform(s => s.toLowerCase() === "true");
