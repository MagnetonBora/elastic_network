$(function() {
  console.log('Initialiation of cytoscape...')

  var cy = cytoscape({
    container: document.getElementById('cy'),
    style: [
      {
        selector: 'node',
        style: {
          'background-color': 'red',
          'label': 'data(name)'
        }
      }
    ],
    layout: {
      name: 'grid'
    },
    elements: {
      nodes: [
        {
          group: 'nodes',
          data: {
            id: '1',
            name: 'Bob',
            parent: 'null'
          },
          position: {
            x: 50,
            y: 50
          },
          graddable: true
        },
        {
          group: 'nodes',
          data: {
            id: '2',
            name: 'Alice',
            parent: null
          },
          position: {
            x: 100,
            y: 100
          },
          graddable: true
        }
      ]
    }
  });
});