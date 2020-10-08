import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule} from "@angular/forms";

import { AppComponent } from './app.component';
import { GraphMapComponent } from './graph-map/graph-map.component';
import { NodeFormComponent } from './node-form/node-form.component';
import { RouteFormComponent } from './route-form/route-form.component';
import { OrderCommComponent } from './order-comm/order-comm.component';

// Material Design Modules
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule,
  MatToolbarModule, MatIconModule,
  MatCheckboxModule,
  MatCardModule,
  MatListModule,
  MatSelectModule,
  MatSnackBarModule,
  MatTableModule,
  MatExpansionModule,
  MatDividerModule,
  MatOptionModule
} from "@angular/material";
import { SettingsFormComponent } from './settings-form/settings-form.component';
import { ActionFormComponent } from './action-form/action-form.component';
import { RouteEditorComponent } from './route-editor/route-editor.component';
import { FtfFormComponent } from './ftf-form/ftf-form.component';
import { FtfListComponent } from './ftf-list/ftf-list.component';
import { EdgeFormComponent } from './edge-form/edge-form.component';

@NgModule({
  declarations: [
    AppComponent,
    GraphMapComponent,
    NodeFormComponent,
    RouteFormComponent,
    OrderCommComponent,
    SettingsFormComponent,
    ActionFormComponent,
    RouteEditorComponent,
    FtfFormComponent,
    FtfListComponent,
    EdgeFormComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatCheckboxModule,
    MatCardModule,
    MatListModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
    MatExpansionModule,
    MatDividerModule,
    MatOptionModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [SettingsFormComponent, ActionFormComponent, RouteEditorComponent, OrderCommComponent, FtfFormComponent, EdgeFormComponent]
})
export class AppModule { }
