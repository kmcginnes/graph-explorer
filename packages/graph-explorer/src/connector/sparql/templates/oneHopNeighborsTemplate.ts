import dedent from "dedent";
import { SPARQLNeighborsRequest } from "../types";

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
  const getSubjectClasses = () => {
    if (!subjectClasses?.length) {
      return "";
    }

    return `VALUES ?class { ${subjectClasses.map(c => `<${c}>`).join(" ")} }`;
  };

  const getFilters = () => {
    if (!filterCriteria?.length) {
      return "";
    }

    const filters = filterCriteria
      .map(
        c =>
          `(?sPred=<${c.predicate}> && regex(str(?sValue), "${c.object}", "i"))`
      )
      .join(" || ");
    return `FILTER(${filters})`;
  };

  const limitTemplate = limit > 0 ? `LIMIT ${limit} OFFSET ${offset}` : "";

  return dedent`
    SELECT DISTINCT ?subject ?p ?value
    WHERE {
      {
        # This sub-query will give us all unique neighbors within the given limit
        SELECT DISTINCT ?neighbor
        WHERE {
          BIND(<${resourceURI}> AS ?source)
          ${getSubjectClasses()}
          {
            # Incoming neighbors
            ?neighbor ?pToSource ?source . 
            ?neighbor ?pClass    ?class .
            ?neighbor ?pValue    ?sValue .
            ${getFilters()}
          }
          UNION
          { 
            # Outgoing neighbors
            ?source   ?pFromSource ?neighbor . 
            ?neighbor ?pClass      ?class .
            ?neighbor ?pValue      ?sValue .
            ${getFilters()}
          }
        }
        ORDER BY ?neighbor
        ${limitTemplate}
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
  //         ${getSubjectClasses()}
  //         {
  //           ?argument ?pToSubject ?subject.
  //           ?subject a         ?subjectClass;
  //                    ?sPred    ?sValue .
  //           ${getFilters()}
  //         }
  //         UNION
  //         {
  //           ?subject ?pFromSubject ?argument;
  //                    a         ?subjectClass;
  //                    ?sPred    ?sValue .
  //          ${getFilters()}
  //         }
  //       }
  //       ${limitTemplate}
  //     }
  //     FILTER(isLiteral(?value))
  //   }
  // `;
}
