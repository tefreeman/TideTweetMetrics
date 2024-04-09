/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { KeyTranslatorService } from './key-translator.service';

describe('Service: KeyTranslator', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KeyTranslatorService]
    });
  });

  it('should ...', inject([KeyTranslatorService], (service: KeyTranslatorService) => {
    expect(service).toBeTruthy();
  }));
});
