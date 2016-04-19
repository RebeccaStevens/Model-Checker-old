// jscs:enable esnext
// jshint esnext:true
'use strict';

let _NODE_UID = 0; // used to return unique node id for NodeUid class
let _EDGE_UID = 0; // used to return unique edge id for EdgeUid class
let TAU = '\u03C4';
let DELTA = '\u03B4';

/**
 * Helper class for Graph which generates unique node identifiers.
 *
 * @static
 */
class NodeUid {

  /**
   * Returns the next unique node indentifier.
   *
   * @static
   * @returns {!integer} - next node uid
   */
  static get next() {
    return _NODE_UID++;
  }

  /**
   * Resets the node identifier to zero.
   *
   * @static
   */
  static reset() {
    _NODE_UID = 0;
  }

}

/**
 * Helper class for Graph which generates unique edge identifiers
 *
 * @static
 */
class EdgeUid {

  /**
   * Returns the next unique edge indentifier.
   *
   * @static
   * @returns {!integer} - next edge uid
   */
  static get next() {
    return _EDGE_UID++;
  }

  /**
   * Resets the edge identifier to zero.
   *
   * @static
   */
  static reset() {
    _EDGE_UID = 0;
  }
}

/**
 * A graph data structure (a collections of nodes and edges).
 *
 * @public
 * @class
 * @property {!array} nodes      - The nodes of the graph (readOnly)
 * @property {!array} edges      - The edges of the graph (readOnly)
 * @property {!Graph.Node} root  - The root node of this graph
 * @property {!number} nodeCount - The number of nodes in the graph (readOnly)
 * @property {!number} edgeCount - The number of edges in the graph (readOnly)
 */
class Graph {

  constructor() {
    this._nodeCount = 0;
    this._edgeCount = 0;
    this._nodeMap = {};
    this._edgeMap = {};
    this._alphabet = {};
    this._rootId = undefined;
  }

  /**
   * Get an array of the nodes in this graph where the root node is be the first element.
   *
   * @returns {!array} An array of the nodes in this graph
   */
  get nodes() {
    let nodes = [this.root];
    for (let id in this._nodeMap) {
      if (Number.parseInt(id, 10) !== this._rootId) {
        nodes.push(this._nodeMap[id]);
      }
    }
    return nodes;
  }

  /**
   * Get an array of the edges in this graph.
   *
   * @returns {!array} An array of the edges in this graph
   */
  get edges() {
    let edges = [];
    for (let key in this._edgeMap) {
      edges.push(this._edgeMap[key]);
    }
    return edges;
  }

  /**
   * Get the root node of this graph.
   *
   * @returns {!Graph.Node} The root.
   */
  get root() {
    return this._nodeMap[this._rootId];
  }

  get rootId() {
    return this._rootId;
  }

  /**
   * Set the node that should be used as the graphs root.
   *
   * @param {!Graph.Node} node - The node to use as the root node
   * @returns {Graph.Node} The new root node
   */
  set root(node) {
    if (node === this.root) {
      return node;
    }
    if (node) {
      if (node.graph === this) {
        return this._setRootNodeById(node.id);
      }
      throw new Graph.Exception(
        'cannot set the root of this graph to a node that is not in it.');
    }
    this._rootId = undefined;
    return undefined;
  }

  /**
   * The number of nodes in this graph.
   *
   * @returns {!number} The number of nodes in this graph
   */
  get nodeCount() {
    return this._nodeCount;
  }

  /**
   * The number of edges in this graph.
   *
   * @returns {!number} The number of edges in this graph
   */
  get edgeCount() {
    return this._edgeCount;
  }

