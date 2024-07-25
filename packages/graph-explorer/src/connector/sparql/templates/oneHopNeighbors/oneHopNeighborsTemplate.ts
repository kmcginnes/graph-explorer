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
 *   ?subject a     ?subjectClass;
 *            ?pred ?value {
 *     SELECT DISTINCT ?subject ?pToSubject ?pFromSubject {
 *       BIND(<http://www.example.com/soccer/resource#EPL> AS ?argument)
 *       VALUES ?subjectClass {
 *         <http://www.example.com/soccer/ontology/Team>
 *       }
 *       {
 *         ?argument ?pToSubject ?subject.
 *         ?subject a            ?subjectClass;
 *                  ?sPred       ?sValue .
 *         FILTER (
 *           (?sPred=<http://www.example.com/soccer/ontology/teamName> && regex(str(?sValue), "Arsenal", "i")) ||
 *           (?sPred=<http://www.example.com/soccer/ontology/nickname> && regex(str(?sValue), "Gunners", "i"))
 *         )
 *       }
 *       UNION
 *       {
 *         ?subject ?pFromSubject ?argument;
 *                  a             ?subjectClass;
 *                  ?sPred        ?sValue .
 *        FILTER (
 *           (?sPred=<http://www.example.com/soccer/ontology/teamName> && regex(str(?sValue), "Arsenal", "i")) ||
 *           (?sPred=<http://www.example.com/soccer/ontology/nickname> && regex(str(?sValue), "Gunners", "i"))
 *         )
 *       }
 *     }
 *     LIMIT 2
 *     OFFSET 0
 *   }
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
    SELECT DISTINCT ?subject ?p ?value
    WHERE {
      {
        # This sub-query will give us all unique neighbors within the given limit
        SELECT DISTINCT ?neighbor
        WHERE {
          BIND(<${resourceURI}> AS ?source)
          ${getSubjectClasses(subjectClasses)}
          {
            # Incoming neighbors
            ?neighbor ?pToSource ?source . 
            ?neighbor ?pClass    ?class .
            ?neighbor ?pValue    ?sValue .
            FILTER(isLiteral(?sValue))
            ${getFilters(filterCriteria)}
          }
          UNION
          { 
            # Outgoing neighbors
            ?source   ?pFromSource ?neighbor . 
            ?neighbor ?pClass      ?class .
            ?neighbor ?pValue      ?sValue .
            FILTER(isLiteral(?sValue))
            ${getFilters(filterCriteria)}
          }
        }
        ORDER BY ?neighbor
        ${getLimit(limit, offset)}
      }
      
      # Using the ?neighbor gathered above we can start getting 
      # the information we are really interested in
      #
      # - predicate to source from neighbor
      # - predicate from source to neighbor
      # - neighbor class
      # - neighbor values
      
      {    
        # Incoming connection predicate
        BIND(<${resourceURI}> AS ?source)
        ?neighbor ?pToSource ?source
        BIND(?neighbor as ?subject)
        BIND(?pToSource as ?p)
        BIND(?source as ?value)
      }
      UNION
      {
        # Outgoing connection predicate
        BIND(<${resourceURI}> AS ?source)
        ?source ?pFromSource ?neighbor
        BIND(?neighbor as ?value)
        BIND(?pFromSource as ?p)
        BIND(?source as ?subject)
      }
      UNION
      {
        # Class
        ?neighbor ?pClass ?class .
        ?neighbor a ?class . 
        BIND(?neighbor as ?subject)
        BIND(?pClass as ?p)
        BIND(?class as ?value)
      }
      UNION
      {
        # Values
        ?neighbor ?p ?value
        FILTER (isLiteral(?value))
        BIND(?neighbor as ?subject)
      }
    }
    ORDER BY ?subject
  `;

  // return dedent`
  //   # Fetch all neighbors and their predicates, values, and classes
  //   SELECT ?subject ?pred ?value ?subjectClass ?pToSubject ?pFromSubject {
  //     ?subject a     ?subjectClass;
  //              ?pred ?value {
  //       SELECT DISTINCT ?subject ?pToSubject ?pFromSubject {
  //         BIND(<${resourceURI}> AS ?argument)
  //         ${getSubjectClasses(subjectClasses)}
  //         {
  //           ?argument ?pToSubject ?subject.
  //           ?subject a         ?subjectClass;
  //                    ?sPred    ?sValue .
  //           ${getFilters(filterCriteria)}
  //         }
  //         UNION
  //         {
  //           ?subject ?pFromSubject ?argument;
  //                    a         ?subjectClass;
  //                    ?sPred    ?sValue .
  //          ${getFilters(filterCriteria)}
  //         }
  //       }
  //       ${getLimit(limit, offset)}
  //     }
  //     FILTER(isLiteral(?value))
  //   }
  // `;
}
