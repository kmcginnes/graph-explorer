import dedent from "dedent";
import { SPARQLNeighborsCountRequest } from "../../types";

/**
 * Count neighbors by class which are related with the given subject URI.
 *
 * @example
 * resourceURI = "http://kelvinlawrence.net/air-routes/resource/2018"
 * limit = 10
 *
 * SELECT ?class (COUNT(?class) AS ?count) {
 *   SELECT DISTINCT ?subject ?class {
 *     ?subject a ?class .
 *     { ?subject ?p <http://kelvinlawrence.net/air-routes/resource/2018> }
 *     UNION
 *     { <http://kelvinlawrence.net/air-routes/resource/2018> ?p ?subject }
 *   }
 *   LIMIT 10
 * }
 * GROUP BY ?class
 */
export default function neighborsCountTemplate({
  resourceURI,
  limit = 0,
}: SPARQLNeighborsCountRequest) {
  return dedent`
    # Count neighbors by class which are related with the given subject URI
    SELECT ?class (COUNT(DISTINCT ?subject) as ?count)
    WHERE {
      SELECT ?subject (MIN(?class) as ?class) WHERE {
        {
            ?subject ?p <${resourceURI}> .
            ?subject a ?class .
        }
        UNION
        {
            <${resourceURI}> ?p ?subject .
            ?subject a ?class .
        }
      }
      GROUP BY ?subject
      ${limit > 0 ? `LIMIT ${limit}` : ""}
    }
    GROUP BY ?class
  `;
}
