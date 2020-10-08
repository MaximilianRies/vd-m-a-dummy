import Message = Paho.MQTT.Message;
import { Route } from "./Route";
import { Position, Velocity, systemState } from "./systemState";
import { NullAstVisitor } from "@angular/compiler";

class nodeState {
  nodeID: string;
  nodeDescription?: string;
  position?: Position;
  released: boolean;
}

class edgeState {
  edgeID: string;
  edgeDescription?: string;
  released: boolean;
}



export class FTF {
  static count: number = 0;
  x: number;
  y: number;
  theta: number;
  name: string;
  manufacturer: string;
  fleet: string;
  id: number;
  batteryStatus: number;
  lastMessages: Message[] = [];
  orderQueue: Route[] = [];
  currentOrder: Route = null;
  busy: boolean;
  systemState: systemState;

  constructor() {
    this.id = FTF.count;
    this.x = -100;
    this.y = -100;
    this.theta = 0;
    this.batteryStatus = 0.0001;
    FTF.count++;
  }

  getPosition() {
    return {'x': this.x,
    'y': this.y,
    'theta': this.theta};
  }

  updatePosition(x: number, y: number, theta: number) {
    this.x = x;
    this.y = y;
    this.theta = theta;

  }

  updateBattery(charge) {
    if (charge > 1) {
      charge = 1;
    }
    else if (charge < 0) {
      charge = 0;
    }
    this.batteryStatus = charge;
  }

  getBaseTopic() {
    return this.manufacturer + '/' + this.fleet + '/' + this.name;
  }

  addMessage(message: Message ){
    let newLength = this.lastMessages.unshift(message);
    if (newLength > 10) {
      this.lastMessages.pop();
    }
  }

  getMessages() {
    return this.lastMessages;
  }

  purgeMessages() {
    this.lastMessages = [];
  }

  updateByMQTT(message: Message) {
    // 
    let topicTree = message.destinationName.split('/');
    if (this.name == topicTree[2]) {
      let messageObject = JSON.parse(message.payloadString);
      try {
        Object.assign(this.systemState, messageObject);
      }
      catch (error) {
        console.log('Error in parsing systemState JSON');
        console.log(error);
      }
      let subtopic = topicTree[3];
      switch (subtopic) {
        case "navigation":
          try {
            let messageObject = JSON.parse(message.payloadString);
            this.updatePosition(
              Number(messageObject.position.x),
              Number(messageObject.position.y),
              Number(messageObject.position.theta)
            );
          }
          catch (error) {
            console.log('Error in parsing Navigation JSON!');
            console.log(error);
          }
          break;
        case "battery":
          try {
            let messageObject = JSON.parse(message.payloadString);
            this.updateBattery(messageObject.SoC / 100.0)
          }
          catch (error) {
            console.log('Error in parsing Battery JSON!');
            console.log(error);
          }
      }
    }
    else {
      console.log(`Wrong message forwarded to FTF {this.name}. Adressee: {topicTree[2]}`);
    }
  }

  queueOrder(order: Route) {
    this.orderQueue.push(order);
  }

  handleOrder() {
    if (this.busy === true) {
      return;
    }
    else {
      this.currentOrder = this.orderQueue.shift();
      this.busy = true;

    }
  }
  
}
