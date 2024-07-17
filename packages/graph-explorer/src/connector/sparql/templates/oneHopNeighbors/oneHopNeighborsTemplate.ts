import { SPARQLNeighborsRequest } from "../../types";
import { getFilters, getLimit, getSubjectClasses } from "./helpers";
import dedent from "dedent";

/**
 * Fetch all neighbors and their predicates, values, and classes.
 *
 * @example
 * resourceURI = "http://www.example.com/soccer/resource#EPL"
 * subjectClasses = [
 *   "http://www.example.com/soccer/ontology/Team",
 * ]
 * filterCriteria = [
 *   { predicate: "http://www.example.com/soccer/ontology/teamName", object: "Arsenal" },
 *   { predicate: "http://www.example.com/soccer/ontology/nickname", object: "Gunners" },
 * ]
 * limit = 2
 * offset = 0
 *
 * SELECT ?subject ?pred ?value ?subjectClass ?pToSubject ?pFromSubject {
 * WHERE {
 *   BIND(<http://www.example.com/soccer/resource#EPL> AS ?argument)
 *   VALUES ?subjectClass {
 *     <http://www.example.com/soccer/ontology/Team>
 *   }
 *
 *   {
 *     ?argument ?pToSubject ?subject.
 *     ?subject a ?subjectClass ;
 *             ?pred ?value .
 *     OPTIONAL { ?subject ?sPred ?sValue }
 *     FILTER (
 *       (?sPred=<http://www.example.com/soccer/ontology/teamName> && regex(str(?sValue), "Arsenal", "i")) ||
 *       (?sPred=<http://www.example.com/soccer/ontology/nickname> && regex(str(?sValue), "Gunners", "i"))
 *     )
 *   }
 *   UNION
 *   {
 *     ?subject ?pFromSubject ?argument .
 *     ?subject a ?subjectClass ;
 *             ?pred ?value .
 *     OPTIONAL { ?subject ?sPred ?sValue }
 *     FILTER (
 *       (?sPred=<http://www.example.com/soccer/ontology/teamName> && regex(str(?sValue), "Arsenal", "i")) ||
 *       (?sPred=<http://www.example.com/soccer/ontology/nickname> && regex(str(?sValue), "Gunners", "i"))
 *     )
 *   }
 *
 *   FILTER(isLiteral(?value))
 * }
 */
export default function oneHopNeighborsTemplate({
  resourceURI,
  subjectClasses = [],
  filterCriteria = [],
  limit = 0,
  offset = 0,
}: SPARQLNeighborsRequest): string {
  return dedent`
    # Fetch all neighbors and their predicates, values, and classes
    SELECT ?subject ?pred ?value ?subjectClass
    WHERE {
        {
            SELECT DISTINCT ?subject ?subjectClass
            WHERE {
              BIND(<${resourceURI}> AS ?argument)
              ${getSubjectClasses(subjectClasses)}
              {
                ?argument ?p ?subject .
                ?subject a ?subjectClass .
                ?subject ?sPred ?sValue .
                ${getFilters(filterCriteria)}
              }
              UNION
              {
                ?subject ?p ?argument .
                ?subject a ?subjectClass .
                ?subject ?sPred ?sValue .
                ${getFilters(filterCriteria)}
              }
            }
            ORDER BY ?subject
            ${getLimit(limit, offset)}
        }
        ?subject ?pred ?value .
        FILTER(isLiteral(?value))
    }
    ORDER BY ?subject
  `;
}
