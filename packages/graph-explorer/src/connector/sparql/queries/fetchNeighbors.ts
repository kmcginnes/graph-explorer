import groupBy from "lodash/groupBy";
import { Edge, Vertex } from "../../../@types/entities";
import type { NeighborsResponse } from "../../useGEFetchTypes";
import mapIncomingToEdge, {
  IncomingPredicate,
  isIncomingPredicate,
} from "../mappers/mapIncomingToEdge";
import mapOutgoingToEdge, {
  OutgoingPredicate,
} from "../mappers/mapOutgoingToEdge";
import mapRawResultToVertex from "../mappers/mapRawResultToVertex";
import oneHopNeighborsTemplate from "../templates/oneHopNeighbors/oneHopNeighborsTemplate";
import subjectPredicatesTemplate from "../templates/subjectPredicates/subjectPredicatesTemplate";
import {
  RawResult,
  RawValue,
  SparqlFetch,
  SPARQLNeighborsRequest,
} from "../types";
import { logger } from "../../../utils";

type RawOneHopNeighborsResponse = {
  results: {
    bindings: Array<{
      subject: RawValue;
      p: RawValue;
      value: RawValue;
    }>;
  };
};

type RawNeighborsPredicatesResponse = {
  results: {
    bindings: Array<OutgoingPredicate | IncomingPredicate>;
  };
};

const isBlank = (result: RawValue) => {
  return result.type === "bnode";
};

type DraftRdfNode = {
  uri: string;
  class?: RawValue;
  attributes?: { predicate: string; value: string | number }[];
};

const fetchOneHopNeighbors = async (
  sparqlFetch: SparqlFetch,
  req: SPARQLNeighborsRequest
) => {
  const oneHopTemplate = oneHopNeighborsTemplate(req);
  logger.log("[SPARQL Explorer] Fetching oneHopNeighbors...", req);
  const data = await sparqlFetch<RawOneHopNeighborsResponse>(oneHopTemplate);
  logger.log("[SPARQL Explorer] Fetched oneHopNeighbors", data);

  // Get node related triples
  const nodeTriples = data.results.bindings.filter(
    triple =>
      triple.subject.value !== req.resourceURI &&
      triple.value.value !== req.resourceURI
  );

  const nodes = nodeTriples.reduce((prev, current) => {
    const updated = new Map(prev);
    const uri = current.subject.value;
    const existingDraft: DraftRdfNode = updated.get(uri) ?? { uri };
    if (current.p.value === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type") {
      updated.set(uri, {
        ...existingDraft,
        class: current.value,
      });
    } else {
      const existingAttributes = existingDraft.attributes ?? [];

      updated.set(uri, {
        ...existingDraft,
        attributes: [
          ...existingAttributes,
          { predicate: current.p.value, value: current.value.value },
        ],
      });
    }
    return updated;
  }, new Map<string, DraftRdfNode>());

  logger.debug("Draft RDF Nodes", nodes);

  const rawNodes = [...nodes]
    .map(([uri, draft]) => draft)
    .map(draft => {
      if (!draft.class) {
        return null;
      }
      const attributes: Record<string, string | number> = {};
      for (const attribute of draft.attributes ?? []) {
        attributes[attribute.predicate] = attribute.value;
      }
      return {
        uri: draft.uri,
        class: draft.class.value,
        attributes: attributes,
        isBlank: false,
      } as RawResult;
    })
    .filter(raw => raw != null);

  logger.debug("Raw Nodes", rawNodes);

  // Get edge related triples
  const incomingEdgeTriples = data.results.bindings
    .filter(triple => triple.value.value === req.resourceURI)
    .map(
      triple =>
        ({
          subject: triple.subject,
          predFromSubject: triple.p,
          subjectClass: nodes.get(triple.subject.value)?.class,
        }) as IncomingPredicate
    )
    .map(result =>
      mapIncomingToEdge(req.resourceURI, req.resourceClass, result)
    );
  const outgoingEdgeTriples = data.results.bindings
    .filter(triple => triple.subject.value === req.resourceURI)
    .map(
      triple =>
        ({
          subject: triple.value,
          predToSubject: triple.p,
          subjectClass: nodes.get(triple.value.value)?.class,
        }) as OutgoingPredicate
    )
    .map(result =>
      mapOutgoingToEdge(req.resourceURI, req.resourceClass, result)
    );

  const groupBySubject = groupBy(
    data.results.bindings,
    result => result.subject.value
  );

  // const mappedResults: Record<string, RawResult> = {};
  const bNodesEdges: Edge[] = [];

  // Object.entries(groupBySubject).forEach(([uri, result]) => {
  //   // Create outgoing predicates to blank nodes
  //   // if (isBlank(result[0].subject) && result[0].pToSubject) {
  //   //   const edge = mapOutgoingToEdge(req.resourceURI, req.resourceClass, {
  //   //     subject: result[0].subject,
  //   //     subjectClass: result[0].subjectClass,
  //   //     predToSubject: result[0].pToSubject,
  //   //   });
  //   //   bNodesEdges.push(edge);
  //   // }

  //   // // Create incoming predicates from blank nodes
  //   // if (isBlank(result[0].subject) && result[0].pFromSubject) {
  //   //   const edge = mapIncomingToEdge(req.resourceURI, req.resourceClass, {
  //   //     subject: result[0].subject,
  //   //     subjectClass: result[0].subjectClass,
  //   //     predFromSubject: result[0].pFromSubject,
  //   //   });
  //   //   bNodesEdges.push(edge);
  //   // }

  //   mappedResults[uri] = {
  //     uri: uri,
  //     class: result[0].subjectClass.value,
  //     isBlank: isBlank(result[0].subject),
  //     attributes: {},
  //   };

  //   result.forEach(attr => {
  //     mappedResults[uri].attributes[attr.pred.value] = attr.value.value;
  //   });
  // });

  const vertices = rawNodes.map(result => {
    return mapRawResultToVertex(result);
  });

  logger.debug("Mapped Nodes", vertices);

  return {
    vertices,
    bNodesEdges,
    edges: [...incomingEdgeTriples, ...outgoingEdgeTriples],
  };
};

