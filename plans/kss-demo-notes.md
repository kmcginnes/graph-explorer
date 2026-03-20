# KSS Demo Notes — March 25, 2026

## Before You Start

- Verify Neptune instance and Graph Explorer are running
- Clear any stale data from Graph Explorer (fresh canvas, no previous session)
- Have the resources slide link ready to paste in chat
- Close unnecessary browser tabs and notifications
- Increase browser zoom if needed for screen share readability

## Positioning Statement

"Graph Explorer is an open-source, low-code visual interface for exploring graph databases — built for Neptune but works with any Gremlin or SPARQL endpoint, plus openCypher on Neptune and Neptune Analytics."

## Deployment Talking Point

Graph Explorer comes pre-installed with Neptune Notebooks. It's also packaged as a Docker container for flexible deployment. More details on GitHub.

## Demo Flow

### 1. Connection Details & Schema Sync (~3 min)

- Connection is pre-configured — don't fill in fields live
- Walk through the connection options on screen
- Explain default connections: "You can set a default connection that loads automatically"
- Talk about the schema sync process: "When you connect, Graph Explorer syncs the schema by using Neptune's summary API and sampling graph data"
- Click connect

### 2. Schema Explorer (~3 min)

- Narrative: "I just connected to a database — what's in it?"
- Show node types: Movie, Person, Genre, Studio, Award
- Show edge types: ACTED_IN, DIRECTED, HAS_GENRE, PRODUCED_BY, WON_AWARD
- Click into Person to show its properties (name, birthYear)
- Click into Movie to show its properties (title, year, rating, tagline)
- Mention: "This schema is inferred from Neptune's summary API and data sampling — it's not a strict schema and may not be 100% accurate"
- Do NOT mention counts per type (they don't always populate)

### 3. Search & Filter (~5 min)

- Show filter controls: filter by node type (select "Person"), filter by property (search by "name")
- Search for "Tom Hanks"
- Show the results list
- Expand a result to show the detail view
- Click "Add to graph" to put Tom Hanks on the canvas
- This is the transition to neighbor expansion

### 4. Neighbor Expansion (~7 min)

**Pre-planned demo path:**

1. **Tom Hanks** → expand neighbors → see his movies (Forrest Gump, Cast Away, Saving Private Ryan, Catch Me If You Can, etc.)
2. Click **Catch Me If You Can** → expand → see Leonardo DiCaprio and Steven Spielberg
3. Click **Leonardo DiCaprio** → expand → see The Departed, Inception, Titanic, etc.
4. Click **The Departed** → expand → see **Jack Nicholson** and Matt Damon
5. Click **Jack Nicholson** → expand → see **Something's Gotta Give**
6. Expand **Something's Gotta Give** → **Meryl Streep** appears

**Surprise connection narrative:** "Starting from Tom Hanks, we've traversed through three clusters of data and discovered that Jack Nicholson connects the DiCaprio and Streep worlds."

**Show filtered expansion at least once:** When expanding a node with many neighbors, show that you can filter by edge type (e.g., expand only ACTED_IN edges from Leonardo DiCaprio).

### 5. Table View (~3 min)

- At this point the graph has many nodes and edges — good time to show table view
- Show filtering by node type in the table
- Show sorting by a property (e.g., sort movies by year or rating)
- Narrative: "If you prefer working with data in a table, everything on the graph is also available here"

### 6. Custom Styling (~5 min)

- Change node colors by type: give Movie, Person, Genre, Studio, Award each a distinct color
- Change node icons by type
- Set display name attribute: Movie → "title", Person → "name", Genre → "name", Studio → "name", Award → "name"
- Set display description attribute: Movie → "year" or "tagline", Person → "birthYear"
- Mention in passing: "These styles persist across sessions, so you don't have to redo this every time"
- The graph should go from a blob of same-colored circles to something visually clear and readable — this is a "wow" moment

### 7. Query Editor (~5 min)

- Position as a power user tool: "Everything so far has been no-code, but if you want full control..."
- Write a live Gremlin query — suggestions:

  ```groovy
  // find top-rated movies
  g.V().hasLabel('Movie')
   .has('rating', gte(8.5))
   .order().by('rating', desc)

  // list Tom Hanks movies
  g.V().has('Person', 'name', 'Tom Hanks')
   .out('ACTED_IN')
   .values('title')
  ```

- Show results appearing in the sidebar
- Add results to the graph
- Using Gremlin for this demo (mention openCypher and SPARQL are also supported)

### 8. Wrap-Up (~2 min)

- Mention sharing features (don't demo): "You can take a screenshot of your graph or save it to a file to share with colleagues who have the same connection"
- Show resources slide
- Call to action:
  - "If you want to try it, spin up a Neptune Notebook and it's already there"
  - "If you want to go deeper, here's the GitHub repo"
  - "If you have questions or feedback, here's how to reach me"

## Planted Q&A Questions

If the audience is quiet, lead with "A question I get a lot is..."

1. **"Does Graph Explorer work with databases other than Neptune?"** — Yes, any Gremlin or SPARQL endpoint. openCypher is Neptune and Neptune Analytics only.
2. **"How does it handle large graphs with millions of nodes?"** — Graph Explorer is designed for exploration, not bulk visualization. You search, filter, and expand incrementally. There are configurable limits on neighbor expansion to keep things manageable.
3. **"Is Graph Explorer actively maintained?"** — Yes, 33 releases across 3 major versions since 2022. Share what you can about recent work and direction.
4. **"Can I contribute?"** — Yes, it's open source. Point to the GitHub repo and contribution guidelines.
5. **"How does this compare to the Neptune Workbench or Graph Notebook?"** — Different tools for different workflows. Graph Explorer is visual and low-code for exploration. Notebook is programmatic for development and analysis.

## Architecture Talking Points (if asked in Q&A)

- Client-side React app with a lightweight proxy server
- Proxy server handles IAM auth and SigV4 request signing
- All user data stored client-side (IndexedDB) — the server stores nothing
- Open-source stack: Cytoscape.js for graph rendering, Jotai for state management, TanStack Query for data fetching

## Things to Avoidg.V().hasLabel('Movie').has('rating', gte(8.5)).order().by('rating', desc)

- Don't mention counts per type in schema explorer (unreliable)
- Don't mention conditional styling based on property values (not supported)
- Don't demo edge styling (out of scope for this session)
- Don't demo deployment or setup process
- Don't show code

## Next Steps

- [ ] Spot-check movie data accuracy (award years, co-stars, studios) before loading into Neptune — some details were written from memory and may be slightly off
- [ ] Test the Gremlin query examples against Neptune — `gte()` predicate syntax can vary, don't debug live
- [ ] Plan when to hit the re-layout button during the demo — after neighbor expansion the graph will be messy, call it out as a feature
- [ ] Screen share setup — decide full screen vs browser window only, hide bookmarks bar and notifications
- [ ] Font size / zoom level — have someone on the dry run confirm readability
- [ ] Remember to shut down the Neptune instance after the session to avoid ongoing costs
- [ ] Create slides in Keynote using content from `plans/kss-slides.md`
- [ ] Create Neptune instance and deploy Graph Explorer
- [ ] Load movie data using scripts in `plans/movie-data/` (run 01 first, then 02-06 in order)
- [ ] Walk through the full demo path end to end and time yourself
- [ ] Dry run with team early next week
- [ ] (Optional) Record backup video during dry run
