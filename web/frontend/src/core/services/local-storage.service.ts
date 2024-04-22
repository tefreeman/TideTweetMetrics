import { Injectable } from '@angular/core';

/**
 * Service for interacting with the browser's local storage.
 */
@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private prefix: string = 'app_';

  constructor() { }

  /**
   * Returns the full key by appending the prefix to the provided key.
   * @param key - The key to append the prefix to.
   * @returns The full key.
   */
  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Sets an item in the local storage.
   * @param key - The key of the item.
   * @param value - The value of the item.
   * @param version - The version of the item.
   */
  public setItem(key: string, value: any, version: string): void {
    const fullKey = this.getFullKey(key);
    const data = { value, version };
    const stringValue = JSON.stringify(data);
    localStorage.setItem(fullKey, stringValue);
  }

  /**
   * Retrieves an item from the local storage.
   * @param key - The key of the item.
   * @param expectedVersion - The expected version of the item.
   * @returns The item value if it exists and has the expected version, otherwise null.
   */
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

  /**
   * Removes an item from the local storage.
   * @param key - The key of the item to remove.
   */
  public removeItem(key: string): void {
    const fullKey = this.getFullKey(key);
    localStorage.removeItem(fullKey);
  }

  /**
   * Clears all items in the local storage that have the app prefix.
   */
  public clear(): void {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}
