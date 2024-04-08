import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticValueComponent } from './static-value.component';

describe('StaticValueComponent', () => {
  let component: StaticValueComponent;
  let fixture: ComponentFixture<StaticValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaticValueComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StaticValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
