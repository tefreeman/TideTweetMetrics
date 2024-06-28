import { TestBed } from '@angular/core/testing';

import { DisplayableProcessorService } from './displayables/displayable-processor.service';

describe('GraphService', () => {
  let service: DisplayableProcessorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DisplayableProcessorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
