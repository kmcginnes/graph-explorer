import { startTransition, useCallback, useEffect } from "react";
import { useRecoilCallback } from "recoil";
import {
  Button,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  InfoTooltip,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TextArea,
} from "@/components";
import {
  ConnectionConfig,
  queryEngineOptions,
  neptuneServiceTypeOptions,
} from "@shared/types";
import {
  ConfigurationContextProps,
  createNewConfigurationId,
  RawConfiguration,
} from "@/core";
import {
  activeConfigurationAtom,
  configurationAtom,
} from "@/core/StateProvider/configuration";
import { schemaAtom } from "@/core/StateProvider/schema";
import useResetState from "@/core/StateProvider/useResetState";
import { formatDate } from "@/utils";
import {
  DEFAULT_FETCH_TIMEOUT,
  DEFAULT_NODE_EXPAND_LIMIT,
} from "@/utils/constants";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";

const connectionFormSchema = z
  .object({
    name: z
      .string({ message: "Name is required" })
      .nonempty("Name is required"),
    url: z
      .string({ message: "URL is required" })
      .nonempty("URL is required")
      .url(),
    queryEngine: z.enum(queryEngineOptions),
    proxyConnection: z.boolean(),
    graphDbUrl: z
      .string({ message: "Graph database URL is required" })
      .nonempty("Graph database URL is required")
      .url()
      .optional(),
    awsAuthEnabled: z.boolean(),
    serviceType: z.enum(neptuneServiceTypeOptions),
    awsRegion: z
      .string({ message: "AWS region is required" })
      .nonempty("AWS region is required")
      .optional(),
    fetchTimeoutEnabled: z.boolean(),
    fetchTimeoutMs: z.coerce
      .number()
      .min(1, "Fetch timeout must be greater than 0")
      .optional(),
    nodeExpansionLimitEnabled: z.boolean(),
    nodeExpansionLimit: z.coerce
      .number()
      .min(1, "Node expansion limit must be greater than 0")
      .optional(),
  })
  .refine(
    data => !data.proxyConnection || (data.proxyConnection && data.graphDbUrl),
    {
      message: "Proxy connection requires a graph database URL",
      path: ["graphDbUrl"],
    }
  )
  .refine(
    data => !data.awsAuthEnabled || (data.awsAuthEnabled && data.awsRegion),
    {
      message: "AWS IAM Auth requires an AWS region",
      path: ["awsRegion"],
    }
  )
  .refine(
    data =>
      !data.fetchTimeoutEnabled ||
      (data.fetchTimeoutEnabled && data.fetchTimeoutMs),
    {
      message: "Fetch timeout requires a value",
      path: ["fetchTimeoutMs"],
    }
  )
  .refine(
    data =>
      !data.nodeExpansionLimitEnabled ||
      (data.nodeExpansionLimitEnabled && data.nodeExpansionLimit),
    {
      message: "Node expansion limit requires a value",
      path: ["nodeExpansionLimit"],
    }
  );

type ConnectionForm = z.infer<typeof connectionFormSchema>;

export type CreateConnectionProps = {
  existingConfig?: ConfigurationContextProps;
  onClose(): void;
};

