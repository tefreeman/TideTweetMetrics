/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { DisplayRequestManagerService } from './displayables/display-request-manager.service';

describe('Service: DisplayRequest', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DisplayRequestManagerService],
    });
  });

  it('should ...', inject(
    [DisplayRequestManagerService],
    (service: DisplayRequestManagerService) => {
      expect(service).toBeTruthy();
    }
  ));
});
