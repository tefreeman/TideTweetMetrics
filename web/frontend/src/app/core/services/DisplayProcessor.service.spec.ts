/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DisplayableProviderService } from './displayable-provider.service';

describe('Service: DisplayProcessor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DisplayableProviderService]
    });
  });

  it('should ...', inject([DisplayableProviderService], (service: DisplayableProviderService) => {
    expect(service).toBeTruthy();
  }));
});
