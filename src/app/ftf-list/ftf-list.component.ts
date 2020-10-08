import { Component, OnInit, Input } from '@angular/core';
import {FTF} from "../vdma_classes/FTF";
import {MatSnackBar} from "@angular/material";

@Component({
  selector: 'app-ftf-list',
  templateUrl: './ftf-list.component.html',
  styleUrls: ['./ftf-list.component.css']
})
export class FtfListComponent implements OnInit {
  @Input() ftfs: FTF[];

  constructor(private snackbar: MatSnackBar) { }

  ngOnInit() {
  }

  saveFTFList() {
    let listOfFTFS = [];
    for(let ftf of this.ftfs) {
      let serializeObj = {
        manufacturer: ftf.manufacturer,
        fleet: ftf.fleet,
        name: ftf.name
      };
      listOfFTFS.push(serializeObj);
    }
    let entry = JSON.stringify(listOfFTFS);
    localStorage.setItem('list_of_ftfs', entry);
    this.snackbar.open(listOfFTFS.length.toString() + ' Fahrzeuge permanent gespeichert.', null, {duration: 2000})
  }

}
