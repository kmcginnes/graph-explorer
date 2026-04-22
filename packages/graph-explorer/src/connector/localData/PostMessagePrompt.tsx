import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

import { Button } from "@/components";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog";
import {
  activeConfigurationAtom,
  configurationAtom,
  createNewConfigurationId,
  type RawConfiguration,
} from "@/core";
import { localDataCacheAtom } from "@/core/connector";
import { logger } from "@/utils";

import type { PendingPostMessage } from "./usePostMessageListener";

import { inferAndStoreSchema } from "./inferSchema";
import { saveLocalData } from "./storage";
import { validateAndTransform } from "./validateAndTransform";

export type PostMessagePromptProps = {
  pending: PendingPostMessage;
  onDismiss: () => void;
};

export function PostMessagePrompt({
  pending,
  onDismiss,
}: PostMessagePromptProps) {
  const connectionName =
    pending.payload.meta.name ??
    `External Data (${new Date().toLocaleString()})`;

  const createAndLoad = useAtomCallback(
    useCallback(
      async (get, set) => {
        const result = validateAndTransform(pending.payload);
        if (!result.success) {
          logger.error("[PostMessage] Validation failed:", result.error);
          onDismiss();
          return;
        }

        const configId = createNewConfigurationId();
        const newConfig: RawConfiguration = {
          id: configId,
          displayLabel: connectionName,
          connection: { queryEngine: "localData" },
        };

        set(configurationAtom, prev => {
          const updated = new Map(prev);
          updated.set(configId, newConfig);
          return updated;
        });

        await saveLocalData(configId, pending.payload);

        const dataset = { vertices: result.vertices, edges: result.edges };
        set(localDataCacheAtom, dataset);
        await inferAndStoreSchema(get, set, configId, dataset);

        set(activeConfigurationAtom, configId);
        onDismiss();
      },
      [pending.payload, connectionName, onDismiss],
    ),
  );

  const saveForLater = useAtomCallback(
    useCallback(
      async (_get, set) => {
        const configId = createNewConfigurationId();
        const newConfig: RawConfiguration = {
          id: configId,
          displayLabel: connectionName,
          connection: { queryEngine: "localData" },
        };

        set(configurationAtom, prev => {
          const updated = new Map(prev);
          updated.set(configId, newConfig);
          return updated;
        });

        await saveLocalData(configId, pending.payload);
        onDismiss();
      },
      [pending.payload, connectionName, onDismiss],
    ),
  );

  return (
    <Dialog open onOpenChange={open => !open && onDismiss()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>External Data Received</DialogTitle>
          <DialogDescription>
            Data received from{" "}
            <strong>{pending.origin || "unknown origin"}</strong>
            {pending.payload.meta.description && (
              <>: {pending.payload.meta.description}</>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="text-sm">
            <strong>{connectionName}</strong> —{" "}
            {pending.payload.data.graph.vertices.length} vertices,{" "}
            {pending.payload.data.graph.edges.length} edges
          </p>
        </DialogBody>
        <DialogFooter>
          <Button onClick={saveForLater}>Save for Later</Button>
          <Button variant="primary" onClick={() => void createAndLoad()}>
            Load Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
