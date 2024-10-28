import {
  ErrorResponse,
  RawQueryRequest,
  RawQueryResponse,
} from "@/connector/useGEFetchTypes";
import { GAnyValue, GremlinFetch } from "../types";
import isErrorResponse from "@/connector/utils/isErrorResponse";
import { mapResults } from "../mappers/mapResults";

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

  return mapResults(data.result.data);
}
