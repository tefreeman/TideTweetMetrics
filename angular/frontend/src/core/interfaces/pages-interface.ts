import { T_GridType } from './displayable-data-interface';
import { I_DisplayableRequest } from './displayable-interface';

export interface I_GridRequestEntry {
  displayables: I_DisplayableRequest[];
  type: T_GridType;
  order: number;
}

export interface I_GridRequestEntryWithName extends I_GridRequestEntry {
  name: string;
}

export interface I_GridEntry {
  [gridName: string]: I_GridRequestEntry;
}

export interface I_PageMap {
  [page: string]: I_GridEntry;
}
