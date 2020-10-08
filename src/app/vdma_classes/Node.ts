import { Action} from "./Action";
import {Position} from "./systemState";

export class Node {
  nodeID: string;
  nodeDescription?: string;
  position: Position;
  actions: Action[];
  released: boolean = false;
  replaceBase?: boolean = false;
  isExact?: boolean = false;

  // Stuff for easier drawing, will be removed for serialisation
  routeID?: number;
  start?: boolean;
  end?: boolean;

  static count: number = 0;

  constructor(name=null) {
    this.nodeID = Node.count.toString();
    Node.count++;
    if (name === null) {
      this.nodeDescription = this.nodeID.toString();
    }
    else {
      this.nodeDescription = name;
    }
    this.position = {
      x: 0,
      y: 0,
      theta: 0,
      mapID: 0
    };
    this.actions = [];

    this.start = false;
    this.end = false;

  }

  toJSON() {
    return {
      'nodeID': this.nodeID,
      'nodeDescription': this.nodeDescription,
      'position': this.position,
      'actions': this.actions,
      'released': this.released,
      'replaceBase': this.replaceBase,
      'isExact': this.isExact
    }
  }
}
