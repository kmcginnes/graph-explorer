import type {
  ConnectionConfig,
  NeptuneServiceType,
  QueryEngine,
} from "@shared/types";

import { useQueryClient } from "@tanstack/react-query";
import { useAtomCallback } from "jotai/utils";
import { useCallback, useRef, useState } from "react";

import {
  Button,
  Checkbox,
  FormItem,
  InfoTooltip,
  InputField,
  Label,
  SelectField,
  TextAreaField,
} from "@/components";
import {
  type LocalDataPayload,
  saveLocalData,
  type SkipReport,
  validateAndTransform,
} from "@/connector/localData";
import {
  activeConfigurationAtom,
  allGraphSessionsAtom,
  configurationAtom,
  type ConfigurationContextProps,
  createNewConfigurationId,
  type RawConfiguration,
  schemaAtom,
} from "@/core";
import { localDataCacheAtom } from "@/core/connector";
import useResetState from "@/core/StateProvider/useResetState";
import { formatDate, logger } from "@/utils";
import {
  DEFAULT_FETCH_TIMEOUT,
  DEFAULT_NODE_EXPAND_LIMIT,
} from "@/utils/constants";

type ConnectionForm = {
  name?: string;
  url?: string;
  queryEngine?: QueryEngine;
  proxyConnection?: boolean;
  graphDbUrl?: string;
  awsAuthEnabled?: boolean;
  serviceType?: NeptuneServiceType;
  awsRegion?: string;
  fetchTimeoutEnabled: boolean;
  fetchTimeoutMs?: number;
  nodeExpansionLimitEnabled: boolean;
  nodeExpansionLimit?: number;
};

const CONNECTIONS_OP: {
  label: string;
  value: QueryEngine;
}[] = [
  { label: "Gremlin - PG (Property Graph)", value: "gremlin" },
  { label: "OpenCypher - PG (Property Graph)", value: "openCypher" },
  { label: "SPARQL - RDF (Resource Description Framework)", value: "sparql" },
  { label: "Local Data", value: "localData" },
];

export type CreateConnectionProps = {
  existingConfig?: ConfigurationContextProps;
  onClose(): void;
};

function mapToConnection(data: Required<ConnectionForm>): ConnectionConfig {
  if (data.queryEngine === "localData") {
    return {
      queryEngine: "localData",
    };
  }
  return {
    url: data.url,
    queryEngine: data.queryEngine,
    proxyConnection: data.proxyConnection,
    graphDbUrl: data.graphDbUrl,
    awsAuthEnabled: data.awsAuthEnabled,
    serviceType: data.serviceType,
    awsRegion: data.awsRegion,
    fetchTimeoutMs: data.fetchTimeoutEnabled ? data.fetchTimeoutMs : undefined,
    nodeExpansionLimit: data.nodeExpansionLimitEnabled
      ? data.nodeExpansionLimit
      : undefined,
  };
}

function mapToConnectionForm(
  existingConfig: ConfigurationContextProps | undefined,
) {
  if (!existingConfig) {
    return;
  }

  const result: ConnectionForm = {
    ...existingConfig.connection,
    name: existingConfig.displayLabel ?? existingConfig.id,
    fetchTimeoutEnabled: Boolean(existingConfig.connection?.fetchTimeoutMs),
    nodeExpansionLimitEnabled: Boolean(
      existingConfig.connection?.nodeExpansionLimit,
    ),
  };
  return result;
}

