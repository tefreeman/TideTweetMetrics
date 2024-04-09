/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MetricService } from './metric.service';

describe('Service: Metric', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MetricService]
    });
  });

  it('should ...', inject([MetricService], (service: MetricService) => {
    expect(service).toBeTruthy();
  }));
});
