import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Route} from "../vdma_classes/Route";
import {OrderCommComponent, orderCommData} from "../order-comm/order-comm.component";
import {MatDialog, MatDialogConfig, MatSnackBar} from "@angular/material";
import {RouteEditorComponent} from "../route-editor/route-editor.component";
import {FTF} from "../vdma_classes/FTF";
import {routeEditorDialogInterface} from "../route-editor/route-editor.component";


@Component({
  selector: 'app-route-form',
  templateUrl: './route-form.component.html',
  styleUrls: ['./route-form.component.css']
})
export class RouteFormComponent implements OnInit {

  @Input() routes: Route[];
  @Input() mqtt: Paho.MQTT.Client;
  @Input() ftfs: FTF[];
  selectedRoute: Route;
  routeToSend: Route;

  constructor(private snackBar: MatSnackBar,
              private routeEditor: MatDialog,
              private orderComm: MatDialog) { }

  ngOnInit() {
    this.selectedRoute = this.routes[0];
  }


  createOrder(route: Route) {
    if (route.startNode === undefined) {
      this.snackBar.open('Kein Startpunkt für Route angegeben. Auftragserstellung nicht möglich.', 'OK');
    } else if (route.endNode === undefined) {
      this.snackBar.open('Kein Endpunkt für Route angegeben. Auftragserstellung nicht möglich.', 'OK');
    }
    else {
      //this.orderComm.createJson(route);
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        route: route,
        mqtt: this.mqtt
      };

      const dialogRef = this.orderComm.open(OrderCommComponent, dialogConfig);
      //dialogRef.componentInstance.createJson(route);
    }




    console.log(route);

  }
/*
  onChange(route) {
    this.selectedRoute = route;
  }*/

  onCallback(event) {
    this.routeToSend = null;
  }

  editRoute(route: Route) {
    const dialogConfig = new MatDialogConfig();
    let routeCopy = Object.assign({}, route);

    let routeEditorDialogData: routeEditorDialogInterface;
    routeEditorDialogData = {
      route: routeCopy,
      ftfs: this.ftfs
    };

    routeEditorDialogData.route = routeCopy;
    routeEditorDialogData.ftfs = this.ftfs;

    dialogConfig.data = routeEditorDialogData;

    const dialogRef = this.routeEditor.open(RouteEditorComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((returnedSettings: routeEditorDialogInterface) => {
      if (returnedSettings) {
        Object.assign(route, returnedSettings.route);
      }
    })
  }

}
