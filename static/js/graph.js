
var graph = {};

var onready = function() {
  console.log('Ready');
};

var onstop = function() {
  console.log('Stop');
};

var simulate = function(profileSpreading) {
  var url = '/simulation';
  var data = {
    spreading: profileSpreading,
    graph: graph
  };
  $.ajax(url, {
    type: 'POST',
    data: JSON.stringify(data),
    success: function(response) {
      console.log('Done', response);
      showStatistics(response.statistics);
    },
    contentType: 'application/json'
  });
};

var showStatistics = function(statistics) {
  clearStats();

  var stats = $("#statistics");

  stats.append('<span><strong>Simulation Log</strong></span><br>');
  _.each(statistics.replies_log, function(reply) {
    stats.append('<span>' + reply + '</span><br>');
  });

  stats.append('<br><span><strong>Statistics</strong></span><br>');
  _.each(statistics.votes, function(vote) {
    stats.append('<span>' + vote.voted_item + '&#32;gots&#32;</span>');
    stats.append('<span>' + vote.votes_amount + '%&#32;of&#32;votes</span><br>');
  });

  stats.append('<br>');
  stats.append('<span><strong>Total number of sms:</strong> ' + statistics.request_number + '</span><br>');
  stats.append('<span><strong>Total number of replies:</strong> ' + statistics.replies_number + '</span><br>');
  stats.append('<span><strong>Total number of forwards:</strong> ' + statistics.forwards_number + '</span><br><br>');
};

var renderGraph = function(nodes, edges, root, layout) {
  var selectedNode = 'node[id = "' + root.id + '"]';  
  var styles = [
    {
      selector: 'node',
      style: {
        'background-color': 'red',
        'label': 'data(name)'
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 3,
        'line-color': 'green'
      }
    },
    {
      selector: selectedNode,
      style: {
        'background-color': 'blue'
      }
    }
  ];
  var layout = {
    name: layout.name,
    fit: true,
    directed: true,
    padding: 30,
    circle: false,
    spacingFactor: 1.0,
    boundingBox: undefined,
    avoidOverlap: true,
    roots: undefined,
    maximalAdjustments: 0,
    animate: true,
    animationDuration: 1000,
    animationEasing: undefined,
    ready: onready,
    stop: onstop
  };

  var cy = cytoscape({
    container: document.getElementById('cy'),
    style: styles,
    layout: layout,
    elements: {
      nodes: nodes,
      edges: edges
    }
  });
};

var formatNodes = function(nodes) {
  var formatted_items = [];
  _.each(nodes, function(node) {
    formatted_items.push({
      data: {
        id: node.id,
        name: node.name,
        gender: node.gender,
        age: node.age,
        contacts: node.contacts,
      }
    });
  });
  return formatted_items;
};

var formatEdges = function(edges) {
  var formatted_items = [];
  _.each(edges, function(edge) {
    formatted_items.push({
      data: {
        source: edge[0],
        target: edge[1],
        messages_number: edge[2]
      }
    });
  });
  return formatted_items;
};

var generateGraph = function() {
  $.get("/generate-tree", function(response) {
    console.log('Received data: ', response);
    graph = {
      root: response.root,
      nodes: formatNodes(response.nodes),
      edges: formatEdges(response.edges)
    }
    renderGraph(graph.nodes, graph.edges, graph.root, {name: 'cose-bilkent'});
  });
};

var loadGraph = function(name) {
  console.log('Loading graph: ', name);
  var url = "http://localhost:5000/load/" + name;
  $.get(url, function(response) {
    console.log('Received data: ', response);
    graph = {
      root: response.root,
      nodes: response.nodes,
      edges: response.edges
    };
    renderGraph(graph.nodes, graph.edges, graph.root, {name: 'cose-bilkent'});
  });
};

var refreshGraph = function(layout) {
  console.log(layout);
  renderGraph(graph.nodes, graph.edges, graph.root, {name: layout});
};

var saveGraph = function() {
  if (!$(graph_name)[0].value) {
    return;
  };
  var data = {
    name: $(graph_name)[0].value,
    graph: this.graph
  };
  $.ajax("/save", {
    type: 'POST',
    data: JSON.stringify(data),
    success: function() {
      console.log('Done');
    },
    contentType: 'application/json'
  });
};

var removeGraph = function(graphName) {
    var data = {
        name: graphName
    };
    $.ajax("/delete", {
        type: 'POST',
        data: JSON.stringify(data),
        success: function() {
          document.getElementById(graphName).remove();
        },
        contentType: 'application/json'
    });
};

var clearStats = function() {
  var stats = $("#statistics");
  _.each(stats.children(), function(child) {
    child.remove();
  });
};