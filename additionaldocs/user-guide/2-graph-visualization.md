# Graph Visualization

This guide covers the comprehensive graph visualization capabilities of Graph
Explorer, including the Graph View, customization options, and advanced
visualization techniques.

## Graph View UI

The graph visualization canvas is the main interface where you can interact with
your graph data. Double-click to expand the first-order neighbors of a node.

### Layout and Display Controls

- **Layout drop-down & reset:** You can display graph data using standard graph
  layouts in the Graph View. You can use the circular arrow to reset the physics
  of a layout.
- **Screenshot:** Download a picture of the current window in Graph View.
- **Save Graph:** Save the current rendered graph as a JSON file that can be
  shared with others having the same connection or reloaded at a later time.
- **Load Graph:** Load a previously saved graph from a JSON file.
- **Zoom In/Out & Clear:** To help users quickly zoom in/out or clear the whole
  canvas in the Graph View.
- **Legend (i):** This displays an informational list of icons, colors, and
  display names available.

## Search and Query Interface

Graph Explorer Search UI provides two powerful ways to search and interact with
your graph database:

### Filter Search

- Enables faceted filtering of nodes based on:
  - Node labels (or rdf:type for RDF databases)
  - Node attribute values
- Supports partial text matching
- Search results can be added to the graph individually or all at once
- Supports cancellation of long-running queries

### Query Search

- Available for Gremlin and openCypher connections
- Allows execution of any valid database query, including mutations
- When adding an edge, its connected nodes are automatically included
- Displays scalar values in results (though these cannot be added to the graph)
- Paginates large result sets
- Results can be added to the graph individually or all at once
- Supports cancellation of long-running queries

## Node and Edge Details

### Details Panel

- Displays attributes and values for node or edge selections
- Displays neighbor counts by label for node selections
- Displays relationship information for edge selections

### Expand Panel

Provides fine grained control over neighbor expansions

- Filter by node label (or rdf:type for RDF databases)
- Filter by attribute value
- Limit results to a maximum size

## Customization and Styling

### Node Styling Panel

Each node type can be customized in a variety of ways.

- **Display label** allows you to change how the node label (or rdf:type) is
  represented
- **Display name attribute** allows you to choose the attribute on the node that
  is used to uniquely label the node in the graph visualization and search
- **Display description attribute** allows you to choose the attribute on the
  node that is used to describe the node in search
- **Custom symbol** can be uploaded in the form of an SVG icon
- **Colors and borders** can be customized to visually distinguish from other
  node types

### Edge Styling Panel

Each edge type can be customized in a variety of ways.

- **Display label** allows you to change how the edge label (or predicate in RDF
  databases) is represented
- **Display name attribute** allows you to choose the attribute on the edge that
  is used to uniquely label the edge in the graph visualization and search
- **Arrow symbol** can be chosen for both source and target variations
- **Colors and borders** can be customized for the edge label and the line
- **Line style** can be solid, dotted, or dashed

### Entities Filter Panel

Provides the ability to filter nodes or edges from the visualization by label
(or rdf:type for RDF databases)

## RDF-Specific Features

### Namespace Panel

- Only visible in RDF connections
- Displays any automatically generated namespace prefixes for the connection
- Displays all the common prefixes that are built-in
- Allows creation and management of any custom namespace prefixes

Namespaces allow you to shorten the display of Resource URIs within the app
based on auto-generated prefixes, commonly-used prefix libraries, or custom
prefixes set by the user. Order of priority is set to Custom > Common >
Auto-generated.

## Table View Integration

### Table View UI

This collapsible view shows a row-column display of the data in the Graph View.
You can use filters in the Table to show/hide elements in the Graph View, and
you can export the table view into a CSV or JSON file.

The following columns are available for filtering on property graphs (RDF graphs
in parentheses):

- Node ID (Resource URI)
- Node Type (Class)
- Edge Type (Predicate)
- Source ID (Source URI)
- Source Type (Source Class)
- Target ID (Target URI)
- Target Type (Target Class)
- Display Name - Set in the Node/Edge Styling panes
- Display Description - Set in the Node/Edge Styling panes
- Total Neighbors - Enter an integer to be used as the >= limit

### Additional Table View Features

- **Visibility** - manually show or hide nodes or edges
- **All Nodes / All Edges (or All Resources / All Predicates) dropdown** -
  allows you to display a list of either nodes or edges and control
  display/filter on them
- **Download** - You can download the current Table View as a CSV or JSON file
  with additional customization options
- **Default columns** - You can set which columns you want to display
- Paging of rows

## Advanced Visualization Techniques

### Interactive Graph Exploration

- **Double-click nodes** to expand their first-order neighbors
- **Select multiple nodes** to perform bulk operations
- **Use keyboard shortcuts** for efficient navigation
- **Drag and drop** to rearrange the graph layout

### Performance Optimization

- Use the **Entities Filter Panel** to hide unnecessary nodes and edges
- Set appropriate **expansion limits** to prevent overwhelming visualizations
- Utilize **search filters** to focus on specific subsets of data
- **Save and load graphs** to preserve complex visualizations

### Sharing and Export

- **Screenshot functionality** to capture current visualizations
- **Save Graph as JSON** for sharing with team members
- **Export Table View** as CSV or JSON for further analysis
- **Custom styling** to create consistent visual representations

## Best Practices

1. **Start Small**: Begin with a focused search or specific nodes rather than
   loading large datasets
2. **Use Filters**: Apply filters early to manage the complexity of large graphs
3. **Customize Styling**: Set up meaningful colors and labels to distinguish
   different node and edge types
4. **Save Progress**: Regularly save your graph configurations for future
   reference
5. **Leverage Search**: Use both filter and query search to efficiently find
   relevant data
