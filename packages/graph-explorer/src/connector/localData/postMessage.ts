import { type LocalDataPayload, localDataPayloadSchema } from "./types";

export const POST_MESSAGE_TYPE = "graph-explorer:load-data" as const;
export const POST_MESSAGE_READY = "graph-explorer:ready" as const;

export type PostMessagePayload = {
  type: typeof POST_MESSAGE_TYPE;
  payload: LocalDataPayload;
};

/**
 * Parses a postMessage event and extracts the local data payload if valid.
 * Returns null if the message is not a valid graph-explorer:load-data message.
 */
export function parsePostMessage(
  data: unknown,
): { payload: LocalDataPayload; origin: string } | null {
  if (typeof data !== "object" || data === null) {
    return null;
  }
  const msg = data as Record<string, unknown>;
  if (msg.type !== POST_MESSAGE_TYPE) {
    return null;
  }
  const result = localDataPayloadSchema.safeParse(msg.payload);
  if (!result.success) {
    return null;
  }
  return { payload: result.data, origin: "" };
}
