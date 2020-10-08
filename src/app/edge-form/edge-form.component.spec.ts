import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EdgeFormComponent } from './edge-form.component';

describe('EdgeFormComponent', () => {
  let component: EdgeFormComponent;
  let fixture: ComponentFixture<EdgeFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EdgeFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EdgeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