  /**
   * Add a node to this graph.
   * If this graph doesn't already have a root node, this node will be set as the root node.
   *
   * @param {!number} uid           - The node's id (must be unquie)
   * @param {!string} [label='']    - The node's label
   * @param {!object} [metaData={}] - Any meta data about this node that should be stored
   * @throws {Graph.Exception} uid must be unquie
   * @returns {!Graph.Node} The node added to the graph
   */
  addNode(uid, label='', metaData={}) {
    if (this._nodeMap[uid] !== undefined) {
      throw new Graph.Exception(
        'This graph already contains a node with the id "' + uid + '".');
    }

    let node = new Graph.Node(this, uid, label,
      Graph._deepCloneObject(metaData));

    this._nodeMap[uid] = node;
    this._nodeCount += 1;

    if (this.root === undefined) {
      this.root = node;
    }

    return node;
  }

  /**
   * Add an edge to the graph.
   *
   * @param {!number} uid        - The edge's id (must be unquie)
   * @param {!Graph.Node} from   - The node this edges comes from
   * @param {!Graph.Node} to     - The node this edges goes to
   * @param {!string} [label=''] - The edge's label
   * @throws {Graph.Exception} uid must be unquie
   * @returns {!Graph.Edge} The edge added to the graph
   */
  addEdge(uid, from, to, label='') {
    if (this._edgeMap[uid] !== undefined) {
      throw new Graph.Exception(
        'This graph already contains a edge with id "' + uid + '".');
    }

    let edge = new Graph.Edge(this, uid, from, to, label);
    this._edgeMap[uid] = edge;
    this._edgeCount += 1;

    from._addEdgeFromMe(edge);
    to._addEdgeToMe(edge);

    this._alphabet[label] = true;

    return edge;
  }

  /**
   * Get a node in the graph.
   *
   * @param {!number} id - The id of the node to get
   * @returns {Graph.Node} The node
   */
  getNode(id) {
    return this._nodeMap[id];
  }

  /**
   * Returns a set of the reachable nodes in this graph from the root node.
   *
   * @returns {!Set} Set of node ids
   */
  get reachableNodes() {
    let nodes = [];
    let stack = [this.rootId];
    let visited = [];
    // perfrom depth first search of graph
    while (stack.length !== 0) {
      let id = stack.pop();
      if (!_.contains(visited, id)) {
        visited.push(id);
        // add current node id to the set
        nodes[id] = true;
        let node = this.getNode(id);

        // add neighbours of current node to stack
        let neighbors = node.neighbors;
        for (let i = 0; i < neighbors.length; i++) {
          stack.push(neighbors[i].id);
        }
      }
    }

    return nodes;
  }

  /**
   * Get an edge in the graph.
   *
   * @param {!number} id - The id of the edge to get
   * @returns {Graph.Edge} The edge
   */
  getEdge(id) {
    return this._edgeMap[id];
  }

  /**
   * Returns true if there is an edge between the specified nodes with the
   * specified label. Otherwise returns false.
   *
   * @param {!Node} from - The start node
   * @param {!Node} to - The end node
   * @param {!string} label - the type of action
   * @returns {boolean} Whether that edge exists or not
   */
  containsEdge(from, to, label) {
    for (let i in this._edgeMap) {
      let edge = this._edgeMap[i];
      if (edge.from === from && edge.to === to && edge.label === label) {
        return true;
      }
    }

    return false;
  }

  /**
   * Returns true if the specified edge is contained in this graph's alphabet,
   * otherwise returns false.
   *
   * @returns {boolean} Whether the edge is contained in the graph's alphabet or not
   */
  containsEdgeInAlphabet(edge) {
    return (this._alphabet[edge]) ? true : false;
  }

