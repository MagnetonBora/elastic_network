
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
      showVotes(response.statistics.votes);
      showRepliesPerRequest(response.replies_stats);
      showAggregatedResponsesPerReply(response.replies_stats);
      showPlots(graph.nodes);
    },
    contentType: 'application/json'
  });
};

var showRepliesPerRequest = function(data) {
  var requested_replies = $("#requested_replies");
  requested_replies.append("<strong>Replies per request</strong><br>");
  for(var i=0; i < data.length; i++) {
    requested_replies.append("<span>" + data[i].user + ": " + data[i].requested_replies + "</span><br>");
  };
};

var showAggregatedResponsesPerReply = function(data) {
  var aggregated_responses_per_reply = $("#aggregated_responses_per_reply");
  aggregated_responses_per_reply.append("<strong>Aggregated responses per reply</strong><br>");
  for(var i=0; i < data.length; i++) {
    aggregated_responses_per_reply.append(
      "<span>" + data[i].user + ": " + "replies " + data[i].requested_replies + ", " +
      "aggregated responses " + data[i].aggregated_responses + "</span><br>"
    );
  };
};

var showVotes = function(results) {
  var votes = $("#votes");
  votes.append("<span><strong>Total results of questionary:</strong></span><br>")
  for(var i = 0; i < results.length; i++) {
    votes.append("<span>" + results[i].voted_item + " got: " + results[i].votes_amount + " votes</span><br>");
  }
};

var calcPoints = function(start, end, step, mean, sigma, name) {
    var X = [], Y = [];
    var Q = 1.0 / (sigma + 1);
    for(var x = start; x <= end; x += step) {
        X.push(x);
        y = 1.0 / (sigma * Math.sqrt(2 * Math.PI)) * Math.exp( - (x - mean)*(x - mean) / (2 * sigma * sigma) );
        Y.push(y);
    };
    return {
      x: X,
      y: Y,
      xaxis: 'x1',
      yaxis: 'y1',
      name: name,
      type: 'scatter'
    };
};

var drawAgesDistribution = function(data) {
    var layout = {
      title: 'Ages distribution',
      xaxis: {
        title: 'ages'
      },
      yaxis: {
        title: 'PDF'
      }
    };
    Plotly.newPlot('ages_distribution', data, layout);
};

var drawClusterizationFactor = function(start, end, step) {
    var X = [], Y = [];
    for(var x = start; x <= end; x += step) {
        X.push(x);
        y = 1.0 / x;
        Y.push(y);
    }
    var layout = {
        title: 'Illustration of clusterization factor',
        xaxis: {
          title: 'clusterization factor'
        },
        yaxis: {
          title: 'Sigma'
        }
    };
    var trace = {
      x: X,
      y: Y,
      xaxis: 'x1',
      yaxis: 'y1',
      type: 'scatter'
    };
    Plotly.newPlot('clusterization_factor', [trace], layout);
};

var drawEfficiency = function() {
  var snippet =
    '<div style=\"margin-top: 50px; margin-left: 20px;\">' +
    '<img src=\"/static/images/3.jpg\" />' +
    '</div>';
    $("#efficiency").append(snippet);
};

var showPlots = function(nodes) {
    var avg_age = parseFloat(document.getElementById("average_age").value);
    var std_dev = parseFloat(document.getElementById("standard_deviation").value);
    var ages_data = [];
    _.each(nodes, function(node) {
      ages_data.push(calcPoints(10, 70, 0.1, node.data.age, std_dev, node.data.name));
    });
    drawAgesDistribution(ages_data);
    drawClusterizationFactor(0.01, 1, 0.01);
    drawEfficiency();
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

  stats.append('<br><span><strong>Simulation log:</strong></span><br>');
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
    params: params,
  };
  $.ajax('/generate-tree', {
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(data),
    success: function(response) {
      console.log('Received data: ', response);
      graph = {
        root: response.root,
        nodes: formatNodes(response.nodes),
        edges: formatEdges(response.edges)
      }
      renderGraph(graph.nodes, graph.edges, graph.root, {name: 'cose-bilkent'});
    }
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
  var ids = [
    "#clusterization_factor",
    "#efficiency",
    "#ages_distribution",
    "#statistics",
    "#user_ages_table",
    "#aggregated_responses_per_reply",
    "#requested_replies",
    "#votes"
  ];
  _.each(ids, function(id) {
    var elements = $(id);
    _.each(elements.children(), function(child) {
      child.remove();
    });
  });
};