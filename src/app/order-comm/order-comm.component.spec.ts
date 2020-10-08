import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderCommComponent } from './order-comm.component';

describe('OrderCommComponent', () => {
  let component: OrderCommComponent;
  let fixture: ComponentFixture<OrderCommComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderCommComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderCommComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