  /**
   * Returns true if the specified edge in this graph is hidden, otherwise
   * returns false.
   *
   * @param {!number} edge - The id of the edge to check
   * @returns {!boolean} Whether the specified edge is hidden or not
   */
  isHiddenEdge(edge) {
    for (let i in this._edgeMap) {
      if (this._edgeMap[i].label === edge && this._edgeMap[i].isHidden) {
        return true;
      }
    }

    return false;
  }
  /**
   * Remove a node from the graph.
   * Any edges connected to this node will also be deleted.
   *
   * @param {Graph.Node} node - The node to remove
   */
  removeNode(node) {
    if (!node || node.graph !== this || this._nodeMap[node.id] !== node) {
      return;
    }

    for (let i in node._edgesToMe) {
      this.removeEdge(node._edgesToMe[i]);
    }

    for (let i in node._edgesFromMe) {
      this.removeEdge(node._edgesFromMe[i]);
    }

    delete this._nodeMap[node.id];
    this._nodeCount -= 1;

    if (this._rootId === node.id) {
      this.root = undefined;
    }
  }

  /**
   * Remove an edge from the graph.
   *
   * @param {Graph.Edge} edge - The edge to remove
   */
  removeEdge(edge) {
    if (!edge || edge.graph !== this || this._edgeMap[edge.id] !== edge) {
      return;
    }

    delete this._edgeMap[edge.id].to._edgesToMe[edge.id];
    delete this._edgeMap[edge.id].from._edgesFromMe[edge.id];
    delete this._edgeMap[edge.id];
    this._edgeCount -= 1;
  }

  /**
   * Removes duplicate edges from this graph. An edge is determined to be a duplicate
   * if a node has two or more edges from it that transition to the same node with the
   * same label.
   */
  removeDuplicateEdges() {
    // search all nodes for duplicate edges
    let nodes = this._nodeMap;
    for (let i in nodes) {
      let node = nodes[i];

      // compare each edge from this node with all other edges from this node
      let edges = node.edgesFromMe;
      for (let j in edges) {
        let edge1 = edges[j];

        for (let k in edges) {
          let edge2 = edges[k];

          // remove edge if it is deemed to be a duplicate
          if (j !== k && edge1.to.id === edge2.to.id && edge1.label === edge2.label) {
            this.removeEdge(edge2);
            delete edges[k];
          }
        }
      }
    }
  }

  /**
   * Retrieves the hidden edges from this graph
   *
   * @returns {!Array} - the hidden edges in this graph
   */
  get hiddenEdges() {
    let hiddenEdges = [];
    for (let i in this._edgeMap) {
      let edge = this._edgeMap[i];
      if (edge.isHidden) {
        hiddenEdges.push(edge);
      }
    }
    return hiddenEdges;
  }

  /**
   * Retrieves the deadlock edges from this graph
   *
   * @returns {!Array} - the deadlock edges in this graph
   */
  get deadlockEdges() {
    let deadlockEdges = [];
    for (let i in this._edgeMap) {
      let edge = this._edgeMap[i];
      if (edge.isDeadlock) {
        deadlockEdges.push(edge);
      }
    }
    return deadlockEdges;
  }

  /**
   * Removes the hidden edges from this graph.
   */
  removeHiddenEdges() {
    for (let i in this._edgeMap) {
      let edge = this._edgeMap[i];
      // remove edge if it is hidden
      if (edge.isHidden) {
        this.removeEdge(edge);
      }
    }

    for (let i in this._nodeMap) {
      let node = this._nodeMap[i];
      if (node.edgesToMe.length === 0) {
        node.addMetaData('startNode', true);
      }
    }
  }

  get alphabet() {
    return this._alphabet;
  }

  /**
   * Set the root node of this graph by specifying its id.
   *
   * @private
   * @param {!number} id - The id of the node to set as the root
   * @returns {Graph.Node} The new root node
   */
  _setRootNodeById(id) {
    this._rootId = id;
    return this.root;
  }

  /**
   * Create a deep clone of this graph.
   * The clone's new nodes and edges will have the same ids as this graph.
   *
   * @returns {!Graph} The clone
   */
  deepClone() {
    let clone = new Graph();

    // copy all the nodes
    for (let key in this._nodeMap) {
      clone.addNode(
        this._nodeMap[key].id,
        this._nodeMap[key].label,
        this._nodeMap[key].metaData);
    }

    // copy all the edges
    for (let key in this._edgeMap) {
      clone.addEdge(
        this._edgeMap[key].id,
        clone.getNode(this._edgeMap[key].from.id),  // make sure to use the copied node, not the original
        clone.getNode(this._edgeMap[key].to.id),
        this._edgeMap[key].label,
        this._edgeMap[key].isHidden,
        this._edgeMap[key].isDeadlock);
    }

    // set the root
    clone._setRootNodeById(this._rootId);

    return clone;
  }

