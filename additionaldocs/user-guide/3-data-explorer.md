# Data Explorer

The Data Explorer provides a tabular interface for browsing and examining your
graph data before visualizing it in the main Graph View.

## Overview

You can use the Data Explorer UI to view the data for the selected node type.
You can open the Data Explorer by clicking the node type row in the connection
details pane.

## Key Features

### Tabular Data View

- View tabular data for the selected node type
- Browse through paginated results for large datasets
- Sort and filter data within the table interface
- Get a comprehensive overview of node properties and values

### Attribute Configuration

- Set the node type display name and description attributes
- Configure how nodes will appear in the main Graph View
- Define which properties are most important for identification and description

### Graph Integration

- Send a specific node to the graph view for visualization
- Select multiple nodes to add to the Graph View simultaneously
- Seamlessly transition between tabular browsing and graph visualization

## Using Data Explorer

### Accessing Data Explorer

1. Navigate to the Connections UI
2. Select an active connection
3. In the Connection Details panel, find the list of node types
4. Click the '>' arrow next to any node type to open Data Explorer

### Browsing Data

The Data Explorer presents your graph data in a familiar table format:

- **Columns** represent node properties/attributes
- **Rows** represent individual nodes of the selected type
- **Pagination** controls help navigate through large datasets
- **Sorting** options allow you to order data by any column

### Configuring Display Attributes

Use the Data Explorer to set up how nodes will appear in the Graph View:

1. **Display Name Attribute**: Choose which property should be used as the
   primary label for nodes
2. **Display Description Attribute**: Select which property provides additional
   context in search results and tooltips

### Sending Data to Graph View

Once you've identified interesting nodes:

1. **Select individual nodes** using checkboxes or row selection
2. **Click "Send to Explorer"** to add selected nodes to the Graph View
3. **Switch to Graph View** to see the visualization and explore relationships

## Integration with Graph View

### Seamless Workflow

The Data Explorer is designed to work seamlessly with the Graph View:

1. **Discovery**: Use Data Explorer to discover and examine nodes
2. **Selection**: Choose specific nodes of interest
3. **Visualization**: Send selected nodes to Graph View
4. **Exploration**: Use Graph View to explore relationships and expand the
   network

### Configuration Persistence

Settings configured in Data Explorer persist across your session:

- Display name and description attributes remain set for each node type
- These settings apply to all instances of that node type in the Graph View
- Configuration helps maintain consistent visualization across your exploration

## Best Practices

### Efficient Data Browsing

1. **Start with Data Explorer** when working with unfamiliar datasets
2. **Examine property distributions** to understand your data structure
3. **Set meaningful display attributes** before sending nodes to Graph View
4. **Use sorting and filtering** to find the most relevant nodes

### Preparing for Visualization

1. **Configure display attributes** for each node type you plan to visualize
2. **Select representative nodes** rather than sending entire datasets to Graph
   View
3. **Start with a small set** of nodes and expand using Graph View's neighbor
   expansion
4. **Use descriptive properties** for display names to make the graph more
   readable

### Working with Large Datasets

1. **Use pagination** to browse through large node collections efficiently
2. **Apply filters** within the table to narrow down to relevant subsets
3. **Sort by meaningful attributes** to find the most important or interesting
   nodes
4. **Send small batches** to Graph View to maintain performance

## Troubleshooting

### Performance Considerations

- Large node types may take time to load in Data Explorer
- Consider using search filters in the main Graph View for very large datasets
- Pagination helps manage memory usage when browsing extensive data

### Data Display Issues

- If node properties don't display as expected, check your database schema
- Ensure your connection has proper read permissions for the data
- Verify that the node type synchronization is up to date

For additional troubleshooting, see the
[Common Issues](../troubleshooting/common-issues.md) guide.
