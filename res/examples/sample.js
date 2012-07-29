var sampleGraph = new Graph({
  container: document.getElementById('sample-box')
});
var sampleGraphValue = [[1,2,3,4,5], [1,2,3], [1,2]];
var onClick = function(e, node, graph){
  var newNode = new Node({startX: node.currentX, startY: node.currentY});
  node.addConnected(newNode);
  newNode.addConnected(node);
  //Also randomly pick one to be partner
  var luckyNode = graph.nodes[Object.keys(graph.nodes)[Math.floor((Math.random() * Object.keys(graph.nodes).length))]];
  luckyNode.addConnected(newNode);
  newNode.addConnected(luckyNode);
  graph.addNode(newNode);
};

var addNodes = function(graph, parentNode, graphVal){
  var newN;
  if (graphVal instanceof Array) {
    for (var i = 0; i < graphVal.length; i++) {
      newN = new Node({startX: parentNode.x, startY: parentNode.y, onClick: onClick});
      parentNode.addConnected(newN);
      graph.addNode(newN);
      addNodes(graph, newN, graphVal[i]);
    }
  }
};
primaryNode = new Node({color: 'rgba(200, 20, 20, 0.5)', onClick: onClick});
sampleGraph.addNode(primaryNode);
addNodes(sampleGraph, primaryNode, sampleGraphValue);
