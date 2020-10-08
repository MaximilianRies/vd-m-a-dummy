import { Component, Inject, OnInit } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {Action} from "../vdma_classes/Action";

@Component({
  selector: 'app-action-form',
  templateUrl: './action-form.component.html',
  styleUrls: ['./action-form.component.css']
})
export class ActionFormComponent implements OnInit {
  static globalActionList: Action[] = [
    {actionID: "blink0", actionName: "blink", actionDescription: "Grün blinken"},
    {actionID: "lift1", actionName: "lift", actionDescription: "Hub heben", actionParameter: JSON.stringify({
      direction: "up"
    })},
    {actionID: "lift2", actionName: "lift", actionDescription: "Hub senken", actionParameter: JSON.stringify({
      direction: "down"
    })},
    {actionID: "wait3", actionName: "wait", actionDescription: "Auf Türfreigabe warten", actionParameter: JSON.stringify({
        blockingType: "hard",
        unlockClient: "door_1"
      })},
    {actionID: "pick4", actionName: "pick", actionDescription: "KLT aufnehmen", actionParameter: JSON.stringify({
        blockingType: "hard"
      })},
    {actionID: "drop5", actionName: "drop", actionDescription: "KLT abliefern", actionParameter: JSON.stringify({
        blockingType: "hard"
      })}];
  globalActionListMirror: Action[] = [];
  blockingTypes = Action.blockingTypes;
  triggerPointTypes = Action.triggerPointTypes;
  durationTypes = Action.durationTypes;


  constructor(public dialogRef: MatDialogRef<ActionFormComponent>,
              @Inject(MAT_DIALOG_DATA) public action: Action) {

  }

  ngOnInit() {
    this.globalActionListMirror = this.getGlobalActionList();
    console.log(this.triggerPointTypes);
  }

  addActionToGlobalActionList(action: Action) {
    if (ActionFormComponent.globalActionList.some(actionInList =>  {
      return actionInList.actionID === action.actionID;
    })) return;
    let actionCopy = Object.assign({}, action);
    ActionFormComponent.globalActionList.push(actionCopy);
  }

  getGlobalActionList() {
    return ActionFormComponent.globalActionList;
  }

  cancel() {
    this.dialogRef.close();
  }

  save() {
    this.addActionToGlobalActionList(this.action);
    this.dialogRef.close(this.action);
  }

  newSelection(selectedAction: Action) {
    Object.assign(this.action, selectedAction);
  }

}
