import { z } from "zod";

export const DefaultConnectionSchema = z.object({
  url: z.string().url(),
  queryEngine: z.enum(["gremlin", "sparql", "openCypher"]).optional(),
  proxyConnection: z.boolean().optional(),
  graphDbUrl: z.string().url().optional(),
  awsAuthEnabled: z.boolean().optional(),
  serviceType: z.enum(["neptune-db", "neptune-graph"]).optional(),
  awsRegion: z.string().optional(),
  fetchTimeoutMs: z.number().gt(0).optional(),
  nodeExpansionLimit: z.number().gt(0).optional(),
});

// type Foo = z.infer<typeof DefaultConnectionSchema>;

export type ConnectionConfig = {
  /**
   * Base URL to access to the database through HTTPs endpoints
   */
  url: string;
  /**
   * Choose between gremlin or sparQL engines.
   * By default, it uses gremlin
   */
  queryEngine?: "gremlin" | "sparql" | "openCypher";
  /**
   * If the service is Neptune,
   * all requests should be sent through the nodejs proxy-server.
   */
  proxyConnection?: boolean;
  /**
   * If it is Neptune, the URL of the database.
   */
  graphDbUrl?: string;
  /**
   * If it is Neptune, it could need authentication.
   */
  awsAuthEnabled?: boolean;
  /**
   * If it is Neptune, it could need authentication.
   */
  serviceType?: "neptune-db" | "neptune-graph";
  /**
   * AWS Region where the Neptune cluster is deployed.
   * It is needed to sign requests.
   */
  awsRegion?: string;
  /**
   * Number of milliseconds before aborting a request.
   * By default, undefined.
   */
  fetchTimeoutMs?: number;
  /**
   * A default limit on the number of nodes that can be expanded in one query.
   * By default, undefined.
   */
  nodeExpansionLimit?: number;
};
