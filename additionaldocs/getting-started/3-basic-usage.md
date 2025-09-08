# Basic Usage

This guide covers the essential features and basic usage of Graph Explorer after
you've successfully connected to a graph database.

## Graph Explorer UI Overview

Once you create a connection, you can click "Open Graph Explorer" on the
top-right to navigate to the main interface. There are several key features on
this UI:

### Top Bar UI

- **Toggles:** You can toggle to show/hide the Graph View and/or Table View for
  screen real-estate management.
- **Open Connections:** This takes the user back to Connections UI.

### Graph View UI

The graph visualization canvas that you can interact with. Double-click to
expand the first-order neighbors of a node.

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

### Sidebar Panel UI

The panel on the right of the graph provides various actions, configuration, and
details about the open graph.

- **Search panel** allows you to search for specific nodes by filtering on node
  types & attributes or executing a database query then adding nodes & edges to
  the graph panel.
- **Details panel** shows details about a selected node/edge such as properties
  etc.
- **Entities filter panel** is used to control the display of nodes and edges
  that are already expanded in the Graph View; click to hide or show
  nodes/edges.
- **Expand panel** provides controls and filters to help focus large neighbor
  expansions.
- **Node styling panel** of node display options (e.g., color, icon, the
  property to use for the displayed name).
- **Edge styling panel** of edge display options (e.g., color, icon, the
  property to use for the displayed name).
- **Namespaces panel (RDF only)** allows you to shorten the display of Resource
  URIs within the app based on auto-generated prefixes, commonly-used prefix
  libraries, or custom prefixes set by the user. Order of priority is set to
  Custom > Common > Auto-generated.

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

#### Additional Table View UI Features

- **Visibility** - manually show or hide nodes or edges
- **All Nodes / All Edges (or All Resources / All Predicates) dropdown** -
  allows you to display a list of either nodes or edges and control
  display/filter on them
- **Download** - You can download the current Table View as a CSV or JSON file
  with additional customization options
- **Default columns** - You can set which columns you want to display
- Paging of rows

## Getting Started with Your Data

### Using Data Explorer

You can use the Data Explorer UI to view the data for the selected node type.
You can open the Data Explorer by clicking the node type row in the connection
details pane.

- View tabular data for the selected node type
- Set the node type display name and description attributes
- Send a specific node to the graph view

### Basic Search and Exploration

Graph Explorer Search UI provides two powerful ways to search and interact with
your graph database:

#### Filter Search

- Enables faceted filtering of nodes based on:
  - Node labels (or rdf:type for RDF databases)
  - Node attribute values
- Supports partial text matching
- Search results can be added to the graph individually or all at once
- Supports cancellation of long-running queries

#### Query Search

- Available for Gremlin and openCypher connections
- Allows execution of any valid database query, including mutations
- When adding an edge, its connected nodes are automatically included
- Displays scalar values in results (though these cannot be added to the graph)
- Paginates large result sets
- Results can be added to the graph individually or all at once
- Supports cancellation of long-running queries

### Basic Graph Interaction

- **Double-click nodes** to expand their first-order neighbors
- **Select nodes or edges** to view their details in the Details panel
- **Use the Expand panel** to control neighbor expansions with filters
- **Customize styling** using the Node and Edge styling panels
- **Filter visibility** using the Entities filter panel

## Next Steps

Now that you understand the basics, explore these advanced features:

- [Graph Visualization](../user-guide/2-graph-visualization.md) - Advanced
  visualization techniques
- [Data Explorer](../user-guide/3-data-explorer.md) - Detailed data browsing
- [Connection Management](../user-guide/1-connections.md) - Managing multiple
  connections
- [Authentication](../user-guide/4-authentication.md) - Setting up secure
  connections
