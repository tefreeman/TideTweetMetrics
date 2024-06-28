/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { MetricService } from './metrics/metric.service';

describe('Service: Metric', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MetricService],
    });
  });

  it('should ...', inject([MetricService], (service: MetricService) => {
    expect(service).toBeTruthy();
  }));
});