function mapToConnection(data: ConnectionForm): ConnectionConfig {
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

function mapToInitialData(
  existingConfig: ConfigurationContextProps | undefined
): ConnectionForm {
  const existingConnection = existingConfig?.connection;
  return {
    queryEngine: existingConnection?.queryEngine || "gremlin",
    name:
      existingConfig?.displayLabel ||
      existingConfig?.id ||
      `Connection (${formatDate(new Date(), "yyyy-MM-dd HH:mm")})`,
    url: existingConnection?.url ?? "",
    proxyConnection: existingConnection?.proxyConnection || false,
    graphDbUrl: existingConnection?.graphDbUrl,
    awsAuthEnabled: existingConnection?.awsAuthEnabled || false,
    serviceType: existingConnection?.serviceType || "neptune-db",
    awsRegion: existingConnection?.awsRegion,
    fetchTimeoutEnabled: Boolean(existingConnection?.fetchTimeoutMs),
    fetchTimeoutMs: existingConnection?.fetchTimeoutMs,
    nodeExpansionLimitEnabled: Boolean(existingConnection?.nodeExpansionLimit),
    nodeExpansionLimit: existingConnection?.nodeExpansionLimit,
  };
}

const CreateConnection = ({
  existingConfig,
  onClose,
}: CreateConnectionProps) => {
  const configId = existingConfig?.id;
  const initialData = useMemo(
    () => mapToInitialData(existingConfig),
    [existingConfig]
  );

  const onSave = useRecoilCallback(
    ({ set }) =>
      (data: ConnectionForm) => {
        if (!configId) {
          const newConfigId = createNewConfigurationId();
          const newConfig: RawConfiguration = {
            id: newConfigId,
            displayLabel: data.name,
            connection: mapToConnection(data),
          };
          set(configurationAtom, prevConfigMap => {
            const updatedConfig = new Map(prevConfigMap);
            updatedConfig.set(newConfigId, newConfig);
            return updatedConfig;
          });
          set(activeConfigurationAtom, newConfigId);
          return;
        }

        set(configurationAtom, prevConfigMap => {
          const updatedConfig = new Map(prevConfigMap);
          const currentConfig = updatedConfig.get(configId);

          updatedConfig.set(configId, {
            ...(currentConfig || {}),
            id: configId,
            displayLabel: data.name,
            connection: mapToConnection(data),
          });
          return updatedConfig;
        });

        const urlChange = initialData.url !== data.url;
        const typeChange = initialData.queryEngine !== data.queryEngine;

        if (urlChange || typeChange) {
          set(schemaAtom, prevSchemaMap => {
            const updatedSchema = new Map(prevSchemaMap);
            const currentSchema = updatedSchema.get(configId);
            updatedSchema.set(configId, {
              vertices: currentSchema?.vertices || [],
              edges: currentSchema?.edges || [],
              prefixes: currentSchema?.prefixes || [],
              // If the URL or Engine change, show as not synchronized
              lastUpdate: undefined,
              lastSyncFail: undefined,
              triedToSync: undefined,
            });

            return updatedSchema;
          });
        }
      },
    [configId, initialData.url, initialData.queryEngine]
  );

  const form = useForm<ConnectionForm>({
    resolver: zodResolver(connectionFormSchema),
    defaultValues: mapToInitialData(existingConfig),
    shouldUnregister: false,
  });

  const reset = useResetState();
  const onSubmit = useCallback(
    (form: ConnectionForm) => {
      onSave(form);
      reset();
      onClose();
    },
    [onSave, onClose, reset]
  );

  const proxyEnabled = form.watch("proxyConnection");
  const awsAuthEnabled = form.watch("awsAuthEnabled");
  const fetchTimeoutEnabled = form.watch("fetchTimeoutEnabled");
  const nodeExpansionLimitEnabled = form.watch("nodeExpansionLimitEnabled");
  const serviceType = form.watch("serviceType");
  const queryEngine = form.watch("queryEngine");

  useEffect(() => {
    if (serviceType === "neptune-graph" && queryEngine !== "openCypher") {
      form.setValue("queryEngine", "openCypher");
    }
  }, [serviceType, queryEngine, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, formData =>
          console.error("Failed to validate the form", formData)
        )}
        className="flex flex-col gap-6"
      >
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="queryEngine"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Graph Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={serviceType === "neptune-graph"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a graph type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="gremlin">
                        Gremlin - PG (Property Graph)
                      </SelectItem>
                      <SelectItem value="openCypher">
                        OpenCypher - PG (Property Graph)
                      </SelectItem>
                      <SelectItem value="sparql">
                        SPARQL - RDF (Resource Description Framework)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Public or Proxy Endpoint
                  <InfoTooltip>
                    Provide the endpoint URL for an open graph database, e.g.,
                    Gremlin Server. If connecting to Amazon Neptune, then
                    provide a proxy endpoint URL that is accessible from outside
                    the VPC, e.g., EC2.
                  </InfoTooltip>
                </FormLabel>
                <FormControl>
                  <TextArea
                    data-autofocus
                    placeholder="https://example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="proxyConnection"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={value => field.onChange(Boolean(value))}
                  />
                </FormControl>
                <FormLabel className="text-text-primary">
                  Using Proxy-Server
                </FormLabel>
              </FormItem>
            )}
          />
          {proxyEnabled && (
            <FormField
              control={form.control}
              name="graphDbUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="graphDbUrl">
                    Graph Connection URL
                  </FormLabel>
                  <FormControl>
                    <TextArea
                      autoFocus
                      placeholder="https://neptune-cluster.amazonaws.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {proxyEnabled && (
            <FormField
              control={form.control}
              name="awsAuthEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={value => field.onChange(Boolean(value))}
                    />
                  </FormControl>
                  <FormLabel className="text-text-primary">
                    AWS IAM Auth Enabled
                  </FormLabel>
                </FormItem>
              )}
            />
          )}

          {proxyEnabled && awsAuthEnabled && (
            <FormField
              control={form.control}
              name="awsRegion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="awsRegion">AWS Region</FormLabel>
                  <FormControl>
                    <Input autoFocus placeholder="us-east-1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {proxyEnabled && awsAuthEnabled && (
            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="neptune-db">Neptune DB</SelectItem>
                      <SelectItem value="neptune-graph">
                        Neptune Analytics
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="fetchTimeoutEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-text-primary">
                  Enable Fetch Timeout
                  <InfoTooltip>
                    Large datasets may require a large amount of time to fetch.
                    If the timeout is exceeded, the request will be cancelled.
                  </InfoTooltip>
                </FormLabel>
              </FormItem>
            )}
          />

          {fetchTimeoutEnabled && (
            <FormField
              control={form.control}
              name="fetchTimeoutMs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="fetchTimeoutMs">
                    Fetch Timeout (ms)
                  </FormLabel>
                  <FormControl>
                    <Input
                      autoFocus
                      type="number"
                      placeholder={`${DEFAULT_FETCH_TIMEOUT}`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="nodeExpansionLimitEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={value => field.onChange(Boolean(value))}
                  />
                </FormControl>
                <FormLabel className="text-text-primary">
                  Enable Node Expansion Limit
                  <InfoTooltip>
                    Large datasets may require a default limit to the amount of
                    neighbors that are returned during any single expansion.
                  </InfoTooltip>
                </FormLabel>
              </FormItem>
            )}
          />

          {nodeExpansionLimitEnabled && (
            <FormField
              control={form.control}
              name="nodeExpansionLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="nodeExpansionLimit">
                    Node Expansion Limit
                  </FormLabel>
                  <FormControl>
                    <Input
                      autoFocus
                      type="number"
                      placeholder={`${DEFAULT_NODE_EXPAND_LIMIT}`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        <div className="flex justify-between border-t pt-4">
          <Button variant="default" onPress={onClose}>
            Cancel
          </Button>
          <Button variant="filled" type="submit">
            {!configId ? "Add Connection" : "Update Connection"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateConnection;
