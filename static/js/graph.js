
var graph = {};

var onready = function() {
  console.log('Ready');
};

var onstop = function() {
  console.log('Stop');
};

var simulate = function(profileSpreading) {
  var url = '/simulation';
  var params = {
    max_hops: parseInt(document.getElementById('max_hops').value),
    time_limit: parseInt(document.getElementById('time_limit').value),
    ttl: parseInt(document.getElementById('ttl').value),
    reply_prob: parseFloat(document.getElementById('reply_probility').value),
    forwarding_prob: parseFloat(document.getElementById('forwarding_probility').value),
    avg_age: parseFloat(document.getElementById('average_age').value),
    age_dev: parseFloat(document.getElementById('standard_deviation').value),
    clasterization_factor: parseFloat(document.getElementById('clasterization_factor').value),
    transition_time: parseFloat(document.getElementById('transition_time').value),
    receiving_time: parseFloat(document.getElementById('receiving_time').value),
    time_step: parseFloat(document.getElementById('time_step').value),
    question: "What are the best movie?",
    answers: ["A Beautiful mind", "Terminator", "Matrix"],
  };
  var data = {
    spreading: profileSpreading,
    graph: graph,
    params: params,
  };
  $.ajax(url, {
    type: 'POST',
    data: JSON.stringify(data),
    success: function(response) {
      console.log('Done', response);
      showStatistics(response.statistics);
      showAges(graph.nodes);
      showPlots();
      showVotes(response.statistics.votes);
    },
    contentType: 'application/json'
  });
};

var showVotes = function(results) {
  var votes = $("#votes");
  votes.append("<span><strong>Total results of questionary:</strong></span><br>")
  for(var i = 0; i < results.length; i++) {
    votes.append("<span>" + results[i].voted_item + " got: " + results[i].votes_amount + " votes</span><br>");
  }
};

var showPlots = function() {
  var snippet =
    '<div style=\"margin-top: 50px; margin-left: 20px;\">' +
      '<span style=\"margin-left: 40px\">' +
        '<strong>Values of clusterization factor Q = 0.8:</strong>' +
      '</span><br>' +
      '<img src=\"https://pp.vk.me/c604324/v604324845/107d8/15OVxYflxiY.jpg\" />' +
      '<img src=\"https://pp.vk.me/c633128/v633128845/2b94a/UJI4j04ER-I.jpg\" />' +
      '<img src=\"https://pp.vk.me/c628830/v628830845/46ed7/Qo_XQqpSzRI.jpg\" />' +
    '</div>' +
    '<div style=\"margin-top: 80px; margin-left: 20px;\">' +
      '<strong>' +
        '<span style=\"margin-left: 40px;\">' +
          'Example which shows the shape of the age distribution with respect to value of clusterization factor' +
        '</span><br>' +
      '</strong>' +
      '<img src=\"https://pp.vk.me/c633130/v633130845/27d17/5bOqezGJAAk.jpg\" />' +
    '</div>' +
    '<span style=\"margin-left: 60px;\">' +
      '<strong>The formula of age distribution:</strong>' +
      '<img src=\"https://pp.vk.me/c633130/v633130845/28338/9d-YvLqLseo.jpg\" /><br>' +
    '</span>' +
    '<span style=\"margin-left: 60px;\">' +
    '<strong>The formula for clusterization factor:</strong>' +
      '<img src=\"https://pp.vk.me/c633130/v633130845/2833f/LgwkoO_ziYc.jpg\" /><br>' +
    '</span>';
    $("#plots").append(snippet);
};

var showAges = function(nodes) {
  var ages_table = $("#user_ages_table");
  ages_table.append("<strong>Ages:</strong><br>");
  _.each(nodes, function(node) {
    ages_table.append('<span>' + node.data.name + ': ' + node.data.age + '<span><br>');
  });
};

var showStatistics = function(statistics) {
  clearStats();

  var stats = $("#statistics");
  stats.append('<span><strong>Statistics</strong></span><br>');
  stats.append('<span>Total requests number: ' + statistics.request_number + '</span><br>');
  stats.append('<span>Total replies number: ' + statistics.replies_number + '</span><br>');

  _.each(statistics.votes, function(vote) {
    stats.append('<span>' + vote.voted_item + '&#32;gots&#32;</span>');
    stats.append('<span>' + vote.votes_amount + '%&#32;of&#32;votes</span><br>');
  });

  stats.append('<br><span><strong>Replies log:</strong></span><br>');
  _.each(statistics.replies_log, function(reply) {
    stats.append('<span>' + reply + '</span><br>');
  });
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
  var ages_table = $("#user_ages_table");
  _.each(ages_table.children(), function(child) {
    child.remove();
  });
  var plots = $("#plots");
  _.each(plots.children(), function(child) {
    child.remove();
  });
};