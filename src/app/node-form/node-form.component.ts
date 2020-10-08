import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { GraphMapComponent} from "../graph-map/graph-map.component";
import { Node } from "../vdma_classes/Node";
import {Action} from "../vdma_classes/Action";
import {MatDialog, MatDialogConfig} from "@angular/material";
import {ActionFormComponent} from "../action-form/action-form.component";
import {SettingsFormComponent} from "../settings-form/settings-form.component";

@Component({
  selector: 'app-node-form',
  templateUrl: './node-form.component.html',
  styleUrls: ['./node-form.component.css']
})
export class NodeFormComponent implements OnInit {

  @Input() node: Node;

  globalActionList: Action[] = [];

  constructor(private actionDialog: MatDialog) {

  }

  ngOnInit() {

  }

  addNewAction() {
    let action = new Action();
    action.actionID = "0";
    action.actionName = "newAction"
    action.actionDescription = "Neue Aktion";

    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "400px";
    dialogConfig.data = action;

    const actionDialogRef = this.actionDialog.open(ActionFormComponent, dialogConfig);

    actionDialogRef.afterClosed().subscribe(action => {
      if (action) {
        this.node.actions.push(action);
      }
    });
  }

  editAction(action: Action) {
    let actionCopy = JSON.parse(JSON.stringify(action));
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "400px";
    dialogConfig.data = actionCopy;

    const actionDialogRef = this.actionDialog.open(ActionFormComponent, dialogConfig);

    actionDialogRef.afterClosed().subscribe((returnedAction: Action) => {
      if (returnedAction) {
        Object.assign(action, returnedAction);
      }
    });
  }

  deleteAction(actionToDelete: Action) {

    let indexToDelete = this.node.actions.findIndex( actionToTest => {
      return actionToTest === actionToDelete;
    });
    this.node.actions.splice(indexToDelete, 1);
  }

  rotateArrow(thetaValue) {
    let desiredRotation = -thetaValue * (180.0 / Math.PI);
    desiredRotation = (desiredRotation+360) % 360;
    return 'rotate(' + desiredRotation + 'deg)'
  }

}
