import { Component, Inject, OnInit } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {Route} from "../vdma_classes/Route";
import {FTF} from "../vdma_classes/FTF";

export interface routeEditorDialogInterface {
  route: Route;
  ftfs: FTF[];
}


@Component({
  selector: 'app-route-editor',
  templateUrl: './route-editor.component.html',
  styleUrls: ['./route-editor.component.css']
})

export class RouteEditorComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<RouteEditorComponent>,
              @Inject(MAT_DIALOG_DATA) public dialogData: routeEditorDialogInterface) { }

  ngOnInit() {
  }

  cancel() {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.dialogData);
  }

}