export const fetchNeighborsPredicates = async (
  sparqlFetch: SparqlFetch,
  resourceURI: string,
  resourceClass: string,
  subjectURIs: string[]
) => {
  const template = subjectPredicatesTemplate({
    resourceURI,
    subjectURIs,
  });

  logger.log("[SPARQL Explorer] Fetching neighbor predicates...", {
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
};

/**
 * Given a subject URI, it returns a set of subjects (with their properties)
 * which are directly connected.
 * We differentiate two types of neighbors:
 * - outgoing neighbors, which are neighbors that are reached using
 *   the given subject as starting point (<subject_uri> ?pred ?outgoingSubject)
 * - incoming neighbors, which are neighbors can reach the given
 *   subject (?incomingSubject ?pred <subject_uri>)
 *
 * It also, perform a query for each neighbors to know
 * how many subjects are connected to it.
 *
 * It does not return neighbors counts.
 */
const fetchNeighbors = async (
  sparqlFetch: SparqlFetch,
  req: SPARQLNeighborsRequest
): Promise<NeighborsResponse> => {
  const { vertices, bNodesEdges, edges } = await fetchOneHopNeighbors(
    sparqlFetch,
    req
  );
  // const subjectsURIs = vertices.map(v => v.data.id);
  // const edges = await fetchNeighborsPredicates(
  //   sparqlFetch,
  //   req.resourceURI,
  //   req.resourceClass,
  //   subjectsURIs
  // );

  return {
    vertices,
    edges: [...edges, ...bNodesEdges],
  };
};

export default fetchNeighbors;
