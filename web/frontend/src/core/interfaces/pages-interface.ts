import { I_DisplayableRequest } from "./displayable-interface";



export interface I_GridRequestEntry {
  displayables: I_DisplayableRequest[];
  type: 'graph' | 'stat';
  order: number;
}

export interface I_GridRequestEntryWithName extends I_GridRequestEntry {
  name: string
}


export interface I_GridEntry {
  [gridName: string]: I_GridRequestEntry;
}

export interface I_PageMap {
  [page: string]: I_GridEntry;
}
