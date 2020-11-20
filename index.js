// import {WeightedDiGraph, Edge, Dijkstra} from 'js-graph-algorithms';
// import {Network, DataSet} from 'vis-network';
const {WeightedDiGraph, Edge, Dijkstra} = jsgraphs;
const {Network, DataSet} = vis;

const NODES = document.getElementById('nodes');
const CONTACT = document.getElementById('contact');
const INFECTABLE = document.getElementById('infectable');
const PATH = document.getElementById('path');
const GRAPH = document.getElementById('graph');


var N, cg, ig, pg;
NODES.addEventListener('blur', () => setup());
CONTACT.addEventListener('click', () => createVis(cg));
INFECTABLE.addEventListener('click', () => createVis(ig));
PATH.addEventListener('click', () => createVis(pg));
setup();


function setup() {
  N = parseInt(NODES.value, 10) || 10;
  cg = contactGraph(N);
  ig = infectableGraph(cg);
  pg = pathGraph(ig);
  createVis(cg);
}


function contactGraph(N) {
  var a = new WeightedDiGraph(N);
  // random recovery time
  for (var i=0; i<N; i++) {
    var t = randomInt(5, 20);
    Object.assign(a.node(i), {t,
      label: `#${i} ${t}`,
      title: `#${i} ${i===0? 'Infected' : 'Susceptible'}<br>Recovery time: ${t}`
    });
  }
  // random infection time
  for (var i=0; i<N; i++) {
    for (var j=0; j<N; j++) {
      if (j === i) continue;
      if (randomInt(-2, 1) < 0) continue;
      var t = randomInt(5, 20);
      a.addEdge(new Edge(i, j, t));
    }
  }
  return a;
}


function infectableGraph(g) {
  var N = g.V;
  var a = new WeightedDiGraph(N);
  for (var i=0; i<N; i++) {
    var n = a.node(i);
    Object.assign(n, g.node(i));
    for (var e of g.adj(i)) {
      if (e.from() !== i) continue;
      if (e.weight > n.t) continue;
      a.addEdge(new Edge(e.from(), e.to(), e.weight));
    }
  }
  return a;
}


function pathGraph(g) {
  var N = g.V;
  var d = new Dijkstra(g, 0);
  var a = new WeightedDiGraph(N);
  for (var i=0; i<N; i++) {
    var n = a.node(i);
    Object.assign(n, g.node(i), {d: d.distanceTo(i)});
    if (!d.hasPathTo(i)) continue;
    for (var e of d.pathTo(i))
      a.addEdge(new Edge(e.from(), e.to(), e.weight));
  }
  return a;
}


function createVis(g) {
  var N = g.V;
  // collect nodes
  var nodes = [];
  for (var i=0; i<N; i++) {
    var {t, d} = g.node(i);
    var sta = i===0? 'Infected' : 'Susceptible';
    var rec = 'Recovery period: '+t;
    var inf = 'Infection time: '+d;
    nodes.push({id: i,
      label: `#${i} ${t}`,
      title: `#${i} ${sta}<br>${rec}<br>${inf}`,
      color: i===0? 'red' : null
    });
  }
  // collect edges
  var edges = [];
  for (var i=0; i<N; i++) {
    for (var e of g.adj(i))
      edges.push({
        from : e.from(),
        to: e.to(),
        length: e.weight,
        label: ''+e.weight,
        arrows: 'to',
        color: '#00ff00'
      });
  }
  // prepare for display
  var container = GRAPH;
  var data = {
    nodes: new DataSet(nodes),
    edges: new DataSet(edges)
  };
  var options = {physics: {timestep: 0.05, minVelocity: 0}};
  var a = new Network(container, data, options);
  a.startSimulation();
  return a;
}


function randomInt(a, b) {
  return Math.floor(a + (b-a) * Math.random());
}
