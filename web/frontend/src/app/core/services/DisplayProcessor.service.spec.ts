/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DisplayProcessorService } from './display-processor.service';

describe('Service: DisplayProcessor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DisplayProcessorService]
    });
  });

  it('should ...', inject([DisplayProcessorService], (service: DisplayProcessorService) => {
    expect(service).toBeTruthy();
  }));
});
