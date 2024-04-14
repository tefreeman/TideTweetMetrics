import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatCompComponent } from './stat-comp.component';

describe('StatCompComponent', () => {
  let component: StatCompComponent;
  let fixture: ComponentFixture<StatCompComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCompComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StatCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
