/**
 * Graph
 * @constructor
 */
function Graph(params){
  this.container = params.container;
  this.needsRedraw = false;

  //Request animation frame shim
  window.requestAnimationFrame = (function(){
    return  window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function(/* function */ callback, /* DOMElement */ element){
      window.setTimeout(callback, 1000 / 60);
    };
  })();
  //Creates canvas
  this.canvas = document.createElement('canvas');
  this.container.appendChild(this.canvas);
  this.bufferCanvas = document.createElement('canvas');
  this.ctx = this.canvas.getContext('2d');
  this.bufferCtx = this.bufferCanvas.getContext('2d');
  this.primaryNode = null;
  this.setDimensions(this.container.offsetWidth, this.container.offsetHeight);
  this.nodes = {};
  this.speed = 500;
  this.position = {
    top: this.canvas.offsetTop,
    left: this.canvas.offsetLeft
  };
  this.canvas.addEventListener('click', function(e){
    var currX = e.clientX - this.position.left;
    var currY = e.clientY - this.position.top;
    var collidedNodes = this.getCollisions(currX, currY);
    for(var i in collidedNodes){
      if (typeof(collidedNodes[i].events.onClick) === 'function'){
        if (collidedNodes[i].events.onClick(e, collidedNodes[i], this) === false){
          break;
        }
      }
    }
  }.bind(this));
  this.canvas.addEventListener('mousemove', function(e){
    var currX = e.clientX - this.position.left;
    var currY = e.clientY - this.position.top;
    var atLeastOne = false;
    for (var id in this.nodes) {
      if (Math.sqrt(Math.pow(currX - this.nodes[id].x, 2) + Math.pow(currY - this.nodes[id].y, 2)) < this.nodes[id].radius){
        this.nodes[id].isHover = true;
        atLeastOne = true;
      } else {
        this.nodes[id].isHover = false;
      }
    }
    if (atLeastOne) {
      this.canvas.style.cursor = 'pointer';
    } else {
      this.canvas.style.cursor = 'default';
    }
    this.draw();
  }.bind(this));
}

Graph.prototype.getCollisions = function(currX, currY, additionalRange){
  if (typeof(additionalRange) === 'undefined') {
    additionalRange = 0;
  }
  var collidedNodes = [];
  for (var id in this.nodes) {
    if (Math.sqrt(Math.pow(currX - this.nodes[id].x, 2) + Math.pow(currY - this.nodes[id].y, 2)) < this.nodes[id].radius + additionalRange){
      collidedNodes.push(this.nodes[id]);
    }
  }
  return collidedNodes;
};

Graph.prototype.setDimensions = function(width, height){
  this.width = width;
  this.height = height;
  this.canvas.width = width;
  this.canvas.height = height;
  this.bufferCanvas.width = width;
  this.bufferCanvas.height = height;
  this.centerX = width/2;
  this.centerY = height/2;
};

Graph.prototype.draw = function(){
  window.requestAnimationFrame(function(){
    var needsRedraw = false;
    this.bufferCtx.clearRect( 0, 0, this.width, this.height);
    if (this.primaryNode !== null){
      needsRedraw = this.drawNode();
    }
    //Flip buffer
    this.ctx.clearRect( 0, 0, this.width, this.height);
    this.ctx.drawImage(this.bufferCtx.canvas, 0, 0);
    if (needsRedraw) {
      this.draw();
    }
  }.bind(this));
};

Graph.prototype.resetVisited = function(){
  for (var id in this.nodes) {
    this.nodes[id].isVisited = false;
  }
};

Graph.prototype.drawNode = function(){
    var now = new Date();
    var ctx = this.bufferCtx;
    var needsRedraw = false;
    for (var id in this.nodes) {
      var node = this.nodes[id];
      if(node.id !== null){
        if ((node.x != node.currentX || node.y != node.currentY) && node.startTime !== null){
          var percent = (now - node.startTime) / this.speed;
          if (percent >= 1) {
            node.startTime = null;
            node.currentX = node.x;
            node.currentY = node.y;
          }
          node.currentX = node.startX + ((node.x - node.startX) * percent);
          node.currentY = node.startY + ((node.y - node.startY) * percent);
          needsRedraw = true;
        }
        if (node.isHover) {
          ctx.fillStyle = node.stroke;
          ctx.strokeStyle = node.stroke;
          ctx.beginPath();
          ctx.arc(node.currentX, node.currentY, node.radius, 0, Math.PI*2, true);
          ctx.stroke();
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = node.color;
          ctx.strokeStyle = node.stroke;
          ctx.beginPath();
          ctx.arc(node.currentX, node.currentY, node.radius, 0, Math.PI*2, true);
          ctx.stroke();
          ctx.closePath();
          ctx.fill();
        }
        for (var i = 0; i < node.nodes.length; i++) {
          //Draw lines
          ctx.strokeStyle = '#999999';
          ctx.beginPath();
          ctx.moveTo(node.currentX, node.currentY);
          ctx.lineTo(node.nodes[i].currentX, node.nodes[i].currentY);
          ctx.closePath();
          ctx.stroke();
        }
      }
    }
    return needsRedraw;
};

