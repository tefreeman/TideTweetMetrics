import { Injectable } from '@angular/core';
import { I_KeyTranslator } from '../interfaces/key-translator-interface';

@Injectable({
  providedIn: 'root'
})
export class KeyTranslatorService {

  private _translationObject: I_KeyTranslator = {};

  constructor() {}

  public setTranslationObject(translationObject: I_KeyTranslator): void {
      this._translationObject = translationObject;
  }


  translateKey(key: string): string {
      return this._translationObject[key]?.full ?? key;
  }

  hasAbr(key: string): boolean {
      return !!this._translationObject[key]?.abr;
  }

  hasDesc(key: string): boolean {
      return !!this._translationObject[key]?.desc;
  }

  translateKeyAbr(key: string): string {
      return this._translationObject[key]?.abr ?? key;
  }

  translateKeyDesc(key: string): string {
      return this._translationObject[key]?.desc ?? key;
  }

}