  /**
   * Combine this graph with one or more other graphs.
   * If the given graph(s) contains nodes/edges with the same id as this graph,
   * they will will not be added.
   *
   * @param {...!Graph} graphs - The graphs to be combined with this one
   * @returns {!Graph} this
   */
  combineWith(...graphs) {
    // for each graph given
    for (let i = 0; i < graphs.length; i++) {
      // for each node in that graph
      for (let key in graphs[i]._nodeMap) {
        // if this graph doesn't already have a node with this id
        if (this._nodeMap[graphs[i]._nodeMap[key].id] === undefined) {
          // add the node
          this.addNode(
            graphs[i]._nodeMap[key].id,
            graphs[i]._nodeMap[key].label,
            graphs[i]._nodeMap[key].metaData);
        }
      }

      // for each edge in that graph
      for (let key in graphs[i]._edgeMap) {
        // if this graph doesn't already have an edge with this id
        if (this._edgeMap[graphs[i]._edgeMap[key].id] === undefined) {
          // add the edge
          this.addEdge(
            graphs[i]._edgeMap[key].id,
            this.getNode(graphs[i]._edgeMap[key].from.id), // use the node in this graph, not the one in the other graph
            this.getNode(graphs[i]._edgeMap[key].to.id),
            graphs[i]._edgeMap[key].label,
            graphs[i]._edgeMap[key].isHidden,
            graphs[i]._edgeMap[key].isDeadlock);
        }
      }
    }

    return this;
  }

  /**
   * Merge the specified nodes in this graph into a single node.
   * At least two nodes must be specified in order to merge them.
   * The merged node's id will be nodeIds[0].
   *
   * @param {!array} nodeIds - An array of nodes to merge (specified by their IDs)
   * @returns {Node} The merged node
   */
  mergeNodes(nodeIds) {
    let mergedNode;
    let mergedMetaData  = {};
    let isRoot = false;
    // for each node id specified to merge
    for (let i = 0; i < nodeIds.length; i++) {
      let node = this.getNode(nodeIds[i]);  // get the node
      // save all the meta data in this node
      let meta = node.metaData;
      for (let key in meta) {
        mergedMetaData[key] = meta[key];
      }

      // check if this node is the root of the graph
      if (node.id === this.rootId) {
        isRoot = true;
      }

      // if this is the first node we are dealing with (i === 0)
      if (mergedNode === undefined) {
        mergedNode = node;  // save it
        continue;           // and move on to the next node
      }

      // update the edges from this node to be from the merged node
      for (let key in node._edgesFromMe) {
        let edge = node._edgesFromMe[key];
        edge._from = mergedNode;
        mergedNode._addEdgeFromMe(edge);
      }
      node._edgesFromMe = {};

      // update the edges to this node to be to the merged node
      for (let key in node._edgesToMe) {
        let edge = node._edgesToMe[key];
        edge._to = mergedNode;
        mergedNode._addEdgeToMe(edge);
      }
      node._edgesToMe = {};

      // remove the node from the graph
      this.removeNode(node);
    }

    mergedNode._meta = mergedMetaData;    // set the merged node's meta data

    if (isRoot) {
      this.root = mergedNode;
    }

    return mergedNode;
  }

  /**
   * Trims any nodes from the graph that are not reachable from the root node.
   */
  trim() {
    // get the reachable nodes from the root
    let reachable = this.reachableNodes;
    // remove any nodes that are not reachable from the root
    for (let node in this._nodeMap) {
      if (reachable[node] !== true) {
        this.removeNode(this._nodeMap[node]);
      }
    }
  }

