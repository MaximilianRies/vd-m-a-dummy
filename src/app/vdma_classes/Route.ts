import {Edge} from "./Edge";
import {Node} from "./Node";
import {FTF} from "./FTF";

export class Route {
  routeID: number;
  name: string;
  startNode: Node;
  endNode: Node;
  color: string;
  assignedFtfBaseTopic: string;

  nodes: Node[] = [];
  edges: Edge[] = [];

  static count = 0;

  constructor(name = null) {
    this.routeID = Route.count;
    Route.count++;

    if (name===null) {
      this.name = 'Route ' + this.routeID;
    }
    else {
      this.name = name;
    }
  }

  getNodeByID(nodeID) {
    return this.nodes.filter((node) => {
      return node.nodeID === nodeID;
    })[0];
  }

  getEdgeByID(edgeID) {
    return this.edges.filter((edge) => {
      return edge.edgeID === edgeID;
    })[0];
  }

  getStartNodeByEdgeID(edgeID) {
    let edge = this.getEdgeByID(edgeID);
    let node = this.getNodeByID(edge.startNode);
    return node;
  }

  getEndNodeByEdgeID(edgeID) {
    let edge = this.getEdgeByID(edgeID);
    let node = this.getNodeByID(edge.endNode);
    return node;
  }

  getEdgeByStartNodeID(nodeID) {
    return this.edges.find((e: Edge) => { return e.startNode === nodeID});
  }

  setFtfBaseTopic(ftf: FTF) {
    this.assignedFtfBaseTopic = ftf.getBaseTopic();
  }

  getFtfBaseTopic() {
    return this.assignedFtfBaseTopic;
  }

  sortNodesAndEdgesFromStartToEnd() {
    // method returns true if there is a graph between start and end, otherwise false.
    let sortedNodeList = [];
    let sortedEdgeList = [];
    let startNode = this.nodes.find((n: Node) => {return n.start;});
    let startEdge = this.edges.find((e: Edge) => {return e.startNode === startNode.nodeID});
    sortedNodeList.push(startNode);
    sortedEdgeList.push(startEdge);
    let nextNode = this.getEndNodeByEdgeID(startEdge.edgeID);
    let endNodeFound = false;
    sortedNodeList.push(nextNode);
    endNodeFound = nextNode.end;
    while (!endNodeFound) {
      let nextEdge = this.getEdgeByStartNodeID(nextNode.nodeID);
      nextNode = this.getEndNodeByEdgeID(nextEdge.edgeID);
      if ((nextNode === undefined) || (nextEdge === undefined)) {
        return false;
      }
      sortedNodeList.push(nextNode);
      sortedEdgeList.push(nextEdge);
      endNodeFound = nextNode.end;
    }
    this.nodes = sortedNodeList;
    this.edges = sortedEdgeList;
    return true;
  }




}
