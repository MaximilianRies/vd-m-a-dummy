import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from "@angular/material";
import {Route} from "../vdma_classes/Route";
import {Order} from "../vdma_classes/Order";
import * as Paho from "paho-mqtt";

// WORKAROUND FÜR NAMESPACE BUG https://github.com/eclipse/paho.mqtt.javascript/issues/150
(<any>window).Paho = Paho;
(<any>window).Paho.MQTT = Paho;


export interface orderCommData {
  route: Route,
  mqtt: Paho.Client
}


@Component({
  selector: 'app-order-comm',
  templateUrl: './order-comm.component.html',
  styleUrls: ['./order-comm.component.css']
})
export class OrderCommComponent implements OnInit {
  orderJson: string;
  routeToSend: Route;

  version = '0.1.0';
  static sequenceID = 0;
  static orderID = 0;
  constructor(public dialogRef: MatDialogRef<OrderCommComponent>,
              @Inject(MAT_DIALOG_DATA) public orderInterface: orderCommData,
              private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.createJson(this.orderInterface.route);
  }

  createJson(route) {
    let generatedOrder = new Order(route, OrderCommComponent.sequenceID);
    if (generatedOrder.success) {
      this.orderJson = generatedOrder.getJSON();
    }
    else {
      this.orderJson = "Fehler beim erstellen der Order. Bitte die Route auf Korrektheit überprüfen."
    }
  }

  sendOrder(topic, orderJSON) {
    let message = new Paho.Message(orderJSON);
    message.qos = 1;
    message.destinationName = topic;
    this.orderInterface.mqtt.send(message);
    OrderCommComponent.sequenceID++;
    this.snackBar.open('Auftrag mit orderID ' + OrderCommComponent.orderID + ' gesendet!', undefined, {duration: 3000});
    OrderCommComponent.orderID++;
    this.dialogRef.close();

  }

  cancel() {
    this.dialogRef.close();
  }

}