Graph.prototype.centerGraph = function(){
  var minX = this.width;
  var maxX = 0;
  var minY = this.height;
  var maxY = 0;
  for (var id in this.nodes) {
    var radius = this.nodes[id].radius;
    var x = this.nodes[id].x;
    var y = this.nodes[id].y;
    if (x - radius < minX) {
      minX = x - radius;
    }
    if (x + radius > maxX) {
      maxX = x + radius;
    }
    if (y - radius < minY) {
      minY = y - radius;
    }
    if (y + radius > maxY) {
      maxY = y + radius;
    }
  }
  this.translateGraph(minX + ((maxX - minX) / 2)  - this.centerX, minY + ((maxY - minY) / 2)  - this.centerY);
};

Graph.prototype.translateGraph = function(x, y){
  for (var id in this.nodes) {
    this.nodes[id].moveTo(this.nodes[id].x - x, this.nodes[id].y - y);
  }
};

Graph.prototype.calculateNode = function(node){
  if(node.id !== null && node.isVisited === false){
    node.isVisited = true;
    for (var i = 0; i < node.nodes.length; i++) {
      if (node.nodes[i].isVisited === false) {
        var shift = (node.nodes.length % 2 === 0) ? 0 : 0.2;
        var division = (2 * Math.PI * i / node.nodes.length) + shift;
        var distance = 100;
        var canidateX = node.x + (distance * Math.cos(division));
        var canidateY = node.y + (distance * Math.sin(division));
        var shiftOffset = 0;
        var distanceOffset = 0;
        while(this.getCollisions(canidateX, canidateY, node.nodes[i].radius).length > 0){
          if (shiftOffset > 2 * Math.PI) {
            distanceOffset += node.radius;
            shiftOffset = 0;
          } else {
            shiftOffset += 0.1;
          }
          canidateX = node.x + ((distance + distanceOffset) * Math.cos(division + shiftOffset));
          canidateY = node.y + ((distance + distanceOffset) * Math.sin(division + shiftOffset));
        }
        node.nodes[i].moveTo(canidateX, canidateY);
      }
      this.calculateNode(node.nodes[i]);
    }
  }
};


Graph.prototype.addNode = function(node){
  var now = new Date().getTime();
  while (typeof(this.nodes[now.toString(36)]) !== 'undefined') {
    now++;
  }
  nodeId = now.toString(36);
  this.nodes[nodeId] = node;
  node.id = nodeId;
  if(Object.keys(this.nodes).length === 1){
    this.primaryNode = node;
    node.startX = node.currentX = node.x = this.centerX;
    node.startY = node.currentY = node.y = this.centerY;
  }
  this.resetVisited();
  this.calculateNode(this.primaryNode);
  this.centerGraph();
  this.draw();
};

Graph.prototype.setPrimaryNode = function(node){
  this.primaryNode = node;
};

Graph.prototype.clearNodes = function(){
  this.nodes = [];
  this.primaryNode = null;
  this.draw();
};

/**
 * Node
 * @constructor
 */
function Node(params){
  this.color = params.color ? params.color: "rgba(0, 168, 240, 0.5)";
  this.stroke = params.stroke ? params.stroke: "rgba(0, 168, 240, 0.9)";
  this.radius = params.radius ? params.radius: 10;
  this.id = null;
  this.isHover = false;
  this.isVisited = false;
  this.nodes = [];
  this.startTime = null;
  this.startX = this.currentX = params.startX ? params.startX: 0;
  this.startY = this.currentY = params.startY ? params.startY: 30;
  this.x = 0;
  this.y = 0;
  this.events = {
    onClick: function(e, node, graph){
      var newNode = new Node({startX: node.currentX, startY: node.currentY});
      node.addNeighbor(newNode);
      newNode.addNeighbor(node);
      //Also randomly pick one to be partner
      var luckyNode = graph.nodes[Object.keys(graph.nodes)[Math.floor((Math.random() * Object.keys(graph.nodes).length))]];
      luckyNode.addNeighbor(newNode);
      newNode.addNeighbor(luckyNode);
      graph.addNode(newNode);
    }
  };
}

Node.prototype.addNeighbor = function(node){
  //Set final location
  this.nodes.push(node);
};

Node.prototype.moveTo = function(x, y){
  this.startX = this.currentX;
  this.startY = this.currentY;
  this.startTime = new Date();
  this.x = x;
  this.y = y;
};
