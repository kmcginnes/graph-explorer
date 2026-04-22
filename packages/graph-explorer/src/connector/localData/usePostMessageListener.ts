import { useCallback, useEffect, useState } from "react";

import type { LocalDataPayload } from "./types";

import { parsePostMessage, POST_MESSAGE_READY } from "./postMessage";

export type PendingPostMessage = {
  payload: LocalDataPayload;
  origin: string;
};

/**
 * Listens for postMessage events containing local data payloads.
 * Announces readiness on mount and queues valid payloads for user confirmation.
 */
export function usePostMessageListener() {
  const [pending, setPending] = useState<PendingPostMessage | null>(null);

  const dismiss = useCallback(() => setPending(null), []);

  useEffect(() => {
    // Announce readiness to any parent/opener
    if (window.opener) {
      (window.opener as Window).postMessage({ type: POST_MESSAGE_READY }, "*");
    }
    if (window.parent !== window) {
      window.parent.postMessage({ type: POST_MESSAGE_READY }, "*");
    }

    function handleMessage(event: MessageEvent) {
      const parsed = parsePostMessage(event.data);
      if (!parsed) {
        return;
      }
      setPending({
        payload: parsed.payload,
        origin: event.origin,
      });
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return { pending, dismiss };
}
