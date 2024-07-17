import groupBy from "lodash/groupBy";
import type { ErrorResponse } from "../../useGEFetchTypes";
import isErrorResponse from "../../utils/isErrorResponse";
import mapIncomingToEdge, {
  IncomingPredicate,
  isIncomingPredicate,
} from "../mappers/mapIncomingToEdge";
import mapOutgoingToEdge, {
  OutgoingPredicate,
} from "../mappers/mapOutgoingToEdge";
import mapRawResultToVertex from "../mappers/mapRawResultToVertex";
import blankNodeOneHopNeighborsTemplate from "../templates/oneHopNeighbors/blankNodeOneHopNeighborsTemplate";
import blankNodeSubjectPredicatesTemplate from "../templates/subjectPredicates/blankNodeSubjectPredicatesTemplate";
import {
  BlankNodeItem,
  RawResult,
  RawValue,
  SPARQLBlankNodeNeighborsResponse,
  SparqlFetch,
} from "../types";
import { logger } from "../../../utils";

type RawBlankNodeNeighborsResponse = {
  results: {
    bindings: Array<{
      bNode: RawValue;
      subject: RawValue;
      pred: RawValue;
      value: RawValue;
      subjectClass: RawValue;
      pToSubject?: RawValue;
      pFromSubject?: RawValue;
    }>;
  };
};

type RawNeighborsPredicatesResponse = {
  results: {
    bindings: Array<OutgoingPredicate | IncomingPredicate>;
  };
};

async function fetchBlankNodeNeighborsPredicates(
  sparqlFetch: SparqlFetch,
  subQuery: string,
  resourceURI: string,
  resourceClass: string,
  subjectURIs: string[]
) {
  const template = blankNodeSubjectPredicatesTemplate({
    subQuery,
    subjectURIs,
  });

  logger.log("[SPARQL Explorer] Fetching blank node neighbor predicates...", {
    subQuery,
    resourceURI,
    resourceClass,
    subjectURIs,
  });
  const response = await sparqlFetch<RawNeighborsPredicatesResponse>(template);
  return response.results.bindings.map(result => {
    if (isIncomingPredicate(result)) {
      return mapIncomingToEdge(resourceURI, resourceClass, result);
    }

    return mapOutgoingToEdge(resourceURI, resourceClass, result);
  });
}

export function mapOneHop(data: RawBlankNodeNeighborsResponse) {
  const groupBySubject = groupBy(
    data.results.bindings,
    result => result.subject.value
  );

  const mappedResults: Record<string, RawResult> = {};

  Object.entries(groupBySubject).forEach(([uri, result]) => {
    mappedResults[uri] = {
      uri: uri,
      class: result[0].subjectClass.value,
      isBlank: result[0].subject.type === "bnode",
      attributes: {},
    };

    result.forEach(attr => {
      mappedResults[uri].attributes[attr.pred.value] = attr.value.value;
    });
  });

  return Object.values(mappedResults).map(result => {
    return mapRawResultToVertex(result);
  });
}

function findBlankNodeTemplate(bNode: BlankNodeItem) {
  const attributeKeys = Object.keys(bNode.vertex.data.attributes);

  if (attributeKeys.length <= 0) {
    return null;
  }

  const matchTemplates: string[] = [];
  const filterTemplates: string[] = [];
  let attributeIndex = 1;

  for (const key of attributeKeys) {
    const value = bNode.vertex.data.attributes[key];
    const attributeValueKey = `?attributeValue${attributeIndex}`;
    matchTemplates.push(`<${key}> ${attributeValueKey} ;`);
    filterTemplates.push(
      `FILTER (regex(str(${attributeValueKey}), "${value}", "i"))`
    );
    attributeIndex += 1;
  }
  return `
    SELECT DISTINCT ?bNode
    WHERE {
      ?bNode a <${bNode.vertex.data.type}> ;
             ${matchTemplates.join("\n             ")}
      ${filterTemplates.join("\n      ")}
    }
  `;
}

export default async function fetchBlankNodeNeighbors(
  sparqlFetch: SparqlFetch,
  bNode: BlankNodeItem
): Promise<SPARQLBlankNodeNeighborsResponse> {
  const req = {
    resourceURI: bNode.vertex.data.id,
    resourceClass: bNode.vertex.data.type,
    subQuery: bNode.subQueryTemplate,
  };
  logger.log("[SPARQL Explorer] Fetching blank node one hop neighbors", {
    req,
    bNode,
  });
  const findBlankNodeSubQuery = findBlankNodeTemplate(bNode);
  const neighborsTemplate = blankNodeOneHopNeighborsTemplate(
    findBlankNodeSubQuery ?? req.subQuery
  );
  const neighbors = await sparqlFetch<
    RawBlankNodeNeighborsResponse | ErrorResponse
  >(neighborsTemplate);

  if (isErrorResponse(neighbors)) {
    throw new Error(neighbors.detailedMessage);
  }

  const filteredNeighbors = neighbors.results.bindings.filter(
    result => result.bNode.value === req.resourceURI
  );

  const vertices = mapOneHop({
    results: {
      bindings: filteredNeighbors,
    },
  });
  const subjectsURIs = vertices.map(v => v.data.id);
  const edges = await fetchBlankNodeNeighborsPredicates(
    sparqlFetch,
    req.subQuery,
    req.resourceURI,
    req.resourceClass,
    subjectsURIs
  );

  return {
    totalCount: vertices.length,
    counts: Object.entries(groupBy(vertices, v => v.data.type)).reduce(
      (counts, [group, vs]) => {
        counts[group] = vs.length;
        return counts;
      },
      {} as Record<string, number>
    ),
    neighbors: {
      vertices,
      edges,
    },
  };
}
