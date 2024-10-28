import {
  ErrorResponse,
  RawQueryRequest,
  RawQueryResponse,
} from "@/connector/useGEFetchTypes";
import { GAnyValue, GremlinFetch } from "../types";
import isErrorResponse from "@/connector/utils/isErrorResponse";
import mapApiVertex from "../mappers/mapApiVertex";
import mapApiEdge from "../mappers/mapApiEdge";
import { Edge, Vertex } from "@/@types/entities";

type RawGremlinQueryResponse = {
  requestId: string;
  status: {
    message: string;
    code: number;
  };
  result: {
    data: GAnyValue;
  };
};

export default async function rawQuery(
  gremlinFetch: GremlinFetch,
  req: RawQueryRequest
): Promise<RawQueryResponse> {
  const data = await gremlinFetch<RawGremlinQueryResponse | ErrorResponse>(
    req.query
  );
  if (isErrorResponse(data)) {
    throw new Error(data.detailedMessage);
  }

  const entities = extractEntities(data.result.data);

  return {
    vertices: entities.filter(e => "vertex" in e).map(e => e.vertex),
    edges: entities.filter(e => "edge" in e).map(e => e.edge),
  };
}

function extractEntities(
  data: GAnyValue
): Array<{ vertex: Vertex } | { edge: Edge }> {
  if (data["@type"] === "g:Edge") {
    return [{ edge: mapApiEdge(data) }];
  } else if (data["@type"] === "g:Vertex") {
    return [{ vertex: mapApiVertex(data) }];
  } else if (data["@type"] === "g:Path") {
    return extractEntities(data["@value"].objects);
  } else if (
    data["@type"] === "g:List" ||
    data["@type"] === "g:Map" ||
    data["@type"] === "g:Set"
  ) {
    return data["@value"].flatMap((item: GAnyValue) => extractEntities(item));
  }
  return [];
}