  processStopNodes() {
    for (let i in this._nodeMap) {
      let node = this.getNode(i);
      if (node.edgesFromMe.length !== 0) {
        if (node.getMetaData('isTerminal') === 'stop') {
          node.deleteMetaData('isTerminal');
        }
      } else if (node.getMetaData('isTerminal') !== 'error') {
        node.addMetaData('isTerminal', 'stop');
      }
    }
  }

  /**
   * Create a deep clone of an object or array.
   *
   * @protected
   * @param {!object|!array} obj - An object or array to clone
   * @returns {!object|!array} The cloned object/array
   */
  static _deepCloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
}

/**
 * A Graph Node.
 *
 * @protected
 * @class
 * @property {!Graph} graph     - The Graph this node is apart of (readOnly)
 * @property {!number} id       - The node's id
 * @property {!string} label    - The node's label
 * @property {!object} metaData - Any meta data that should be stored (readOnly)
 * @property {!array} neighbors - The neighboring nodes of this node (readOnly)
 */
Graph.Node = class {

  /**
   * Graph Node object should only be contructed by the Graph class.
   *
   * @protected
   * @param {!Graph} graph     - The Graph this node is apart of
   * @param {!number} uid      - The node's id (must be unquie)
   * @param {!string} label    - The node's label
   * @param {!object} metaData - Any meta data that should be stored
   */
  constructor(graph, uid, label, metaData) {
    this._graph = graph;
    this._id = uid;
    this._label = label;
    this._meta = metaData;
    this._edgesFromMe = {};
    this._edgesToMe = {};
  }

  /**
   * Get the graph this node is apart of.
   *
   * @returns {Graph} The graph
   */
  get graph() {
    return this._graph;
  }

  /**
   * Get this node's id.
   *
   * @returns {!number} This node's id
   */
  get id() {
    return this._id;
  }

  /**
   * Set this node's id.
   *
   * @param {!number} newId - What to change this node's id to
   * @returns {!number} The new id of this node
   */
  set id(newId) {
    let oldId = this._id;
    // dirty check
    if (newId === oldId) {
      return newId;
    }

    // check that the new id isn't already being used
    //if (this._graph._nodeMap[newId] !== undefined) {
    //  throw new Graph.Exception('Cannot set this node\'s id to an id of another node in the graph.');
    //}

    // move the node to it's new index
    this._graph._nodeMap[newId] = this._graph._nodeMap[oldId];
    delete this._graph._nodeMap[oldId];
    this._id = newId;

    // if we are changing the root's id
    if (this.graph._rootId === oldId) {
      this.graph._rootId = newId;   // make sure the graph gets the update
    }

    // update all the edges that refer to this node
    for (let edgeId in this._graph._edgeMap) {
      // update edges from this node
      if (this._graph._edgeMap[edgeId].from === oldId) {
        this._graph._edgeMap[edgeId].from = newId;
      }
      // update edges to this node
      if (this._graph._edgeMap[edgeId].to === oldId) {
        this._graph._edgeMap[edgeId].to = newId;
      }
    }

    return newId;
  }

  /**
   * Get this node's label.
   *
   * @returns {!string} This node's label
   */
  get label() {
    return this._label;
  }

  /**
   * Set this node's label.
   *
   * @param {string} lbl - The new label for this node
   * @returns {!string} The new label for this node
   */
  set label(lbl) {
    this._label = lbl + ''; // convert lbl to a string then set the label
    return this._label;
  }

  /**
   * Get a copy of this node's meta data.
   *
   * @returns {!object} The meta data
   */
  get metaData() {
    return Graph._deepCloneObject(this._meta);
  }

  /**
   * Get an array of all the neighboring nodes of this node.
   *
   * @returns {!array} An array of neighboring nodes
   */
  get neighbors() {
    let nodes = [];
    for (let i in this._edgesFromMe) {
      nodes.push(this._edgesFromMe[i].to);
    }
    return nodes;
  }

  /**
   * Get an array of all the edges from this node.
   *
   * @returns {!array} An array of edges
   */
  get edgesFromMe() {
    let edge = [];
    for (let i in this._edgesFromMe) {
      edge.push(this._edgesFromMe[i]);
    }
    return edge;
  }

  /**
   * Get an array of all the edges to this node.
   *
   * @returns {!array} An array of edges
   */
  get edgesToMe() {
    let edge = [];
    for (let i in this._edgesToMe) {
      edge.push(this._edgesToMe[i]);
    }
    return edge;
  }

  /**
   * Remember that the given edge comes from this node.
   * Assumes edge.from === this
   *
   * @param {!Graph.Edge} edge - An edge that comes from this node
   */
  _addEdgeFromMe(edge) {
    this._edgesFromMe[edge.id] = edge;
  }

  /**
   * Remember that the given edge goes to this node.
   * Assumes edge.to === this
   *
   * @param {!Graph.Edge} edge - An edge that goes to this node
   */
  _addEdgeToMe(edge) {
    this._edgesToMe[edge.id] = edge;
  }

  /**
   * Determines if the specified edge transitions this node to a valid state.
   * Returns an array of the nodes this edge can transition to. Returns an
   * an array containing undefined if there are no valid transitions.
   *
   * @param {!Edge} edge - The edge to check if there is a valid transition
   * @returns {!Array} array of nodes this edge transitions to
   */
  coaccessible(edge) {
    let temp = [];
    let edges = this.edgesFromMe;
    for (let e in edges) {
      if (edges[e].label === edge) {
        temp.push(edges[e].to);
      }
    }

    if (temp.length === 0) {
      temp.push(undefined);
    }

    return temp;
  }

  /**
   * Returns true if this node is accessible within a graph,
   * otherwise returns false.
   */
  isAccessible() {
    return this.edgesToMe.length === 0;
  }

  /**
   * Add some meta data to this node.
   *
   * @param {!string} key - The key to save the data under
   * @param {*} value - The data to save
   */
  addMetaData(key, value) {
    this._meta[key] = value;
  }

  /**
   * Add the metaData from the specified array to this node
   *
   * @param {!Array} metaDataArray - an array of meta data
   */
  combineMetaData(metaDataArray) {
    for (let key in metaDataArray) {
      this.addMetaData(key, metaDataArray[key]);
    }
  }

  /**
   * Get a copy of a bit of meta data in this node.
   *
   * @param {!string} key - The key to get the data from
   * @returns {*} The data
   */
  getMetaData(key) {
    if (typeof obj === 'object') {
      return Graph._deepCloneObject(this._meta[key]);
    }
    return this._meta[key];
  }

  /**
   * Delete some meta data in this node.
   *
   * @param {!string} key - The key the data is saved under
   */
  deleteMetaData(key) {
    delete this._meta[key];
  }
};

