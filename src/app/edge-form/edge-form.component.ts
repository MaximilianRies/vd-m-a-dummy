import { Component, OnInit, Inject } from '@angular/core';
import { Edge } from '../vdma_classes/Edge';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog, MatDialogConfig } from '@angular/material';
import {Action} from '../vdma_classes/Action'
import {ActionFormComponent} from '../action-form/action-form.component'

@Component({
  selector: 'app-edge-form',
  templateUrl: './edge-form.component.html',
  styleUrls: ['./edge-form.component.css']
})
export class EdgeFormComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<EdgeFormComponent>,
    public actionDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public edge: Edge) { }

  ngOnInit() {
  
  }

  cancel() {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.edge);
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
        this.edge.actions.push(action);
      }
    });
  }

  editAction(action: Action) {
    let actionCopy = JSON.parse(JSON.stringify(action));
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = actionCopy;

    const actionDialogRef = this.actionDialog.open(ActionFormComponent, dialogConfig);

    actionDialogRef.afterClosed().subscribe((returnedAction: Action) => {
      if (returnedAction) {
        Object.assign(action, returnedAction);
      }
    });
  }

  deleteAction(actionToDelete: Action) {

    let indexToDelete = this.edge.actions.findIndex( actionToTest => {
      return actionToTest === actionToDelete;
    });
    this.edge.actions.splice(indexToDelete, 1);
  }

}
