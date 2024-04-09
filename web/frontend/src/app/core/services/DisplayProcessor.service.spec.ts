/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DisplayProcessorService } from './DisplayProcessor.service';

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