/**
 * A Graph Edge.
 *
 * @protected
 * @class
 * @property {!Graph} graph  - The Graph this node is apart of (readOnly)
 * @property {!number} id    - The node's id (readOnly)
 * @property {!object} from  - The id of the node this edges comes from (readOnly)
 * @property {!object} to    - The id of the node this edges goes to (readOnly)
 * @property {!string} label - The node's label
 */
Graph.Edge = class {

  /**
   * Graph Edge object should only be contructed by the Graph class.
   *
   * @protected
   * @param {!Graph} graph  - The Graph this edges is apart of
   * @param {!number} uid   - The edge's id (must be unquie)
   * @param {!number} from  - The id of the node this edges comes from
   * @param {!number} to    - The id of the node this edges goes to
   * @param {!string} label - The edge's label
   */
  constructor(graph, uid, from, to, label) {
    this._graph = graph;
    this._id = uid;
    this._from = from;
    this._to = to;
    this.label = label;
  }

  /**
   * Get the graph this edges is apart of.
   *
   * @returns {!Graph} The graph
   */
  get graph() {
    return this._graph;
  }

  /**
   * Get this edge's id.
   *
   * @returns {!number} This edge's id
   */
  get id() {
    return this._id;
  }

  /**
   * Get the node this edge connects from.
   *
   * @returns {!Graph.Node} The node
   */
  get from() {
    return this._graph._nodeMap[this._from.id];
  }

  /**
   * Get the node this edge connects to.
   *
   * @returns {!Graph.Node} The node
   */
  get to() {
    return this._graph._nodeMap[this._to.id];
  }

  /**
   * Get this edge's label.
   *
   * @returns {!string} The label
   */
  get label() {
    return this._label;
  }

  /**
   * Set this edge's label, removing the old label from the graph's
   * alphabet and replacing it with the specified label.
   *
   * @returns {!string} The new label
   */
  set label(lbl) {
    // check if this label is broadcasting
    if (lbl[0] === '!') {
      this._isBroadcasting = true;
      lbl = lbl.slice(1, lbl.length);
    } else {
      delete this._isBroadcasting;
    }

    // check if this label is listening
    if (lbl[0] === '?') {
      this._isListening = true;
      lbl = lbl.slice(1, lbl.length);
    } else {
      delete this._isListening;
    }

    delete this._graph.alphabet[this._label];
    this._label = lbl + ''; // convert lbl to a string then set the label
    this._graph.alphabet[this._label] = true;
    return this._label;
  }

  hideEdge() {
    this._label = TAU;
    return this._label;
  }

  /**
   * Get a boolean determining whether this edge is hidden or not.
   */
  get isHidden() {
    return this._label === TAU;
  }

  deadlockEdge() {
    this._label = DELTA;
    return this._label;
  }

  /**
   * Get a boolean determining whether this edge is hidden or not.
   */
  get isDeadlock() {
    return this._label === DELTA;
  }

  /**
   * Returns true if this edge is broadcasting, otherwise returns false.
   *
   * @returns {boolean} - whether or not this edge is broadcasting
   */
  get isBroadcasting() {
    return (this._isBroadcasting) ? true : false;
  }

  /**
   * Returns true if this edge is listening, otherwise returns false.
   *
   * @returns {boolean} - whether or not this edge is listening
   */
  get isListening() {
    return (this._isListening) ? true : false;
  }
};

