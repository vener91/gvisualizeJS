var sampleGraph = new Graph({
  container: document.getElementById('sample-box')
});
var sampleGraphValue = [[1,2,3,4,5], [1,2,3], [1,2]];
var addNodes = function(graph, parentNode, graphVal){
  var newN;
  if (graphVal instanceof Array) {
    for (var i = 0; i < graphVal.length; i++) {
      newN = new Node({startX: parentNode.x, startY: parentNode.y});
      parentNode.addNeighbor(newN);
      console.info('test', i);
      graph.addNode(newN);
      addNodes(graph, newN, graphVal[i]);
    }
  }
};
primaryNode = new Node({color: 'rgba(200, 20, 20, 0.5)'});
sampleGraph.addNode(primaryNode);
addNodes(sampleGraph, primaryNode, sampleGraphValue);
