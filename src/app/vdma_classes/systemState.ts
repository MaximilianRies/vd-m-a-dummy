export class Position {
  x: number;
  y: number;
  theta: number;
  mapID: number;
  mapDescription?: string;
}

export class Velocity {
  vx: number;
  vy: number;
  omega: number;
}

export class Load {
  loadStationType: number;
  loadID: number;
  loadType: number;
  weight: number;
  length: number;
  width: number;
  height: number;
}

export class CurrentAction {
  actionID: string;
  actionDescription?: string;
  actionStatus: string;
  resultDescription?: string;
  errorCode?: number;
}

export class NodeState {
  nodeID: string;
  nodeDescription?: string;
  position?: Position;
  released: boolean = false;
}

export class EdgeState {
  edgeID: string;
  edgeDescription?: string;
  released: boolean = false;
}

export class Error {
  errorID: string;
  errorDescription: string;
  errorLevel: string;
}


export class systemState {
  orderID: string;
  lastNode: string;
  nodeStates: NodeState[];
  edgeStates: EdgeState[];
  position: Position;
  load: Load[];
  velocity: Velocity;
  currentActions: CurrentAction[];
  batteryCharge: number;
  batteryVoltage?: number;
  batteryHealth?: number;
  charging: boolean = false;
  reach?: number;
  operatingMode: string;
  errors: Error[];
  eStop: string;
  fieldViolation: boolean;
}