/**
 * A wrapper class for Graph.Node which also holds a color. Used for performing
 * bisimulation.
 *
 * @class
 * @property {!Object} node - the node this class represents
 * @property {string} color - the color of the node property
 */
Graph.ColoredNode = class {

  /**
   * Constructs an instance of ColoredNode. If node has no deadlock transitions to it
   * then it is colored as 0, otherwise it is colored -1.
   *
   * @protected
   * @param {!Object} node - the node to be colored
   * @param {string} color - color of the node
   */
  constructor(node, color = '0') {
    this._node = node;
    this._color = color;

    // check for deadlocks
    let edges = node.edgesToMe;
    for (let e in edges) {
      let edge = edges[e];
      if (edge.isDeadlock) {
        this._color = '-1';
        break;
      }
    }
  }

  /**
   * Returns the node associated with this ColoredNode.
   *
   * @public
   * @returns {!Object} - Node
   */
  get node() {
    return this._node;
  }

  /**
   * Returns the color associated with this ColoredNode.
   *
   * @public
   * @returns {string} - Color
   */
  get color() {
    return this._color;
  }

  /**
   * Sets the color associated with this ColoredNode to the specified color.
   *
   * @public
   * @param color - the color to be set
   */
  set color(color) {
    this._color = color;
    return this._color;
  }

  /**
   * Constructs a node coloring for this node.
   *
   * @param {!Array} coloredNodes - Array of colored nodes
   * @returns {!Array} The coloring for the specified colored node
   */
  constructNodeColoring(coloredNodes) {
    let colors = new Graph.NodeColoring();

    // construct coloring for the specified node
    let edges = this._node.edgesFromMe;
    for (let e in edges) {
      let edge = edges[e];
      let from = this._color;
      let to = edge.isDeadlock ? '-1' : coloredNodes[edge.to.id].color;
      let label = edge.isDeadlock ? DELTA : edge.label;
      let color = Graph.NodeColoring.constructColor(from, to, label);

      // only add color if it is not a duplicate
      if (!colors.contains(color)) {
        colors.add(color);
      }
    }

    // check if current node has any deadlock transitions to it
    edges = this._node.edgesToMe;
    for (let e in edges) {
      let edge = edges[e];
      if (edge.isDeadlock) {
        colors.add(Graph.NodeColoring.constructColor('-1', undefined, undefined));
      }
    }

    // if current node is a stop node then give it the empty coloring
    if (colors.length === 0) {
      colors.add(Graph.NodeColoring.constructColor('0', undefined, undefined));
    }

    return colors;
  }
};

