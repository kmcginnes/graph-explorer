import "server-only";
import { DatabaseRequest, DatabaseRequestSchema } from "@/data/DatabaseRequest";
import { ZodError } from "zod";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import aws4 from "aws4";

export async function POST(request: Request) {
  try {
    /* Parse request parameters */

    const bodyRaw = await request.json();
    const maybeDbRequest = DatabaseRequestSchema.safeParse(bodyRaw);

    if (!maybeDbRequest.success) {
      return badRequest(maybeDbRequest.error);
    }
    const dbRequest = maybeDbRequest.data;

    /* Build database fetch call */

    const requestOptions = await createRequestOptions(dbRequest);
    const endpointUrl = createEndpointUrl(dbRequest);

    /* Perform fetch */

    const startTime = performance.now();
    const response = await fetch(endpointUrl, requestOptions);
    const endTime = performance.now();

    /* Shape response */

    const executionTimeMilliseconds = endTime - startTime;

    const rawBodyText = await response.text();
    const status =
      response.status.toString() +
      (response.statusText ? ` - ${response.statusText}` : "");
    console.log(
      `Response ${status} received in ${executionTimeMilliseconds} ms`
    );

    return new Response(rawBodyText, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error("Unknown error occurred", error);
    return new Response(
      JSON.stringify({
        error: {
          message: "Failed to process request",
        },
      }),
      { status: 500 }
    );
  }
}

async function getIAMHeaders(options: aws4.Request) {
  const credentialProvider = fromNodeProviderChain();
  const creds = await credentialProvider();
  if (creds === undefined) {
    throw new Error(
      "IAM is enabled but credentials cannot be found on the credential provider chain."
    );
  }

  const headers = aws4.sign(options, {
    accessKeyId: creds.accessKeyId,
    secretAccessKey: creds.secretAccessKey,
    ...(creds.sessionToken && { sessionToken: creds.sessionToken }),
  });

  // Typescript hackery to make the types happy
  const convertedHeaders = headers?.headers
    ? Object.entries(headers.headers).flatMap(([key, value]) =>
        value ? [[key, value.toString()] as [string, string]] : []
      )
    : null;

  return convertedHeaders as HeadersInit;
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

async function createRequestOptions(
  dbRequest: DatabaseRequest
): Promise<RequestInit> {
  let result: RequestInit = {
    method: "POST",
  };
  switch (dbRequest.queryEngine) {
    case "gremlin":
      result = {
        ...result,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/vnd.gremlin-v3.0+json",
        },
        body: JSON.stringify({
          gremlin: dbRequest.query,
        }),
      };
      break;

    case "openCypher":
      result = {
        ...result,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({ query: dbRequest.query }),
      };
      break;

    case "sparql":
      result = {
        ...result,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/sparql-results+json",
        },
        body: new URLSearchParams({
          query: dbRequest.query,
        }),
      };
      break;
  }

  // Apply IAM auth headers if necessary
  const endpointUrl = createEndpointUrl(dbRequest);
  const iamHeaders =
    dbRequest.authMode.name === "IAM"
      ? await getIAMHeaders({
          host: endpointUrl.hostname,
          port: endpointUrl.port,
          path: endpointUrl.pathname + endpointUrl.search,
          service: dbRequest.authMode.serviceType,
          region: dbRequest.authMode.region,
          method: result.method,
          body: result.body as string,
        })
      : null;
  result = {
    ...result,
    headers: iamHeaders ?? result.headers,
  };

  return result;
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
