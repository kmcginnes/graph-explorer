import { DatabaseRequest, DatabaseRequestSchema } from "@/data/DatabaseRequest";
import "server-only";
import { ZodError } from "zod";

export async function POST(request: Request) {
  const bodyRaw = await request.json();
  const maybeDbRequest = DatabaseRequestSchema.safeParse(bodyRaw);

  if (!maybeDbRequest.success) {
    return badRequest(maybeDbRequest.error);
  }
  const dbRequest = maybeDbRequest.data;

  const requestOptions: RequestInit = createRequestOptions(dbRequest);
  const endpointUrl = createEndpointUrl(dbRequest);
  console.log(`Sending fetch request`, {
    baseURL: dbRequest.databaseUrl,
    endpoint: endpointUrl.pathname,
    requestOptions,
  });

  // try {
  const startTime = performance.now();
  const response = await fetch(endpointUrl, requestOptions);
  const endTime = performance.now();

  const executionTimeMilliseconds = endTime - startTime;

  const rawBodyText = await response.text();
  const status =
    response.status.toString() +
    (response.statusText ? ` - ${response.statusText}` : "");
  console.log(`Response ${status} received in ${executionTimeMilliseconds} ms`);

  return new Response(rawBodyText, {
    status: response.status,
    statusText: response.statusText,
  });
}

function badRequest(zodError: ZodError) {
  return new Response(
    JSON.stringify({
      error: {
        message: "Invalid request",
        errors: zodError.errors,
      },
    }),
    { status: 400 }
  );
}

function createRequestOptions(dbRequest: DatabaseRequest): RequestInit {
  switch (dbRequest.queryEngine) {
    case "gremlin":
      return {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/vnd.gremlin-v3.0+json",
        },

        body: JSON.stringify({
          gremlin: dbRequest.query,
        }),
      };
    case "openCypher":
      return {
        method: "post",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({ query: dbRequest.query }),
      };
    case "sparql":
      return {
        method: "post",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/sparql-results+json",
        },
        body: new URLSearchParams({
          query: dbRequest.query,
        }),
      };
  }
}

function createEndpointUrl(dbRequest: DatabaseRequest) {
  const baseURL = new URL(dbRequest.databaseUrl);

  const expectedEndpoint = (() => {
    switch (dbRequest.queryEngine) {
      case "gremlin":
        return "/gremlin";
      case "openCypher":
        return "/openCypher";
      case "sparql":
        return "/sparql";
    }
  })();

  if (baseURL.pathname.includes(expectedEndpoint)) {
    return baseURL;
  }

  const combinedEndpoint = [baseURL.pathname, expectedEndpoint]
    .filter(path => path !== "" && path !== "/")
    .join("");
  const endpointUrl = new URL(combinedEndpoint, baseURL);
  return endpointUrl;
}
