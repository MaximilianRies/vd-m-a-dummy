import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FtfFormComponent } from './ftf-form.component';
import { MatDialogModule } from '@angular/material';

describe('FtfFormComponent', () => {
  let component: FtfFormComponent;
  let fixture: ComponentFixture<FtfFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FtfFormComponent ],
      imports: [MatDialogModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FtfFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
