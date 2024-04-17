import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailReportComponent } from './email-report.component';

describe('EmailReportComponent', () => {
  let component: EmailReportComponent;
  let fixture: ComponentFixture<EmailReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmailReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