const CreateConnection = ({
  existingConfig,
  onClose,
}: CreateConnectionProps) => {
  const queryClient = useQueryClient();

  const configId = existingConfig?.id;
  const initialData = mapToConnectionForm(existingConfig);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localDataFile, setLocalDataFile] = useState<File | null>(null);
  const [localDataError, setLocalDataError] = useState<string | null>(null);
  const [localDataSkipped, setLocalDataSkipped] = useState<SkipReport[]>([]);

  const onSave = useAtomCallback(
    useCallback(
      (_get, set, data: Required<ConnectionForm>) => {
        if (!configId) {
          const newConfigId = createNewConfigurationId();
          const newConfig: RawConfiguration = {
            id: newConfigId,
            displayLabel: data.name,
            connection: mapToConnection(data),
          };
          logger.log("Saving new connection", { newConfigId, newConfig });
          set(configurationAtom, prevConfigMap => {
            const updatedConfig = new Map(prevConfigMap);
            updatedConfig.set(newConfigId, newConfig);
            return updatedConfig;
          });
          set(activeConfigurationAtom, newConfigId);
          return newConfigId;
        }

        set(configurationAtom, prev => {
          const updated = new Map(prev);
          const currentConfig = updated.get(configId);
          const updatedConfig: RawConfiguration = {
            ...currentConfig,
            id: configId,
            displayLabel: data.name,
            connection: mapToConnection(data),
          };
          logger.log("Updating existing connection", {
            configId,
            currentConfig,
            updatedConfig,
          });
          updated.set(configId, updatedConfig);
          return updated;
        });

        const urlChange = initialData?.url !== data.url;
        const dbUrlChange = initialData?.graphDbUrl !== data.graphDbUrl;
        const typeChange = initialData?.queryEngine !== data.queryEngine;

        if (urlChange || dbUrlChange || typeChange) {
          logger.log(
            "Clearing cached schema and previous graph session because connection to database meaningfully changed",
            { original: initialData, updated: data },
          );

          // Force a sync of the schema by deleting the existing schema cache, which is now invalid
          set(schemaAtom, prevSchemaMap => {
            const updatedSchema = new Map(prevSchemaMap);
            updatedSchema.delete(configId);
            return updatedSchema;
          });

          // Delete previous session data
          set(allGraphSessionsAtom, prev => {
            const updatedGraphs = new Map(prev);
            logger.log("Deleting previous graph session");
            updatedGraphs.delete(configId);
            return updatedGraphs;
          });

          // Reseting all query state. Using `removeQueries()` to ensure initial data is recalculated.
          // This ensures dependent queries execute in the right order
          queryClient.removeQueries();
        }

        return configId;
      },
      [configId, initialData, queryClient],
    ),
  );

  const handleLocalDataFile = async (file: File) => {
    setLocalDataError(null);
    setLocalDataSkipped([]);
    try {
      const text = await file.text();
      const json: unknown = JSON.parse(text);
      const result = validateAndTransform(json);
      if (!result.success) {
        setLocalDataError(result.error);
        setLocalDataFile(null);
        return;
      }
      setLocalDataFile(file);
      setLocalDataSkipped(result.skipped);
    } catch {
      setLocalDataError("Failed to parse JSON file");
      setLocalDataFile(null);
    }
  };

  const [form, setForm] = useState<ConnectionForm>({
    queryEngine: initialData?.queryEngine || "gremlin",
    name:
      initialData?.name ||
      `Connection (${formatDate(new Date(), "yyyy-MM-dd HH:mm")})`,
    url: initialData?.url || "",
    proxyConnection: initialData?.proxyConnection || false,
    graphDbUrl: initialData?.graphDbUrl || "",
    awsAuthEnabled: initialData?.awsAuthEnabled || false,
    serviceType: initialData?.serviceType || "neptune-db",
    awsRegion: initialData?.awsRegion || "",
    fetchTimeoutEnabled: initialData?.fetchTimeoutEnabled || false,
    fetchTimeoutMs: initialData?.fetchTimeoutMs,
    nodeExpansionLimitEnabled: initialData?.nodeExpansionLimitEnabled || false,
    nodeExpansionLimit: initialData?.nodeExpansionLimit,
  });

  const [hasError, setError] = useState(false);
  const onFormChange =
    (attribute: keyof ConnectionForm) =>
    (value: number | string | string[] | boolean) => {
      if (attribute === "serviceType" && value === "neptune-graph") {
        setForm(prev => ({
          ...prev,
          [attribute]: value,
          ["queryEngine"]: "openCypher",
        }));
      } else if (
        attribute === "fetchTimeoutEnabled" &&
        typeof value === "boolean"
      ) {
        setForm(prev => ({
          ...prev,
          [attribute]: value,
          ["fetchTimeoutMs"]: value ? DEFAULT_FETCH_TIMEOUT : undefined,
        }));
      } else if (
        attribute === "nodeExpansionLimitEnabled" &&
        typeof value === "boolean"
      ) {
        setForm(prev => ({
          ...prev,
          [attribute]: value,
          ["nodeExpansionLimit"]: value ? DEFAULT_NODE_EXPAND_LIMIT : undefined,
        }));
      } else {
        setForm(prev => ({
          ...prev,
          [attribute]: value,
        }));
      }
    };

  const reset = useResetState();
  const loadLocalDataIntoCache = useAtomCallback(
    useCallback((_get, set, dataset: { vertices: any[]; edges: any[] }) => {
      set(localDataCacheAtom, dataset);
    }, []),
  );

  const onSubmit = async () => {
    if (!form.name || !form.queryEngine) {
      setError(true);
      return;
    }

    if (form.queryEngine === "localData") {
      if (!localDataFile && !configId) {
        setLocalDataError("Please select a JSON file to import");
        return;
      }

      const connectionId = onSave(form as Required<ConnectionForm>);

      // If a file was selected, process and store it
      if (localDataFile && connectionId) {
        const text = await localDataFile.text();
        const json = JSON.parse(text) as LocalDataPayload;
        await saveLocalData(connectionId, json);

        // Load into memory cache
        const result = validateAndTransform(json);
        if (result.success) {
          loadLocalDataIntoCache({
            vertices: result.vertices,
            edges: result.edges,
          });
        }
      }

      reset();
      onClose();
      return;
    }

    if (!form.url) {
      setError(true);
      return;
    }

    if (form.proxyConnection && !form.graphDbUrl) {
      setError(true);
      return;
    }

    if (form.awsAuthEnabled && (!form.awsRegion || !form.serviceType)) {
      setError(true);
      return;
    }

    onSave(form as Required<ConnectionForm>);
    reset();
    onClose();
  };

  const isLocalData = form.queryEngine === "localData";

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-6">
        <FormItem>
          <Label>Name</Label>
          <InputField
            aria-label="Name"
            value={form.name}
            onChange={onFormChange("name")}
            errorMessage="Name is required"
            validationState={hasError && !form.name ? "invalid" : "valid"}
          />
        </FormItem>
        <FormItem>
          <Label>Query Language</Label>
          <SelectField
            options={CONNECTIONS_OP}
            value={form.queryEngine}
            onValueChange={onFormChange("queryEngine")}
            disabled={form.serviceType === "neptune-graph"}
          />
        </FormItem>
        {isLocalData ? (
          <FormItem>
            <Label>Import JSON File</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="file:bg-primary-main block w-full text-sm file:mr-4 file:rounded file:border-0 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:cursor-pointer"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  void handleLocalDataFile(file);
                }
              }}
            />
            {localDataFile && (
              <p className="text-primary-main text-sm">
                ✓ {localDataFile.name}
              </p>
            )}
            {localDataError && (
              <p className="text-error-main text-sm">{localDataError}</p>
            )}
            {localDataSkipped.length > 0 && (
              <p className="text-warning-main text-sm">
                {localDataSkipped.length} record(s) will be skipped during
                import.
              </p>
            )}
          </FormItem>
        ) : (
          <>
            <FormItem>
              <Label>
                Public or Proxy Endpoint
                <InfoTooltip>
                  Provide the endpoint URL for an open graph database, e.g.,
                  Gremlin Server. If connecting to Amazon Neptune, then provide
                  a proxy endpoint URL that is accessible from outside the VPC,
                  e.g., EC2.
                </InfoTooltip>
              </Label>
              <TextAreaField
                aria-label="Public or Proxy Endpoint"
                data-autofocus={true}
                value={form.url}
                onChange={onFormChange("url")}
                errorMessage="URL is required"
                placeholder="https://example.com"
                validationState={hasError && !form.url ? "invalid" : "valid"}
              />
            </FormItem>

            <Label className="cursor-pointer">
              <Checkbox
                value="proxyConnection"
                checked={form.proxyConnection}
                onCheckedChange={checked => {
                  onFormChange("proxyConnection")(checked);
                }}
              />
              Using Proxy-Server
            </Label>
            {form.proxyConnection && (
              <FormItem>
                <Label>Graph Connection URL</Label>
                <TextAreaField
                  aria-label="Graph Connection URL"
                  data-autofocus={true}
                  value={form.graphDbUrl}
                  onChange={onFormChange("graphDbUrl")}
                  errorMessage="URL is required"
                  placeholder="https://neptune-cluster.amazonaws.com"
                  validationState={
                    hasError && !form.graphDbUrl ? "invalid" : "valid"
                  }
                />
              </FormItem>
            )}
            {form.proxyConnection && (
              <Label className="cursor-pointer">
                <Checkbox
                  value="awsAuthEnabled"
                  checked={form.awsAuthEnabled}
                  onCheckedChange={checked => {
                    onFormChange("awsAuthEnabled")(checked);
                  }}
                />
                AWS IAM Auth Enabled
              </Label>
            )}
            {form.proxyConnection && form.awsAuthEnabled && (
              <>
                <FormItem>
                  <Label>AWS Region</Label>
                  <InputField
                    aria-label="AWS Region"
                    data-autofocus={true}
                    value={form.awsRegion}
                    onChange={onFormChange("awsRegion")}
                    errorMessage="Region is required"
                    placeholder="us-east-1"
                    validationState={
                      hasError && !form.awsRegion ? "invalid" : "valid"
                    }
                  />
                </FormItem>
                <FormItem>
                  <Label>Service Type</Label>
                  <SelectField
                    options={[
                      { label: "Neptune DB", value: "neptune-db" },
                      { label: "Neptune Analytics", value: "neptune-graph" },
                    ]}
                    value={form.serviceType}
                    onValueChange={onFormChange("serviceType")}
                  />
                </FormItem>
              </>
            )}
            <FormItem>
              <Label className="cursor-pointer">
                <Checkbox
                  value="fetchTimeoutEnabled"
                  checked={form.fetchTimeoutEnabled}
                  onCheckedChange={checked => {
                    onFormChange("fetchTimeoutEnabled")(checked);
                  }}
                />
                <span className="flex items-center gap-2">
                  Enable Fetch Timeout
                  <InfoTooltip>
                    Large datasets may require a large amount of time to fetch.
                    If the timeout is exceeded, the request will be cancelled.
                  </InfoTooltip>
                </span>
              </Label>
            </FormItem>
            {form.fetchTimeoutEnabled && (
              <FormItem>
                <Label>Fetch Timeout (ms)</Label>
                <InputField
                  aria-label="Fetch Timeout (ms)"
                  type="number"
                  value={form.fetchTimeoutMs}
                  onChange={onFormChange("fetchTimeoutMs")}
                  min={0}
                />
              </FormItem>
            )}
            <FormItem>
              <Label className="cursor-pointer">
                <Checkbox
                  value="nodeExpansionLimitEnabled"
                  checked={form.nodeExpansionLimitEnabled}
                  onCheckedChange={checked => {
                    onFormChange("nodeExpansionLimitEnabled")(checked);
                  }}
                />
                <span className="flex items-center gap-2">
                  Override Default Neighbor Expansion Limit
                  <InfoTooltip>
                    Large datasets may require a default limit to the amount of
                    neighbors that are returned during any single expansion.
                  </InfoTooltip>
                </span>
              </Label>
            </FormItem>
            {form.nodeExpansionLimitEnabled && (
              <FormItem>
                <Label>Node Expansion Limit</Label>
                <InputField
                  aria-label="Node Expansion Limit"
                  type="number"
                  value={form.nodeExpansionLimit}
                  onChange={onFormChange("nodeExpansionLimit")}
                  min={0}
                />
              </FormItem>
            )}
          </>
        )}
      </div>
      <div className="flex justify-between border-t pt-4">
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={onSubmit}>
          {!configId ? "Add Connection" : "Update Connection"}
        </Button>
      </div>
    </div>
  );
};

export default CreateConnection;
