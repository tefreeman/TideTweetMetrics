import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private prefix: string = 'app_';

  constructor() {}

  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  public setItem(key: string, value: any, version: string): void {
    const fullKey = this.getFullKey(key);
    const data = { value, version };
    const stringValue = JSON.stringify(data);
    localStorage.setItem(fullKey, stringValue);
  }

  public getItem<T>(key: string, expectedVersion: string): T | null {
    const fullKey = this.getFullKey(key);
    const itemString = localStorage.getItem(fullKey);
    if (itemString !== null) {
      const item = JSON.parse(itemString);
      console.log(item.version, expectedVersion);
      if (item.version === expectedVersion) {
        return item.value as T;
      } else {
        console.log(
          `Data for ${key} is outdated. Version ${item.version} found, but version ${expectedVersion} expected.`
        );
        return null;
      }
    }
    return null;
  }

  public removeItem(key: string): void {
    const fullKey = this.getFullKey(key);
    localStorage.removeItem(fullKey);
  }

  public clear(): void {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}
