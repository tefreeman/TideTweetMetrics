import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatacardComponent } from './datacard.component';

describe('DatacardComponent', () => {
  let component: DatacardComponent;
  let fixture: ComponentFixture<DatacardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatacardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DatacardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
