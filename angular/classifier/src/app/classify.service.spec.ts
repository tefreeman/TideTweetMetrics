import { TestBed } from '@angular/core/testing';

import { ClassifyService } from './classify.service';

describe('ClassifyService', () => {
  let service: ClassifyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassifyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
