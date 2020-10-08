import {Component, Inject, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";

export interface SettingsData {
  mqttChanged: boolean;
  mapChanged: boolean;
  customMap: string;
  mapMetersPerPixel: number;
  mapXoffset: number;
  mapYoffset: number;
  mqttHost: string;
  mqttPort: string;
  mqttClientID: string;
}

@Component({
  selector: 'app-settings-form',
  templateUrl: './settings-form.component.html',
  styleUrls: ['./settings-form.component.css']
})
export class SettingsFormComponent implements OnInit {
  mqttChanged = false;
  mapChanged = false;



  constructor(public dialogRef: MatDialogRef<SettingsFormComponent>,
              @Inject(MAT_DIALOG_DATA) public data: SettingsData) {
  }

  ngOnInit() {

  }

  cancel() {
    this.mqttChanged = false;
    this.mapChanged = false;
    this.dialogRef.close();
  }

  save() {
    this.data.mapChanged = this.mapChanged;
    this.data.mqttChanged = this.mqttChanged;
    this.dialogRef.close(this.data);
  }

  changeMap() {
    let dialog = this;
    let input = document.getElementById('mapPicker');
    //@ts-ignore
    if (input.files && input.files[0]) {
      let reader  = new FileReader();
      reader.onload = function() {
        //@ts-ignore
        dialog.data.customMap = reader.result;
        dialog.setMapChangedFlag();
      };
      //@ts-ignore
      reader.readAsDataURL(input.files[0]);
    }
  }

  setMapChangedFlag() {
    this.mapChanged = true;
  }

  setMQTTChangedFlag() {
    this.mqttChanged = true;
  }

}
