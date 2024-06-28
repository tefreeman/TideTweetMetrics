/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { DisplayableProviderService } from './displayables/displayable-provider.service';

describe('Service: DisplayProcessor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DisplayableProviderService],
    });
  });

  it('should ...', inject(
    [DisplayableProviderService],
    (service: DisplayableProviderService) => {
      expect(service).toBeTruthy();
    }
  ));
});
