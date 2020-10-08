import { Action } from "./Action";
import { Node } from "./Node";

export class Edge {
  edgeID: string;
  edgeDescription?: string;
  released: boolean;
  replaceBase?: boolean;
  startNode: string;  // has to be string!
  endNode: string;
  maxSpeed?: number;
  maxHeight?: number;
  orientation?: number;
  direction?: number;
  rotationAllowed?: boolean;
  maxRotationSpeed: number;
  trajectory: string;
  distance: number;
  actions: Action[] = [];

  // objects for easier drawing, IS NOT INCLUDED IN SERIALIZATION.
  startNodeObject: Node;
  endNodeObject: Node;

  static count = 0;

  constructor(startNode, endNode, name = null) {
    this.edgeID = Edge.count.toString();
    Edge.count++;

    if (name === null) {
      this.edgeDescription = this.edgeID.toString()
    }
    else {
      this.edgeDescription = name;
    }

    this.startNode = startNode;
    this.endNode = endNode;
  }

  toJSON() {
    return {
      "edgeID":this.edgeID,
      "edgeDescription":this.edgeDescription,
      "released":this.released,
      "replaceBase":this.replaceBase,
      "startNode":this.startNode,
      "endNode":this.endNode,
      "maxSpeed":this.maxSpeed,
      "maxHeight":this.maxHeight,
      "orientation":this.orientation,
      "direction":this.direction,
      "rotationAllowed":this.rotationAllowed,
      "maxRotationSpeed":this.maxRotationSpeed,
      "trajectory":this.trajectory,
      "distance":this.distance,
      "actions":this.actions
    }
  }

}
