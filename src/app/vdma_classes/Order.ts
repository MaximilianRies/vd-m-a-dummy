import {Node} from "./Node";
import {Edge} from "./Edge";
import { Route } from "./Route";


export class Order {
    orderID: string;
    nodes: Node[];
    edges: Edge[];
    sequenceID: number;
    timestamp: string;
    success: boolean;
    version = '0.8.6';
    static sequenceIDcounter = 0;
    
    constructor(route: Route, sequenceID: number) {
        this.orderID = route.name;
        this.sequenceID = sequenceID;
        this.timestamp = new Date().toISOString();
        this.success = route.sortNodesAndEdgesFromStartToEnd();
        
        this.nodes = route.nodes;
        this.edges = route.edges;
        
        /*this.nodes.forEach((n: Node) => {
            n.cleanupForVdmaRepresentation();
        });

        this.edges.forEach((e: Edge) => {
            e.cleanupForVdmaRepresentation();
        });*/
        console.log("Original Route:");
        console.log(route);
        console.log("Generated Order:");
        console.log(this);
    }
    
    getJSON(indent=2) {
        delete this.success;
        return JSON.stringify(this, undefined, indent);
    }
}