/**
 * Represents the coloring of a node in a graph. A coloring is an array containing
 * individual colors. A color consists of:
 *   from  - the id of the node an edge is transitioning from
 *   to    - the id of the node an edge is transitioning to
 *   label - the label of the edge
 *
 * @class
 * @property {!Object[]} - array of colors
 */
Graph.NodeColoring = class {

  /**
   * Constructs an instance of a node coloring.
   *
   * @protected
   * @param coloring - array of colors
   */
  constructor(coloring = []) {
    this._coloring = coloring;
  }

  /**
   * Gets the array of colors associated with this node coloring.
   *
   * @public
   * @returns {!Object[]} - array of colors
   */
  get coloring() {
    return this._coloring;
  }

  /**
   * Gets the number of individual colors within this coloring.
   *
   * @public
   * @returns {int} - number of colors present in this coloring
   */
  get length() {
    return this._coloring.length;
  }

  /**
   * Adds the specified color to this coloring. Duplicate colors will not
   * be added.
   *
   * @public
   * @param color - the color to be added
   */
  add(color) {
    if (!this.contains(color)) {
      this._coloring.push(color);
    }
  }

  /**
   * Returns true if the specified color is contained in this node coloring,
   * otherwise returns false.
   *
   * @public
   * @param color - the color to be checked
   * @returns {boolean} - true if color present, otherwise false
   */
  contains(color) {
    for (let i in this._coloring) {
      let current = this._coloring[i];
      if (_.isEqual(current, color)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Returns true if both this coloring and the specified coloring are considered equal.
   * To be considered equal, all the colors contained in this coloring must be contained
   * in the specified coloring and vice versa.
   */
  equals(coloring) {
    // check that coloring is defined
    if (coloring === undefined || coloring === null) {
      return false;
    }

    // check that both colors are the same length
    if (this._coloring.length !== coloring.length) {
      return false;
    }

    // check all the colors in this coloring for a match
    for (let i in this._coloring) {
      let col1 = this._coloring[i];

      // check that there is a match for col1 in the secondary coloring
      let match = false;
      for (let j in coloring) {
        let col2 = coloring[j];
        if (_.isEqual(col1, col2)) {
          match = true;
          break;
        }
      }

      // if there was not a match then return false
      if (!match) {
        return false;
      }
    }

    return true;
  }

  /**
   * Constructs a single color based on the specified from, to and label.
   *
   * @public
   * @param {int} from - id of the node that the specified edge label leaves from
   * @param {int} to - id of the node that the specified edge label transitions to
   * @param {string} label - label given to the edge transition between from and to
   */
  static constructColor(from, to, label) {
    return {from: from, to: to, label: label};
  }
};

/**
 * A Graph Exception.
 *
 * @class
 * @property {!string} message - The message
 */
Graph.Exception = class {

  /**
   * @param {!string} msg - The message
   */
  constructor(msg) {
    this.message = msg;
  }
};
