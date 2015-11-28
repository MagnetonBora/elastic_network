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
      name: 'breadthfirst'
    },
    elements: {
      nodes: [
        {
          data: {
            id: '1',
            name: 'Bob'
          },
          graddable: true
        },
        {
          data: {
            id: '2',
            name: 'Alice'
          },
          graddable: true
        },
        {
          data: {
            id: '3',
            name: 'Sam',
          },
          graddable: true
        },
        {
          data: {
            id: '4',
            name: 'Mike',
          },
          graddable: true
        }
      ],
      edges: [
        {
          data: { id: '12', source: '1', target: '2' }
        },
        {
          data: { id: '23', source: '2', target: '3' }
        },
        {
          data: { id: '32', source: '3', target: '2' }
        },
        {
          data: { id: '43', source: '4', target: '3' }
        }
      ]
    }
  });
});