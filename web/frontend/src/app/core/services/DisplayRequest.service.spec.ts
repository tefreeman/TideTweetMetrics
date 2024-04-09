/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DisplayRequestService } from './DisplayRequest.service';

describe('Service: DisplayRequest', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DisplayRequestService]
    });
  });

  it('should ...', inject([DisplayRequestService], (service: DisplayRequestService) => {
    expect(service).toBeTruthy();
  }));
});
