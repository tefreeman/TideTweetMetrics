/**
 * Represents a displayable request.
 */
import { I_DisplayableRequest } from './displayable-interface';

/**
 * Represents a grid request entry.
 */
export interface I_GridRequestEntry {
  displayables: I_DisplayableRequest[];
  type: 'graph' | 'stat';
  order: number;
}

/**
 * Represents a grid request entry with a name.
 */
export interface I_GridRequestEntryWithName extends I_GridRequestEntry {
  name: string;
}

/**
 * Represents a grid entry.
 */
export interface I_GridEntry {
  [gridName: string]: I_GridRequestEntry;
}

/**
 * Represents a page map.
 */
export interface I_PageMap {
  [page: string]: I_GridEntry;
}
