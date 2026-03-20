# Graph Explorer Internal Knowledge Sharing Session

- **Date:** March 25, 2026
- **Format:** Virtual video conference, 60 minutes, solo presenter
- **Audience:** Mixed internal AWS employees (devs, SAs, support, PMs) — assume graph database familiarity but no prior Graph Explorer experience

---

## Positioning Statement

"Graph Explorer is an open-source, low-code visual interface for exploring graph databases — built for Neptune but works with any Gremlin or SPARQL endpoint, plus openCypher on Neptune and Neptune Analytics."

---

## Slides (5 slides)

1. **Title slide** — Session name, your name, date
2. **About me** — Brief intro
3. **Brief history of Graph Explorer** — When it launched, what's changed, why they should care now
4. **Agenda** — Quick list of what you'll demo
5. **Resources & Call to Action** — GitHub repo link, "try it via Neptune Notebooks," your contact info

---

## Demo Flow & Timing

| #   | Section                          | Time    | Key Beats                                                                                                                                                                                                              |
| --- | -------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Intro slides                     | ~5 min  | Title, about me, history, agenda. Mention deployment: comes pre-installed with Neptune Notebooks, packaged as Docker container for flexible deployment, details on GitHub.                                             |
| 2   | Connection details & schema sync | ~3 min  | Show pre-configured connection. Walk through connection options, explain default connections, talk about schema sync process. Connect.                                                                                 |
| 3   | Schema explorer                  | ~3 min  | "What's in this database?" Show node types, edge types. Click into a type to see properties. Mention schema is inferred from Neptune's summary API + data sampling — not strict, may not be 100% accurate.             |
| 4   | Search & filter                  | ~5 min  | Show filter controls: filter by node type or all, filter by property or all. Search for a specific actor. Show results list — expand a result to see details. Use "add to graph" button to put the node on the canvas. |
| 5   | Neighbor expansion               | ~7 min  | Follow a pre-planned path through the data. Expand neighbors from the actor. Pick a movie, expand its cast. Show filtered expansion (by type/edge type). Land on a surprising connection between two actors.           |
| 6   | Table view                       | ~3 min  | Show table view of nodes/edges on the graph. Demonstrate filtering and sorting.                                                                                                                                        |
| 7   | Custom styling                   | ~5 min  | Change node colors and icons by type. Set display name attribute and display description attribute. Mention styles persist across sessions.                                                                            |
| 8   | Query editor                     | ~5 min  | Write a live Gremlin query. Show results on the graph. Position as a power user tool.                                                                                                                                  |
| 9   | Wrap-up                          | ~2 min  | Mention sharing features (screenshot, save to file) — no demo. Show resources slide. Call to action: try it via Neptune Notebooks, check GitHub, reach out to you.                                                     |
| 10  | Q&A                              | ~18 min | Field questions. Have planted questions ready if audience is quiet. Architecture/internals discussion if asked.                                                                                                        |
|     | Buffer                           | ~4 min  |                                                                                                                                                                                                                        |

---

## Planted Q&A Questions

If the audience is quiet, lead with "A question I get a lot is..."

1. "Does Graph Explorer work with databases other than Neptune?" — Yes, any Gremlin or SPARQL endpoint. openCypher is Neptune/Neptune Analytics only.
2. "How does it handle large graphs with millions of nodes?" — Talk about limits, pagination, and how the tool is designed for exploration not bulk visualization.
3. "Is Graph Explorer actively maintained? What's the team working on?" — Share what you can about recent improvements and direction.
4. "Can I contribute to Graph Explorer?" — Yes, it's open source. Point to the GitHub repo, contribution guidelines.
5. "How does this compare to using the Neptune Workbench or Graph Notebook?" — Different tools for different workflows. Graph Explorer is visual and low-code, Notebook is programmatic.

---

## Prep Checklist

### By end of Friday, March 20

- [x] Create Neptune instance
- [x] Deploy Graph Explorer against it
- [x] Generate and load movie dataset

### By end of weekend / Monday, March 23

- [x] Create slides
- [ ] Pre-plan the exact demo path through the movie data (which actor → which movie → which expansion → surprise connection)
- [ ] Test the full demo flow end to end

### Monday/Tuesday, March 23-24

- [ ] Dry run with team
- [ ] (Optional) Record backup video during dry run or practice

### Day of, March 25

- [ ] Verify Neptune instance and Graph Explorer are running
- [ ] Clear any stale data from Graph Explorer (fresh canvas)
- [ ] Have resources slide link ready to drop in chat

---

## Movie Dataset Requirements

- ~100-200 movies with real data (titles, years, ratings, genres)
- Node types: Movie, Person, Genre, Studio, Award
- Edge types: ACTED_IN, DIRECTED, HAS_GENRE, PRODUCED_BY, WON_AWARD
- Real recognizable entries (Tom Hanks, Shawshank Redemption, etc.)
- Pre-plan 2-3 interesting traversal paths with surprising connections
- Format: Gremlin-compatible load script for Neptune
