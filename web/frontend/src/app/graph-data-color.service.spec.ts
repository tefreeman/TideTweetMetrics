import { TestBed } from '@angular/core/testing';

import { GraphDataColorService } from './graph-data-color.service';

describe('GraphDataColorService', () => {
  let service: GraphDataColorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraphDataColorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
