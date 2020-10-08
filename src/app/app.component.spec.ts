import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule} from "@angular/forms";

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

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
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
    FtfListComponent
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
      ]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  it(`should have as title 'vdma-hmi'`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('vdma-hmi');
  }));
  it('should render title in a h1 tag', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Welcome to vdma-hmi!');
  }));
});
