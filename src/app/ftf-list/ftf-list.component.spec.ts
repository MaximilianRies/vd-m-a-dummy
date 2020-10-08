import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FtfListComponent } from './ftf-list.component';

describe('FtfListComponent', () => {
  let component: FtfListComponent;
  let fixture: ComponentFixture<FtfListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FtfListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FtfListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
