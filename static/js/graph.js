
var graph = {};

var onready = function() {
  console.log('Ready');
};

var onstop = function() {
  console.log('Stop');
};

var simulate = function() {
  var url = '/simulation';
  $.ajax(url, {
    type: 'POST',
    data: JSON.stringify(graph),
    success: function() {
      console.log('Done');
    },
    contentType: 'application/json'
  });
};

var showStatistics = function(statistics) {
  $("#statistics").append('<span>Statistics</span><br>');    
  $("#statistics").append('<span>Total requests number: ' + statistics.request_number + '</span><br>');
  $("#statistics").append('<span>Total replies number: ' + statistics.replies_number + '</span><br>');

  _.each(statistics.votes, function(vote) {
    $("#statistics").append('<span>' + vote.voted_item + '&#32;gots&#32;</span>');
    $("#statistics").append('<span>' + vote.votes_amount + '%&#32;of&#32;votes</span><br>');
  });

  $("#statistics").append('<br><span>Replies log:</span><br>');
  _.each(statistics.replies_log, function(reply) {
    $("#statistics").append('<span>' + reply + '</span><br>');
  });
};

var renderGraph = function(nodes, edges) {
  var cy = cytoscape({
    container: document.getElementById('cy'),
      style: [
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
        }
      ],
      layout: {
        name: 'breadthfirst',
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
      },
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
        id: node.uid,
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
    renderGraph(graph.nodes, graph.edges);
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
    renderGraph(graph.nodes, graph.edges);
  });
};