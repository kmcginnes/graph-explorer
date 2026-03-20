# Movie Dataset for KSS Demo

Each file is a self-contained Gremlin script that adds a cluster of vertices and edges.
Run them in order to build up the dataset incrementally.

## Files

1. `01-genres-studios.groovy` — Shared genres and studios (run this first)
2. `02-tom-hanks.groovy` — Tom Hanks cluster
3. `03-meryl-streep.groovy` — Meryl Streep cluster
4. `04-leonardo-dicaprio.groovy` — Leonardo DiCaprio cluster
5. `05-denzel-washington.groovy` — Denzel Washington cluster
6. `06-cate-blanchett.groovy` — Cate Blanchett cluster

## Schema

### Node Types

- **Movie**: title, year, rating, tagline
- **Person**: name, birthYear
- **Genre**: name
- **Studio**: name
- **Award**: name

### Edge Types

- **ACTED_IN**: role (Person → Movie)
- **DIRECTED**: (Person → Movie)
- **HAS_GENRE**: (Movie → Genre)
- **PRODUCED_BY**: (Movie → Studio)
- **WON_AWARD**: year (Person → Award, Movie → Award)

## Cross-Cluster Connections

Later clusters share genres, studios, and sometimes movies/people with earlier
clusters, creating natural connections across the graph.

## Suggested Demo Path

1. Search for "Tom Hanks"
2. Expand neighbors → see his movies
3. Click "Forrest Gump" → expand → see Robert Zemeckis, Robin Wright, Gary Sinise
4. Click "Robert Zemeckis" → expand → see "Cast Away" (also Tom Hanks) and "Back to the Future"
5. Surprise connection: Expand "The Departed" from DiCaprio cluster → find Jack Nicholson → who connects to Meryl Streep via "Something's Gotta Give"
