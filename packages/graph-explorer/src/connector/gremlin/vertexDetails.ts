import { query } from "@/utils";
import {
  ErrorResponse,
  VertexDetailsRequest,
  VertexDetailsResponse,
} from "../useGEFetchTypes";
import { GremlinFetch, GVertex } from "./types";
import { mapResults } from "./mappers/mapResults";
import isErrorResponse from "../utils/isErrorResponse";
import { idParam } from "./idParam";

type Response = {
  requestId: string;
  status: {
    message: string;
    code: number;
  };
  result: {
    data: {
      "@type": "g:List";
      "@value": Array<GVertex>;
    };
  };
};

export async function vertexDetails(
  gremlinFetch: GremlinFetch,
  request: VertexDetailsRequest
): Promise<VertexDetailsResponse> {
  const idTemplate = request.vertexIds.map(idParam).join(",");
  const template = query`g.V(${idTemplate})`;

  // Fetch the vertex details
  const data = await gremlinFetch<Response | ErrorResponse>(template);
  if (isErrorResponse(data)) {
    throw new Error(data.detailedMessage);
  }

  // Map the results
  const entities = mapResults(data.result.data);

  // Always false for vertexDetails query, even if the vertex has no properties
  for (const vertex of entities.vertices) {
    vertex.__isFragment = false;
  }

  return { vertices: entities.vertices };
}
