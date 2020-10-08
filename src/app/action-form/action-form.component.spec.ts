import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionFormComponent } from './action-form.component';
import { MatFormFieldModule, MatOptionModule, MatSelectModule, MatInputModule, MatButtonModule, MatDialogModule, MatDialogRef } from '@angular/material';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';


class MatDialogMock {
  open() {
    return {
      afterClosed: () => Observable.of([postMock[0]])
    };
  }
}


describe('ActionFormComponent', () => {
  let component: ActionFormComponent;
  let fixture: ComponentFixture<ActionFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ActionFormComponent],
      imports: [MatFormFieldModule,
        MatOptionModule,
        MatSelectModule,
        MatInputModule,
        MatButtonModule,
        MatDialogModule,
        FormsModule],
      providers: [
        MatDialogRef
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
