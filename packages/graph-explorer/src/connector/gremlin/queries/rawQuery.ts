import {
  ErrorResponse,
  RawQueryRequest,
  RawQueryResponse,
} from "@/connector/useGEFetchTypes";
import { GEntityList, GremlinFetch } from "../types";
import isErrorResponse from "@/connector/utils/isErrorResponse";
import mapApiVertex from "../mappers/mapApiVertex";
import mapApiEdge from "../mappers/mapApiEdge";

type RawGremlinQueryResponse = {
  requestId: string;
  status: {
    message: string;
    code: number;
  };
  result: {
    data: GEntityList;
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

  const vertices = data.result.data["@value"]
    .map(value => {
      return value["@type"] === "g:Vertex" ? mapApiVertex(value) : null;
    })
    .filter(v => v != null);

  const edges = data.result.data["@value"]
    .map(value => {
      return value["@type"] === "g:Edge" ? mapApiEdge(value) : null;
    })
    .filter(e => e != null);

  return { vertices, edges };
}
