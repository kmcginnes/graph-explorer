import {
  ErrorResponse,
  VertexDetailsRequest,
  VertexDetailsResponse,
} from "@/connector/useGEFetchTypes";
import { OCVertex, OpenCypherFetch } from "./types";
import isErrorResponse from "@/connector/utils/isErrorResponse";
import mapApiVertex from "./mappers/mapApiVertex";
import { query } from "@/utils";
import { idParam } from "./idParam";

type Response = {
  results: [
    {
      vertex: OCVertex;
    },
  ];
};

export async function vertexDetails(
  openCypherFetch: OpenCypherFetch,
  req: VertexDetailsRequest
): Promise<VertexDetailsResponse> {
  const idTemplate = req.vertexIds.map(idParam).join(", ");
  const template = query`
    MATCH (vertex) WHERE ID(vertex) IN (${idTemplate}) RETURN vertex
  `;

  // Fetch the vertex details
  const data = await openCypherFetch<Response | ErrorResponse>(template);
  if (isErrorResponse(data)) {
    throw new Error(data.detailedMessage);
  }

  // Map the results
  const vertices = data.results.map(result => mapApiVertex(result.vertex));

  return { vertices };
}
