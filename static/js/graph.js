$(function() {

  console.log('Initialiation of cytoscape...')

  var jqxhr = $.get("http://localhost:5000/tree", function(response) {
    var nodes = [], edges = [];
    console.log('Received data: ', response);
    _.each(response.users, function(user) {
      console.log(user);
      nodes.push({
        data: {
          id: user.uid,
          name: user.name,
          gender: user.gender,
          age: user.age,
          contacts: user.contacts,
        }
      });
    });
    _.each(response.edges, function(edge) {
      console.log(edge);
      edges.push({
        data: {source: edge[0], target: edge[1]}
      });
    });

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
            'line-color': 'green',
            'label': 'data(id)'
          }
        }
      ],
      layout: {
        name: 'breadthfirst',
        fit: true, // whether to fit the viewport to the graph
        directed: true, // whether the tree is directed downwards (or edges can point in any direction if false)
        padding: 30, // padding on fit
        circle: false, // put depths in concentric circles if true, put depths top down if false
        spacingFactor: 1.75, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
        roots: undefined, // the roots of the trees
        maximalAdjustments: 0, // how many times to try to position the nodes in a maximal way (i.e. no backtracking)
        animate: false, // whether to transition the node positions
        animationDuration: 500, // duration of animation in ms if enabled
        animationEasing: undefined, // easing of animation if enabled
        ready: undefined, // callback on layoutready
        stop: undefined // callback on layoutstop
      },
      elements: {
        nodes: nodes,
        edges: edges
      }
    });

  });

});