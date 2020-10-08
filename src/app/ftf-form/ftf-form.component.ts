import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {FTF} from "../vdma_classes/FTF";


@Component({
  selector: 'app-ftf-form',
  templateUrl: './ftf-form.component.html',
  styleUrls: ['./ftf-form.component.css']
})
export class FtfFormComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<FtfFormComponent>,
              @Inject(MAT_DIALOG_DATA) public ftf: FTF) { }

  ngOnInit() {

  }

  styleJSON(JSONstring: string) {
    let styledString = '';
    try {
      styledString = JSON.stringify(JSON.parse(JSONstring), undefined, 2);
    }
    catch (error) {
      styledString = "Kaputtes JSON erhalten. Mehr Informationen in der Konsole.";
      console.log('BROKEN JSON:');
      console.log(error);
    }
    return styledString;
  }

}
