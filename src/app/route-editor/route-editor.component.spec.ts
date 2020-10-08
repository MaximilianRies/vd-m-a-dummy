import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteEditorComponent } from './route-editor.component';

describe('RouteEditorComponent', () => {
  let component: RouteEditorComponent;
  let fixture: ComponentFixture<RouteEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RouteEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
