import dedent from "dedent";
import neighborsCountTemplate from "./neighborsCountTemplate";
import { createRandomInteger } from "../../../../utils/testing/randomData";

describe("SPARQL > neighborsCountTemplate", () => {
  it("Should return a template for the given resource URI with default limit", () => {
    const template = neighborsCountTemplate({
      resourceURI: "http://example.org/Person/Charles",
    });

    expect(template).toBe(
      dedent`
        SELECT ?class (COUNT(DISTINCT ?subject) as ?count)
        WHERE {
          SELECT ?subject (MIN(?class) as ?class) WHERE {
            {
                ?subject ?p <http://example.org/Person/Charles> .
                ?subject a ?class .
            }
            UNION
            {
                <http://example.org/Person/Charles> ?p ?subject .
                ?subject a ?class .
            }
          }
          GROUP BY ?subject
          LIMIT 500
        }
        GROUP BY ?class
    `
    );
  });

  it("Should return a template for the given resource URI with custom limit", () => {
    const limit = createRandomInteger(5000);
    const template = neighborsCountTemplate({
      resourceURI: "http://example.org/Person/Charles",
      limit,
    });

    expect(template).toBe(
      dedent`
        SELECT ?class (COUNT(DISTINCT ?subject) as ?count)
        WHERE {
          SELECT ?subject (MIN(?class) as ?class) WHERE {
            {
                ?subject ?p <http://example.org/Person/Charles> .
                ?subject a ?class .
            }
            UNION
            {
                <http://example.org/Person/Charles> ?p ?subject .
                ?subject a ?class .
            }
          }
          GROUP BY ?subject
          LIMIT ${limit}
        }
        GROUP BY ?class
    `
    );
  });

  it("Should return a template for the given resource URI with no limit", () => {
    const template = neighborsCountTemplate({
      resourceURI: "http://example.org/Person/Charles",
      limit: 0,
    });

    expect(template).toBe(
      dedent`
        SELECT ?class (COUNT(DISTINCT ?subject) as ?count)
        WHERE {
          SELECT ?subject (MIN(?class) as ?class) WHERE {
            {
                ?subject ?p <http://example.org/Person/Charles> .
                ?subject a ?class .
            }
            UNION
            {
                <http://example.org/Person/Charles> ?p ?subject .
                ?subject a ?class .
            }
          }
          GROUP BY ?subject
          
        }
        GROUP BY ?class
    `
    );
  });
});
